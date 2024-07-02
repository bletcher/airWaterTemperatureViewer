# Get and prepare R model results from Tim Lambert's dePAWT package
# Data are here:
# data = " https://doimspp-my.sharepoint.com/:f:/r/personal/tlambert_contractor_usgs_gov/Documents/Documents/Repos/dePAWT/results?csf=1&web=1&e=xVJBcR&xsdata=MDV8MDJ8fGQwN2Q0NmM0NDZjYjQwMjI3ODgyMDhkYzhmYTg5NDdlfDA2OTNiNWJhNGIxODRkN2I5MzQxZjMyZjQwMGE1NDk0fDB8MHw2Mzg1NDMyMDEzODgzNjE4NTh8VW5rbm93bnxWR1ZoYlhOVFpXTjFjbWwwZVZObGNuWnBZMlY4ZXlKV0lqb2lNQzR3TGpBd01EQWlMQ0pRSWpvaVYybHVNeklpTENKQlRpSTZJazkwYUdWeUlpd2lWMVFpT2pFeGZRPT18MXxMMk5vWVhSekx6RTVPbU0wWVdGaU9ESTJOREF5WkRSa1pqUmhObUl4Wm1NelkySm1OR1JoTkRVM1FIUm9jbVZoWkM1Mk1pOXRaWE56WVdkbGN5OHhOekU0TnpJek1UY3pNVFkzfDQ3MmIyODRiMWI4ODQ3Y2Y3ODgyMDhkYzhmYTg5NDdlfDE1MTdhMmM1N2NlNTQyYTA4ZGY2MmU2NjEyZTlmOTk3&sdata=Ny9UM0d0U0Uycno5Tm5UaDJiS0w5aUZjLzZEOVhBVGFvR0lQbHEzT0t4Zz0%3D&ovuser=0693b5ba-4b18-4d7b-9341-f32f400a5494%2Cbletcher%40usgs.gov "

#Repo is here: https://github.com/timothy-d-lambert/dePAWT

# Run this to get the data and prepare it for use in the app. This script is not reactive.

library(readr)
library(lubridate)
library(tidymodels)
library(purrr)
library(broom)
library(arrow)
library(minpack.lm)
library(tidyverse)

#library(usethis)
#usethis::use_git_config(user.name = "bletcher", 
#                user.email = "bletcher@eco.umass.edu")

#library(remotes)
#remotes::install_github("timothy-d-lambert/dePAWT")
library(dePAWT)

sitesToInclude <- c(
    "PA_01FL", "PA_06FL", "PA_10FL",
    "PI_01FL", "PI_06FL", "PI_10FL",
    "SR_01FL", "SR_06FL", "SR_10FL"
  )

writeParquet <- function(dataIn, pathIn, dataNameIn) {
  write_dataset(
    dataset = dataIn,
    path = pathIn,
    format = "parquet", # 'snappy' is the default compression
    basename_template = paste0(dataNameIn, "-{i}.parquet")
  )
}



# Get raw data
# This loads "df_metrics_de"   "df_metrics_sine"
# "df_predict_de"   "df_predict_sine"
#load("./docs/data/dataIn/EcoDrought-sites_calcs_SR_26Jun2024.RData")
load("./docs/data/dataIn/EcoDrought-sites_calcs_SR_1Jul2024.RData")
mDeSR <- df_metrics_de
mSineSR <- df_metrics_sine
pDeSR <- df_predict_de
pSineSR <- df_predict_sine

#load("./docs/data/dataIn/EcoDrought-sites_calcs_PI_26Jun2024.RData")
load("./docs/data/dataIn/EcoDrought-sites_calcs_PI_1Jul2024.RData")
mDePI <- df_metrics_de
mSinePI <- df_metrics_sine
pDePI <- df_predict_de
pSinePI <- df_predict_sine

#load("./docs/data/dataIn/EcoDrought-sites_calcs_PA_26Jun2024.RData")
load("./docs/data/dataIn/EcoDrought-sites_calcs_PA_1Jul2024.RData")
mDePA <- df_metrics_de
mSinePA <- df_metrics_sine
pDePA <- df_predict_de
pSinePA <- df_predict_sine

