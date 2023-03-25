//Get DOM elements
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
let show = 'https://api.tvmaze.com/shows/82/episodes';
let selectionOfShows = [];
let episodesList = [];
let activePageButton = 1;
let slideWidth = carousel.offsetWidth / 5.45;
let slideIndex = 0;

// Fetch all shows and display it
async function fetchShows() {
  try {
    const response = await fetch(listOfShows);
    selectionOfShows = await response.json();
    selectionOfShows.sort((a, b) => {
      return a.name.localeCompare(b.name);
    })
    makePageForShows(selectionOfShows);
    makeDropdownForShows(selectionOfShows);
    
    console.log(selectionOfShows)
  } catch (error) {
    console.error(error);
  }
};

fetchShows();

// Fetch episodes of the selected show
async function fetchEpisodes (show) {
  try {
    const response = await fetch(show);
    episodesList = await response.json();
    makePageForEpisodes(episodesList);
    makeDropdownForEpisodes();
    console.log("Fetched")
  } catch (error) {
    console.error(error);
  }
};

// Create dropdown for given shows
function makeDropdownForShows(selectionOfShows) {
  selectionOfShows.forEach(show => {
    showsDropdown.innerHTML += `<option value="${show.name}">${show.name}</option>`;
  })
};

// Transform season and episode numbers in correct format
function getNumber(number) {
  return number < 10? `0${number}` : number;
};

// Main function to display all shows
function makePageForShows(showList) {
  let result = '';
  const maxLength = 350;
  const page = showList.slice(0, 5);
  page.forEach(show => {
    let summary = show.summary;
    let truncatedSummary = show.summary.substring(0, maxLength).trim();
    let btnReadMore = "hidden";
    if (show.summary.length > maxLength) {
      summary = truncatedSummary
      btnReadMore = '';
    }
    result += `
    <div class="each__show">
     <h1>${show.name}</h1>
      <div class="show__wrap">
        <div class="content__wrap">
          <img src="${show.image.medium}" alt="">
          <div>
          <span class="${show.id}" id="summaryText">${summary}</span>
          <span id="read-more-button" class="${btnReadMore}">...read more</span>
          </div>
        </div>
        <div class="props">
          <p>Rated: ${show.rating.average}</p>
          <p>Genres: ${show.genres}</p>
          <p>Status: ${show.status}</p>
          <p>Runtime: ${show.runtime}</p>
        </div>
      </div>
    </div>` 
  })
  showList.length < 5? pageButton.classList.add('hidden'):pageButton.classList.remove('hidden'); // Check whether to show pagination
  showContainer.classList.remove('hidden');
  showContainer.innerHTML = result;
  episodeContainer.innerHTML = '';
};

// Main function to display all episodes
function makePageForEpisodes(episodeList) {
  let result = '';
  episodeList.forEach(episode => {
    let episodeNum = getNumber(episode.number);
    let episodeSeason = getNumber(episode.season);
    result += `
    <div class="episode__wrap">
        <div class="episode__header">
          <h3>${episode.name} - S${episodeSeason}E${episodeNum}</h3>
        </div>
        <div class="episode__info">
          <img src="${episode.image.medium}" alt="">
          ${episode.summary}
        </div>
    </div>`
  })
  searchResult.textContent = `Displaying ${episodeList.length}/${episodesList.length} episodes`;
  showContainer.classList.add('hidden');
  episodeContainer.innerHTML = result;
};

function renderPage(list, pageSize) {
  const startIndex = (activePageButton - 1) * pageSize;
  const endIndex = activePageButton * pageSize;
  const page = list.slice(startIndex, endIndex);
  makePageForShows(page);
}

const renderActivePageBtn = () => {
  const pageBar = document.querySelectorAll('.page-link');
  pageBar.forEach(page => {
    if (page.textContent != activePageButton) {
      page.classList.remove('active');
    } else if (page.textContent == activePageButton) {
      page.classList.add('active');
    }
  })
}

// Create dropdown for selected episodes
function makeDropdownForEpisodes() {
  let result =  '<option value="">Choose episode</option>';
  episodesList.forEach(episode => {
    let episodeNum = getNumber(episode.number);
    let episodeSeason = getNumber(episode.season);
     result += `<option value="${episode.name}">S${episodeSeason}E${episodeNum} - ${episode.name}</option>`;
  })
  seriesDropdown.innerHTML = result;
};

