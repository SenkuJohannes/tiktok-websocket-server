const { WebcastPushConnection } = require('tiktok-live-connector');
const WebSocket = require('ws');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// --------------------
// WebSocket Server
// --------------------

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log("🎮 Game client connected");

    ws.on('close', () => {
        console.log("❌ Game client disconnected");
    });
});

// --------------------
// TikTok Connection (USERNAME MODE)
// --------------------

const connection = new WebcastPushConnection("officialsenku8");

connection.connect({
    enableExtendedGiftInfo: true
})
.then(state => {
    console.log("🔥 CURRENT ROOM ID:", state.roomId);
})
.catch(err => {
    console.error("❌ TikTok connection failed:", err);
});

// --------------------
// Gift Listener
// --------------------

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

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(giftData);
        }
    });
});

// --------------------
// Error Logging
// --------------------

connection.on('error', err => {
    console.error("TikTok connection error:", err);
});
