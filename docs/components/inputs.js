// This is on pause, as I don't know how to import Inputs
/*
import * as Inputs from "npm:@observablehq/inputs";
//import { Generators } from "@observablehq/runtime"; doesn't wokr

export function getInputs(dt) {

 const sites = [...new Set(dt.map(d => d.siteID))].sort();
 const selectSites = (Inputs.select(sites, {value: sites, multiple: 8, width: 100, label: "Select sites"}));
 const selectedSites = Generators.input(selectSites);

 return {sites, selectSites, selectedSites};
}

import {Inputs} from "npm:@observablehq/inputs";

import {dt} from "rawTemperatureVariables.js";

const sites0 = [...new Set(dt.map(d => d.siteID))].sort();
const selectSites0 = (Inputs.select(sites0, {value: sites0, multiple: 8, width: 100, label: "Select sites"}));
const selectedSites0 = Generators.input(selectSites0);

export const sites = sites0;
export const selectSites = selectSites0;
export const selectedSites = selectedSites0;

const years = [...new Set(dt.map(d => d.year))].sort();
const selectYears = (Inputs.select(years, {value: years, multiple: true, width: 80, label: "Select years"}));
const selectedYears = Generators.input(selectYears);

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

const facetDaily = (Inputs.radio([true, false], {label: "Graph by day? [not yet implemented]", value: true}));
const selectedFacetDaily = Generators.input(facetDaily);

const facetYearly = (Inputs.radio([true, false], {label: "Facet by year?", value: false}));
const selectedFacetYearly = Generators.input(facetYearly);

const aggregators = ["Monthly", "Weekly", "Daily", "15 Minute"];
const selectAggregators = (Inputs.select(aggregators, {value: "Daily", multiple: false, width: 90, label: "Select aggregation level"}));
const selectedAggregators = Generators.input(selectAggregators);

*/