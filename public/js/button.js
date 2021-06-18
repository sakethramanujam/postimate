import database from "./indexdb.js";
import { dbName } from "./settings.js"

let db = new database(dbName)
db.createDB()
let positions = [];
let clickCounter = 0;
let firstPoint = [{
  "timestamp" : new Date().getTime(),
    "xPos" : 0,
    "yPos" : 0,
    "elapsedTime": 0
}]

export function coll(element) {
    if (element.value < 3) {
      element.value++;
    } else {
      element.style.display = "none";
      clickCounter++;
      if (clickCounter === 11) {
        document.getElementById("tip-card").style.display = "none";
        db.pushData(firstPoint);
      }
    }
  }
export function buttonOperations(button, db) {
    if (button.value == 0) {
      button.value = 1;
      webgazer.resume()
      document.getElementById("button_container").style.display = "block";
      document.getElementById("tip-card").style.display = "block";
      button.innerHTML = "Stop Tracking";
      button.className = "btn btn-lg btn-danger"
      webgazer
        .setGazeListener(function (data, elapsedTime) {
          if (data == null) {
            return;
          }
          let position = {
          "timestamp" : new Date().getTime(),
          "xPos" : data.x,
          "yPos" : data.y,
          "elapsedTime": elapsedTime
          }
          positions.push(position);
          if (positions.length === 10){
            console.log("Writing eye tracking data to IndexDB...");
            db.pushData(positions);
            positions = [];
          }
  
        })
        .begin();
    } else if (button.value == 1) {
      //webgazer.pause();
      webgazer.stopVideo();
      button.innerHTML = "Start Tracking";
      button.className = "btn btn-lg btn-success"
      button.value = 0;
      document.getElementById("button_container").style.display = "none";
      document.getElementById("tip-card").style.display = "none";
    }
  }
