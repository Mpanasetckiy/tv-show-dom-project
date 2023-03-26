/* eslint-disable no-console */
/* eslint-disable no-use-before-define */
/* eslint-disable no-plusplus */
// Get DOM elements
const episodeContainer = document.querySelector('#episode');
const showContainer = document.querySelector('#showContainer');
const searchShow = document.querySelector('#searchShow');
const searchEpisode = document.querySelector('#searchEpisode');
const searchResult = document.querySelector('#output');
const showsDropdown = document.querySelector('#shows');
const seriesDropdown = document.querySelector('#series');
const buttonShow = document.querySelector('#displayShow');
const pageButton = document.querySelector('.pagination');
const pagesContainer = document.querySelector('.pagination__pages');

// DOM elements for carousel
const carousel = document.querySelector('.carousel');
const carouselContainer = document.querySelector('.carousel-container');
const prevBtn = document.querySelector('.prev-btn');
const nextBtn = document.querySelector('.next-btn');

// Assign global variables
const listOfShows = 'https://api.tvmaze.com/shows';
const slideWidth = carousel.offsetWidth / 5.45;
let currentShow = 'https://api.tvmaze.com/shows/82/episodes';
let selectionOfShows = [];
let episodesList = [];
let activePageButton = 1;
let slideIndex = 0;
let episodePageActive = false;

// Fetch all shows and display it
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

fetchShows();

// Fetch episodes of the selected show
async function fetchEpisodes(show) {
  try {
    const response = await fetch(show);
    episodesList = await response.json();
    renderPage(null, 9, episodesList);
    makeDropdownForEpisodes();
    console.log('Fetched');
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
    pageButton.classList.add('hidden');
  } else {
    pageButton.classList.remove('hidden');
  }
}

