import { line } from "d3";
import * as Plot from "npm:@observablehq/plot";
import * as d3 from "npm:d3";

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
          //y: showAir ? "airTemperature" : "null", 
          y: showAir ? "airTemperature" : "null", 
          stroke: "grey", 
          fy: selectedFacetYearly ? "year" : "null",
          fx: "siteID",
          tip: true
        }
      ), /*
      Plot.line(d, 
        {
          legend: true,
          x: selectedFacetYearly ? "ydayHMS" : "dateTime", 
          y: showWater ? "waterTemperature" : "null", 
          stroke: "siteID", 
          fy: selectedFacetYearly ? "year" : "null",
          fx: "siteID"
        }
      ) */
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
          text: d => `sine: ${rSquaredText}= ${d.rSquared.toFixed(2)}`,  
          lineAnchor: "bottom", 
          dy: 0, dx: 12
        })
      ), 
      Plot.text(dInMetrics.filter(dd => dd.model === "de"),
        Plot.selectLast({
          x: 24,//"hour", 
          y: "Tw_bar", 
          fill: "siteID",
          text: d => `de: ${rSquaredText}= ${d.rSquared.toFixed(2)}`,  
          lineAnchor: "bottom", 
          dy: 15, dx: 12
        })
      )
      ]
    });
  }
}

