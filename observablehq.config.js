// See https://observablehq.com/framework/config for documentation.
export default {
  // The project’s title; used in the sidebar and webpage titles.
  title: "Temperature Data Viewer",

  // The pages and sections in the sidebar. If you don’t specify this option,
  // all pages will be listed in alphabetical order. Listing pages explicitly
  // lets you organize them into sections and have unlisted pages.
   pages: [
     {
       name: "Chapters",
       pages: [
         //{name: "Temperature", path: "/temperatureData"},
        // {name: "Temperature - parquet", path: "/temperatureDataParquet"},
         {name: "Introduction", path: "/introduction"},
         {name: "Raw Temperature Data", path: "/temperatureDataRaw"},
         {name: "Modelled Temperature-wide no DE", path: "/temperatureDataModel2_noDE"},

         //{name: "Flow and temperature", path: "/temperatureFlowData"}
       ] 
      },
      {
       name: "Early versions",
       pages: [
         {name: "Modelled Temperature-wide", path: "/temperatureDataModel2"},
         {name: "Modelled Temperature-long", path: "/temperatureDataModel"},
       ]  
     }
     /*
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
  // theme: "dashboard", // try "light", "dark", "slate", etc.
  // style: "gridCustom.css", // a custom CSS file to
  // header: "", // what to show in the header (HTML)
  // footer: "Built with Observable.", // what to show in the footer (HTML)
  // toc: false, // whether to show the table of contents
  // pager: true, // whether to show previous & next links in the footer
   root: "docs", // path to the source root for preview
   output: "dist", // path to the output root for build
   search: true, // activate search
   cleanUrls: false // use URLs with .html. This is needed for AWS hosting
};
