let dictionary;

let gameState = {
  secret: undefined,
  grid: Array(6).fill().map(()=>Array(5).fill('')),
  rowNum: 0,
  columnNum: 0,
};

async function generateWord(){
  const response = await fetch('https://random-word-api.herokuapp.com/word?length=5');
  const data = await response.json();
  gameState.secret = data[0].toUpperCase();
}

dictionary = JSON.parse(localStorage.getItem('dictionary'));
if(!dictionary){
  loadAllWords().then(()=>{
    generateWord().then(()=>{
      localStorage.setItem('dictionary', JSON.stringify(dictionary));
      renderGameBoard();
      fillInGrid();
    });
  })
}
else{
  generateWord().then(()=>{
    renderGameBoard();
    fillInGrid();
  });
}






async function loadAllWords(){
  const response = await fetch('https://random-word-api.herokuapp.com/all');
  const data = await response.json();
  dictionary = data;
}

function renderGameBoard(){
  const container = document.querySelector('.container');
  drawGrid(container);
  const message = document.createElement('p');
  message.innerText = `The word was: ${gameState.secret}`;
  message.classList.add('message');
  message.classList.add('hidden');
  container.appendChild(message);
  const playAgain = document.createElement('button');
  playAgain.classList.add('play-again-button');
  playAgain.innerText = 'Play Again';
  playAgain.classList.add('hidden');
  container.appendChild(playAgain);

  document.querySelector('.play-again-button').addEventListener('click', ()=>{
    document.querySelector('.container').innerHTML = '';
    gameState = {
      secret: undefined,
      grid: Array(6).fill().map(()=>Array(5).fill('')),
      rowNum: 0,
      columnNum: 0,
    };
    generateWord().then(()=>{
      renderGameBoard();
      fillInGrid();
    });
  })

  
}
function drawGrid(container){
  const grid = document.createElement('div');
  grid.classList.add('grid');

  for(let i = 0; i < 6; i++){
    for(let j = 0; j < 5; j++){
      drawBox(grid, i, j)
    }
  }

  container.appendChild(grid);

  document.body.addEventListener('keydown', handleEvents);
}

function handleEvents(event){
  const key = event.key;
  if(key === 'Enter'){
    if(gameState.columnNum === 5){
      const word = getCurrentWord();
      if(isValidWord(word)){
        revealWord(word);
        gameState.rowNum++;
        gameState.columnNum = 0;
      }
      else{
        alert('Not a valid word');
      }
    }
  }
  if(key === 'Backspace'){
    removeLetter()
  }
  if(isLetter(key)){
    addLetter(key);
  }

  fillInGrid();
}

function getCurrentWord(){
  return gameState.grid[gameState.rowNum].reduce((prev,curr) => prev + curr);
}

function isValidWord(word){
  return dictionary.includes(word);
}

function revealWord(guess){
  const row = gameState.rowNum;
  const animationDuration = 500;
  for(let i = 0; i < 5; i++){
    const box = document.querySelector(`.box${row}${i}`);
    const letter = box.innerText;

    setTimeout(()=>{
      if(letter === gameState.secret[i]){
        box.classList.add('green');
      }
      else if(gameState.secret.includes(letter)){
        box.classList.add('yellow');
      }
      else{
        box.classList.add('grey');
      }
    }, ((i+1) * animationDuration)/2);
    
    
    box.classList.add('animated');
    box.style.animationDelay = `${(i * animationDuration)/2}ms`
  }

  const isWinner = gameState.secret === guess.toUpperCase();
  const isGameOver = gameState.rowNum === 5;

  setTimeout(()=>{
    if(isWinner){
      document.body.removeEventListener('keydown', handleEvents);
      const playAgain = document.querySelector('.play-again-button');
      playAgain.classList.remove('hidden');
      
    }else if(isGameOver){
      document.body.removeEventListener('keydown', handleEvents);
      const message = document.querySelector('.message');
      const playAgain = document.querySelector('.play-again-button');
  
      message.classList.remove('hidden');
      playAgain.classList.remove('hidden');
      
    }
  }, 3 * animationDuration);

  
}
function isLetter(key){
  return key.length === 1 && key.match(/[a-z]/i);
}

function addLetter(letter){
  if(gameState.colNum===5) return;
  gameState.grid[gameState.rowNum][gameState.columnNum] = letter;
  gameState.columnNum++;
}

function removeLetter(){
  if(gameState.columnNum === 0) return;
  gameState.grid[gameState.rowNum][gameState.columnNum - 1] = '';
  gameState.columnNum--;
}

function drawBox(container, row, col, letter=''){
  const box = document.createElement('div');
  box.classList.add('box');
  box.classList.add(`box${row}${col}`);
  box.innerText = letter;

  container.appendChild(box);
}

function fillInGrid(){
  for(let i = 0; i < 6; i++){
    for(let j = 0; j < 5; j++){
      const box = document.querySelector(`.box${i}${j}`);
      box.innerHTML = gameState.grid[i][j];
    }
  }
}
