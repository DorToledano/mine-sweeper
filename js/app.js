'use strict'
var table = [
  ['0,0', '0,1', '0,2', '0,3'],
  ['1,0', '1,1', '1,2 \u{1F4DB}', '1,3'],
  ['2,0', '2,1', '2,2', '2,3 \u{1F4DB}'],
  ['3,0', '3,1', '3,2', '3,3'],
]
console.table(table)

const MINE_IMG = '<img src="img/bomb.png">'
var gBoard
var gMarkedCount=0
var gShownCount=0

function onInit() {
    gMarkedCount=0
    gShownCount=0
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

  console.log('strHTML is:')
  console.log(strHTML)
  elBoard.innerHTML = strHTML
  //   addEventListener('contextmenu', handleRightClick)
  addEventListener('contextmenu', function (event) {
    handleRightClick(event)
  })
}

function handleRightClick(event) {
    // function handleRightClick(event,elCell) { ??
  //how do i catch i,j when i cant use (this) ??
  event.preventDefault()
  var cell = event.target
  console.log('cell', cell)
  // board[i][j].isMarked=true
  gMarkedCount++
  if (cell.innerText === '\u{1F6A9}') {
    cell.innerText = '?'
  } else {
    cell.innerText = '\u{1F6A9}'
    console.log('Right click')
  }
}
// function onCellMarked(elCell) {          ////////same above^
//   //Called when a cell is right- clicked
//   //See how you can hide the context menu on right click
// }

function onCellClicked(elCell, i, j) {
    checkGameOver()
  console.log('hey')
  if(!gBoard[i][j].isShown) ++gShownCount
  // show on model
  gBoard[i][j].isShown = !gBoard[i][j].isShown
  //show on DOM
  elCell.classList.toggle('shown')

  if (gBoard[i][j].isMine) {
    elCell.innerHTML = gBoard[i][j].isShown ? MINE_IMG : ''
  } else
  //when there are no mines around it won't show 0 but empty cell
    elCell.innerText = gBoard[i][j].isShown ? (gBoard[i][j].minesAroundCount? gBoard[i][j].minesAroundCount:'') : ''

}

function checkGameOver(){
    var cellsCount= gBoard.length**2
    console.log('cellsCount',cellsCount)
    console.log('gShownCount',gShownCount)
    console.log('gMarkedCount',gMarkedCount)

if (cellsCount-(gShownCount+1)===gMarkedCount){
    var audioWin = new Audio('sounds/win.mp3')
    audioWin.volume = 0.1
    audioWin.play()
    var elModal = document.querySelector('.modal')
    elModal.style.display = 'block'
}
}
