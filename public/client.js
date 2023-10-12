import {Weather} from './weather.js'
var app = new Vue({
    el: '#app',
    data: {
        cityQuery: "",
        lat: "",
        lon: "",
        city: "",
        cityPredictions: [],
        summary: []
    },
    methods: {
        searchCity: searchCity,
        searchLatLon: searchLatLon,
        setCity: setCity
    }
})

async function searchCity() {
    let prom = fetch("city/" + this.cityQuery)
    prom.then(response => response.json())
        .then(response => {
        this.cityPredictions = response.predictions
    })
}

function searchLatLon() {
    console.log("searchLatLon called")
    let prom = fetch("weather/coords/" + this.lat + "/" + this.lon)
    prom.then(response => response.json())
        .then(response => {
        this.summary = response.result
    })
}

function setCity(prediction) {
    this.city = prediction.description
}