const WebSocketServer = require('ws');

var users = [];
var userID = 0;

const wss = new WebSocketServer.Server({ port: 8080 })

wss.on("connection", (ws, req) => {
    console.log("new client connected, URL: "+req.url);
    ws.on("message", data => {
        var message = data.toString();
        console.log(`Client has sent us: ${message}`);
        var obj = JSON.parse(message);
        var type = obj['type'];
        var to = obj['to'];
        var user = getUserByID(to);
        if (user != null) {
          user['ws'].send(message);
        }
    });
    ws.on("close", () => {
        console.log("the client has connected");
    });
    ws.onerror = function () {
        console.log("Some Error occurred")
    };
    var url = req.url.trim();
    url = url.substring(2, url.length);
    var urlSplits = url.split("&");
    for (var i=0; i<urlSplits.length; i++) {
      var urlSplit = urlSplits[i];
      if (urlSplit.split('=')[0] == 'id') {
        userID = urlSplit.split('=')[1];
        console.log('User ID: '+userID);
        var alreadyAdded = false;
        for (var j=0; j<users.length; j++) {
          var user = users[j];
          if (user['id'] == userID) {
            alreadyAdded = true;
            user['ws'] = ws;
            break;
          }
        }
        if (!alreadyAdded) {
          users.push({
            'id': userID,
            'ws': ws
          });
        }
      }
    }
});
console.log("The WebSocket server is running on port 8080");

function getUserByID(id) {
  for (var i=0; i<users.length; i++) {
    var user = users[i];
    if (user['id'] == id) {
      return user;
    }
  }
  return null;
}
