//Get DOM elements
const episodeContainer = document.querySelector('#episode');
const showContainer = document.querySelector('#showContainer');
const searchInput = document.querySelector('input');
const searchResult = document.querySelector('#output');
const showsDropdown = document.querySelector('#shows');
const seriesDropdown = document.querySelector('#series');
const displayShow = document.querySelector('#displayShow');


// Assign global variables
const listOfShows = 'https://api.tvmaze.com/shows';
let show = 'https://api.tvmaze.com/shows/82/episodes';
let selectionOfShows = [];
let episodesList = [];

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
}

fetchShows();

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
}

function makeDropdownForShows(selectionOfShows) {
  selectionOfShows.forEach(show => {
    showsDropdown.innerHTML += `<option value="${show.id}">${show.name}</option>`;
  })
}

function getNumber(number) {
  return number < 10? `0${number}` : number;
}
// Main function to display all shows
function makePageForShows(showList) {
  let result = '';
  showList.forEach(show => {
    result += `
    <div class="each__show">
     <h1>${show.name}</h1>
      <div class="show__wrap">
        <div class="content__wrap">
          <img src="${show.image.medium}" alt="">
          ${show.summary}
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
}

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
}

function makeDropdownForEpisodes() {
  let result =  '<option value="">Choose an episode</option>';
  episodesList.forEach(episode => {
    let episodeNum = getNumber(episode.number);
    let episodeSeason = getNumber(episode.season);
     result += `<option value="${episode.name}">S${episodeSeason}E${episodeNum} - ${episode.name}</option>`;
  })
  seriesDropdown.innerHTML = result;
}

// Two functions below get a/an show/episode and display it
function getSelectedShow(selectedShow) {
  const clickedShow = selectionOfShows.find(show => {
    return show.name.includes(selectedShow);
  }) 
  const selectShow = selectionOfShows.filter(show => {
    return show.name.includes(selectedShow);
  })
  const link = clickedShow._links.self.href;
  show = `${link}/episodes`;
  
  fetchEpisodes(show);
  setTimeout(()=> {
    makePageForShows(selectShow);
  }, 2000);
}

function getSelectedEpisode(selectedEpisode) {
  const foundEpisode = episodesList.filter(episode => {
    return episode.name.includes(selectedEpisode);
  })
  makePageForEpisodes(foundEpisode);
}

// Function below gets value and returns trimmed and lower cased string/value
function getFinderValue () {
  return searchInput.value.trim().toLocaleLowerCase().replace(/[^a-zA-Z0-9]/g, ''); 
}

function displayFounded() {
  const finderValue = getFinderValue();
  const filteredEpisodes = episodesList.filter(episode => {
    return episode.name.toLocaleLowerCase().includes(finderValue) ||
    episode.summary.toLocaleLowerCase().includes(finderValue);
  })
  makePageForEpisodes(filteredEpisodes);
  searchResult.textContent = `Displaying ${filteredEpisodes.length}/${episodesList.length} episodes`;
}

// List of event listeners
searchInput.addEventListener('keydown', () => {
 displayFounded();
})

showsDropdown.addEventListener('change', (event) => {
  if (event.target.value !== '') {
 // const regex = /[^\d]/g;
  let showId = event.target.value;
  show = `https://api.tvmaze.com/shows/${showId}/episodes`;
  fetchEpisodes(show);
  } else {
    makePageForShows(selectionOfShows)
  }
})

seriesDropdown.addEventListener('change', (event) => {
  if (event.target.value !== '') {
    getSelectedEpisode(event.target.value)
  } else {
    makePageForEpisodes(episodesList);
  }
})

showContainer.addEventListener('click', (event) => {
  if (event.target.tagName === 'H1') {
    getSelectedShow(event.target.textContent);
  }
})

displayShow.addEventListener('click', () => {
  makePageForShows(selectionOfShows);
})