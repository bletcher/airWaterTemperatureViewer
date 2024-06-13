library(readr)
library(tidyverse)

paramsIn <- read_csv("./docs/data/dataFromR/dtHOUR_params.csv")

uniqueValues <- paramsIn %>%
  distinct(siteID, year, yday, tempVar)

preds <- crossing(uniqueValues, hour = 0:23) %>%
  left_join(paramsIn, by = c("siteID", "year", "yday", "tempVar")) %>%
  mutate(
    hour_rad = hour * (2 * pi / 24),
    predTemp = A * sin(hour_rad) + B * cos(hour_rad) + C
  )

cat(format_csv(preds))
