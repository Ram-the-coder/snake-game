const UP = 0, RIGHT = 1, DOWN = 2, LEFT = 3

const foodStayTime = 10000  // Amount of time in milliseconds that the food stays in one place 
							// before reappearing in another place if not consumed
const boardRefreshRate = 75 // Speed of the game, the amount of time to wait to recalculate the new position of the snake and move it

let refreshBoard, foodTimer // setInterval variables

let isPaused=1, score=0, hiscore, gameOver=1

let dir; // Direction that the head of the snake is moving

let foodCoord; // The coordinates of food
let snakeCoords; // The coordinates of the snake


/* Setup the setInterval function so that it periodically refreshes the board */
function startBoardRefresh() {
	isPaused = 0
	refreshBoard = setInterval(() => {
		moveSnake()
		renderBoard()
	}, boardRefreshRate)	
}

/* Setup the setInterval function so that it periodically generates food at a new spot */
function startFoodGeneration() {
	foodTimer = setInterval(() => {
		foodCoord = {
			x: Math.floor(Math.random() * 50),
			y: Math.floor(Math.random() * 50),
		}
	}, foodStayTime)
}

/* Stop refreshing the board */
function stopBoardRefresh() {
	isPaused = 1
	clearInterval(refreshBoard)
}

/* Stop food generation */
function stopFoodGeneration() {
	clearInterval(foodTimer)
}

/* Get the cell number given the x and y coordinate */
function getCellno(x, y) {
	return x*50 + y
}

/* Returns a reference to the html element corresponding to the cell at coordinate x and y */
function getCell(x, y) {
	const cellno = getCellno(x, y)
	return document.getElementById('c' + cellno)
}

/* Render the board */
function renderBoard() {
	const board = document.querySelector('#board')
	// CLear the board
	board.innerHTML = ""

	// Create the cells in the board
	for(let i=0; i<50; ++i) {
		const row = document.createElement('div')
		row.classList.add('row')
		row.classList.add('snake-row')
		row.id = 'r'+i

		for(let j=0; j < 50; ++j) {
			const col = document.createElement('div')
			col.classList.add('col')
			col.classList.add('snake-cell')
			col.id = 'c'+ getCellno(i, j)
			row.appendChild(col)
		}

		board.appendChild(row)
	}

	// Mark the cells where the snake exists
	snakeCoords.forEach((coord, index) => {
		const cell = getCell(coord.x, coord.y)
		cell.classList.add('snake-body')
	})	

	// Mark the cell where the food exists
	{
		const cell = getCell(foodCoord.x, foodCoord.y)
		cell.classList.add('food')
	}
}

/* Recalculates the coordinates of all the parts of the snake and checks for the event of collision and eating of food */
function moveSnake() {
	snakeCoords.forEach((coord, index, snakeCoords) => {
		// If it is not the head of the snake, the new coordinate of this part is the old coordinate of the next part of the snake
		if(index < snakeCoords.length - 1) {
			snakeCoords[index] = JSON.parse(JSON.stringify(snakeCoords[index+1]))
		} else {
			// Head of snake
			switch(dir) {
				case RIGHT: snakeCoords[index].y = (coord.y + 1) % 50; break;
				case UP: snakeCoords[index].x = (coord.x - 1 + 50) % 50; break;					
				case LEFT: snakeCoords[index].y = (coord.y - 1 + 50) % 50; break;
				case DOWN: snakeCoords[index].x = (coord.x + 1) % 50; break;
			}	

			const cell = getCell(snakeCoords[index].x, snakeCoords[index].y)

			// If head of snake collides with body
			if(cell.classList.contains('snake-body')) {
				gameOver = 1;
				$('#pause').text('Start')
				stopBoardRefresh()
				if(score > hiscore) {
					alert("Congratulations you have achieved the hiscore of " + score)
					insertIntoLocalStorage('hiscore', score)
				} else {
					alert('Gameover. You scored ' + score)
				}
			}

			// If snake eats food
			if(cell.classList.contains('food')) {
				cell.classList.remove('food')
				score += 5
				updateScoreBoard()
				stopFoodGeneration()
				foodCoord = {
					x: Math.floor(Math.random() * 50),
					y: Math.floor(Math.random() * 50),
				}
				startFoodGeneration()
				growSnake()	
			}
		}
	})
}

/* Called when the snake has eaten food, the snake is grown by adding one part as the tail 
   The attributes of the added part doesn't matter as when we call moveSnake() subsequently
   it will reassign the attributes of new part to the old tail, thus when the snake moves by one
   step, the empty place left by the old tail is occupied by the new part */
function growSnake() {
	const tailCoord = JSON.parse(JSON.stringify(snakeCoords[0]));
	snakeCoords.unshift(tailCoord)
}

/* Update the score and hi-score */
function updateScoreBoard() {
	$('#score').text(score)
	if(score > hiscore)
		$('#hiscore').text(score)
}

/* A utility function to insert key value pairs into local storage */
function insertIntoLocalStorage(key, value) {
	window.localStorage.setItem(key, JSON.stringify(value))
}

/* A utility function to fetch values from local storage based on key */
function getFromLocalStorage(key) {
	return JSON.parse(window.localStorage.getItem(key))
}

/* Function that runs when the button in the header is clicked */
function handleButtonClick() {
	// If the game hasn't started, then start the game and change the text of the button to Pause
	if(gameOver) {
		startGame()
		$('#pause').text('Pause')
	}
	else if(isPaused) { // If the game has started and it is paused, resume the refreshing and change the text of the button to Pause
		startBoardRefresh()
		$('#pause').text('Pause')
	}
	else { // If the game is active then stop the refreshing to pause the game and change the text of the button to Resume
		stopBoardRefresh()
		$('#pause').text('Resume')
	}
}

/* The function that needs to be called to start the game */
function startGame() {
	snakeCoords = [
		{ x: 25, y: 25 }, 
		{ x: 25, y: 26 }, 
		{ x: 25, y: 27 },
		{ x: 25, y: 28 } // The last coordinate in the snakeCoords represend the head of the snake
	]	
	
	foodCoord = {
		x: Math.floor(Math.random() * 50),
		y: Math.floor(Math.random() * 50),
	}

	dir = RIGHT
	score = 0
	gameOver = 0
	hiscore = getFromLocalStorage('hiscore')
	if(!hiscore)
		hiscore = 0
	$('#hiscore').text(hiscore)
	updateScoreBoard()
	renderBoard()
	startBoardRefresh()
	startFoodGeneration()
}

/* Will throttle func to only fire once every limit milliseconds, 
	if a second call is made before limit is over, it will be queued */
const throttle = (func, limit) => {
  let lastFunc
  let lastRan
  return function() {
    const context = this
    const args = arguments
    if (!lastRan) {
      func.apply(context, args)
      lastRan = Date.now()
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }
}

/* Register key press events */
window.addEventListener('keyup', throttle(function(e) {
	switch(e.keyCode) {
		case 80: // pause/play
					handleButtonClick()
					break
		case 37: // move left
					if(dir == RIGHT) // can't move left when moving right
						break
					dir = LEFT
					break
		case 38: // up
					if(dir == DOWN) // can't move up when moving down
						break
					dir = UP
					break
		case 39: // right 
					if(dir == LEFT) // can't move right when moving left
						break
					dir = RIGHT
					break
		case 40: // down
					if(dir == UP) // can't move down when moving up
						break
					dir = DOWN
					break
	}
}, boardRefreshRate))

$('#pause').click(handleButtonClick)

