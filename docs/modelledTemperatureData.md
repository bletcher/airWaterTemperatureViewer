```js
import { plotTimeSeries, plotCurveHover, plotPhaseAmp, plotY1Y2, plotX1Y1, plotPhaseAmpXY, deParamsPKTimeSeries, deParamsTempTimeSeries } from "./components/modelledTemperatureDataPlots.js";
//import {interval} from 'https://observablehq.com/@mootari/range-slider';
import * as d3 from "npm:d3";
```

```js
import { df_metrics_SR, df_predict_SR } from "./components/modelledTemperatureVariables.js";
import { filterBySiteID_year_season, filterBySiteID_year } from "/components/rawTemperatureVariables.js";


```

## Select sites and years

<div class="grid grid-cols-3">
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
    ${selectSites}
  </div>
  <div style="display: flex; flex-direction: column; align-items: flex-start;">
    ${selectYears}
  </div>
</div>

```js
const dtPredict = [...df_predict_SR];
const dtMetrics = [...df_metrics_SR];
```

```js
const dtPredictFiltered = filterBySiteID_year(dtPredict, selectedSites, selectedYears);
const dtMetricsFiltered = filterBySiteID_year(dtMetrics, selectedSites, selectedYears);
```

dtPredictFiltered
```js
dtPredictFiltered
```

dtMetricsFiltered
```js
dtMetricsFiltered
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
const selectMinP = (Inputs.range([pExtent[0].toFixed(0), 0], {value: 0, step: 0.01, width: 220, label: "Select minimum `p`"}));
const selectedMinP = Generators.input(selectMinP);

const selectMaxP = (Inputs.range([0, pExtent[1]], {value: 1, step: 0.01, width: 220, label: "Select maximum `p`"}));
const selectedMaxP = Generators.input(selectMaxP);

const selectMinK = (Inputs.range([kExtent[0].toFixed(0), 0], {value: -50, step: 1, width: 220, label: "Select minimum `k`"}));
const selectedMinK = Generators.input(selectMinK);

const selectMaxK = (Inputs.range([0, kExtent[1]], {value: 100, step: 1, width: 220, label: "Select maximum `k`", transform: Math.log}));
const selectedMaxK = Generators.input(selectMaxK);

const selectMinTg = (Inputs.range([TgExtent[0].toFixed(0), 0], {value: -3, step: 0.1, width: 220, label: "Select minimum `Tg`"}));
const selectedMinTg = Generators.input(selectMinTg);

const selectMaxTg = (Inputs.range([0, TgExtent[1]], {value: 22, step: 0.1, width: 220, label: "Select maximum `Tg`", transform: Math.log}));
const selectedMaxTg = Generators.input(selectMaxTg);
```

---

## Plot raw data time series

<div class="grid grid-cols-3"> 
  <div style="display: flex; flex-direction: column; align-items: flex-start;" class="card">
    ${showWater}
    ${showAir}
    ${facetYearly}
  </div>
</div>

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
```
In the graph above, the curve it for the sine model is the solid line and for the differential equation model (`de`) the lide is dashed. There is no `de` model for the air temperature.  
*Need to fix r2s. Check on values and add for air*

---

```js
```

dtMetricsFiltered
```js
dtMetricsFiltered
```

## Filter on parameters
For the parameters `k`, `p`, and `Tg`, the extent of the raw data is shown as `Extent of raw...` . The dataset for plotting below can be filtered by selecting the min/max parameter values. The range sliders start with reasonable values, but the full range can be selected.  
The time series graphs will be updated to show only the data within the selected range.

```js
const dtPredictGrouped = d3.groups(
  dtPredictFiltered, 
  d => d.siteID,
  d => d.year,
  d => d.yday
  );

const airTemperatureAverages = dtPredictGrouped.flatMap(([siteID, yearGroups]) => 
  yearGroups.flatMap(([year, ydayGroups]) => 
    ydayGroups.map(([yday, values]) => {
      const averageAirTemperature = d3.mean(values, d => d.airTemperature);
      return {siteID, year, yday, averageAirTemperature};
    })
  )
);

```

```js
//airTemperatureAverages
```

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
const kExtent = d3.extent(dtMetricsFiltered, d => d.k);
const roundedKExtent = kExtent.map(value => Number(value.toFixed(2)));
```

```js
const pExtent = d3.extent(dtMetricsFiltered, d => d.p);
const roundedPExtent = pExtent.map(value => Number(value.toFixed(2)));
```

