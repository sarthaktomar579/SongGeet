// script.js

console.log("Let's write some Javascript");

let currentSong = new Audio();
let songs = [];
let currFolder = "";

// Format seconds into mm:ss
function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${String(minutes).padStart(2, "0")}:${String(remaining).padStart(2, "0")}`;
}

// Play a track (optionally paused)
function playMusic(track, pause = false) {
  currentSong.src = `/songs/${currFolder}/${track}`;
  if (!pause) {
    currentSong.play();
    document.querySelector(".play").src = "images/pause.svg";
  }
  document.querySelector(".songinfo").textContent = decodeURIComponent(track);
  document.querySelector(".songtime").textContent = `00:00 / ${formatTime(currentSong.duration)}`;
}

// Load songs from the manifest entry
async function getSongsFromManifest(folder) {
  currFolder = folder;
  
  // find the album in index.json
  const idx = window.albumManifest.find(a => a.folder === folder);
  songs = idx ? idx.tracks : [];
  
  // render the track list
  const songUL = document.querySelector(".songList ul");
  songUL.innerHTML = songs
    .map(track => `
      <li>
        <img class="invert" src="images/music.svg" alt="">
        <div class="info">
          <div>${track.replaceAll("%20", " ")}</div>
          <div>${window.albumManifest.find(a => a.folder === folder).title}</div>
        </div>
        <div class="playNow">
          <span>Play Now</span>
          <img class="invert plays" src="images/play.svg" alt="">
        </div>
      </li>`)
    .join("");

  // bind click handlers
  Array.from(songUL.children).forEach((li, i) => {
    li.addEventListener("click", () => playMusic(songs[i]));
  });
}

// Display all albums from the manifest
async function displayAlbums() {
  const container = document.querySelector(".cardContainer");
  container.innerHTML = window.albumManifest.map(album => `
    <div data-folder="${album.folder}" class="card">
      <div class="play">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
             xmlns="http://www.w3.org/2000/svg">
          <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5" stroke-linejoin="round"/>
        </svg>
      </div>
      <img src="/songs/${album.folder}/${album.cover}" alt="${album.title} cover"/>
      <h2>${album.title}</h2>
      <p>${album.description}</p>
    </div>`
  ).join("");

  Array.from(document.querySelectorAll(".card")).forEach(card => {
    card.addEventListener("click", () => {
      const folder = card.getAttribute("data-folder");
      getSongsFromManifest(folder).then(() => playMusic(songs[0], true));
    });
  });
}

// Main initialization
async function main() {
  // fetch the single manifest
  window.albumManifest = await (await fetch("/songs/index.json")).json();

  // show the albums and load the first one by default
  await displayAlbums();
  if (window.albumManifest.length > 0) {
    await getSongsFromManifest(window.albumManifest[0].folder);
    playMusic(songs[0], true);
  }

  // playback controls
  document.querySelector(".play").addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      document.querySelector(".play").src = "images/pause.svg";
    } else {
      currentSong.pause();
      document.querySelector(".play").src = "images/play.svg";
    }
  });

  document.querySelector(".next").addEventListener("click", () => {
    const idx = songs.indexOf(currentSong.src.split("/").pop());
    if (idx + 1 < songs.length) playMusic(songs[idx + 1]);
  });

  document.querySelector(".previous").addEventListener("click", () => {
    const idx = songs.indexOf(currentSong.src.split("/").pop());
    if (idx - 1 >= 0) playMusic(songs[idx - 1]);
  });

  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").textContent =
      `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      `${(currentSong.currentTime / currentSong.duration) * 100}%`;
  });

  document.querySelector(".seekbar").addEventListener("click", e => {
    const pct = e.offsetX / e.target.getBoundingClientRect().width;
    document.querySelector(".circle").style.left = `${pct * 100}%`;
    currentSong.currentTime = pct * currentSong.duration;
  });

  document.querySelector(".range input").addEventListener("change", e => {
    const vol = parseInt(e.target.value, 10) / 100;
    currentSong.volume = vol;
    document.querySelector(".volume img").src =
      vol > 0 ? "images/volume.svg" : "images/mute.svg";
  });

  document.querySelector(".volume img").addEventListener("click", e => {
    const img = e.target;
    const muted = img.src.includes("mute.svg");
    img.src = muted ? "images/volume.svg" : "images/mute.svg";
    currentSong.volume = muted ? 0.1 : 0;
    document.querySelector(".range input").value = muted ? 10 : 0;
  });

  // sidebar toggles
  document.querySelector(".hamburger").addEventListener("click", () =>
    document.querySelector(".left").style.left = "0"
  );
  document.querySelector(".close").addEventListener("click", () =>
    document.querySelector(".left").style.left = "-120%"
  );
}

main();
