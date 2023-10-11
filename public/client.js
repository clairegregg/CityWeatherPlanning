import {Weather} from './weather.js'

var app = new Vue({
    el: '#app',
    data: {
        city: "",
        summary: []
    },
    methods: {
        searchCity: searchCity
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