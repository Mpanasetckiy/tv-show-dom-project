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

// Assign global variables
const listOfShows = 'https://api.tvmaze.com/shows';
let show = 'https://api.tvmaze.com/shows/82/episodes';
let selectionOfShows = [];
let episodesList = [];
let activePageButton = 1;

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
  const maxLength = 300;
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
  pagesContainer.innerHTML = `
  <li class="page-item"><a class="page-link">${activePageButton - 1}</a></li>
  <li class="page-item"><a class="page-link">${activePageButton}</a></li>
  <li class="page-item"><a class="page-link">${activePageButton + 1}</a></li>`;
  const pageBar = document.querySelectorAll('.page-link');
  pageBar.forEach(page => {
    console.log(page.textContent)
    if (page.textContent != activePageButton) {
      page.classList.remove('active');
    } else if (page.textContent == activePageButton) {
      page.classList.add('active');
    }
  })
  
  console.log(activePageButton)
}

// Create dropdown for selected episodes
function makeDropdownForEpisodes() {
  let result =  '<option value="">Choose an episode</option>';
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
  seriesDropdown.classList.remove("hidden");
  showsDropdown.classList.add('hidden');
  searchEpisode.classList.remove('hidden');
  searchShow.classList.add('hidden');
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
  searchResult.textContent = `Displaying ${filteredEpisodes.length}/${episodesList.length} episodes`;
};

// Expand clicked summary
function expandSummary(spanId, span) {
  const searchSummary = selectionOfShows.find(show => {
    return show.id === spanId;
  })
  span.innerHTML = searchSummary.summary;  
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
  }
});

buttonShow.addEventListener('click', () => {
  searchEpisode.classList.add('hidden');
  showsDropdown.classList.remove('hidden');
  seriesDropdown.classList.add('hidden');
  searchShow.classList.remove('hidden');
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

pageButton.addEventListener('click', (event) => {
  const pageNum = Number(event.target.textContent);
  const pageContent = event.target.textContent;
  if (!isNaN(pageNum) && activePageButton < selectionOfShows.length / 5) {
    activePageButton = pageNum;
    renderPage(selectionOfShows, 5)
    renderActivePageBtn(pageContent)
  } else if (pageContent === 'Next' && activePageButton < selectionOfShows.length / 5) {
    activePageButton++;
    renderPage(selectionOfShows, 5)
    renderActivePageBtn();
  }
})

