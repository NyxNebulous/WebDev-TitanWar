const svg = document.querySelector("svg");
let layerIndex = [0, 1, 2];
const cx = 325;
const cy = 325;
let hexCr = [];

layerIndex.forEach((layerIndex) => {
    const r = (layerIndex+1)* 100;
    let layer = [];
    for (let i = 0; i < 6; i++) {
        let angle = Math.PI / 3 * i;
        let x = cx + r * Math.cos(angle);
        let y = cy + r * Math.sin(angle);
        layer.push({ x: x, y: y, layer: layerIndex, index: i });
    }
    hexCr.push(layer);
});
layerIndex.forEach(i =>{
    addHex(i);
    addJoint(i);
    addWeight(i);
    addCirle(i);
});


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
        svg.appendChild(circle);
    });
}
function addJoint(layerIndex) {
    if (layerIndex === hexCr.length - 1) return;
    else {
        for (let i = 0; i < 3; i++) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "path");
            let pt1,pt2;
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
function addWeight(layerIndex){
    for (let i = 0; i < 6; i++) {
        const r = (layerIndex + 1) * 100;
        let angle = Math.PI / 3;
        let x1 = cx + (r - 20) * Math.cos(i * angle);
        let y1 = cy + (r - 20) * Math.sin(i * angle);
        let x2 = cx + (r - 20) * Math.cos((i + 1) * angle);
        let y2 = cy + (r - 20) * Math.sin((i + 1) * angle);
        let midx = (x1 + x2) / 2;
        let midy = (y1 + y2) / 2;
        const weight = document.createElementNS("http://www.w3.org/2000/svg","text");
        weight.setAttribute("x",midx);
        weight.setAttribute("y",midy);
        weight.setAttribute("text-anchor","middle");
        weight.setAttribute("font-size",20);
        weight.setAttribute("text-type","bold");
        weight.setAttribute("alignment-baseline","middle");
        const [min, max] = (layerIndex == 2)? [1,3] : (layerIndex == 1)? [4,6] : [7,9];
        weight.textContent = Math.floor(Math.random() * (max - min + 1)) + min;
        svg.appendChild(weight);
    }
}


// const tap = document.querySelectorAll(".round");

// let isSelected = new Map([]);

// tap.forEach((circle) => {
//     circle.addEventListener("click", game);
// });


// let playerOne = true;
// function game(event) {
//     const circle = event.target;
//     let x = circle.getAttribute("id");
//     console.log(x);
//     if(Number(x)/10 == 3){
//     const currentColor = circle.getAttribute("fill");
//     if (currentColor !== "#000000") return;
//     else if (playerOne) {
//         circle.setAttribute("fill", "blue");
//     } else {
//         circle.setAttribute("fill", "rgb(255, 0, 0)");
//     }
//     playerOne = !playerOne;
// }
// }