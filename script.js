//Get DOM elements
const episodeContainer = document.querySelector('#episode');
const searchInput = document.querySelector('input');
const searchResult = document.querySelector('#output');
const showsDropdown = document.querySelector('#shows');
const seriesDropdown = document.querySelector('#series');

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
    makeDropdownForShows(selectionOfShows);
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
    showsDropdown.innerHTML += `<option value="${show.url}">${show.name}</option>`;
  })
}

function getNumber(number) {
  return number < 10? `0${number}` : number;
}

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

function getSelectedEpisode(selectedEpisode) {
  const foundEpisode = episodesList.filter(episode => {
    return episode.name.includes(selectedEpisode);
  })
  makePageForEpisodes(foundEpisode);
}


fetchEpisodes(show);

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

searchInput.addEventListener('keydown', () => {
 displayFounded();
})

showsDropdown.addEventListener('change', (event) => {
  const regex = /[^\d]/g;
  let showId = event.target.value.replace(regex, '');
 
  show = `https://api.tvmaze.com/shows/${showId}/episodes`;
  fetchEpisodes(show);
})

seriesDropdown.addEventListener('change', (event) => {
  if (event.target.value !== '') {
    getSelectedEpisode(event.target.value)
  } else {
    makePageForEpisodes(episodesList);
  }
})