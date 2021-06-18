const date = new Date()
const filename_base = String(date.getMonth()) + "_" + String(date.getDate()) 

export default class database{
  dbName;
  objStName;
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
    this.clearData();
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

  getData() {
    let request = indexedDB.open(this.dbName, 1);
    request.onsuccess = function (e) {
      let db = request.result;
      let txn = db.transaction(this.objStName);
      let objectStore = txn.objectStore(this.objStName);
      let dataReq = objectStore.getAll();
      dataReq.onsuccess = function (e) {
        return dataReq.result;
      };
      dataReq.onerror = function (e) {
        console.log("fetching data from indexDB failed;");
      };
    };
  }
  exportData(filetype) {
    jsonData = this.getData();
    if (filetype === "json") {
      this._exportToJsonFile(jsonData);
    } else {
      this.exportToCsvFile(jsonData);
    }
  }

  _exportToJsonFile(jsonData) {
    let dataStr = JSON.stringify(jsonData);
    let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  
    let exportFileDefaultName = "experiment_"+filename_base+".json";
  
    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    console.log("Saving "+jsonData.length+" datapoints to " + exportFileDefaultName);
  }

  _parseJSONToCSVStr(jsonData) {
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

_exportToCsvFile(jsonData) {
  let csvStr = this._parseJSONToCSVStr(jsonData);
  let dataUri = 'data:text/csv;charset=utf-8,'+ csvStr;

  let exportFileDefaultName = "experiment_"+filename_base+".csv";

  let linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}
}
