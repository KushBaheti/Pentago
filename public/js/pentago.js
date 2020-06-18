// Client side socket.io
const socket = io()

// const socket = require('./socket')

// Get new clients game mode, username, room and join
const { gameMode = undefined, username = undefined, room = undefined } = Qs.parse(location.search, { ignoreQueryPrefix: true })
const isOnline = gameMode === "true" ? true : false
socket.emit("join", { isOnline, username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = "/"
    }
})

// Messages received to update event log
socket.on("message", (message) => {
    console.log(message)
})

// Update scoreboard
let nameOne = document.querySelector(".p1") 
let nameTwo = document.querySelector(".p2")
let scoreOne = document.querySelector(".s-p1")
let scoreTwo = document.querySelector(".s-p2")
let playerOne = undefined
let playerTwo = undefined
socket.on("roomData", ({ room, users }) => {
    console.log(room, users)

    if (users[0].color === "white") {
        // this is player 1
        playerOne = users[0]
        playerTwo = users[1] || undefined
    } else {
        // this is player 2
        playerOne = users[1] || undefined
        playerTwo = users[0]
    }

    nameOne.innerHTML = playerOne.username
    scoreOne.innerHTML = playerOne.wins

    if (playerTwo) {
        nameTwo.innerHTML = playerTwo.username
        scoreTwo.innerHTML = playerTwo.wins
    }
})

// Update heading with each turn
let isFirstTime = true
const setHeading = () => {
    if (isFirstTime) {
        if (playerOne.color === color) {
            heading.innerHTML = playerOne.username + "\'s turn!"
        } else {
            heading.innerHTML = playerTwo.username + "\'s turn!"
        }
        isFirstTime = false
    } else {
        if (playerOne.color === color) {
            heading.innerHTML = playerTwo.username + "\'s turn!"
        } else {
            heading.innerHTML = playerOne.username + "\'s turn!"
        }
    }
}

// Specify who makes the first move
let isMyTurn = undefined
socket.on("chance", (chance) => {
    isMyTurn = chance
    setHeading()
})

const getWinnerAndUpdateScoreboard = (color) => {
    if (playerOne.color === color) {
        scoreOne.innerHTML = parseInt(playerOne.wins) + 1
        return playerOne.username.toUpperCase()
    } else {
        scoreTwo.innerHTML = parseInt(playerTwo.wins) + 1
        return playerTwo.username.toUpperCase()
    }
}

// Handle marble placement
const emptySpaces = [...document.querySelectorAll("circle")]
const body = document.querySelector("body")
const arrows = document.querySelectorAll(".rotate-arrow")

// Handle rotation
const rotateRightArrows = [...document.querySelectorAll(".right")]
const rotateLeftArrows = [...document.querySelectorAll(".left")]
const quads = document.querySelectorAll("svg")
let degreesOfRotation = [0, 0, 0, 0]

// Change background color and header
const heading = document.querySelector("#game-heading")
let color = body.style.background || "white"
let nextColor = body.style.background || "white"

// Store current state of game
let isEmptySpacesActive = true // Activate/deactivate placement of marble
let isArrowsActive = false // Activate/deactivate rotation of quad
let numOfPlacedMarbles = 0
let quadrant = 0, row = 0, column = 0

// Start a new game
let winningColor = ''
let newGame = document.getElementById('new-game')

// Behind the scenes Pentago board
const getEmptyBoard = () => {
    return [
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null],
        [null, null, null, null, null, null]
    ]
}

let board = getEmptyBoard()

// Listen for marble placement
emptySpaces.forEach((space) => {
    space.addEventListener("click", function containerFunc() {
        if (isMyTurn && isEmptySpacesActive) {
            socket.emit("placeMarble", space.id)
        }
    })
})

// Listen for rotation
rotateRightArrows.forEach((arrow) => {
    arrow.addEventListener("click", () => {
        if (isMyTurn && isArrowsActive) {
            socket.emit("rotate", {
                rotationValue: 90,
                quadIndex: rotateRightArrows.indexOf(arrow)
            })
        }
    })
})
rotateLeftArrows.forEach((arrow) => {
    arrow.addEventListener("click", () => {
        if (isMyTurn && isArrowsActive) {
            socket.emit("rotate", {
                rotationValue: -90,
                quadIndex: rotateLeftArrows.indexOf(arrow)
            })
        }
    })
})

