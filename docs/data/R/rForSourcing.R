# Note: to force a rerun of this script, run  `rm docs/.observablehq/cache/data/*.csv` and then re-run the dtHOUR_params.R script.

getDT <- function(d) {

  colsToExclude <- c(
    "siteIDForAir", "hmsProp", "airTemperatureOriginal",
    "station", "AirTemperature_HOBO_degF", "airPressure",
    "WaterTemperature_HOBO_DegF", "discharge", "gage"
  )

  sitesToInclude <- c(
    "PA_01FL", "PA_06FL", "PA_10FL",
    "PI_01FL", "PI_06FL", "PI_10FL",
    "SR_01FL", "SR_06FL", "SR_10FL"
  )


  d2 <- d |>
    #filter(str_detect(Site_ID, "^PA")) |> ################## FOR NOW
    #filter(Site_ID %in% sitesToInclude) |> ################## FOR NOW
    mutate(
      station = str_sub(Station_No, 4, 13),
      airTemperatureOriginal = (AirTemperature_HOBO_degF - 32) * 5 / 9,
      waterTemperature = (WaterTemperature_HOBO_DegF - 32) * 5 / 9,
      year = year(DateTime_EST),
      month = month(DateTime_EST),
      week = week(DateTime_EST),
      hour = hour(DateTime_EST),
      yday = yday(DateTime_EST),
      hmsProp = (hour(DateTime_EST)*60*60 + minute(DateTime_EST)*60 + second(DateTime_EST))/(24*60*60),
      ydayHMS = yday + hmsProp,
      dischargeLog10 = log10(Discharge_Hobo_cfs),
    ) |>
    rename(
      siteID = Site_ID,
      dateTime = DateTime_EST,
      gage = GageHeight_Hobo_ft,
      discharge = Discharge_Hobo_cfs,
      airPressure = AirPressure_PSI
    ) |>
    dplyr::select(-Station_No) |>
    # assign airTemp stations to the nearest waterTemp station
    mutate(
      siteIDForAir = case_when(
        siteID == "PA_01FL" ~ "PA_01FL",
        siteID == "PA_02FL" ~ "PA_01FL",
        siteID == "PA_03FL" ~ "PA_05FL",
        siteID == "PA_04FL" ~ "PA_05FL",
        siteID == "PA_05FL" ~ "PA_05FL",
        siteID == "PA_06FL" ~ "PA_05FL",
        siteID == "PA_07FL" ~ "PA_05FL",
        siteID == "PA_08FL" ~ "PA_10FL",
        siteID == "PA_09FL" ~ "PA_10FL",
        siteID == "PA_10FL" ~ "PA_10FL",
        
        siteID == "SR_01FL" ~ "SR_01FL",
        siteID == "SR_02FL" ~ "SR_04FL",
        siteID == "SR_03FL" ~ "SR_04FL",
        siteID == "SR_04FL" ~ "SR_04FL",
        siteID == "SR_05FL" ~ "SR_04FL",
        siteID == "SR_06FL" ~ "SR_04FL",
        siteID == "SR_07FL" ~ "SR_10FL",
        siteID == "SR_08FL" ~ "SR_10FL",
        siteID == "SR_09FL" ~ "SR_10FL",
        siteID == "SR_10FL" ~ "SR_10FL",
        
        siteID == "PI_01FL" ~ "PI_01FL",
        siteID == "PI_02FL" ~ "PI_01FL",
        siteID == "PI_03FL" ~ "PI_05FL",
        siteID == "PI_04FL" ~ "PI_05FL",
        siteID == "PI_05FL" ~ "PI_05FL",
        siteID == "PI_06FL" ~ "PI_05FL",
        siteID == "PI_07FL" ~ "PI_05FL",
        siteID == "PI_08FL" ~ "PI_10FL",
        siteID == "PI_09FL" ~ "PI_10FL",
        siteID == "PI_10FL" ~ "PI_10FL",
        TRUE ~ "NA"
      )
    ) |>
    mutate(
      season = case_when(
        month %in% c(12, 1, 2) ~ "Winter",
        month %in% c(3, 4, 5) ~ "Spring",
        month %in% c(6, 7, 8) ~ "Summer",
        month %in% c(9, 10, 11) ~ "Autumn",
        TRUE ~ "NA"
      )
    )

  airTemps <- d2 |>
    select(siteID, dateTime, airTemperatureOriginal) |>
    distinct() |>
    mutate(airTemperature = airTemperatureOriginal) |>
    select(-airTemperatureOriginal)

  dOut <- d2 |>
    left_join(airTemps, by = c("siteIDForAir" = "siteID", "dateTime")) |>
    filter(siteID %in% sitesToInclude) |> # comment out to run all sites, leave in to run for a subset of sites during testing
    dplyr::select(-all_of(colsToExclude)) # to make DB smaller for testing

  return(dOut)
}

############################################################################

get_dtAggregated <- function(d, agg) {
  d |>
    group_by(across(all_of(agg))) |>
    summarize(
      n = n(),
      airTemperature = mean(airTemperature, na.rm = TRUE),
      waterTemperature = mean(waterTemperature, na.rm = TRUE),
      dischargeLog10 = mean(dischargeLog10, na.rm = TRUE),
      yday = mean(yday, na.rm = TRUE),
      season = unique(season, na.rm = TRUE),
      ydayHMS = mean(ydayHMS, na.rm = TRUE),
      dateTime = mean(dateTime, na.rm = TRUE)
    ) |>
    ungroup()
}

