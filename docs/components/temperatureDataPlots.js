import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";
import regression from 'regression';

export function plotAirWater(dIn, regressions, lineData, selectedShowAWLines, selectedRAsDischarge, selectedMaxR, {width} = {}) {

  const d = dIn.filter(dd => !isNaN(dd.airTemperature) && !isNaN(dd.waterTemperature))

  const minR = 4;

  const dischargeScale = d3.scaleLinear(
    d3.extent(d, d => d.dischargeLog10),
    [minR, selectedMaxR]
    //[3, 50]
  );
//console.log(selectedMaxR, dischargeScale(0))

  const colorScale = Plot.scale({
    color: {
      type: "cyclical",
      domain: [0, 366],
      range: ["#00f", "#e31010", "#1685f5"],
      unknown: "var(--theme-foreground-muted)"
    }
  });

  return Plot.plot({
    width,
    marginTop: 30,
    marginRight: 50,
    color: {...colorScale, legend: true, label: "Day of year"},
    //style: {
    //  backgroundColor: "lightgray",
    //},
    x: {label: "Air temperature (C)"},
    y: {label: "Water temperature (C)"},
    marks: [
      Plot.frame({stroke: "lightgrey"}),
      Plot.line(dIn, 
        {
          x: "airTemperature", 
          y: "waterTemperature", 
          stroke: selectedShowAWLines ? "lightgrey" : null,
          fy: "year",
          fx: "siteID",
          arrow: true
        }
      ),
      Plot.dot(dIn, 
        {
          x: "airTemperature", 
          y: "waterTemperature", 
          stroke: "yday",
          r: selectedRAsDischarge ?  
              ((dd) => isNaN(dd.dischargeLog10) ? minR : dischargeScale(dd.dischargeLog10)) : 
              minR,
          symbol: (dd) => isNaN(dd.dischargeLog10),
          fy: "year",
          fx: "siteID",
          tip: true
        }
      ),
      Plot.line(lineData, {x: "x", y: "y", stroke: "black"}), 
      Plot.linearRegressionY(d, 
        {
          x: "airTemperature", 
          y: "waterTemperature", 
          stroke: "black", 
          strokeDasharray: "7,7", 
          fy: "year",
          fx: "siteID",
          tip: false
        }
      ),
      Plot.text(regressions, 
        {
          text: d => `Slope: ${d.slope.toFixed(2)}`, // Format the slope to 2 decimal places
          frameAnchor: "top-left",
          dy: 20,
          dx: 15,
          fy: "year",
          fx: "siteID",
          fill: "black",
          fontSize: 14 - 0.15 * regressions.length
        }
      )
    ]
  });
}

export function plotHexBin(d, lineData, binWidthIn, selectedRAsCount, {width} = {}) {

  const pairs = d.filter(dd => !isNaN(dd.airTemperature) && !isNaN(dd.waterTemperature))
                 .map(dd => [dd.airTemperature, dd.waterTemperature]);
  const linReg = regression.linear(pairs);
  const slope = linReg.equation[0];
  const intercept = linReg.equation[1];
  const reg = [{slope, intercept}];

  return Plot.plot({
    width,
    marks: [
      Plot.hexgrid({binWidth: binWidthIn}),
      Plot.dot(d, 
        Plot.hexbin(
          {fill: "count", r: selectedRAsCount ? "count" : undefined}, 
          {x: "airTemperature", y: "waterTemperature", fill: "count", binWidth: binWidthIn}
        )
      ),
      Plot.line(lineData, {x: "x", y: "y", stroke: "black"}),
      Plot.linearRegressionY(d, 
        {
          x: "airTemperature", 
          y: "waterTemperature", 
          stroke: "black", 
          strokeDasharray: "7,7", 
          tip: false
        }
      ),
      Plot.text(reg, 
        {
          text: d => `Slope: ${d.slope.toFixed(2)}`, 
          frameAnchor: "top-left",
          dy: 30,
          dx: 30,
          fill: "black",
          fontSize: 16
        }
      ) 
    ]
  })
}

