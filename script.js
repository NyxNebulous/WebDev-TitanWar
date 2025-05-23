document.addEventListener("DOMContentLoaded", () => {
    let layerIndex = [0, 1, 2];
    let hexCr = [];
    let neighbours = [];
    let playerTitans = { red: 0, blue: 0 };
    let curPlayer = 1;
    let unlock1 = 0, unlock0 = false;
    let gameTime = 300;
    let gameTimer;
    let turnTimer;
    let timeLeft = 21;
    let paused = false;
    let validOptions = [];
    let toCircle;
    let highlightCase = false;
    let unlocked1st = false;
    const centreCount = {
        redCentre: 0,
        blueCentre: 0,
    };
    let moveHistory = [];
    let redoList = [];

    const svg = document.querySelector("svg");
    const cx = 325;
    const cy = 325;

    layerIndex.forEach((layer) => {
        const r = (layer + 1) * 100;
        let layerArr = [];
        for (let i = 0; i < 6; i++) {
            let angle = Math.PI / 3 * i;
            let x = cx + r * Math.cos(angle);
            let y = cy + r * Math.sin(angle);
            layerArr.push({ x: x, y: y, layer: layer, index: i });
        }
        hexCr.push(layerArr);
    });


    layerIndex.forEach(i => {
        addHex(i);
        addJoint(i);
        addWeight(i);
        addCirle(i);
    });

    //Storing neighbours 
    for (let i = 0; i < hexCr.length; i++) {
        let layers = [];
        for (let j = 0; j < 6; j++) {
            const leftIndex = (j + 5) % 6;
            const rightIndex = (j + 1) % 6;
            layers.push({
                left: hexCr[i][leftIndex],
                right: hexCr[i][rightIndex],
                joint: getJointNeighbor(i, j)
            });
        }
        neighbours.push(layers);
    }


    svg.addEventListener("click", (event) => {
        const circle = event.target.closest(".position");
        if (!circle || paused) return;
        if (highlightCase) {
            moveHighlighted(event, circle);
            return;
        }
        const isFilled = circle.getAttribute("fill") === "#000000" ? 0 :
            circle.getAttribute("fill") === "red" ? 1 : 2;
        gameStart(circle, isFilled);
        updateStatus(false);
    });

    function gameStart(circle, isFilled) {
        const layerId = Number(circle.getAttribute("layer-id"));
        const curPlColor = curPlayer === 1 ? "red" : "blue";
        startGameTimer();
        if (playerTitans[curPlColor] < 4 && isFilled === 0 && !unlocked1st) {
            if (layerId === 2 || (layerId === 1 && unlock1 >= 6)) {
                placeTitan(circle, curPlColor);
                if (layerId === 2) unlock1++;
                if (unlock1 === 6) console.log("1st layer unlocked");
                if (playerTitans["red"] + playerTitans["blue"] == 8) unlocked1st = true;
                startTurnTimer();
                return;
            }
        }
        else if (layerId === 0 && !unlock0) {
            centreCount["redCentre"] = 0;
            centreCount["blueCentre"] = 0;

            const redTitans = document.querySelectorAll(".red");
            const blueTitans = document.querySelectorAll(".blue");

            redTitans.forEach(c => {
                const layer = Number(c.getAttribute("layer-id"));
                if (layer === 1) centreCount["redCentre"]++;
            });

            blueTitans.forEach(c => {
                const layer = Number(c.getAttribute("layer-id"));
                if (layer === 1) centreCount["blueCentre"]++;
            });

            if (centreCount["redCentre"] + centreCount["blueCentre"] >= 6) {
                unlock0 = true;
                console.log("Central layer unlocked!");
            } else {
                return;
            }
        }
        gamePlay(circle, isFilled);
    }

    function placeTitan(circle, color) {
        redoList = [];
        const from = {
            layer: circle.getAttribute("layer-id"),
            index: circle.getAttribute("index-id"),
        };
        circle.setAttribute("fill", color);
        circle.classList.add(color);
        moveHistory.push({ color: `${color}`, from });
        playerTitans[color]++;
        updateStatus(true);
        curPlayer = 3 - curPlayer;
    }

    function gamePlay(targetCircle, isFilled) {
        if (isFilled !== 0) return;
        const curPlColor = curPlayer === 1 ? "red" : "blue";
        const indexId = Number(targetCircle.getAttribute("index-id"));
        const layerId = Number(targetCircle.getAttribute("layer-id"));
        const adjacent = neighbours[layerId][indexId];

        validOptions = [];

        for (const dir of ['joint', 'right', 'left']) {
            const adj = adjacent[dir];
            if (adj) {
                const neighbor = document.getElementById(`${adj.layer}${adj.index}`);
                if (neighbor?.getAttribute("fill") === curPlColor && unlock1 >= 6) {
                    validOptions.push(neighbor);
                }
            }
        }
        if (validOptions.length == 1)
            moveTitan(validOptions[0], targetCircle, curPlColor);
        else if (validOptions.length > 1) {
            validOptions.forEach((neigh) => {
                neigh.classList.add("highlight-option");
                toCircle = targetCircle;
                highlightCase = true;
                return;
            });
        }
        titanEliminate(targetCircle);
    }

    function addHex(layer) {
        let points = hexCr[layer].map(p => `${p.x},${p.y}`).join(" ");
        const hex = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
        hex.setAttribute("points", points);
        hex.setAttribute("stroke", "white");
        hex.setAttribute("stroke-width", 2);
        hex.setAttribute("fill", "none");
        svg.appendChild(hex);
    }

    function addCirle(layer) {
        hexCr[layer].forEach(coord => {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", coord.x);
            circle.setAttribute("cy", coord.y);
            circle.setAttribute("r", 13);
            circle.setAttribute("class", "position");
            circle.setAttribute("stroke", "rgb(62, 58, 58)");
            circle.setAttribute("stroke-width", 4);
            circle.setAttribute("fill", "#000000");
            circle.setAttribute("layer-id", coord.layer);
            circle.setAttribute("index-id", coord.index);
            circle.setAttribute("id", `${coord.layer}${coord.index}`);
            svg.appendChild(circle);
        });
    }

    function addJoint(layer) {
        if (layer === hexCr.length - 1) return;
        for (let i = 0; i < 3; i++) {
            let pt1 = layer % 2 === 1 ? hexCr[layer][2 * i] : hexCr[layer][2 * i + 1];
            let pt2 = layer % 2 === 1 ? hexCr[layer + 1][2 * i] : hexCr[layer + 1][2 * i + 1];

            const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
            line.setAttribute("d", `M ${pt1.x} ${pt1.y} L ${pt2.x} ${pt2.y}`);
            line.setAttribute("stroke", "skyblue");
            line.setAttribute("stroke-width", 3);
            svg.appendChild(line);
            const midx = (Number(`${pt1.x}`) + Number(`${pt2.x}`)) / 2;
            const midy = (Number(`${pt2.y}`) + Number(`${pt1.y}`)) / 2 - 20;
            const weight = document.createElementNS("http://www.w3.org/2000/svg", "text");
            weight.setAttribute("x", midx);
            weight.setAttribute("y", midy);
            weight.setAttribute("text-anchor", "middle");
            weight.setAttribute("font-size", 16);
            weight.setAttribute("alignment-baseline", "middle");
            weight.textContent = 1;
            svg.appendChild(weight);
        }
    }

    function addWeight(layer) {
        for (let i = 0; i < 6; i++) {
            const r = (layer + 1) * 100;
            const angle = Math.PI / 3;
            const x1 = cx + (r - 23) * Math.cos(i * angle);
            const y1 = cy + (r - 23) * Math.sin(i * angle);
            const x2 = cx + (r - 23) * Math.cos((i + 1) * angle);
            const y2 = cy + (r - 23) * Math.sin((i + 1) * angle);
            const midx = (x1 + x2) / 2;
            const midy = (y1 + y2) / 2;
            const weight = document.createElementNS("http://www.w3.org/2000/svg", "text");
            weight.setAttribute("x", midx);
            weight.setAttribute("y", midy);
            weight.setAttribute("text-anchor", "middle");
            weight.setAttribute("font-size", 16);
            const nextIndex = (i + 1) % 6;
            weight.setAttribute("id", `${layer}${Math.min(i, nextIndex)}${Math.max(i, nextIndex)}`);

            weight.setAttribute("alignment-baseline", "middle");

            const [min, max] = layer === 2 ? [1, 3] : layer === 1 ? [4, 6] : [7, 9];
            weight.textContent = Math.floor(Math.random() * (max - min + 1)) + min;
            svg.appendChild(weight);
        }
    }

    function getJointNeighbor(layer, index) {
        if (layer === 0) {
            return index % 2 === 1 ? hexCr[layer + 1][index] : null;
        } else if (layer === 2) {
            return index % 2 === 0 ? hexCr[layer - 1][index] : null;
        } else {
            return index % 2 === 0 ? hexCr[layer + 1][index] : hexCr[layer - 1][index];
        }
    }

    function updateStatus(didMove = false) {
        document.getElementById('current-player').textContent = curPlayer === 1 ? "Red" : "Blue";
        document.getElementById('red-titans').textContent = calScore(1);
        document.getElementById('blue-titans').textContent = calScore(2);
        console.log(calScore(1), calScore(2));
        if (didMove) {
            const sound = document.getElementById("move-sound");
            sound.currentTime = 0;
            sound.play();
        }
        const turn = document.getElementById("game-status");
        const timer = document.getElementById("timer");
        if (curPlayer == 1) {
            turn.style.backgroundColor = "rgba(251, 68, 68, 0.76)";
            timer.style.backgroundColor = "rgba(251, 68, 68, 0.76)";
        } else {
            turn.style.backgroundColor = "rgba(52, 45, 245, 0.65)";
            timer.style.backgroundColor = "rgba(52, 45, 245, 0.65)";
        }
        titanEliminate();
    }

    function moveTitan(fromCircle, toCircle, color) {
        redoList = [];
        const from = {
            layer: fromCircle.getAttribute("layer-id"),
            index: fromCircle.getAttribute("index-id"),
        };
        const to = {
            layer: toCircle.getAttribute("layer-id"),
            index: toCircle.getAttribute("index-id"),
        };

        fromCircle.setAttribute("fill", "#000000");
        fromCircle.classList.remove(`${color}`);
        toCircle.setAttribute("fill", color);
        toCircle.classList.add(`${color}`);
        curPlayer = 3 - curPlayer;

        moveHistory.push({ color: `${color}`, from, to });
        updateStatus(true);
        startTurnTimer();
        gameEnd();
    }

    function moveHighlighted(event, circle) {
        const curPlColor = curPlayer === 1 ? "red" : "blue";
        if (!event.target.closest(".highlight-option")) {
            validOptions.forEach((neigh) => {
                neigh.classList.remove("highlight-option");
            });
            highlightCase = false;
            return;
        }
        else {
            validOptions.forEach((neigh) => {
                neigh.classList.remove("highlight-option");
            });
            if (toCircle.classList.contains(curPlColor)) {
                console.log("You can't move onto your own Titan!");
                return;
            }

            moveTitan(circle, toCircle, curPlColor);
            highlightCase = false;
            return;
        }
    }

    function startTurnTimer(initialTime = 20) {
        const curPlColor = curPlayer === 1 ? "red" : "blue";
        clearInterval(turnTimer);
        timeLeft = initialTime;
        turnTimer = setInterval(() => {
            timeLeft--;
            document.getElementById("turn-timer").textContent = timeLeft.toString().padStart(2, 0);
            if (timeLeft <= 0) {
                clearInterval(turnTimer);
                showMessage(`Skipping turn...`);
                curPlayer = 3 - curPlayer;
                updateStatus();
                startTurnTimer();
            }
        }, 1000);
    }

    function startGameTimer() {
        clearInterval(gameTimer);
        gameTimer = setInterval(() => {
            if (gameTime <= 0) {
                clearInterval(gameTimer);
                clearInterval(turnTimer);
                showMessage("Game Over!");
            }
            gameTime--;
            let secLeft = (gameTime % 60).toString().padStart(2, '0');
            let minLeft = Math.floor(gameTime / 60).toString().padStart(2, '0');
            document.getElementById("gametime").textContent = `${minLeft}:${secLeft}`;
        }, 1000);
    }

    function calScore(Player) {
        let score = 0;
        const color = Player === 1 ? "red" : "blue";
        const circles = document.querySelectorAll(`.${color}`);

        circles.forEach(circle => {
            const layer = Number(circle.getAttribute("layer-id"));
            let index = Number(circle.getAttribute("index-id"));
            const neigh = neighbours[layer][index];

            for (const dir of ['right', 'left']) {
                const curNeigh = document.getElementById(`${neigh[dir].layer}${neigh[dir].index}`);
                if (!curNeigh) continue;

                const i = Number(curNeigh.getAttribute("index-id"));
                const hue = curNeigh.getAttribute("fill");

                if (hue === color) {
                    const [minIdx, maxIdx] = index < i ? [index, i] : [i, index];
                    const weightId = `${layer}${minIdx}${maxIdx}`;
                    const point = document.getElementById(weightId);
                    if (point) {
                        let points = Number(point.textContent);
                        score += points / 2;
                    } else {
                        console.warn(`Weight element not found for ID: ${weightId}`);
                    }
                }
            }

            if (neigh['joint']) {
                const curNeigh = document.getElementById(`${neigh['joint'].layer}${neigh['joint'].index}`);
                let point = 0;
                if (curNeigh && curNeigh.getAttribute("fill") === color) {
                    point++;
                }
                score += point / 2;
            }
        });
        return score;
    }

    function gameEnd() {
        const redTitans = document.querySelectorAll(".red");
        const blueTitans = document.querySelectorAll(".blue");

        let redCenter = 0;
        let blueCenter = 0;

        redTitans.forEach(c => {
            const layer = Number(c.getAttribute("layer-id"));
            if (layer === 0) redCenter++;
        });

        blueTitans.forEach(c => {
            const layer = Number(c.getAttribute("layer-id"));
            if (layer === 0) blueCenter++;
        });


        if (redCenter + blueCenter === 6) {
            const redScore = calScore(1);
            const blueScore = calScore(2);
            const winPlayer = redScore > blueScore ? 1 : 2;
            const color = winPlayer === 1 ? "red" : "blue";

            clearInterval(gameTimer);
            clearInterval(turnTimer);
            showMessage("Center is filled!");
            showMessage(`${color.toUpperCase()} is the WINNER!!!`);
            const sound = new Audio("Assets/victory-82997.mp3")
            sound.play();
        }
        else if (gameTime <= 0) {
            const redScore = calScore(1);
            const blueScore = calScore(2);
            const winPlayer = redScore > blueScore ? 1 : 2;
            const color = winPlayer === 1 ? "red" : "blue";

            clearInterval(gameTimer);
            clearInterval(turnTimer);
            showMessage("Time's Up!!");
            showMessage(`${color.toUpperCase()} is the WINNER!!!`);
            const sound = new Audio("Assets/victory-82997.mp3")
            sound.play();
        }

        if (unlock1 >= 6) {
            if (playerTitans["red"] < 2) {
                showMessage(`BLUE is the WINNER!!!`);
                const sound = new Audio("Assets/victory-82997.mp3")
                sound.play();

                clearInterval(gameTimer);
                clearInterval(turnTimer);
            }
            else if (playerTitans["blue"] < 2) {
                showMessage(`RED is the WINNER!!!`);
                const sound = new Audio("Assets/victory-82997.mp3")
                sound.play();

                clearInterval(gameTimer);
                clearInterval(turnTimer);
            }
        }
    }

    function titanEliminate() {
        const oppPlColor = curPlayer === 2 ? "red" : "blue";
        const curPlColor = curPlayer === 1 ? "red" : "blue";
        const circles = document.querySelectorAll(`.position`);

        circles.forEach((element) => {
            const indexId = Number(element.getAttribute("index-id"));
            const layerId = Number(element.getAttribute("layer-id"));
            const adjacent = neighbours[layerId][indexId];

            if (adjacent['joint'] && element.getAttribute("fill") === curPlColor) {
                const adj1 = document.getElementById(`${adjacent['joint'].layer}${adjacent['joint'].index}`);
                const adj2 = document.getElementById(`${adjacent['right'].layer}${adjacent['right'].index}`);
                const adj3 = document.getElementById(`${adjacent['left'].layer}${adjacent['left'].index}`);

                if (
                    adj1.getAttribute("fill") === oppPlColor &&
                    adj2.getAttribute("fill") === oppPlColor &&
                    adj3.getAttribute("fill") === oppPlColor
                ) {
                    moveHistory.push({
                        color: curPlColor,
                        from: {
                            layer: element.getAttribute("layer-id"),
                            index: element.getAttribute("index-id"),
                        },
                        eliminated: true
                    });

                    element.setAttribute("fill", "#000000");
                    element.classList.remove("red", "blue");
                    playerTitans[curPlColor]--;

                    const sound = new Audio("Assets/destroyed.mp3");
                    sound.play();

                    if (layerId === 1) {
                        centreCount[`${curPlColor}Centre`]--;
                    }

                    showMessage(`${curPlColor.toUpperCase()} Titan eliminated!`);
                }
            }
        });
        gameEnd();
    }


    function showMessage(text, duration = 2000) {
        const box = document.getElementById('message-box');
        box.innerText = text;
        box.style.display = 'block';

        setTimeout(() => {
            box.style.display = 'none';
        }, duration);
    }

    // RESET button 
    document.getElementById("reset-btn").addEventListener("click", () => {
        console.log("Reset button clicked");
        const sound = new Audio("Assets/click-21156.mp3");
        sound.play();

        document.querySelectorAll(".position").forEach(circle => {
            circle.setAttribute("fill", "#000000");
            circle.classList.remove("red", "blue", "highlight-option");
        });

        curPlayer = 1;
        playerTitans = { red: 0, blue: 0 };
        unlock0 = false;
        unlock1 = 0;
        unlocked1st = false;
        timeLeft = 20;
        gameTime = 300;
        paused = false;
        highlightCase = false;
        validOptions = [];
        centreCount.redCentre = 0;
        centreCount.blueCentre = 0;

        clearInterval(gameTimer);
        clearInterval(turnTimer);
        moveHistory = [];
        redoList = [];
        document.getElementById("current-player").textContent = "Red";
        document.getElementById("game-status").style.backgroundColor = "rgba(251, 68, 68, 0.76)";
        document.getElementById("timer").style.backgroundColor = "rgba(251, 68, 68, 0.76)";
        document.getElementById("red-titans").textContent = "0";
        document.getElementById("blue-titans").textContent = "0";
        document.getElementById("turn-timer").textContent = "20";
        document.getElementById("gametime").textContent = "05:00";

        startGameTimer();
    });


    // PAUSE or PLAY button
    const toggleBtn = document.getElementById("toggle-btn");
    const toggleIcon = document.getElementById("toggle-icon");

    toggleBtn.addEventListener("click", () => {
        const sound = new Audio("Assets/pause-piano-sound-40579.mp3");
        sound.play();

        paused = !paused;

        if (paused) {
            showMessage("Paused!");
            clearInterval(gameTimer);
            clearInterval(turnTimer);
            toggleIcon.src = "Assets/noun-play-1334661.png";
        } else {
            showMessage("Resumed!");
            startGameTimer();
            startTurnTimer(timeLeft);
            toggleIcon.src = "Assets/noun-pause-1507476.png";
        }
    });


    // History display
    const historyOfMoves = document.getElementById("list-btn");
    const overlay = document.getElementById("overlay-container");
    const overlayClose = document.getElementById("overlay-close");

    historyOfMoves.addEventListener("click", () => {
        const sound = new Audio("Assets/click-21156.mp3");
        sound.play();

        overlay.style.display = "block";
        const list = document.getElementById("moveList");
        list.innerHTML = "";
        moveHistory.forEach((element) => {
            const newList = document.createElement("li");
            if (element.to)
                newList.textContent = `${element.color.toUpperCase()}: (${element.from.layer},${element.from.index}) --> (${element.to.layer},${element.to.index})`;
            else if (element.eliminated)
                newList.textContent = `${element.color.toUpperCase()}: (${element.from.layer},${element.from.index}) --> Eliminated`;
            else
                newList.textContent = `${element.color.toUpperCase()}: (${element.from.layer},${element.from.index})`;
            list.appendChild(newList);
            newList.style.color = "white";
        });
    });

    overlayClose.addEventListener("click", () => {
        const sound = new Audio("Assets/remove-92075.mp3");
        sound.play();
        overlay.style.display = "none";
    });

    // Undo & Redo buttons
    document.getElementById("undo-btn").addEventListener("click", undoMove);
    document.getElementById("redo-btn").addEventListener("click", redoMove);

    function undoMove() {
        if (moveHistory.length === 0) return;

        const sound = new Audio("Assets/click-21156.mp3");
        sound.play();

        const lastMove = moveHistory.pop();
        redoList.push(lastMove);
        if (lastMove.eliminated) {
            const elCircle = document.getElementById(`${lastMove.from.layer}${lastMove.from.index}`);
            elCircle.setAttribute("fill", lastMove.color);
            elCircle.classList.add(lastMove.color);
            playerTitans[lastMove.color]++;
            curPlayer = 3 - curPlayer;
            updateStatus();
            return;
        }
        if (lastMove.to) {
            const fromCircle = document.getElementById(`${lastMove.from.layer}${lastMove.from.index}`);
            const toCircle = document.getElementById(`${lastMove.to.layer}${lastMove.to.index}`);

            toCircle.setAttribute("fill", "#000000");
            toCircle.classList.remove(lastMove.color);

            fromCircle.setAttribute("fill", lastMove.color);
            fromCircle.classList.add(lastMove.color);
        }
        else {
            const circle = document.getElementById(`${lastMove.from.layer}${lastMove.from.index}`);
            circle.setAttribute("fill", "#000000");
            circle.classList.remove(lastMove.color);
            playerTitans[lastMove.color]--;
        }

        curPlayer = 3 - curPlayer;
        updateStatus();
    }

    function redoMove() {
        if (redoList.length === 0) return;

        const sound = new Audio("Assets/click-21156.mp3");
        sound.play();

        const move = redoList.pop();
        moveHistory.push(move);

        if (move.eliminated) {
            const elCircle = document.getElementById(`${move.from.layer}${move.from.index}`);
            elCircle.setAttribute("fill", "#000000");
            elCircle.classList.remove("red", "blue");
            playerTitans[move.color]--;
            curPlayer = 3 - curPlayer;
            updateStatus();
            return;
        }
        if (move.to) {
            const fromCircle = document.getElementById(`${move.from.layer}${move.from.index}`);
            const toCircle = document.getElementById(`${move.to.layer}${move.to.index}`);

            fromCircle.setAttribute("fill", "#000000");
            fromCircle.classList.remove(move.color);

            toCircle.setAttribute("fill", move.color);
            toCircle.classList.add(move.color);
        } else {
            const circle = document.getElementById(`${move.from.layer}${move.from.index}`);
            circle.setAttribute("fill", move.color);
            circle.classList.add(move.color);
            playerTitans[move.color]++;
        }

        curPlayer = 3 - curPlayer;
        updateStatus();
    }

});
