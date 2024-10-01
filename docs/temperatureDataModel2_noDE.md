---
toc: false
theme: dashboard
style: gridCustom.css
---

```js
import { plotTimeSeries, plotCurveHover, plotPhaseAmp, plotY1Y2, plotY1Y2Agg, plotX1Y1Agg } from "./components/modelledTemperatureDataPlots.js";
//import {interval} from 'https://observablehq.com/@mootari/range-slider';
import * as d3 from "npm:d3";

```

```js
import { df_metrics_all, df_predict_all, groupAndAggregate, legend2 } from "./components/modelledTemperatureVariables.js";
import { filterBySiteID_year_season, filterBySiteID_year, filterByYear } from "/components/rawTemperatureVariables.js";

import {VA_data} from "./components/rawTemperatureVariables.js";
```

**Steps**:  
1. **Select** `sites` and `years` &rarr;  
2. **View** time series plots &rarr;  
3. **Filter** by `k`, `p`, and `Tg` &rarr;  
4. **select** temporal aggregation level &rarr;  
5. **view** parameter pair plots &rarr;  
6. **view** map with sites coded by selected parameter values

---

```js
//display([dtPredictHovered, dtMetricsHovered, timeSeriesHover, groupSiteID])
```

```html
<div class="wrapper">
  <div class="card selectors"><h1><strong>Selectors</strong></h1>
    <div style="display: flex; flex-direction: column; align-items: flex-start; margin-top: 25px">
      <h2>Select sites:  </h2>
      ${selectSites}
    </div>
    <div style="display: flex; flex-direction: column; align-items: flex-start; margin-top: 25px">
      <h2>Select years:</h2>
      ${selectYears}
    </div>

    <hr>

    <div style="display: flex; flex-direction: column; align-items: flex-start; margin-top: 25px;">
      <h2>Select <strong>aggregation</strong> level:</h2>
      ${selectAggregator}
    </div>
 
    <hr>
  
    <div style="display: flex; flex-direction: column; align-items: flex-start;">
      <h2>Show <strong>filtered</strong> data:</h2>
      ${selectParamFilter}
    </div>

    <hr>

    <div style="display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 30px;">
      <strong>Variable 1</strong> (x in pairs plot)  
      <!--
      <div style="display: flex; flex-direction: column; align-items: flex-start; margin-top: 25px;">
        Select model: ${selectParamModY1} 
      </div>
      -->
      <div style="display: flex; flex-direction: column; align-items: flex-start; margin-top: 20px;">
        Select parameter: ${selectParamY1}
      </div>
    </div>
      
    <div style="display: flex; flex-direction: column; align-items: flex-start;">
      <strong>Variable 2</strong> (y in pairs plot)  
      <!--
      <div style="display: flex; flex-direction: column; align-items: flex-start; margin-top: 25px;">
        Select model: ${selectParamModY2} 
      </div>
      -->
      <div style="display: flex; flex-direction: column; align-items: flex-start; margin-top: 20px;">
        Select parameter: ${selectParamY2}
      </div>
    </div>

    <hr>
  </div>

  <div class="card r1c1">
    <h1><strong>Time series</strong></h1><br>
    Mouse over the time series chart below to see the hourly chart for the chosen site, year, and day of year.<br>    
    In the sub-daily graph, water temperature is a circle with site-specific color and a solid line and air temperature is the square symbol with the dotted line. Predictions are the smooth lines with associated r-square values for the moused-over site (air is grey).
    <div class="card" style="display: flex; align-items: center; margin-top: 10px">
      <div style="margin-left: 1px; margin-bottom: 1px; margin-top: 5px; margin-left: -40px">
        ${showWater} 
      </div>
      <div class="vertical-line"></div>
      <div style="margin-left: 1px; margin-bottom: 1px; margin-top: 5px; margin-left: -70px">
        ${showAir}
      </div>
      <div style="margin-left: 1px; margin-bottom: 1px; margin-top: 5px; margin-left: -50px">
        ${facetYearly}
      </div>
    </div>
    <div style="display: flex; flex-direction: column; align-items: center; margin-top: 20px;">
      ${plottedTimeSeries}
    </div>
  </div>
  <div class="card r1c2"><h1><strong>Sub-daily plot</strong></h1>
    <div class="card" style="margin-left: 20px; margin-bottom: 1px; margin-top: 20px; margin-left: 1px;">
      ${showAllHoverSites}
    </div>
    <div style="display: flex; flex-direction: column; align-items: center; margin-top: 40px;">
      ${plottedCurveHover}
    </div>
  </div>

  <div class="card r2c1">Two selected variables over day of year
    <div style="display: flex; flex-direction: column; align-items: center; margin-top: 30px;">
      ${plottedY1Y2Agg}
    </div>
  </div>
  <div class="card r2c2">Two selected variables against each other
    <div style="display: flex; flex-direction: column; align-items: center; margin-top: 30px;">
      ${plottedX1Y1Agg}
    </div>
  </div>

  <div class="card map"><h1><strong>Map</strong></h1><br>  
    Drag the range slider to select the value of the aggregation level to display on the map.  
    The values are the possible values of the selected aggregation level (e.g. 1-12 for `month` and 1-366 for `day of year`).  
    The first selected parameter is color, the second is radius.
    <div class="card" style="display: flex; align-items: center;">
      <div style="margin-left: 10px; margin-bottom: 1px; margin-top: 5px">
        ${legendColorScale} 
      </div>
      <div style="margin-left: 10px; margin-bottom: 1px; margin-top: 5px; margin-left: 150px;">
        ${selectAggValue}
      </div>
    </div>
    <div class="card", style="padding: 0; border: 2px solid darkgrey; border-radius: 2px;"> 
        ${div_mapMod}
    </div>
  </div>

  <div class="card filters">
    <h1><strong>Filters</strong>- could make this collapsable</h1><br>   
    We can get some unreasonable parameter estimates from the models. Use the silders below to filter the dataset to include only the filtered range of values in the graphs and map below.  
    For the parameters `k`, `p`, and `Tg`, the extent of the raw data is shown as `Extent of raw...`. The range sliders start with reasonable values, but the full or a more limited range can be selected. 
    
    <div class="">
      <div style="display: flex; flex-direction: column; align-items: flex-start; background-color: #fafafc" class="card">

      Extent of raw `k` = ${roundedKExtentSine[0]} to ${roundedKExtentSine[1]} for model `sine`  
      <!--
      Extent of raw `k` = ${roundedKExtentDe[0]} to ${roundedKExtentDe[1]} for model `de`
      -->

      <div style="display: flex; flex-direction: column; align-items: flex-start; background-color: #f7f5f2" class="card">
        ${selectMinK} 
        ${selectMaxK}
      </div>

      <!-- with model DE
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
      -->

      ${Plot.plot({
        color: {legend: true},
        height: 300,
        marks: [
          Plot.rectY(
            dtMetricsFiltered.filter(
              d => d.k >= selectedMinK && d.k <= selectedMaxK && d.model === "sine"
            ),
          Plot.binX({y: "count"}, {x: "k", fill: "model"})),
          Plot.ruleY([0]),
          Plot.axisX({fontSize: "12px"}),
          Plot.axisY({fontSize: "12px"})
        ]
        })
      }
      </div>
    </div>
    <div class="">
      <div style="display: flex; flex-direction: column; align-items: flex-start; background-color: #f2f0ed" class="card">
        Extent of raw `p` = ${roundedPExtent[0]} to ${roundedPExtent[1]}

        <div style="display: flex; flex-direction: column; align-items: flex-start; background-color: #f7f5f2" class="card">
          ${selectMinP} ${selectMaxP}
        </div>

        <!-- with DE model
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
        -->
          ${Plot.plot({
            color: {legend: true},
            height: 300,
            marks: [
              Plot.rectY(
                dtMetricsFiltered.filter(
                  d => d.p >= selectedMinP && d.p <= selectedMaxP && d.model === "sine"
                ),
            Plot.binX({y: "count"}, {x: "p", fill: "model"})),
            Plot.ruleY([0]),
            Plot.axisX({fontSize: "12px"}),
            Plot.axisY({fontSize: "12px"})
            ]
            })
          }
      </div>
    </div>
    <div class="">
      <div style="display: flex; flex-direction: column; align-items: flex-start; background-color: #f7f5f2" class="card">

      Extent of raw `Tg` = ${roundedTgExtent[0]} to ${roundedTgExtent[1]}

      <div style="display: flex; flex-direction: column; align-items: flex-start; background-color: #f7f5f2" class="card">
        ${selectMinTg} ${selectMaxTg}
      </div>

      <!-- with DE model
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
      -->

      ${Plot.plot({
        color: {legend: true},
        height: 300,
        marks: [
          Plot.rectY(
            dtMetricsFiltered.filter(
              d => d.Tg >= selectedMinTg && d.Tg <= selectedMaxTg && d.model === "sine"
            ),
          Plot.binX({y: "count"}, {x: "Tg", fill: "model"})),
          Plot.ruleY([0]),
          Plot.axisX({fontSize: "12px"}),
          Plot.axisY({fontSize: "12px"})
        ]
        })
      }
      </div>
    </div>
    <!--
    <div class="">
      <div style="display: flex; flex-direction: column; align-items: flex-start; background-color: #f7f5f2" class="card">

      Extent of raw `rSquared` = ${roundedR2Extent[0]} to ${roundedR2Extent[1]}. need to fix this

      <div style="display: flex; flex-direction: column; align-items: flex-start; background-color: #f7f5f2" class="card">
        ${selectMinR2} ${selectMaxR2}
      </div>

      ${Plot.plot({
        color: {legend: true},
        height: 300,
        marks: [
          Plot.rectY(
            dtMetricsFiltered.filter(
              d => d.rSquaredDE >= selectedMinR2 && d.rSquaredDE <= selectedMaxR2 
            ),
        Plot.binX({y: "count"}, {x: "rSquaredDE", fill: "model"})),
          Plot.ruleY([0])
        ]
        })
      }
      -->
      </div>
    </div>
  </div>
</div>
```

