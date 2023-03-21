//Get DOM elements
const episodeContainer = document.querySelector('#episode');
const searchInput = document.querySelector('input');
const searchResult = document.querySelector('#output');
const seriesDropdown = document.querySelector('#series');

const url = 'https://api.tvmaze.com/shows/82/episodes';

let episodesList = [];

async function fetchEpisodes () {
  try {
    const response = await fetch(url);
    episodesList = await response.json();
    makePageForEpisodes(episodesList);
    makeDropdownForEpisodes();
    console.log("Fetched")
  } catch (error) {
    console.error(error);
  }
}

function makePageForEpisodes(episodeList) {
  let result = '';
  episodeList.forEach(episode => {
    let episodeNum = episode.number < 10? `0${episode.number}` : episode.number;
    result += `
    <div class="episode__wrap">
        <div class="episode__header">
          <h3>${episode.name} - S0${episode.season}E${episodeNum}</h3>
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
  episodesList.forEach(episode => {
    let episodeNum = episode.number < 10? `0${episode.number}` : episode.number;
    seriesDropdown.innerHTML  += `<option value="${episode.name}">S0${episode.season}E${episodeNum} - ${episode.name}</option>`;
  })
}

function getSelectedEpisode(selectedEpisode) {
  const foundEpisode = episodesList.filter(episode => {
    return episode.name.includes(selectedEpisode);
  })
  makePageForEpisodes(foundEpisode);
}

fetchEpisodes();

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

seriesDropdown.addEventListener('change', (event) => {
  if (event.target.value !== '') {
    getSelectedEpisode(event.target.value)
  } else {
    makePageForEpisodes(episodesList);
  }
})