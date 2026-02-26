const { WebcastPushConnection } = require('tiktok-live-connector');
const WebSocket = require('ws');
const express = require('express');

// -----------------------------
// Express Server (Required by Render)
// -----------------------------

const app = express();
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

// Health check endpoint (optional but recommended)
app.get('/', (req, res) => {
    res.send('TikTok WebSocket server is running.');
});

// -----------------------------
// WebSocket Server (For GDevelop)
// -----------------------------

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log("🎮 Game client connected");

    ws.on('close', () => {
        console.log("❌ Game client disconnected");
    });
});

// -----------------------------
// TikTok Live Connection (USERNAME MODE)
// -----------------------------

const TIKTOK_USERNAME = "officialsenku8";

const connection = new WebcastPushConnection(TIKTOK_USERNAME);

// Connect to TikTok
connection.connect({
    enableExtendedGiftInfo: true
})
.then(state => {
    console.log("✅ Connected to TikTok LIVE");
    console.log("🔥 Room ID:", state.roomId);
})
.catch(err => {
    console.error("❌ TikTok connection failed:", err);
});

// -----------------------------
// Gift Listener
// -----------------------------

connection.on('gift', (data) => {

    console.log("🎁 GIFT RECEIVED");
    console.log("Gift:", data.giftName);
    console.log("From:", data.uniqueId);
    console.log("Diamonds:", data.diamondCount);

    const payload = JSON.stringify({
        type: "gift",
        username: data.uniqueId,
        giftName: data.giftName,
        diamonds: data.diamondCount
    });

    // Send to all connected WebSocket clients (your game)
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(payload);
        }
    });
});

// -----------------------------
// Error Logging
// -----------------------------

connection.on('error', (err) => {
    console.error("⚠️ TikTok connection error:", err);
});

connection.on('disconnected', () => {
    console.log("⚠️ TikTok disconnected");
});
