'use strict'

const MINE_IMG = '<img src="img/bomb.png">'
const gElModal = document.querySelector('.modal')
const gAudioClick = new Audio('sound/click.mp3')

var gBoard
var gLevel = { SIZE: 4, MINES: 2 }
var gGame = {
  isOn: false,
  shownCount: 0,
  markedCount: gLevel.MINES,
}
var gMinesOnBoard = false
var gLivesCount
var gIsHintOn = false

function onInit() {
  localStorage.removeItem('bestTime');
  getUserName()
  gLivesCount = gLevel.SIZE === 4 ? 2 : 3
  console.log('gGame.markedCount',gGame.markedCount)
  updateFlagsCount(gGame.markedCount)
  document.querySelector('.timer').style.display = 'none'
  clearInterval(timerInterval)
  startTime = 0
  gElModal.style.display = 'none'
  gMinesOnBoard = false
  updateLives(gLivesCount)
  gBoard = buildBoard()
  gGame = {
    isOn: true,
    shownCount: 0,
    markedCount: gLevel.MINES,
  }
  renderBoard(gBoard)
  
}

function buildBoard() {
  // Builds empty board
  var board = createMat(gLevel.SIZE, gLevel.SIZE)

  // Builds model board
  for (var i = 0; i < gLevel.SIZE; i++) {
    for (var j = 0; j < gLevel.SIZE; j++) {
      // create cell objects
      board[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
        isVisited: false,
      }
      // set 2 permanent mines
      // if (i === 1 && j === 2) board[1][2].isMine = true
      // if (i === 2 && j === 3) board[2][3].isMine = true
    }
  }

  //update mine negs for each cell
  addMinesCountToCells(board)

  //Return the created board
  return board
}

function setMinesNegsCount(board, cellI, cellJ) {
  var negsCount = 0
  //count negs for specific cell
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= board[i].length) continue
      if (i === cellI && j === cellJ) continue
      if (board[i][j].isMine) negsCount++
    }
  }
  //add the negs count to cell object
  board[cellI][cellJ].minesAroundCount = negsCount
}

function addMinesCountToCells(board) {
  //update negs count for all cells
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      setMinesNegsCount(board, i, j)
    }
  }
}

function renderBoard(board) {
  var elBoard = document.querySelector('.board')
  var strHTML = ''

  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>\n'

    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j]
      var cellClass = getClassName({ i, j })
      if (currCell.isMine) cellClass += ' mine'
      strHTML += `\t<td class="cell ${cellClass}" oncontextmenu="onCellMarked(event)" onclick="onCellClicked(this,${i}, ${j})">`

      strHTML += '\t</td>\n'
    }
    strHTML += '</tr>\n'
  }
  elBoard.innerHTML = strHTML
}

function onCellMarked(event) {
  // updateFlagsCount(gGame.markedCount)

  //hide the context menu
  event.preventDefault()
  //get cell element (DOM)
  var cell = event.target
  //get i,j from cell class
  var sprClass = cell.classList[1].split('-')
  var i = sprClass[1]
  var j = sprClass[2]

  if (gBoard[i][j].isShown) return
  console.log('Right click')

  if (!gBoard[i][j].isMarked) {
    if (gGame.markedCount) {
      /////////////////////why its goes in the if and in else ??????and only sometimes randomly
      cell.innerText = '\u{1F6A9}'
      console.log('hey')
      gGame.markedCount--
      updateFlagsCount(gGame.markedCount)
      gBoard[i][j].isMarked = true
      console.log('gGame.markedCount1', gGame.markedCount)
    }
    } 
else {
      // show flag on marked cell
      gGame.markedCount++
      updateFlagsCount(gGame.markedCount)
      cell.innerText = ''
      gBoard[i][j].isMarked = false
      console.log('gGame.markedCount2', gGame.markedCount)
    }
  

  gAudioClick.volume = 0.2
  gAudioClick.play()
}

