# what2watch

Simple tool that scans the given directory for movies and uses OpenSubtitles API to query for details.
The final results are sorted by rating.

## Installation

`npm install what2watch`

## Usage

```
> what2watch --help

  Usage: what2watch [options]

  Options:

    -h, --help                   output usage information
    -V, --version                output the version number
    -f, --formats [formats]      list of movie formats to process, default avi,mkv,mp4,mpg
    -d, --directory [directory]  working directory
```

### Sample output

`what2watch --directory /path/to/movies`

```
Loading files                 [===============] 100% 0.0s
Trying to find movies         [===============] 100% 0.0s
Trying to fetch movie details [===============] 100% 0.0s

----------------------------

The Godfather
The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.

Rating: 9.2 Year: 1972 Duration: 175 min
Genre: Crime, Drama
Directors: Francis Ford Coppola
Cast: Marlon Brando, Al Pacino, James Caan, Richard S. Castellano, Robert Duvall, Sterling Hayden, John Marley
Country: USA Language: English, Italian, Latin
Url: http://www.imdb.com/title/tt00068646
File: /media/lucassus/Multimedia1/Filmy/watched/Godfather Trilogy/God father part I.avi

----------------------------

The Godfather: Part II
The early life and career of Vito Corleone in 1920s New York is portrayed while his son, Michael, expands and tightens his grip on his crime syndicate stretching from Lake Tahoe, Nevada to pre-revolution 1958 Cuba.

Rating: 9.1 Year: 1974 Duration: 200 min
Genre: Crime, Drama
Directors: Francis Ford Coppola
Cast: Al Pacino, Robert Duvall, Diane Keaton, Robert De Niro, John Cazale, Talia Shire, Lee Strasberg
Country: USA Language: English, Italian, Spanish, Latin, Sicilian
Url: http://www.imdb.com/title/tt00071562
File: /media/lucassus/Multimedia1/Filmy/watched/Godfather Trilogy/Godfather part II.avi

----------------------------

Pulp Fiction
The lives of two mob hit men, a boxer, a gangster's wife, and a pair of diner bandits intertwine in four tales of violence and redemption.

Rating: 9.0 Year: 1994 Duration: 154 min
Genre: Crime, Drama, Thriller
Directors: Quentin Tarantino
Cast: Tim Roth, Amanda Plummer, Laura Lovelace, John Travolta, Samuel L. Jackson, Phil LaMarr, Frank Whaley
Country: USA Language: English, Spanish, French
Url: http://www.imdb.com/title/tt00110912
File: /media/lucassus/Multimedia1/Filmy/watched/Pulp Fiction KLAXXON.avi

----------------------------

Star Wars: Episode V - The Empire Strikes Back
After the rebels have been brutally overpowered by the Empire on their newly established base, Luke Skywalker takes advanced Jedi training with Master Yoda, while his friends are pursued by Darth Vader as part of his plan to capture Luke.

Rating: 8.8 Year: 1980 Duration: 124 min
Genre: Action, Adventure, Fantasy, Sci-Fi
Directors: Irvin Kershner
Cast: Mark Hamill, Harrison Ford, Carrie Fisher, Billy Dee Williams, Anthony Daniels, David Prowse, Peter Mayhew
Country: USA Language: English
Url: http://www.imdb.com/title/tt00080684
File: /media/lucassus/Multimedia1/Filmy/watched/Star Wars/Star Wars Episode V - The Empire Strikes Back.avi

----------------------------

One Flew Over the Cuckoo's Nest
Upon admittance to a mental institution, a brash rebel rallies the patients to take on the oppressive head nurse.

Rating: 8.8 Year: 1975 Duration: 133 min
Genre: Drama
Directors: Milos Forman
Cast: Michael Berryman, Peter Brocco, Dean R. Brooks, Alonzo Brown, Scatman Crothers, Mwako Cumbuka, Danny DeVito
Country: USA Language: English
Url: http://www.imdb.com/title/tt00073486
File: /media/lucassus/Multimedia1/Filmy/watched/OneFlewOverTheCuckoosNest.avi
```