<!--
## Select sites and years
-->


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

const showAir = (Inputs.radio([true, false], {label: html `<div style="margin-left: 60px;">Show <br> Air Temp?</div>`, value: true}));
const selectedShowAir = Generators.input(showAir);

const showWater = (Inputs.radio([true, false], {label: html `<div style="margin-left: 50px;">Show<br>Water Temp?</div>`, value: true}));
const selectedShowWater = Generators.input(showWater);

const facetYearly = (Inputs.radio([true, false], {label: html `<div style="margin-left: 60px;">Facet <br> by year?</div>`, value: false}));
const selectedFacetYearly = Generators.input(facetYearly);

const sites = [...new Set(dtPredict.map(d => d.siteID))].sort();
const selectSites = Inputs.select(sites, {
  value: [sites[0]], // needs to be an array
  multiple: 8, width: 100});
const selectedSites = Generators.input(selectSites);

const years = [...new Set(dtPredict.map(d => d.year))].sort();
const selectYears = (Inputs.select(years, {value: [years[1]], multiple: true, width: 10}));
const selectedYears = Generators.input(selectYears);

const seasons = ["Spring", "Summer", "Autumn", "Winter"];//[...new Set(dt.map(d => d.season))];
const selectSeasons = (Inputs.select(seasons, {value: seasons, multiple: true, width: 80, label: "Select seasons"}));
const selectedSeasons = Generators.input(selectSeasons);

