import express from 'express';
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

// This function is triggered to autocomplete a city query, and is bound to '/weather/gid/:placeId'
async function sendCityPredictions(req, res) {
    let query = req.params.query

    // Queries the Google Maps Place Autocomplete API
    //  - Ensures response is in json format
    //  - Partial city name as `query`
    //  - Passes in API key for authentication
    //  - Types of locations returned is _only_ cities
    let prom = await fetch("https://maps.googleapis.com/maps/api/place/autocomplete/json?input="+query+"&key="+process.env.GOOGLE_API_KEY+"&types=(cities)")
    let data = await prom.json()

    // Return predictions
    res.json({ predictions: data.predictions })
};

// This function gives all the details for the website given a Google place ID
//  - Weather forecast for the next 5 days (including air pollution)
//  - Birding hotspots nearby 
async function sendDetails(req, res) {
    // Turn the Google place ID into latitude and longitude
    let placeId = req.params.placeId
    let prom = await fetch("https://maps.googleapis.com/maps/api/place/details/json?placeid=" + placeId + "&key=" + process.env.GOOGLE_API_KEY)
    let data = await prom.json()
    let lat = data.result.geometry.location.lat
    let lon = data.result.geometry.location.lng

    // Call the relevant APIS for weather and birding, and create objects to return the relevant information
    let weather = await getWeather(lat, lon)
    let birding = await getBirdingHotspot(lat, lon)

    // Return the weather and birding details
    res.json({ weather: weather, birdingHotspot: birding })
}

// This function calls both the weather API and the air quality API
async function getWeather(lat, lon) {
    // Call the weather API
    let weatherProm = await fetch("https://api.openweathermap.org/data/2.5/forecast?units=metric&lat=" + lat + "&lon=" + lon + "&appid=" + process.env.OPEN_WEATHER_API_KEY)
    let weatherData = await weatherProm.json()

    // Call the air quality API
    let pollutionProm = await fetch("https://air-quality-api.open-meteo.com/v1/air-quality?latitude="+ lat + "&longitude="+ lon +"&hourly=pm2_5")
    let pollutionData = await pollutionProm.json()
    
    // Create and return a list of weather objects with information about the weather and air quality over the next 5 days
    return jsonsToWeather(weatherData, pollutionData)
}

// This function turns the data from the weather and air pollution API into 5 weather objects
function jsonsToWeather(weatherJson, airQualityJson) {
    let weatherList = weatherJson.list
    let airQualityList = airQualityJson.hourly

    // 1. Get the air qualities into an object, accessed by date.
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


    // 2. Get the weathers forecasts into an object, accessed by date.
    let daysWeather = {}
    for (let element of weatherList) {
        let date = element.dt_txt.slice(0,10)
        if (date in daysWeather) {
            daysWeather[date].push(element)
            
        } else {
            daysWeather[date] = Array.of(element)
        }
    }

    // Put the weather and air quality details into Weather objects
    let weathers = []
    let currDay = 1;

    // For each day, get the average temperature, wind speed, rainfall, and max pollution
    // Then, add these to the list of Weather objects
    for (let date in daysWeather) {
        // Sometimes, the API may return more than 5 days data, so ignore the last day
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

// Turn degrees into radians
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

// This function returns a BirdHotspot object with details from the eBird API, and images from the WikiMedia API
async function getBirdingHotspot(lat,lon) {
    try {
        // Fetch info from eBird API
        let prom = await fetch("https://api.ebird.org/v2/ref/hotspot/geo?lat="+lat+"&lng="+lon+"&fmt=json&dist=50")
        let data = await prom.json()

        // Find closest hotspot to city
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
    } catch (_) {
        return { "error": "No birding spots within 50km." }
    }
}

// This function turns a json about a hotspot from the eBird API into a BirdHotspot object
async function jsonToBirding(json, distance) {
    // Get recent bird sightings from eBird API
    let lat = json.lat
    let lon = json.lng
    let prom = await fetch("https://api.ebird.org/v2/data/obs/geo/recent?lat="+lat+ "&lng=" + lon + "&hotspot=true&dist=1&back=30&key=" + process.env.BIRDING_API_KEY)
    let sightings = await prom.json()

    // Pick most recent 5 sightings, create Bird object
    let mostRecentSightings = []
    for (let i = 0; i < Math.min(5, sightings.length); i++) {
        let image = await getBirdImage(sightings[i].sciName)
        let sighting = new BirdSighting(sightings[i].comName, sightings[i].sciName, image)
        mostRecentSightings.push(sighting)
    }

    return new HotSpot(lat, lon, json.locName, distance, mostRecentSightings)
}

// This function gets an image of a bird from Wikipedia, given its scientific name.
async function getBirdImage(scientificName) {
    // Call WikiMedia API with bird's scientific name
    let name = scientificName.replace(" ", "_")
    let prom = await fetch("https://commons.wikimedia.org/w/api.php?action=query&prop=pageimages&titles=" + name + "&format=json")
    let details = await prom.json()

    // If there is no image, use a placeholder image
    let pageId = Object.keys(details.query.pages)[0]
    if (pageId == -1){
        return "./bird.png"
    }

    // Otherwise, get the bird's Wikipedia thumbnail image (sized up)
    let thumbnailSrc = Object.values(details.query.pages)[0].thumbnail.source
    let normalSrc = thumbnailSrc.replace("thumb/","") // Removes thumbnail specification
    let lastSection = normalSrc.lastIndexOf("/") 
    normalSrc = normalSrc.slice(0,lastSection) // Removes last section which specifies number of pixels
    return normalSrc
}

app.get('/weather/gid/:placeId', sendDetails)
app.get('/city/:query', sendCityPredictions)
app.listen(port, () => console.log(`Weather app listening on port ${port}!`));






