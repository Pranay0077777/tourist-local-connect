import express from 'express';

const router = express.Router();

// Mock Weather Data
const WEATHER_DATA: Record<string, { condition: string; temp: number }> = {
    'Chennai': { condition: 'Sunny', temp: 32 },
    'Bengaluru': { condition: 'Cloudy', temp: 24 },
    'Hyderabad': { condition: 'Sunny', temp: 30 },
    'Kochi': { condition: 'Rainy', temp: 28 },
    'Mysuru': { condition: 'Sunny', temp: 29 },
    'Madurai': { condition: 'Sunny', temp: 34 },
    'Pondicherry': { condition: 'Rainy', temp: 27 },
    'Coimbatore': { condition: 'Sunny', temp: 31 },
    'Thiruvananthapuram': { condition: 'Cloudy', temp: 29 },
    'Visakhapatnam': { condition: 'Sunny', temp: 30 }
};

// GET /api/weather/:city
router.get('/:city', (req, res) => {
    const { city } = req.params;
    const weather = WEATHER_DATA[city] || { condition: 'Sunny', temp: 25 };
    res.json(weather);
});

// POST /api/weather/simulate-rain (For testing purposes)
router.post('/simulate-rain', (req, res) => {
    const { city } = req.body;
    if (city) {
        WEATHER_DATA[city] = { condition: 'Rainy', temp: 22 };
        res.json({ success: true, message: `Simulating rain in ${city}` });
    } else {
        res.status(400).json({ error: 'City is required' });
    }
});

export default router;
