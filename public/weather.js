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

        this.temperatureRange = getTemperatureType(this.temperature)
        
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

export function getTemperatureType(temperature) {
    if (temperature < 13){
       return Temperatures.Cold
    } else if (this.temperature > 23) {
        return Temperatures.Hot
    } else {
        return Temperatures.Mild
    }
}

export const Temperatures = {
	Cold: "cold",
    Mild: "mild",
    Hot: "hot"
}