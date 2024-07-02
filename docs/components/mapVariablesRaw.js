import * as d3 from "npm:d3";

// Map functions //////////////////////////////////////////////////////////////

export const baseMap = {
  USGS_hydro: L.tileLayer(
    'https://basemap.nationalmap.gov/arcgis/rest/services/USGSHydroCached/MapServer/tile/{z}/{y}/{x}',
    {
      attribution: '<a href="http://www.doi.gov">U.S. Department of the Interior</a> | <a href="http://www.usgs.gov">U.S. Geological Survey</a> | <a href="http://www.usgs.gov/laws/policies_notices.html">Policies</a>',
      maxZoom: 20
    }
  ),
  StreetView: L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',   
    {attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}
  ),
  Topography: L.tileLayer.wms(
    'http://ows.mundialis.de/services/service?',   
    {layers: 'TOPO-WMS'}
  ),
  Places: L.tileLayer.wms(
    'http://ows.mundialis.de/services/service?', 
    {layers: 'OSM-Overlay-WMS'}
  ),
  USGS_USImagery: L.tileLayer(
    'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}',
    {
      maxZoom: 20,
      attribution:
      'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>',
    }
  )
};

export function addMarkers(dIn, map1) {
  let markers = [];
  dIn.forEach(function(d) {
    let marker = L.circleMarker([d.lat, d.lon], {
      color: 'blue',
      fillColor: '#30f',
      fillOpacity: 0.5,
      radius: 10
    }).addTo(map1);

    // Add a 'selected' property to the marker
    marker.selected = false;
    marker.siteID = d.siteID;

    markers.push(marker);
  });
  return markers;
};

export function addClickListenersToMarkers(markers, markersSelected) {
  markers.forEach(function(marker) {
    // Add a click event listener to the marker
    marker.on('click', function() {
      // Toggle the 'selected' property
      this.selected = !this.selected;

      markersSelected.value = markers.filter(d => d.selected).map(d => d.siteID)
      // Update the marker styles
      updateMarkerStyles(markers);
    });
  });

  return(markersSelected);
};

export function updateMarkerStyles(markers) {
  markers.forEach(function(marker) {
    if (marker.selected) {
      marker.setStyle({
        color: '#eb8117',
        fillColor: '#f03',
      });
    } else {
      marker.setStyle({
        color: 'blue',
        fillColor: '#30f',
      });
    }
  });
  //console.log("updateMarkerStyle", markersSelected.value, markers.filter(d => d.selected).map(d => d.siteID))
  return(markers);
};