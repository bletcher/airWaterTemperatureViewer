import {FileAttachment} from "npm:@observablehq/stdlib";
import * as d3 from "npm:d3";

//export const df_metrics_SR = await FileAttachment("../data/parquet/shen/tim/df_metrics_SR-0.parquet").parquet();
//export const df_predict_SR = await FileAttachment("../data/parquet/shen/tim/df_predict_SR-0.parquet").parquet();

export const df_metrics_all = await FileAttachment("../data/parquet/shen/tim/df_metrics_all-0.parquet").parquet();
export const df_predict_all = await FileAttachment("../data/parquet/shen/tim/df_predict_all-0.parquet").parquet();

export function groupAndAggregate0(data, paramList, selectedAggregator, ...groupingVariables) {
  // Add selectedAggregator to the list of grouping variables if it's not already included
  if (!groupingVariables.includes(selectedAggregator)) {
    groupingVariables.push(selectedAggregator);
  }

  // Group data dynamically based on the provided grouping variables
  const groupedData = d3.group(data, ...groupingVariables.map(variable => d => d[variable]));

  // Function to recursively process the grouped data
  function processGroup(group, keys = []) {
    return Array.from(group, ([key, value]) => {
      if (value instanceof Map) {
        // If the value is still a Map, continue processing recursively
        return processGroup(value, keys.concat(key));
      } else {
        // Once we reach the deepest level, aggregate the data
        return {
          ...Object.fromEntries(keys.concat(key).map((k, i) => [groupingVariables[i], k])),
          observationCount: value.length, // Add count of observations per group
          ...paramList.reduce((acc, param) => {
            acc[param] = d3.mean(value, d => d[param]);
            return acc;
          }, {}),
          // Optionally, you can include the selectedAggregator's value in the output
          // This step assumes selectedAggregator is meant to be used for aggregation
          selectedAggregatorValue: d3.mean(value, d => d[selectedAggregator])
        };
      }
    }).flat();
  }

  return processGroup(groupedData);
}

// include passing the function to be used for aggregation
export function groupAndAggregate(data, paramList, selectedAggregator, aggregationFunction, ...groupingVariables) {
  // Add selectedAggregator to the list of grouping variables if it's not already included
  if (!groupingVariables.includes(selectedAggregator)) {
    groupingVariables.push(selectedAggregator);
  }

  // Group data dynamically based on the provided grouping variables
  const groupedData = d3.group(data, ...groupingVariables.map(variable => d => d[variable]));

  // Function to recursively process the grouped data
  function processGroup(group, keys = []) {
    return Array.from(group, ([key, value]) => {
      if (value instanceof Map) {
        // If the value is still a Map, continue processing recursively
        return processGroup(value, keys.concat(key));
      } else {
        // Once we reach the deepest level, aggregate the data
        return {
          ...Object.fromEntries(keys.concat(key).map((k, i) => [groupingVariables[i], k])),
          observationCount: value.length, // Add count of observations per group
          ...paramList.reduce((acc, param) => {
            // Use the provided aggregationFunction instead of d3.mean
            acc[param] = aggregationFunction(value, d => d[param]);
            return acc;
          }, {}),
          // Optionally, you can include the selectedAggregator's value in the output
          // This step assumes selectedAggregator is meant to be used for aggregation
          // Use the provided aggregationFunction for the selectedAggregator as well
          selectedAggregatorValue: aggregationFunction(value, d => d[selectedAggregator])
        };
      }
    }).flat();
  }

  return processGroup(groupedData);
}


