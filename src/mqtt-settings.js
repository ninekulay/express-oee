// Import required libraries
const mqtt = require('mqtt');

// MQTT broker configuration
const mqttOptions = {
    username: process.env.MQTT_USER, // Replace with your username
    password: process.env.MQTT_PASSWORD,  // Replace with your password
};

// Connect to the MQTT broker
const mqttClient = mqtt.connect(`mqtt://${process.env.MQTT_URL}`, mqttOptions);

// Define topic-function mapping (using batch initialization for simplicity)
const topicHandlers = {
    '/oee_apps/test': handleTopicMqtt1,
};

function handleTopicMqtt1 (message) {
    console.log('Handling /oee_apps/test:', message);
}

// // Dynamically create handlers for demonstration purposes
// for (let i = 1; i <= 2000; i++) {
//     const topic = `topic/${i}`;
//     topicHandlers[topic] = (message) => {
//         console.log(`Handling ${topic}:`, message);
//         // Add your specific logic for this topic
//     };
// }

// Batch subscribe to topics

const BATCH_SIZE = 100;
function subscribeInBatches(mqttClient, topics, batchSize) {
    for (let i = 0; i < topics.length; i += batchSize) {
        const batch = topics.slice(i, i + batchSize);
        mqttClient.subscribe(batch, (err) => {
            if (err) {
                console.error('Subscription error for batch:', err);
            } else {
                console.log(`Subscribed to batch: ${batch.join(', ')}`);
            }
        });
    }
}

// MQTT client connection event
mqttClient.on('connect', () => {
    console.log('Connected to MQTT broker');
    
    // Get all topic keys and subscribe in batches
    const topics = Object.keys(topicHandlers);
    subscribeInBatches(mqttClient, topics, BATCH_SIZE);
});

// Handle incoming messages
mqttClient.on('message', (topic, message) => {
    console.log(`Message received on ${topic}:`, message.toString());

    // Check if a handler exists for the topic and call it
    if (topicHandlers[topic]) {
        topicHandlers[topic](message.toString());
    } else {
        console.log('No handler defined for this topic:', topic);
    }
});

// Export the mqttClient and topicHandlers
module.exports = {
    mqttClient,
    topicHandlers
};
