const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Login Routes
app.get('/login/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'login-dashboard.html'));
});

app.get('/login/customer', (req, res) => {
    res.sendFile(path.join(__dirname, 'login-customer.html'));
});

app.get('/login/delivery', (req, res) => {
    res.sendFile(path.join(__dirname, 'login-delivery.html'));
});

app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

// Send index.html for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Noodles King server is running on port ${PORT}`);
});
