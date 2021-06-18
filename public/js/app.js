let positions = [];
let clickCounter = 0;
let firstPoint = [{
  "timestamp" : new Date().getTime(),
    "xPos" : 0,
    "yPos" : 0,
    "elapsedTime": 0
}]

function coll(element) {
  //  console.log(element.value);
  if (element.value < 3) {
    element.value++;
  } else {
    element.style.display = "none";
    clickCounter++;
    if (clickCounter === 11) {
      document.getElementById("tip-card").style.display = "none";
      pushData(firstPoint);
    }
  }
}

function buttonOperations(button) {
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
          console.log(positions);
          pushData(positions);
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

const dbName = "gaze_data";
const objStName = "EyePos"
createDB(dbName);
function createDB(dbName){
  clearData();
  let request = indexedDB.open(dbName, 1);

    request.onerror = function(event) {
      console.log(event);
    };
    request.onsuccess = function(event){
      console.log("DB Created/opened!");
    };
    request.onupgradeneeded = function(event) {
      let db = event.target.result;
      if (!db.objectStoreNames.contains(objStName)){
        let objectStore = db.createObjectStore(objStName, { keyPath: "timestamp" });
        console.log("Created an object Store!")
      }
      else{
        console.log("object store already present!")
      }
    }
}

function clearData(){
  let req = indexedDB.deleteDatabase(dbName);
    req.onsuccess = function () {
        console.log("Deleted database successfully");
    };
    req.onerror = function () {
        console.log("Couldn't delete database");
    };
    req.onblocked = function () {
        console.log("Couldn't delete database due to the operation being blocked");
    };
}

function getData(filetype){
  let request = indexedDB.open(dbName, 1);
  request.onsuccess = function(e){
    let db = request.result;
    let txn = db.transaction(objStName);
    let objectStore = txn.objectStore(objStName);
    let dataReq = objectStore.getAll();
    dataReq.onsuccess = function(e){
      let jsonData = dataReq.result
      if (filetype === "json"){
        exportToJsonFile(jsonData);
      }
      else{
        exportToCsvFile(jsonData);
      }
    }
  }
}

function pushData(positions){
  let request = indexedDB.open(dbName, 1);
  request.onsuccess = function(e){
    let db = request.result;
    let transaction = db.transaction(objStName,"readwrite");
    let positionStore = transaction.objectStore(objStName);
      positions.forEach(function(position) {
            positionStore.add(position);
          });
  }
} 

function exportToJsonFile(jsonData) {
  let dataStr = JSON.stringify(jsonData);
  let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

  let exportFileDefaultName = "experiment_"+new Date().getUTCDate()+".json";

  let linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  console.log("Saving "+jsonData.length+" datapoints to " + exportFileDefaultName);
}

"use strict";

function parseJSONToCSVStr(jsonData) {
    if(jsonData.length == 0) {
        return '';
    }

    let keys = Object.keys(jsonData[0]);

    let columnDelimiter = ',';
    let lineDelimiter = '\n';

    let csvColumnHeader = keys.join(columnDelimiter);
    let csvStr = csvColumnHeader + lineDelimiter;

    jsonData.forEach(item => {
        keys.forEach((key, index) => {
            if( (index > 0) && (index < keys.length-1) ) {
                csvStr += columnDelimiter;
            }
            csvStr += item[key];
        });
        csvStr += lineDelimiter;
    });

    return encodeURIComponent(csvStr);;
}

function exportToCsvFile(jsonData) {
  let csvStr = parseJSONToCSVStr(jsonData);
  let dataUri = 'data:text/csv;charset=utf-8,'+ csvStr;

  let exportFileDefaultName = "experiment_"+new Date().getUTCDate()+".csv";

  let linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}