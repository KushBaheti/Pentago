// Handle marble placement.
const emptySpaces = [...document.querySelectorAll("circle")]
const body = document.querySelector("body")
const arrows = document.querySelectorAll(".rotate-arrow")

// Handle rotation.
const rotateRightArrows = [...document.querySelectorAll(".right")]
const rotateLeftArrows = [...document.querySelectorAll(".left")]
const quads = document.querySelectorAll("svg")
let degreesOfRotation = [0, 0, 0, 0]

// Change background color and header.
const heading = document.querySelector("#heading")
let color = body.style.background || "white"
let nextColor = body.style.background || "white"

// Store current state of game.
let isEmptySpacesActive = false // Activate/deactivate placement of marble
let isArrowsActive = false // Activate/deactivate rotation of quad
let numOfPlacedMarbles = 0
let quadrant = 0, row = 0, column = 0

board = [
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null]
]

// Listen for marble placement.
isEmptySpacesActive = true
emptySpaces.forEach((space) => {
    space.addEventListener("click", function containerFunc() {
        placeMarble(space)
    })
})

// Listen for rotation.
rotateRightArrows.forEach((arrow) => {
    arrow.addEventListener("click", () => {
        // console.log("in event func: ", this)
        rotate(arrow, 90, rotateRightArrows)
    })
})
rotateLeftArrows.forEach((arrow) => {
    arrow.addEventListener("click", () => {
        rotate(arrow, -90, rotateLeftArrows)
    })
})

// Fill in emptySpace selected by player with appropriate color.
// Update the logic board to reflect this change.
const placeMarble = (space) => {
    if (isEmptySpacesActive) {
        // Fill
        color = body.style.background || "white"
        nextColor = color === "white" ? "black" : "white"
        space.style.fill = color

        numOfPlacedMarbles++

        // Update
        let selectedSpace = space.id.split("-")
        quadrant = selectedSpace[0]
        row = selectedSpace[1]
        column = selectedSpace[2]
        placeMarbleOnBoard(Number(quadrant), Number(row), Number(column), color)

        // Check if player has won
        const winningColor = isGameOver() || ''
        if (winningColor === color) {
            heading.innerHTML = color.toUpperCase().concat(" WINS!")
        } else {
            space.style.pointerEvents = "none"
            isEmptySpacesActive = false
            isArrowsActive = true
        }
    }
}

// Update the logic board to show the most recent marble placed.
const placeMarbleOnBoard = (quadrant, row, column, color) => {
    let actualRow = 0, actualColumn = 0
    // The 9 emptySpaces in each quad have id as follows: (quadNumber, row, column).
    // As quad may be rotated, we cannot directly place the marble acc to
    // the row/column indices received.
    // We need to find the correct rotated values of row and column.
    adjustedCoordinates = getAdjustedCoordinates(quadrant, row, column)
    actualRow = adjustedCoordinates[0]
    actualColumn = adjustedCoordinates[1]
    board[actualRow][actualColumn] = color

    // At this point, marble should be placed on logic board at 
    // exact same position user clicks empty space on the Pentago board.
    // This is followed by handling rotation of a quad using the arrow keys.  
}

// Handle placement of marble in already rotated quads.
// Given the original row/column, return the appropriate 
// row/column indices after accounting for rotation.
const getAdjustedCoordinates = (quadrant, row, column) => {
    rotation = degreesOfRotation[quadrant] % 360
    let actualRow = row
    let actualColumn = column
    
    // Rotate
    if (rotation === 90) {
        if (row === 0) actualColumn = 2
        else if (row === 1) actualColumn = 1
        else if (row === 2) actualColumn = 0

        if (column === 0) actualRow = 0
        else if (column === 1) actualRow = 1
        else if (column === 2) actualRow = 2

    } else if (rotation === -90) {
        if (column === 0) actualRow = 2
        else if (column === 1) actualRow = 1
        else if (column === 2) actualRow = 0

        if (row === 0) actualColumn = 0
        else if (row === 1) actualColumn = 1
        else if (row === 2) actualColumn = 2

    } else if (rotation === 180 || rotation === -180) {
        if (row === 0) actualRow = 2
        else if (row === 1) actualRow = 1
        else if (row === 2) actualRow = 0

        if (column === 0) actualColumn = 2
        else if (column === 1) actualColumn = 1
        else if (column === 2) actualColumn = 0

    }

    // Translate to correct quad
    let xAdjustment = 0
    let yAdjustment = 0
    if (quadrant === 1) {
        yAdjustment = 3
    } else if (quadrant === 2) {
        xAdjustment = 3
    } else if (quadrant === 3) {
        xAdjustment = 3
        yAdjustment = 3;
    }

    actualRow += xAdjustment
    actualColumn += yAdjustment
    return [actualRow, actualColumn]
}

