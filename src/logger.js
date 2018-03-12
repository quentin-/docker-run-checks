const winston = require("winston");

function formatParams(info) {
  const { timestamp, level, message } = info;
  const ts = timestamp.slice(0, 19).replace("T", " ");

  return `${ts} ${level}: ${message.trim()}`;
}

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.align(),
    winston.format.printf(formatParams)
  ),
  transports: [new winston.transports.Console()]
});

module.exports = logger;