// These 3 functions below get a/an show/episode and display it
function getSelectedShow(showName) {
  const selectedShow = selectionOfShows.filter(show => {
    return show.name.includes(showName);
  })
  makePageForShows(selectedShow);
};

function getEpisodesOfSelectedShow(selectedShow) {
  const clickedShow = selectionOfShows.find(show => {
    return show.name.includes(selectedShow);
  }) 
  const link = clickedShow._links.self.href;
  show = `${link}/episodes`;
  fetchEpisodes(show);
  searchShow.value = '';
};

function getSelectedEpisode(selectedEpisode) {
  const foundEpisode = episodesList.filter(episode => {
    return episode.name.includes(selectedEpisode);
  })
  makePageForEpisodes(foundEpisode);
};

// Function below gets value and returns trimmed and lower cased string/value
function getSearchInputValue(searchInput) {
  return searchInput.value.trim().toLocaleLowerCase().replace(/[^a-zA-Z0-9]/g, ' '); 
};

// Display retrieved show/s
function displayShow() {
  const searchShowValue = getSearchInputValue(searchShow);
  console.log(searchShowValue)
  const filteredShows = selectionOfShows.filter(show => {
    return show.name.toLocaleLowerCase().includes(searchShowValue) ||
    show.summary.toLocaleLowerCase().includes(searchShowValue);
  })
  makePageForShows(filteredShows);
};

// Display retrieved episode/s
function displayEpisode() {
  const finderValue = getSearchInputValue(searchEpisode);
  const filteredEpisodes = episodesList.filter(episode => {
    return episode.name.toLocaleLowerCase().includes(finderValue) ||
    episode.summary.toLocaleLowerCase().includes(finderValue);
  })
  makePageForEpisodes(filteredEpisodes);
};

// Expand clicked summary
function expandSummary(spanId, span) {
  const searchSummary = selectionOfShows.find(show => {
    return show.id === spanId;
  })
  span.innerHTML = searchSummary.summary;  
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
};

function addCarouselPoster() {
  const poster = selectionOfShows[Math.floor(Math.random() * selectionOfShows.length)].image.medium;
  carouselContainer.innerHTML += `<img src="${poster}">`;
};
 
startCarousel();

function getSelectedPoster(poster) {
  const show = selectionOfShows.filter(show => {
     return show.image.medium.includes(poster);
  })
  makePageForShows(show);
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
  seriesDropdown.classList.remove("hidden");
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
    makePageForShows(selectionOfShows)
  }
});

seriesDropdown.addEventListener('change', (event) => {
  if (event.target.value !== '') {
    getSelectedEpisode(event.target.value)
  } else {
    makePageForEpisodes(episodesList);
  }
});

showContainer.addEventListener('click', (event) => {
  if (event.target.tagName === 'H1') {
    getEpisodesOfSelectedShow(event.target.textContent);
    displayEpisodeBar();
  }
});

buttonShow.addEventListener('click', () => {
  displayShowsBar();
  renderPage(selectionOfShows, 5)
});

document.addEventListener('click', (event) => {
  if (event.target.tagName === "SPAN") {
  const spanSummary = event.target.parentNode.parentNode;
  const spanId = Number(event.target.parentNode.parentNode.className);
  event.target.classList.add('hidden');
  expandSummary(spanId, spanSummary);
  } 
});

function addNewPageBtn() {
  const numOfPages = pagesContainer.children.length;
  activePageButton++;
  renderPage(selectionOfShows, 5);
  renderActivePageBtn();
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
    renderPage(selectionOfShows, 5);
    renderActivePageBtn();
    if (numOfPages >= 6) {
      const firstPageNum = activePageButton - 4;
      const firstPage = pagesContainer.querySelector(`.page-item:nth-child(${firstPageNum})`);
      const lastPage = pagesContainer.querySelector(`.page-item:nth-child(${activePageButton + 1})`)
      lastPage.remove();
      firstPage.style.display = '';
    }
  }
}

pageButton.addEventListener('click', (event) => {
  const pageNum = Number(event.target.textContent);
  const pageContent = event.target.textContent;
  //activePageButton < selectionOfShows.length / 5
  if (!isNaN(pageNum)) {
    activePageButton = pageNum;
    renderPage(selectionOfShows, 5);
    renderActivePageBtn(pageContent);
  } else if (pageContent === 'Next') {
    addNewPageBtn();
  } else if (pageContent === 'Previous') {
    moveBackPage();
  }
})

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