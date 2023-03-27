import winston from "winston";
import path from "path";

const logger = winston.createLogger({
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: path.join(__dirname, "/../../logs/errorLogger.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "/../../logs/logger.log"),
    }),
  ],
});

const sampleFormat = winston.format.printf(({ level, message }) => {
  const msg = `[${level}] ${new Date().toISOString()}: ${message}`;
  return msg;
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.simple(),
        winston.format.colorize(),
        sampleFormat
      ),
    })
  );
}

export default logger;
