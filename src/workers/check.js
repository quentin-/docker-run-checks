const kue = require("kue");
const https = require("https");
const queue = kue.createQueue();
const logger = require("../logger");
const RunCommand = require("../commands/run");
const PullCommand = require("../commands/pull");

class CheckWorker {
  constructor(options) {
    this.queue = options.queue;
    this.runner = new RunCommand({ docker: options.docker });
    this.puller = new PullCommand({ docker: options.docker });
  }

  create(data) {
    return this.queue.create("check", data);
  }

  async perform(job, done) {
    logger.info(`at=check job_id=${job.id} start`);

    const executions = job.data.images.map(async image => {
      const { cmd, name } = image;

      const pull = await this.puller.execute(name);
      const run = await this.runner.execute(name, cmd);

      return { uuid: image.uuid, pull, run };
    });

    try {
      const results = await Promise.all(executions);
      const success = results.every(result => result.run.status_code === 0);

      job.progress(100, 100, results);

      const hook = success
        ? job.data.webhooks.success
        : job.data.webhooks.failure;

      https.get(hook, () => done()).on("error", e => done(e));
      logger.info(`at=check job_id=${job.id} done`);
      done();
    } catch (e) {
      done(e);
    }
  }

  listen() {
    this.queue.process("check", 20, (job, done) => this.perform(job, done));
  }
}

module.exports = CheckWorker;