function onCellClicked(elCell, i, j) {
  if (gIsHintOn && gBoard[i][j].isShown) {
    expandShown(gBoard, i, j)
    setTimeout(() => {
      shrinkShown(gBoard, i, j)
    }, 1000)
  }

  if (!startTime) startTimer()
  // set bombs in random locations on board
  if (!gMinesOnBoard) {
    for (let m = 0; m < gLevel.MINES; m++) {
      var emptyPos = getEmptyLocation()
      if (emptyPos.i === i && emptyPos.j) emptyPos = getEmptyLocation()
      gBoard[emptyPos.i][emptyPos.j].isMine = true
      addMinesCountToCells(gBoard)
      console.log(
        'gBoard[emptyPos.i][emptyPos.j]',
        gBoard[emptyPos.i][emptyPos.j]
      )
    }
    gMinesOnBoard = true
  }

  if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
    if (!gBoard[i][j].isMine && !gBoard[i][j].isVisited) {
      console.log('in')
      gBoard[i][j].isShown = true
      elCell.classList.add('shown')
      //when there are no mines around it won't show 0 but empty cell
      elCell.innerText = gBoard[i][j].minesAroundCount
        ? gBoard[i][j].minesAroundCount
        : ''
      gAudioClick.volume = 0.2
      gAudioClick.play()
      gGame.shownCount++
      gBoard[i][j].isVisited = true
    } else {
      var audioExplosion = new Audio('sound/explosion.mp3')
      audioExplosion.volume = 0.2
      audioExplosion.play()
      gLivesCount--
      document.querySelector('.restartBtn').style.display = 'block'
      if (!gLivesCount) {
        for (let i = 0; i < gBoard.length; i++) {
          for (let j = 0; j < gBoard[0].length; j++) {
            addClassToCell('shown', i, j)
            if (!gBoard[i][j].isMine) {
              if (!gBoard[i][j].minesAroundCount) renderCell({ i, j }, '')
              else renderCell({ i, j }, gBoard[i][j].minesAroundCount)
            } else renderCell({ i, j }, MINE_IMG)
          }
        }
      } else {
        addClassToCell('shown', i, j)
        renderCell({ i, j }, MINE_IMG)
      }
    }
  }
  console.log('gLivesCount', gLivesCount)
  updateLives(gLivesCount)

  if (gBoard[i][j].isShown && !gBoard[i][j].minesAroundCount) {
    expandShown(gBoard, i, j)
    gBoard[i][j].isVisited = true
    console.log('gGame.shownCount', gGame.shownCount)
  }
  checkGameOver()
}

function checkGameOver() {
  var cellsCount = gLevel.SIZE ** 2
  console.log('gGame.shownCount', gGame.shownCount)
  if (
    gGame.markedCount === 0 &&
    gGame.shownCount === cellsCount - gLevel.MINES
  ) {
    var audioWin = new Audio('sound/win.mp3')
    audioWin.volume = 0.2
    audioWin.play()
    updateModal('You Won!')
    var elRestartAlien = document.querySelector('.restartBtn')
    elRestartAlien.innerHTML = '<img src="img/winAlien.png" ></img>'
    stopTimer()
  }
  if (!gGame.isOn) {
    updateModal('Game Over!')
    stopTimer()
  }
}

function shrinkShown(board, cellI, cellJ) {
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= board[i].length) continue
      if (i === cellI && j === cellJ) continue
      // if(board[i][j].isShown) continue
      board[i][j].isVisited = false
      removeClassToCell('shown', i, j)
    }
  }
}

function expandShown(board, cellI, cellJ) {
  console.log('expand')
  // if (board[cellI][cellJ].minesAroundCount) return
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= board[i].length) continue
      if (i === cellI && j === cellJ) continue
      if (board[i][j].isVisited || board[i][j].isMarked) continue
      board[i][j].isVisited = true
      // if (!board[i][j].minesAroundCount ) {
      //   // console.log('i',i)
      //   // console.log('j',j)
      //   // console.log('board[i][j]',board[i][j])
      //   expandShown(board,i, j)
      // }
      addClassToCell('shown', i, j)
    }
  }
}

function updateLives(livesCount) {
  var elHear3 = document.querySelector('div.heart3')
  var elHear2 = document.querySelector('div.heart2')
  var elHear1 = document.querySelector('div.heart1')
  var elRestartAlien = document.querySelector('.restartBtn')
  switch (livesCount) {
    case 3:
      elHear3.innerHTML = '<img src="img/redHeart.png" ></img>'
      elHear2.innerHTML = '<img src="img/redHeart.png" ></img>'
      elHear1.innerHTML = '<img src="img/redHeart.png" ></img>'
      elRestartAlien.innerHTML = '<img src="img/alien.png" ></img>'
      break
    case 2:
      if (gLevel.SIZE === 4) {
        elHear3.innerHTML = '<img src="img/redHeart.png" ></img>'
        elHear2.innerHTML = '<img src="img/redHeart.png" ></img>'
        elRestartAlien.innerHTML = '<img src="img/alien.png" ></img>'
      } else {
        elHear3.innerHTML = '<img src="img/redHeart.png" ></img>'
        elHear2.innerHTML = '<img src="img/redHeart.png" ></img>'
        elHear1.innerHTML = '<img src="img/blackBrokenHeart.png" ></img>'
        elRestartAlien.innerHTML = '<img src="img/scared.png" ></img>'
      }
      break
    case 1:
      if (gLevel.SIZE === 4) {
        elHear3.innerHTML = '<img src="img/redHeart.png" ></img>'
        elHear2.innerHTML = '<img src="img/blackBrokenHeart.png" ></img>'
        elRestartAlien.innerHTML = '<img src="img/terrified.png" ></img>'
      } else {
        elHear3.innerHTML = '<img src="img/redHeart.png" ></img>'
        elHear2.innerHTML = '<img src="img/blackBrokenHeart.png" ></img>'
        elHear1.innerHTML = '<img src="img/blackBrokenHeart.png" ></img>'
        elRestartAlien.innerHTML = '<img src="img/scared.png" ></img>'
      }
      break

    default:
      if (gLevel.SIZE === 4) {
        elHear3.innerHTML = '<img src="img/blackBrokenHeart.png" ></img>'
        elHear2.innerHTML = '<img src="img/blackBrokenHeart.png" ></img>'
        elRestartAlien.innerHTML = '<img src="img/gameOverAlien.png" ></img>'
      } else {
        elHear3.innerHTML = '<img src="img/blackBrokenHeart.png" ></img>'
        elHear2.innerHTML = '<img src="img/blackBrokenHeart.png" ></img>'
        elHear1.innerHTML = '<img src="img/blackBrokenHeart.png" ></img>'
        elRestartAlien.innerHTML = '<img src="img/gameOverAlien.png" ></img>'
      }
      gGame.isOn = false

      // checkGameOver()
      break
  }
}

