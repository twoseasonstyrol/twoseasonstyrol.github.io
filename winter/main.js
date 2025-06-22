// Innsbruck
let ibk = {
    lat: 47.267222,
    lng: 11.392778,
    zoom: 11,
};

// Karte initialisieren
let map = L.map("map", {
    scrollWheelZoom: false,
}).setView([ibk.lat, ibk.lng], ibk.zoom);

/* KI_BEGINN */
// Beim Klicken auf die Karte Scroll-Zoom aktivieren
map.on("click", function () {
    map.scrollWheelZoom.enable();
});

// Beim Verlassen der Karte Scroll-Zoom wieder deaktivieren
map.on("mouseout", function () {
    map.scrollWheelZoom.disable();
});
/* KI_ENDE */


// thematische Layer
let overlays = {
    temperature: L.featureGroup(),
    wind: L.featureGroup(),
    snow: L.featureGroup(),
    swim: L.featureGroup(),
    ski: L.featureGroup().addTo(map),
    culture: L.featureGroup(),
    ice: L.featureGroup(),
}

// Layer control
L.control.layers({
    "Openstreetmap": L.tileLayer.provider("OpenStreetMap.Mapnik").addTo(map),
    "Esri WorldImagery": L.tileLayer.provider("Esri.WorldImagery")
}, {
    "Skigebiete": overlays.ski,
    "Eislaufbahnen": overlays.ice,
    "Kunst & Kultur": overlays.culture,
    "Schwimmbäder": overlays.swim,
    "Schneehöhe (cm)": overlays.snow,
    "Temperatur (°C)": overlays.temperature,
    "Wind (km/h)": overlays.wind,
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

// Reset View
L.control.resetView({
    position: "topleft",
    title: "Startview anzeigen",
    latlng: map.getCenter(),
    zoom: map.getZoom(),
}).addTo(map);

// Standort Control hinzufügen
L.control.locate({
    strings: {
        title: "Eigenen Standort anzeigen",
        drawCircle: false,
    },
}).addTo(map);

async function loadSki(url) {
    //console.log(url);
    let response = await fetch(url);
    let jasondata = await response.json();
    L.geoJSON(jasondata, {
        style: {
            color: "#0074D9",
            weight: 2,
            fillColor: "#0074D9",
            fillOpacity: 0.5,
        },
        onEachFeature: function (feature, layer) {
            //console.log(feature.properties);
            let popupContent = `
                <h3 class="title-name">${feature.properties.NAME}</h3>
                <p>                  
                    Letzte/Aktuelle Saison: <strong>${feature.properties.SAISON} </strong><br>
                    Öffungzeiten: <br>
                        <strong>${feature.properties.OPEN.replaceAll(';', ';<br>')}</strong><br>
                    Anzahl der Lifte: <strong>${feature.properties.ANZ_LIFT} </strong><br>
                    Pistenkilometer: <strong>${feature.properties.ANZ_PISTEN} km </strong><br>                    
                    Sonstiges: <strong>${feature.properties.SONSTIGE} </strong>
                </p>
                <h4 class="title-contact">Kontakt</h4>
                <div class="text-popup">
                <p class="contact-info">
                    Adresse: ${feature.properties.ADDRESS}<br>
                    Telefon: <a href="tel:${feature.properties.KONTAKT_TE}">${feature.properties.KONTAKT_TE}</a><br>
                    E-Mail: <a href="mailto:${feature.properties.KONTAKT_EM}">${feature.properties.KONTAKT_EM}</a><br>
                    <a href="${feature.properties.WEBLINK}"><strong>Homepage </strong></a>
                </p>
                </div>
            `;
            layer.bindPopup(popupContent);
            /* KI_BEGIN */
            let center = layer.getBounds().getCenter();
            let marker = L.marker(center, {
                icon: L.icon({
                    iconUrl: `../icons/skiing2.png`,
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37],
                })
            }).addTo(overlays.ski);
            marker.bindPopup(popupContent);
            /* KI_ENDE */
        }
    }).addTo(overlays.ski);
}

async function loadEis(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    L.geoJSON(geojson, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: '../icons/iceskating.png',
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37],
                })
            });
        },
        onEachFeature: function (feature, layer) {
            console.log(feature.properties);
            let popupContent = `
                <h3 class="title-name">${feature.properties.NAME}</h3>
                <p>                  
                    Saison: <strong>${feature.properties.SAISON} </strong><br>
                    Öffungzeiten: <br>
                        <strong>${feature.properties.OPEN.replaceAll(';', ';<br>')}</strong><br>
                </p>
                <h4 class="title-contact">Kontakt</h4>
                <div class="text-popup">
                <p class="contact-info">
                    Adresse: ${feature.properties.ADDRESS}<br>
                    Telefon: <a href="tel:${feature.properties.KONTAKT_TE}">${feature.properties.KONTAKT_TE}</a><br>
                    E-Mail: <a href="mailto:${feature.properties.KONTAKT_EM}">${feature.properties.KONTAKT_EM}</a><br>
                    <a href="${feature.properties.LINK}"><strong>Homepage </strong></a>
                </p>
                </div>
            `;
            layer.bindPopup(popupContent);
        }
    }).addTo(overlays.ice);
}

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

            console.log(feature.properties);
            let popupContent = `
                <h3 class="title-name">${feature.properties.NAME}</h3>
                <p>
                    ${feature.properties.SONSTIGE} <br>
                    <div style="margin-top: 4px;"></div>
                    Saison: <strong>${feature.properties.SAISON} </strong><br>
                    Öffungzeiten: <br>
                    <strong>${feature.properties.OPEN.replaceAll(';', ';<br>')}</strong>
                </p>
                <h4 class="title-contact">Kontakt</h4>
                <div class="text-popup">
                <p class="contact-info">
                    Adresse: ${feature.properties.ADDRESS}<br>
                    Telefon: <a href="tel:${feature.properties.KONTAKT_TE}">${feature.properties.KONTAKT_TE}</a><br>
                    E-Mail: <a href="mailto:${feature.properties.KONTAKT_EM}">${feature.properties.KONTAKT_EM}</a><br>
                    <a href="${feature.properties.WEBLINK}"><strong>Homepage </strong></a>
                </p>
                </div>
            `;

            layer.bindPopup(popupContent);
            console.log(feature.properties.ATTR_SCHWI);
            /* KI_BEGIN nicht der Mittelteil*/
            let center = layer.getBounds().getCenter();
            let marker = L.marker(center, {
                icon: L.icon({
                    iconUrl: `../icons/swim_indoor2.png`,
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37],
                })
            }).addTo(overlays.swim);
            marker.bindPopup(popupContent);
            /* KI_ENDE */
        },
        filter: function (feature, layer) {
            return feature.properties.ATTR_SCHWI === "Halle";
        },
    }).addTo(overlays.swim);
}