// Rotate a quad acc to arrow keys clicked by player.
const rotate = (arrow, rotationValue, arrows) => {
    if (isArrowsActive) {
        const quadIndex = arrows.indexOf(arrow)
        const thisQuad = quads[quadIndex]
        degreesOfRotation[quadIndex] += rotationValue

        // Rotate quad in logic board
        rotateBoardQuadrant(quadIndex, rotationValue)

        // Rotate quad visible to players
        thisQuad.style.transform = `rotateZ(${degreesOfRotation[quadIndex]}deg)`
        thisQuad.style.transition = "transform 0.4s linear"
        isArrowsActive = false

        // Check if any player won
        const winningColor = isGameOver() || ''
        if (winningColor === color) {
            setTimeout(() => {
                heading.innerHTML = color.toUpperCase().concat(" WINS!")
            }, 400)
        } else if (winningColor === nextColor) {
            setTimeout(() => {
                heading.innerHTML = nextColor.toUpperCase().concat(" WINS!")
                changeBackground()
            }, 400)
        } else {
            setTimeout(() => {
                changeBackground()
            }, 400)
            isEmptySpacesActive = true
        }

    }
}

// Change background, heading and arrows.
const changeBackground = () => {
    body.style.background = nextColor
    heading.style.color = color
    arrows.forEach((arrow) => {
        if (!arrow.style.filter) {
            arrow.style.filter = "invert(1)"
        } else {
            arrow.style.filter = ""
        }
    })
}

// Rotate quad in logic board.
const rotateBoardQuadrant = (quadIndex, rotationValue) => {
    var tempQuad = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ]

    let startingRow = 0
    let startingCol = 0

    if (quadIndex === 1) {
        startingRow = 0
        startingCol = 3
    } else if (quadIndex === 2) {
        startingRow = 3
        startingCol = 0
    } else if (quadIndex === 3) {
        startingRow = 3
        startingCol = 3
    }

    // Copy values to tempQquad
    let i = 0, j = 0
    for (var row = startingRow; row < startingRow + 3; row++) {
        for (var col = startingCol; col < startingCol + 3; col++) {
            tempQuad[i][j] = board[row][col]
            j++
        }
        i++
        j = 0
    }

    // Rotate
    if (rotationValue < 0) { // anticlockwise rotation
        for (var x = 0; x < 3 / 2; x++) {
            for (var y = x; y < 3 - x - 1; y++) {
                temp = tempQuad[x][y]
                tempQuad[x][y] = tempQuad[y][3 - 1 - x]
                tempQuad[y][3 - 1 - x] = tempQuad[3 - 1 - x][3 - 1 - y]
                tempQuad[3 - 1 - x][3 - 1 - y] = tempQuad[3 - 1 - y][x]
                tempQuad[3 - 1 - y][x] = temp
            }
        }
    } else { // clockwise rotation
        for (var x = 0; x < 3 / 2; x++) {
            for (var y = x; y < 3 - x - 1; y++) {
                temp = tempQuad[x][y]
                tempQuad[x][y] = tempQuad[3 - 1 - y][x]
                tempQuad[3 - 1 - y][x] = tempQuad[3 - 1 - x][3 - 1 - y]
                tempQuad[3 - 1 - x][3 - 1 - y] = tempQuad[y][3 - 1 - x]
                tempQuad[y][3 - 1 - x] = temp
            }
        }
    }

    // Copy values back to logic board
    i = 0
    j = 0
    for (var row = startingRow; row < startingRow + 3; row++) {
        for (var col = startingCol; col < startingCol + 3; col++) {
            board[row][col] = tempQuad[i][j]
            j++
        }
        i++
        j = 0
    }

    // At this point, logic board should look exactly as 
    // Pentago board seen on screen, i.e., correct after one 
    // marble placement and subsequent rotation.
}

// Check if game is over, i.e., if any player has won!
const isGameOver = () => {
    // if less than 9 pieces on board, dont bother checking
    if (numOfPlacedMarbles < 9) {
        return false
    }

    // Check all possible winning sequences
    const array01 = [0, 1]
    const array45 = [4, 5]
    for (let row = 0; row < 5; row++) {
        for (let column = 0; column < 5; column++) {
            if (board[row][column] !== null) {
                let color = board[row][column]
                // Check rightwards horizontal line
                if (array01.includes(column)) {
                    if (checkDirection(row, column, color, 0, 1)) {
                        return color
                    }
                }
                // Check downwards vertical line
                if (array01.includes(row)) {
                    if (checkDirection(row, column, color, 1, 0)) {
                        return color
                    }
                }
                // Check top-left diagonals
                if (array01.includes(row) && array01.includes(column)) {
                    if (checkDirection(row, column, color, 1, 1)) {
                        return color
                    }
                }
                // Check top-right diagonals
                if (array01.includes(row) && array45.includes(column)) {
                    if (checkDirection(row, column, color, -1, 1)) {
                        return color
                    }
                }
            }
        }
    }
}

// Check winning sequences of a particular direction.
const checkDirection = (row, column, color, deltaX, deltaY) => {
    let count = 0
    while (board[row][column] === color) {
        count++
        row += deltaX
        column += deltaY
        if (row < 0 || row >= 6 || column < 0 || column >= 6) {
            break
        }
    }
    if (count === 5) {
        return true
    }
    return false
}