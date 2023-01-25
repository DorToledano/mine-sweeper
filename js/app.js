'use strict'
var table = [
  ['0,0', '0,1', '0,2', '0,3'],
  ['1,0', '1,1', '1,2 \u{1F4DB}', '1,3'],
  ['2,0', '2,1', '2,2', '2,3 \u{1F4DB}'],
  ['3,0', '3,1', '3,2', '3,3'],
]
console.table(table)

const MINE_IMG = '<img src="img/bomb.png">'
const gElModal = document.querySelector('.modal')
const gAudioClick = new Audio('sound/click.mp3')

var gBoard
var gMarkedCount = 0
var gShownCount = 0

function onInit() {
  gElModal.style.display = 'none'
  gMarkedCount = 0
  gShownCount = 0
  gBoard = buildBoard()
  renderBoard(gBoard)
}

function buildBoard() {
  // Builds empty board
  var board = createMat(4, 4)

  // Builds model board
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[i].length; j++) {
      // create cell objects
      board[i][j] = {
        minesAroundCount: 0,
        isShown: false,
        isMine: false,
        isMarked: false,
        isVisited:false
      }
      //set 2 permanent mines
      if (i === 1 && j === 2) board[1][2].isMine = true
      if (i === 2 && j === 3) board[2][3].isMine = true
    }
  }

  //update mine negs for each cell
  addMinesCountToCells(board)

  //print board
  console.log(board)

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
      // addEventListener('contextmenu', function (event) {
      //     handleRightClick(event, i, j)
      //   })
      var currCell = board[i][j]

      var cellClass = getClassName({ i, j })
      //   if (currCell.isShown) cellClass += ' shown'
      if (currCell.isMine) cellClass += ' mine'
      strHTML += `\t<td class="cell ${cellClass}" oncontextmenu="handleRightClick" onclick="onCellClicked(this,${i}, ${j})">`

      strHTML += '\t</td>\n'
    }
    strHTML += '</tr>\n'
  }

  // console.log('strHTML is:')
  // console.log(strHTML)
  elBoard.innerHTML = strHTML
  //   addEventListener('contextmenu', handleRightClick)
  addEventListener('contextmenu', function (event) {
    handleRightClick(event)
  })
}

function handleRightClick(event) {
  //// onCellMarked
  //hide the context menu
  event.preventDefault()
  //get cell element (DOM)
  var cell = event.target
  //get i,j from cell class
  var sprClass = cell.classList[1].split('-')
  var i = sprClass[1]
  var j = sprClass[2]
  //if cell isShown dont add flag
  if (gBoard[i][j].isShown) return
  console.log('Right click')
  //if cell isnt marked mark it (MODEL) and add it to count
  gBoard[i][j].isMarked = !gBoard[i][j].isMarked
  if (!gBoard[i][j].isMarked) gMarkedCount++
  // show flag on marked cell
  if (gBoard[i][j].isMarked) cell.innerText = '\u{1F6A9}'
  else cell.innerText = ''
  gAudioClick.volume = 0.2
  gAudioClick.play()
}

function onCellClicked(elCell, i, j) {
  checkGameOver()
  //add 1 to gShownCount when showing cell on click
  if (!gBoard[i][j].isShown) ++gShownCount
  // show on model
  gBoard[i][j].isShown = !gBoard[i][j].isShown
  //show on DOM
  elCell.classList.toggle('shown')

  if (!gBoard[i][j].isMine) {
    //when there are no mines around it won't show 0 but empty cell
    elCell.innerText = gBoard[i][j].isShown
      ? gBoard[i][j].minesAroundCount
        ? gBoard[i][j].minesAroundCount
        : ''
      : ''
    gAudioClick.volume = 0.2
    gAudioClick.play()
  } else {
    elCell.innerHTML = gBoard[i][j].isShown ? MINE_IMG : ''
    var audioExplosion = new Audio('sound/explosion.mp3')
    audioExplosion.volume = 0.2
    audioExplosion.play()
  }
  console.log('gBoard[i][j].isShown ', gBoard[i][j].isShown)
  console.log('gBoard[i][j].minesAroundCount', gBoard[i][j].minesAroundCount)
  if (gBoard[i][j].isShown && !gBoard[i][j].minesAroundCount) {
    console.log('im in')
    expandShown(gBoard, i, j)
  }
}

function checkGameOver() {
  var cellsCount = gBoard.length ** 2

  if (cellsCount - (gShownCount + 1) === gMarkedCount) {
    var audioWin = new Audio('sound/win.mp3')
    audioWin.volume = 0.2
    audioWin.play()
    gElModal.style.display = 'block'
  }
}

function expandShown(board, cellI, cellJ) {
  if(board[cellI][cellJ].isVisited)return
  console.log('expand')
  if (board[cellI][cellJ].minesAroundCount) return
  for (var i = cellI - 1; i <= cellI + 1; i++) {
    if (i < 0 || i >= board.length) continue
    for (var j = cellJ - 1; j <= cellJ + 1; j++) {
      if (j < 0 || j >= board[i].length) continue
      if (i === cellI && j === cellJ) continue
      if (!board[i][j].minesAroundCount ) {
        board[i][j].isVisited=true
        console.log('i',i)
        console.log('j',j)
        console.log('board[i][j]',board[i][j])
        expandShown(board,i, j)
      }
      addClassToCell('shown', i, j) 
    }
  }
}
