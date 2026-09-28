// variables to reference specific HTML elements
let container = document.querySelector(".container");
let platforms = document.querySelector("#platforms");
let finishSign = document.querySelector("#finishSign");
let allBlocks = document.getElementsByClassName("block");
let coins = document.querySelector("#coins");
let allCoins = document.getElementsByClassName("coin");
let coinCount = document.querySelector("#coinCount");
let player = document.querySelector("#player");

// variables for the ground tiles 
let platformPosX = 0;
let platformSpeed = 3;
let platformWidth;
let BLOCK_SIZE = 64;

// variables for the screen
let SCREEN_WIDTH = 768;
let SCREEN_HEIGHT = 600;

// variables that affect the player
let playerPosX;
let playerPosY;
let playerUpSpeed = 0;
let playerStartOffset = 5;
let playerEndOffset = 8;
let playerWidth = 35;
let playerHeight = 64;
let playerOnGround = false;
let playerActive = true;

//variable for player jump height
let gravity = 4;

// variable for player jump speed
let jumpSpeed = -30;

// array for the number of tiles on the ground
let floorData = [1,1,0,1, 0, 2, 0, 3, 0, 4,4,7,7,3,0,2,3,0,0,1];

// array for the number of coins on each corresponding tile
let coinsData = [1, 1, 0, 2, 0, 2, 0,1,0,1,2,1,1,0,0,1,2];

document.querySelector(".container").focus();

// call the generatePlatform() and generateCoins functions
generatePlatform();
generateCoins();

// function to generate the ground tiles
function createFloorBlock(row, col) {
    let b = document.createElement("div");
    b.className = "block";
    b.style.left = (col * BLOCK_SIZE) + "px";
    b.style.bottom = (row * BLOCK_SIZE) + "px";
    b.setAttribute("data-row", row);
    b.setAttribute("data-col", col);

    // if this block is on the top, then show the tile with the "top" class
    if (row == floorData[col] - 1) {
        b.classList.add("top");

        if (col == floorData.length - playerEndOffset) {
            finishSign.style.left = (col * BLOCK_SIZE) + "px";
            finishSign.style.bottom = ((row + 1) * BLOCK_SIZE) + "px";
        }
    }
    return b;
}

// pre-generate the tiles behind the start point and after the finish sign
function generatePlatform() {
    preGeneratePlatform();
    for (let col = 0; col < floorData.length; col++) {
        for (let row = 0; row < floorData[col]; row++) {
            platforms.appendChild(createFloorBlock(row, col));
        }
    }
}

// function to add the coins to the game
function createCoin(row, col, numFloor = 0) {
    let c = document.createElement("div");
    c.className = "coin";
    c.style.left = (col * BLOCK_SIZE) + (BLOCK_SIZE * 0.2) + "px";
    c.style.bottom = (numFloor * BLOCK_SIZE) + (row * BLOCK_SIZE) + (BLOCK_SIZE * 0.2) + "px";
    return c;
}

// function to generate the coins according to the coinsData array
function generateCoins() {
    preGenerateCoin();
    for (let col = 0; col < coinsData.length; col++) {
        for (let row = 0; row < coinsData[col]; row++) {
            coins.appendChild(createCoin(row, col, floorData[col]));
        }
    }
}

// function to keep the game scrolling continuously 
function movePlatform() {
    platformPosX -= platformSpeed;
    platforms.style.left = platformPosX + "px";
    if (platformPosX < SCREEN_WIDTH - platformWidth) {
        platformPosX = SCREEN_WIDTH - platformWidth;

        // "you win!" message
        alert("You win! Play again?");
        // restart game
        initGame();
    }
}

// function for the player movement
function movePlayer() {

    // if the player is still on the screen
    if (playerPosY < SCREEN_HEIGHT) {
        checkCollision();
        checkCollectCoins();

        // make player falls based on the gravity
        useGravity();

        player.style.left = playerPosX + "px";
        player.style.top = playerPosY + "px";
    } else {
        initGame();
    }
}

// function to initialize the game
function initGame() {
    playerActive = true;
    player.className = "run";
    playerPosX = playerStartOffset * BLOCK_SIZE;
    playerPosY = SCREEN_HEIGHT - (floorData[playerStartOffset] * BLOCK_SIZE) - playerHeight - BLOCK_SIZE;
    player.style.left = playerPosX + "px";
    player.style.top = playerPosY + "px";
    playerUpSpeed = 0;
    platformWidth = floorData.length * BLOCK_SIZE;
    platformPosX = 0;
    platforms.style.left = platformPosX;
    refreshCoins();
}

// function to loop the game continuously 
function gameLoop() {
    if (playerActive) {
        movePlatform();
    }
    movePlayer();
    requestAnimationFrame(gameLoop);
}

