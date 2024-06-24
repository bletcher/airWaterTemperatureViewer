// See https://observablehq.com/framework/config for documentation.
export default {
  // The project’s title; used in the sidebar and webpage titles.
  title: "Temperature Data Viewer",

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
   pages: [
     {
       name: "Main pages",
       pages: [
         //{name: "Temperature", path: "/temperatureData"},
        // {name: "Temperature - parquet", path: "/temperatureDataParquet"},
         {name: "Introduction", path: "/introduction"},
         {name: "Raw Temperature", path: "/rawTemperatureData"},
         {name: "Modelled Temperature", path: "/modelledTemperatureData"},
         //{name: "Flow and temperature", path: "/temperatureFlowData"}
       ] 
      }/*,
      {
       name: "Testing",
       pages: [
         {name: "duckDB test - one parquet file", path: "/duckDBTest"},        
         //{name: "duckDB test - parquet files by site", path: "/duckDBTestBySite"}
         //{name: "parquetDataLoaderTest", path: "/parquetDataLoaderTest"}
       ]  
     },
     {
      name: "Examples",
      pages: [
        {name: "Useful examples", path: "/examples"},        
        //{name: "duckDB test - parquet files by site", path: "/duckDBTestBySite"}
        //{name: "parquetDataLoaderTest", path: "/parquetDataLoaderTest"}
      ]  
    } */
   ],

  // Some additional configuration options and their defaults:
  // theme: "default", // try "light", "dark", "slate", etc.
  // header: "", // what to show in the header (HTML)
  // footer: "Built with Observable.", // what to show in the footer (HTML)
  // toc: true, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
   root: "docs", // path to the source root for preview
   output: "dist", // path to the output root for build
   search: true, // activate search
   cleanUrls: false // use URLs with .html. This is needed for AWS hosting
};
