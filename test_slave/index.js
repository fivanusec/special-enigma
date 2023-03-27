var WebSocketClient = require("websocket").client;
const { v4 } = require("uuid");

var client = new WebSocketClient();
var __VERSION__ = "1.0.1";

const compareVersions = (v2) => {
  const v1 = __VERSION__.split(".");
  v2 = v2.split(".");
  for (const i in v1) {
    if (Number(v1[i]) > Number(v2[i])) return 1;
    if (Number(v1[i]) < Number(v2[i])) return -1;
  }
  return 0;
};

client.on("connectFailed", function (error) {
  console.log("Connect Error: " + error.toString());
});

client.on("connect", function (connection) {
  console.log("=> WebSocket Client Connected");
  connection.on("error", function (error) {
    console.log("==> Connection Error: " + error.toString());
  });
  connection.on("close", function () {
    console.log("==> echo-protocol Connection Closed");
  });

  connection.on("message", function (message) {
    const data = JSON.parse(message.utf8Data);
    if (data.type === "update") {
      console.log("==> Received update from master: ", data.version);
      const cmp = compareVersions(data.version);
      if (cmp === -1) {
        console.log("==> Update required");
        __VERSION__ = data.version;
      } else {
        console.log("==> Update not required");
      }
    }
  });

  const slaveAddress = v4();
  function ping() {
    if (connection.connected) {
      connection.sendUTF(
        JSON.stringify({
          id: {
            address: slaveAddress,
            name: "Slave 1",
          },
          message: "request-update",
        })
      );
      console.log("==> Sent ping to master");
      setTimeout(ping, 60000);
    }
  }

  function sendLogs() {
    const logs = [
      {
        id: v4(),
        message: "Log 1",
        timestamp: Date.now(),
      },
      {
        id: v4(),
        message: "Log 2",
        timestamp: Date.now(),
      },
    ];
    const logBuffer = Buffer.from(JSON.stringify(logs));
    console.log("==> Log buffer: ", logBuffer);
    if (connection.connected) {
      connection.sendUTF(
        JSON.stringify({
          id: {
            address: slaveAddress,
            name: "Slave 1",
          },
          message: "logs",
          data: logBuffer.toString("base64"),
        })
      );
      console.log("==> Sent logs to master");
      setTimeout(sendLogs, 6000);
    }
  }

  ping();
  sendLogs();
});

client.connect("ws://localhost:4000/", "echo-protocol");
