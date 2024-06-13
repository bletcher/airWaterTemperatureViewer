// This doewsn't work

import * as Arrow from "apache-arrow";
import * as Parquet from "parquet-wasm";
import { FileAttachment } from "npm:@observablehq/stdlib";

const dt = await FileAttachment("../data/json/dt.json").json();;
const table = Arrow.tableFromJSON(dt);


/*
// Convert the JSON object to an array of objects if it's not already one
//const data = Array.isArray(dt) ? dt2 : [dt2];



// Generate a daily random walk as parallel arrays of {date, value}.

const siteID = dt.map(d => d.siteID);
const dateTime = dt.map(d => d.dateTime);
const waterTemperature = dt.map(d => d.waterTemperature);
console.log(siteID);


const data = {
  siteID: dt.map(d => d.siteID),
  dateTime: dt.map(d => d.dateTime),
  waterTemperature: dt.map(d => d.waterTemperature)
}
*/
// Construct an Apache Arrow table from the parallel arrays.
//const table = Arrow.tableFromArrays(data);

// Output the Apache Arrow table as a Parquet table to standard out.
const parquetTable = Parquet.Table.fromIPCStream(Arrow.tableToIPC(table, "stream"));
const parquetBuilder = new Parquet.WriterPropertiesBuilder().setCompression(Parquet.Compression.ZSTD).build();
const parquetData = Parquet.writeParquet(parquetTable, parquetBuilder);
process.stdout.write(parquetData);

