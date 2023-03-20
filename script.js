//Get DOM elements
const rootElem = document.getElementById("root");
const eachEpisode = document.querySelector('#episode');

function setup() {
  const allEpisodes = getAllEpisodes();
  makePageForEpisodes(allEpisodes);
}

function makePageForEpisodes(episodeList) {
  console.log(episodeList)
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
  episode.innerHTML = result
}

window.onload = setup;

