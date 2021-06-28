window.requestAnimationFrame =
        window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame;

window.saveDataAcrossSessions = true;
let imageEl = getNewImage("img-1");
let imageEl2 = getNewImage("img-2");

function getNewImage(imgId){
    const img = document.getElementById(imgId);
    img.src = "https://picsum.photos/1000?" + Math.random();
    img.style.position = "absolute";
}


function createCanvas(){
    let body = document.body;
    let canvas = document.createElement("canvas");
    canvas.style.width = window.innerWidth;
    canvas.style.height = window.innerHeight;
    canvas.id = "canvas";
    body.appendChild(canvas);
}



function get(id) {
    return document.getElementById(id);
}

var heat = simpleheat("canvas"),
frame;

function draw() {
    console.time("draw");
    heat.draw();
    console.timeEnd("draw");
    frame = null;
}

draw();
webgazer
.setGazeListener(function (data, elapsedTime) {
    if (data == null) {
    return;
    }
    let x = data.x;
    let y = data.y;
    console.log(x, y);
    heat.add([x, y, 0.3]);
    frame = frame || window.requestAnimationFrame(draw);
})
.setRegression('ridge')
.setTracker('TFFacemesh')
.showVideo(false)
.showPredictionPoints(false)
.begin();