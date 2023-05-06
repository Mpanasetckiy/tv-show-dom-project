/* eslint-disable quotes */
/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* eslint-disable no-plusplus */

// Get DOM elements
const episodeContainer = document.querySelector("#episode");
const showContainer = document.querySelector("#showContainer");
const searchShow = document.querySelector("#searchShow");
const searchEpisode = document.querySelector("#searchEpisode");
const searchResult = document.querySelector("#output");
const showsDropdown = document.querySelector("#shows");
const seriesDropdown = document.querySelector("#series");
const buttonShow = document.querySelector("#displayShow");
const pageButton = document.querySelector(".pagination");
const pagesContainer = document.querySelector(".pagination__pages");
const seasonContainer = document.querySelector("#seasonContainer");

// DOM elements for carousel
const carousel = document.querySelector(".carousel");
const carouselContainer = document.querySelector(".carousel-container");
const prevBtn = document.querySelector(".prev-btn");
const nextBtn = document.querySelector(".next-btn");

// Assign global variables
const listOfShows = "https://api.tvmaze.com/shows";
const slideWidth = carousel.offsetWidth / 5.45;
let currentShow = "https://api.tvmaze.com/shows/82/episodes";
let currentSeason = "https://api.tvmaze.com/shows/82/seasons";
let selectionOfShows = [];
let seasonList = [];
let episodesList = [];
let activePageButton = 1;
let slideIndex = 0;
let episodePageActive = false;

fetchShows();

// Fetch all shows/seasons/episodes and display them
async function fetchShows() {
  try {
    const response = await fetch(listOfShows);
    selectionOfShows = await response.json();
    selectionOfShows.sort((a, b) => a.name.localeCompare(b.name));
    makePageForShows(selectionOfShows);
    makeDropdownForShows(selectionOfShows);
    console.log(selectionOfShows);
  } catch (error) {
    console.error(error);
  }
}

// Fetch season of the selected show
async function fetchSeason() {
  try {
    const response = await fetch(currentSeason);
    seasonList = await response.json();
    makePageForSeasons(seasonList);
  } catch (error) {
    console.error(error);
  }
}

// Fetch episodes of the selected show
async function fetchEpisodes() {
  try {
    const response = await fetch(currentShow);
    episodesList = await response.json();
    makeDropdownForEpisodes();
  } catch (error) {
    console.error(error);
  }
}

// Create dropdown for given shows
function makeDropdownForShows(arrOfShows) {
  arrOfShows.forEach((show) => {
    showsDropdown.innerHTML += `<option value="${show.name}">${show.name}</option>`;
  });
}

// Transform season and episode numbers in correct format
function getNumber(number) {
  return number < 10 ? `0${number}` : number;
}

// Check whether to display pagination
function whetherToShowPagination(showList) {
  if (showList.length < 5) {
    pageButton.classList.add("hidden");
  } else {
    pageButton.classList.remove("hidden");
  }
}

// Main function to display all shows
function makePageForShows(showList) {
  const summaryLength = 350;
  const page = showList.slice(0, 5);
  let result = "";

  page.forEach((show) => {
    const truncatedSummary = show.summary.substring(0, summaryLength).trim();
    const btnReadMoreClass =
      show.summary.length > summaryLength ? "" : "hidden";
    const summaryText =
      show.summary.length > summaryLength ? truncatedSummary : show.summary;
    result += `
    <div class="each__show">
     <h1 id="${show.id}">${show.name}</h1>
      <div class="show__wrap">
        <div class="content__wrap">
        <div class="image__container">
        <img src="${show.image.medium}" alt="">
        <div class="play-circle" id="${show.id}">
            <i class="fas fa-play" id="${show.id}"></i>
          </div>
        </div>
          <div>
          <span class="${show.id}" id="summaryText">${summaryText}</span>
          <span id="read-more-button" class="${btnReadMoreClass}">...read more</span>
          </div>
        </div>
        <div class="props">
          <p>Rated: ${show.rating.average}</p>
          <p>Genres: ${show.genres}</p>
          <p>Status: ${show.status}</p>
          <p>Runtime: ${show.runtime}</p>
        </div>
      </div>
    </div>`;
  });
  showContainer.classList.remove("hidden");
  showContainer.innerHTML = result;
  episodeContainer.innerHTML = "";
  whetherToShowPagination(showList);
}

