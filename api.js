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
    let lat = parseFloat(req.params.lat)
    let lon = parseFloat(req.params.lon)
    let prom = await fetch("https://api.openweathermap.org/data/2.5/forecast?units=metric&lat=" + lat + "&lon=" + lon + "&appid=" + process.env.OPEN_WEATHER_API_KEY)
    let data = await prom.json()
    let result = jsonToWeather(data)
    res.json({ result: result})
}

function jsonToWeather(json) {
    let weatherList = json.list

    // Seperate weather elements into days
    let daysWeather = {}
    for (let element of weatherList) {
        let date = element.dt_txt.slice(0,10)
        if (date in daysWeather) {
            daysWeather[date].push(element)
            
        } else {
            daysWeather[date] = Array.of(element)
        }
    }

    let weathers = []
    // For each day, get the average temperature, wind speed, and rainfall
    // Then, add these to the list of Weather objects
    for (let date in daysWeather) {
        let tempSum = 0
        let windSum = 0
        let rainSum = 0

        for (let weather of daysWeather[date]) {
            tempSum += parseFloat(weather.main.temp)
            windSum += parseFloat(weather.wind.speed)
            if ("rain" in weather) {
                rainSum += parseFloat(weather.rain['3h'])
            }
        }

        let avgTemp = tempSum / daysWeather[date].length
        let avgWind = windSum / daysWeather[date].length

        let weather = new Weather(date, avgTemp, avgWind, rainSum)
        weathers.push(weather)
    }
    return weathers
}

app.get('/weather/:city', sendWeatherCity);
app.get('/weather/coords/:lat/:lon', sendWeather)
app.listen(port, () => console.log(`Example app listening on port ${port}!`));






