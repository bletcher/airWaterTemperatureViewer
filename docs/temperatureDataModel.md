```js
import { plotTimeSeries, plotCurveHover, plotPhaseAmp, plotY1Y2, plotY1Y2Agg, plotX1Y1Agg } from "./components/modelledTemperatureDataPlots.js";
//import {interval} from 'https://observablehq.com/@mootari/range-slider';
import * as d3 from "npm:d3";

```

```js
import { df_metrics_all, df_predict_all, groupAndAggregate, legend2 } from "./components/modelledTemperatureVariables.js";
import { filterBySiteID_year_season, filterBySiteID_year } from "/components/rawTemperatureVariables.js";

import {VA_data} from "./components/rawTemperatureVariables.js";
```

**Steps**:  
1. **filter** by `sites` and `years` &rarr;  
2. **view** time series plots &rarr;  
3. **filter** by `k`, `p`, and `Tg` &rarr;  
4. **select** temporal aggregation level &rarr;  
5. **view** parameter pair plots &rarr;  
6. **view** map with sites coded by selected parameter values

---

## Select sites and years

```html
<div class="grid grid-cols-3">
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
    ${selectSites}
  </div>
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
    ${selectYears}
  </div>
</div>
```

```js
const dtPredict = [...df_predict_all];
const dtMetrics = [...df_metrics_all];
```

```js
const dtPredictFiltered = filterBySiteID_year(dtPredict, selectedSites, selectedYears);
const dtMetricsFiltered = filterBySiteID_year(dtMetrics, selectedSites, selectedYears);
```

```js
const groupSiteID = [...new Set(dtPredict.map(d => d.siteID))].sort() // for the colorScale

const showAir = (Inputs.radio([true, false], {label: "Show Air Temp?", value: true}));
const selectedShowAir = Generators.input(showAir);

const showWater = (Inputs.radio([true, false], {label: "Show Water Temp?", value: true}));
const selectedShowWater = Generators.input(showWater);

const facetYearly = (Inputs.radio([true, false], {label: "Facet by year?", value: false}));
const selectedFacetYearly = Generators.input(facetYearly);

const sites = [...new Set(dtPredict.map(d => d.siteID))].sort();
const selectSites = Inputs.select(sites, {
  value: [sites[0]], // needs to be an array
  multiple: 8, width: 100, label: "Select sites:"});
const selectedSites = Generators.input(selectSites);

const years = [...new Set(dtPredict.map(d => d.year))].sort();
const selectYears = (Inputs.select(years, {value: [years[1]], multiple: true, width: 80, label: "Select years:"}));
const selectedYears = Generators.input(selectYears);

const seasons = ["Spring", "Summer", "Autumn", "Winter"];//[...new Set(dt.map(d => d.season))];
const selectSeasons = (Inputs.select(seasons, {value: seasons, multiple: true, width: 80, label: "Select seasons"}));
const selectedSeasons = Generators.input(selectSeasons);
```

```js
//// min/max selectors for k, p, Tg
const selectMinP = (Inputs.range([pExtent[0].toFixed(0), 0], {value: 0, step: 0.01, width: 300, label: "Select minimum `p`"}));
const selectedMinP = Generators.input(selectMinP);

const selectMaxP = (Inputs.range([0, pExtent[1]], {value: 1, step: 0.01, width: 300, label: "Select maximum `p`"}));
const selectedMaxP = Generators.input(selectMaxP);

const selectMinK = (Inputs.range([kExtentSine[0].toFixed(0), 0], {value: -50, step: 1, width: 300, label: "Select min `k` - sine"}));
const selectedMinK = Generators.input(selectMinK);

const selectMaxK = (Inputs.range([0, kExtentSine[1]], {value: 100, step: 1, width: 300, label: "Select max `k`  - sine", transform: Math.log}));
const selectedMaxK = Generators.input(selectMaxK);

const selectMinTg = (Inputs.range([TgExtent[0].toFixed(0), 0], {value: -3, step: 0.1, width: 300, label: "Select minimum `Tg`"}));
const selectedMinTg = Generators.input(selectMinTg);

const selectMaxTg = (Inputs.range([0, TgExtent[1]], {value: 22, step: 0.1, width: 300, label: "Select maximum `Tg`", transform: Math.log}));
const selectedMaxTg = Generators.input(selectMaxTg);
```

---

## Plot raw data time series

```html
<div class="grid grid-cols-3"> 
  <div style="display: flex; flex-direction: column; align-items: flex-start; background-color: #fafafc;" class="card">
    ${showWater}
    ${showAir}
    ${facetYearly}
  </div>
</div>
```