export function plotWaterDischarge(d, {width} = {}) {

  const colorScale = Plot.scale({
    color: {
      type: "cyclical",
      domain: [0, 366],
      unknown: "var(--theme-foreground-muted)"
    }
  });

  return Plot.plot({
    width,
    marginTop: 30,
    marginRight: 50,
    color: {...colorScale, legend: true, label: "Day of year"},
    x: {label: "Stream flow (cfs)"},
    y: {label: "Water temperature (C)"},
    marks: [
      Plot.dot(d, 
        {
          x: "discharge", 
          y: "waterTemperature", 
          stroke: "yday", 
          fy: "year",
          fx: "siteID",
          tip: true
        }
      )
    ]
  });
}

export function plotCurve(d, {width} = {}) {

  const colorScale = Plot.scale({
    color: {
      type: "cyclical",
      domain: [0, 366],
      range: ["#00f", "#e31010", "#1685f5"],
      unknown: "var(--theme-foreground-muted)"
    }
  });

  return Plot.plot({
    width,
    marginTop: 30,
    marginRight: 50,
    color: {...colorScale, legend: true, label: "Day of year"},
    x: {label: "Hour of the day"},
    y: {label: "Temperature (C)"},
    marks: [
      Plot.line(d, 
        {
          x: "hour", 
          y: "waterTemperature", 
          stroke: "yday", 
          fy: "year",
          fx: "siteID"
          //tip: true
        }
      ),
      Plot.line(d, 
        {
          x: "hour", 
          y: "airTemperature", 
          stroke: "yday",
          marker: "circle-stroke", 
          fy: "year",
          fx: "siteID",
          tip: true
        }
      )
    ]
  });
}

export function plotTimeSeries(d, groupSiteID, showWater, showAir, selectedFacetYearly, {width} = {}) {
  let clickedData = [];

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
          y: showAir ? "airTemperature" : "null", 
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

export function plotCurveHover(dIn, dInPred, timeSeriesHover, groupSiteID,  {width} = {}) {
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
        Plot.line(dIn, 
          {
            x: "hour", 
            y: "waterTemperature",
            stroke: "siteID",
            marker: "circle-stroke"
            //tip: true
          }
        ),
        Plot.line(dIn, 
          {
            x: "hour", 
            y: "airTemperature", 
            stroke: "darkgrey",
            marker: "circle-stroke",
            tip: true
          }
        ),
        Plot.line([...dInPred].filter(dd => dd.tempVar === "water"), 
          {
            x: "hour", 
            y: "predTemp",
            stroke: "siteID"
            //marker: "circle-stroke"
            //tip: true
          }
        ),
        Plot.line([...dInPred].filter(dd => dd.tempVar === "air"), 
        {
          x: "hour", 
          y: "predTemp",
          stroke: "darkgrey"
          //marker: "circle-stroke"
          //tip: true
        }
      ),
      Plot.text([...dInPred].filter(dd => dd.tempVar === "water"),
        Plot.selectLast({
          x: "hour", 
          y: "predTemp", 
          fill: "siteID",
          text: d => `${rSquaredText}: ${d.rSquared.toFixed(2)}`,  
          lineAnchor: "bottom", 
          dy: 0, dx: 22
        })
      ),
      Plot.text([...dInPred].filter(dd => dd.tempVar === "air"),
        Plot.selectLast({
          x: "hour", 
          y: "predTemp", 
          fill: "darkgrey",
          text: d => `${rSquaredText}: ${d.rSquared.toFixed(2)}`,  
          lineAnchor: "bottom", 
          dy: 0, dx: 22
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
  const v2 = (d) => d.phaseDiff;
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
            y: "phaseDiff", 
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
    x: {label: "Phase difference"},
    y: {axis: "left", label: "Amplitude"},
    marks: [
      Plot.frame({stroke: "lightgrey"}),
      Plot.dot(d,
        {
          x: "phaseDiff", 
          y: "amplitudeRatio", 
          stroke: "year", 
          //fy: "year",
          fy: "siteID",
          tip: true
        }
      )
    ]
  });
}