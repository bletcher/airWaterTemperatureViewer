```js
import {plotTimeSeries, plotAirWater, plotHexBin} from "./components/temperatureDataPlots.js";
//import {interval} from 'https://observablehq.com/@mootari/range-slider';
import * as d3 from "npm:d3";
import regression from 'regression';
```

```js
import {ampPhase, paramsPred, dtHour, get1to1Line, getBinWidth, getRegressions} from "./components/rawTemperatureVariables.js";
import {VA_data} from "./components/rawTemperatureVariables.js";
```

```js
//const tmp = FileAttachment("tmp.parquet").parquet();
```

```js
//tmp
```

**Steps**: aggregation level &rarr; filtering (`sites, years, seasons`) &rarr; raw data plots

Data can be aggregated across time scales ranging from the `raw data`, to `daily` (the default), to `annual`. All figures below will show data from the selected aggregation level. Aggregation here is simply calculating site-specific mean air and water temperatures for the selected aggregation level.  

---

## Data aggregation

<div class="grid grid-cols-4">
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
    ${selectAggregation}
  </div>
</div>

---

```js
const aggregation = new Map([
  // Putting Daily on top for now because that is the default. Not sure how to specify using value in Inputs.select() below
  ["Daily",    FileAttachment("./data/parquet/shen/dtDay-0.parquet").parquet()],
  ["Annual",   FileAttachment("./data/parquet/shen/dtYear-0.parquet").parquet()],
  ["Seasonal", FileAttachment("./data/parquet/shen/dtSeason-0.parquet").parquet()], 
  ["Monthly",  FileAttachment("./data/parquet/shen/dtMonth-0.parquet").parquet()], 
  ["Weekly",   FileAttachment("./data/parquet/shen/dtWeek-0.parquet").parquet()], 
  //["Daily",    FileAttachment("./data/parquet/shen/dtDay-0.parquet").parquet()],
  ["Hourly",   dtHour], //FileAttachment("./data/parquet/shen/dtHour-0.parquet").parquet()],
  ["Raw",      FileAttachment("./data/parquet/shen/dt-0.parquet").parquet()]
]);
const selectAggregation = Inputs.select(aggregation, {
  //value: , 
  multiple: false, 
  width: 100, 
  label: "Select data aggregation level"
});

const dtIn = Generators.input(selectAggregation);
```

```js
const dt = [...dtIn];
```

```js
//display(dtIn)
```

```js
//dt
```

```js
const initialSite = [...new Set(dt.map(d => d.siteID))].sort()[0];//"PA_01FL";
```

The dataset for exploration here is from Shenandoah National Park.  
During development of this application, the dataset is limited to three sites for each area ["PA_01FL", "PA_06FL", "PA_10FL", "PI_01FL", "PI_06FL", "PI_10FL", "SR_01FL", "SR_06FL", "SR_10FL"] to deal with large file sizes with the whole dataset.  
It will take a while for the dataset to load...  
Data are in **parquet files** for each aggregation level and are read in based on the aggregation level selector above.  

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

## Data filtering

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

const showAWLines = (Inputs.radio([true, false], {label: "Show grey lines?", value: true}));
const selectedShowAWLines = Generators.input(showAWLines);

const facetDaily = (Inputs.radio([true, false], {label: "Graph by day? [not yet implemented]", value: true}));
const selectedFacetDaily = Generators.input(facetDaily);

const facetYearly = (Inputs.radio([true, false], {label: "Facet by year?", value: false}));
const selectedFacetYearly = Generators.input(facetYearly);

const rAsCount = (Inputs.radio([true, false], {label: "Hexbin size = count?", value: false}));
const selectedRAsCount = Generators.input(rAsCount);

const rAsDischarge = (Inputs.radio([true, false], {label: "Show point size = discharge?", value: false}));
const selectedRAsDischarge = Generators.input(rAsDischarge);

const selectMaxR = (Inputs.range([5, 200], {value: 35, step: 1, width: 200, label: "Select maximum radius for discharge"}));
const selectedMaxR = Generators.input(selectMaxR);

/*
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
*/
```

```js
//////////////////////
// filtered objects //
//////////////////////

import { filterBySiteID_year, filterBySiteID_year_season, filterBySiteID_year_yday } from "/components/rawTemperatureVariables.js";

const dtFiltered = filterBySiteID_year_season(dt, selectedSites, selectedYears, selectedSeasons)
/*
const dtHOUR_ampPhase_Filtered = filterBySiteID_year_season(dtHOUR_ampPhase, selectedSites, selectedYears, selectedSeasons).filter(
  d => d.pMaxMax < selectedPValue &&
  d.rSquared_air > selectedRSAir &&
  d.rSquared_water > selectedRSWater &&
  Math.abs(d.phaseDiff) < selectedAbsMinMax 
)
*/
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

## Plot time series

<div class="grid grid-cols-2"> 
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
    ${showWater}
    ${showAir}
    ${facetYearly}
  </div>
</div>

```js
plotTimeSeries(dtFiltered, groupSiteID, selectedShowWater, selectedShowAir, selectedFacetYearly)
```

---

## Plot air vs water temperature
Black line is the 1:1 line. Dashed line is a linear regression, with indicated slope.  
Points that are circles have assosciated dischage values and crosses do not.

<div class="grid grid-cols-4">
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
      ${showAWLines}
      ${rAsDischarge} ${selectMaxR}
  </div>
</div>

```js
const lineData = get1to1Line(dtFiltered);
```

```js
  const regressionsAirWater = getRegressions(dtFiltered);
```

```js
plotAirWater(dtFiltered, regressionsAirWater, lineData, selectedShowAWLines, selectedRAsDischarge, selectedMaxR)
```

---

## Plot hexbin
Solid line is the 1:1 line and dashed line is the linear regression.

<div class="grid grid-cols-4">
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
    ${rAsCount}
  </div>
</div>


```js
const binWidthIn = getBinWidth(dtFiltered)
```

```js
plotHexBin(dtFiltered, lineData, binWidthIn, selectedRAsCount)
```

```js
dtFiltered
```

```js
dtFiltered.map(d => d.dischargeLog10)
//dtFiltered.map(d => [...new Set(d.dischargeLog10)])
```

```js
  const dischargeScale = d3.scaleLinear(
      d3.extent(dtFiltered, d => d.dischargeLog10),
      [3, 6]
  );
```

```js
dischargeScale(0)
```

```js

```

```js
```
