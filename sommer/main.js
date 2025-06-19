// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778,
    zoom: 11,
};

// Karte initialisieren
let map = L.map("map").setView([ibk.lat, ibk.lng], ibk.zoom);

// thematische Layer
let overlays = {
    stations: L.featureGroup(),
    temperature: L.featureGroup(),
    wind: L.featureGroup(),
    snow: L.featureGroup(),
    direction: L.featureGroup(),
    lift: L.featureGroup(),
    swim: L.featureGroup().addTo(map),
}

// Layer control
L.control.layers({
    "BasemapAT": L.tileLayer.provider('BasemapAT.basemap'),
    "BasemapAT grau": L.tileLayer.provider('BasemapAT.grau').addTo(map),
    "BasemapAT HighDPI": L.tileLayer.provider('BasemapAT.highdpi'),
    "BasemapAT Orthofoto": L.tileLayer.provider('BasemapAT.orthofoto'),
    "BasemapAT Overlay": L.tileLayer.provider('BasemapAT.overlay'),
    "BasemapAT Terrain": L.tileLayer.provider('BasemapAT.terrain'),
    "BasemapAT Surface": L.tileLayer.provider('BasemapAT.surface'),
}, {
    "Schwimmbäder": overlays.swim,
    "Lifte": overlays.lift,
    "Wetterstationen": overlays.stations,
    "Temperatur": overlays.temperature,
    "Wind": overlays.wind,
    "Schneehöhe": overlays.snow,
    "Windrichtung": overlays.direction,
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
}).addTo(map);

// Rainviewer
L.control.rainviewer({ 
    position: 'bottomleft',
    nextButtonText: '>',
    playStopButtonText: 'Play/Stop',
    prevButtonText: '<',
    positionSliderLabelText: "Hour:",
    opacitySliderLabelText: "Opacity:",
    animationInterval: 500,
    opacity: 0.5
}).addTo(map);


async function loadSwim(url) {
    //console.log(url);
    let response = await fetch(url);
    let jasondata = await response.json();
    L.geoJSON(jasondata, {
        style: {
            color: "#00aaff",
            weight: 2,
            fillColor: "#00aaff",
            fillOpacity: 0.5,
        },
        onEachFeature: function (feature, layer) {
            //console.log(feature.properties);
            let popupContent = `
                <h4>${feature.properties.OPEN}</h4>
                <h4>${feature.properties.NAME}</h4>
                <h4>${feature.properties.ADDRESS}</h4>
                <h4>${feature.properties.KONTAKT_TE}</h4>
                <h4>${feature.properties.KONTAKT_EM}</h4>
                <h4>${feature.properties.WEBLINK}</h4>
                <h4>${feature.properties.SAISON}</h4>
                <h4>${feature.properties.SONSTIGE}</h4>
            `;

            layer.bindPopup(popupContent);
            /* KI_BEGIN */
            let center = layer.getBounds().getCenter();
            let marker = L.marker(center).addTo(overlays.swim);
            marker.bindPopup(popupContent);
            /* KI_ENDE */
        }
    }).addTo(overlays.swim);
}

async function loadLift(url) {
    //console.log(url);
    let response = await fetch(url);
    let jasondata = await response.json();
    L.geoJSON(jasondata, {
        style: {
            color: "#00aaff",
            weight: 2,
            fillColor: "#00aaff",
            fillOpacity: 0.5,
        },
        onEachFeature: function (feature, layer) {
            //console.log(feature.properties);
            layer.bindPopup(`
                <h4>${feature.properties.STAETTE_NA}</h4>
                <h4>${feature.properties.OPEN}</h4>
                <h4>${feature.properties.KONTAKT_TE}</h4>
                <h4>${feature.properties.KONTAKT_EM}</h4>
                <h4>${feature.properties.WEBLINK}</h4>
                <h4>${feature.properties.SAISON}</h4>
            `);
        }
    }).addTo(overlays.lift);
}