const showAllHoverSites = (Inputs.radio([true, false], {label: "Show all selected sites?", value: false}));
const selectedShowAllHoverSites = Generators.input(showAllHoverSites);
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

const selectMinR2 = (Inputs.range([r2Extent[0].toFixed(0), 0.99], {value: 0.01, step: 0.01, width: 300, label: "Select minimum `r2`"}));
const selectedMinR2 = Generators.input(selectMinR2);

const selectMaxR2 = (Inputs.range([0.01, 1.01], {value: 1, step: 0.01, width: 300, label: "Select maximum `r2`", transform: Math.log}));
const selectedMaxR2 = Generators.input(selectMaxR2);
```

<!--
## Plot raw data time series
-->

```js
const plottedTimeSeries = plotTimeSeries(dtPredictFiltered, groupSiteID, selectedShowWater, selectedShowAir, selectedFacetYearly, width);
```

```js
const timeSeriesHover = view(plottedTimeSeries);
```

```js
const dtPredictHovered = timeSeriesHover === null ?
  null :
    selectedShowAllHoverSites ?
    dtPredictFiltered.filter(d => 
      //d.siteID == timeSeriesHover.siteID && 
      d.year == timeSeriesHover.year && 
      d.yday == timeSeriesHover.yday
    ) :
      dtPredictFiltered.filter(d => 
      d.siteID == timeSeriesHover.siteID && 
      d.year == timeSeriesHover.year && 
      d.yday == timeSeriesHover.yday
    );