// function to check for collisions 
function checkCollision() {
    let game = document.querySelector("#game-area");
    let gameRect = game.getBoundingClientRect();
    let playerRect = player.getBoundingClientRect();
    let playerX = playerRect.x - gameRect.x;
    let playerY = playerRect.y;
    playerWidth = playerRect.width * 35 / 64;
    playerHeight = playerRect.height;

    if (playerActive) {
        for (let i = 0; i < allBlocks.length; i++) {
            let bRect = allBlocks[i].getBoundingClientRect();

            if (overlap(playerX, playerY, playerWidth, playerHeight, bRect.x - gameRect.x, bRect.y, bRect.width, bRect.height)) {
                if ((playerRect.y + playerRect.height >= bRect.y) && (bRect.y - playerRect.y) > (0.7 * bRect.height)) {

                    // hit the the top of the block
                    playerPosY = SCREEN_HEIGHT - ((parseInt(allBlocks[i].getAttribute("data-row")) + 1) * BLOCK_SIZE) - BLOCK_SIZE;

                    playerOnGround = true;
                    player.className = "run";
                } else {

                    // hit the side of the block
                    playerActive = false;
                    playerOnGround = false;
                    player.className = "crash";

                    // make character bounce upon collision with wall
                    playerUpSpeed = -8;
                }
            }
        }
    }
}

// function for checking coin collection
function checkCollectCoins() {
    let game = document.querySelector("#game-area");
    let gameRect = game.getBoundingClientRect();
    let playerRect = player.getBoundingClientRect();
    let playerX = playerRect.x - gameRect.x;
    let playerY = playerRect.y;
    playerWidth = playerRect.width * 35 / 64;
    playerHeight = playerRect.height;

    if (playerActive) {
        for (i = 0; i < allCoins.length; i++) {
            let cRect = allCoins[i].getBoundingClientRect();

            if (overlap(playerX, playerY, playerWidth, playerHeight, cRect.x - gameRect.x, cRect.y, cRect.width, cRect.height)) {
                allCoins[i].classList.add("hidden");
                totalCoin++;
                coinCount.innerHTML = "Coins: " + totalCoin;
            }
        }
    }
}

// event listener for mouse clicks (to jump)
window.addEventListener("click", function() {
    if (playerOnGround && playerActive) {
        playerOnGround = false;
        playerUpSpeed = jumpSpeed;
        player.className = "jump";
    }
});

// event listener for pressing the space bar (to jump)
window.onkeypress = function(event) {
    if (event.code == "Space" && playerOnGround && playerActive) {
        playerOnGround = false;
        playerUpSpeed = jumpSpeed;
        player.className = "jump";
    }
};

// function to pre-generate the coins in the game
function preGenerateCoin() {
    let preCoin = [];

    for (let col = 0; col < playerStartOffset; col++) {
        preCoin.push(0);
    }

    let totalCoinsData = preCoin.concat(coinsData);
    coinsData = totalCoinsData;
}

// function to pre-generate the tiles in the game
function preGeneratePlatform() {
    let preFloor = [];
    let postFloor = [];

    for (let col = 0; col < playerStartOffset; col++) {
        preFloor.push(floorData[0]);
    }

    for (let col = 0; col < playerEndOffset; col++) {
        postFloor.push(floorData[floorData.length - 1]);
    }

    let totalFloorData = preFloor.concat(floorData).concat(postFloor);

    floorData = totalFloorData;
}

// function to apply gravity 
function useGravity() {
    playerUpSpeed += gravity;
    if (playerUpSpeed > 7) {
        playerUpSpeed = 7;
    }
    playerPosY += playerUpSpeed;
}

// refresh the coins when the game restarts
function refreshCoins() {
    totalCoin = 0;
    coinCount.innerHTML = "Coins: " + totalCoin;
    for (i = 0; i < allCoins.length; i++) {
        allCoins[i].classList.remove("hidden");
    }
}

function overlap(x1, y1, w1, h1, x2, y2, w2, h2) {
    return !(((x1 + w1 - 1) < x2) ||
        ((x2 + w2 - 1) < x1) ||
        ((y1 + h1 - 1) < y2) ||
        ((y2 + h2 - 1) < y1));
}

// call the resizeGame() function whenever the browser window size changes
window.onresize = resizeGame;

// call the gameLoop and resizeGame functions as soon as the page loads
window.onload = function() {
    resizeGame();
    gameLoop();
}

// function to resize the game window to keep it responsive
function resizeGame() {
    let gameRatio = container.offsetWidth / container.offsetHeight;
    let windowRatio = window.innerWidth / window.innerHeight;

    container.style.left = `${(window.innerWidth - container.offsetWidth) / 2}px`;
    container.style.top = `${(window.innerHeight - container.offsetHeight) / 2}px`;

    responsiveScale = (gameRatio > windowRatio) ? window.innerWidth / container.offsetWidth : window.innerHeight / container.offsetHeight;

    container.style.transform = `scale(${responsiveScale})`;
}