// Main function to display all seasons
const makePageForSeasons = (seasonArr) => {
  const result = seasonArr.reduce(
    (acc, { number, image: { medium }, summary }) => {
      const isNull = summary === null ? "" : summary;
      const season = `
        <div class="episode__wrap">
            <div class="episode__info">
              <h2 id="${number}">Season ${number}</h2>
              <img id="${number}" src="${medium}" alt="">
              ${isNull}
            </div>
        </div>`;
      return acc + season;
    },
    ""
  );
  seasonContainer.innerHTML = result;
};

// Main function to display all episodes
function makePageForEpisodes(episodeList) {
  const result = episodeList.reduce(
    (acc, { name, number, season, summary, image: { medium } }) => {
      const episodeNum = getNumber(number);
      const episodeSeason = getNumber(season);
      const episode = `
      <div class="episode__wrap">
          <div class="episode__header">
            <h3>${name} - S${episodeSeason}E${episodeNum}</h3>
          </div>
          <div class="episode__info">
            <img src="${medium}" alt="">
            ${summary}
          </div>
      </div>`;
      return acc + episode;
    },
    ""
  );
  searchResult.textContent = `Displaying ${episodeList.length}/${episodesList.length} episodes`;
  // pageButton.classList.remove('hidden');
  showContainer.classList.add("hidden");
  episodeContainer.innerHTML = result;
}

// Pagination functionality
function isEpisodePageActiveOrShowPage() {
  if (episodePageActive) {
    renderPage(null, 9, episodesList);
  } else {
    renderPage(selectionOfShows, 5, null);
  }
}

function renderPage(shows, pageSize, episodes) {
  const startIndex = (activePageButton - 1) * pageSize;
  const endIndex = activePageButton * pageSize;
  if (shows !== null) {
    const page = shows.slice(startIndex, endIndex);
    makePageForShows(page);
  } else if (episodes !== null) {
    const page = episodes.slice(startIndex, endIndex);
    makePageForEpisodes(page);
  }
}

const renderActivePageBtn = () => {
  const pageBar = document.querySelectorAll(".page-link");
  pageBar.forEach((page) => {
    if (Number(page.textContent) !== activePageButton) {
      page.classList.remove("active");
    } else if (Number(page.textContent) === activePageButton) {
      page.classList.add("active");
    }
  });
};

function addNewPageBtn() {
  const numOfPages = pagesContainer.children.length;
  activePageButton++;
  isEpisodePageActiveOrShowPage();
  if (activePageButton > numOfPages) {
    if (numOfPages >= 5) {
      const firstPageNum = activePageButton - 5;
      const firstPage = pagesContainer.querySelector(
        `.page-item:nth-child(${firstPageNum})`
      );
      for (let i = 1; i < firstPageNum; i++) {
        const page = pagesContainer.querySelector(`.page-item:nth-child(${i})`);
        page.style.display = "none";
      }
      firstPage.style.display = "none";
    }
    pagesContainer.innerHTML += `<li class="page-item"><a class="page-link">${activePageButton}</a></li>`;
  }
  renderActivePageBtn();
}

function moveBackPage() {
  const numOfPages = pagesContainer.children.length;
  if (activePageButton > 1) {
    activePageButton--;
    isEpisodePageActiveOrShowPage();
    renderActivePageBtn();
    if (numOfPages >= 6) {
      const firstPageNum = numOfPages - 5;
      const firstPage = pagesContainer.querySelector(
        `.page-item:nth-child(${firstPageNum})`
      );
      const lastPage = pagesContainer.querySelector(
        `.page-item:nth-child(${numOfPages})`
      );
      lastPage.remove();
      firstPage.style.display = "";
    }
  }
}

