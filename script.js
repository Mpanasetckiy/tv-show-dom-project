//Get DOM elements
const container = document.querySelector('#episode');
const finder = document.querySelector('input');
const findOutput = document.querySelector('#output');

const url = 'https://api.tvmaze.com/shows/82/episodes';

let episodesList = [];

async function fetchEpisodes () {
  try {
    const response = await fetch(url);
    episodesList = await response.json();
    makePageForEpisodes(episodesList);
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
  container.innerHTML = result
}

fetchEpisodes();

function getFinderValue () {
  return finder.value.trim().toLocaleLowerCase().replace(/[^a-zA-Z0-9]/g, ''); 
}

function displayFounded() {
  const finderValue = getFinderValue();
  const filteredEpisodes = episodesList.filter(episode => {
    return episode.name.toLocaleLowerCase().includes(finderValue) ||
    episode.summary.toLocaleLowerCase().includes(finderValue);
  })
  makePageForEpisodes(filteredEpisodes);
  findOutput.textContent = `Displaying ${filteredEpisodes.length}/${episodesList.length} episodes`;
}

finder.addEventListener('keydown', (event) => {
 displayFounded();
})