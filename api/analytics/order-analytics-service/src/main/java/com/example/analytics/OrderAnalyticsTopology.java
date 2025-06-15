package com.example.analytics;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Produces;
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

    @Produces
    public Topology buildTopology() {
        StreamsBuilder builder = new StreamsBuilder();

        ObjectMapperSerde<Order> orderSerde = new ObjectMapperSerde<>(Order.class);
        ObjectMapperSerde<ProductAnalytics> analyticsSerde = new ObjectMapperSerde<>(ProductAnalytics.class);

        KStream<String, Order> orders = builder.stream("orders", 
            Consumed.with(Serdes.String(), orderSerde));

        orders.foreach((key, order) -> 
            LOG.infof("Processing order: %s for product: %s", order.getId(), order.getProduct()));

        // Product Order Count Analytics (5-minute windows) with materialized state store
        orders
            .groupBy((key, order) -> order.getProduct())
            .windowedBy(TimeWindows.of(Duration.ofMinutes(5)).advanceBy(Duration.ofMinutes(1)))
            .count(Materialized.<String, Long, WindowStore<Bytes, byte[]>>as("product-order-counts")
                .withKeySerde(Serdes.String())
                .withValueSerde(Serdes.Long()))
            .toStream()
            .map((windowedKey, count) -> {
                String product = windowedKey.key();
                long windowStart = windowedKey.window().start();
                long windowEnd = windowedKey.window().end();
                
                ProductAnalytics analytics = new ProductAnalytics(
                    product, count, 0.0, windowStart, windowEnd);
                
                LOG.infof("Product %s: %d orders in window [%d-%d]", 
                    product, count, windowStart, windowEnd);
                
                return KeyValue.pair(product, analytics);
            })
            .to("order-analytics", Produced.with(Serdes.String(), analyticsSerde));

        // Revenue Analytics (5-minute windows) with materialized state store
        orders
            .groupBy((key, order) -> order.getProduct())
            .windowedBy(TimeWindows.of(Duration.ofMinutes(5)).advanceBy(Duration.ofMinutes(1)))
            .aggregate(
                () -> 0.0,
                (key, order, aggregate) -> aggregate + order.getTotalPrice(),
                Materialized.<String, Double, WindowStore<Bytes, byte[]>>as("product-revenue-analytics")
                    .withKeySerde(Serdes.String())
                    .withValueSerde(Serdes.Double())
            )
            .toStream()
            .map((windowedKey, totalRevenue) -> {
                String product = windowedKey.key();
                long windowStart = windowedKey.window().start();
                long windowEnd = windowedKey.window().end();
                
                ProductAnalytics analytics = new ProductAnalytics(
                    product, 0, totalRevenue, windowStart, windowEnd);
                
                LOG.infof("Product %s: $%.2f revenue in window [%d-%d]", 
                    product, totalRevenue, windowStart, windowEnd);
                
                return KeyValue.pair(product, analytics);
            })
            .to("revenue-analytics", Produced.with(Serdes.String(), analyticsSerde));

        // High Volume Alert (detect more than 3 orders in 2 minutes)
        orders
            .groupBy((key, order) -> order.getProduct())
            .windowedBy(TimeWindows.of(Duration.ofMinutes(2)).advanceBy(Duration.ofMinutes(1)))
            .count()
            .filter((windowedKey, count) -> count > 3)
            .toStream()
            .foreach((windowedKey, count) -> 
                LOG.warnf("HIGH VOLUME ALERT: Product %s has %d orders in 2 minutes!", 
                    windowedKey.key(), count));

        LOG.info("Kafka Streams topology built successfully");
        return builder.build();
    }
}
