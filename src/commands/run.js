const logger = require("../logger");
var streams = require("memory-streams");

class RunCommand {
  constructor(options) {
    this.cmd = options.cmd;
    this.name = options.name;
    this.docker = options.docker;
  }

  execute() {
    return new Promise((resolve, reject) => {
      const writer = new streams.WritableStream();

      this.docker.run(this.name, this.cmd, writer, (err, data, container) => {
        if (err) {
          resolve({
            cmd: this.cmd,
            status_code: err.statusCode,
            logs: err.toString().split("\r\n")
          });
        } else {
          resolve({
            cmd: this.cmd,
            error: data.Error,
            status_code: data.StatusCode,
            logs: writer.toString().split("\r\n")
          });
        }
      });
    });
  }
}

module.exports = RunCommand;