// Create dropdown for selected episodes
function makeDropdownForEpisodes() {
  let result = '<option value="">Choose episode</option>';
  episodesList.forEach(({ name, number, season }) => {
    const episodeNum = getNumber(number);
    const episodeSeason = getNumber(season);
    result += `<option value="${name}">S${episodeSeason}E${episodeNum} - ${name}</option>`;
  });
  seriesDropdown.innerHTML = result;
}

// These 4 functions below get show/season/episode and display it
function getSelectedShow(showName) {
  const selectedShow = selectionOfShows.filter(({ name }) => name === showName);
  makePageForShows(selectedShow);
}

function getSeasonsOfSelectedShow(selectedShowId) {
  const clickedShow = selectionOfShows.find(({ id }) => id === selectedShowId);
  const { _links } = clickedShow;
  const link = _links.self.href;
  currentShow = `${link}/episodes`;
  currentSeason = `${link}/seasons`;
  fetchSeason(currentSeason);
  searchShow.value = "";
}

const getEpisodesOfSelectedSeason = (selectedSeason) => {
  const seasonNum = Number(selectedSeason);
  const numOfEpisodes = episodesList.filter(
    ({ season }) => season === seasonNum
  );
  makePageForEpisodes(numOfEpisodes);
};

function getSelectedEpisode(selectedEpisode) {
  const foundEpisode = episodesList.filter(({ name }) =>
    name.includes(selectedEpisode)
  );
  pageButton.classList.add("hidden");
  makePageForEpisodes(foundEpisode);
}

// Function below gets value and returns trimmed and lower cased string/value
function getSearchInputValue(searchInput) {
  return searchInput.value
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-zA-Z0-9]/g, " ");
}

// Display retrieved show/s
function displayShow() {
  const searchShowValue = getSearchInputValue(searchShow);
  const filteredShows = selectionOfShows.filter(
    ({ name, summary }) =>
      name.toLocaleLowerCase().includes(searchShowValue) ||
      summary.toLocaleLowerCase().includes(searchShowValue)
  );
  renderPage(filteredShows, 5, null);
}

// Display retrieved episode/s
function displayEpisode() {
  const finderValue = getSearchInputValue(searchEpisode);
  const filteredEpisodes = episodesList.filter(
    ({ name, summary }) =>
      name.toLocaleLowerCase().includes(finderValue) ||
      summary.toLocaleLowerCase().includes(finderValue)
  );
  renderPage(null, 9, filteredEpisodes);
}

// Expand clicked summary
function expandSummary(spanId, spanSummary) {
  const summary = spanSummary;
  const searchSummary = selectionOfShows.find(({ id }) => id === spanId);
  summary.innerHTML = searchSummary.summary;
}

// Functionality for carousel
function startCarousel() {
  setInterval(() => {
    slideIndex++;
    if (slideIndex >= carouselContainer.children.length) {
      slideIndex = 0;
    }
    addCarouselPoster();
    carouselContainer.style.transform = `translateX(-${
      slideIndex * slideWidth
    }px)`;
  }, 3000);
}

function addCarouselPoster() {
  const poster =
    selectionOfShows[Math.floor(Math.random() * selectionOfShows.length)].image
      .medium;
  carouselContainer.innerHTML += `<img src="${poster}">`;
}

startCarousel();

function getSelectedPoster(poster) {
  const selectedShow = selectionOfShows.filter(({ image: { medium } }) =>
    medium.includes(poster)
  );
  makePageForShows(selectedShow);
}

// Two functions to display or hide bars
function displayShowsBar() {
  searchEpisode.classList.add("hidden");
  seriesDropdown.classList.add("hidden");
  showsDropdown.classList.remove("hidden");
  searchShow.classList.remove("hidden");
  searchResult.textContent = "";
  searchEpisode.value = "";
}