// Wetterstationen
async function loadStations(url) {
    //console.log(url)
    let response = await fetch(url);
    let jsondata = await response.json();
    //console.log(jsondata);
    L.geoJSON(jsondata, {
        attribution: "Datenquelle: <a href='https://www.eea.europa.eu/en/datahub/'>EEA</a>",
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                //icon: L.icon({
                    //iconUrl: "icons/wifi.png",
                    //iconAnchor: [16, 37],
                    //popupAnchor: [0, -37],
                //})
            });
        },
        onEachFeature: function (feature, layer) {
            let pointInTime = new Date(feature.properties.date);
            //console.log(pointInTime);
            //console.log(feature);
            layer.bindPopup(`
                <h4>${feature.properties.name} (${feature.geometry.coordinates[2]}m)</h4>
                <ul>
                    <li>Temperatur(°C) ${feature.properties.LT !== undefined ? feature.properties.LT : "-"}</li>
                    <li>relative Feuchtigkeit(%) ${feature.properties.RH || "-"}</li>
                    <li>Wind(km/h) ${feature.properties.WG || "-" }</li>
                    <li>Schneehöhe(cm) ${feature.properties.HS || "-"}</li>
                </ul>
                <span>${pointInTime.toLocaleString()}</span>
            `);
        }
    }).addTo(overlays.stations)
    showTemperature(jsondata);
    showWind(jsondata);
    showSnow(jsondata);
    showDirect(jsondata);    

}


// Funktion um die Temperatur anzuzeigen
function showTemperature(jsondata) {
    L.geoJSON(jsondata, {
        filter: function (feature) {
            if (feature.properties.LT > -50 && feature.properties.LT < 50) {
                return true;
            }

        },
        pointToLayer: function (feature, latlng){
            let color = getColor(feature.properties.LT, COLORS.temperature);
            return L.marker(latlng,{
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style="background-color:${color}"> ${feature.properties.LT.toFixed(1)}</span>`
                })
            })
        },
    }).addTo(overlays.temperature);
}

// Funktion um die Windgeschwindigkeit anzuzeigen
function showSnow(jsondata) {
    L.geoJSON(jsondata, {
        filter: function (feature) {
            if (feature.properties.WG > 0 && feature.properties.WG < 150) {
                return true;
            }

        },
        pointToLayer: function (feature, latlng){
            let color = getColor(feature.properties.WG, COLORS.wind);
            return L.marker(latlng,{
                icon: L.divIcon({
                    className: "aws-div-icon-wind",
                    html: `<span style="background-color:${color}"> ${feature.properties.WG.toFixed(1)}</span>`
                })
            })
        },
    }).addTo(overlays.wind);
}

// Funktion um die Schneehöhe anzuzeigen
function showWind(jsondata) {
    L.geoJSON(jsondata, {
        filter: function (feature) {
            //console.log(feature.properties)
            if (feature.properties.HS > 0 && feature.properties.HS < 1000) {
                return true;
            }

        },
        pointToLayer: function (feature, latlng){
            let color = getColor(feature.properties.HS, COLORS.snow);
            return L.marker(latlng,{
                icon: L.divIcon({
                    className: "aws-div-icon-snow",
                    html: `<span style="background-color:${color}"> ${feature.properties.HS.toFixed(1)}</span>`
                })
            })
        },
    }).addTo(overlays.snow);
}

// Funktion um die Windrichtung anzuzeigen
function showDirect(jsondata) {
    L.geoJSON(jsondata, {
        filter: function (feature) {
            //console.log(feature.properties)
            if (feature.properties.WR > 0 && feature.properties.WR < 400) {
                return true;
            }

        },
        pointToLayer: function (feature, latlng){
            let color = getColor(feature.properties.WG, COLORS.wind);
            return L.marker(latlng,{
                icon: L.divIcon({
                    className: "aws-div-icon-wind",
                    html: `<span > <i style="transform:rotate(${feature.properties.WR}deg); color:${color}"class="fa-solid fa-circle-arrow-down"></i></span>`,
                })
            })
        },
    }).addTo(overlays.direction);
}

// Funktion um die Farben zu bestimmen
//console.log(COLORS);
function getColor(value, ramp) {
    for (let rule of ramp) {
        if (value >= rule.min && value < rule.max) {
            return rule.color;
        }
        
    }
}




loadSwim("../swim.geojson");
loadLift("lifte.geojson");
// Wetterstationen laden
loadStations("https://static.avalanche.report/weather_stations/stations.geojson");