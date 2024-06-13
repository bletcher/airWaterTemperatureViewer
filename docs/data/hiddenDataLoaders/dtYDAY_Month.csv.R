library(readr)
library(lubridate)
library(here)
library(tidyverse)

source("./docs/data/R/rForSourcing.R") # getDT <- function(d) {...}

#dt0 <- as_tibble(readRDS("./docs/data/EcoDrought_Continuous_VA.rds"))
dt0 <- as_tibble(readRDS("./docs/data/dataIn/dt.EcoDrought.flowtemp.rds"))

dt <- getDT(dt0)

dtYDAY_Month <- dt |>
  group_by(siteID, year, month) |>
  summarize(
    n = n(),
    #date = unique(date(dateTime)),
    airTemperature = mean(airTemperature, na.rm = TRUE),
    waterTemperature = mean(waterTemperature, na.rm = TRUE),
    gage = mean(gage, na.rm = TRUE),
    discharge = mean(discharge, na.rm = TRUE),
    dischargeLog10 = mean(dischargeLog10, na.rm = TRUE),
    airPressure = mean(airPressure, na.rm = TRUE),
    yday = mean(yday, na.rm = TRUE),
    season = unique(season, na.rm = TRUE)
  )

#write_json(dtYDAY, "./docs/data/dtYDAY.json")

cat(format_csv(dtYDAY_Month))