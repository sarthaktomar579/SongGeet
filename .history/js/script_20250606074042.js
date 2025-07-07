console.log('Let’s write some Javascript');

let currentSong = new Audio();
let songs;
let currFolder;

// Format seconds into mm:ss
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds.toFixed(0)).padStart(2, '0')}`;
}

// Play a track (optionally paused)
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
        play.src = "images/pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
};

// Load songs from a folder
async function getSongs(folder) {
    currFolder = folder;
    let response = await (await fetch(`/${folder}/`)).text();
    let div = document.createElement("div");
    div.innerHTML = response;

    songs = Array.from(div.getElementsByTagName("a"))
        .filter(a => a.href.endsWith(".mp3"))
        .map(a => a.href.split(`/${folder}/`)[1]);

    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = songs.map(song => `
        <li>
            <img class="invert" src="images/music.svg" alt="">
            <div class="info">
                <div>${song.replaceAll("%20", " ")}</div>
                <div>Saraj</div>
            </div>
            <div class="playNow">
                <span>Play Now</span>
                <img class="invert plays" src="images/play.svg" alt="">
            </div>
        </li>`).join("");

    // Add click event to each song
    
    Array.from(songUL.children).forEach(li => {
        li.addEventListener("click", () => {
            let track = li.querySelector(".info").firstElementChild.innerHTML;
            playMusic(track);
        });
    });

    return songs;
}

// Display available albums from server
async function displayAlbums() {
    let response = await (await fetch(`/songs`)).text();
    
    
    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = Array.from(div.getElementsByTagName("a"));
    console.log(anchors);
    
    let cardContainer = document.querySelector(".cardContainer");

    for (const anchor of anchors) {
        if (!anchor.href.includes("/songs") || anchor.href.endsWith("/songs")) continue;

        let folder = anchor.href.split("/").pop();
        let info = await (await fetch(`/songs/${folder}/info.json`)).json();

        cardContainer.innerHTML += `
            <div data-folder="${folder}" class="card">
                <div class="play">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                        stroke-linejoin="round" />
                </svg>
            </div>
                <img src="/songs/${folder}/cover.jpg" alt="">
                <h2>${info.title}</h2>
                <p>${info.description}</p>
            </div>`;
    }

    // Add click event to each album card
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            songs = await getSongs(`songs/${card.dataset.folder}`);
            playMusic(songs[0]);
        });
    });
}

// Main function to initialize
async function main() {
    await getSongs("songs/AA_Arijit_Singh");
    await displayAlbums();
    playMusic(songs[0], true);

    // Playback Controls
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
        clo(currentSong.src)
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index + 1 < songs.length) playMusic(songs[index + 1]);
    });

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index - 1 >= 0) playMusic(songs[index - 1]);
    });

    // Time Update
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;
        document.querySelector(".circle").style.left = `${(currentSong.currentTime / currentSong.duration) * 100}%`;
    });

    // Seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = e.offsetX / e.target.getBoundingClientRect().width;
        document.querySelector(".circle").style.left = `${percent * 100}%`;
        currentSong.currentTime = percent * currentSong.duration;
    });

    // Volume control
    document.querySelector(".range input").addEventListener("change", e => {
        let value = parseInt(e.target.value);
        currentSong.volume = value / 100;
        document.querySelector(".volume img").src = value > 0 ? "images/volume.svg" : "images/mute.svg";
    });

    // Mute toggle
    document.querySelector(".volume img").addEventListener("click", e => {
        let isMuted = e.target.src.includes("mute.svg");
        e.target.src = isMuted ? e.target.src.replace("mute.svg", "volume.svg") : e.target.src.replace("volume.svg", "mute.svg");
        currentSong.volume = isMuted ? 0.1 : 0;
        document.querySelector(".range input").value = isMuted ? 10 : 0;
    });

    // Sidebar controls
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });

    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });
}

main();
