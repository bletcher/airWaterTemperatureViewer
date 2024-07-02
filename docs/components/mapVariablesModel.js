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

export function updateMarkersMapMod(markersLayer, VA_data, markerDataVar1, markerDataVar2, selectedParamY1, selectedParamY2, selectedSites, allDataAggExtent, colorScale) {
  markersLayer.clearLayers();

  VA_data.forEach(site => {
    const siteIDData1 = markerDataVar1.filter(d => d.siteID === site.siteID);
    const siteIDData2 = markerDataVar2.filter(d => d.siteID === site.siteID);

    if (
      selectedSites.includes(site.siteID) && 
      siteIDData1.length > 0 && 
      siteIDData2.length > 0
    ) {
      const siteIDDataAll = allDataAggExtent.filter(d => d.siteID === site.siteID);

      const min1 = siteIDDataAll[0][selectedParamY1][0];
      const max1 = siteIDDataAll[0][selectedParamY1][1];

      //const siteIDData1 = markerDataVar1.filter(d => d.siteID === site.siteID);
      const mean1 = siteIDData1.filter(d => d.stat === "mean")[0][selectedParamY1];

      const normVar1 = (mean1 - min1) / (max1 - min1);
      const markerColor = colorScale(normVar1);

  //display(["1",site.siteID, siteIDDataAll, siteIDData1, mean1, normVar1, siteIDDataAll, allDataAggExtent])

      //const siteIDData2 = markerDataVar2.filter(d => d.siteID === site.siteID);
      const min2 = siteIDDataAll[0][selectedParamY2][0];
      const max2 = siteIDDataAll[0][selectedParamY2][1];

      const mean2 = siteIDData2.filter(d => d.stat === "mean")[0][selectedParamY2];

      const normVar2 = (mean2 - min2) / (max2 - min2);
      const radius = (normVar2 + 1) * 7; // Scale the radius

  //display(["2",site.siteID, siteIDData2, mean2, radius])

      const marker = L.circleMarker([site.lat, site.lon], {
        color: markerColor,
        fillColor: markerColor,
        fillOpacity: 0.95,
        radius: radius
      });

      markersLayer.addLayer(marker);
//display([mean1.toFixed(2), normVar1.toFixed(2), selectedParamY2, mean2.toFixed(2), normVar2.toFixed(2)])
      marker.bindPopup(`Site ID: ${site.siteID} <br> ${selectedParamY1}: ${mean1.toFixed(2)} (${normVar1.toFixed(2)}) <br> ${selectedParamY2}: ${mean2.toFixed(2)} (${normVar2.toFixed(2)})`);
      marker.on('mouseover', function (e) {
        this.openPopup();
      });
      marker.on('mouseout', function (e) {
        this.closePopup();
      });
    } else {
      const markerColor2 = "#6d6d78";
      const marker = L.circleMarker([site.lat, site.lon], {
        color: markerColor2,
        fillColor: markerColor2,
        fillOpacity: 0.95,
        radius: 6
      });

      markersLayer.addLayer(marker);

      marker.bindPopup(`Site ID: ${site.siteID}`);
      marker.on('mouseover', function (e) {
        this.openPopup();
      });
      marker.on('mouseout', function (e) {
        this.closePopup();
      });
    }
  });
};

export function getMarkerData(dIn, variable, groupAndAggregate, func = d3.mean) {
  const gMean = groupAndAggregate(
    dIn, // Dataset
    [variable], // Parameters to aggregate
    null, // selectedAggregator
    func, // aggregation function - note this returns an array
    'siteID'  // Default grouping variables
  );

  return gMean;
};

export const colorScale = d3.scaleLinear()
.domain([0, 0.5, 1]) // The domain is now [0, 1] because the ampRatioMean values have been normalized
//    range: ["#00f", "#e31010", "#1685f5"]
.range(["#f00a0a", "#f0e40a", "#0d58d1"]);