// Fill in emptySpace selected by player with appropriate color
// Update the logic board to reflect this change
socket.on("placingMarble", (spaceID) => {
    // if (isEmptySpacesActive) {
        const space = document.getElementById(`${spaceID}`)
        
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
        winningColor = isGameOver()
        if (winningColor === color) {
            let winner = getWinnerAndUpdateScoreboard(color)
            heading.innerHTML = winner.concat(" WINS!")
            newGame.disabled = false
        } else {
            space.style.pointerEvents = "none"
            isEmptySpacesActive = false
            isArrowsActive = true
        }
    // }
})

// Update the logic board to show the most recent marble placed
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

// Handle placement of marble in already rotated quads
// Given the original row/column, return the appropriate 
// row/column indices after accounting for rotation
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

// Rotate a quad acc to arrow keys clicked by player
socket.on("rotating", ({ rotationValue, quadIndex }) => {       
    // Rotate quad in logic board
    const thisQuad = quads[quadIndex]    
    degreesOfRotation[quadIndex] += rotationValue
    rotateBoardQuadrant(quadIndex, rotationValue)

    // Rotate quad visible to players
    thisQuad.style.transform = `rotateZ(${degreesOfRotation[quadIndex]}deg)`
    thisQuad.style.transition = "transform 0.4s linear"
    isArrowsActive = false

    // Check if any player won
    winningColor = isGameOver()
    if (winningColor === color) {
        setTimeout(() => {
            let winner = getWinnerAndUpdateScoreboard(color)
            heading.innerHTML = winner.concat(" WINS!")
            newGame.disabled = false
        }, 400)
    } else if (winningColor === nextColor) {
        setTimeout(() => {
            changeBackground()
            let winner = getWinnerAndUpdateScoreboard(nextColor)
            heading.innerHTML = winner.concat(" WINS!")
            newGame.disabled = false
        }, 400)
    } else {
        setTimeout(() => {
            changeBackground()
        }, 400)
        isEmptySpacesActive = true
    }
})

// Change background, heading and arrows
const changeBackground = () => {
    body.style.background = nextColor
    heading.style.color = color
    setHeading()
    arrows.forEach((arrow) => {
        if (!arrow.style.filter) {
            arrow.style.filter = "invert(1)"
        } else {
            arrow.style.filter = ""
        }
    })
}

// Rotate quad in logic board
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
    for (let row = 0; row < 6; row++) {
        for (let column = 0; column < 6; column++) {
            if (board[row][column] !== null) {
                let color = board[row][column]
                // Check rightwards horizontal line
                if (array01.includes(column)) {
                    console.log("l to r")
                    if (checkDirection(row, column, color, 0, 1)) {
                        console.log('yeet')
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
                    if (checkDirection(row, column, color, 1, -1)) {
                        return color
                    }
                }
            }
        }
    }
}

// Check winning sequences of a particular direction
const checkDirection = (row, column, color, deltaX, deltaY) => {
    let count = 0
    while (board[row][column] === color) {
        count++
        console.log("count")
        console.log(board)
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

// Listen for starting a new game once current game is over
newGame.addEventListener("click", () => {
    socket.emit("requestNewGame")
})

socket.on("setupNewGame", () => {
    // Get empty board
    board = getEmptyBoard()
    // Reset all quad rotation values
    degreesOfRotation = [0, 0, 0, 0]
    // Remove marbles from board
    numOfPlacedMarbles = 0
    // Activate/deactivate placement and rotation
    isEmptySpacesActive = true
    isArrowsActive = false

    // Update score board
    // Swap first/second player
    socket.emit("newGame", winningColor)
    
    // Reset quad rotation
    quads.forEach((quad) => {
        quad.style.transform = `rotateZ(0deg)`
        quad.style.transition = "transform 0.0s linear"
    })
    // Remove marbles from board
    emptySpaces.forEach((space) => {
        space.style.fill = "crimson"
        space.style.pointerEvents = "auto"
    })
    // Update colors
    heading.innerHTML = "Pentago!"
    body.style.background = "white"
    heading.style.color = "black"
    arrows.forEach((arrow) => {
        arrow.style.filter = ""
    })
    color = body.style.background || "white"
    nextColor = body.style.background || "white"

    // Disable new game button
    newGame.disabled = true
})

