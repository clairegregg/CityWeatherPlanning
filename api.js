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

async function sendCityPredictions(req, res) {
    let query = req.params.query
    let prom = await fetch("https://maps.googleapis.com/maps/api/place/autocomplete/json?input="+query+"&key="+process.env.GOOGLE_API_KEY)
    let data = await prom.json()
    res.json({ predictions: data.predictions })
};

async function sendWeather(req, res) {
    console.log('Got request with Google place ID')
    let placeId = req.params.placeId
    let prom = await fetch("https://maps.googleapis.com/maps/api/place/details/json?placeid=" + placeId + "&key=" + process.env.GOOGLE_API_KEY)
    let data = await prom.json()
    let lat = data.result.geometry.location.lat
    let lon = data.result.geometry.location.lat
    let result = await getWeather(lat, lon)
    res.json({ result: result })
}

async function sendWeatherLatLon(req, res) {
    console.log('Got request with lat/lon')
    let lat = parseFloat(req.params.lat)
    let lon = parseFloat(req.params.lon)
    let result = getWeather(lat, lon)
    res.json({ result: result})
}

async function getWeather(lat, lon) {
    let prom = await fetch("https://api.openweathermap.org/data/2.5/forecast?units=metric&lat=" + lat + "&lon=" + lon + "&appid=" + process.env.OPEN_WEATHER_API_KEY)
    let data = await prom.json()
    return jsonToWeather(data)
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

app.get('/weather/gid/:placeId', sendWeather)
app.get('/city/:query', sendCityPredictions);
app.get('/weather/coords/:lat/:lon', sendWeatherLatLon)
app.listen(port, () => console.log(`Example app listening on port ${port}!`));






