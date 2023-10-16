export class HotSpot {
    lat;
    lon;
    name;
    distance;
    sightings;

    constructor(lat, lon, name, distance, sightings) {
        this.lat = lat
        this.lon = lon
        this.name = name
        this.distance = distance
        this.sightings = sightings
    }
}

export class BirdSighting {
    commonName;
    scientificName;

    constructor(commonName, scientificName) {
        this.commonName = commonName
        this.scientificName = scientificName
    }
}