console.log("JS is working!")
let currentsong = new Audio;
let songs;
let currfolder;
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');
    return `${formattedMinutes}:${formattedSeconds}`;
}


async function getSongs(folder) {
    currfolder = folder;
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        let href = element.href;
        if (href.endsWith(".mp3")) {
            // Fix the backslashes encoded as %5C by decoding and replacing with forward slashes
            href = decodeURIComponent(href).replaceAll('\\', '/');
            const parts = href.split(`/${folder}/`);
            const songName = parts.length > 1 ? parts[1] : undefined;
            if (songName && songName.endsWith('.mp3')) {
                songs.push(songName);
                
            } 
        }
    }
    let songUL = document.querySelector(".song-list").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""; // Clear any previous entries
    for (const song of songs) {
        if (!song) continue;
        songUL.innerHTML = songUL.innerHTML + `
 <li>
 <img class="invert" src="music.svg" alt="">
<div class="songname">${song.replaceAll("%20", " ")}</div>
 <img class="invert" src="play.svg" alt="">
 </li>`;

    }


    Array.from(document.querySelector(".song-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playmusic(e.querySelector(".songname").innerHTML.trim());
        });
    });


    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "pause.svg";
        } else {
            currentsong.pause();
            play.src = "play.svg";
        }
    });
    songs = songs.filter(Boolean);
    return songs;
}



const playmusic = (track, pause = false) => {
    currentsong.src = `/${currfolder}/` + track;
    if (!pause) {
        currentsong.play();
        play.src = "pause.svg";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "00:00/00:00";
}

async function displayAlbums() {
    let a = await fetch('http://127.0.0.1:3000/songs/');
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;

    let anchors = div.getElementsByTagName("a")
    let cardcontainer = document.querySelector(".card-container")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        let href = decodeURIComponent(e.getAttribute("href")).replaceAll('\\', '/');
        if (href.includes("/songs")) {
            let decoded = decodeURIComponent(e.href.split("/").slice(-2)[0]);
            let folder = decoded.split("\\").pop();  // get string, not array
            let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
            let response = await a.json();
            
            cardcontainer.innerHTML = cardcontainer.innerHTML + `<div data-folder="${folder}"class="card">
                
                        <svg class="play" viewBox="0 0 24 24" width="44" height="44" role="img"
                            xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="12" fill="#22C55E" />
                            <path d="M8 5v14l11-7z" fill="#000000" />
                        </svg>
                    
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`
        }
    }
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
        })
    })
}
async function main() {
    songs = await getSongs("songs/favouritesongs");
    playmusic(songs[0], true);

    displayAlbums()

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`;
        document.querySelector(".circle").style.left =
            (currentsong.currentTime / currentsong.duration) * 100 + "%";
    });


    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = ((currentsong.duration) * percent) / 100;
    });


    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0";
    });


    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%";
    });


    previous.addEventListener("click", () => {
        let currentName = decodeURIComponent(currentsong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentName);
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1]);
        }
    });


    next.addEventListener("click", () => {
        let currentName = decodeURIComponent(currentsong.src.split("/").slice(-1)[0]);
        let index = songs.indexOf(currentName);



        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1]);
        }
    });



    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        currentsong.volume = parseInt(e.target.value) / 100;
    });

    document.querySelector(".volume>img").addEventListener("click", e=>{ 
        if(e.target.src.includes("volume.svg")){
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentsong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })

}
main();