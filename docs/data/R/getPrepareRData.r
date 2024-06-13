# Get and prepare R data
# Run this to get the data and prepare it for use in the app. This script is not reactive.

library(readr)
library(lubridate)
library(tidymodels)
library(purrr)
library(broom)
library(arrow)
library(minpack.lm)
library(tidyverse)

library(usethis)
usethis::gh_token_help()

library(devtools)
devtools::install_github("timothy-d-lambert/dePAWT")
remotes::install_github("timothy-d-lambert/dePAWT")
library(dePAWT)


source("./docs/data/R/rForSourcing.R")

# Get raw data
dt0 <- as_tibble(readRDS("./docs/data/dataIn/dt.EcoDrought.flowtemp.rds"))

# Prepare raw data
dt <- getDT(dt0)


########################
# Write parquet file - for now until I can figure out parquet data loaders
# check filtering using `filter(siteID %in% sitesToInclude)` in getDT()

#write_dataset(
#  dataset = dt,
#  path = PQPathDataSet,
#  format = formatIn,
#  basename_template = paste0(dataSetIn, "-{i}.", formatIn)
#)


writeParquet <- function(dataIn, pathIn, dataNameIn) {
  write_dataset(
    dataset = dataIn,
    path = pathIn,
    format = "parquet",
    basename_template = paste0(dataNameIn, "-{i}.parquet")
  )
}

path <- "./docs/data/parquet/shen"

##  dt  ###########################################################
# write dt to parquet
dataName <- "dt"
writeParquet(dt, path, dataName)

##
##  Aggregated data  ##################################################
##

##  dtHour  ###########################################################
# Get mean values by hour
dtHOUR <- get_dtAggregated(dt, c("siteID", "year", "yday", "hour"))

writeParquet(
  dtHOUR,
  path,
  "dtHour"
)

##  dtDay  ###########################################################
# Get mean values by week

writeParquet(
  get_dtAggregated(dt, c("siteID", "year", "yday")),
  path,
  "dtDay"
)

##  dtWeek  ###########################################################
# Get mean values by week

writeParquet(
  get_dtAggregated(dt, c("siteID", "year", "week")),
  path,
  "dtWeek"
)

##  dtMonth  ###########################################################
# Get mean values by week

writeParquet(
  get_dtAggregated(dt, c("siteID", "year", "month")),
  path,
  "dtMonth"
)

##  dtSeason  ###########################################################
# Get mean values by season

writeParquet(
  get_dtAggregated(dt, c("siteID", "year", "season")),
  path,
  "dtSeason"
)

##  dtYear  ###########################################################
# Get mean values by year

writeParquet(
  get_dtAggregatedYear(dt, c("siteID", "year")),
  path,
  "dtYear"
)



##  params  ###########################################################
# Get parameter estimates
# minimum data length for estimation
minDataLength <- 20
params <- getParams(dtHOUR, minDataLength)

# write params to parquet
dataName <- "params"
path <- "./docs/data/parquet/shen"
writeParquet(params, path, dataName)

###  ampPhase  ##########################################################
# Get parameter estimates
# minimum data length for estimation
ampPhase <- getAmpPhase(params)

# write params to parquet
dataName <- "ampPhase"
path <- "./docs/data/parquet/shen"
writeParquet(ampPhase, path, dataName)

###  paramsPred  ##########################################################
# Get parameter estimates
# minimum data length for estimation
paramsPred <- getParamsPred(params)

# write params to parquet
dataName <- "paramsPred"
path <- "./docs/data/parquet/shen"
writeParquet(paramsPred, path, dataName)


# Write to csv so we can read this into other R scripts. This is not a reactive data loader.
# will be able to delete this from the parquet version
write_csv(params, "./docs/data/dataFromR/dtHOUR_params.csv")
