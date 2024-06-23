import { line, min } from "d3";
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";

export function plotTimeSeries(d, groupSiteID, showWater, showAir, selectedFacetYearly, {width} = {}) {
  //let clickedData = [];

  const colorScale = Plot.scale({
    color: {
      type: "categorical",
      domain: groupSiteID,
      unknown: "var(--theme-foreground-muted)"
    }
  });

  const tsPlot = Plot.plot({
    width,
    //width: 1800, // need to make this responsive ////////////////////////////////
    marginTop: 30,
    marginRight: 50,
    //color: {...d => colorScale.includes(d.siteID), legend: true},
    color: {...colorScale, legend: false},
    //x: {domain: selectedFacetYearly ? [0,366] : d3.extent(d => d.dateTime), label: "Day of year"},
    x: {
      type: "utc" // treat x-values as dates, not numbers
    },
    y: {label: "Temperature (C)"},
    marks: [
      Plot.line(d, 
        {
          x: selectedFacetYearly ? "ydayHMS" : "dateTime", 
          //y: showAir ? "airTemperature" : "null", 
          y: showAir ? "airTemperature" : "null", 
          sort: selectedFacetYearly ? "ydayHMS" : "dateTime", // gets rid of the line connecting the last point of the year to the first point of the next year
          stroke: "grey", 
          fy: selectedFacetYearly ? "year" : "null",
          fx: "siteID",
          tip: true
        }
      ),
        Plot.line(d, 
          {
            legend: true,
            x: selectedFacetYearly ? "ydayHMS" : "dateTime", 
            y: showWater ? "waterTemperature" : "null", 
            stroke: "siteID", 
            fy: selectedFacetYearly ? "year" : "null",
            fx: "siteID"
          }
        )
    ]
  });

  return tsPlot;
}

export function plotCurveHover(dInPredict, dInMetrics, timeSeriesHover, groupSiteID,  {width} = {}) {
 
  const rSquaredText = "r²";
  const colorScale = Plot.scale({
    color: {
      type: "categorical",
      domain: groupSiteID,
      unknown: "var(--theme-foreground-muted)"
    }
  });

  if (timeSeriesHover === null) {
    return Plot.plot({
      //title:  `Mouse over the time series chart above to see the hourly chart for the selected site, year, and day of year.`,
      title: "Mouse over the chart above.",
      width,
      marginTop: 30,
      marginRight: 50,
      x: {label: "Hour of the day"},
      y: {label: "Temperature (C)"},
      marks: []
    });
  } else {

    return Plot.plot({
      title:  `Site ID: ${timeSeriesHover.siteID}, Year: ${timeSeriesHover.year}, Yday: ${timeSeriesHover.yday}`,
      width,
      marginTop: 30,
      marginRight: 50,
      color: {...colorScale, legend: false},
      x: {label: "Hour of the day"},
      y: {label: "Temperature (C)"},
      marks: [
        Plot.frame({stroke: "lightgrey"}),
        Plot.dot(dInPredict, 
          {
            x: "hour", 
            y: "waterTemperature",
            r: 5,
            fill: "siteID",
            marker: "circle-stroke"
            //tip: true
          }
        ),
        Plot.line(dInPredict, 
          {
            x: "hour", 
            y: "waterTemperaturePredict_sine",
            stroke: "siteID",
            //marker: "circle-stroke"
          }
        ),
        Plot.line(dInPredict, 
          {
            x: "hour", 
            y: "waterTemperaturePredict_de",
            stroke: "siteID",
            strokeDasharray: "4 3",
            //marker: "circle-stroke"
          }
        ),

        Plot.dot(dInPredict, 
        {
          x: "hour", 
          y: "airTemperature",
          r: 5,
          fill: "darkgrey",
          marker: "circle-stroke"
          //tip: true
        }
      ),
      Plot.line(dInPredict, 
        {
          x: "hour", 
          y: "airTemperaturePredict_sine",
          stroke: "darkgrey",
          //marker: "circle-stroke"
        }
      ),
      Plot.line(dInPredict, 
        {
          x: "hour", 
          y: "airTemperaturePredict_de",
          stroke: "darkgrey",
          strokeDasharray: "4 3",
          //marker: "circle-stroke"
        }
      ),

      Plot.text(dInMetrics.filter(dd => dd.model === "sine"),
        Plot.selectLast({
          x: 24,//"hour", 
          y: "Tw_bar", 
          fill: "siteID",
          text: d => d.rSquared === null ? null : `sine: ${rSquaredText}= ${d.rSquared.toFixed(2)}`,  
          lineAnchor: "bottom", 
          dy: 0, dx: 12
        })
      ), 
      Plot.text(dInMetrics.filter(dd => dd.model === "de"),
        Plot.selectLast({
          x: 24,//"hour", 
          y: "Tw_bar", 
          fill: "siteID",
          text: d => d.rSquared === null ? null :  `de: ${rSquaredText}= ${d.rSquared.toFixed(2)}`,  
          lineAnchor: "bottom", 
          dy: 15, dx: 12
        })
      )
      ]
    });
  }
}

