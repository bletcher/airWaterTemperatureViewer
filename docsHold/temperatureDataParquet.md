
```js
// This works, but seems less flexible that using db.query() and duckDB
/*
---
sql:
   dtSQL: ./data/parquet/shen/shen-0.parquet
---
*/
```

```js
import {plotTimeSeries, plotAirWater, plotWaterDischarge, plotCurve, plotCurveHover, plotPhaseAmp, plotPhaseAmpXY} from "./components/temperatureDataPlots.js";
//import {interval} from 'https://observablehq.com/@mootari/range-slider';
import * as d3 from "npm:d3";
```

```js
//import {dt, dtYDAY, dtYDAY_Week, dtYDAY_Month, dtHOUR, dtHOUR_ampPhase, dtHOUR_params_pred, samples} from "./components/variables.js";
//import {db} from "./components/variablesParquet.js"; 

import {VA_data} from "./components/variables.js";
```

```js
const dt = DuckDBClient.of({
  dt: FileAttachment("./data/parquet/shen/dt-0.parquet")
});
```

```js
const dtHOUR = DuckDBClient.of({
  dtHOUR: FileAttachment("./data/parquet/shen/dtHOUR-0.parquet")
});
```

```js
const params = DuckDBClient.of({
  params: FileAttachment("./data/parquet/shen/params-0.parquet")
});
```

```js
const paramsPred = DuckDBClient.of({
  paramsPred: FileAttachment("./data/parquet/shen/paramsPred-0.parquet")
});
```

```js
const dtCount0 = await dt.query(`SELECT COUNT() FROM dt`);
const dtCount = dtCount0.batches[0].data.children[0].values[0];
```

```js
const dtWaterCount0 = await dt.query(`SELECT COUNT(waterTemperature) FROM dt`);
const dtWaterCount = dtWaterCount0.batches[0].data.children[0].values[0];
```

```js
const dtAirCount0 = await dt.query(`SELECT COUNT(airTemperature) FROM dt`);
const dtAirCount = dtAirCount0.batches[0].data.children[0].values[0];
```

```js
//const dtCount10 = await db.query(`SELECT COUNT() FROM dt`).then(
//  dt => dt.map(d => d)
//);
```

```js
display(dtCount)
```


```js
/*
These sql code blocks also work for counting
```sql id = [{dtCountSQL}] echo = true
--SELECT COUNT(*) as dtCount FROM dtSQL
//```

```sql id = [{dtWaterCountSQL}]
--SELECT COUNT(waterTemperature) as dtWaterCount FROM dtSQL
//```

```sql id = [{dtAirCountSQL}]
--SELECT COUNT(airTemperature) as dtAirCount FROM dtSQL
//```

*/
```

The dataset for exploration here is from Shenandoah National Park.  
During development of this application, the dataset is limited to three sites for each area ["PA_01FL", "PA_06FL", "PA_10FL", "PI_01FL", "PI_06FL", "PI_10FL", "SR_01FL", "SR_06FL", "SR_10FL"] to deal with large file sizes with the whole dataset.  
It will take a while for the dataset to load...  
This page stores the data in **parquet files** and uses **duckDB** to reduce file sizes and run times.

## Raw data summary

<div class="grid grid-cols-4">
  <div class="card">
    <h2>Total number of observations</h2>
    <span class="big">${dtCount.toLocaleString("en-US")}</span>
  </div>
  <div class="card">
    <h2>Number of water temp observations</h2>
    <span class="big">${dtWaterCount.toLocaleString("en-US")}</span>
  </div>
    <div class="card">
    <h2>Number of air temp observations</h2>
    <span class="big">${dtAirCount.toLocaleString("en-US")}</span>
  </div>
</div>

---

### All data, first 5 rows

```js
Inputs.table(await dt.query(`SELECT * FROM dt LIMIT 5`), {
  format: {
    dateTime: (x) => new Date(x).toISOString()
  }
})
```

---

```sql id = sitesSQL 
  --SELECT DISTINCT(siteID) as sites FROM dtSQL
```

```sql id = yearsSQL 
  --SELECT DISTINCT(year) as years FROM dtSQL
```

```js
  const sites0 = await dt.query(`SELECT DISTINCT(siteID) FROM dt`);
  const sites = [...sites0].map(d => d.siteID).sort();
```

```js
const initialSite = sites[0];//"PA_01FL";
```

```js
  const years0 = await dt.query(`SELECT DISTINCT(year) FROM dt`);
  const years = [...years0].map(d => d.year)
