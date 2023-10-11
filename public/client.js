import {Weather} from './weather.js'

var app = new Vue({
    el: '#app',
    data: {
        city: "",
        lat: "",
        lon: "",
        summary: []
    },
    methods: {
        searchCity: searchCity,
        searchLatLon: searchLatLon,
    }
})

function searchCity() {
    console.log("searchCity called")
    console.log("sending to weather/" + this.city)
    let prom = fetch("weather/" + this.city)
    prom.then(response => response.json())
        .then(response => {
            this.summary = response.result
        })
}

function searchLatLon() {
    console.log("searchLatLon called")
    let prom = fetch("weather/coords/" + this.lat + "/" + this.lon)
    prom.then(response => {
        this.summary = response.result
    })
}