<div class="grid grid-cols-2">
  <h2>k</h2><h2>p</h2>
</div>
<div class="grid grid-cols-2">
  <div style="display: flex; flex-direction: column; align-items: flex-start;" class="card">

  Extent of raw `k` = ${roundedKExtent[0]} to ${roundedKExtent[1]}

  ${selectMinK} ${selectMaxK}

  ${Plot.plot({
    color: {legend: true},
    height: 300,
    marks: [
      Plot.rectY(
        dtMetricsFiltered.filter(
          d => d.k >= selectedMinK && d.k <= selectedMaxK
        ),
    Plot.binX({y: "count"}, {x: "k"})),
      Plot.ruleY([0])
    ]
    })
  }
  </div>
<div style="display: flex; flex-direction: column; align-items: flex-start;" class="card">

  Extent of raw `p` = ${roundedPExtent[0]} to ${roundedPExtent[1]}

  ${selectMinP} ${selectMaxP}

  ${Plot.plot({
    color: {legend: true},
    height: 300,
    marks: [
      Plot.rectY(
        dtMetricsFiltered.filter(
          d => d.p >= selectedMinP && d.p <= selectedMaxP
        ),
    Plot.binX({y: "count"}, {x: "p"})),
      Plot.ruleY([0])
    ]
    })
  }
  </div>
</div>

```js
const TgExtent = d3.extent(dtMetricsFiltered, d => d.Tg);
const roundedTgExtent = TgExtent.map(value => Number(value.toFixed(2)));
```

<div class="grid grid-cols-2">
  <h2>Tg</h2>
</div>
<div class="grid grid-cols-2">
  <div style="display: flex; flex-direction: column; align-items: flex-start;" class="card">

  Extent of raw `Tg` = ${roundedTgExtent[0]} to ${roundedTgExtent[1]}

  ${selectMinTg} ${selectMaxTg}

  ${Plot.plot({
    color: {legend: true},
    height: 300,
    marks: [
      Plot.rectY(
        dtMetricsFiltered.filter(
          d => d.Tg >= selectedMinTg && d.Tg <= selectedMaxTg 
        ),
    Plot.binX({y: "count"}, {x: "Tg"})),
      Plot.ruleY([0])
    ]
    })
  }
  </div>
</div>

---

### Time series graphs for `Tg` and `average daily air temperature`
Predicted groundwater temperature in grey, observed air temperature in blue.  
*Need to add observend air and water temps to `dtMetricsFiltered`* and then include in the dropdown below and get rid of this graph.

```js
deParamsTempTimeSeries(
  dtMetricsFilteredByParams,
  airTemperatureAverages
)
```

---

## Plot pairs of parameters over day of year

```js
const selectParamFilter = (Inputs.select([true, false], {value: [true], width: 100, label: "Select if params are filtered as above"}));
const selectedParamFilter = Generators.input(selectParamFilter);
```

```js
const modelList = ["sine", "de"];

const selectParamModY1 = (Inputs.select(modelList, {value: [modelList[0]], width: 100, label: "Select model"}));
const selectedParamModY1 = Generators.input(selectParamModY1);

const selectParamModY2 = (Inputs.select(modelList, {value: [modelList[0]], width: 100, label: "Select model"}));
const selectedParamModY2 = Generators.input(selectParamModY2);
```

```js
const paramList = ["k", "p", "Tg", "Ta_bar", "Tw_bar", "amplitudeRatio", "phaseLag", "meanOffset", "meanRatio"];

const selectParamY1 = (Inputs.select(paramList, {value: [paramList[5]], width: 100, label: "Select parameter"}));
const selectedParamY1 = Generators.input(selectParamY1);

const selectParamY2 = (Inputs.select(paramList, {value: [paramList[6]], width: 100, label: "Select parameter"}));
const selectedParamY2 = Generators.input(selectParamY2);
```

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

```js
plotY1Y2(
  selectedParamFilter ? dtMetricsFilteredByParams : dtMetricsFiltered, 
  selectedParamY1, 
  selectedParamY2, 
  selectedParamModY1, 
  selectedParamModY2
)
```

---

## Plot the pairs of parameters against each other

```js
plotX1Y1(  
  selectedParamFilter ? dtMetricsFilteredByParams : dtMetricsFiltered,  
  selectedParamY1, 
  selectedParamY2, 
  selectedParamModY1, 
  selectedParamModY2
)
```
