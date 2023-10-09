export class Weather {
    date;
    temperature; 
    windspeed; 
    rainfall;

    constructor(date,temperature,windspeed, rainfall){
        this.date = date;
        this.temperature = temperature;
        this.windspeed = windspeed;
        this.rainfall = rainfall;
    }    

    getTemperature() {
        if (this.temperature < 13){
            return Temperatures.Cold;
        } else if (this.temperature > 23) {
            return Temperatures.Hot;
        } else {
            return Temperatures.Mild;
        }
    }

    getUmbrella() {
        if (this.rainfall > 0) {
            return true;
        }
        return false;
    }
}

export const Temperatures = {
	Cold: "cold",
    Mild: "mild",
    Hot: "hot"
}