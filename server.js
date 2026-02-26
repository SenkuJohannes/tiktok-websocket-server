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

/*
  CONNECT TO TIKTOK USING ROOM ID
  ⚠️ IMPORTANT: This roomId only works for your CURRENT live session.
  If you end your live and restart, you must update the roomId.
*/

const connection = new WebcastPushConnection(null, {
    roomId: "7611241903790508817"
});

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

// Log TikTok errors
connection.on('error', err => {
    console.error("TikTok connection error:", err);
});
