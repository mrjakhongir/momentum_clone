import playList from './playList.js'

// main
const timeEl = document.querySelector('.time');
const dateEl = document.querySelector('.date');
const greetingEl = document.querySelector('.greeting');
const nameEl = document.querySelector('.name');
const sliderPrev = document.querySelector('.slide-prev');
const sliderNext = document.querySelector('.slide-next');
let randomNum;

// weather
const weatherIcon = document.querySelector('.weather-icon');
const temperatureEl = document.querySelector('.temperature');
const weatherDescription = document.querySelector('.weather-description');
const windEl = document.querySelector('.wind');
const humidityEl = document.querySelector('.humidity');
const cityEl = document.querySelector('.city');

// quote
const changeQuoteBtn = document.querySelector('.change-quote');

// audio player
const playBtn = document.querySelector('.play');
const playPrevEl = document.querySelector('.play-prev');
const playNextEl = document.querySelector('.play-next');
const playListEl = document.querySelector('.play-list');
const progressBar = document.querySelector('.progress');
const progressBarContainer = document.querySelector('.player-progress-bar');
let playNum = 0;
let isPlay = false;
let currentPlayProgress;

// Show time and date
function showTime() {
    const date = new Date();
    const currentTime = date.toLocaleTimeString();
    timeEl.textContent = currentTime;

    setTimeout(showTime, 1000)
    showGreeting();
    showDate();
}

function showDate() {
    const date = new Date();
    const options = {month: 'long', day: 'numeric', weekday: 'long', timeZone: 'UTC'};
    const currentDate = date.toLocaleDateString('en-En', options);
    dateEl.textContent = currentDate;
}

showTime();

// Greeting
function showGreeting() {
    const timeOfDay = getTimeOfDay();
    const greetingText = `Good ${timeOfDay}`
    greetingEl.textContent =  greetingText;
}

function getTimeOfDay() {
    const date = new Date();
    const hours = date.getHours();
    let timeOfDay = '';
    if(hours < 5){
        timeOfDay = 'night'
    }else if(hours < 12){
        timeOfDay = 'morning'
    }else if(hours < 18){
        timeOfDay = 'afternoon'
    }else if(hours < 22){
        timeOfDay = 'evening'
    }

    return timeOfDay;
}

// Local Storages
function setLocalStorage(){
    localStorage.setItem('name', nameEl.value)
    localStorage.setItem('city', cityEl.value)
}

function getLocalStorage(){
    if(localStorage.getItem('name')){
        nameEl.value = localStorage.getItem('name')
    }
    if(localStorage.getItem('city')){
        cityEl.value = localStorage.getItem('city')
    }else{
        cityEl.value = 'Bukhara'
    }
}
window.addEventListener('beforeunload', setLocalStorage);
window.addEventListener('load', getLocalStorage());

// Background image 
function setBg() {
    const timeOfDay = getTimeOfDay();

    const image = new Image();
    image.src = `https://raw.githubusercontent.com/rolling-scopes-school/stage1-tasks/assets/images/${timeOfDay}/${randomNum}.jpg`;
    image.addEventListener('load', ()=> document.body.style.backgroundImage = `url('https://raw.githubusercontent.com/rolling-scopes-school/stage1-tasks/assets/images/${timeOfDay}/${randomNum}.jpg')`)
}   

function getRandomNumber() {
    return Math.floor(Math.random()*20+1);
}

function setImageNumber(){
    randomNum = String(getRandomNumber()).padStart(2, '0');
    setBg()
}

function getSlideNext(){
    randomNum = +randomNum + 1 > 20 ? '01' : String(+randomNum + 1).padStart(2, '0');
    setImageNumber();
}

function getSlidePrev(){
    randomNum = +randomNum - 1 === 0 ? '20' : String(+randomNum - 1).padStart(2, '0');
    setImageNumber();
}

sliderNext.addEventListener('click', getSlideNext)
sliderPrev.addEventListener('click', getSlidePrev)
setImageNumber();

