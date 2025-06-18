package com.example.analytics;

import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import org.apache.kafka.clients.admin.AdminClient;
import org.apache.kafka.clients.admin.AdminClientConfig;
import org.apache.kafka.clients.admin.CreateTopicsResult;
import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.common.errors.TopicExistsException;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ExecutionException;

@ApplicationScoped
public class TopicInitializer {

    private static final Logger LOG = Logger.getLogger(TopicInitializer.class);

    @ConfigProperty(name = "kafka.bootstrap.servers")
    String kafkaBootstrapServers;

    void onStart(@Observes StartupEvent ev) {
        LOG.info("🚀 Creating Kafka topics on startup...");
        createTopicsIfNotExist();
    }

    private void createTopicsIfNotExist() {
        Map<String, Object> config = new HashMap<>();
        config.put(AdminClientConfig.BOOTSTRAP_SERVERS_CONFIG, kafkaBootstrapServers);

        try (AdminClient adminClient = AdminClient.create(config)) {
            
            // Define the topics we need - UPDATED for unified approach
            NewTopic[] topics = {
                new NewTopic("orders", 3, (short) 2),
                new NewTopic("unified-analytics", 3, (short) 2)  // ← New unified topic
            };

            // Create topics
            CreateTopicsResult result = adminClient.createTopics(Arrays.asList(topics));

            // Wait for each topic creation to complete
            for (NewTopic topic : topics) {
                try {
                    result.values().get(topic.name()).get();
                    LOG.infof("✅ Topic '%s' created successfully", topic.name());
                } catch (ExecutionException e) {
                    if (e.getCause() instanceof TopicExistsException) {
                        LOG.infof("ℹ️ Topic '%s' already exists", topic.name());
                    } else {
                        LOG.errorf(e, "❌ Failed to create topic '%s'", topic.name());
                    }
                } catch (InterruptedException e) {
                    LOG.errorf(e, "❌ Interrupted while creating topic '%s'", topic.name());
                    Thread.currentThread().interrupt();
                }
            }

        } catch (Exception e) {
            LOG.error("❌ Failed to create admin client or topics", e);
        }
    }
}
