```js
import { plotTimeSeries, plotCurveHover, plotPhaseAmp } from "./components/modelledTemperatureDataPlots.js";
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
  //value: sites[0],
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

Need to fix r2s. Check on values and add for air

## Phase shift and amplitude
### sine model
```js
plotPhaseAmp(dtMetricsFiltered.filter(d => d.model === "sine"), groupSiteID)
```

### de model
```js
plotPhaseAmp(dtMetricsFiltered.filter(d => d.model === "de"), groupSiteID)
```

```js
```

dtMetricsFiltered
```js
dtMetricsFiltered
```
