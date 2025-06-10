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
}).addTo(map);

// Maßstab
L.control.scale({
    imperial: false,
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
            console.log(feature.properties);
            layer.bindPopup(`
                <img src="${feature.properties.THUMBNAIL}" alt="*">
                <h4>${feature.properties.NAME}</h4>
                <addess>${feature.properties.ADRESSE}</addess>
                <a href="${feature.properties.WEITERE_INF}"target="Wien">Webseite</a>
            `);
        }
    }).addTo(overlays.sights);
}


loadSwim("https://services3.arcgis.com/hG7UfxX49PQ8XkXh/arcgis/rest/services/Schwimmanlagen/FeatureServer/0/query?outFields=*&where=1%3D1&f=geojson");