```

```js
const dtMetricsHovered = timeSeriesHover === null ?
  null :
  dtMetricsFiltered.filter(d => 
    d.siteID == timeSeriesHover.siteID && 
    d.year == timeSeriesHover.year && 
    d.yday == timeSeriesHover.yday
  );
```

```js
const plottedCurveHover = plotCurveHover(dtPredictHovered, dtMetricsHovered, timeSeriesHover, groupSiteID);
//display([dtPredictHovered, dtMetricsHovered, timeSeriesHover, groupSiteID])
```

<!--
and for the differential equation model (`de`) the line is dashed. There is no `de` model for air temperature.  
-->

<!--
## Filter on parameters
-->

```js
const dtMetricsFilteredByParams = dtMetricsFiltered.filter(
    d => 
      d.p >= selectedMinP && 
      d.p <= selectedMaxP && 
      d.k >= selectedMinK && 
      d.k <= selectedMaxK &&
      d.Tg >= selectedMinTg && 
      d.Tg <= selectedMaxTg //&&
      //d.rSquaredDE >= selectedMinR2 && 
      //d.rSquaredDE <= selectedMaxR2
  )
```

```js
//dtMetricsFilteredByParams
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

```js
const r2Extent = d3.extent(dtMetricsFiltered, d => d.rSquaredDE);
const roundedR2Extent = r2Extent.map(value => Number(value.toFixed(2)));
```

<!--
## Aggregation
Select the level of temporal aggregation for the plots and map below.
-->

```js
const aggregator = new Map([
  ["Year", "year"],
  ["Season", "seasonInt"],
  ["Month", "month"],
  ["Week", "week"],
  ["Day of year", "yday"]
]);
const selectAggregator = (Inputs.select(aggregator, {value: "yday", multiple: false, width: 100}));
const selectedAggregator = Generators.input(selectAggregator);
```

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

```js
const selectParamFilter = (Inputs.select([true, false], {value: [true], width: 50}));
const selectedParamFilter = Generators.input(selectParamFilter);
```

```js
const modelList = ["sine", "de"];

const selectParamModY1 = (Inputs.select(modelList, {value: [modelList[0]], width: 20}));
const selectedParamModY1 = Generators.input(selectParamModY1);

const selectParamModY2 = (Inputs.select(modelList, {value: [modelList[0]], width: 20}));
const selectedParamModY2 = Generators.input(selectParamModY2);
```

```js
const paramListDe = ["k", "p", "Tg", "airTemperature", "waterTemperature", "amplitudeRatio", "phaseLag", "meanOffset", "meanRatio"];
const paramListSine = ["k", "p", "Tg", "airTemperature", "waterTemperature", "amplitudeRatio", "phaseLag", "meanOffset", "meanRatio", "phaseAir", "phaseWater", "amplitudeAir", "amplitudeWater"];


const selectParamY1 = (Inputs.select(selectedParamModY1 === "sine" ? paramListSine : paramListDe, {value: "amplitudeRatio", width: 50}));
const selectedParamY1 = Generators.input(selectParamY1);

const selectParamY2 = (Inputs.select(selectedParamModY2 === "sine" ? paramListSine : paramListDe, {value: "phaseLag", width: 50}));
const selectedParamY2 = Generators.input(selectParamY2);
```

```js
const plottedY1Y2Agg = plotY1Y2Agg(
  selectedParamFilter ? dtMetricsFilteredByParamsAgg : dtMetricsFilteredAgg, 
  selectedParamY1, 
  selectedParamY2, 
  selectedParamModY1, 
  selectedParamModY2,
  selectedAggregator
)
```

```js
const plottedX1Y1Agg = plotX1Y1Agg(  
  selectedParamFilter ? dtMetricsFilteredByParamsAgg : dtMetricsFilteredAgg,  
  selectedParamY1, 
  selectedParamY2, 
  selectedParamModY1, 
  selectedParamModY2
)
```

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

const selectAggValue = (Inputs.range(d3.extent(aggList), {value: aggList[0], step: 1, width: 300, label: html`Select ${aggregatorText.get(selectedAggregator)} value`}));
const selectedAggValue = Generators.input(selectAggValue);
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


