'use strict'

const MINE_IMG = '<img src="img/bomb.png">'
const GUM_IMG = '<img src="img/gum.png">'
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
var gExpendedNegs
var gTimeStamp1
var gTimeStamp2
var gHintsCount
var gSafeClicksCount
var gLastClickPos
var gDarkMode =false
// var gIsMegaHint
// var gMegaHintCount=0
// I didnt have enough time to completer mega hint but i planned to take it the last clicked position from local 
//storage and do a nest loop like i described in the last commented function


function onInit() {
  // gMegaHintCount=0
  gSafeClicksCount=0
  gHintsCount=0
  gExpendedNegs = []
  var hintsArr = document.querySelectorAll('.hint')
  for (let i = 0; i < hintsArr.length; i++) {
    const elHint = hintsArr[i]
    elHint.innerHTML = '<img src="img/hint.png">'
  }
  getUserName()
  // changeUser()
  gLivesCount = gLevel.SIZE === 4 ? 2 : 3
  gGame.markedCount = gLevel.MINES
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
        isSafeClick:false
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
      cell.innerText = '\u{1F6A9}'
      gGame.markedCount--
      updateFlagsCount(gGame.markedCount)
      gBoard[i][j].isMarked = true
      // console.log('gGame.markedCount1', gGame.markedCount)
    }
  } else {
    // show flag on marked cell
    gGame.markedCount++
    updateFlagsCount(gGame.markedCount)
    cell.innerText = ''
    gBoard[i][j].isMarked = false
    console.log('gGame.markedCount2', gGame.markedCount)
  }

  gAudioClick.volume = 0.2
  gAudioClick.play()
  checkGameOver()
}

function onCellClicked(elCell, i, j) {
//   if (gIsMegaHint) {
//     gLastClickPos={i,j}
// console.log({i,j});
//     return {i,j}
//   }
  // console.log('gGame',gGame)
  if (gIsHintOn && gBoard[i][j].isShown) {
    expandShown(gBoard, i, j)
    setTimeout(() => {
      shrinkShown(gBoard, i, j)
      gIsHintOn = false
      gExpendedNegs = []
    }, 1000)
  }
  if(gBoard[i][j].isSafeClick){  
    var cellSelector = '.' + getClassName({ i, j })
  var elCell = document.querySelector(cellSelector)
  console.log('elcell',elCell)
  elCell.classList.remove('safeGreen')
    gBoard[i][j].isSafeClick=false
    addClassToCell('shown',i,j)
    gGame.shownCount++
    renderCell({i,j},gBoard[i][j].minesAroundCount=gBoard[i][j].minesAroundCount?gBoard[i][j].minesAroundCount:'')
  }
  if (gBoard[i][j].isShown) return 

  if (!startTime) startTimer()
  // set bombs in random locations on board
  if (!gMinesOnBoard) {
    gTimeStamp1 = Date.now()
    for (let m = 0; m < gLevel.MINES; m++) {
      var emptyPos = getEmptyLocation()
      if (!emptyPos) return
      // else if (emptyPos.i === i && emptyPos.j) emptyPos = getEmptyLocation()
      gBoard[emptyPos.i][emptyPos.j].isMine = true
    }
    addMinesCountToCells(gBoard)
    gMinesOnBoard = true
  }

  if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
    if (!gBoard[i][j].isMine && !gBoard[i][j].isVisited) {
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
    } else if (gBoard[i][j].isMine && !gBoard[i][j].isVisited) {
      var audioExplosion = new Audio('sound/explosion.mp3')
      audioExplosion.volume = 0.2
      audioExplosion.play()
      gLivesCount--
      addClassToCell('shown', i, j)
      renderCell({ i, j }, MINE_IMG)
      setTimeout(() => {
        renderCell({ i, j }, GUM_IMG)
      }, 150);

      if (!gLivesCount) {
        for (let i = 0; i < gBoard.length; i++) {
          for (let j = 0; j < gBoard[0].length; j++) {
            addClassToCell('shown', i, j)
            if (!gBoard[i][j].isMine) {
              if (!gBoard[i][j].minesAroundCount) renderCell({ i, j }, '')
              else renderCell({ i, j }, gBoard[i][j].minesAroundCount)
            } else {
              renderCell({ i, j }, GUM_IMG)
            }
          }
        }
      }
    }
  }
  updateLives(gLivesCount)

  if (
    gBoard[i][j].isShown &&
    !gBoard[i][j].minesAroundCount &&
    !gBoard[i][j].isMine
  ) {
    expandShown(gBoard, i, j)
    gBoard[i][j].isVisited = true
  }
  gLastClickPos={i,j}
  console.log('gLastClickPos',gLastClickPos)
  checkGameOver()
}

