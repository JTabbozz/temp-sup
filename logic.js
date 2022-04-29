// MAPS needed for our diverse backgrounds - tile layers:

// OUTDOORS TYPE MAP
var outdoors = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/outdoors-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}",{
  accessToken: API_KEY
});

// GRAYMAP TYPE
var graymap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}",{
  accessToken: API_KEY
});

//  SATELLITE TYPE MAP
var satellitemap = L.tileLayer("https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v9/tiles/256/{z}/{x}/{y}?access_token={accessToken}",{
  accessToken: API_KEY
});



// Define a map object with center, zoom and layers
var map = L.map("mapid", {
  // Australia center location
  center: [-25.09, +135.71],
  zoom: 6,
  layers: [outdoors, graymap, satellitemap]
}).fitBounds([
  [-13.30881220, 128.99605605],
  [-35.10172674, 113.10266102]
]);


// Define variables needed for layers.
var Bush_Fire_Prone_Areas = new L.LayerGroup();
var Native_Veg_Extent = new L.LayerGroup();
var Bushfires= new L.LayerGroup()

// Layers containing different map options
var baseMaps = {
  "Satellite map": satellitemap,
  "Grayscale map": graymap,
  "Normal physical map": outdoors
};

// overlays for data of 
var overlayMaps = {
  "Bushfires": Bushfires,
  "Bush Fire Prone Areas": Bush_Fire_Prone_Areas,
  "Native Vegetation": Native_Veg_Extent
};

var geoData = "http://australia-fire-api-dashboard.herokuapp.com/api/v1.0/fires_modis_geojson";

var geojson;

// Adding control layers to map.
L.control
  .layers(baseMaps, overlayMaps, {collapsed: false})
  .addTo(map);

// Extract fires geoJSON data.
// decided to retrieve all fires data for last week among different options
  d3.json(geoData, function(data) {
    // console.log(data.features);

  // function to give outlook for markers
  function styleInfo(feature) {
    return {
      fillOpacity: 0.8,
      // Color will be determined by "depth" or 3rd data in coordinates so #2 index as requested
      fillColor: getColor(feature.properties.brightness),
      // border of markers/bubbles
      color: "black",
      // Radius will be determined by richter scale magnitude of fires
      radius: getRadius(feature.properties.epr),
      stroke: true,
      weight: 0.5
    };
  }

  // Color of the marker depending on brightness of the fire.
  function getColor(brightness) {
    switch (true) {
      case brightness > 450:
        return "#f88e86";
      case brightness > 400:
        return "#f77b72";
      case brightness > 350:
        return "#f6685e";
      case brightness > 300:
        return "#f5554a";
      case brightness > 250:
        return "#f44336";

      default:
        return "#ffd700";
    }
  }

  // Establish final radius of the fires marker 
  // based on its magnitude adjusted or weighted to have better visibility
  function getRadius(brightness) {
    return brightness * 3;
  }

  // add GeoJSON layer to the map
  L.geoJson(data, {
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng);
    },
    style: styleInfo,
    onEachFeature: function(feature, layer) {
      // Popup text
      layer.bindPopup("<strong> Brightness temperature 21 (Kelvin): </strong>" + feature.properties.brightness
      + "<br><strong>Fire radiative power (FRP) in MW: </strong>" + feature.properties.frp) 
    }

  }).addTo(Bushfires);

  Bushfires.addTo(map);

  // Position of legend in the map
  var legend = L.control({
    position: "bottomleft"
  });


// Adding legend colors, title, etc
legend.onAdd = function() {
  var div = L.DomUtil.create("div", "info legend");
  //title of labels box, bold and give one additional row space
  labels = ['<strong>Brightness temperature 21 (Kelvin).</strong><br>'];

  var Brigh = [150, 250, 300, 350, 400, 450];
  var colors = [
    "#f88e86",
    "#f77b72",
    "#f6685e",
    "#f5554a",
    "#f44336",
    "#ffd700"
  ];
  // Send label to box title
  labels.push('<title></title>');
  div.innerHTML = labels.join('<br>');

 // Loop and to build legend, add classes and div to send to html and map
  for (var i = 0; i < Brigh.length; i++) {
    div.innerHTML += "<i style='background: " + colors[i] + "'></i> " +
    Brigh[i] + (Brigh[i + 1] ? " to " + Brigh[i + 1] + " Kelvin<br>" : "+ Kelvin");
  }
  return div;
};
legend.addTo(map);


  
  d3.json("../Brightness map/static/data/Bush_Fire_Prone_Areas_designated_21052016_OBRM_005_WA_GDA2020_Public.geojson",
    function(platedata1) {
      console.log(platedata1.features.geometry.coordinates);
      // Add tectonic plates lines to map
      L.geoJson(platedata1, {
        color: "blue",
        dashArray: '4, 4', dashOffset: '0',
        opacity: "0.75",
        weight: 3
      })
      .addTo(Bush_Fire_Prone_Areas);
      // add the tectonicplates layer to the map.
      Bush_Fire_Prone_Areas.addTo(map);
    });

 // Extract data of Tectonic Plates from geoJSON.
  // Simple, free access GeoJSON without API KEY
  
  d3.json("../Brightness map/static/data/countries.geojson",
    function(platedata2) {
      console.log(platedata2.features.geometry.coordinates);
      // Add tectonic plates lines to map
      L.geoJson(platedata2, {
        color: "green",
        dashArray: '4, 4', dashOffset: '0',
        opacity: "0.75",
        weight: 3
      })
      .addTo(Native_Veg_Extent);
      // add the tectonicplates layer to the map.
      Native_Veg_Extent.addTo(map);
    });

});
