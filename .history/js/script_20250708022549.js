console.log('Let’s write some Javascript');

let currentSong = new Audio();
let songs = [];
let currFolder = "";

// Format seconds to mm:ss
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds.toFixed(0)).padStart(2, '0')}`;
}

// Play selected track
const playMusic = (track, pause = false) => {
    currentSong.src = `songs/${currFolder}/${track}`;
    if (!pause) {
        currentSong.play();
        play.src = "images/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

// Load all albums from index.json
async function displayAlbums() {
    try {
        const response = await fetch("songs/index.json"); // ✅ Relative path works both locally & on Vercel
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const albumManifest = await response.json();
        const cardContainer = document.querySelector(".cardContainer");
        cardContainer.innerHTML = "";

        albumManifest.forEach(album => {
            cardContainer.innerHTML += `
                <div data-folder="${album.folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="songs/${album.folder}/${album.cover}" alt="Cover">
                    <h2>${album.title}</h2>
                    <p>${album.description}</p>
                </div>`;
        });

        // Attach click to each card
        document.querySelectorAll(".card").forEach(card => {
            card.addEventListener("click", () => {
                const folder = card.dataset.folder;
                const album = albumManifest.find(a => a.folder === folder);
                if (album) loadSongs(album);
            });
        });

        // Auto load first album
        if (albumManifest.length > 0) {
            loadSongs(albumManifest[0], true);
        }
    } catch (err) {
        console.error("Failed to fetch album manifest:", err);
        alert("Error loading album list. Check if songs/index.json exists.");
    }
}

// Load songs from album object
function loadSongs(album, pauseFirst = false) {
    currFolder = album.folder;
    songs = album.tracks;

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = songs.map(song => `
        <li>
            <img class="invert" src="images/music.svg" alt="icon">
            <div class="info">
                <div>${decodeURIComponent(song)}</div>
                <div>${album.title}</div>
            </div>
            <div class="playNow">
                <span>Play Now</span>
                <img class="invert plays" src="images/play.svg" alt="Play">
            </div>
        </li>`).join("");

    // Add click events to songs
    Array.from(songUL.children).forEach((li, index) => {
        li.addEventListener("click", () => {
            playMusic(songs[index]);
        });
    });

    // Auto play first song
    if (songs.length > 0) {
        playMusic(songs[0], pauseFirst);
    }
}

// Main
async function main() {
    await displayAlbums();

    // Controls
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "images/pause.svg";
        } else {
            currentSong.pause();
            play.src = "images/play.svg";
        }
    });

    next.addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if (index + 1 < songs.length) playMusic(songs[index + 1]);
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(decodeURIComponent(currentSong.src.split("/").pop()));
        if (index - 1 >= 0) playMusic(songs[index - 1]);
    });

    currentSong.addEventListener("timeupdate", () => {
        if (!isNaN(currentSong.duration)) {
            document.querySelector(".songtime").innerHTML =
                `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
            document.querySelector(".circle").style.left =
                `${(currentSong.currentTime / currentSong.duration) * 100}%`;
        }
    });

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width;
        currentSong.currentTime = percent * currentSong.duration;
    });

    document.querySelector(".range input").addEventListener("input", e => {
        let value = parseInt(e.target.value);
        currentSong.volume = value / 100;
        document.querySelector(".volume img").src = value > 0 ? "images/volume.svg" : "images/mute.svg";
    });

    document.querySelector(".volume img").addEventListener("click", e => {
        let isMuted = e.target.src.includes("mute.svg");
        e.target.src = isMuted
            ? e.target.src.replace("mute.svg", "volume.svg")
            : e.target.src.replace("volume.svg", "mute.svg");
        currentSong.volume = isMuted ? 0.1 : 0;
        document.querySelector(".range input").value = isMuted ? 10 : 0;
    });

    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });
}

main();
