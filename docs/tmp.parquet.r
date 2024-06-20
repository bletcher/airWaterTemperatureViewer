library(arrow)

dt <- read_parquet("./docs/data/parquet/shen/dt-0.parquet")

 write_dataset(
  dataset = dt,
  path = "/dev/stdout",
  format = "parquet")

# con <- pipe("cat", "wb")
# writeBin(
#   write_dataset(
#   dataset = dt,
#   path = "/dev/stdout",
#   format = "parquet"),
#   con
# )
# flush(con)



# dev_stdout = function (underlying_device = png, ...) {
#     filename = tempfile()
#     underlying_device(filename, ...)
#     filename
# }
# 
# dev_stdout_off = function (filename) {
#     dev.off()
#     on.exit(unlink(filename))
#     fake_stdout = pipe('cat', 'wb')
#     on.exit(close(fake_stdout), add = TRUE)
#     writeBin(readBin(filename, 'raw', file.info(filename)$size), fake_stdout)
# }
# 
# tmp_dev <- dev_stdout()
# write_dataset(
#   dataset = dt,
#   path = "dev/stdout",
#   format = "parquet"
# )
# dev_stdout_off(tmp_dev)
