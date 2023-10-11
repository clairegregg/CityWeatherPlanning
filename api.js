import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { Weather } from './public/weather.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

const publicPath = path.resolve(__dirname, 'public');

app.use(express.static(publicPath));

app.get('/weather/:city', sendWeather);
app.listen(port, () => console.log(`Example app listening on port ${port}!`));

const getNextDay = (daysToAdd) => {
    const currentDate = new Date();
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + daysToAdd);
    return nextDate;
};

const sendWeather = (_, res) => {
    console.log('Got request!');
    const currentDate = new Date();
    // For now, this is dummy data
    const summary = [
        new Weather(currentDate, 50, 50, 50),
        new Weather(getNextDay(1), 50, 50, 50),
        new Weather(getNextDay(2), 50, 50, 50),
        new Weather(getNextDay(3), 50, 50, 50),
        new Weather(getNextDay(4), 50, 50, 50),
    ];
    res.json({ result: summary });
};


