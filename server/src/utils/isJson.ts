import { Schema, Validator } from "jsonschema";
import type { SlaveRequest } from "../types/slaveRequest";
import logger from "./winston";

export const isJson = (str: string) =>
  /[{\[]{1}([,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]|".*?")+[}\]]{1}/g.test(str);

export const validateRequest = (object: SlaveRequest) => {
  const validationSchema: Schema = {
    id: "/SlaveRequest",
    type: "object",
    properties: {
      id: {
        type: "object",
        properties: {
          address: { type: "string", required: true },
          name: { type: "string", required: false },
        },
      },
    },
    required: ["id"],
  };

  const validator = new Validator();
  const result = validator.validate(object, validationSchema);
  for (const error of result.errors) {
    logger.error(`==> ${error.name} - ${error.message}`);
    return false;
  }
  return true;
};
