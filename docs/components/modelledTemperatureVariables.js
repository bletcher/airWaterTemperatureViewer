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

export function legend2(color, {
  title,
  tickSize = 6,
  width = 320, 
  height = 44 + tickSize,
  marginTop = 18,
  marginRight = 0,
  marginBottom = 16 + tickSize,
  marginLeft = 0,
  ticks = width / 64,
  tickFormat,
  tickValues
} = {}) {

  function ramp(color, n = 256) {
    const canvas = document.createElement("canvas");
    canvas.width = n;
    canvas.height = 1;
    const context = canvas.getContext("2d");
    for (let i = 0; i < n; ++i) {
      context.fillStyle = color(i / (n - 1));
      context.fillRect(i, 0, 1, 1);
    }
    return canvas;
  }

  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .style("overflow", "visible")
      .style("display", "block");

  let tickAdjust = g => g.selectAll(".tick line").attr("y1", marginTop + marginBottom - height);
  let x;

  // Continuous
  if (color.interpolate) {
    const n = Math.min(color.domain().length, color.range().length);

    x = color.copy().rangeRound(d3.quantize(d3.interpolate(marginLeft, width - marginRight), n));

    svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.copy().domain(d3.quantize(d3.interpolate(0, 1), n))).toDataURL());
  }

  // Sequential
  else if (color.interpolator) {
    x = Object.assign(color.copy()
        .interpolator(d3.interpolateRound(marginLeft, width - marginRight)),
        {range() { return [marginLeft, width - marginRight]; }});

    svg.append("image")
        .attr("x", marginLeft)
        .attr("y", marginTop)
        .attr("width", width - marginLeft - marginRight)
        .attr("height", height - marginTop - marginBottom)
        .attr("preserveAspectRatio", "none")
        .attr("xlink:href", ramp(color.interpolator()).toDataURL());

    // scaleSequentialQuantile doesn’t implement ticks or tickFormat.
    if (!x.ticks) {
      if (tickValues === undefined) {
        const n = Math.round(ticks + 1);
        tickValues = d3.range(n).map(i => d3.quantile(color.domain(), i / (n - 1)));
      }
      if (typeof tickFormat !== "function") {
        tickFormat = d3.format(tickFormat === undefined ? ",f" : tickFormat);
      }
    }
  }

  // Threshold
  else if (color.invertExtent) {
    const thresholds
        = color.thresholds ? color.thresholds() // scaleQuantize
        : color.quantiles ? color.quantiles() // scaleQuantile
        : color.domain(); // scaleThreshold

    const thresholdFormat
        = tickFormat === undefined ? d => d
        : typeof tickFormat === "string" ? d3.format(tickFormat)
        : tickFormat;

    x = d3.scaleLinear()
        .domain([-1, color.range().length - 1])
        .rangeRound([marginLeft, width - marginRight]);

    svg.append("g")
      .selectAll("rect")
      .data(color.range())
      .join("rect")
        .attr("x", (d, i) => x(i - 1))
        .attr("y", marginTop)
        .attr("width", (d, i) => x(i) - x(i - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", d => d);

    tickValues = d3.range(thresholds.length);
    tickFormat = i => thresholdFormat(thresholds[i], i);
  }

  // Ordinal
  else {
    x = d3.scaleBand()
        .domain(color.domain())
        .rangeRound([marginLeft, width - marginRight]);

    svg.append("g")
      .selectAll("rect")
      .data(color.domain())
      .join("rect")
        .attr("x", x)
        .attr("y", marginTop)
        .attr("width", Math.max(0, x.bandwidth() - 1))
        .attr("height", height - marginTop - marginBottom)
        .attr("fill", color);

    tickAdjust = () => {};
  }

  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(x)
        .ticks(ticks, typeof tickFormat === "string" ? tickFormat : undefined)
        .tickFormat(typeof tickFormat === "function" ? tickFormat : undefined)
        .tickSize(tickSize)
        .tickValues(tickValues))
      .call(tickAdjust)
      .call(g => g.select(".domain").remove())
      .call(g => g.append("text")
        .attr("x", marginLeft)
        .attr("y", marginTop + marginBottom - height - 6)
        .attr("fill", "currentColor")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .attr("class", "title")
        .text(title));

  return svg.node();
}