function checkGameOver() {
  var cellsCount = gLevel.SIZE ** 2
  if (
    (gGame.markedCount === 0 &&
      gGame.shownCount === cellsCount - gLevel.MINES && gLivesCount === gLevel.MINES) ||
    (gLivesCount !== gLevel.MINES &&
      gGame.markedCount === gLevel.MINES - gLivesCount &&
      gGame.shownCount === cellsCount - gGame.markedCount)
  ) {
    var audioWin = new Audio('sound/win.mp3')
    audioWin.volume = 0.2
    audioWin.play()
    updateModal('You Won!')
    var elRestartAlien = document.querySelector('.restartBtn')
    elRestartAlien.innerHTML = '<img src="img/winAlien.png" ></img>'
    stopTimer()
    gTimeStamp2 = new Date()
    updateBestTime()
  }
  if (!gGame.isOn) {
    updateModal('Game Over!')
    stopTimer()
    gTimeStamp2 = new Date()
    updateBestTime()
    setTimeout(() => {
      var audioGameOver = new Audio('sound/gameOver.mp3')
      audioGameOver.volume = 0.2
      audioGameOver.play()
    }, 800);
  }
}

function shrinkShown(board, cellI, cellJ) {
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= board[i].length) continue
      if (i === cellI && j === cellJ) continue
      board[i][j].isVisited = false
      if (!gExpendedNegs[0].cell) removeClassFromCell('shown', i, j)
      renderCell({ i, j }, gExpendedNegs.splice(0, 1)[0].text)
    }
  }
}

function expandShown(board, cellI, cellJ) {
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= board[i].length) continue
      if (i === cellI && j === cellJ) continue
      if (board[cellI][cellJ].minesAroundCount && !gIsHintOn) return
      if ((board[i][j].isMarked  || board[i][j].isMine || board[i][j].isVisited)&& !gIsHintOn) continue 
      if (board[i][j].isShown) {
        // console.log('shown')
        gGame.shownCount--
      }
      if (gIsHintOn && board[i][j].isShown) {
        // console.log('hintOn&shown')
        gExpendedNegs.push({text: board[i][j].isMine? MINE_IMG: board[i][j].minesAroundCount? board[i][j].minesAroundCount: '',cell: 'shown',})
        // console.log('gExpendedNegsShown,i,j',gExpendedNegs,i,j)
      } else if (gIsHintOn && !board[i][j].isShown) {
        if (board[i][j].isMarked){
          gExpendedNegs.push({ text: '\u{1F6A9}', cell: null })
        console.log('gExpendedNegs,i,j',gExpendedNegs,i,j)
        }else{
          gExpendedNegs.push({ text: '', cell: null })
          // console.log('gExpendedNegs,i,j',gExpendedNegs,i,j)
        }
      }
      
      board[i][j].isVisited = true
      addClassToCell('shown', i, j)
      if (!board[cellI][cellJ].minesAroundCount && !gIsHintOn) {
        expandShown(board, i, j)
      }
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
        elHear1.innerHTML = ''
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
        elRestartAlien.innerHTML = '<img src="img/terrified.png" ></img>'
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

      break
  }
}

function pickLevel(level, minesNum) {
  var elbesttime = document.querySelector('.besttime')
  localStorage.removeItem('bestTime')
  elbesttime.innerText = `Best time: `
  gLevel = { SIZE: +level, MINES: minesNum }
  gGame = {
    isOn: false,
    shownCount: 0,
    markedCount: gLevel.MINES,
  }
  onInit()
}

function onHint(elHint) {
  if (gHintsCount===3) return
  gHintsCount++
  elHint.innerHTML = '<img src="img/hintOn.png" alt=""></div>'
  gIsHintOn = true
  setTimeout(() => {
    elHint.innerHTML = '<img src="img/hintUsed.png" alt=""></div>'
    // gIsHintOn=false
  }, 1500)
}

