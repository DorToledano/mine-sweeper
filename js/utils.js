'use strict'

var startTime = 0
var endTime = 0
var timerInterval = null
var gSeconds 
  var gMinutes 
  var gHours 
function createMat(ROWS, COLS) {
  var mat = []
  for (var i = 0; i < ROWS; i++) {
    var row = []
    for (var j = 0; j < COLS; j++) {
      row.push({})
    }
    mat.push(row)
  }
  return mat
}

function getClassName(location) {
  var cellClass = 'cell-' + location.i + '-' + location.j
  return cellClass
}

function renderCell(location, value) {
  var cellSelector = '.' + getClassName(location)
  var elCell = document.querySelector(cellSelector)
  elCell.innerHTML = value
}

function getEmptyLocation() {
  const emptyPoss = []
  for (let i = 0; i < gBoard.length; i++) {
    for (let j = 0; j < gBoard[0].length; j++) {
      if (!gBoard[i][j].isMine && !gBoard[i][j].isShown) emptyPoss.push({ i, j })
    }
  }
  if (!emptyPoss.length) return null
  var randIdx = getRandomIntInclusive(0, emptyPoss.length - 1)
  return emptyPoss[randIdx]
}

function getRandomIntInclusive(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function updateModal(userMsg) {
  var elModal = document.querySelector('.modal')
  elModal.style.display = 'block'
  var elModalSpan = document.querySelector('.modal span')
  elModalSpan.innerText = userMsg
}

function startTimer() {
  // get the start time
  startTime = new Date()

  //show clock
  document.querySelector('.timer').style.display = 'block'

  // update the timer immediately
  updateTimer()

  // update the timer every second
  timerInterval = setInterval(updateTimer, 1000)
}

function updateTimer() {
  // get the current time
  var currentTime = new Date()

  // calculate the elapsed time
  var elapsedTime = currentTime - startTime

  // format the elapsed time
 gSeconds = Math.floor(elapsedTime / 1000)
 gMinutes = Math.floor(gSeconds / 60)
 gHours = Math.floor(gMinutes / 60)
  // var seconds = Math.floor(elapsedTime / 1000)
  // var minutes = Math.floor(seconds / 60)
  // var hours = Math.floor(minutes / 60)

  gSeconds = gSeconds % 60
  gMinutes = gMinutes % 60

  // pad the minutes and seconds with leading zeros if necessary
  if (gMinutes < 10) {
    gMinutes = `0${gMinutes}`
  }
  if (gSeconds < 10) {
    gSeconds = `0${gSeconds}`
  }

  // get the timer element from the HTML page
  var timer = document.querySelector('.timer')

  // update the timer's text with the elapsed time
  timer.innerText = `${gHours}:${gMinutes}:${gSeconds}`
}

function stopTimer() {
  // get the end time
  endTime = new Date()
  // clear the timer interval
  clearInterval(timerInterval)
}

function addClassToCell(value, i, j) {
  var cellSelector = '.' + getClassName({ i, j })
  var elCell = document.querySelector(cellSelector)
  elCell.classList.add(value)
  gBoard[i][j].isShown = true
  gGame.shownCount++
  if (gBoard[i][j].isMine) elCell.innerHTML =MINE_IMG
  else if (gBoard[i][j].minesAroundCount) elCell.innerText = gBoard[i][j].minesAroundCount
}
function removeClassFromCell(value, i, j) {
  var cellSelector = '.' + getClassName({ i, j })
  var elCell = document.querySelector(cellSelector)
  elCell.classList.remove(value)
  gBoard[i][j].isShown = false
  gGame.shownCount--
    elCell.innerText = ''
}