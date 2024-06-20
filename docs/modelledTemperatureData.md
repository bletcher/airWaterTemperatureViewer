```js
import { plotTimeSeries, plotCurveHover, plotPhaseAmp, plotPhaseAmpXY, deParamsPKTimeSeries, deParamsTempTimeSeries } from "./components/modelledTemperatureDataPlots.js";
//import {interval} from 'https://observablehq.com/@mootari/range-slider';
import * as d3 from "npm:d3";
```

```js
import { df_metrics_SR, df_predict_SR } from "./components/modelledTemperatureVariables.js";
import { filterBySiteID_year_season, filterBySiteID_year } from "/components/rawTemperatureVariables.js";


```

<div class="grid grid-cols-4">
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
  value: "SR_01FL",//sites[0],
  //value: markersSelected, 
  multiple: 8, width: 100, label: "Select sites"});
const selectedSites = Generators.input(selectSites);

const years = [...new Set(dtPredict.map(d => d.year))].sort();
const selectYears = (Inputs.select(years, {value: years, multiple: true, width: 80, label: "Select years"}));
const selectedYears = Generators.input(selectYears);

const seasons = ["Spring", "Summer", "Autumn", "Winter"];//[...new Set(dt.map(d => d.season))];
const selectSeasons = (Inputs.select(seasons, {value: seasons, multiple: true, width: 80, label: "Select seasons"}));
const selectedSeasons = Generators.input(selectSeasons);

```


```js
sites
```
---

## Plot raw data time series

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

## Phase shift and amplitude
### sine model
```js
plotPhaseAmp(dtMetricsFiltered.filter(d => d.model === "sine"), groupSiteID)
```

### de model
```js
plotPhaseAmp(dtMetricsFiltered.filter(d => d.model === "de"), groupSiteID)
```

---

## Phase shift and amplitude XY plot
### sine model
```js
plotPhaseAmpXY(dtMetricsFiltered.filter(d => d.model === "sine"), groupSiteID)
```

### de model
```js
plotPhaseAmpXY(dtMetricsFiltered.filter(d => d.model === "de"), groupSiteID)
```


```js
```

dtMetricsFiltered
```js
dtMetricsFiltered
```

 ## Parameter time series


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
airTemperatureAverages
```


k
```js
Plot.plot({
  color: {legend: true},
  marks: [
    Plot.rectY(
      dtMetricsFiltered.filter(
        d => d.p >= 0 && d.p <= 1 && d.k >= 0 && d.k <= 50
      ), 
  Plot.binX({y: "count"}, {x: "k"})),
    Plot.ruleY([0])
  ]
})
```

p
```js
Plot.plot({
  color: {legend: true},
  marks: [
    Plot.rectY(
      dtMetricsFiltered.filter(
        d => d.p >= 0 && d.p <= 1 && d.k >= 0 && d.k <= 50
      ), 
  Plot.binX({y: "count"}, {x: "p"})),
    Plot.ruleY([0])
  ]
})
```

```js
deParamsPKTimeSeries(
  dtMetricsFiltered.filter(
    d => d.p >= 0 && d.p <= 1 && d.k >= 0 && d.k <= 50
  ), 
  airTemperatureAverages, 
  groupSiteID
)
```

Tg
```js
Plot.plot({
  color: {legend: true},
  marks: [
    Plot.rectY(
      dtMetricsFiltered.filter(
        d => d.Tg >= -10 && d.Tg <= 100 
      ), 
  Plot.binX({y: "count"}, {x: "Tg"})),
    Plot.ruleY([0])
  ]
})
```

```js
deParamsTempTimeSeries(
  dtMetricsFiltered.filter(
    d => d.Tg >= -10 && d.Tg <= 40 
  ), 
  d => d.k
)
```

p
```js
d3.extent(dtMetricsFiltered, d => d.p)
```

k
```js
d3.extent(dtMetricsFiltered, d => d.k)
```

k2
```js
d3.extent(dtMetricsFiltered.filter(
        d => d.p >= 0 && d.p <= 1 &&
        d.k >= -10 && d.k <= 10
      ), d => d.k)
```
      


airTemperatureAverages
```js
d3.extent(airTemperatureAverages, d => d.averageAirTemperature)
```

Tg
```js
d3.extent(dtMetricsFiltered.filter(d => d.Tg > -100 && d.Tg < 50), d => d.Tg)
```
