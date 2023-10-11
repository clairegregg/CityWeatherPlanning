import express from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { Weather } from './public/weather.js';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

const publicPath = path.resolve(__dirname, 'public');

app.use(express.static(publicPath));

const getNextDay = (daysToAdd) => {
    const currentDate = new Date();
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + daysToAdd);
    return nextDate;
};

const sendWeatherCity = (_, res) => {
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

async function sendWeather(req, res) {
    console.log('Got request with lat/lon')
    let lat = parseInt(req.params.lat)
    let lon = parseInt(req.params.lon)
    let prom = await fetch("https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&appid=" + process.env.OPEN_WEATHER_API_KEY)
    let data = await prom.json();
    console.log(data)
}

app.get('/weather/:city', sendWeatherCity);
app.get('/weather/coords/:lat/:lon', sendWeather)
app.listen(port, () => console.log(`Example app listening on port ${port}!`));






