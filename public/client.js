import { getTemperatureType } from "./weather.js";
var app = new Vue({
  el: "#app",
  data: {
    cityQuery: "",
    city: "",
    cityPredictions: [],
    currentCityId: "",
    summary: [],
    bringUmbrella: false,
    overallWeather: null,
    bringMask: false,
  },
  methods: {
    searchCity: searchCity,
    setCity: setCity,
    searchCityId: searchCityId,
  },
});

async function searchCity() {
  if (this.cityQuery.length > 0) {
    let prom = fetch("city/" + this.cityQuery);
    prom
      .then((response) => response.json())
      .then((response) => {
        this.cityPredictions = response.predictions;
      });
  }
}

function setCity(prediction) {
  this.city = prediction.description;
  this.currentCityId = prediction.place_id;
  this.searchCityId();
  this.cityPredictions = [];
  this.cityQuery = prediction.description;
}

async function searchCityId() {
  let prom = fetch("weather/gid/" + this.currentCityId);
  prom
    .then((response) => response.json())
    .then((response) => {
      this.summary = response.result;
      this.bringUmbrella = false;
      this.bringMask = false;
      let averageTemp = 0;
      for (let weather of this.summary) {
        console.log(weather)
        if (weather.needUmbrella) {
          this.bringUmbrella = true;
        }
        if (weather.needMask) {
          this.bringMask = true;
        }
        averageTemp += weather.temperature;
      }
      averageTemp /= 5
      this.overallWeather = getTemperatureType(averageTemp)
    });
}
