const options = {
  method: "GET",
  headers: {
    accept: "application/json",
    Authorization: "Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIyMzUyMzc0NGIzOTgxMWM1MDc2NTY3YzhkMmUwNGQ5YSIsInN1YiI6IjY0ZjBlMjBjZTBjYTdmMDEwZGUzZGYxYSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.-vathrEoPmRoSmX1Lh5RMeObU9-Fsswwf3sEHkR0fYQ"
  },
};

const getMovies = async (url) => {
  const movies = await fetch(`${url}`, options).then((response) =>
    response.json()
  );

  const moviePromises = movies.results.map(async (movie) => {
    const imagePaths = await findHighQualityImages(movie);
    const contentRating = await getContentRating(movie);

    return {
      movie: movie.title,
      id: movie.id,
      summary: movie.overview.substring(0, movie.overview.indexOf(".") + 1),
      rating: (movie.vote_average / 2).toString().substring(0, 3),
      poster_path: imagePaths.poster_path,
      backdrop_path: imagePaths.backdrop_path,
      content_rating: contentRating,
    };
  });
  const results = await Promise.all(moviePromises);
  return results;
};

async function getContentRating(movie) {
  try {
    const results = await fetch(
      `https://api.themoviedb.org/3/movie/${movie.id}/release_dates`,
      options
    ).then((response) => response.json());

    const notAStupidLetterRating = results.results
      .find(
        (result) =>
          parseInt(result.release_dates[0].certification).toString().length ===
          2
      )
      .release_dates[0].certification.substring(0, 2);

    let ageRating = notAStupidLetterRating;

    return ageRating.toString();
  } catch {
    (e) => console.error(`Error at ${movie.id}` + e);
  }
}

async function findHighQualityImages(movie) {
  try {
    const images = await fetch(
      `https://api.themoviedb.org/3/movie/${movie.id}/images`,
      options
    ).then((response) => response.json());
    function compare(a, b) {
      if (a.vote_count > b.vote_count) return -1;
      if (a.vote_count < b.vote_count) return 1;
    }

    const filteredBackdrops = images.backdrops.sort(compare);
    const filteredPosters = images.posters.sort(compare);

    const has4KBackdrop = filteredBackdrops.find(
      (image) =>
        image.width === 3840 &&
        image.aspect_ratio === 1.778 &&
        image.iso_639_1 === "en"
    );
    const has1080PBackdrop = filteredBackdrops.find(
      (image) =>
        image.width === 1920 &&
        image.aspect_ratio === 1.778 &&
        image.iso_639_1 === "en"
    );

    const backdrop = has4KBackdrop
      ? has4KBackdrop
      : has1080PBackdrop
      ? has1080PBackdrop
      : filteredBackdrops[0];

    const goodPoster = filteredPosters.find(
      (image) =>
        image.width === 2000 &&
        image.aspect_ratio === 0.667 &&
        image.iso_639_1 === "en"
    );
    const poster = goodPoster ? goodPoster : filteredPosters[0];
    return {
      poster_path: poster.file_path,
      backdrop_path: backdrop.file_path,
    };
  } catch {
    (Error) => console.log(`Error at ${movie.id}: ` + Error);
  }
}

export async function loadWebsite() {
  await loadPopularMovies();
  await loadTopRatedMovies();
  await loadTrendingMovies();
}

async function loadPopularMovies() {
  const popularMovies = await getMovies(
    "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1"
  );
  console.log(popularMovies);

  popularMovies.forEach((movie, index) => {
    const popularSection = document.querySelector(".movie-list.popular");
    const movieWheel = popularSection.querySelector(".movie-wheel");

    if (index >= 16) return;
    else if (index <= 16) {
      movieWheel.innerHTML += newMovie(movie);
    }
  });
}

async function loadTopRatedMovies() {
  const topRatedMovies = await getMovies(
    "https://api.themoviedb.org/3/movie/top_rated"
  );

  topRatedMovies.forEach((movie, index) => {
    const topRatedSection = document.querySelector(".movie-list.top-rated");
    const movieWheel = topRatedSection.querySelector(".movie-wheel");

    if (index >= 16) return;
    else if (index <= 16) {
      movieWheel.innerHTML += newMovie(movie);
    }
  });
}

async function loadTrendingMovies() {
  const trendingMovies = await getMovies(
    "https://api.themoviedb.org/3/trending/movie/week"
  );

  trendingMovies.forEach((movie, index) => {
    const trendingSection = document.querySelector(".movie-list.trending-week");
    const movieWheel = trendingSection.querySelector(".movie-wheel");

    if (index >= 16) return;
    else if (index <= 16) {
      movieWheel.innerHTML += newMovie(movie);
    }
  });
}

function filterStuff(stuff, maxLength) {
  if (stuff.length <= maxLength) {
    return stuff;
  }

  const words = stuff.split(" ");
  const truncatedWords = [];
  let currentLength = 0;

  for (const word of words) {
    if (currentLength + word.length + truncatedWords.length <= maxLength - 3) {
      truncatedWords.push(word);
      currentLength += word.length;
    } else break;
  }

  const truncatedStuff = truncatedWords.join(" ") + "...";
  return truncatedStuff;
}

function newMovie(movie) {
  let movieToBeAdded = `<div class="movie-wheel-movie" id="${movie.id}">
        <div class="image-wrapper">
          <img src="https://www.themoviedb.org/t/p/w440_and_h660_face${
            movie.poster_path
          }" />
        </div>
        <div class="movie-wheel-movie-context-menu" id="${movie.id}">
          <span class="context-menu-backdrop">
            <img class="backdrop-img" src="https://image.tmdb.org/t/p/w780${
              movie.backdrop_path
            }">
          </span>
          <div class="context-menu-title">
            <h2>${filterStuff(movie.movie, 16)}</h2>
            <h3>TV-${movie.content_rating}</h3>
            <div class="rating">
              <i class="fa fa-star"></i>
              <p>${movie.rating}</p>
            </div>
          </div>
          <div class="context-menu-description">
            <p>${movie.summary}</p>
          </div>
          <div class="buttons">
            <div>
              <i class="fa-solid fa-book-open"></i>
              <h3>Read More</h3>
            </div>
            <div id="${movie.id}">
              <i class="fa-solid fa-plus"></i>
              <h3>Add to Favorites</h3>
            </div>
          </div>
        </div>
      </div>`;
  return movieToBeAdded;
}

export async function fixBullshitRatings() {
  await loadWebsite();
  const movieRatings = document.querySelectorAll(".context-menu-title h3");
  movieRatings.forEach((movieRating) => {
    if (movieRating.textContent.includes("undefined")) {
      movieRating.textContent = "TV-R";
    }
  });
}
