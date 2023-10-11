 export class Weather {
    date;
    temperature; 
    windspeed; 
    rainfall;
    temperatureRange;
    needUmbrella;

    constructor(date,temperature,windspeed, rainfall){
        this.date = date;
        this.temperature = temperature;
        this.windspeed = windspeed;
        this.rainfall = rainfall;

        if (this.temperature < 13){
            this.temperatureRange = Temperatures.Cold
        } else if (this.temperature > 23) {
            this.temperatureRange = Temperatures.Hot
        } else {
            this.temperatureRange = Temperatures.Mild
        }
        
        if (this.rainfall > 0) {
            this.needUmbrella = true
        } else {
            this.needUmbrella = false
        }
    }    
}

export const Temperatures = {
	Cold: "cold",
    Mild: "mild",
    Hot: "hot"
}