// Widget weather
async function getWeather() {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityEl.value}&lang=en&appid=cbafdc288fd3b6138740c2935a85765c&units=metric`)
    const data = await res.json()
    weatherIcon.className = 'weather-icon owf';
    weatherIcon.classList.add(`owf-${data.weather[0].id}`);
    temperatureEl.textContent = `${Math.ceil(data.main.temp)}°C`;
    weatherDescription.textContent = data.weather[0].description;
    humidityEl.textContent = `Humidity: ${data.main.humidity}%`;
    windEl.textContent = `Wind speed: ${data.wind.speed} m/s`;

}

getWeather()
cityEl.addEventListener('change', getWeather)

// Quotes
async function getQuotes() {
    const quote = document.querySelector('.quote');
    const quoteAuthor = document.querySelector('.author');

    let randomQuoteNumber = getRandomNumber()

    let quotes = './assets/quotes/data.json';
    const res = await fetch(quotes)
    const data = await res.json()

    quote.textContent = data[randomQuoteNumber].text
    quoteAuthor.textContent = data[randomQuoteNumber].author
}
getQuotes()
changeQuoteBtn.addEventListener('click', getQuotes)

//  Audio player
function togglePlay(){
    if(!isPlay){
        playAudio();
        isPlay = true;
    }else{
        pauseAudio();
        isPlay = false;
    }
}

const audio = new Audio();

function playAudio(){
    audio.src = playList[playNum].src;
    audio.currentTime = currentPlayProgress || 0;
    audio.play();
    playBtn.classList.add('pause');
    isPlay = true;

    changeActiveSongStyle();
    setCurrentTrack();
    setCurrentPlayTime();
}

function pauseAudio(){
    audio.pause();
    playBtn.classList.remove('pause');
    isPlay = false;
    currentPlayProgress = audio.currentTime;
}

function playPrev(){
    playNum = playNum <= 0 ? playList.length-1 : --playNum;
    currentPlayProgress = 0;
    playAudio();
}

function playNext(){
    playNum = playNum >= playList.length-1 ? 0 : ++playNum;
    currentPlayProgress = 0;
    playAudio();
}

playBtn.addEventListener('click', togglePlay);
playPrevEl.addEventListener('click', playPrev)
playNextEl.addEventListener('click', playNext)
audio.addEventListener('ended', playNext);

playList.map(el => {
        let s;
        s = `<li class="play-item">${el.title}</li>`
        return playListEl.innerHTML += s;
    }  
)

const playlistItems = document.querySelectorAll('.play-item');

function changeActiveSongStyle() {
    playlistItems.forEach(item => item.classList.remove('item-active'));
    playlistItems[playNum].classList.add('item-active');
}

playlistItems.forEach(el => {
    el.addEventListener('click', ()=> {
        if(isPlay){
            if(el.innerHTML === playList[playNum].title){
                pauseAudio()
            }else{
                currentPlayProgress = 0;
                playNum = playList.map(song => song.title).indexOf(el.innerHTML)
                playAudio();
            }
        }else{
            if(el.innerHTML === playList[playNum].title){
                playAudio()
            }else{
                currentPlayProgress = 0;currentPlayProgress = 0;
                playNum = playList.map(song => song.title).indexOf(el.innerHTML)
                playAudio();
            }
        }
    })
})

// Advanced audio
const songTitle = document.querySelector('.song-title');
const songDuration = document.querySelector('.song-duration');
const currentPlayTime = document.querySelector('.timer');

function setCurrentTrack(){

    let currentSongTitle = playList[playNum].title;
    let currentSongLength = playList[playNum].duration;

    songTitle.textContent = currentSongTitle
    songDuration.textContent = currentSongLength
}
setCurrentTrack();

function getCurrentPlayTime(){
    currentPlayProgress = Math.floor(audio.currentTime)
    return currentPlayProgress
}

function formatCurrentPlayTime(){
    let x = getCurrentPlayTime();
    switch (true) {
        case (x >= 0 && x < 10):
            return `00:0${x}`;
        case (x >= 10 && x < 60):
            return `00:${x}`;
        case (x >= 60 && x < 600):
            if ((x % 60) < 10) return `0${Math.trunc(x / 60)}:0${x % 10}`
            return `0${Math.trunc(x / 60)}:${x % 60}`;
    }
}

function setCurrentPlayTime(){
    currentPlayTime.textContent = formatCurrentPlayTime();
    setTimeout(setCurrentPlayTime, 1000);
}
setCurrentPlayTime();

function changeProgressBarOnPlay(){
    progressBar.style.width = audio.currentTime / audio.duration * 100 + '%'
    setTimeout(changeProgressBarOnPlay, 500);
}
changeProgressBarOnPlay();

function changeProgressBarOnClick(e){
    const progressBarWidth = window.getComputedStyle(progressBarContainer).width;
    
    if (!isNaN(audio.duration)) {
        audio.currentTime = e.offsetX / parseInt(progressBarWidth) * audio.duration;
        progressBar.style.width = audio.currentTime / audio.duration * 100 + '%';
    } else {
        audio.currentTime = e.offsetX / parseInt(progressBarWidth) * 40;
        progressBar.style.width = audio.currentTime / 40 * 100 + '%';
    }
    currentPlayProgress = audio.currentTime;
    return audio.currentTime;
}

progressBarContainer.addEventListener('click', changeProgressBarOnClick);