Mouse over the time series chart below to see the hourly chart for the chosen site, year, and day of year.  
In the sub-daily graph, water temperature is in site-specific color and air temperature is grey. Predictions are the smooth lines.

```js
const timeSeriesHover = view(plotTimeSeries(dtPredictFiltered, groupSiteID, selectedShowWater, selectedShowAir, selectedFacetYearly));
```

```js
const dtPredictHovered = timeSeriesHover === null ?
  null :
  dtPredictFiltered.filter(d => d.siteID == timeSeriesHover.siteID && d.year == timeSeriesHover.year && d.yday == timeSeriesHover.yday);
```

```js
const dtMetricsHovered = timeSeriesHover === null ?
  null :
  dtMetricsFiltered.filter(d => d.siteID == timeSeriesHover.siteID && d.year == timeSeriesHover.year && d.yday == timeSeriesHover.yday);
```

```js
plotCurveHover(dtPredictHovered, dtMetricsHovered, timeSeriesHover, groupSiteID)
//display([dtPredictHovered, dtMetricsHovered, timeSeriesHover, groupSiteID])
```

In the graph above, the curve it for the `sine` model is the solid line and for the differential equation model (`de`) the line is dashed. There is no `de` model for air temperature.  

---

## Filter on parameters
We can get some unreaasonable parameter estimates from the models. Use the silders below to filter the dataset to include only the filtered range of values in the graphs and map below.  
For the parameters `k`, `p`, and `Tg`, the extent of the raw data is shown as `Extent of raw...` . The range sliders start with reasonable values, but the full or a more limited range can be selected.  

```js
const dtMetricsFilteredByParams = dtMetricsFiltered.filter(
    d => 
      d.p >= selectedMinP && 
      d.p <= selectedMaxP && 
      d.k >= selectedMinK && 
      d.k <= selectedMaxK &&
      d.Tg >= selectedMinTg && 
      d.Tg <= selectedMaxTg
  )
```

```js
const kExtentSine = d3.extent(dtMetricsFiltered.filter(d => d.model === "sine"), d => d.k);
const roundedKExtentSine = kExtentSine.map(d => Number(d.toFixed(2)));

const kExtentDe = d3.extent(dtMetricsFiltered.filter(d => d.model === "de"), d => d.k);
const roundedKExtentDe = kExtentDe.map(d => Number(d.toFixed(2)));
```

```js
const pExtent = d3.extent(dtMetricsFiltered, d => d.p);
const roundedPExtent = pExtent.map(value => Number(value.toFixed(2)));
```

```js
const TgExtent = d3.extent(dtMetricsFiltered, d => d.Tg);
const roundedTgExtent = TgExtent.map(value => Number(value.toFixed(2)));
```

```html
<div class="grid grid-cols-2">
  <h2>k</h2><h2>p</h2>
</div>
<div class="grid grid-cols-2">
  <div style="display: flex; flex-direction: column; align-items: flex-start; background-color: #fafafc" class="card">

  Extent of raw `k` = ${roundedKExtentSine[0]} to ${roundedKExtentSine[1]} for model `sine`  
  Extent of raw `k` = ${roundedKExtentDe[0]} to ${roundedKExtentDe[1]} for model `de`

  <div style="display: flex; flex-direction: column; align-items: flex-start; background-color: #f7f5f2" class="card">
    ${selectMinK} ${selectMaxK}
  </div>

  ${Plot.plot({
    color: {legend: true},
    height: 300,
    marks: [
      Plot.rectY(
        dtMetricsFiltered.filter(
          d => d.k >= selectedMinK && d.k <= selectedMaxK
        ),
    Plot.binX({y: "count"}, {x: "k", fill: "model"})),
      Plot.ruleY([0])
    ]
    })
  }
  </div>
<div style="display: flex; flex-direction: column; align-items: flex-start; background-color: #f2f0ed" class="card">

  Extent of raw `p` = ${roundedPExtent[0]} to ${roundedPExtent[1]}

  <div style="display: flex; flex-direction: column; align-items: flex-start; background-color: #f7f5f2" class="card">
    ${selectMinP} ${selectMaxP}
  </div>

  ${Plot.plot({
    color: {legend: true},
    height: 300,
    marks: [
      Plot.rectY(
        dtMetricsFiltered.filter(
          d => d.p >= selectedMinP && d.p <= selectedMaxP
        ),
    Plot.binX({y: "count"}, {x: "p", fill: "model"})),
      Plot.ruleY([0])
    ]
    })
  }
  </div>
</div>

<div class="grid grid-cols-2">
  <h2>Tg</h2>
</div>
<div class="grid grid-cols-2">
  <div style="display: flex; flex-direction: column; align-items: flex-start; background-color: #f7f5f2" class="card">

  Extent of raw `Tg` = ${roundedTgExtent[0]} to ${roundedTgExtent[1]}

  <div style="display: flex; flex-direction: column; align-items: flex-start; background-color: #f7f5f2" class="card">
    ${selectMinTg} ${selectMaxTg}
  </div>

  ${Plot.plot({
    color: {legend: true},
    height: 300,
    marks: [
      Plot.rectY(
        dtMetricsFiltered.filter(
          d => d.Tg >= selectedMinTg && d.Tg <= selectedMaxTg 
        ),
    Plot.binX({y: "count"}, {x: "Tg", fill: "model"})),
      Plot.ruleY([0])
    ]
    })
  }
  </div>
</div>
```

