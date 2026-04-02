const express = require("express");
const axios = require("axios");
require("dotenv").config();
const app = express();

app.use(express.json());

// ROUTE 1: Get OAuth Token
async function getToken() {
    const consumer_key = process.env.CONSUMER_KEY;
    const consumer_secret = process.env.CONSUMER_SECRET;
    const auth = Buffer.from(consumer_key + ":" + consumer_secret).toString("base64");

    const response = await axios.get(
        "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
        { headers: { Authorization: `Basic ${auth}` } }
    );
    
    return response.data.access_token;
}

// ROUTE 2: Make STK Push Request
app.post("/stkpush", async (req, res) => {
    try {
        const token = await getToken();

        const timestamp = new Date()
            .toISOString()
            .replace(/[^0-9]/g, "")
            .slice(0, 14);

        const shortCode = process.env.SHORTCODE;
        const passkey = process.env.PASSKEY;

        const password = Buffer.from(shortCode + passkey + timestamp).toString("base64");

        const data = {
            BusinessShortCode: shortCode,
            Password: password,
            Timestamp: timestamp,
            TransactionType: "CustomerPayBillOnline",
            Amount: req.body.amount,
            PartyA: req.body.phone,  
            PartyB: shortCode,
            PhoneNumber: req.body.phone,
            CallBackURL: process.env.CALLBACK_URL,
            AccountReference: "SlumToto Purchase",
            TransactionDesc: "Payment for goods"
        };

        const response = await axios.post(
            "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
            data,
            { headers: { Authorization: `Bearer ${token}` } }
        );

        res.json(response.data);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// CALLBACK: Safaricom sends payment results here
app.post("/callback", (req, res) => {
    console.log("MPESA CALLBACK:", JSON.stringify(req.body, null, 2));
    res.send("Callback received");
});

app.listen(3000, () => console.log("Server running on port 3000"));
