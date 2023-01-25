'use strict'

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
