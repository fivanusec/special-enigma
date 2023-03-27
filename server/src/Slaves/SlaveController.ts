import fs from "fs";
import path from "path";
import logger from "../utils/winston";
import { SlaveData } from "../types/slaveRequest";

type SlaveResponseObjectType = "update";
type SlaveResponse =
  | {
      type: SlaveResponseObjectType;
      address: string;
      version: string;
    }
  | string
  | string[];

export class SlaveController {
  constructor(private data: SlaveData) {}

  execute(command: string, address: string, data?: string): SlaveResponse {
    console.log(`==> Executing command: ${command}`);
    let response: SlaveResponse;
    switch (command) {
      case "ls -lah":
        console.log(`==> Listing files for slave: ${address}`);
        response = fs.readdirSync("./");
        console.log(response);
        break;
      case "connect":
        response = `Connected to slave: ${address}`;
        break;
      case "ping":
        response = "pong";
        break;
      case "help":
        response = [
          "ls -lah: List files in current directory",
          "connect: Connect to slave",
          "ping: Ping slave",
        ];
        break;
      case "logs":
        response = "Open to transmit logs";
        const dataBuffer = Buffer.from(data || "", "base64");
        fs.appendFile(
          path.join(__dirname, `/../../logs/${address}.log`),
          dataBuffer + "\n",
          "utf-8",
          (err) => {
            if (err) {
              logger.error(`==> Error writing to file: ${err}`);
              throw err;
            }
          }
        );
        break;
      case "request-update":
        response = {
          type: "update",
          address: this.data.address,
          version: "1.0.1",
        };
        break;
      default:
        console.log("==> Command not found");
        response = "Command not found";
        break;
    }
    return response;
  }

  get getData() {
    return this.data;
  }
}
