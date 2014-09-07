# what2watch

phase 1: gather files details
=> [{ file: { name, size, hash, downloadedAt } }]

phase 2: get info from OpenSubtitles
=> [{ file, movie: { imdbId, title, year } }]

phase 3: get movie details
=> [{ file, movie: { ... } }]

phase 5: sort/filter results

phase 6: display results

## cmd line interface

what2watch [path]
  --sortBy rating/year/file.downloadedAt/etc.
  --genre drama,comedy/animation/etc
  --no-genre musical
