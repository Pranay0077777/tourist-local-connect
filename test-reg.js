
const fetch = require('node-fetch'); // Assuming node environment might have it or use http
const http = require('http');

const data = JSON.stringify({
    name: "pranay",
    email: "marepallisaipranay47@gmail.com",
    password: "password123",
    phone: "9392593410",
    city: "Hyderabad, Telangana",
    role: "tourist"
});

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Body: ${body}`);
    });
});

req.on('error', (error) => {
    console.error(`Request error: ${error.message}`);
});

req.write(data);
req.end();
