# This does not qork because stdout requires text not binaries.

library(readr)
library(lubridate)
library(arrow)
library(dbplyr, warn.conflicts = FALSE)
library(duckdb)
library(tidyverse)

source("./docs/data/R/rForSourcing.R") # getDT <- function(d) {...}

dt0 <- as_tibble(readRDS("./docs/data/dataIn/dt.EcoDrought.flowtemp.rds")) # includes more airTemp data than EcoDrought_Continuous_VA.rds

# check filtering using `filter(siteID %in% sitesToInclude)` in getDT()
dt <- getDT(dt0)

# all in one file
PQPathOne <- "./docs/data/parquet/one"

#dt |>
#  write_dataset(path = PQPathOne, format = "parquet")

dtOut <- read_parquet(paste0(PQPathOne, "/part-0.parquet"), as_data_frame = FALSE)

#cat(dtOut)


dt |>
  write_dataset(stdout(), format = "parquet")
