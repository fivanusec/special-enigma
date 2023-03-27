import cors from "cors";
import express, { Request, Response } from "express";
import { SlaveController } from "src/Slaves/SlaveController";

export const app = express();
export const slaveNetwork: Map<number | string, SlaveController> = new Map();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.set("trust proxy", 1);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/services", (_req: Request, res: Response) => {
  const services = Array.from(slaveNetwork.values());
  res.status(200).send({
    status: "success",
    slaves: services,
  });
});