*add r2 panel*

---

## Aggregation
Select the level of temporal aggregation for the plots and map below.

```js
const aggregator = new Map([
  ["Year", "year"],
  ["Season", "seasonInt"],
  ["Month", "month"],
  ["Week", "week"],
  ["Day of year", "yday"]
]);
const selectAggregator = (Inputs.select(aggregator, {value: "yday", multiple: false, width: 110, label: "Select aggregation level"}));
const selectedAggregator = Generators.input(selectAggregator);
```

<div class="grid grid-cols-3"> 
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
    ${selectAggregator}
  </div>
</div>

```js

const dtMetricsFilteredByParamsAgg = groupAndAggregate(
  dtMetricsFilteredByParams, // Dataset
  paramListSine, // Parameters to aggregate
  selectedAggregator, // selectedAggregator
  d3.mean, //aggregation function
  'siteID', 'year', 'model',  // Default grouping variables
);

const dtMetricsFilteredAgg = groupAndAggregate(
  dtMetricsFiltered, // Dataset
  paramListSine, // Parameters to aggregate
  selectedAggregator, // selectedAggregator
  d3.mean, //aggregation function
  'siteID', 'year', 'model',  // Default grouping variables
);
```

---


```js
const selectParamFilter = (Inputs.select([true, false], {value: [true], width: 100, label: "Show filtered data?"}));
const selectedParamFilter = Generators.input(selectParamFilter);
```

```js
const modelList = ["sine", "de"];

const selectParamModY1 = (Inputs.select(modelList, {value: [modelList[0]], width: 60, label: "Select model"}));
const selectedParamModY1 = Generators.input(selectParamModY1);

const selectParamModY2 = (Inputs.select(modelList, {value: [modelList[0]], width: 60, label: "Select model"}));
const selectedParamModY2 = Generators.input(selectParamModY2);
```

```js
const paramListDe = ["k", "p", "Tg", "airTemperature", "waterTemperature", "amplitudeRatio", "phaseLag", "meanOffset", "meanRatio"];
const paramListSine = ["k", "p", "Tg", "airTemperature", "waterTemperature", "amplitudeRatio", "phaseLag", "meanOffset", "meanRatio", "phaseAir", "phaseWater", "amplitudeAir", "amplitudeWater"];


const selectParamY1 = (Inputs.select(selectedParamModY1 === "sine" ? paramListSine : paramListDe, {value: "amplitudeRatio", width: 125, label: "Select parameter"}));
const selectedParamY1 = Generators.input(selectParamY1);

const selectParamY2 = (Inputs.select(selectedParamModY2 === "sine" ? paramListSine : paramListDe, {value: "phaseLag", width: 120, label: "Select parameter"}));
const selectedParamY2 = Generators.input(selectParamY2);
```

## Select parameters for plotting
Select the model (`sine` or `de`) and the two parameters to plot below in the graphs and on the map.

```html
<div class="grid grid-cols-3"> 
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
    ${selectParamFilter}
  </div>
</div>

<div class="grid grid-cols-3"> 
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
    Variable 1 (x in pairs plot)
    ${selectParamModY1} ${selectParamY1}
  </div>
    <div style="display: flex; flex-direction: column; align-items: flex-start;">
    Variable 2 (y in pairs plot)
    ${selectParamModY2} ${selectParamY2}
  </div>
</div>
```

---

## Plot pairs of parameters over day of year
*Could put these graphs next to each other*

