import {FileAttachment} from "npm:@observablehq/stdlib";

export const df_metrics_SR = await FileAttachment("../data/parquet/shen/tim/df_metrics_SR-0.parquet").parquet();
export const df_predict_SR = await FileAttachment("../data/parquet/shen/tim/df_predict_SR-0.parquet").parquet();
