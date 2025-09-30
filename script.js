import { WORDS } from "./words.js";

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let nextLetter = 0;

let currentWordList = [...WORDS];
let customWords = [];
let rightGuessString = currentWordList[Math.floor(Math.random() * currentWordList.length)];

console.log(rightGuessString);

const themeSelect = document.getElementById('theme-select');
themeSelect.addEventListener('change', (e) => {
  document.body.className = `theme-${e.target.value}`;
});

const wordlistSelect = document.getElementById('wordlist-select');
const modal = document.getElementById('word-modal');
const uploadBtn = document.getElementById('upload-words-btn');
const closeBtn = document.querySelector('.close');
const cancelBtn = document.getElementById('cancel-words');
const saveBtn = document.getElementById('save-words');
const customWordsTextarea = document.getElementById('custom-words');
const wordCountSpan = document.getElementById('word-count');
const newGameBtn = document.getElementById('new-game-btn');

uploadBtn.addEventListener('click', () => {
  modal.style.display = 'block';
});

closeBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

cancelBtn.addEventListener('click', () => {
  modal.style.display = 'none';
});

saveBtn.addEventListener('click', () => {
  const input = customWordsTextarea.value;
  const words = input.split('\n')
    .map(w => w.trim().toLowerCase())
    .filter(w => w.length === 5 && /^[a-z]+$/.test(w));
  
  if (words.length === 0) {
    toastr.error('Please enter at least one valid 5-letter word!');
    return;
  }

  customWords = [...new Set(words)];
  wordlistSelect.value = 'custom';
  currentWordList = [...customWords];
  updateWordCount();
  startNewGame();
  modal.style.display = 'none';
  toastr.success(`Loaded ${customWords.length} custom words!`);
});

wordlistSelect.addEventListener('change', (e) => {
  if (e.target.value === 'default') {
    currentWordList = [...WORDS];
  } else {
    if (customWords.length === 0) {
      toastr.warning('No custom words loaded. Please upload a word list.');
      e.target.value = 'default';
      return;
    }
    currentWordList = [...customWords];
  }
  updateWordCount();
  startNewGame();
});

newGameBtn.addEventListener('click', startNewGame);

function updateWordCount() {
  wordCountSpan.textContent = `Words in list: ${currentWordList.length}`;
}

function startNewGame() {
  guessesRemaining = NUMBER_OF_GUESSES;
  currentGuess = [];
  nextLetter = 0;
  rightGuessString = currentWordList[Math.floor(Math.random() * currentWordList.length)];
  
  console.log('New word:', rightGuessString);
  
  document.getElementById('answer-display').innerHTML = '';
  
  initBoard();
  
  const buttons = document.getElementsByClassName('keyboard-button');
  for (let button of buttons) {
    button.style.backgroundColor = '';
  }
  
  toastr.info('New game started!');
}

function initBoard() {
  let board = document.getElementById("game-board");
  board.innerHTML = '';

  for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
    let row = document.createElement("div");
    row.className = "letter-row";

    for (let j = 0; j < 5; j++) {
      let box = document.createElement("div");
      box.className = "letter-box";
      row.appendChild(box);
    }

    board.appendChild(row);
  }
}

function shadeKeyBoard(letter, color) {
  for (const elem of document.getElementsByClassName("keyboard-button")) {
    if (elem.textContent === letter) {
      let oldColor = elem.style.backgroundColor;
      if (oldColor === "green") {
        return;
      }

      if (oldColor === "yellow" && color !== "green") {
        return;
      }

      elem.style.backgroundColor = color;
      break;
    }
  }
}

function deleteLetter() {
  let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
  let box = row.children[nextLetter - 1];
  box.textContent = "";
  box.classList.remove("filled-box");
  currentGuess.pop();
  nextLetter -= 1;
}

function displayAnswer() {
  const answerDisplay = document.getElementById('answer-display');
  answerDisplay.innerHTML = '';
  
  const letterRow = document.createElement('div');
  letterRow.className = 'letter-row';
  
  for (let i = 0; i < rightGuessString.length; i++) {
    const box = document.createElement('div');
    box.className = 'letter-box';
    box.textContent = rightGuessString[i];
    box.style.backgroundColor = '#6aaa64';
    box.style.color = 'white';
    box.style.borderColor = '#6aaa64';
    letterRow.appendChild(box);
  }
  
  answerDisplay.appendChild(letterRow);
}

function checkGuess() {
  let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
  let guessString = "";
  let rightGuess = Array.from(rightGuessString);

  for (const val of currentGuess) {
    guessString += val;
  }

  if (guessString.length != 5) {
    toastr.error("Not enough letters!");
    return;
  }

  if (!currentWordList.includes(guessString)) {
    toastr.error("Word not in list!");
    return;
  }

  var letterColor = ["gray", "gray", "gray", "gray", "gray"];

  for (let i = 0; i < 5; i++) {
    if (rightGuess[i] == currentGuess[i]) {
      letterColor[i] = "green";
      rightGuess[i] = "#";
    }
  }

  for (let i = 0; i < 5; i++) {
    if (letterColor[i] == "green") continue;

    for (let j = 0; j < 5; j++) {
      if (rightGuess[j] == currentGuess[i]) {
        letterColor[i] = "yellow";
        rightGuess[j] = "#";
      }
    }
  }

  for (let i = 0; i < 5; i++) {
    let box = row.children[i];
    let delay = 250 * i;
    setTimeout(() => {
      animateCSS(box, "flipInX");
      box.style.backgroundColor = letterColor[i];
      shadeKeyBoard(guessString.charAt(i) + "", letterColor[i]);
    }, delay);
  }

  if (guessString === rightGuessString) {
    toastr.success("You guessed right! Game over!");
    guessesRemaining = 0;
    return;
  } else {
    guessesRemaining -= 1;
    currentGuess = [];
    nextLetter = 0;

    if (guessesRemaining === 0) {
      toastr.error("You've run out of guesses! Game over!");
      displayAnswer();
    }
  }
}

function insertLetter(pressedKey) {
  if (nextLetter === 5) {
    return;
  }
  pressedKey = pressedKey.toLowerCase();

  let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining];
  let box = row.children[nextLetter];
  animateCSS(box, "pulse");
  box.textContent = pressedKey;
  box.classList.add("filled-box");
  currentGuess.push(pressedKey);
  nextLetter += 1;
}

const animateCSS = (element, animation, prefix = "animate__") =>
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    const node = element;
    node.style.setProperty("--animate-duration", "0.3s");

    node.classList.add(`${prefix}animated`, animationName);

    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve("Animation ended");
    }

    node.addEventListener("animationend", handleAnimationEnd, { once: true });
  });

document.addEventListener("keyup", (e) => {
  if (guessesRemaining === 0) {
    return;
  }

  let pressedKey = String(e.key);
  if (pressedKey === "Backspace" && nextLetter !== 0) {
    deleteLetter();
    return;
  }

  if (pressedKey === "Enter") {
    checkGuess();
    return;
  }

  let found = pressedKey.match(/[a-z]/gi);
  if (!found || found.length > 1) {
    return;
  } else {
    insertLetter(pressedKey);
  }
});

document.getElementById("keyboard-cont").addEventListener("click", (e) => {
  const target = e.target;

  if (!target.classList.contains("keyboard-button")) {
    return;
  }
  let key = target.textContent;

  if (key === "Del") {
    key = "Backspace";
  }

  document.dispatchEvent(new KeyboardEvent("keyup", { key: key }));
});

initBoard();
updateWordCount();