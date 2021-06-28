let positions = [];
let clickCounter = 0;
let date = new Date()
let filename_base = String(date.getMonth()) + "_" + String(date.getDate()) 
let webgazerCanvas = null;
let dbName = "gaze_data";
class database{
  constructor(dbName) {
    this.dbName = dbName;
    this.objStName = null;
    if (dbName === "gaze_data") {
      this.objStName = "eyePos";
    } else if (dbName === "localforage") {
      this.objStName = "keyvaluepairs";
    }
  }
  createDB() {
    let request = indexedDB.open(this.dbName, 1);
    request.onerror = function (event) {
      console.log(event);
    };
    request.onsuccess = function (event) {
      console.log("Fresh indexDB created.");
    };
    request.onupgradeneeded = function (event) {
      let db = event.target.result;
      if (!db.objectStoreNames.contains(this.objStName)) {
        let objectStore = db.createObjectStore(this.objStName, {
          keyPath: "timestamp",
        });
        console.log("created a new objectStore!");
      } else {
        console.log("objectStore already present!");
      }
    };
  }

  clearData() {
    let req = indexedDB.deleteDatabase(this.dbName);
    req.onsuccess = function () {
      console.log("Deleted database successfully");
    };
    req.onerror = function () {
      console.log("Couldn't delete database");
    };
    req.onblocked = function () {
      console.log(
        "Couldn't delete database due to the operation being blocked"
      );
    };
  }
  pushData(positions){
    let request = indexedDB.open(this.dbName, 1);
    request.onsuccess = function(e){
      let db = request.result;
      let transaction = db.transaction(this.objStName,"readwrite");
      let positionStore = transaction.objectStore(this.objStName);
        positions.forEach(function(position) {
              positionStore.add(position);
            });
    }
  }

  getData(filetype) {
    let request = indexedDB.open(this.dbName, 1);
    request.onsuccess = function (e) {
      let db = request.result;
      let txn = db.transaction(this.objStName);
      let objectStore = txn.objectStore(this.objStName);
      let dataReq = objectStore.getAll();
      dataReq.onsuccess = function (e) {
        let jsonData = dataReq.result;
        exportData(filetype,jsonData);
      };
      dataReq.onerror = function (e) {
        console.log("fetching data from indexDB failed;");
      };  
    };
  }
}

function exportData(filetype, jsonData){
    if (filetype === "json") {
      _exportToJsonFile(jsonData);
    } else {
      _exportToCsvFile(jsonData);
    }
}

function _exportToJsonFile(jsonData) {
  let dataStr = JSON.stringify(jsonData);
  let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

  let exportFileDefaultName = "experiment_"+filename_base+".json";

  let linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
  console.log("Saving "+jsonData.length+" datapoints to " + exportFileDefaultName);
}

function _parseJSONToCSVStr(jsonData) {
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

function _exportToCsvFile(jsonData) {
  let csvStr = this._parseJSONToCSVStr(jsonData);
  let dataUri = 'data:text/csv;charset=utf-8,'+ csvStr;

  let exportFileDefaultName = "experiment_"+filename_base+".csv";

  let linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

let gazedb = new database(dbName);

window.saveDataAcrossSessions = false;
window.onload = async function(){
  gazedb.createDB();
  if(!window.saveDataAcrossSessions){
    /* let localstorageDatalabel = 'webgazerGlobalData';
    localforage.setItem(localstorageDatalabel, null);
    let localstorageSettingslabel = 'webgazerGlobalSettings';
    localforage.setItem(localstorageSettingslabel, null); */
  }

};

window.onbeforeunload = function() {
  if (window.saveDataAcrossSessions) {
      webgazer.end();
  } else {
      gazedb.clearData();
  }
}

function coll(element) {
  if (element.value < 3) {
    element.value++;
  } else {
    element.style.display = "none";
    clickCounter++;
    if (clickCounter === 11) {
      document.getElementById("tip-card").style.display = "none";
      let firstPoint = [{
        "timestamp" : new Date().getTime(),
          "xPos" : 0,
          "yPos" : 0,
          "elapsedTime": 0
      }]
      gazedb.pushData(firstPoint);
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
        let x = data.x
        let y = data.y
        console.log(x,y);
        let position = {
        "timestamp" : new Date().getTime(),
        "xPos" : x,
        "yPos" : y,
        "elapsedTime": elapsedTime
        }
        positions.push(position);
        if (positions.length === 10){
          console.log("Writing eye tracking data to IndexDB...");
          gazedb.pushData(positions);
          positions = [];
        }

      })
      .setRegression('ridge')
      .setTracker('TFFacemesh')
      .begin();
  } else if (button.value == 1) {
    webgazer.pause();
    //webgazer.stopVideo();
    button.innerHTML = "Start Tracking";
    button.className = "btn btn-lg btn-success"
    button.value = 0;
    document.getElementById("button_container").style.display = "none";
    document.getElementById("tip-card").style.display = "none";
  }
}