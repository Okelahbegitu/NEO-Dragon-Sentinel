const express = require('express');
const cors = require('cors');

const env = require('../config/env');

const discordRoutes = require('./routes/discord');
const scanRoutes = require('./routes/scan');
const webhookRoutes = require('./routes/webhook');

const app = express();


// Middleware
app.use(cors({
    allowedHeaders: [
        'Content-Type',
        'x-tako-signature',
        'bypass-tunnel-reminder',
    ],
}));

app.use(express.json());


// Routes
app.use('/discord', discordRoutes);
app.use('/', scanRoutes);
app.use('/webhook', webhookRoutes);


// Start API
app.listen(env.EXPRESS_PORT, () => {
    console.log(
        `API is running on http://localhost:${env.EXPRESS_PORT}`
    );
});