df_metrics_de <- bind_rows(mDeSR, mDePI, mDePA)
df_metrics_sine <- bind_rows(mSineSR, mSinePI, mSinePA)
df_predict_de <- bind_rows(pDeSR, pDePI, pDePA)
df_predict_sine <- bind_rows(pSineSR, pSinePI, pSinePA)

str(df_predict_de)
path <- "./docs/data/parquet/shen/tim/"

#############################################################################
#  Combined de and sine files  ##############################################

##  df_metrics_de_SR  #######################################################
dataName_metrics <- "df_metrics_all"
dataIn_metrics <- df_metrics_de |>
  mutate(model = "de") |>
  select(-site_air) |>
  ungroup() |>
  bind_rows(
    df_metrics_sine |>
    mutate(model = "sine") |>
    select(-site_air) |>
    ungroup()
  ) |>
  rename(
    siteID = site,
    rSquaredDE = R2,
    rSquaredAir = R2_air,
    rSquaredWater = R2_water,
    amplitudeRatio = amplitude_ratio,
    phaseLag = phase_lag,
    meanOffset = mean_offset,
    meanRatio = mean_ratio,
    phaseWater = phase_water,
    phaseAir = phase_air,
    amplitudeWater = amplitude_water,
    amplitudeAir = amplitude_air,
    airTemperature = Ta_obs,
    waterTemperature = Tw_obs
  ) |>
  mutate(
    month = month(date),
    week = week(date),
    hour = hour(date)
  ) |>
  mutate(
    season = case_when(
      month %in% c(12, 1, 2) ~ "Winter",
      month %in% c(3, 4, 5) ~ "Spring",
      month %in% c(6, 7, 8) ~ "Summer",
      month %in% c(9, 10, 11) ~ "Autumn",
      TRUE ~ "NA"
    ),
    seasonInt = case_when(
      month %in% c(12, 1, 2) ~ 4,
      month %in% c(3, 4, 5) ~ 1,
      month %in% c(6, 7, 8) ~ 2,
      month %in% c(9, 10, 11) ~ 3,
      TRUE ~ NA
    )
  ) |>
  filter(siteID %in% sitesToInclude)

writeParquet(dataIn_metrics, path, dataName_metrics)


##  df_predict_de_SR  #######################################################
# write dt to parquet
# 'Tw' is from the 'de' model
dataName_predict <- "df_predict_all"
dataIn_predict_both <- df_predict_sine |>
  mutate(model = "sine") |>
  ungroup() |>

  bind_rows(
    df_predict_de |>
    mutate(model = "de") |>
    ungroup()
  ) |>
  select(-site_air) |>

  mutate(ydayHMS = yday + time) |>
  rename(
    siteID = site,
    dateTime = datetime,
    hmsProp = time,
    waterTemperature = Tw_obs,
    airTemperature = Ta_obs,
    waterTemperaturePredict = Tw_predict,
    airTemperaturePredict = Ta_predict
  ) |>
  distinct() |>
  filter(siteID %in% sitesToInclude) |>
  group_by(siteID, year, yday, hour, model) |>
  summarize(
    dateTime = mean(dateTime, na.rm = TRUE),
    hmsProp = mean(hmsProp, na.rm = TRUE),
    waterTemperature = mean(waterTemperature, na.rm = TRUE),
    airTemperature = mean(airTemperature, na.rm = TRUE),
    waterTemperaturePredict = mean(waterTemperaturePredict, na.rm = TRUE),
    airTemperaturePredict = mean(airTemperaturePredict, na.rm = TRUE),
    ydayHMS = mean(ydayHMS, na.rm = TRUE)
  ) |>
  ungroup()

dataIn_predict_wider <- dataIn_predict_both |>
  pivot_wider(
    names_from = model,
    values_from = c(
      waterTemperaturePredict,
      airTemperaturePredict
    )
  ) |>
  select(-airTemperaturePredict_de)  # not predicted for de model

writeParquet(dataIn_predict_wider, path, dataName_predict)
