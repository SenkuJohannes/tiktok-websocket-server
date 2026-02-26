const { WebcastPushConnection } = require('tiktok-live-connector');
const WebSocket = require('ws');
const express = require('express');

const app = express();

// IMPORTANT: Use Render's assigned port
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// WebSocket server
const wss = new WebSocket.Server({ server });

// Replace with your actual TikTok username
const tiktokUsername = "officialsenku8";

// Connect to TikTok Live
const connection = new WebcastPushConnection(tiktokUsername);

connection.connect()
    .then(state => {
        console.log(`Connected to room ${state.roomId}`);
    })
    .catch(err => {
        console.error("Failed to connect", err);
    });

// When a gift is received
connection.on('gift', data => {

    const giftData = JSON.stringify({
        type: "gift",
        username: data.uniqueId,
        giftName: data.giftName,
        diamonds: data.diamondCount
    });

    console.log(`${data.uniqueId} sent ${data.giftName}`);

    // Send to all connected game clients
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(giftData);
        }
    });
});