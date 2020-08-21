// Add console.log to check to see if our code is working.
console.log("working");

// We create the streets tile layer that will be the default map.
let streets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
  attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});

// We create the satellite-streets tile layer that will be an option for our map.
let satelliteStreets = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v11/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
});


// We create the dark view tile layer that will be an option for our map.
let light = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v10/tiles/{z}/{x}/{y}?access_token={accessToken}', {
attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery (c) <a href="https://www.mapbox.com/">Mapbox</a>',
	maxZoom: 18,
	accessToken: API_KEY
})

// Create a base layer that holds the maps.
let baseMaps = {
  "Streets": streets,
  "Satellite Streets": satelliteStreets,
  Light: light
};

// Create the map object with center, zoom level and default layer.
let map = L.map('mapid', {
	center: [40.7, -94.5],
	zoom: 3,
	layers: [streets]
});

// Create the earthquake and tectonic plate layer for our map.
let allEarthquakes = new L.layerGroup()
let largeEarthquakes = new L.LayerGroup()
let tectonicPlates = new L.layerGroup()

// We define an object that contains the overlays.
// This overlay will be visible all the time.
let overlays = {
	"Techtonic Plates": tectonicPlates,
	"Earthquakes": allEarthquakes
};

// Then we add a control to the map that will allow the user to change
// which layers are visible.
L.control.layers(baseMaps, overlays).addTo(map);

// retrive earthquake GeoJSON data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {
	// We set the style for each circleMarker using our styleInfo function.
	function styleInfo(feature) {
		return {
		  opacity: 1,
		  fillOpacity: 1,
		  fillColor: getColor(feature.properties.mag),
		  color: "#000000",
		  radius: getRadius(feature.properties.mag),
		  stroke: true,
		  weight: 0.5
		};
	}

	function getColor(magnitude) {
		if(magnitude > 5) {
			return "#ea2c2c";
		}
		if (magnitude > 4) {
			return "#ea822c";
		}
		if (magnitude > 3) {
		return "#ee9c00";
		}
		if (magnitude > 2) {
		return "#eecc00";
		}
		if (magnitude > 1) {
		return "#d4ee00";
		}
		return "#98ee00";
	}

// This function determines the radius of the earthquake marker based on its magnitude.
// Earthquakes with a magnitude of 0 will be plotted with a radius of 1.
function getRadius(magnitude) {
	if (magnitude === 0) {
	  return 1;
	}
	return magnitude * 4;
}

	L.geoJson(data, {
		pointToLayer: function(feature, latlng) {
			console.log(data);
			return L.circleMarker(latlng)
		},
		style: styleInfo,
		onEachFeature: function(feature, layer) {
			layer.bindPopup("Magnitude: " + feature.properties.mag + "<br>Location: " + feature.properties.place);
		}
	}).addTo(allEarthquakes)

	allEarthquakes.addTo(map)

	let legend = L.control({
		positions: "bottomright"
	})

    // Then add all the details for the legend.
    legend.onAdd = function() {
        let div = L.DomUtil.create("div", "info legend");
        const magnitudes = [0, 1, 2, 3, 4, 5];
        const colors = [
            "#98ee00",
            "#d4ee00",
            "#eecc00",
            "#ee9c00",
            "#ea822c",
            "#ea2c2c"
        ];

        for (var i = 0; i < magnitudes.length; i++) {
            console.log(colors[i]);
            div.innerHTML +=
              "<i style='background: " + colors[i] + "'></i> " +
              magnitudes[i] + (magnitudes[i + 1] ? "&ndash;" + magnitudes[i + 1] + "<br>" : "+");
         }
         return div;
	}
	
    legend.addTo(map);


	// Create a style for the lines.
    let myStyle = {
        color: "#ea2c2c",
        weight: 2
    }

    // adding techtonic plates
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plateData) {
        L.geoJson(plateData, {
			color: "#ea2c2c",
        	weight: 2
        }).addTo(tectonicPlates);
        // Add earthquakes layer to map
        tectonicPlates.addTo(map);
	})
})