function displayEpisodeBar() {
  seriesDropdown.classList.remove("hidden");
  searchEpisode.classList.remove("hidden");
  showsDropdown.classList.add("hidden");
  searchShow.classList.add("hidden");
}

// List of event listeners
searchEpisode.addEventListener("input", () => {
  displayEpisode();
});

searchShow.addEventListener("input", () => {
  seasonContainer.classList.add("hidden");
  displayShow();
});

showsDropdown.addEventListener("change", (event) => {
  if (event.target.value !== "") {
    getSelectedShow(event.target.value);
  } else {
    makePageForShows(selectionOfShows);
  }
});

seriesDropdown.addEventListener("change", (event) => {
  if (event.target.value !== "") {
    getSelectedEpisode(event.target.value);
  } else {
    renderPage(null, 9, episodesList);
    pageButton.classList.remove("hidden");
  }
});

showContainer.addEventListener("click", (event) => {
  if (
    event.target.tagName === "H1" ||
    event.target.className === "play-circle" ||
    event.target.tagName === "I"
  ) {
    getSeasonsOfSelectedShow(Number(event.target.id));
    pageButton.classList.add("hidden");
    showContainer.classList.add("hidden");
    seasonContainer.classList.remove("hidden");
    fetchEpisodes();
  }
});

seasonContainer.addEventListener("click", (event) => {
  if (event.target.tagName === "H2" || event.target.tagName === "IMG") {
    episodePageActive = true;
    seasonContainer.classList.add("hidden");
    getEpisodesOfSelectedSeason(event.target.id);
    displayEpisodeBar();
  }
});

buttonShow.addEventListener("click", () => {
  seasonContainer.classList.remove("hidden");
  seasonContainer.innerHTML = "";
  searchShow.value = "";
  episodePageActive = false;
  activePageButton = 1;
  displayShowsBar();
  renderActivePageBtn();
  renderPage(selectionOfShows, 5, null);
});

document.addEventListener("click", (event) => {
  if (event.target.tagName === "SPAN") {
    const spanSummary = event.target.parentNode.parentNode;
    const spanId = Number(event.target.parentNode.parentNode.className);
    event.target.classList.add("hidden");
    expandSummary(spanId, spanSummary);
  }
});

pageButton.addEventListener("click", (event) => {
  const pageNum = Number(event.target.textContent);
  const pageContent = event.target.textContent;
  if (!Number.isNaN(pageNum)) {
    activePageButton = pageNum;
    isEpisodePageActiveOrShowPage();
    renderActivePageBtn();
  } else if (pageContent === "Next") {
    // Check whether to add page button or not, based on location and arr.length
    if (!episodePageActive && activePageButton < selectionOfShows.length / 5) {
      addNewPageBtn();
    } else if (
      episodePageActive &&
      activePageButton < episodesList.length / 9
    ) {
      addNewPageBtn();
    }
  } else if (pageContent === "Previous") {
    moveBackPage();
  }
});

prevBtn.addEventListener("click", () => {
  slideIndex--;
  if (slideIndex < 0) {
    slideIndex = carouselContainer.children.length - 1;
  }
  carouselContainer.style.transform = `translateX(-${
    slideIndex * slideWidth
  }px)`;
});

nextBtn.addEventListener("click", () => {
  slideIndex++;
  if (slideIndex >= carouselContainer.children.length) {
    slideIndex = 0;
  }
  carouselContainer.style.transform = `translateX(-${
    slideIndex * slideWidth
  }px)`;
  addCarouselPoster();
});

carouselContainer.addEventListener("click", (event) => {
  if (event.target.tagName === "IMG") {
    seasonContainer.innerHTML = "";
    seasonContainer.classList.remove("hidden");
    activePageButton = 1;
    displayShowsBar();
    getSelectedPoster(event.target.getAttribute("src"));
  }
});
