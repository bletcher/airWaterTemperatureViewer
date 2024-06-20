import {FileAttachment} from "npm:@observablehq/stdlib";
//import {DuckDBClient} from "npm:@observablehq/duckdb";
import * as d3 from "npm:d3";
import regression from 'regression';

/*
export const dt = await FileAttachment("../data/dt.csv").csv({typed: true});
export const dtYDAY = await FileAttachment("../data/dtYDAY.csv").csv({typed: true});
export const dtYDAY_Week = await FileAttachment("../data/dtYDAY_Week.csv").csv({typed: true});
export const dtYDAY_Month = await FileAttachment("../data/dtYDAY_Month.csv").csv({typed: true});
*/
export const dtHour = await FileAttachment("../data/parquet/shen/dtHour-0.parquet").parquet();
export const ampPhase = await FileAttachment("../data/parquet/shen/ampPhase-0.parquet").parquet();
export const paramsPred = await FileAttachment("../data/parquet/shen/paramsPred-0.parquet").parquet();


//export const dtHOUR_ampPhase = await FileAttachment("../data/dtHOUR_ampPhase.csv").csv({typed: true});
//export const dtHOUR_params_pred = await FileAttachment("../data/dtHOUR_params_pred.csv").csv({typed: true});

export const VA_data = await FileAttachment("../data/VA_site_info_DL.csv").csv({typed: true});

//export const samples = FileAttachment("../data/samples.parquet").parquet();
//export const dtPQ = FileAttachment("../data/dtPQ.parquet").parquet();

export function filterBySiteID_year_season(d, selectedSites, selectedYears, selectedSeasons) {
  return d.filter(d => 
    selectedSites.includes(d.siteID) && 
    selectedYears.includes(d.year) && 
    selectedSeasons.includes(d.season)
  );
} 

export function filterBySiteID_year_yday(d, selectedSites, selectedYears, selectedYdays) {
  return d.filter(d => 
    selectedSites.includes(d.siteID) && 
    selectedYears.includes(d.year) &&
    selectedYdays.includes(d.yday)
  );
}

export function filterBySiteID_year(d, selectedSites, selectedYears) {
  return d.filter(d => 
    selectedSites.includes(d.siteID) && 
    selectedYears.includes(d.year)
  );
}

export function get1to1Line(dt) {
  const rangeX = d3.extent(dt.map(d => d.airTemperature));
  const rangeY = d3.extent(dt.map(d => d.waterTemperature));
  const rangeLine = [Math.max(rangeX[0], rangeY[0]), Math.min(rangeX[1], rangeY[1])];
  const lineData = rangeLine.map(value => ({x: value, y: value}));
  return lineData;
}

export function getBinWidth(dt) {
  const len = dt.length;
  let binWidthIn;
  
  if (len < 100) {
      binWidthIn = 30;
  } else if (len > 100 && len < 10000) {
      binWidthIn = 10 - len * 0.0001;
  } else if (len > 10000) {
      binWidthIn = 4;
  }
  return binWidthIn;
}

export function getAggregatedData(selectedAggregators, dtFiltered, dtYDAYFiltered, dtYDAY_Week_Filtered, dtYDAY_Month_Filtered) {
  let aggregatedData;
  if(selectedAggregators === "Monthly") {
     aggregatedData = dtYDAY_Month_Filtered;
  } else if (selectedAggregators === "Weekly") {
     aggregatedData = dtYDAY_Week_Filtered;
  } else if (selectedAggregators === "Daily") {
     aggregatedData = dtYDAYFiltered;
  } else if (selectedAggregators === "15 Minute") {
     aggregatedData = dtFiltered;
  }
  
  aggregatedData = aggregatedData.map(d => {
    if (d.dischargeLog10 === "NA") {
      d.dischargeLog10 = null;
    }
    return d;
  });

  return aggregatedData;
}

export function getRegressions(dIn) {
  const d = dIn.filter(dd => !isNaN(dd.airTemperature) && !isNaN(dd.waterTemperature))
  const groupedData = d3.group(d, d => d.siteID, d => d.year);

  // Calculate a separate regression for each group
  const regressions = Array.from(groupedData, ([siteID, years]) => {
    return Array.from(years, ([year, data]) => {
      const pairs = data.filter(d => !isNaN(d.airTemperature) && !isNaN(d.waterTemperature))
                        .map(d => [d.airTemperature, d.waterTemperature]);
      const linReg = regression.linear(pairs)
      const slope = linReg.equation[0];
      const intercept = linReg.equation[1];

      return {
        siteID,
        year,
        slope,
        intercept
      };
    });
  }).flat();

  return regressions;
}
