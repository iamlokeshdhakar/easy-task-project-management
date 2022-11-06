
const speech = new SpeechSynthesisUtterance();
let voices = [];
let display = true;


function speakFun() {

    speech.lang = "en";
    speech.rate = '1';
    speech.volume = "1";
    speech.pitch = "1"

    let objForVoice = {
        userName: document.querySelector('.user-name h2 span').textContent,
        greet: greetUser(),
        todayDate: new Date().getDate(),
        month: nameOfMonth(),
        meetings: document.querySelector('#meet-update').textContent,
        projectName: document.querySelector('#pName span').textContent,
        leftDays: document.querySelector('#noty-2 h3 span').textContent,
        updates: {
            toDo: document.querySelector('#todovoice h6').textContent,
            inPro: document.querySelector('#inprovoice h6').textContent,
            inRev: document.querySelector('#inrevoice h6').textContent,
            done: document.querySelector('#donevoice h6').textContent,
        },
    };
    speech.text = `Hello ${objForVoice.userName}, ${objForVoice.greet} and welcome to Easy Task. It is ${objForVoice.todayDate} ${objForVoice.month} today. Your current working project is "${objForVoice.projectName}". There are still ${objForVoice.leftDays} days left to finish project from assgin date. You currently have ${Number(objForVoice.updates.toDo) + Number(objForVoice.updates.inPro)} tasks to complete. These are your brief updates, You have ${objForVoice.updates.toDo} "TO-DO", ${objForVoice.updates.inPro} "in-progress", ${objForVoice.updates.inRev} "in-review", and ${objForVoice.updates.done} completed task. There are ${objForVoice.meetings} meetings scheduled right now. Thank you, and enjoy your day.`;

}

function greetUser() {
    let myDate = new Date();
    let hrs = myDate.getHours();
    let greetUser;
    if (hrs < 12)
        greetUser = 'Good Morning';
    else if (hrs >= 12 && hrs <= 17)
        greetUser = 'Good Afternoon';
    else if (hrs >= 17 && hrs <= 24)
        greetUser = 'Good Evening';

    return greetUser;
}

function nameOfMonth() {
    let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let d = new Date();
    return months[d.getMonth()];
}

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


document.querySelector('#speak-up').addEventListener('click', () => {
    speakFun();

    if (display) {
        window.speechSynthesis.cancel();
        let speed = document.querySelector('#speak-speed').value;
        speech.voice = voices[document.querySelector('#speak-gender').value];
        speech.rate = speed;
        window.speechSynthesis.speak(speech);
        document.querySelector('#speak-up i').className = "ri-pause-line";
        display = false;
    } else {
        window.speechSynthesis.cancel();
        document.querySelector('#speak-up i').className = "ri-play-fill";
        display = true;
    }
});

window.addEventListener('load', () => {
    window.speechSynthesis.cancel();
    document.querySelector('#speak-up i').className = "ri-play-fill";
});

let dashboard = document.querySelector('#dash')
dashboard.style.color = "#EB3118";

speech.addEventListener('end', (event) => {
    document.querySelector('#speak-up i').className = "ri-play-fill";
});


// Meet Date
let meetForm = document.querySelector('#meetSetForm');
let timeDateSet = document.querySelector('#time-date-set');
meetForm.addEventListener('submit', (e) => {
    if(timeDateSet.value.length === 0){
        alert("Oops! Selet a date by clicking a calender icon.")
        e.preventDefault();
    }
});


// DP
let avatarFile = document.querySelector('#avatar');
let avatarForm = document.querySelector('#avatar-form');
let avatarBtn = document.querySelector('.edit-avatar i');

avatarBtn.addEventListener('click', () => {
    avatarFile.click();
});

avatarFile.addEventListener('change', () => {
    avatarForm.submit();
})






