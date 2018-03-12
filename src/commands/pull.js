const logger = require("../logger");

class PullCommand {
  constructor(options) {
    this.docker = options.docker;
  }

  execute(name) {
    return new Promise((resolve, reject) => {
      this.logs = [];
      this.docker.pull(name, (err, stream) => {
        if (err) {
          reject(err);
          return;
        }

        this.docker.modem.followProgress(
          stream,
          err => {
            if (err) {
              reject(err);
            } else {
              resolve({ logs: this.logs });
            }
          },
          event => {
            if (event.status) {
              logger.info(`${name} ${event.status}`);
              this.logs.push(event.status);
            }
          }
        );
      });
    });
  }
}

module.exports = PullCommand;