```

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
      <span class="big">${[...dtFiltered].length.toLocaleString("en-US")}</span>
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

//const sites = [...new Set(dt.map(d => d.siteID))].sort();
const selectSites = Inputs.select(sites, {
  //value: sites[0],
  value: markersSelected, 
  multiple: 8, width: 150, label: "Select sites"});
const selectedSites = Generators.input(selectSites);

//const years = [...new Set(dt.map(d => d.year))].sort();
const selectYears = (Inputs.select(years, {value: years, multiple: true, width: 140, label: "Select years"}));
const selectedYears = Generators.input(selectYears);

const seasons = ["Spring", "Summer", "Autumn", "Winter"];//[...new Set(dt.map(d => d.season))];
const selectSeasons = (Inputs.select(seasons, {value: seasons, multiple: true, width: 80, label: "Select seasons"}));
const selectedSeasons = Generators.input(selectSeasons);
/*
const ydays = [...new Set(dt.map(d => d.yday))].sort((function(a, b) {
  return a - b;
}));
const selectYdays = (Inputs.select(ydays, {value: d3.range(1,366,60), multiple: true, width: 80, label: "Select day(s) of year"}));
const selectedYdays = Generators.input(selectYdays);
*/

const groupSiteID = sites;//[...new Set(dt.map(d => d.siteID))].sort() // for the colorScale

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

const aggregators = new Map([
  ["Annual", ['siteID', 'year']],
  ["Monthly", ['siteID', 'year', 'month']], 
  ["Weekly", ['siteID', 'year', 'week']], 
  ["Daily", ['siteID', 'year', 'yday']],
  ["Hourly", ['siteID', 'year', 'yday', 'hour']],
  ["None", []]
]);
const selectAggregators = (Inputs.select(aggregators, {value: "Daily", multiple: false, width: 90, label: "Select aggregation level"}));
const selectedAggregators = Generators.input(selectAggregators);
/*
const selectPValue = (Inputs.range([0.0001, 1], {value: 1, step: 0.01, width: 220, label: "Select minimum p-value of max(ABC)"}));
const selectedPValue = Generators.input(selectPValue);

const selectRSAir = (Inputs.range([0.01, 0.99], {value: 0.01, step: 0.01, width: 200, label: "Select minimum r-squared for air data fits"}));
const selectedRSAir = Generators.input(selectRSAir);

const selectRSWater = (Inputs.range([0.01, 0.99], {value: 0.01, step: 0.01, width: 200, label: "Select minimum r-squared for water data fits"}));
const selectedRSWater = Generators.input(selectRSWater);

const selectAbsMinMax = (Inputs.range([1, 25], {value: 25, step: 0.5, width: 200, label: "Select maximum absolute Phase Difference for plotting"}));
const selectedAbsMinMax = Generators.input(selectAbsMinMax);
*/
```

```js
const selectedSitesFormatted = selectedSites.map(d => `'${d}'`).join(', ');
const selectedSeasonsFormatted = selectedSeasons.map(d => `'${d}'`).join(', ');
```

```js
display(selectedSitesFormatted)
```

```js
async function filterDT(sitesIn, yearsIn, seasonsIn) {
return dt.query(`
    SELECT *
    FROM dt
    WHERE siteID IN (${sitesIn}) AND year IN (${yearsIn}) AND season IN (${seasonsIn})
  `);
}

const dtFiltered = await filterDT(selectedSitesFormatted, selectedYears, selectedSeasonsFormatted);
//db.register('dtFiltered', dtFiltered)
```

```js
[...dtFiltered]
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
let dtHOURPlot;
if (timeSeriesHover === null) {
   dtHOURPlot = await dtHOUR.query('SELECT * FROM dtHOUR LIMIT 1');
} else {
   dtHOURPlot = await dtHOUR.query(`
     SELECT * FROM dtHOUR
     WHERE siteID = ? AND year = ? AND yday = ?
  `, [timeSeriesHover.siteID, timeSeriesHover.year, timeSeriesHover.yday]);
}
```

```js
let paramsPredPlot;
if (timeSeriesHover === null) {
  paramsPredPlot = await paramsPred.query('SELECT * FROM paramsPred LIMIT 1');
} else {
  paramsPredPlot = await paramsPred.query(`
    SELECT * FROM paramsPred
    WHERE siteID = ? AND year = ? AND yday = ?
  `, [timeSeriesHover.siteID, timeSeriesHover.year, timeSeriesHover.yday]);
}
```

```js
plotCurveHover(dtHOURPlot, paramsPredPlot, timeSeriesHover, groupSiteID)
```

---

## Select level of data aggregation

<div class="grid grid-cols-4"> 
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
    ${selectAggregators}
  </div>
</div>

```js
display(selectedAggregators)
```

```js
async function aggregateDT(selectedAggregators) {
  if (selectedAggregators.length === 0) {
    const query = `
      SELECT *
      FROM dt
    `;
    return dt.query(query);
  } else {
    const groupByColumns = selectedAggregators.join(', ');
    const query = `
      SELECT ${groupByColumns}, AVG(airtemperature) as meanAirTemperature, AVG(watertemperature) as meanWaterTemperature
      FROM dt
      GROUP BY ${groupByColumns}
    `;
    return dt.query(query);
  }
}

const dtAggregated = await aggregateDT(selectedAggregators);
```

```js
[...dtAggregated]
```

---

## Plot air/water temperature

<div class="grid grid-cols-4"> 
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
    ${showAWLines}
  </div>
</div>

```js
//import { getAggregatedData } from "/components/variables.js";
//const aggregatedData = getAggregatedData(selectedAggregators, dtFiltered, dtYDAYFiltered, dtYDAY_Week_Filtered, dtYDAY_Month_Filtered)
```

```js
//plotAirWater(aggregatedData, selectedShowAWLines)
plotAirWater(dtAggregated, selectedShowAWLines)
```

`


---