# need to take out season from the aggregation
get_dtAggregatedYear <- function(d, agg) {
  d |>
    group_by(across(all_of(agg))) |>
    summarize(
      n = n(),
      airTemperature = mean(airTemperature, na.rm = TRUE),
      waterTemperature = mean(waterTemperature, na.rm = TRUE),
      dischargeLog10 = mean(dischargeLog10, na.rm = TRUE),
      yday = mean(yday, na.rm = TRUE),
      ydayHMS = mean(ydayHMS, na.rm = TRUE),
      dateTime = mean(dateTime, na.rm = TRUE)
    ) |>
    ungroup()
}

#######################################################################################

extract_params <- function(model) {
  if (is.null(model)) {
    return(NULL)
  }

  params <- tryCatch({
    broom.mixed::tidy(model)
  }, error = function(e) {
    NULL
  })
 
  return(params)
}

### Curve fits for air and water temperature ################################################
  curve_fit_air <- function(d, minDataLength = 20) {
    if (length(d$airTemperature) < minDataLength) {
      return(list(model = NA, rSquared = NA))
    }
    d$hour_rad <- d$hour * (2 * pi / 24)
    startAir <- list(A = -1, B = -1, C = mean(d$airTemperature, na.rm = TRUE))

    modelAir <- tryCatch({
      nlsLM(airTemperature ~ A * sin(hour_rad) + B * cos(hour_rad) + C, data = d, start = startAir)
    }, error = function(e) {
      return(list(model = NA, rSquared = NA))
    })

    # rSquared calculation
    residuals <- residuals(modelAir)
    sst <- sum((d$airTemperature - mean(d$airTemperature))^2)
    ssr <- sum(residuals^2)
    rSquared <- 1 - (ssr / sst)

    return(list(model = modelAir, rSquared = rSquared))
  }

  curve_fit_water <- function(d, minDataLength = 20) {
    if (length(d$waterTemperature) < minDataLength) {
      return(list(model = NA, rSquared = NA))
    }
    d$hour_rad <- d$hour * (2 * pi / 24)
    startWater <- list(A = -1, B = -1, C = mean(d$waterTemperature, na.rm = TRUE))

    modelWater <- tryCatch({
      nlsLM(waterTemperature ~ A * sin(hour_rad) + B * cos(hour_rad) + C, data = d, start = startWater)
    }, error = function(e) {
      return(list(model = NA, rSquared = NA))
    })

    # rSquared calculation
    residuals <- residuals(modelWater)
    sst <- sum((d$waterTemperature - mean(d$waterTemperature))^2)
    ssr <- sum(residuals^2)
    rSquared <- 1 - (ssr / sst)

    return(list(model = modelWater, rSquared = rSquared))
  }

getParams <- function(dtHOUR, minDataLength = 20) {

  modelsAir <- dtHOUR %>%
    group_by(siteID, year, yday) %>%
    nest() %>%
    mutate(dataLength = map_dbl(data, ~length(.x$airTemperature))) |>
    filter(dataLength > minDataLength) |> # filter out daily datasets that are too short
    mutate(
      model0 = map(data, curve_fit_air),
      model = map(model0, 'model'),
      rSquared = map(model0, 'rSquared'),
      params = map(model, extract_params)
    ) %>%
    unnest(c(params, rSquared)) |>
    select(-model0, -model, -data) |>
    mutate(tempVar = "air")


  ### Models for water temperature ################################################
  modelsWater <- dtHOUR %>%
    group_by(siteID, year, yday) %>%
    nest() %>%
    mutate(dataLength = map_dbl(data, ~length(.x$waterTemperature))) |>
    filter(dataLength > minDataLength) |> # filter out daily datasets that are too short
    mutate(
      model0 = map(data, curve_fit_water),
      model = map(model0, 'model'),
      rSquared = map(model0, 'rSquared'),
      params = map(model, extract_params)
    ) %>%
    unnest(c(params, rSquared)) |>
    select(-model0, -model, -data) |>
    mutate(tempVar = "water")

  ################################################################################
  models <- bind_rows(modelsAir, modelsWater) |>
    filter(!is.na(term)) |>
    #group_by(siteID, year, yday, tempVar) |>
    select(-std.error, -statistic, -p.value) |> # need to lose these columns so there are no unique values remaining in non-widened cols
    pivot_wider(names_from = term, values_from = estimate)
    
  params <- models |>
    group_by(siteID, year, yday, tempVar) |>
    mutate(
      amplitude = sqrt(A^2 + B^2),
      phase = ifelse(A < 0,
        12 + (24 / (2 * pi)) * atan(B / A), #switched order of A and B per Tim's email 5/17/24
        (24 / (2 * pi)) * atan(B / A)
      )
    ) |>
    left_join(
      dtHOUR |> select(siteID, year, yday, season) |> distinct(), by = c("siteID", "year", "yday")
    ) |>
    ungroup()

  return(params)
}

###########################################################

getAmpPhase <- function(paramsIn) {
  paramsIn |>
    select(siteID, year, yday, season, tempVar, amplitude, phase, rSquared) |>
    pivot_wider(
      names_from = tempVar,
      values_from = c(amplitude, phase, rSquared)
    ) |>
    select(
      siteID, year, yday, season,
      starts_with("amplitude"),
      starts_with("phase"),
      starts_with("rSquared")
    ) |>
    mutate(
      amplitudeRatio = amplitude_water / amplitude_air,
      phaseDiff = phase_water - phase_air
      # add mean ratio
    )
}

#################################################################
getParamsPred <- function(paramsIn) {

  uniqueValues <- paramsIn |>
    distinct(siteID, year, yday, tempVar)

  preds <- crossing(uniqueValues, hour = 0:23) %>%
    left_join(paramsIn, by = c("siteID", "year", "yday", "tempVar")) %>%
    mutate(
      hour_rad = hour * (2 * pi / 24),
      predTemp = A * sin(hour_rad) + B * cos(hour_rad) + C
    )

    return(preds)
 }
