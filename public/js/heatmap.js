window.requestAnimationFrame =
  window.requestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.msRequestAnimationFrame;

window.saveDataAcrossSessions = true;
let imageEl = getNewImage("img-1");
let imageEl2 = getNewImage("img-2");
let heat = "";
let frame = null;
function getNewImage(imgId) {
  const img = document.getElementById(imgId);
  img.src = "https://picsum.photos/1000?" + Math.random();
}

function resize() {
  var canvas = document.getElementById("plotting_canvas");
  var context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize, false);

window.onload = (e) => {
  resize();
  (heat = simpleheat("plotting_canvas")), frame;
  draw();
};

function get(id) {
  return document.getElementById(id);
}

function draw() {
  console.time("draw");
  heat.draw();
  console.timeEnd("draw");
  frame = null;
}

async function startStop(event) {
  let button = event.source || event.target;
  if (button.value == 0) {
    button.value = 1;
    webgazer.resume();
    button.innerHTML = "Stop Tracking";
    button.className = "btn btn-lg btn-danger";
    await webgazer
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
      .setRegression("ridge")
      .setTracker("TFFacemesh")
      .showFaceOverlay(false)
      .showVideo(false)
      .begin();
  } else if (button.value == 1) {
    webgazer.end();
    let canvas = get("plotting_canvas");
    canvas.style.display = "block";
    button.innerHTML = "Start Tracking";
    button.className = "btn btn-lg btn-success";
    button.value = 0;
  }
}

let startEl = document.getElementById("start_stop");
startEl.onclick = startStop;
