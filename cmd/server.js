const next = require("next");
const api = require("../src/api");
const express = require("express");
const logger = require("../src/logger");
const bodyParser = require("body-parser");

const server = express();
const app = next({ dev: process.env.NODE_ENV !== "production" });
const handle = app.getRequestHandler();

server.use(bodyParser.json());

app.prepare().then(() => {
  server.get("/checks/:id", (req, res) => {
    return app.render(req, res, "/check", req.params);
  });

  server.use("/api/v1", api);
  server.get("*", (req, res) => handle(req, res));
  server.listen(3000, () => logger.info("Example app listening on port 3000!"));
});