function updateFlagsCount(markedCount) {
  document.querySelector('.flags span').innerText = !gGame.markedCount
    ? 0
    : markedCount
}

function getUserName() {
  var userName = localStorage.getItem('userName')
  var eluserName = document.querySelector('.username')
  if (localStorage.getItem('userName') == null) {
    var getUserName = prompt("Let's play! What is your name?")
    localStorage.setItem('userName', getUserName)
    eluserName.innerText = `Hello ${userName}! Let's Play!`
  } else {
    eluserName.innerText = `Hello ${userName}! Let's Play!`
  }
}
function changeUser() {
  var elbesttime = document.querySelector('.besttime')
  localStorage.removeItem('bestTime')
  elbesttime.innerText = `Best time: `

  getUserName = prompt("Let's play! What is your name?")
  localStorage.setItem('userName', getUserName)
  var userName = localStorage.getItem('userName')
  var eluserName = document.querySelector('.username')
  eluserName.innerText = `Hello ${userName}! Let's Play!`
}

function updateBestTime() {
  var totalTime = gTimeStamp2 - gTimeStamp1
  var finalTime = totalTime / 1000
  var elbesttime = document.querySelector('.besttime')
  if (
    localStorage.getItem('bestTime') === null ||
    finalTime < localStorage.getItem('bestTime')
  ) {
    localStorage.setItem('bestTime', finalTime)
    if (finalTime < 60) {
      elbesttime.innerText = `Best time: ${Math.floor(finalTime)} seconds!`
    } else {
      var toMinutes = finalTime / 60
      elbesttime.innerText = `Best time: ${Math.floor(toMinutes)} minute!`
    }
  } else {
    localStorage.setItem('bestTime', finalTime)
  }
}

function onSafeClick(){
  if (gSafeClicksCount===3) return
  gSafeClicksCount++
  var emptyPos=getEmptyLocation()
  var i=emptyPos.i
  var j=emptyPos.j
  gBoard[i][j].isSafeClick=true
  console.log('emptyPos,i,j',emptyPos,i,j)
  addClassToCell('safeGreen', i, j)
}

function onUndo(){
gGame.shownCount--
var i=gLastClickPos.i
var j=gLastClickPos.j
console.log('i,j',i,j)
var elCell=document.querySelector(`.${getClassName(gLastClickPos)}`)
console.log('elCell',elCell)
elCell.classList.remove('shown')
elCell.innerHTML = ''
gBoard[i][j].isShown=false
gBoard[i][j].isVisited=false
if (gBoard[i][j].isMine) {
  gBoard[i][j].isMarked=false
  gLivesCount++
}
}

function OnDarkMode(){
  gDarkMode =!gDarkMode
  if(gDarkMode){
    document.querySelector('.darkModeBtn').innerText='Light Mode'
    // document.querySelector('body').style.backgroundImage="url('../img/candyLandDark.jpg')"
    document.querySelector('body').style.backgroundImage="url(./img/candyLandDark.jpg)"
    document.querySelector('.gameContainer').style.backgroundColor= 'rgba(177, 132, 139, 0.676)'
  }  else{
    document.querySelector('.darkModeBtn').innerText='Dark Mode'
    //  document.querySelector('body').style.backgroundImage="url('../img/candyLand.jpg')"
     document.querySelector('body').style.backgroundImage="url(./img/candyLand.jpg)"
    document.querySelector('.gameContainer').style.backgroundColor= 'rgba(255, 192, 203, 0.676)'
  }
}

// function OnMegaHint(){
//   console.log('mega')
//   if (gMegaHintCount===2)return
//   gIsMegaHint=true
//   gMegaHintCount++
  
// //  i didnt have time but i could take from local storage the last pos and use it 
//   for (var i = prevI; i <= lastI; i++) {
//     for (var j = prevJ; j <= lastJ; j++) {
//       var elCell=document.querySelector(`.${getClassName({i,j})}`)
//       switch (elCell.innerHTML){
//         case gBoard[i][j].isMine:
//           renderBoard({i,j},MINE_IMG)
//           break
//           case gBoard[i][j].minesAroundCount:
//             renderBoard({i,j},gBoard[i][j].minesAroundCount)
//             break
            
            
//           }
//         }
//         // gIsMegaHint=false
//   }
// }