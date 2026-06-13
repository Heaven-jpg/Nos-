const tapZone = document.getElementById('portal-tap-zone');
const mobileUI = document.getElementById('mobile-ui');
const videoA = document.getElementById('video-a');
const videoB = document.getElementById('video-b');

const audioRain = document.getElementById('audio-rain');
const audioHum = document.getElementById('audio-hum');

const sliderRain = document.getElementById('slider-rain');
const sliderHum = document.getElementById('slider-hum');
const sceneBtns = document.querySelectorAll('.scene-btn');

let activePlayer = videoA;
let inactivePlayer = videoB;

// 1. Gesture System: Tap-to-Hide Interface
tapZone.addEventListener('click', (e) => {
    if (e.target.closest('.bottom-sheet')) return;
    
    mobileUI.classList.toggle('hidden');
    initializeAudioStreams();
});

function initializeAudioStreams() {
    if (audioRain.paused) {
        audioRain.play().catch(() => {});
        audioHum.play().catch(() => {});
        syncVolumes();
    }
}

// 2. Continuous Cross-Fading Engine (Preempting sudden cuts)
function monitorVideoPlayback() {
    setInterval(() => {
        const timeLeft = activePlayer.duration - activePlayer.currentTime;
        
        if (timeLeft <= 1.5 && !inactivePlayer.src_primed) {
            inactivePlayer.src_primed = true;
            inactivePlayer.currentTime = 0;
            inactivePlayer.play().then(() => {
                activePlayer.classList.remove('active');
                inactivePlayer.classList.add('active');
                
                let temp = activePlayer;
                activePlayer = inactivePlayer;
                inactivePlayer = temp;
                
                setTimeout(() => {
                    inactivePlayer.src_primed = false;
                }, 2000);
            }).catch(err => console.log(err));
        }
    }, 200);
}

// 3. Independent Soundscape Controls
function syncVolumes() {
    audioRain.volume = sliderRain.value / 100;
    audioHum.volume = sliderHum.value / 100;
}

sliderRain.addEventListener('input', syncVolumes);
sliderHum.addEventListener('input', syncVolumes);

// 4. Scene Switching
sceneBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        sceneBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        const videoSrc = btn.getAttribute('data-video');
        
        videoA.src = videoSrc;
        videoB.src = videoSrc;
        videoA.load();
        videoB.load();
        
        videoA.classList.add('active');
        videoB.classList.remove('active');
        activePlayer = videoA;
        inactivePlayer = videoB;
    });
});

videoA.addEventListener('loadedmetadata', monitorVideoPlayback, { once: true });
