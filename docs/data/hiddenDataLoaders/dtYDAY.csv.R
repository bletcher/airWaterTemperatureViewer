library(readr)
library(lubridate)
library(here)
library(tidyverse)

source("./docs/data/R/rForSourcing.R") # getDT <- function(d) {...}

#dt0 <- as_tibble(here::here("docs", "data", readRDS("EcoDrought_Continuous_VA.rds")))
#dt0 <- as_tibble(readRDS("./docs/data/EcoDrought_Continuous_VA.rds"))
dt0 <- as_tibble(readRDS("./docs/data/dataIn/dt.EcoDrought.flowtemp.rds"))

dt <- getDT(dt0)

dtYDAY <- dt |>
  group_by(siteID, year, yday) |>
  summarize(
    n = n(),
    #date = unique(date(dateTime)),
    airTemperature = mean(airTemperature, na.rm = TRUE),
    waterTemperature = mean(waterTemperature, na.rm = TRUE),
    gage = mean(gage, na.rm = TRUE),
    discharge = mean(discharge, na.rm = TRUE),
    dischargeLog10 = mean(dischargeLog10, na.rm = TRUE),
    airPressure = mean(airPressure, na.rm = TRUE),
    season = unique(season, na.rm = TRUE)
  )

#write_json(dtYDAY, "./docs/data/dtYDAY.json")

cat(format_csv(dtYDAY))