export function plotPhaseAmp(d, {width} = {}) {
  
  // for 2nd y-axis
  // https://observablehq.com/@observablehq/plot-dual-axis
  const v1 = (d) => d.amplitudeRatio;
  const v2 = (d) => d.phaseLag;
  const y2 = d3.scaleLinear(d3.extent(d, v2), d3.extent(d, v1));
  //const y2 = d3.scaleLinear(d3.extent(d, v2), [0, d3.max(d, v1)]);

  return Plot.plot({
    width,
    marginTop: 30,
    marginRight: 30,
    //color: {legend: true, label: "Day of year"},
    x: {label: "Day of year"},
    y: {axis: "left", label: "Amplitude"},
    marks: [
      Plot.frame({stroke: "lightgrey"}),
      Plot.dot(d,
        {
          x: "yday", 
          y: "amplitudeRatio", 
          stroke: "grey", 
          fy: "year",
          fx: "siteID",
          tip: true
        }
      ),

      Plot.axisY(y2.ticks(), 
        {
          color: "#870c10", 
          anchor: "right", 
          label: "Phase difference",
          y: y2, 
          tickFormat: y2.tickFormat()
        }
      ), 

      Plot.dot(d,
        Plot.mapY((D) => D.map(y2),  
          {
            x: "yday", 
            y: "phaseLag", 
            stroke: "#870c10",  
            fy: "year",
            fx: "siteID",
            tip: true
          }
      ))
    ]
  });
}

export function plotPhaseAmpXY(d, years, {width} = {}) {
  
  const colorScale = Plot.scale({
    color: {
      type: "categorical",
      domain: [...new Set(d.map(d => d.year))].sort(), //years,
      unknown: "var(--theme-foreground-muted)"
    }
  });

  return Plot.plot({
    width,
    marginTop: 30,
    marginRight: 70,
    color: {...colorScale, legend: true},
    x: {label: "Phase lag"},
    y: {axis: "left", label: "Amplitude ratio"},
    marks: [
      Plot.frame({stroke: "lightgrey"}),
      Plot.dot(d,
        {
          x: "phaseLag", 
          y: "amplitudeRatio", 
          stroke: "year", 
          fx: "model",
          fy: "siteID",
          tip: true
        }
      )
    ]
  });
}


function joinModelData(dIn, xVar, yVar, xMod, yMod) {
  // Step 1: Correctly Filter Data by Model
  const xModData = dIn.filter(d => d.model === xMod);
  const yModData = dIn.filter(d => d.model === yMod);

  // Step 2: Extract Unique Combinations (assuming unique in context of model)
  const uniqueCombinations = new Set();
  dIn.forEach(d => {
    const combo = `${d.siteID}-${d.year}-${d.yday}`;
    uniqueCombinations.add(combo);
  });

  // Step 3: Join Data
  const joinedData = [];
  uniqueCombinations.forEach(combo => {
    const [siteID, year, yday] = combo.split('-');
    const xRecord = xModData.find(d => d.siteID === siteID && d.year == year && d.yday == yday);
    const yRecord = yModData.find(d => d.siteID === siteID && d.year == year && d.yday == yday);

    if (xRecord && yRecord) {
      joinedData.push({
        siteID: siteID,
        year: year,
        yday: yday,
        x: xRecord[xVar], 
        y: yRecord[yVar]  
      });
    }
  });

  return joinedData;
}

