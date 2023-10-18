export class HotSpot {
    lat;
    lon;
    name;
    distance;
    sightings;
    googleMapsLink;

    constructor(lat, lon, name, distance, sightings, image) {
        this.lat = lat
        this.lon = lon
        this.name = name
        this.distance = distance
        this.sightings = sightings
        this.googleMapsLink = "https://maps.google.com/?q=" + lat + "," + lon
    }
}

export class BirdSighting {
    commonName;
    scientificName;
    image;

    constructor(commonName, scientificName, image) {
        this.commonName = commonName
        this.scientificName = scientificName
        this.image = image
    }
}