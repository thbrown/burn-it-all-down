document.addEventListener('DOMContentLoaded', (event) => {
    const gameContainer = document.getElementById('game-container');
    const winMessage = document.getElementById('win-message');
    const colors = ['red', 'blue', 'green'];
    const squareSize = 48; // The size of each square
    const queryParams = new URLSearchParams(window.location.search);
    console.log("Params", queryParams.get('width'), queryParams.get('height'));
    let gameWon = false;

    // Set the innerHTML to the appropriate SVG based on the color
    const RED_SVG = `
        <svg class="red-filter" width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <g id="Artboard-Copy" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <path d="M11.6223011,0 C11.6223011,1.70940171 12.1128933,3.07692308 13.0940778,4.1025641 C16.3646926,6.4957265 18,9.23076923 18,12.3076923 C18,15.7264957 16.0376311,18.2905983 12.1128933,20 C15,17 14.5658545,15.7692308 11.6223011,12 C8.5,13.5 9,14.5 9.5,16.5 C8.45242566,16.5 7.5,16.5 7,16 C7,16.6837607 8.19671588,18.5 8.95242566,20 C5.02768789,18.974359 0.829272269,12.8205128 2.30104893,12.3076923 C3.28223337,11.965812 4.42694856,12.1367521 5.73519448,12.8205128 C4.09988708,6.66666667 6.06225596,2.39316239 11.6223011,0 Z" id="Path-3" fill="#000000"></path>
            </g>
        </svg>`;
    const BLUE_SVG = `
        <svg class="blue-filter" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
        width="20px" height="20px" viewBox="0 0 20 20" enable-background="new 0 0 20 20" xml:space="preserve">
        <g id="tint">
            <g>
                <path fill-rule="evenodd" clip-rule="evenodd" d="M9.86,2c0,0-5.88,7.18-5.88,10.17c0.01,3.23,2.8,5.83,5.98,5.83
                    c3.18-0.01,6.04-2.63,6.03-5.86C15.99,9.05,9.86,2,9.86,2z"/>
            </g>
        </g>
        </svg>`;
    const GREEN_SVG = `
        <svg class="green-filter" width="20px" height="20px" viewBox="0 0 20 20" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
            <g id="Artboard" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                <g id="Tree" transform="translate(2.000000, 0.000000)" fill="#000000" fill-rule="nonzero">
                    <path d="M9,15.5416666 L9,20 L7,20 L7,15.5416666 L0,17 L4.5,11.375 L2,12 L5.65517241,6.51724138 L4,7 L8,0 L12,7 L10.3448276,6.51724138 L14,12 L11.5,11.375 L16,17 L9,15.5416666 Z"></path>
                </g>
            </g>
        </svg>`;
    

    // Calculate the number of squares that fit per row/column
    const squaresPerRow = queryParams.get('width') ?? Math.floor(window.innerWidth / squareSize);
    const squaresPerColumn = queryParams.get('height') ?? Math.floor(window.innerHeight / squareSize);
    const totalSquares = squaresPerRow * squaresPerColumn;
    console.log("Number", squaresPerRow, squaresPerColumn);

    // Function to change color of a square
    const changeColor = (square) => {
        let currentColorIndex = colors.indexOf(square.style.backgroundColor);
        let nextColorIndex = (currentColorIndex + 1) % colors.length;
        square.style.backgroundColor = colors[nextColorIndex];

        // Change the icon inside the square based on the new color
        
        switch (colors[nextColorIndex]) {
            case 'red':
                square.innerHTML = RED_SVG;
                break;
            case 'blue':
                square.innerHTML = BLUE_SVG;
                break;
            case 'green':
                square.innerHTML = GREEN_SVG;
                break;
            default:
                square.innerHTML = ''; // No icon or clear the existing icon if default or unknown color
                break;
        }
    };

    // Function to check if all squares are red
    const checkWin = () => {
        let allSquares = gameContainer.querySelectorAll('.square');
        return Array.from(allSquares).every(square => square.style.backgroundColor === 'red');
    };

    // Function to show the win modal
    const showWinModal = () => {
        winMessage.textContent = 'Congratulations! You won!';
        document.getElementById('win-modal').style.display = 'block';
    };

    // Function to close the modal
    const closeModal = () => {
        document.getElementById('win-modal').style.display = 'none';
    };

    // Function to add a column to the grid
    const addColumn = () => {
        window.location.href = '/escape-room-windows-2d/?width=' + (parseInt(squaresPerRow) + 1) + '&height=' + squaresPerColumn;
    };

    // Function to add a row to the grid
    const addRow = () => {
        window.location.href = '/escape-room-windows-2d/?width=' + squaresPerRow + '&height=' + (parseInt(squaresPerColumn) + 1);
    };

    // Function to replay the game
    const replay = () => {
        closeModal();
        gameContainer.innerHTML = '';
        initGameGrid();
        gameWon = false;
    };

    document.getElementById('add-column').addEventListener('click', addColumn);
    document.getElementById('add-row').addEventListener('click', addRow);
    document.getElementById('replay').addEventListener('click', replay);

    const colorMap = {
        'red': 0, // Binary: 00
        'blue': 1, // Binary: 01
        'green': 2 // Binary: 10
    };
    
    const reverseColorMap = {
        0: 'red', 
        1: 'blue', 
        2: 'green'
    };
    
    // Function to encode the grid state to a binary string
    const encodeToBinary = (gridState) => {
        let binaryString = '';
        gridState.forEach(color => {
            const binaryCode = colorMap[color].toString(2).padStart(2, '0');
            binaryString += binaryCode;
        });
        return binaryString;
    };
    
    // Function to encode the grid state to base64
    const encodeGridStateToBase64 = () => {
        const squares = document.querySelectorAll('.square');
        const gridState = Array.from(squares).map(square => square.style.backgroundColor);
        console.log("Grid State", gridState);
        const binaryString = encodeToBinary(gridState);
        return binaryToUrlSafeBase64(binaryString);
    };

    // Function to convert a binary string to a URL-safe base64 string
    const binaryToUrlSafeBase64 = (binaryString) => {
        // Pad the binary string so that its length is a multiple of 8
        binaryString = binaryString.padEnd(Math.ceil(binaryString.length / 8) * 8, '0');
        const byteArrays = [];
        for (let i = 0; i < binaryString.length; i += 8) {
            byteArrays.push(parseInt(binaryString.substring(i, i + 8), 2));
        }
        const uint8Array = new Uint8Array(byteArrays);
        let base64String = btoa(String.fromCharCode.apply(null, uint8Array));
        // Make it URL-safe
        base64String = base64String.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        return base64String;
    };
    
    // Function to decode the base64 encoded grid state
    const decodeBase64GridState = (base64State, rows, cols) => {
        const binaryString = urlSafeBase64ToBinary(base64State);
        const expectedLength = rows * cols * 2; // Each color is represented by 2 bits

        // Trim the binary string to the expected length in case there is padding
        const trimmedBinaryString = binaryString.substring(0, expectedLength);

        if (trimmedBinaryString.length !== expectedLength) {
            throw new Error("Decoded binary string does not match the expected length.")
        }

        const gridState = [];
        for (let i = 0; i < trimmedBinaryString.length; i += 2) {
            const colorIndex = parseInt(trimmedBinaryString.substring(i, i + 2), 2);
            gridState.push(reverseColorMap[colorIndex]);
        }

        return gridState;
    };

    // Function to decode a URL-safe base64 string to a binary string
    const urlSafeBase64ToBinary = (base64String) => {
        // Convert URL-safe base64 to standard base64
        base64String = base64String.replace(/-/g, '+').replace(/_/g, '/');
        // Add any stripped '=' padding back if necessary
        switch (base64String.length % 4) {
            case 2: base64String += '=='; break;
            case 3: base64String += '='; break;
            default: break; // No padding needed
        }
        const decodedString = atob(base64String);
        let binaryString = '';
        for (let i = 0; i < decodedString.length; i++) {
            binaryString += decodedString.charCodeAt(i).toString(2).padStart(8, '0');
        }
        return binaryString;
    };
    
    // Function to apply an encoded base64 state to the grid
    const applyBase64GridState = (base64State, rows, cols) => {
        const decodedState = decodeBase64GridState(base64State, rows, cols);
        const squares = document.querySelectorAll('.square');
        squares.forEach((square, index) => {
            const row = Math.floor(index / cols);
            const col = index % cols;
            square.style.backgroundColor = decodedState[row][col];
        });
    };


    // Function to initialize the game grid
    const initGameGrid = () => {
        // Set the CSS Grid layout columns dynamically
        gameContainer.style.gridTemplateColumns = `repeat(${squaresPerRow}, ${squareSize}px)`;

        // Create squares and append to the game container
        for (let i = 0; i < totalSquares; i++) {
            let square = document.createElement('div');
            square.classList.add('square');
            square.style.width = `${squareSize}px`;
            square.style.height = `${squareSize}px`;
            let randomColor = colors[Math.floor(Math.random() * colors.length)];
            square.style.backgroundColor = randomColor;

            // Set the innerHTML to the appropriate SVG based on the color
            if (randomColor === 'red') {
                square.innerHTML = RED_SVG;
            } else if (randomColor === 'blue') {
                square.innerHTML = BLUE_SVG;
            } else if (randomColor === 'green') {
                square.innerHTML = GREEN_SVG;
            }

            // Append the square with the icon to the game container
            gameContainer.appendChild(square);
        }

        /*
        const colorState = encodeGridStateToBase64();
        console.log("Checking game", decodeBase64GridState(colorState, squaresPerColumn, squaresPerRow));
        if (!isGameWinnable(colorState, squaresPerColumn, squaresPerRow)) {
            console.log("Not Winnable");
            gameContainer.innerHTML = '';
            initGameGrid();
        } else {
            console.log("Winnable")
        }*/
    };

    // Helper function to get the adjacent indices for a given index
    const getAdjacentIndices = (index) => {
        //console.log("get adjacent for ", index)

        // Change color of clicked square and adjacent squares
        let row = Math.floor(index / squaresPerRow);
        let col = index % squaresPerRow;

        const adjInd = [];
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) {
                    // Skip myself
                } else {
                    // Adjacent squares
                    let adjacentRow = row + i;
                    let adjacentCol = col + j;
                    if (adjacentRow >= 0 && adjacentRow < squaresPerColumn && adjacentCol >= 0 && adjacentCol < squaresPerRow) {
                        let adjacentIndex = adjacentRow * squaresPerRow + adjacentCol;
                        adjInd.push(adjacentIndex);
                    }
                }
            }
        }
        return adjInd;
    };

    // Function to check if a game state is winnable
    const isGameWinnable = (base64State, rows, cols) => {
        const gridState = decodeBase64GridState(base64State, rows, cols);
        //console.log("Sub checking game", gridState);
        //console.log("Sub checking game", reverseColorMap, gridState.map(color => colorMap[color]));

        const visitedStates = new Set(); // To track visited states

        // Helper function for recursion
        const exploreState = (currentState, index) => {
            //console.log("BASE CASE ", currentState);

            if(index >= currentState.length) {
                return false;
            }
            // Base case: check if all squares are red
            const isWinning = currentState.every(color => color === colorMap['red']);
            if (isWinning) {
                return true;
            }
            
            // Convert the current state to a string to check if it's been visited
            const stateString = currentState.join('');
            if (visitedStates.has(stateString)) {
                return false; // This state has already been visited
            }
            visitedStates.add(stateString); // Mark this state as visited
            //console.log("VISITED", stateString);

            // Try changing the color of the current square and adjacent squares
            const adjacentIndices = getAdjacentIndices(index);
            //console.log("ADJACENT", adjacentIndices);
            const nextState = [...currentState]; // Clone the current state
            //console.log("P CHANGE", nextState[index],(nextState[index] + 1) % 3);
            nextState[index] = (nextState[index] + 1) % 3; // Change current square

            adjacentIndices.forEach(adjIndex => {
                //console.log("S CHANGE", nextState[index],(nextState[index] + 1) % 3);
                nextState[adjIndex] = (nextState[adjIndex] + 1) % 3; // Change adjacent squares
            });

            //console.log("Okay, trying", nextState);

            // Recursively explore the next state or move to the next index
            return exploreState(nextState, 0) || exploreState(currentState, index + 1);
        };

        return exploreState(gridState.map(color => colorMap[color]), 0);
    };

    // Set up click event for each square
    gameContainer.addEventListener('click', (event) => {
        // Use .closest() to find the nearest ancestor with the 'square' class
        let clickedSquare = event.target.closest('.square');
        if (gameWon || !clickedSquare) return;

        let index = Array.from(clickedSquare.parentNode.children).indexOf(clickedSquare);
        let row = Math.floor(index / squaresPerRow);
        let col = index % squaresPerRow;


        // Change color of clicked square and adjacent squares
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) {
                    // Clicked square
                    changeColor(clickedSquare);
                } else {
                    // Adjacent squares
                    let adjacentRow = row + i;
                    let adjacentCol = col + j;
                    if (adjacentRow >= 0 && adjacentRow < squaresPerColumn && adjacentCol >= 0 && adjacentCol < squaresPerRow) {
                        let adjacentIndex = adjacentRow * squaresPerRow + adjacentCol;
                        let adjacentSquare = gameContainer.children[adjacentIndex];
                        changeColor(adjacentSquare);
                    }
                }
            }
        }


        /*
        if(window.history.pushState) {
            try {
                const colorState = encodeGridStateToBase64();
                window.history.pushState('', 'Title', `/?state=${colorState}&width=${squaresPerRow}`&`height=${squaresPerColumn}`);
                console.log("Color State", colorState);
            } catch (e) {
                console.warn("Error", e);
            }
        }*/

        // Check for win after each click
        if (checkWin()) {
            showWinModal();
            gameWon = true;
        }
    });

    // Add a resize event listener to re-initialize the game when the window is resized
    // This breaks the adjacent squares logic
    /*
    window.addEventListener('resize', () => {
        // Clear the current grid
        gameContainer.innerHTML = '';

        // Re-initialize the game grid
        initGameGrid();

        // You will also want to reset any game state if necessary
        gameWon = false;
        winMessage.textContent = '';
    });
    */

    // Initialize the game grid
    initGameGrid();
});