export function plotX1Y1(dIn, xVar, yVar, xMod, yMod, {width} = {}) {
  
  //const xVarValues = dIn.filter(d => d.model === xMod).map(d => ({ x: d[xVar], year: d.year }));
  //const yVarValues = dIn.filter(d => d.model === yMod).map(d => d[yVar]);
  //const dXY = xVarValues.map((xObj, i) => ({ ...xObj, y: yVarValues[i] }));

  const dXY = joinModelData(dIn, xVar, yVar, xMod, yMod);

  console.log(dIn, dXY)

  const colorScale = Plot.scale({
    color: {
      type: "categorical",
      domain: [...new Set(dXY.map(d => d.year))].sort(), //years,
      unknown: "var(--theme-foreground-muted)"
    }
  });

  return Plot.plot({
    width,
    marginTop: 30,
    marginRight: 70,
    color: {...colorScale, legend: true},
    x: {label: xVar},
    y: {axis: "left", label: yVar},
    marks: [
      Plot.frame({stroke: "lightgrey"}),
      Plot.dot(dXY,
        {
          x: "x", 
          y: "y", 
          stroke: "year", 
          //fx: "model",
          fy: "siteID",
          tip: true
        }
      )
    ]
  });
}


export function plotY1Y2(d, y1Var, y2Var, y1Mod, y2Mod, {width} = {}) {
  
  const d1 = d.filter(d => d.model === y1Mod);
  const d2 = d.filter(d => d.model === y2Mod);

  // for 2nd y-axis
  // https://observablehq.com/@observablehq/plot-dual-axis
  const v1 = (d) => d[y1Var];
  const v2 = (d) => d[y2Var];
  const y2 = d3.scaleLinear(d3.extent(d2, v2), d3.extent(d1, v1));

//console.log(yMod1, d3.extent(d2, v2), d3.extent(d1, v1));

  return Plot.plot({
    width,
    marginTop: 30,
    marginRight: 30,
    //color: {legend: true, label: "Day of year"},
    x: {label: "Day of year"},
    y: {axis: "left", label: y1Var},
    marks: [
      Plot.frame({stroke: "lightgrey"}),
      Plot.dot(d1,
        {
          x: "yday", 
          y: y1Var, 
          stroke: "grey", 
          fy: "year",
          fx: "siteID",
          tip: true
        }
      ),

      Plot.axisY(y2.ticks(), 
        {
          color: "#870c10", 
          anchor: "right", 
          label: y2Var,
          y: y2, 
          tickFormat: y2.tickFormat()
        }
      ), 

      Plot.dot(d2,
        Plot.mapY((D) => D.map(y2),  
          {
            x: "yday", 
            y: y2Var, 
            stroke: "#870c10",  
            fy: "year",
            fx: "siteID",
            tip: true
          }
      ))
    ]
  });
}

export function deParamsPKTimeSeries(d, {width} = {}) {
  
  // for 2nd y-axis
  // https://observablehq.com/@observablehq/plot-dual-axis
  const v1 = (d) => d.p;
  const v2 = (d) => d.k;
  const y2 = d3.scaleLinear(d3.extent(d, v2), d3.extent(d, v1));
  //const y2 = d3.scaleLinear(d3.extent(d, v2), [0, d3.max(d, v1)]);

  return Plot.plot({
    width,
    marginTop: 30,
    marginRight: 40,
    //color: {legend: true, label: "Day of year"},
    x: {label: "Day of year"},
    y: {axis: "left", label: "Proportion groundwater"},
    marks: [
      Plot.frame({stroke: "lightgrey"}),
      Plot.line(d,
        {
          x: "yday", 
          y: "p", 
          sort: "yday",
          stroke: "red", 
          fy: "year",
          fx: "siteID",
          tip: true
        }
      ),
      
      // 2nd y-axis
      Plot.axisY(y2.ticks(), 
        {
          color: "#46a351", 
          anchor: "right", 
          label: "k",
          y: y2, 
          tickFormat: y2.tickFormat()
        }
      ), 
      Plot.line(d,
        Plot.mapY((D) => D.map(y2),  
          {
            x: "yday", 
            y: "k", 
            sort: "yday",
            stroke: "#46a351",  
            fy: "year",
            fx: "siteID",
            tip: true
          }
      ))
    ]
  });
}

export function deParamsTempTimeSeries(d, dAvg, {width} = {}) {
  
  return Plot.plot({
    width,
    marginTop: 30,
    marginRight: 40,
    //color: {legend: true, label: "Day of year"},
    x: {label: "Day of year"},
    y: {axis: "left", label: "Temperature (C)"},
    marks: [
      Plot.frame({stroke: "lightgrey"}),
      Plot.line(dAvg,
        {
          x: "yday", 
          y: "averageAirTemperature", 
          stroke: "blue", 
          fy: "year",
          fx: "siteID",
          tip: true
        }
      ),
      Plot.line(d,
        {
          x: "yday", 
          y: "Tg", 
          sort: "yday",
          stroke: "grey", 
          fy: "year",
          fx: "siteID",
          tip: true
        }
      ),
      
    ]
  });
}