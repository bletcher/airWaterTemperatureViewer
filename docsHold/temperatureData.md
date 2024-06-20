### This page uses csv file uploads which are very slow. See `Temperature - parquet` for a faster version


```js
import {plotTimeSeries, plotAirWater, plotWaterDischarge, plotCurve, plotCurveHover, plotPhaseAmp, plotPhaseAmpXY} from "./components/temperatureDataPlots.js";
//import {addMap} from "./components/raw_data_map.js";
//import {interval} from 'https://observablehq.com/@mootari/range-slider';
import * as d3 from "npm:d3";
//import { ML } from 'ml';
//import {Mutable} from "@observablehq/stdlib";
//import * as tidyjs from "npm:tidyjs";
//import {DuckDBClient} from "npm:@observablehq/duckdb";
//import * as Arrow from "apache-arrow";
//import * as Parquet from "parquet-wasm";
```

```js
import {dt, dtYDAY, dtYDAY_Week, dtYDAY_Month, dtHOUR, dtHOUR_ampPhase, dtHOUR_params_pred, samples} from "./components/rawTemperatureVariables.js";

import {VA_data} from "./components/rawTemperatureVariables.js";
```

```js
//display(dtPQ)
```

```js
display(samples)
```

```js
const initialSite = [...new Set(dt.map(d => d.siteID))].sort()[0];//"PA_01FL";
```

The dataset for exploration here is from Shenandoah National Park.  
During development of this application, the dataset is limited to three sites for each area ["PA_01FL", "PA_06FL", "PA_10FL", "PI_01FL", "PI_06FL", "PI_10FL", "SR_01FL", "SR_06FL", "SR_10FL"] to deal with large file sizes with the whole dataset.  
It will take a while for the dataset to load...  
Eventually, we will likely store the data in **parquet files** and use **duckDB** which can drastically limit file sizes and run times.

