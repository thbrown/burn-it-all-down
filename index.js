document.addEventListener('DOMContentLoaded', (event) => {
    const gameContainer = document.getElementById('game-container');
    const winMessage = document.getElementById('win-message');
    const colors = ['red', 'green', 'blue'];
    const squareSize = 48; // The size of each square
    const queryParams = new URLSearchParams(window.location.search);
    console.log("Params", queryParams.get('width'), queryParams.get('height'));
    let gameWon = false;

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
        window.location.href = '/?width=' + (squaresPerRow + 1) + '&height=' + squaresPerColumn;
    };

    // Function to add a row to the grid
    const addRow = () => {
        window.location.href = '/?width=' + squaresPerRow + '&height=' + (squaresPerColumn + 1);
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
        'green': 1, // Binary: 01
        'blue': 2 // Binary: 10
    };
    
    const reverseColorMap = ['red', 'green', 'blue'];
    
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
        const binaryString = encodeToBinary(gridState);
        return binaryToUrlSafeBase64(binaryString);
    };
    
    // Function to decode the base64 encoded grid state
    const decodeBase64GridState = (base64State) => {
        const binaryString = urlSafeBase64ToBinary(base64State);
        const gridState = [];
        for (let i = 0; i < binaryString.length; i += 2) {
            const colorIndex = parseInt(binaryString.substring(i, i + 2), 2);
            gridState.push(reverseColorMap[colorIndex]);
        }
        return gridState;
    };
    
    // Function to apply an encoded base64 state to the grid
    const applyBase64GridState = (base64State) => {
        const decodedState = decodeBase64GridState(base64State);
        const squares = document.querySelectorAll('.square');
        squares.forEach((square, index) => {
            square.style.backgroundColor = decodedState[index];
        });
    };

    // Function to convert a binary string to a URL-safe base64 string
    const binaryToUrlSafeBase64 = (binaryString) => {
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
            gameContainer.appendChild(square);
        }
    };

    // Set up click event for each square
    gameContainer.addEventListener('click', (event) => {
        if (gameWon || !event.target.classList.contains('square')) return;

        let clickedSquare = event.target;
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

        if(window.history.pushState) {
            try {
                const colorState = encodeGridStateToBase64();
                window.history.pushState('', 'Title', `/?state=${colorState}&width=${squaresPerRow}`&`height=${squaresPerColumn}`);
                console.log("Color State", colorState);
            } catch (e) {
                console.warn("Error", e);
            }
        }

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