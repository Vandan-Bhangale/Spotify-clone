let currentSong = new Audio();
let songs;
let currFolder;

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
    currFolder = folder;
    let a = await fetch(`http://127.0.0.1:5500/${folder}/`);
    let responce = await a.text();
    // console.log(responce);

    let div = document.createElement("div");
    div.innerHTML = responce;
    let as = div.getElementsByTagName("a");
    // console.log(as);
    
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if(element.href.endsWith(".mp3")) {
            // songs.push(element.href);
            songs.push(element.href.split(`/${folder}/`)[1]);
        }
    }

    //Show all songs in the playlist
    let songUL = document.querySelector(`.songlist`).getElementsByTagName("ul")[0];
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                        <i class="fa-solid fa-music" style="color: #fafafa;"></i>
                        <div class="info">
                            <div> ${song.replaceAll("%20", " ")}</div>
                            <div>Vandan</div>
                        </div>
                        <div class="playnow">
                            <span id="playnow">Play now</span>
                            <i class="fa-solid fa-play" style="color: #fafafa;"></i>
                        </div>
                    </li>`;
    }
     //Attach an event listner to each song
     Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click",element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
        })
    })
    return songs;
}

function playMusic(track,pause = false) {
    currentSong.src =`/${currFolder}/`+ track;
    if(!pause) {
        currentSong.play();
        play.className = "fa-solid fa-pause";
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    // document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
}

// {/* <div> ${song.split("/Songs/")[1].replaceAll("%20", " ")}</div> */}   this part is for push the song name only into the songs array
// if the current logic dosen't work use this and remove split from the addsong function in song.push line

async function displayAlbum() {
    let a = await fetch(`/Songs/`);
    let responce = await a.text();
    let cardContainer = document.querySelector(".cardContainer");

    let div = document.createElement("div");
    div.innerHTML = responce;
    let anchors = div.getElementsByTagName("a");
    Array.from(anchors).forEach(async e => {

      
        if(e.href.includes("/Songs")) {
            let folder = e.href.split("/").slice(-1)[0];
            let a = await fetch(`/Songs/${folder}/info.json`);
            let responce = await a.json();

            //album load dynamically
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder = "${folder}" class="card"> <!--Card 1-->
                    <div class="play-circle">
                        <i class="fa-solid fa-play play-hover" style="color: #000000;"></i>
                    </div>
                    <img src="./Songs/${folder}/cover.jpg" alt="Artist image">
                    <h5 class="name">${responce.title}</h5>
                    <p class="info">${responce.description}</p>
                </div>`
        }
})

cardContainer.addEventListener("click", async event => {
    const card = event.target.closest(".card"); // Check if a `.card` was clicked
    if (card) {
        const folder = card.dataset.folder;
        // console.log("Card clicked, folder:", folder);

        // Fetch songs for the clicked folder
        let songs = await getSongs(`Songs/${folder}`);
        // console.log("Songs:", songs);
        playMusic(songs[0]);
    }
}); //modified eventlistner of album ends here

}       //Display album function ends here


async function main() {
    await getSongs("Songs/lofi");
    playMusic(songs[0],true);
    displayAlbum();

    //Attach an event listner to play, previous and next button
    play.addEventListener("click",() => {
        if(currentSong.paused) {
            currentSong.play();
            play.className = "fa-solid fa-pause";
            
        } else {
            currentSong.pause();
            play.className = "fa-solid fa-play";
        }
    })

    //time update of the song
    currentSong.addEventListener("timeupdate",() => {
        // console.log(currentSong.currentTime,currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)} / ${secondsToMinutesSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime/currentSong.duration) * 100 + `%`;
    })

    //Add eventlistner to seekbar
    document.querySelector(".seekbar").addEventListener("click",e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + `%`;
        currentSong.currentTime = ((currentSong.duration) * percent)/100    
    })

    // Adding event listener to the hamburger
    document.querySelector("#hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"; // Open the menu
        document.querySelector("#hamburger").style.display = "none"; // Hide hamburger icon
        document.querySelector("#close").style.display = "block"; // Show close icon
    });

    // Adding event listener to the close button
    document.querySelector("#close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"; // Close the menu
        document.querySelector("#close").style.display = "none"; // Hide close icon
        document.querySelector("#hamburger").style.display = "block"; // Show hamburger icon
    });

    //add eventlistner to previous
    previous.addEventListener("click",() => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
    })

    //add eventlistner to next
    next.addEventListener("click",() => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if((index + 1) < songs.length-1);
        playMusic(songs[index + 1]);    
    })

    //Add eventlistner to the volume bar
    document.querySelector(".volumeContainer").getElementsByTagName("input")[0].addEventListener("change",(e) => {
        currentSong.volume = parseInt(e.target.value) / 100;
    })

    //Add evenlistner to the mute the track
    document.querySelector("#volume").addEventListener("click",e=> {
        if(volume.className === "fa-solid fa-volume-high") {
            currentSong.volume = 0;
            document.querySelector(".volumeContainer").getElementsByTagName("input")[0].value = 0;
            volume.className = "fa-solid fa-volume-xmark";
        } else {
            currentSong.volume = 0.50;
            document.querySelector(".volumeContainer").getElementsByTagName("input")[0].value = 50;
            volume.className = "fa-solid fa-volume-high";
        }
    })
}

main();
