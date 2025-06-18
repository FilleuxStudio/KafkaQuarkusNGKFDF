package com.example.analytics;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
import jakarta.inject.Inject;
import org.apache.kafka.common.serialization.Serdes;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.Topology;
import org.apache.kafka.streams.KeyValue;
import org.apache.kafka.streams.kstream.*;
import org.apache.kafka.streams.state.WindowStore;
import org.apache.kafka.common.utils.Bytes;
import io.quarkus.kafka.client.serialization.ObjectMapperSerde;
import org.jboss.logging.Logger;
import java.time.Duration;

@ApplicationScoped
public class OrderAnalyticsTopology {

    private static final Logger LOG = Logger.getLogger(OrderAnalyticsTopology.class);
    
    @Inject
    AlertManager alertManager;

    @Produces
    public Topology buildTopology() {
        StreamsBuilder builder = new StreamsBuilder();

        ObjectMapperSerde<Order> orderSerde = new ObjectMapperSerde<>(Order.class);
        ObjectMapperSerde<ProductAnalytics> analyticsSerde = new ObjectMapperSerde<>(ProductAnalytics.class);

        KStream<String, Order> orders = builder.stream("orders", 
            Consumed.with(Serdes.String(), orderSerde));

        orders.foreach((key, order) -> 
            LOG.infof("Processing order: %s for product: %s", order.getId(), order.getProduct()));

        // ✅ FIXED: Tumbling windows - no overlapping data
        orders
            .groupBy((key, order) -> order.getProduct())
            .windowedBy(TimeWindows.of(Duration.ofMinutes(5)))  // ← Removed .advanceBy() = Tumbling windows
            .aggregate(
                // Initialize with empty analytics
                () -> new ProductAnalytics("", 0, 0.0, 0, 0),
                // Aggregate both count and revenue together
                (product, order, analytics) -> {
                    // Update the analytics object with both metrics
                    analytics.setProduct(product);
                    analytics.setOrderCount(analytics.getOrderCount() + 1);
                    analytics.setTotalRevenue(analytics.getTotalRevenue() + order.getTotalPrice());
                    return analytics;
                },
                Materialized.<String, ProductAnalytics, WindowStore<Bytes, byte[]>>as("unified-product-analytics")
                    .withKeySerde(Serdes.String())
                    .withValueSerde(analyticsSerde)
            )
            .toStream()
            .map((windowedKey, analytics) -> {
                String product = windowedKey.key();
                long windowStart = windowedKey.window().start();
                long windowEnd = windowedKey.window().end();
                
                // Set window information
                analytics.setWindowStart(windowStart);
                analytics.setWindowEnd(windowEnd);
                
                LOG.infof("✅ TUMBLING WINDOW - Product %s: %d orders, $%.2f revenue in window [%d-%d]", 
                    product, analytics.getOrderCount(), analytics.getTotalRevenue(), windowStart, windowEnd);
                
                return KeyValue.pair(product, analytics);
            })
            .to("unified-analytics", Produced.with(Serdes.String(), analyticsSerde));

        // ✅ FIXED: Tumbling windows for alerts too
        orders
            .groupBy((key, order) -> order.getProduct())
            .windowedBy(TimeWindows.of(Duration.ofMinutes(2)))  // ← Removed .advanceBy()
            .count()
            .filter((windowedKey, count) -> count > 3)
            .toStream()
            .foreach((windowedKey, count) -> {
                String product = windowedKey.key();
                long windowStart = windowedKey.window().start();
                long windowEnd = windowedKey.window().end();
                
                alertManager.addAlert(product, count, windowStart, windowEnd);
            });

        LOG.info("✅ Kafka Streams topology built successfully with TUMBLING WINDOWS");
        return builder.build();
    }
}