// Main function to display all shows
function makePageForShows(showList) {
  const summaryLength = 350;
  const page = showList.slice(0, 5);
  let result = '';

  page.forEach((show) => {
    const truncatedSummary = show.summary.substring(0, summaryLength).trim();
    const btnReadMoreClass = show.summary.length > summaryLength ? '' : 'hidden';
    const summaryText = show.summary.length > summaryLength ? truncatedSummary : show.summary;
    result += `
    <div class="each__show">
     <h1>${show.name}</h1>
      <div class="show__wrap">
        <div class="content__wrap">
          <img src="${show.image.medium}" alt="">
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
  showContainer.classList.remove('hidden');
  showContainer.innerHTML = result;
  episodeContainer.innerHTML = '';
  whetherToShowPagination(showList);
}

// Main function to display all episodes
function makePageForEpisodes(episodeList) {
  let result = '';
  episodeList.forEach((episode) => {
    const episodeNum = getNumber(episode.number);
    const episodeSeason = getNumber(episode.season);
    result += `
    <div class="episode__wrap">
        <div class="episode__header">
          <h3>${episode.name} - S${episodeSeason}E${episodeNum}</h3>
        </div>
        <div class="episode__info">
          <img src="${episode.image.medium}" alt="">
          ${episode.summary}
        </div>
    </div>`;
  });
  searchResult.textContent = `Displaying ${episodeList.length}/${episodesList.length} episodes`;
  pageButton.classList.remove('hidden');
  showContainer.classList.add('hidden');
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
  const pageBar = document.querySelectorAll('.page-link');
  pageBar.forEach((page) => {
    if (Number(page.textContent) !== activePageButton) {
      page.classList.remove('active');
    } else if (Number(page.textContent) === activePageButton) {
      page.classList.add('active');
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
      const firstPage = pagesContainer.querySelector(`.page-item:nth-child(${firstPageNum})`);
      for (let i = 1; i < firstPageNum; i++) {
        const page = pagesContainer.querySelector(`.page-item:nth-child(${i})`);
        page.style.display = 'none';
      }
      firstPage.style.display = 'none';
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
      const firstPage = pagesContainer.querySelector(`.page-item:nth-child(${firstPageNum})`);
      const lastPage = pagesContainer.querySelector(`.page-item:nth-child(${numOfPages})`);
      lastPage.remove();
      firstPage.style.display = '';
    }
  }
}

// Create dropdown for selected episodes
function makeDropdownForEpisodes() {
  let result = '<option value="">Choose episode</option>';
  episodesList.forEach((episode) => {
    const episodeNum = getNumber(episode.number);
    const episodeSeason = getNumber(episode.season);
    result += `<option value="${episode.name}">S${episodeSeason}E${episodeNum} - ${episode.name}</option>`;
  });
  seriesDropdown.innerHTML = result;
}

// These 3 functions below get a/an show/episode and display it
function getSelectedShow(showName) {
  const selectedShow = selectionOfShows.filter((show) => show.name.includes(showName));
  makePageForShows(selectedShow);
}

function getEpisodesOfSelectedShow(selectedShow) {
  const clickedShow = selectionOfShows.find((show) => show.name.includes(selectedShow));
  const { _links } = clickedShow;
  const link = _links.self.href;
  currentShow = `${link}/episodes`;
  fetchEpisodes(currentShow);
  searchShow.value = '';
}

function getSelectedEpisode(selectedEpisode) {
  const foundEpisode = episodesList.filter((episode) => episode.name.includes(selectedEpisode));
  makePageForEpisodes(foundEpisode);
}

// Function below gets value and returns trimmed and lower cased string/value
function getSearchInputValue(searchInput) {
  return searchInput.value
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-zA-Z0-9]/g, ' ');
}

// Display retrieved show/s
function displayShow() {
  const searchShowValue = getSearchInputValue(searchShow);
  const filteredShows = selectionOfShows.filter((show) => show.name
    .toLocaleLowerCase()
    .includes(searchShowValue)
    || show.summary
      .toLocaleLowerCase()
      .includes(searchShowValue));
  makePageForShows(filteredShows);
}

// Display retrieved episode/s
function displayEpisode() {
  const finderValue = getSearchInputValue(searchEpisode);
  const filteredEpisodes = episodesList.filter((episode) => episode.name
    .toLocaleLowerCase()
    .includes(finderValue)
    || episode.summary
      .toLocaleLowerCase()
      .includes(finderValue));
  makePageForEpisodes(filteredEpisodes);
}

// Expand clicked summary
function expandSummary(spanId, spanSummary) {
  const summary = spanSummary;
  const searchSummary = selectionOfShows.find((show) => show.id === spanId);
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
    carouselContainer.style.transform = `translateX(-${slideIndex * slideWidth}px)`;
  }, 3000);
}

function addCarouselPoster() {
  const poster = selectionOfShows[Math.floor(Math.random() * selectionOfShows.length)].image.medium;
  carouselContainer.innerHTML += `<img src="${poster}">`;
}

startCarousel();

function getSelectedPoster(poster) {
  const selectedShow = selectionOfShows.filter((show) => show.image.medium.includes(poster));
  makePageForShows(selectedShow);
}

// Two functions to display or hide bars
function displayShowsBar() {
  searchEpisode.classList.add('hidden');
  seriesDropdown.classList.add('hidden');
  showsDropdown.classList.remove('hidden');
  searchShow.classList.remove('hidden');
  searchResult.textContent = '';
  searchEpisode.value = '';
}

function displayEpisodeBar() {
  seriesDropdown.classList.remove('hidden');
  searchEpisode.classList.remove('hidden');
  showsDropdown.classList.add('hidden');
  searchShow.classList.add('hidden');
}

// List of event listeners
searchEpisode.addEventListener('keydown', () => {
  displayEpisode();
});

searchShow.addEventListener('keydown', () => {
  displayShow();
});

showsDropdown.addEventListener('change', (event) => {
  if (event.target.value !== '') {
    getSelectedShow(event.target.value);
  } else {
    makePageForShows(selectionOfShows);
  }
});

seriesDropdown.addEventListener('change', (event) => {
  if (event.target.value !== '') {
    getSelectedEpisode(event.target.value);
  } else {
    makePageForEpisodes(episodesList);
  }
});

showContainer.addEventListener('click', (event) => {
  if (event.target.tagName === 'H1') {
    episodePageActive = true;
    getEpisodesOfSelectedShow(event.target.textContent);
    displayEpisodeBar();
  }
});

buttonShow.addEventListener('click', () => {
  displayShowsBar();
  episodePageActive = false;
  renderPage(selectionOfShows, 5, null);
});

document.addEventListener('click', (event) => {
  if (event.target.tagName === 'SPAN') {
    const spanSummary = event.target.parentNode.parentNode;
    const spanId = Number(event.target.parentNode.parentNode.className);
    event.target.classList.add('hidden');
    expandSummary(spanId, spanSummary);
  }
});

pageButton.addEventListener('click', (event) => {
  const pageNum = Number(event.target.textContent);
  const pageContent = event.target.textContent;
  if (!Number.isNaN(pageNum)) {
    activePageButton = pageNum;
    isEpisodePageActiveOrShowPage();
    renderActivePageBtn();
  } else if (pageContent === 'Next') {
    // Check whether to add page button or not, based on location and arr.length
    if (!episodePageActive && activePageButton < selectionOfShows.length / 5) {
      addNewPageBtn();
    } else if (episodePageActive && activePageButton < episodesList.length / 9) {
      addNewPageBtn();
    }
  } else if (pageContent === 'Previous') {
    moveBackPage();
  }
});

prevBtn.addEventListener('click', () => {
  slideIndex--;
  if (slideIndex < 0) {
    slideIndex = carouselContainer.children.length - 1;
  }
  carouselContainer.style.transform = `translateX(-${slideIndex * slideWidth}px)`;
});

nextBtn.addEventListener('click', () => {
  slideIndex++;
  if (slideIndex >= carouselContainer.children.length) {
    slideIndex = 0;
  }
  carouselContainer.style.transform = `translateX(-${slideIndex * slideWidth}px)`;
  addCarouselPoster();
});

carouselContainer.addEventListener('click', (event) => {
  if (event.target.tagName === 'IMG') {
    displayShowsBar();
    getSelectedPoster(event.target.getAttribute('src'));
  }
});
