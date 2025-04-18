const svg = document.querySelector("svg");
let layerIndex = [0, 1, 2];
const cx = 325;
const cy = 325;
let hexCr = [];
let neighbours = [];
let playerTitans = { red: 0, blue: 0 };
let totalTitansPlaced = 0
let curPlayer = 1;
let unlock1 = 0, unlock2 = 0;

layerIndex.forEach((layerIndex) => {
    const r = (layerIndex + 1) * 100;
    let layer = [];
    for (let i = 0; i < 6; i++) {
        let angle = Math.PI / 3 * i;
        let x = cx + r * Math.cos(angle);
        let y = cy + r * Math.sin(angle);
        layer.push({ x: x, y: y, layer: layerIndex, index: i });
    }
    hexCr.push(layer);
});
layerIndex.forEach(i => {
    addHex(i);
    addJoint(i);
    addWeight(i);
    addCirle(i);
});


svg.addEventListener("click", (event) => {
    const circle = event.target.closest(".position");
    if (!circle) return;
    const isFilled = circle.getAttribute("fill") === "#000000" ? 0 : circle.getAttribute("fill") === "red" ? 1 : 2;
    gameStart(circle, isFilled);
});


function gameStart(circle, isFilled) {
    const layerId = Number(circle.getAttribute("layer-id"));
    console.log(circle.getAttribute("data-id"));
    const curPlColor = (curPlayer == 1) ? "red" : "blue";

    if (playerTitans[curPlColor] < 4 && isFilled === 0) {
        if (layerId === 2 || (layerId === 1 && unlock1 >= 6) || (layerId === 0 && unlock2 >= 6)) {
            circle.setAttribute("fill", curPlColor);
            playerTitans[curPlColor]++;
            totalTitansPlaced++;
            if (layerId === 2) unlock1++;
            if (layerId === 1) unlock2++;
            curPlayer = 3 - curPlayer;
            return;
        }
    }
    gamePlay(circle);
}


function gamePlay(targetCircle) {
    if (isFilled != 0) return;
    const curPlColor = (curPlayer == 1) ? "red" : "blue";
    const indexId = circle.getAttribute("index-id");
    const layerId = circle.getAttribute("layer-id");
    const adjacent = neighbours[Number(layerId)][Number(indexId)];

    const directions = ['joint','right','left']; 
    for (const dir of directions) {
        if (adjacent[dir]) {
            const neighbor = document.querySelector(
                `#${adjacent[dir].layer}${adjacent[dir].index}`
            );
            if (neighbor && neighbor.getAttribute("fill") === curPlColor) {
                targetCircle.setAttribute("fill", curPlColor);
                neighbor.setAttribute("fill",urPlColor);
                curPlayer = 3 - curPlayer; 
                return true;
            }
        }
    }
    return false;
}





function addHex(layerIndex) {
    let pointsArray = hexCr[layerIndex];
    pointsArray = pointsArray.map(point => `${point.x},${point.y}`).join(" ");
    const hex = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    hex.setAttribute("points", pointsArray);
    hex.setAttribute("stroke", "#9B1313");
    hex.setAttribute("stroke-width", 2);
    hex.setAttribute("fill", "none");
    svg.appendChild(hex);
}
function addCirle(layerIndex) {
    let pts = hexCr[layerIndex];
    pts.forEach(coordinate => {
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", `${coordinate.x}`);
        circle.setAttribute("cy", `${coordinate.y}`);
        circle.setAttribute("r", 13);
        circle.setAttribute("class", "position");
        circle.setAttribute("stroke", "#9B1313");
        circle.setAttribute("stroke-width", 2);
        circle.setAttribute("fill", "#000000");
        circle.setAttribute("layer-id", `${coordinate.layer}`);
        circle.setAttribute("index-id", `${coordinate.index}`);
        circle.setAttribute("id", `${coordinate.layer}${coordinate.index}`);
        svg.appendChild(circle);
    });
}
function addJoint(layerIndex) {
    if (layerIndex === hexCr.length - 1) return;
    else {
        for (let i = 0; i < 3; i++) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
            let pt1, pt2;
            if (layerIndex % 2 == 1) {
                pt1 = hexCr[layerIndex][2 * i];
                pt2 = hexCr[layerIndex + 1][2 * i];
            }
            else {
                pt1 = hexCr[layerIndex][2 * i + 1];
                pt2 = hexCr[layerIndex + 1][2 * i + 1];
            }
            line.setAttribute("d", `M ${pt1.x} ${pt1.y} L ${pt2.x} ${pt2.y}`);
            line.setAttribute("stroke", "#9B1313");
            line.setAttribute("stroke-width", 2);
            svg.appendChild(line);
            let midx = (pt1.x + pt2.x) / 2;
            let midy = (pt1.y + pt2.y) / 2 - 20;
            const weight = document.createElementNS("http://www.w3.org/2000/svg", "text");
            weight.setAttribute("x", midx);
            weight.setAttribute("y", midy);
            weight.setAttribute("text-anchor", "middle");
            weight.setAttribute("font-size", 20);
            weight.setAttribute("alignment-baseline", "middle");
            weight.textContent = 1;
            svg.appendChild(weight);
        }
    }
}
function addWeight(layerIndex) {
    for (let i = 0; i < 6; i++) {
        const r = (layerIndex + 1) * 100;
        let angle = Math.PI / 3;
        let x1 = cx + (r - 20) * Math.cos(i * angle);
        let y1 = cy + (r - 20) * Math.sin(i * angle);
        let x2 = cx + (r - 20) * Math.cos((i + 1) * angle);
        let y2 = cy + (r - 20) * Math.sin((i + 1) * angle);
        let midx = (x1 + x2) / 2;
        let midy = (y1 + y2) / 2;
        const weight = document.createElementNS("http://www.w3.org/2000/svg", "text");
        weight.setAttribute("x", midx);
        weight.setAttribute("y", midy);
        weight.setAttribute("text-anchor", "middle");
        weight.setAttribute("font-size", 20);
        weight.setAttribute("text-type", "bold");
        weight.setAttribute("alignment-baseline", "middle");
        const [min, max] = (layerIndex == 2) ? [1, 3] : (layerIndex == 1) ? [4, 6] : [7, 9];
        weight.textContent = Math.floor(Math.random() * (max - min + 1)) + min;
        svg.appendChild(weight);
    }
}
// Storing the neighbours
for (let i = 0; i < hexCr.length; i++) {
    let layers = [];
    for (let j = 0; j < hexCr[0].length; j++) {
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

function getJointNeighbor(layer, index) {
    if (layer === 0) {
        return index % 2 === 1 ? hexCr[layer + 1][index] : null;
    } else if (layer === 2) {
        return index % 2 === 0 ? hexCr[layer - 1][index] : null;
    } else {
        return index % 2 === 0 ? hexCr[layer + 1][index] : hexCr[layer - 1][index];
    }
}
