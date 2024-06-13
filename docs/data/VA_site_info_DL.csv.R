library(readr)
library(tidyverse)

dOut <- as_tibble(read_csv("./docs/data/VA_site_info.csv")) |>
  rename(
    siteID = Site_ID,
    siteName = Site_Name,
    lat = Latitude_dec_deg,
    lon = Longitude_dec_deg,
    elevation = Elevation_ft,
    drainageArea = Drainage_Area_sqmi,
    stationNo = Station_No
  )

cat(format_csv(dOut))
