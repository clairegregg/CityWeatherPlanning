import { Weather } from "./weather.js";
var app = new Vue({
  el: "#app",
  data: {
    cityQuery: "",
    city: "",
    cityPredictions: [],
    currentCityId: "",
    summary: [],
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
    });
}