// Funktion für Kunst und Kultur
async function loadCulture(url) {
    let response = await fetch(url);
    let geojson = await response.json();
    L.geoJSON(geojson, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, {
                icon: L.icon({
                    iconUrl: '../icons/photo.png',
                    iconAnchor: [16, 37],
                    popupAnchor: [0, -37],
                })
            });
        },
        onEachFeature: function (feature, layer) {
            console.log(feature.properties);
            let popupContent = `
                <h3 class="title-name">${feature.properties.Name}</h3>
                <p>
                    ${feature.properties.Anmerkung} <br>
                    <div style="margin-top: 4px;"></div>
                    Öffungzeiten: <br>
                    <strong>${feature.properties.Zeiten.replaceAll(',', ';<br>')}</strong><br>
                    Anzahl der Besuche: <strong>${feature.properties.Zutritts} </strong><br>
                </p>
                <h4 class="title-contact">Kontakt</h4>
                <div class="text-popup">
                <p class="contact-info">
                    Adresse: ${feature.properties.Adresse}<br>
                    Telefon: <a href="tel:${feature.properties.Tele}">${feature.properties.Tele}</a><br>
                    <a href="${feature.properties.Website}"><strong>Homepage </strong></a>
                </p>
                </div>
            `;
            layer.bindPopup(popupContent);
        }
    }).addTo(overlays.culture);
}

// Wetterstationen
async function loadStations(url) {
    console.log(url)
    let response = await fetch(url);
    let jsondata = await response.json();
    console.log(jsondata);
    showTemperature(jsondata);
    showWind(jsondata);
    showSnow(jsondata);

}


// Funktion um die Temperatur anzuzeigen
function showTemperature(jsondata) {
    L.geoJSON(jsondata, {
        filter: function (feature) {
            if (feature.properties.LT > -50 && feature.properties.LT < 50) {
                return true;
            }

        },
        pointToLayer: function (feature, latlng) {
            let color = getColor(feature.properties.LT, COLORS.temperature);
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon",
                    html: `<span style="background-color:${color}; display: inline-flex; align-items: center;"><i class="fa-solid fa-temperature-three-quarters" style="margin-right: 4px;"></i>${feature.properties.LT.toFixed(1)}</span>`
                })
            })
        },
    }).addTo(overlays.temperature);
}

// Funktion um die Windgeschwindigkeit anzuzeigen
function showWind(jsondata) {
    L.geoJSON(jsondata, {
        filter: function (feature) {
            if (feature.properties.WG > 0 && feature.properties.WG < 150) {
                return true;
            }

        },
        pointToLayer: function (feature, latlng) {
            let color = getColor(feature.properties.WG, COLORS.wind);
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon-wind",
                    html: `<span style="background-color:${color}; display: inline-flex; align-items: center;"> <i class="fa-solid fa-wind" style="margin-right: 4px;"></i>${feature.properties.WG.toFixed(1)}</span>`
                })
            })
        },
    }).addTo(overlays.wind);
}

// Funktion um die Schneehöhe anzuzeigen
function showSnow(jsondata) {
    L.geoJSON(jsondata, {
        filter: function (feature) {
            //console.log(feature.properties)
            if (feature.properties.HS > 0 && feature.properties.HS < 1000) {
                return true;
            }

        },
        pointToLayer: function (feature, latlng) {
            let color = getColor(feature.properties.HS, COLORS.snow);
            return L.marker(latlng, {
                icon: L.divIcon({
                    className: "aws-div-icon-snow",
                    html: `<span style="background-color:${color}; display: inline-flex; align-items: center;"> <i class="fa-solid fa-snowflake" style="margin-right: 4px;"></i>${feature.properties.HS.toFixed(1)}</span>`
                })
            })
        },
    }).addTo(overlays.snow);
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




loadSki("skigebiete.geojson");
loadEis("../eislaufbahnen.geojson");
loadSwim("../swim.geojson");
loadStations("https://static.avalanche.report/weather_stations/stations.geojson");
loadCulture("../kuk.geojson");