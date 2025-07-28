import kaboom from "https://unpkg.com/kaboom@3000.0.0-beta.2/dist/kaboom.mjs";
kaboom();

// Load sprites
const sprites = [
    "XVSO", "XVSOGAME", "O-nut", "o", "Oasis", "OOze", "Orange", "OhreOh",
    "ringofire", "vOid", "x", "xperiment", "xpired", "xplosion", "xpresso",
    "xtreme", "firex", "4x4", "4x4s"
];
sprites.forEach(sprite => loadSprite(sprite, `${sprite}.png`));

// Add title and play button
add([
    sprite("XVSO"),
    pos(0, 0),
    scale(width(512) / 512, height(512) / 512),
    anchor("topleft"),
]);

add([
    rect(330, 112),
    pos(width() / 2.1, height() / 1.35),
    color(0, 255, 0),
    opacity(0),
    area(),
    anchor("center"),
    "playButton",
]);

onClick("playButton", () => go("game"));

// Game scene
scene("game", () => {
    let currentBoard = add([
        sprite("XVSOGAME"),
        pos(0, 0),
        scale(width(512) / 512, height(512) / 512),
        anchor("topleft"),
    ]);

    let grid = Array(3).fill("").map(() => Array(3).fill(""));
    let currentPlayer = "X";
    let turnCounter = 0;
    let winCondition = 3; // Default win condition for 3x3 and 4x4 boards
    let gameOver = false; // Track if the game has ended

    // Define pools of pieces for X and O
    const xPieces = ["x", "xperiment", "xpired", "xplosion", "xpresso", "xtreme", "firex"];
    const oPieces = ["o", "O-nut", "Oasis", "OOze", "Orange", "OhreOh", "ringofire"];

    // Create grid
    function createGrid(size) {
        // Clear existing cells
        get("cell").forEach(cell => destroy(cell));

        const positions = {
            3: [
                [300, 100], [650, 100], [1000, 100],
                [300, 370], [650, 370], [1000, 370],
                [300, 600], [650, 600], [1000, 600],
            ],
            4: [
                [100, 70], [460, 70], [830, 70], [1100, 70],
                [100, 270], [460, 270], [830, 270], [1100, 270],
                [100, 450], [460, 450], [830, 450], [1100, 450],
                [100, 650], [460, 650], [830, 650], [1100, 650],
            ],
            5: [
                [170, 90], [420, 90], [680, 90], [930, 90], [1150, 90],
                [170, 230], [420, 230], [680, 230], [930, 230], [1150, 230],
                [170, 350], [420, 350], [680, 350], [930, 350], [1150, 350],
                [170, 480], [420, 480], [680, 480], [930, 480], [1150, 480],
                [170, 610], [420, 610], [680, 610], [930, 610], [1150, 610],
            ],
        };

        // Validate positions[size]
        if (!positions[size]) {
            console.error(`Invalid grid size: ${size}`);
            return;
        }

        const gridPositions = positions[size];
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const index = y * size + x;

                // Validate gridPositions[index]
                if (!gridPositions[index]) {
                    console.error(`Invalid grid position for index: ${index}`);
                    continue;
                }

                const [posX, posY] = gridPositions[index];

                // Add the cell
                const cell = add([
                    rect(100, 100),
                    pos(posX, posY),
                    color(255, 255, 255),
                    opacity(0.0),
                    area(),
                    "cell",
                    { coord: [x, y], occupied: grid[y]?.[x] !== "" },
                ]);

                // Only add a sprite if the cell is occupied
                if (grid[y]?.[x] && grid[y][x] !== "") {
                    add([
                        sprite(grid[y][x]),
                        pos(cell.pos.x + 50, cell.pos.y + 50),
                        anchor("center"),
                    ]);
                }
            }
        }
    }

    // Randomly select a piece for the current player
    function selectRandomPiece() {
        if (currentPlayer === "X") {
            return xPieces[Math.floor(Math.random() * xPieces.length)];
        } else {
            return oPieces[Math.floor(Math.random() * oPieces.length)];
        }
    }

    // Handle cell clicks
    onClick("cell", (cell) => {
        if (gameOver) return; // Stop if the game is over

        const { coord, occupied } = cell;
        const [cx, cy] = coord;

        if (occupied) return;

        const selectedPiece = selectRandomPiece(); // Randomly select a piece for the current player
        cell.occupied = true;
        grid[cy][cx] = currentPlayer; // Update the grid with the current player (e.g., "X" or "O")

        add([
            sprite(selectedPiece),
            pos(cell.pos.x + 50, cell.pos.y + 50),
            anchor("center"),
        ]);

        turnCounter++;

        const winner = checkWinner();
        if (winner) {
            gameOver = true; // Set the game over flag
            console.log(`${winner} wins!`);
            showWinMessage(winner); // Display the win message
            return;
        }

        currentPlayer = currentPlayer === "X" ? "O" : "X";
    });

    function checkWinner() {
        const size = grid.length;

        console.log("Current grid state:", grid);

        // Check rows
        for (let y = 0; y < size; y++) {
            for (let x = 0; x <= size - 3; x++) {
                if (grid[y].slice(x, x + 3).every(cell => cell === "X")) {
                    console.log("Winner found in row:", y);
                    return "X";
                }
                if (grid[y].slice(x, x + 3).every(cell => cell === "O")) {
                    console.log("Winner found in row:", y);
                    return "O";
                }
            }
        }

        // Check columns
        for (let x = 0; x < size; x++) {
            for (let y = 0; y <= size - 3; y++) {
                if (grid.slice(y, y + 3).every(row => row[x] === "X")) {
                    console.log("Winner found in column:", x);
                    return "X";
                }
                if (grid.slice(y, y + 3).every(row => row[x] === "O")) {
                    console.log("Winner found in column:", x);
                    return "O";
                }
            }
        }

        // Check diagonals (top-left to bottom-right)
        for (let y = 0; y <= size - 3; y++) {
            for (let x = 0; x <= size - 3; x++) {
                if (Array.from({ length: 3 }, (_, i) => grid[y + i][x + i]).every(cell => cell === "X")) {
                    console.log("Winner found in diagonal (top-left to bottom-right):", y, x);
                    return "X";
                }
                if (Array.from({ length: 3 }, (_, i) => grid[y + i][x + i]).every(cell => cell === "O")) {
                    console.log("Winner found in diagonal (top-left to bottom-right):", y, x);
                    return "O";
                }
            }
        }

        // Check diagonals (top-right to bottom-left)
        for (let y = 0; y <= size - 3; y++) {
            for (let x = 2; x < size; x++) {
                if (Array.from({ length: 3 }, (_, i) => grid[y + i][x - i]).every(cell => cell === "X")) {
                    console.log("Winner found in diagonal (top-right to bottom-left):", y, x);
                    return "X";
                }
                if (Array.from({ length: 3 }, (_, i) => grid[y + i][x - i]).every(cell => cell === "O")) {
                    console.log("Winner found in diagonal (top-right to bottom-left):", y, x);
                    return "O";
                }
            }
        }

        return null; // No winner yet
    }

    function showWinMessage(winner) {
        add([
            text(`PLAYER ${winner} WINS!`, { size: 48, color: rgb(255, 255, 255) }),
            pos(width() / 2, height() / 2),
            anchor("center"),
            z(10), // Ensure the message is on top
        ]);

        gameOver = true; // Prevent further moves
    }

    function trackLongestStreak() {
        const size = grid.length;
        let longestX = 0;
        let longestO = 0;

        // Helper function to calculate the longest streak in an array
        function calculateStreak(array, player) {
            let maxStreak = 0;
            let currentStreak = 0;

            for (const cell of array) {
                if (cell === player) {
                    currentStreak++;
                    maxStreak = Math.max(maxStreak, currentStreak);
                } else {
                    currentStreak = 0;
                }
            }

            return maxStreak;
        }

        // Check rows
        for (let y = 0; y < size; y++) {
            longestX = Math.max(longestX, calculateStreak(grid[y], "X"));
            longestO = Math.max(longestO, calculateStreak(grid[y], "O"));
        }

        // Check columns
        for (let x = 0; x < size; x++) {
            const column = grid.map(row => row[x]);
            longestX = Math.max(longestX, calculateStreak(column, "X"));
            longestO = Math.max(longestO, calculateStreak(column, "O"));
        }

        // Check diagonals (top-left to bottom-right)
        for (let y = 0; y < size; y++) {
            const diagonal1 = [];
            const diagonal2 = [];
            for (let i = 0; i < size - y; i++) {
                diagonal1.push(grid[y + i]?.[i]);
                diagonal2.push(grid[i]?.[y + i]);
            }
            longestX = Math.max(longestX, calculateStreak(diagonal1, "X"), calculateStreak(diagonal2, "X"));
            longestO = Math.max(longestO, calculateStreak(diagonal1, "O"), calculateStreak(diagonal2, "O"));
        }

        // Check diagonals (top-right to bottom-left)
        for (let y = 0; y < size; y++) {
            const diagonal1 = [];
            const diagonal2 = [];
            for (let i = 0; i < size - y; i++) {
                diagonal1.push(grid[y + i]?.[size - 1 - i]);
                diagonal2.push(grid[i]?.[size - 1 - (y + i)]);
            }
            longestX = Math.max(longestX, calculateStreak(diagonal1, "X"), calculateStreak(diagonal2, "X"));
            longestO = Math.max(longestO, calculateStreak(diagonal1, "O"), calculateStreak(diagonal2, "O"));
        }

        return { longestX, longestO };
    }

    createGrid(3);
});
