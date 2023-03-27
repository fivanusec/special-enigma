import * as http from "http";
import * as WebSocket from "ws";
import logger from "./utils/winston";
import { SlaveController } from "./Slaves/SlaveController";
import { isJson, validateRequest } from "./utils/isJson";
import { app, slaveNetwork } from "./app/express";
import type { SlaveRequest } from "./types/slaveRequest";

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
let temp: SlaveController;

wss.on("connection", (ws: WebSocket, req: http.IncomingMessage) => {
  ws.on("message", (message: string) => {
    logger.info(`==> Received: ${message}`);

    if (isJson(message)) {
      const slave = JSON.parse(message) as SlaveRequest;
      const validation = validateRequest(slave);
      if (!validation) {
        logger.error(`==> Invalid request received from ${slave.id.address}`);
        return;
      }

      temp = new SlaveController(slave.id);
      const slaveData = slaveNetwork.get(slave.id.address);
      // console.log("==> Slave data ", slaveData);
      if (!slaveData) {
        slaveNetwork.set(slave.id.address, temp);
        logger.info(`==> Slave added to network: ${slave.id.address}`);
      }

      if ("message" in slave) {
        const response = (slaveData || temp).execute(
          String(slave.message),
          slave.id.address,
          slave.data
        );
        ws.send(JSON.stringify(response));
      }
    }
  });

  ws.on("close", () => {
    logger.info(`==> Connection closed for slave ${temp.getData.address}`);
    slaveNetwork.delete(temp.getData.address);
  });

  logger.info(
    `==> New connection established from: ${req.socket.remoteAddress}`
  );
});

server.listen(process.env.PORT || 4000, () => {
  logger.info(`=> Server started on port 4000`);
});
