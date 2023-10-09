import {Weather} from "./weather.js"

var app = new Vue({
    el: '#app',
    data: {
        city: "",
        summary: [],
        weather_details: []
    },
    methods: {
        SearchCity: searchCity
    }
})

const getNextDay = (daysToAdd) => {
    const currentDate = new Date()
    const nextDate = new Date(currentDate)
    nextDate.setDate(currentDate.getDate() + daysToAdd)
    return nextDate
}

function searchCity() {
    var currentDate = new Date();
    // For now, this is dummy data
    this.summary = [
            new Weather(currentDate, 50, 50, 50),
            new Weather(getNextDay(1), 50, 50, 50),
            new Weather(getNextDay(2), 50, 50, 50),
            new Weather(getNextDay(3), 50, 50, 50),
            new Weather(getNextDay(4), 50, 50, 50)
        ]
}