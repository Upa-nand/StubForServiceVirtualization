const express = require('express');
var app = express();
var fs = require("fs");


var formidable = require('formidable');
var bodyParser = require('body-parser');
var config = undefined;
var callBackHandler = require('./CallBackHandler.js');

app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
 extended: true
}));




app.post('/*', function(req, res) {
 handler(req, res);
})
app.get('/*', function(req, res) {
 handler(req, res);
})
app.put('/*', function(req, res) {
 handler(req, res);
})

setInterval(function scheduler() {
 loadConfig();
}, 1000);
loadConfig();

var server = app.listen(19980, function() {
 var host = server.address().address
 var port = server.address().port

 console.log("App listening at http://%s:%s", host, port)
})

function requestHandler(req) {
 var url = getUrl(req);
 if (url) {
  return config[url.split('?')[0]];
 }
}

function getUrl(req) {
 return (req ? req.url ? req.url : undefined : undefined);
}

function handler(req, res) {
 var resFlNm = requestHandler(req);
 /*
 //Future changes
 callBackHandler.preHandler(req);
 var customizedFile = callBackHandler.changeResponseFileSystem(req, resFlNm, getUrl(req));
 resFlNm = (customizedFile && customizedFile.trim().length > 0 ) ? customizedFile : resFlNm;
 */
 if (req.url == '/fileupload') {

  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
   var oldpath = files.filetoupload.path;
   console.log(oldpath);
   
   var newpath = __dirname + "/output/" + files.filetoupload.name;
   console.log(newpath);
   fs.rename(oldpath, newpath, function(err) {
    if (err) throw err;
    //res.write('File uploaded and moved!');
    //res.end();
    return res.redirect('/index.html');
   });

  });
 } else if (req.url != '/fileupload' && resFlNm) {
  handleResponse(req, resFlNm, res);
 } else {
  res.status(404).send('Not Found. Please call 912');
 }

}

function handleResponse(req, fileNm, res) {
 console.log(req.body)
 if (fileNm === 'Dynamic') {
  callBackHandler.postHandler(req, req.body, null, res);
 } else {
  fs.readFile(__dirname + "/output/" + fileNm + ".json", 'utf8', function(err, data) {

   if (err && err.errno) res.status(404).send('Not Found. Please call 911');
   if (data) callBackHandler.postHandler(req, req.body, data, res);
  });
 }
}

function loadConfig() {
 fs.readFile(__dirname + "/public/config.json", 'utf8', function(err, data) {
  config = data ? JSON.parse(data) : {};
 });
}
//node "C:\Best Buy\Gowtham\Learning\Node JS\Samples\Express\Node ReST .js"