const logger = require("../logger");
var streams = require("memory-streams");

class RunCommand {
  constructor(options) {
    this.docker = options.docker;
  }

  execute(name, cmd) {
    return new Promise((resolve, reject) => {
      const writer = new streams.WritableStream();

      this.docker.run(name, cmd, writer, (err, data) => {
        if (err) {
          resolve({
            status_code: err.statusCode,
            logs: err.toString().split("\r\n")
          });
        } else {
          resolve({
            status_code: data.StatusCode,
            logs: writer.toString().split("\r\n")
          });
        }
      });
    });
  }
}

module.exports = RunCommand;
