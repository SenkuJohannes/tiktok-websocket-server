const { WebcastPushConnection } = require('tiktok-live-connector');
const WebSocket = require('ws');
const express = require('express');

const app = express();

// Use Render's assigned port
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// WebSocket server
const wss = new WebSocket.Server({ server });

// Log when game connects
wss.on('connection', (ws) => {
    console.log("🎮 Game client connected");

    ws.on('close', () => {
        console.log("❌ Game client disconnected");
    });
});

// Replace with your TikTok username
const tiktokUsername = "officialsenku8";

// Connect to TikTok Live
const connection = new WebcastPushConnection(tiktokUsername);

connection.connect({
    enableExtendedGiftInfo: true
})
.then(state => {
    console.log(`✅ Connected to TikTok room ${state.roomId}`);
})
.catch(err => {
    console.error("❌ Failed to connect to TikTok:", err);
});

// When a gift is received
connection.on('gift', (data) => {

    console.log("🎁 GIFT EVENT TRIGGERED");
    console.log("Gift:", data.giftName);
    console.log("From:", data.uniqueId);
    console.log("Diamonds:", data.diamondCount);

    const giftData = JSON.stringify({
        type: "gift",
        username: data.uniqueId,
        giftName: data.giftName,
        diamonds: data.diamondCount
    });

    // Send gift to all connected game clients
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(giftData);
        }
    });

});

// Optional: Log errors
connection.on('error', err => {
    console.error("TikTok connection error:", err);
});