function onRestart() {
  localStorage.removeItem('bestTime');
  gLivesCount = gLevel.SIZE === 4 ? 2 : 3
  updateFlagsCount(gGame.markedCount)
  gElModal.style.display = 'none'
  gGame.isOn = true
  gGame.shownCount = 0
  gMinesOnBoard = false
  updateLives(gLivesCount)
  gBoard = buildBoard()
  renderBoard(gBoard)
}

function pickLevel(level, minesNum) {
  gLevel = { SIZE: +level, MINES: minesNum }
  gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: gLevel.MINES,
  }
  onInit()
}

function onHint(elHint) {
  elHint.innerHTML = '<img src="img/hintOn.png" alt=""></div>'
  gIsHintOn = true
  // gIsHintOn=false
}

function updateFlagsCount(markedCount) {
  document.querySelector('.flags span').innerText = !gGame.markedCount
    ? 0
    : markedCount
}

function getUserName(){
  if (localStorage.getItem('userName') == null) {
    var getUserName= prompt("Let's play! What is your name?");
    localStorage.setItem('userName', getUserName) ;
    var userName = localStorage.getItem('userName'); 
    console.log(userName);
    var eluserName=document.querySelector('.username');
    eluserName.innerText= 'Hello '+userName+"! Let's Play!" ;
    } else {
        var userName = localStorage.getItem('userName'); 
        console.log(userName);
        var eluserName=document.querySelector('.username');
        eluserName.innerText= 'Hello '+userName+"! Let's Play!" ;
    }
}
function changeUser(){
  getUserName= prompt("Let's play! What is your name?");
  localStorage.setItem('userName', getUserName) ;
  var userName = localStorage.getItem('userName'); 
  console.log(userName);
  var eluserName=document.querySelector('.username');
  eluserName.innerText= 'Hello '+userName+"! Let's Play!" ;
  
  }

// i will take care of this function during the weekend 

  // function updateBestTime(){
  //   if (!localStorage.getItem('bestTime')){
  //     localStorage.setItem('bestTime', finalTime) ;
  //     var elbesttime=document.querySelector('.besttime');
  //     if (finalTime<60){
  //         elbesttime.innerText= 'Best time: '+Math.floor(finalTime)+ ' seconds!' ;
  //     }else{
  //         toMinutes=finalTime/60;
  //         elbesttime.innerText= 'Best time: '+Math.floor(toMinutes)+' minutes! ' ;

  //     }

  // }else if(finalTime<localStorage.getItem('bestTime')){
  //         localStorage.setItem('bestTime', finalTime) ;
  //         setTimeout(function () {
  //             // alert('The best time so far is '+finalTime)
  //             var elbesttime=document.querySelector('.besttime');
  //             if (finalTime<60){
  //                 elbesttime.innerText= 'Best time: '+Math.floor(finalTime)+' seconds! Well done!' ;
  //             }else{
  //                 toMinutes=finalTime/60;
  //                 elbesttime.innerText= 'Best time: '+Math.floor(toMinutes)+' minutes! Well done!' ;
  //             }
  //         }, 70)
  // }else{
  //     console.log(totalTime);
  //     localStorage.setItem('bestTime', finalTime) ;
  //     // var elbesttime=document.querySelector('.besttime');
  //     // elbesttime.innerText= 'Best time: '+finalTime+' seconds' ;
  // }
  // }