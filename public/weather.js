 export class Weather {
    date;
    temperature; 
    windspeed; 
    rainfall;
    maxPm2p5;
    temperatureRange;
    needUmbrella;
    needMask;

    constructor(date,temperature,windspeed, rainfall, maxPm2p5){
        this.date = date;
        this.temperature = temperature;
        this.windspeed = windspeed;
        this.rainfall = rainfall;
        this.maxPm2p5 = maxPm2p5;

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

        if (this.maxPm2p5 > 10) {
            this.needMask = true
        } else {
            this.needMask = false
        }
    }    
}

export const Temperatures = {
	Cold: "cold",
    Mild: "mild",
    Hot: "hot"
}