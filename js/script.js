console.log('Lets write some Javascript');
let currentSong = new Audio();
let songs;
let currFolder;

async function getSongs(folder) {

    currFolder = folder
    let a = await fetch(`/${folder}/`)
    let response = await a.text();
    // get the DOM of song folder 
    // console.log(response);


    let div = document.createElement("div")
    div.innerHTML = response

    let as = div.getElementsByTagName("a")
    songs = []

    for (let i = 0; i < as.length; i++) {
        let element = as[i]

        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }


    // show all the songs in the playlist
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""

    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li> <img class = "invert" src="images/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Saraj</div>
                            </div>

                            <div class="playNow">
                                <span>Play Now</span>
                                <img class = "invert plays" src="images/play.svg" alt="">
                            </div> </li>`
    }

    
    // Attach an event listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {

            console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
            console.log(e);
        })
    })


    return songs;


}


async function displayAlbums() {
    let a = await fetch(`/SongGeet/songs`)
    let response = await a.text();

    let div = document.createElement("div")
    div.innerHTML = response
    // console.log(div);

    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors)

    for (let index = 0; index < array.length; index++) 
    {
        const e = array[index];
        
       // console.log(e.href);
 
        if (e.href.includes("/songs")) {
            // console.log(e.href);
            let folder = (e.href.split("/").slice(-1)[0])

            // get the metadata of the folder
            if (folder != 'songs') {
                console.log(folder);

                let a = await fetch(`/SongGeet/songs/${folder}/info.json`)
                let response = await a.json();
                console.log(response);

                cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">

                 <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="30" height="30">

                            <circle cx="50%" cy="50%" r="12" fill="#1ed760" />


                            <path
                                d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                stroke="currentColor" stroke-width="1" stroke-linejoin="round" />
                        </svg>


                    </div>

                    <img src= "/SongGeet/songs/${folder}/cover.jpg" alt="">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                 </div>`

            }

        }


    }

        // Load the playlist whenever card is clicked
        Array.from(document.getElementsByClassName("card")).forEach(e => {
            // console.log(e);
    
            e.addEventListener("click", async item => {
                // console.log(item , item.currentTarget.dataset);
    
                songs = await getSongs(`SongGeet/songs/${item.currentTarget.dataset.folder}`)
                playMusic(songs[0])
    
            })
        })

}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds.toFixed(0)).padStart(2, '0')}`;
}


const playMusic = (track, pause = false) => {

    // console.log(track);

    // let audio = new Audio("http://127.0.0.1:5500/video84/songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "images/pause.svg"
        
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"

}


async function main() {

    //get the list of all songs
    await getSongs("SongGeet/songs/AA_Arijit_Singh")
    // console.log(songs);

    await displayAlbums()

    playMusic(songs[0], true)


    // // Attach an event listener to each song
    // Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
    //     e.addEventListener("click", element => {

    //         console.log(e.querySelector(".info").firstElementChild.innerHTML);
    //         playMusic(e.querySelector(".info").firstElementChild.innerHTML)
    //         console.log(e);
    //     })
    // })



    // Attach an event listener to play, previous and next
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "images/pause.svg"
            updateSongListPlayButton(decodeURI(currentSong.src.split('/').pop()), true);
        }

        else {
            currentSong.pause();
            play.src = "images/play.svg"
            updateSongListPlayButton(decodeURI(currentSong.src.split('/').pop()), false);
        }
    })

    //Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        console.log(currentSong.currentTime, currentSong.duration);

        //converting seconds format into minute/second format
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`

        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"

    })

    // Add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100
    })

    // Add an event listener to hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })

    // Add an event listener to close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })

    console.log(songs);

    //Add an event listener to next button
    next.addEventListener("click", () => {
        console.log('next clicked');
        console.log(currentSong);


        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        console.log(songs, index);

        if ((index + 1) < songs.length) {
            console.log(index, length);
            playMusic(songs[index + 1])
        }

    })

    //Add an event listener to previous button
    previous.addEventListener("click", () => {
        console.log('prev clicked');
        console.log(currentSong.src);
        console.log(currentSong);
        console.log(currentSong.src.split("/").slice(-1)[0]);


        let index = songs.indexOf(currentSong.src.split("/").slice(-2)[0])
        console.log(songs, index);

        if ((index - 1) > 0) {
            playMusic(songs[index - 1])
        }


    })


    //Add an event listener to volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("setting volume to", e.target.value, "/100");
        currentSong.volume = parseInt(e.target.value) / 100;

        if(currentSong.volume > 0)
        {
           document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("mute.svg" , "volume.svg")
        }

    })


    // // Load the playlist whenever card is clicked
    // Array.from(document.getElementsByClassName("card")).forEach(e => {
    //     // console.log(e);

    //     e.addEventListener("click", async item => {
    //         // console.log(item , item.currentTarget.dataset);

    //         songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
    //         playMusic(songs[0])

    //     })
    // })

    // Add an event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e=>{
           console.log(e.target , e.target.src);

           if(e.target.src.includes("volume.svg"))
            {
                e.target.src = e.target.src.replace("volume.svg" , "mute.svg")
                currentSong.volume = 0;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 0
            }

           else
            {
                e.target.src = e.target.src.replace("mute.svg" , "volume.svg")
                currentSong.volume = 0.1;
                document.querySelector(".range").getElementsByTagName("input")[0].value = 10 
            }
           
    })




}

main()
