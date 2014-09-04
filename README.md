# what2watch

phase 1: gather files details
=> [{ file: { name, size, hash, downloadedAt } }]

phase 2: get info from OpenSubtitles
=> [{ file, os: { imdbId, title, year } }]

phase 3: scrap imdb
=> [{ file, os, imdb: { ... } }]

phase 4: merge results (file, is, imdb)
=> [{ file: { name, downloadedAt }, title, year, rating, ... }]

phase 5: sort/filter results

phase 6: display results

## cmd line interface

what2watch [path]
  --sortby rating/year/file.downloadedAt/etc.
  --genre drama,comedy/animation/etc
  --no-genre musical
