const { request } = require("express");
const express = require("express");
const app = express();


// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

app.get("/", (request, response)=>{
  response.sendFile(__dirname + "/views/index.html");
})

app.get("/calibration", (request, response) => {
  response.sendFile(__dirname + "/views/calibration.html");
});

app.get("/heatmap", (request, response)=>{
  response.sendFile(__dirname + "/views/heatmap.html");
})

// listen for requests :)
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
