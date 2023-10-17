import express, { json } from 'express';
import { fileURLToPath } from 'url';
import path from 'path';
import { Weather } from './public/weather.js';
import dotenv from 'dotenv';
import { BirdSighting, HotSpot } from './public/birding.js';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

const publicPath = path.resolve(__dirname, 'public');

app.use(express.static(publicPath));

async function sendCityPredictions(req, res) {
    let query = req.params.query
    let prom = await fetch("https://maps.googleapis.com/maps/api/place/autocomplete/json?input="+query+"&key="+process.env.GOOGLE_API_KEY+"&types=(cities)")
    let data = await prom.json()
    res.json({ predictions: data.predictions })
};

async function sendWeather(req, res) {
    let placeId = req.params.placeId
    let prom = await fetch("https://maps.googleapis.com/maps/api/place/details/json?placeid=" + placeId + "&key=" + process.env.GOOGLE_API_KEY)
    let data = await prom.json()
    let lat = data.result.geometry.location.lat
    let lon = data.result.geometry.location.lng
    let weather = await getWeather(lat, lon)
    let birding = await getBirdingHotspot(lat, lon)
    res.json({ weather: weather, birdingHotspot: birding })
}

async function getWeather(lat, lon) {
    let weatherProm = await fetch("https://api.openweathermap.org/data/2.5/forecast?units=metric&lat=" + lat + "&lon=" + lon + "&appid=" + process.env.OPEN_WEATHER_API_KEY)
    let weatherData = await weatherProm.json()

    let pollutionProm = await fetch("https://air-quality-api.open-meteo.com/v1/air-quality?latitude="+ lat + "&longitude="+ lon +"&hourly=pm2_5")
    let pollutionData = await pollutionProm.json()
    
    return jsonsToWeather(weatherData, pollutionData)
}

function jsonsToWeather(weatherJson, airQualityJson) {
    let weatherList = weatherJson.list
    let airQualityList = airQualityJson.hourly

    // Get the air qualities into an object, accessed by date.
    let daysAirQuality = {}
    for (let i = 0; i < airQualityList.time.length; i++) {
        let time = airQualityList.time[i]
        let pollution = airQualityList["pm2_5"][i]
        let date = time.slice(0,10)
        if (date in daysAirQuality) {
            daysAirQuality[date].push(pollution)
            
        } else {
            daysAirQuality[date] = Array.of(pollution)
        }
    }


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
    let currDay = 1;
    // For each day, get the average temperature, wind speed, rainfall, and max pollution
    // Then, add these to the list of Weather objects
    for (let date in daysWeather) {
        // Sometimes, the API may return more than 5 days data
        if (currDay > 5) {
            break;
        }
        let tempSum = 0
        let windSum = 0
        let rainSum = 0
        let maxPm2p5 = 0

        for (let weather of daysWeather[date]) {
            tempSum += parseFloat(weather.main.temp)
            windSum += parseFloat(weather.wind.speed)
            if ("rain" in weather) {
                rainSum += parseFloat(weather.rain['3h'])
            }
        }

        for (let pm2p5 of daysAirQuality[date]) {
            if (maxPm2p5 < pm2p5) {
                maxPm2p5 = pm2p5
            }
        }

        let avgTemp = tempSum / daysWeather[date].length
        let avgWind = windSum / daysWeather[date].length

        let weather = new Weather(date, avgTemp, avgWind, rainSum, maxPm2p5)
        weathers.push(weather)
        currDay++;
    }
    return weathers
}

function deg2rad(deg) {
    return deg * (Math.PI/180)
}

// From https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates#:~:text=exports%20%3D%20function%20convertDegreesToRadians(%7B%20degrees,PI%20%2F%20180%3B%20%7D%3B
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2-lat1);  // deg2rad below
    var dLon = deg2rad(lon2-lon1); 
    var a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    var d = R * c; // Distance in km
    return d;
}

async function getBirdingHotspot(lat,lon) {
    let prom = await fetch("https://api.ebird.org/v2/ref/hotspot/geo?lat="+lat+"&lng="+lon+"&fmt=json&dist=50")
    let data = await prom.json()

    let minDistance = getDistanceFromLatLonInKm(lat, lon, data[0].lat, data[0].lng)
    let minIndex = 0
    for (let i = 1; i < data.length; i++) {
        let distance = getDistanceFromLatLonInKm(lat, lon, data[i].lat, data[i].lng)
        if (distance < minDistance) {
            minDistance = distance
            minIndex = i
        }
    }

    return jsonToBirding(data[minIndex], minDistance)
}

async function jsonToBirding(json, distance) {
    let lat = json.lat
    let lon = json.lng
    let prom = await fetch("https://api.ebird.org/v2/data/obs/geo/recent?lat="+lat+ "&lng=" + lon + "&hotspot=true&dist=1&key=" + process.env.BIRDING_API_KEY)
    let sightings = await prom.json()

    let mostRecentSightings = []
    for (let i = 0; i < 5; i++) {
        let sighting = new BirdSighting(sightings[i].comName, sightings[i].sciName)
        mostRecentSightings.push(sighting)
    }

    return new HotSpot(lat, lon, json.locName, distance, mostRecentSightings)
}

app.get('/weather/gid/:placeId', sendWeather)
app.get('/city/:query', sendCityPredictions)
app.listen(port, () => console.log(`Example app listening on port ${port}!`));






