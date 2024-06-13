library(readr)
library(lubridate)
library(here)
library(jsonlite)
library(tidyverse)

source("./docs/data/R/rForSourcing.R") # getDT <- function(d) {...}

dt0 <- as_tibble(readRDS("./docs/data/dataIn/dt.EcoDrought.flowtemp.rds")) # includes more airTemp data than EcoDrought_Continuous_VA.rds

dt <- getDT(dt0)

#write.csv(dt, "./docs/data/csv/dt.csv") # this gives a date error when read into the app

# to save dt as json for ereading into dt.parquet.js, I hope
#write_json(dt, "./docs/data/json/dt.json")

cat(format_csv(dt))
