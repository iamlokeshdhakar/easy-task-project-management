
let speech = new SpeechSynthesisUtterance();

let board = document.querySelector('#tts');
board.style.color = "#EB3118";
board.style.transform = "scale(1.35)";

speech.lang = "en";
speech.rate = '1';
speech.volume = "1";
speech.pitch = "1"

let voices = [];
window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
    speech.voice = voices[0];

    let voiceSelect = document.querySelector("#speak-gender");
    voices.forEach((voice, i) => {
        var obj = {
            Microsoft: '',
            United: 'U',
            States: 'S',
            India: 'IN'
        }
        let printName = voice.name.replace(/Microsoft|United|States|India/gi, (matched) => {
            return obj[matched];
        }).replace('U S', "US");
        (voiceSelect.options[i] = new Option(printName, i));
    });
};

let display = true;
document.querySelector('#tts-speak').addEventListener('click', () => {
    if (display) {
        window.speechSynthesis.cancel();
        speech.text = document.querySelector('#tts-textarea').value;
        let speed = document.querySelector('#speak-speed').value;
        speech.voice = voices[document.querySelector('#speak-gender').value];
        speech.rate = speed;
        window.speechSynthesis.speak(speech);
        document.querySelector('#tts-speak i').className = "ri-pause-line";
        display = false;
    } else {
        window.speechSynthesis.cancel();
        document.querySelector('#tts-speak i').className = "ri-play-fill";
        display = true;
    }
});

window.addEventListener('load', () => {
    window.speechSynthesis.cancel();
    document.querySelector('#tts-speak i').className = "ri-play-fill";
});

speech.addEventListener('end', (event) => {
    document.querySelector('#tts-speak i').className = "ri-play-fill";
});