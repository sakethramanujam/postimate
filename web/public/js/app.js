let xpositions = [];
let ypositions = [];

function buttonOperations(button) {
  if (button.value == 0) {
    button.value = 1;
    webgazer.resume();
    document.getElementById("button_container").style.display = "block";
    document.getElementById("description").style.display = "none";
    document.getElementById("tip").style.display = "block";
    button.innerHTML = "pause";
    webgazer
      .setGazeListener(function (data, elapsedTime) {
        if (data == null) {
          return;
        }
        xPos = data.x;
        yPos = data.y;
      })
      .begin();
  } else if (button.value == 1) {
    webgazer.pause();
    button.innerHTML = "start";
    button.value = 0;
  }
}

var starsCounter = 0;
function coll(element) {
  console.log(element.value);
  if (element.value < 6) {
    element.value++;
  } else {
    element.style.display = "none";
    starsCounter++;
    if (starsCounter === 11) {
      document.getElementById("tip").style.display = "none";
    }
  }
}
