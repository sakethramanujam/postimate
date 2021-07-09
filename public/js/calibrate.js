let positions = [];
let clickCounter = 0;
let date = new Date();
let filename_base = String(date.getMonth()) + "_" + String(date.getDate());
let webgazerCanvas = null;
let dbName = "gaze_data";
class database {
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
    let req = indexedDB.open(this.dbName, 1);
    req.onerror = (e) => {
      console.log(e);
    };
    req.onsuccess = (e) => {
      console.log("Fresh indexDB created.");
    };
    req.onupgradeneeded = (e) => {
      let db = e.target.result;
      if (!db.objectStoreNames.contains(this.objStName)) {
        let objectStore = db.createObjectStore(this.objStName, {
          keyPath: "timestamp",
        });
        console.log("created a new objectStore!");
      } else {
        console.log("objectStore already present!");
      }
      db.close();
    };
  }

  clearData() {
    let req = indexedDB.deleteDatabase(this.dbName);
    req.onsuccess = () => {
      console.log("Deleted database successfully");
    };
    req.onerror = () => {
      console.log("Couldn't delete database");
    };
    req.onblocked = () => {
      console.log(
        "Couldn't delete database due to the operation being blocked"
      );
    };
  }

  pushData(positions) {
    let req = indexedDB.open(this.dbName, 1);
    req.onsuccess = (e) => {
      let db = req.result;
      let transaction = db.transaction(this.objStName, "readwrite");
      let positionStore = transaction.objectStore(this.objStName);
      positions.forEach(function (position) {
        positionStore.add(position);
      });
    };
    req.onerror = (e) => {
      console.log(e);
    };
  }

  getData(click) {
    let srcEl = click.source || click.target;
    let id = srcEl.getAttribute("id");
    let filetype = "";
    if (id === "download_json") {
      filetype = "json";
    } else {
      filetype = "csv";
    }
    let req = indexedDB.open(this.dbName, 1);
    req.onsuccess = (e) => {
      let db = req.result;
      let txn = db.transaction(this.objStName, "readonly");
      let objectStore = txn.objectStore(this.objStName);
      let dataReq = objectStore.getAll();
      dataReq.onsuccess = (e) => {
        let jsonData = dataReq.result;
        exportData(filetype, jsonData);
      };
      dataReq.onerror = (e) => {
        console.log("fetching data from indexDB failed;");
      };
    };
  }
}

function exportData(filetype, jsonData) {
  if (filetype === "json") {
    _exportToJsonFile(jsonData);
  } else {
    _exportToCsvFile(jsonData);
  }
}

function _exportToJsonFile(jsonData) {
  let dataStr = JSON.stringify(jsonData);
  let dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  let exportFileDefaultName = "experiment_" + filename_base + ".json";

  let linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
  console.log(
    "Saving " + jsonData.length + " datapoints to " + exportFileDefaultName
  );
}

function _parseJSONToCSVStr(jsonData) {
  if (jsonData.length == 0) {
    return "";
  }

  let keys = Object.keys(jsonData[0]);

  let columnDelimiter = ",";
  let lineDelimiter = "\n";

  let csvColumnHeader = keys.join(columnDelimiter);
  let csvStr = csvColumnHeader + lineDelimiter;

  jsonData.forEach((item) => {
    keys.forEach((key, index) => {
      if (index > 0 && index < keys.length - 1) {
        csvStr += columnDelimiter;
      }
      csvStr += item[key];
    });
    csvStr += lineDelimiter;
  });

  return encodeURIComponent(csvStr);
}

function _exportToCsvFile(jsonData) {
  let csvStr = this._parseJSONToCSVStr(jsonData);
  let dataUri = "data:text/csv;charset=utf-8," + csvStr;

  let exportFileDefaultName = "experiment_" + filename_base + ".csv";

  let linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
}

let gazedb = new database(dbName);



window.onbeforeunload = function () {
  if (window.saveDataAcrossSessions) {
    webgazer.end();
  } else {
    gazedb.clearData();
  }
};

function coll(element) {
  
  if (element.value < 4) {
    element.value++;
  } else {
    element.style.display = "none";
    clickCounter++;
    if (clickCounter === 8) {
      /* let firstPoint = [
        {
          timestamp: new Date().getTime(),
          xPos: 0,
          yPos: 0,
          elapsedTime: 0,
        },
      ];
        gazedb.pushData(firstPoint); */
        let btn7 = document.getElementById("pt6");
        btn7.style.display = "block";
        var canvas = document.getElementById("plotting_canvas");
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        swal({
          title: "Calculating measurement",
          text: "Please don't move your mouse & stare at the middle button for the next 5 seconds. This will allow us to calculate the accuracy of our predictions.",
          closeOnEsc: false,
          allowOutsideClick: false,
          closeModal: true
        }).then( isConfirm => {
                  $(document).ready(function(){
                  store_points_variable(); // start storing the prediction points
                  sleep(5000).then(() => {
                      stop_storing_points_variable(); // stop storing the prediction points
                      var past50 = webgazer.getStoredPoints(); // retrieve the stored points
                      var precision_measurement = calculatePrecision(past50);
                      var accuracyLabel = "<a>Accuracy | "+precision_measurement+"%</a>";
                      //document.getElementById("Accuracy").innerHTML = accuracyLabel; // Show the accuracy in the nav bar.
                      swal({
                        title: "Your accuracy measure is " + precision_measurement + "%",
                        allowOutsideClick: false,
                        buttons: {
                          cancel: "Recalibrate",
                          confirm: true,
                        }})
                      })})})

      
    }
  }
    }

function showCalibPoints(){
  document.getElementById("calibrationDiv").style.display = "block";
}

window.saveDataAcrossSessions = true;
window.onload = async function () {
  gazedb.createDB();
  setupCanvas();
  if (!window.saveDataAcrossSessions) {
    let localstorageDatalabel = 'webgazerGlobalData';
    localforage.setItem(localstorageDatalabel, null);
    let localstorageSettingslabel = 'webgazerGlobalSettings';
    localforage.setItem(localstorageSettingslabel, null);
  }
    webgazer.params.showVideoPreview = true;
    await webgazer.setRegression('ridge')
      .setGazeListener(function (data, elapsedTime) {
        if (data == null) {
          return;
        }
        let x = data.x;
        let y = data.y;
        //console.log(x, y);
        /* let position = {
          timestamp: new Date().getTime(),
          xPos: x,
          yPos: y,
          elapsedTime: elapsedTime,
        };
        //positions.push(position);
        if (positions.length === 10) {
          console.log("Writing eye tracking data to IndexDB...");
          gazedb.pushData(positions);
          positions = [];
        } */
      })
      .saveDataAcrossSessions(true)
      .begin();
      webgazer.showVideoPreview(true).showPredictionPoints(true)
      .applyKalmanFilter(true)
};


function setupCanvas(){
  var canvas = document.getElementById("plotting_canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.position = 'fixed';
  canvas.style.zIndex = 9;
}

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

