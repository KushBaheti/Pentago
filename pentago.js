// CHANGE BACKGROUND, HEADING AND ARROWS

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

const isGameOver = () => {
    return false
}

const gameOver = () => {
    return false
}

// HANDLE ROTATION

const rotateRightArrows = [...document.querySelectorAll(".right")]
const rotateLeftArrows = [...document.querySelectorAll(".left")]
const quads = document.querySelectorAll("svg")
let degreesOfRotation = [0, 0, 0, 0]

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

const rotateBoardQuadrant = (quadIndex, rotationValue) => {
    console.log("rotating")
    return false

    // let xOrigin = 0
    // let yOrigin = 0

    // if (quadIndex === 1){
    //     yOrigin = 3
    // } else if (quadIndex === 2){
    //     xOrigin = 3
    // } else if (quadIndex === 3){
    //     xOrigin = 3
    //     yOrigin = 3        
    // }

    // let mat = [[]]
    // let r = 0
    // let c = 0
    // for (let i = xOrigin; i < 3; i++){
    //     for (let j = yOrigin; j < 3; j++){
    //         mat[r][c] = board[i][j]
    //         c += 1
    //     }
    //     r += 1
    //     c = 0
    // }

    // console.log(mat)

    // const N = 3
    // for (let x = 0; x < N/2; x++){ 
    //     // Consider elements in group of 4 in  
    //     // current square 
    //     for (let y = x; y < N-x-1; y++) 
    //     { 
    //         // store current cell in temp variable 
    //         let temp = mat[x][y]; 
  
    //         // move values from right to top 
    //         mat[x][y] = mat[y][N-1-x]; 
  
    //         // move values from bottom to right 
    //         mat[y][N-1-x] = mat[N-1-x][N-1-y]; 
  
    //         // move values from left to bottom 
    //         mat[N-1-x][N-1-y] = mat[N-1-y][x]; 
  
    //         // assign temp to left 
    //         mat[N-1-y][x] = temp; 
    //     } 
    // }

    // console.log(mat)

}

const rotate = (arrow, rotationValue, arrows) => {
    if (isArrowsActive){
        // console.log("in rotate func: ", this)
        const quadIndex = arrows.indexOf(arrow)
        const thisQuad = quads[quadIndex]
        degreesOfRotation[quadIndex] += rotationValue
        thisQuad.style.transform = `rotateZ(${degreesOfRotation[quadIndex]}deg)`
        thisQuad.style.transition = "transform 0.4s linear"
        isArrowsActive = false

        // ROTATE QUADRANT
        rotateBoardQuadrant(quadIndex, rotationValue)

        // check if won!
        if (isGameOver()){
            isGameOver()
        }

        setTimeout(() => {
            changeBackground()
        }, 400)
        isEmptySpacesActive = true
    }
}

// HANDLE MARBLE PLACEMENT

const emptySpaces = [...document.querySelectorAll("circle")]
const body = document.querySelector("body")
const arrows = document.querySelectorAll(".rotate-arrow")
const heading = document.querySelector("h1")

const placeMarbleOnBoard = (quadrant, row, column, color) => {
    rotation = degreesOfRotation[quadrant] % 360
    // console.log("raw: ", degreesOfRotation[quadrant])
    // console.log("mod: ", rotation)
    // console.log(typeof(row))

    console.log("row: " + row + " col: " + column + " quadrant: " + quadrant)

    let actualRow = row
    let actualColumn = column
    if (rotation === 90){
        if (row === 0) actualColumn = 2
        else if (row === 1) actualColumn = 1
        else if (row === 2) actualColumn = 0

        if (column === 0) actualRow = 0
        else if (column === 1) actualRow = 1
        else if (column === 2) actualRow = 2

    } else if (rotation === -90){
        if (column === 0) actualRow = 2
        else if (column === 1) actualRow = 1
        else if (column === 2) actualRow = 0

        if (row === 0) actualColumn = 0
        else if (row === 1) actualColumn = 1
        else if (row === 2) actualColumn = 2

    } else if (rotation === 180 || rotation === -180){
        if (row === 0) actualRow = 2
        else if (row === 1) actualRow = 1
        else if (row === 2) actualRow = 0

        if (column === 0) actualColumn = 2
        else if (column === 1) actualColumn = 1
        else if (column === 2) actualColumn = 0

    }
    console.log("aRow: " + actualRow + " aCol: " + actualColumn)

    let xAdjustment = 0
    let yAdjustment = 0

    if (quadrant === 1){
        console.log("1")
        yAdjustment = 3
    }
    else if (quadrant === 2){
        console.log("2")        
        xAdjustment = 3 
    }
    else if (quadrant === 3){
        console.log("3")
        xAdjustment = 3
        yAdjustment = 3;
    }
    // console.log(actualRow)

    actualRow += xAdjustment
    actualColumn += yAdjustment 

    console.log(actualRow, actualColumn)

    board[actualRow][actualColumn] = color
    console.log(board)
}

const placeMarble = (space) => {

    if (isEmptySpacesActive){
        color = body.style.background || "white"
        nextColor = color === "white" ? "black" : "white"
        space.style.fill = color

        // modify logic board
        const [ quadrant, row, column ] = space.id.split("-")
        placeMarbleOnBoard(Number(quadrant), Number(row), Number(column), color)


        space.style.pointerEvents = "none"
        isEmptySpacesActive = false
        isArrowsActive = true
    }
}

// STORE CURRENT STATE OF BOARD
let isEmptySpacesActive = false
let isArrowsActive = false
let color = body.style.background || "white"
let nextColor = body.style.background || "white"

board = [
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null],
    [null, null, null, null, null, null]
]

// enable emptySpaces to make a move
// enable arrows
// rotate
// disable arrows
isEmptySpacesActive = true
emptySpaces.forEach((space) => {
    space.addEventListener("click", function containerFunc(){
        placeMarble(space)
    })
})

// check if won
