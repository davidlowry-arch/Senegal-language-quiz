const languages = [
    "wolof",
    "pulaar",
    "malinke",
    "jola"
];

let wordList = [];
let usedIndices = [];
let currentQuestion = 0;
let score = 0;
let firstAttempt = true;
let currentCorrectIndex = null;

const ding = new Audio("sounds/ding.mp3");
const thud = new Audio("sounds/thud.mp3");

function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
}

function showLanguageMenu() {
    showScreen("languageScreen");
    const container = document.getElementById("languageButtons");
    container.innerHTML = "";

    languages.forEach(lang => {
        const btn = document.createElement("button");
        btn.className = "main-btn";
        btn.textContent = lang;
        btn.onclick = () => loadLanguage(lang);
        container.appendChild(btn);
    });
}

function loadLanguage(lang) {
    fetch(`data/${lang}.json`)
        .then(res => res.json())
        .then(data => {
            wordList = data;
            usedIndices = [];
            currentQuestion = 0;
            score = 0;
            nextQuestion();
        });
}

function getRandomUnusedIndex() {
    let index;
    do {
        index = Math.floor(Math.random() * wordList.length);
    } while (usedIndices.includes(index));
    usedIndices.push(index);
    return index;
}

function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

function nextQuestion() {
    if (currentQuestion >= 20) {
        showFinalScreen();
        return;
    }

    firstAttempt = true;
    document.getElementById("nextBtn").classList.add("hidden");

    showScreen("quizScreen");

    currentCorrectIndex = getRandomUnusedIndex();
    const correctWord = wordList[currentCorrectIndex];

    document.getElementById("questionWord").textContent = correctWord.word;

    const img = document.getElementById("questionImage");
    img.src = `assets/${correctWord.language}/images/${correctWord.image}`;
    img.onclick = () => new Audio(`assets/${correctWord.language}/audio/${correctWord.audio}`).play();

    const options = generateOptions(currentCorrectIndex);
    renderOptions(options);

    new Audio(`assets/${correctWord.language}/audio/${correctWord.audio}`).play();

    currentQuestion++;
}

function generateOptions(correctIndex) {
    const options = [wordList[correctIndex]];

    while (options.length < 4) {
        let rand = Math.floor(Math.random() * wordList.length);
        if (!options.includes(wordList[rand])) {
            options.push(wordList[rand]);
        }
    }

    return shuffle(options);
}

function renderOptions(options) {
    const container = document.getElementById("optionsContainer");
    container.innerHTML = "";

    options.forEach(option => {
        const card = document.createElement("div");
        card.className = "option-card";

        card.innerHTML = `
            <img src="assets/${option.language}/images/${option.image}">
            <p>${option.gloss}</p>
        `;

        card.onclick = () => checkAnswer(option);
        container.appendChild(card);
    });
}

function checkAnswer(option) {
    const correct = wordList[currentCorrectIndex];

    if (option.word === correct.word) {
        if (firstAttempt) score++;
        ding.play();
        new Audio(`assets/${correct.language}/audio/${correct.audio}`).play();
        document.getElementById("nextBtn").classList.remove("hidden");
        firstAttempt = false;
    } else {
        thud.play();
        firstAttempt = false;
    }
}

function showFinalScreen() {
    showScreen("finalScreen");
    document.getElementById("finalMessage").innerHTML =
        `<h2>Félicitations !</h2>
         <p>Vous avez obtenu ${score}/20 points.</p>
         <p>Vous voulez rejouer ?</p>`;
}

function restartGame() {
    usedIndices = [];
    currentQuestion = 0;
    score = 0;
    nextQuestion();
}