```js
plotY1Y2Agg(
  selectedParamFilter ? dtMetricsFilteredByParamsAgg : dtMetricsFilteredAgg, 
  selectedParamY1, 
  selectedParamY2, 
  selectedParamModY1, 
  selectedParamModY2,
  selectedAggregator
)
```

---

## Plot the pairs of parameters against each other

```js
plotX1Y1Agg(  
  selectedParamFilter ? dtMetricsFilteredByParamsAgg : dtMetricsFilteredAgg,  
  selectedParamY1, 
  selectedParamY2, 
  selectedParamModY1, 
  selectedParamModY2
)
```

---

## Dynamic sites map
Drag the range slider to select the value of the aggregation level to display on the map.  
The values are the possible values of the selected aggregation level (e.g. 1-12 for `month` and 1-366 for `day of year`).  
The first selected parameter is color, the second is radius.

```js
const aggregatorText = new Map([
  ["year", "yearly"],
  ["season", "seasonal"],
  ["month", "monthly"],
  ["week", "weekly"],
  ["yday", "daily"]
]);
```

```js
const aggList = dtMetricsFilteredByParamsAgg.map(d => d.selectedAggregatorValue);

const selectAggValue = (Inputs.range(d3.extent(aggList), {value: aggList[0], step: 1, width: 500, label: html`Select ${aggregatorText.get(selectedAggregator)} value`}));
const selectedAggValue = Generators.input(selectAggValue);
```

```html
<div class="grid grid-cols-2"> 
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
    ${selectAggValue}
  </div>
</div>
```

```js
const dtForMap = dtMetricsFilteredByParamsAgg.filter(d => d.selectedAggregatorValue === selectedAggValue);
```

```js
/////////
// Map //
/////////
import { baseMap, getMarkerData, updateMarkersMapMod, colorScale } from "./components/mapVariablesModel.js";
```

```js
  const lat = 38.5;
  const lon = -78.0;
  const mag = 9.2;

  const div_mapMod = display(document.createElement("div"));
  div_mapMod.style = "height: 500px;";

  const mapMod = L.map(div_mapMod)
    .setView([lat, lon], mag);

  L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',   
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }
  )
  .addTo(mapMod);

  L.control.layers(baseMap).addTo(mapMod);
  baseMap.USGS_hydro.addTo(mapMod);

  // Store the initial map view
  const initialView = mapMod.getBounds();

  // Update the map view when the window is resized
  window.addEventListener('resize', function() {
    mapMod.fitBounds(initialView);
  });
```

```js
const allDataAggExtent = groupAndAggregate(
  dtMetricsFilteredByParams, // Dataset
  paramListSine, // Parameters to aggregate - sine has all the parameters
  null, // selectedAggregator
  d3.extent, // aggregation function - note this returns an array
  'siteID'  // Default grouping variables
);
```

```js
const markerDataVar1 = getMarkerData(
  dtForMap.filter(d => d.model === selectedParamModY1), 
  selectedParamY1,
  groupAndAggregate,
  d3.mean
).map(d => ({ ...d, stat: "mean" }));

const markerDataVar2 = getMarkerData(
  dtForMap.filter(d => d.model === selectedParamModY2), 
  selectedParamY2,
  groupAndAggregate,
  d3.mean
).map(d => ({ ...d, stat: "mean" }));
```

```js
updateMarkersMapMod(markersLayer, VA_data, markerDataVar1, markerDataVar2, selectedParamY1, selectedParamY2, selectedSites, allDataAggExtent, colorScale);
```

```js
////////////////////////////////////////////////////////
// Event listener for selectAggValue dropdown updates //
////////////////////////////////////////////////////////
selectAggValue.addEventListener('input', function() {
  updateMarkersMapMod(markersLayer, VA_data, markerDataVar1, markerDataVar2, selectedParamY1, selectedParamY2, selectedSites, allDataAggExtent, colorScale);
});
```

```js
const markersLayer = L.layerGroup().addTo(mapMod);
```

```js
const legendColorScale = legend2(colorScale, {
  title: selectedParamY1,
  tickFormat: ".0%"
});
```

```html
<div class="card grid grid-cols-4" style="display: flex; flex-direction: column; gap: 1rem; max-width: 900px;">
  <div class="grid grid-colspan-3" style="margin-left: 10px; margin-bottom: 1px; margin-top: 5px">
    ${legendColorScale}
  </div>
  <div class="card", style="padding: 0; border: 2px solid darkgrey; border-radius: 2px;"> 
      ${div_mapMod}
  </div>  
</div>
```