## Raw data summary

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Total number of observations</h2>
    <span class="big">${dt.length.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>Number of water temp observations</h2>
    <span class="big">${dt.filter(d => d.waterTemperature).length.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>Number of air temp observations</h2>
    <span class="big">${dt.filter(d => d.airTemperature).length.toLocaleString("en-US")}</span>
  </div>
</div>

---

## Filter the dataset

Filter by sites, years and seasons. Use either the map or the dropdown to select sites.  
Click on a site marker to select or unselect a site. Selected sites will be <span style="color:#eb8117;">*orange*</span>.  
All sites are on the map, but only these sites ["PA_01FL", "PA_06FL", "PA_10FL", "PI_01FL", "PI_06FL", "PI_10FL", "SR_01FL", "SR_06FL", "SR_10FL"] are included in the data for now.

<div class="grid grid-cols-4">

  <div class="card grid-colspan-3">
    ${div_map1}
  </div>

  <div class="grid grid-rows-4">
    <div class="card grid-colspan-1">
      <h2>Number of filtered observations</h2>
      <span class="big">${dtFiltered.length.toLocaleString("en-US")}</span>
    </div>
    <div class="card grid-colspan-1">
      <h2>Number of selected sites</h2>
      <span class="big">${selectedSites.length.toLocaleString("en-US")}</span>
    </div>
    <div class="card grid-colspan-1">
      <h2>Number of selected years</h2>
      <span class="big">${selectedYears.length.toLocaleString("en-US")}</span>
    </div>
    <div class="card grid-colspan-1">
      <h2>Number of selected seasons</h2>
      <span class="big">${selectedSeasons.length.toLocaleString("en-US")}</span>
    </div>
  </div>

</div>

```js
////////////
// Inputs //
////////////

//import { getInputs } from "/components/inputs.js";//,
/*
const dataSets = dataSetList;
const selectDataSets = Inputs.select(dataSets, {
  //value: sites[0],
  value: shen, 
  width: 100, label: "Select data set"});
const selectedDataSets = Generators.input(selectDataSets);
*/

const sites = [...new Set(dt.map(d => d.siteID))].sort();
const selectSites = Inputs.select(sites, {
  //value: sites[0],
  value: markersSelected, 
  multiple: 8, width: 100, label: "Select sites"});
const selectedSites = Generators.input(selectSites);

const years = [...new Set(dt.map(d => d.year))].sort();
const selectYears = (Inputs.select(years, {value: years, multiple: true, width: 80, label: "Select years"}));
const selectedYears = Generators.input(selectYears);

const seasons = ["Spring", "Summer", "Autumn", "Winter"];//[...new Set(dt.map(d => d.season))];
const selectSeasons = (Inputs.select(seasons, {value: seasons, multiple: true, width: 80, label: "Select seasons"}));
const selectedSeasons = Generators.input(selectSeasons);

const ydays = [...new Set(dt.map(d => d.yday))].sort((function(a, b) {
  return a - b;
}));
const selectYdays = (Inputs.select(ydays, {value: d3.range(1,366,60), multiple: true, width: 80, label: "Select day(s) of year"}));
const selectedYdays = Generators.input(selectYdays);

const groupSiteID = [...new Set(dt.map(d => d.siteID))].sort() // for the colorScale

const showAir = (Inputs.radio([true, false], {label: "Show Air Temp?", value: true}));
const selectedShowAir = Generators.input(showAir);

const showWater = (Inputs.radio([true, false], {label: "Show Water Temp?", value: true}));
const selectedShowWater = Generators.input(showWater);

const showAWLines = (Inputs.radio([true, false], {label: "Show lines?", value: true}));
const selectedShowAWLines = Generators.input(showAWLines);

const facetDaily = (Inputs.radio([true, false], {label: "Graph by day? [not yet implemented]", value: true}));
const selectedFacetDaily = Generators.input(facetDaily);

const facetYearly = (Inputs.radio([true, false], {label: "Facet by year?", value: false}));
const selectedFacetYearly = Generators.input(facetYearly);

const aggregators = ["Monthly", "Weekly", "Daily", "15 Minute"];
const selectAggregators = (Inputs.select(aggregators, {value: "Daily", multiple: false, width: 90, label: "Select aggregation level"}));
const selectedAggregators = Generators.input(selectAggregators);

const selectPValue = (Inputs.range([0.0001, 1], {value: 1, step: 0.01, width: 220, label: "Select minimum p-value of max(ABC)"}));
const selectedPValue = Generators.input(selectPValue);

const selectRSAir = (Inputs.range([0.01, 0.99], {value: 0.01, step: 0.01, width: 200, label: "Select minimum r-squared for air data fits"}));
const selectedRSAir = Generators.input(selectRSAir);

const selectRSWater = (Inputs.range([0.01, 0.99], {value: 0.01, step: 0.01, width: 200, label: "Select minimum r-squared for water data fits"}));
const selectedRSWater = Generators.input(selectRSWater);

const selectAbsMinMax = (Inputs.range([1, 25], {value: 25, step: 0.5, width: 200, label: "Select maximum absolute Phase Difference for plotting"}));
const selectedAbsMinMax = Generators.input(selectAbsMinMax);

```

```js
//////////////////////
// filtered objects //
//////////////////////

import { filterBySiteID_year, filterBySiteID_year_season, filterBySiteID_year_yday } from "/components/rawTemperatureVariables.js";

const dtFiltered = filterBySiteID_year_season(dt, selectedSites, selectedYears, selectedSeasons)
const dtYDAYFiltered = filterBySiteID_year_season(dtYDAY, selectedSites, selectedYears, selectedSeasons)
const dtYDAY_Week_Filtered = filterBySiteID_year_season(dtYDAY_Week, selectedSites, selectedYears, selectedSeasons)
const dtYDAY_Month_Filtered = filterBySiteID_year_season(dtYDAY_Month, selectedSites, selectedYears, selectedSeasons)

const dtHOURFiltered = filterBySiteID_year_yday(dtHOUR, selectedSites, selectedYears, selectedYdays)

const dtHOUR_ampPhase_Filtered = filterBySiteID_year_season(dtHOUR_ampPhase, selectedSites, selectedYears, selectedSeasons).filter(
  d => d.pMaxMax < selectedPValue &&
  d.rSquared_air > selectedRSAir &&
  d.rSquared_water > selectedRSWater &&
  Math.abs(d.phaseDiff) < selectedAbsMinMax 
)
```

```js
/////////
// Map //
/////////

  const lat1 = 38.5;
  const lon1 = -78.0;
  const mag1 = 9.2;

  const div_map1 = display(document.createElement("div"));
  div_map1.style = "height: 500px;";

  const map1 = L.map(div_map1)
    .setView([lat1, lon1], mag1);

  L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',   
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }
  )
  .addTo(map1);

  const basemaps1 = {
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
  L.control.layers(basemaps1).addTo(map1);
  basemaps1.USGS_hydro.addTo(map1);

  // Store the initial map view
  const initialView1 = map1.getBounds();

  // Update the map view when the window is resized
  window.addEventListener('resize', function() {
    map1.fitBounds(initialView1);
  });
```

```js
/////////////////////////////////
// Add map markers and updates //
/////////////////////////////////

function addMarkers(dIn) {
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
}

function addClickListenersToMarkers(markers) {
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
}

function updateMarkerStyles(markers) {
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
  console.log("updateMarkerStyle", markersSelected.value, markers.filter(d => d.selected).map(d => d.siteID))
}

let markers = addMarkers(VA_data);
addClickListenersToMarkers(markers);
let markersSelected = Mutable([initialSite]);
updateMarkerStyles(markers);
```

```js

```

```js
//////////////////////////////////////////////
// Event listener for site dropdown updates //
//////////////////////////////////////////////

selectSites.addEventListener('change', function() {
  let selectedSite = this.value;
  console.log("selectSites event", selectedSite)

  markers.forEach(function(marker) {
    if (selectedSite.includes(marker.siteID)) {
      marker.selected = true;
    } else {
      marker.selected = false;
    }
  });

  markersSelected.value = markers.filter(d => d.selected).map(d => d.siteID);
  updateMarkerStyles(markers);
});
```

<div class="grid grid-cols-4">
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
    ${selectSites}
  </div>
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
    ${selectYears}
  </div>
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
    ${selectSeasons}
  </div>
</div>

*Color-code map dots by phaseDiff and amplitudeRatio metrics(?). Will metrics need to be standardized across broad region?*  
*Could add crossfilter for temp raw data and link with map to show sites that meet temperature criteria - this may be a different enough function that it goes in a separate page.*

---

## Plot air/water temperature

<div class="grid grid-cols-4"> 
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
    ${selectAggregators}
  </div>
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
    ${showAWLines}
  </div>
</div>

```js
import { getAggregatedData } from "/components/rawTemperatureVariables.js";
const aggregatedData = getAggregatedData(selectedAggregators, dtFiltered, dtYDAYFiltered, dtYDAY_Week_Filtered, dtYDAY_Month_Filtered)
```

```js
plotAirWater(aggregatedData, selectedShowAWLines)
```

```js

```

---

## Plot time series

<div class="grid grid-cols-2"> 
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
    ${showWater}
    ${showAir}
    ${facetYearly}
  </div>
</div>

Mouse over the time series chart below to see the hourly chart for the chosen site, year, and day of year.  
In the sub-daily graph, water temperature is in site-specific color and air temperature is grey. Predictions are the smooth lines.

```js
const timeSeriesHover = view(plotTimeSeries(dtFiltered, groupSiteID, selectedShowWater, selectedShowAir, selectedFacetYearly));
```

```js
plotCurveHover(dtHOUR, dtHOUR_params_pred, timeSeriesHover, groupSiteID)
```

```js
display(timeSeriesHover)
```

*Could add capability to add days to the graph by clicking, but the graph would get confusing quickly. See [Plot Hourly Data](./raw_data#plot-hourly-data) section for an alternative.*

---

## Plot phase difference and amplitude ratio

Filter the graphs for curve fit statistics. Default filter values are set to show all data.  
Use the `ABC filter` in the first column to filter based on the larger p-value of the 3 ABC paramters for both the *air* and *water* temperature models in the sin-cos curve fit for each day. *Will probably lose this as r-square may make more sense as a filter*.  
Use the `Select maximum absolute Phase Difference for plotting` filter in the first column to select the maximum absolute value for phase difference for plotting. This is brute force filtering.  
Use the `r-square` filters in the second column to filter based on r-square values for either the *air* or *water* temperature models or both.

<div class="grid grid-cols-3">
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
    ${selectPValue}
    ${selectAbsMinMax}
  </div>
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
    ${selectRSAir}
    ${selectRSWater}
  </div>
</div>

```js
plotPhaseAmp(dtHOUR_ampPhase_Filtered)
```

```js
plotPhaseAmpXY(dtHOUR_ampPhase_Filtered, years)
```

---

## Map
Map of sites coded by amplitude ratio (color) and phase difference (size). The mean values per site are sensitieve to the filters on the statistics in the plot phase difference and amplitude ratio [section](#plot-phase-difference-and-amplitude-ratio) above. Trying to match Fig 6 in the manuscript.  
*Will need fixed [min, max] values for the marker color and size.*

```js
display(ampPhaseMeans)
```

```js
const dtHOUR_ampPhase_filteredStats = dtHOUR_ampPhase.filter(
  d => d.pMaxMax < selectedPValue &&
  d.rSquared_air > selectedRSAir &&
  d.rSquared_water > selectedRSWater &&
  Math.abs(d.phaseDiff) < selectedAbsMinMax) 

const ampPhaseGrouped = d3.group(dtHOUR_ampPhase_filteredStats, d => d.siteID);
const ampPhaseMeans = new Map();

ampPhaseGrouped.forEach((value, key) => {
  ampPhaseMeans.set(key, {
    phaseDiffMean: d3.mean(value, d => d.phaseDiff),
    ampRatioMean: d3.mean(value, d => d.amplitudeRatio)
  });
});
```

```js
/////////
// Map //
/////////

  const lat = 38.5;
  const lon = -78.0;
  const mag = 9.2;

  const div_map = display(document.createElement("div"));
  div_map.style = "height: 500px;";

  const map = L.map(div_map)
    .setView([lat, lon], mag);

  L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',   
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }
  )
  .addTo(map);


  L.control.layers(basemaps1).addTo(map);
  basemaps1.USGS_hydro.addTo(map);

  // Store the initial map view
  const initialView = map.getBounds();

  // Update the map view when the window is resized
  window.addEventListener('resize', function() {
    map.fitBounds(initialView);
  });


```

```js

const ampRatioMeanValues = Array.from(ampPhaseMeans.values()).map(d => d.ampRatioMean);
const minAmpRatioMean = d3.min(ampRatioMeanValues);
const maxAmpRatioMean = d3.max(ampRatioMeanValues);

// Normalize the ampRatioMean values
const normalizedAmpRatioMeanValues = ampRatioMeanValues.map(value => (value - minAmpRatioMean) / (maxAmpRatioMean - minAmpRatioMean));

// Create a color scale
const colorScale = d3.scaleLinear()
  .domain([0, 0.5, 1]) // The domain is now [0, 1] because the ampRatioMean values have been normalized
  //    range: ["#00f", "#e31010", "#1685f5"]
  .range(["#f00a0a", "#f0e40a", "#0d58d1"]);

VA_data.forEach(site => {
  const ampPhaseMean = ampPhaseMeans.get(site.siteID);
  if (ampPhaseMean) {
    // Normalize ampPhaseMean.ampRatioMean before using the color scale
    const normalizedAmpRatioMean = (ampPhaseMean.ampRatioMean - minAmpRatioMean) / (maxAmpRatioMean - minAmpRatioMean);
    const markerColor = colorScale(normalizedAmpRatioMean);

    const radius = Math.abs(ampPhaseMean.phaseDiffMean) * 5; // Scale the radius
    const marker = L.circleMarker([site.lat, site.lon], {
      color: markerColor,
      fillColor: markerColor,
      fillOpacity: 0.95,
      radius: radius
    })
      //.bindPopup(`Site ID: ${site.siteID}`)
      .addTo(map);

    marker.bindPopup(`Site ID: ${site.siteID} <br> AmpRatio: ${ampPhaseMean.ampRatioMean.toFixed(2)} <br> PhaseDiff: ${Math.abs(ampPhaseMean.phaseDiffMean).toFixed(2)}`);
    marker.on('mouseover', function (e) {
      this.openPopup();
    });
    marker.on('mouseout', function (e) {
      this.closePopup();
    });
  }
});
```

<div class="grid grid-cols-4">
  <div class="card grid-colspan-3">
    ${div_map}
  </div>
</div>

---

## Plot hourly data

This is likely redundant with the time series clickable graph above.  
*Leaving in for now.*  
*Could add 2nd y-axis for airTemp so the lines are spread out more.*  

<div class="grid grid-cols-4"> 
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
    ${view(selectYdays)}
  </div>
</div>

```js
display(dtHOURFiltered)
```

```js
plotCurve(dtHOURFiltered)
```

*Could standardize air and water temperature so we can see variation in the water temperature and how it lines up or not with the air temperature*

---

## Datasets

Site data:
```js
display(VA_data)
```

---

Filtered water/air temp object:

```js
display(dtFiltered)
```

---

Filtered phase difference/amplitude ratio object:

```js
display(dtHOUR_ampPhase_Filtered)
```

---

Table of filtered data:

```js
Inputs.table(dtFiltered)
```

Parquet playground - ignore

```js
/*
Inputs.table(samples, {
  format: {
    date: (x) => new Date(x).toISOString().slice(0, 10)
  }
})
*/
const date = [];
const value = [];
const start = new Date("2022-01-01");
const end = new Date("2023-01-01");
for (let currentValue = 0, currentDate = start; currentDate < end; ) {
  date.push(currentDate);
  value.push(currentValue);
  (currentDate = new Date(currentDate)), currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  currentValue += Math.random() - 0.5;
}
display({date, value})
```

```js
//display(data)

```

```js
/*

//import * as Arrow from "apache-arrow";
import { Table, Schema, Field, Float32 } from "apache-arrow";

import * as Parquet from "parquet-wasm";
// Convert the JSON object to an array of objects if it's not already one
//const data = Array.isArray(dt) ? dt : [dt];

//const table = Arrow.Table.from(data);

// Generate a daily random walk as parallel arrays of {date, value}.

const data = {
  //siteID: dt.map(d => d.siteID),
  //dateTime: dt.map(d => d.dateTime),
  waterTemperature: dt.map(d => d.waterTemperature)
}

// Define the schema
const schema0 = new Arrow.Schema({
  fields: [
    //Arrow.Field.new({ name: 'siteID', type: new Arrow.Int32() }),
    //Arrow.Field.new({ name: 'dateTime', type: new Arrow.TimestampMillisecond() }),
    Arrow.Field.new({ name: 'waterTemperature', type: new Arrow.Float32() })
  ]
});

const schema = new Schema([
  //new Field('siteID', new Int32()),
  //new Field('dateTime', new TimestampMillisecond()),
  new Field('waterTemperature', new Float32())
]);

const table = Table.from([schema, data]);

// Output the Apache Arrow table as a Parquet table to standard out.
const parquetTable = Parquet.Table.fromIPCStream(Arrow.tableToIPC(table, "stream"));
const parquetBuilder = new Parquet.WriterPropertiesBuilder().setCompression(Parquet.Compression.ZSTD).build();
const parquetData = Parquet.writeParquet(parquetTable, parquetBuilder);


*/
```
