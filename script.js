const UP = 0, RIGHT = 1, DOWN = 2, LEFT = 3
const foodStayTime = 10000, boardRefreshRate = 75
let refreshBoard, foodTimer // setInterval variables
let isPaused=1, score=0, hiscore, gameOver=1

/* The coordinates of food */
let foodCoord = {
	x: Math.floor(Math.random() * 49),
	y: Math.floor(Math.random() * 49),
}

/* The coordinates of the snake */
let snakeCoords = [
	{ x: 25, y: 25, dir: RIGHT }, 
	{ x: 25, y: 26, dir: RIGHT }, 
	{ x: 25, y: 27, dir: RIGHT },
	{ x: 25, y: 28, dir: RIGHT }
]


function startBoardRefresh() {
	isPaused = 0
	refreshBoard = setInterval(() => {
		moveSnake()
		renderBoard()
	}, boardRefreshRate)	
}

function startFoodGeneration() {
	foodTimer = setInterval(() => {
		foodCoord = {
			x: Math.floor(Math.random() * 49),
			y: Math.floor(Math.random() * 49),
		}
	}, foodStayTime)
}

function stopBoardRefresh() {
	isPaused = 1
	clearInterval(refreshBoard)
}

function stopFoodGeneration() {
	clearInterval(foodTimer)
}

function getCellno(x, y) {
	return x*50 + y
}

function getCell(x, y) {
	const cellno = getCellno(x, y)
	return document.getElementById('c' + cellno)
}

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


function moveSnake() {
	snakeCoords.forEach((coord, index, snakeCoords) => {
		// If it is not the head of the snake, the new coordinate of this part is the old coordinate of the next part of the snake
		if(index < snakeCoords.length - 1) {
			snakeCoords[index] = JSON.parse(JSON.stringify(snakeCoords[index+1]))
		} else {
			// Head of snake
			switch(coord.dir) {
				case RIGHT: snakeCoords[index].y = (coord.y + 1) % 49; break;
				case UP: snakeCoords[index].x = (coord.x - 1 + 49) % 49; break;					
				case LEFT: snakeCoords[index].y = (coord.y - 1 + 49) % 49; break;
				case DOWN: snakeCoords[index].x = (coord.x + 1) % 49; break;
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
					x: Math.floor(Math.random() * 49),
					y: Math.floor(Math.random() * 49),
				}
				startFoodGeneration()
				growSnake()	
			}
		}
	})
}

function growSnake() {
	const tailCoord = JSON.parse(JSON.stringify(snakeCoords[0]));
	switch(tailCoord.dir) {
		case RIGHT: tailCoord.y = (tailCoord.y - 1 + 49) % 49; break;
		case UP: tailCoord.x = (tailCoord.x + 1) % 49; break;					
		case LEFT: tailCoord.y = (tailCoord.y + 1) % 49; break;
		case DOWN: tailCoord.x = (tailCoord.x - 1 + 49) % 49; break;
	}
	snakeCoords.unshift(tailCoord)
	console.log(JSON.parse(JSON.stringify(snakeCoords)))

}

function updateScoreBoard() {
	$('#score').text(score)
	if(score > hiscore)
		$('#hiscore').text(score)
}

function insertIntoLocalStorage(key, value) {
	window.localStorage.setItem(key, JSON.stringify(value))
}

function getFromLocalStorage(key) {
	return JSON.parse(window.localStorage.getItem(key))
}

function handleButtonClick() {
	if(gameOver) {
		startGame()
		$('#pause').text('Pause')
	}
	else if(isPaused) {
		startBoardRefresh()
		$('#pause').text('Pause')
	}
	else {
		stopBoardRefresh()
		$('#pause').text('Resume')
	}
}



function startGame() {
	score = 0
	gameOver = 0
	hiscore = getFromLocalStorage('hiscore')
	if(!hiscore)
		hiscore = 0
	document.getElementById('hiscore').innerHTML = hiscore
	updateScoreBoard()
	renderBoard()
	startBoardRefresh()
	startFoodGeneration()
}

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
		case 37: // left
					if(snakeCoords[snakeCoords.length - 1].dir == RIGHT)
						break
					snakeCoords[snakeCoords.length - 1].dir = LEFT
					break
		case 38: // up
					if(snakeCoords[snakeCoords.length - 1].dir == DOWN)
						break
					snakeCoords[snakeCoords.length - 1].dir = UP
					break
		case 39: // right 
					if(snakeCoords[snakeCoords.length - 1].dir == LEFT)
						break
					snakeCoords[snakeCoords.length - 1].dir = RIGHT
					break
		case 40: // down
					if(snakeCoords[snakeCoords.length - 1].dir == UP)
						break
					snakeCoords[snakeCoords.length - 1].dir = DOWN
					break
	}
}, boardRefreshRate))

$('#pause').click(handleButtonClick)

