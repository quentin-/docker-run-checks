const kue = require("kue");
const https = require("https");
const queue = kue.createQueue();
const logger = require("../logger");
const RunCommand = require("../commands/run");
const PullCommand = require("../commands/pull");

class CheckWorker {
  constructor(options) {
    this.queue = options.queue;
    this.docker = options.docker;
  }

  create(data) {
    return this.queue.create("check", data);
  }

  async perform(job, done) {
    logger.info(`at=check job_id=${job.id} start`);
    logger.info(`at=check job_id=${job.id} image_pulling_started`);

    let pullData;
    let runData;

    function fail(e) {
      logger.info(`at=check job_id=${job.id} failed`);
      done(e.message ? e.message : e.toString());
      return false;
    }

    try {
      pullData = await Promise.all(
        job.data.images.map(image =>
          new PullCommand({ docker: this.docker, name: image.name }).execute()
        )
      );
    } catch (e) {
      return fail(e);
    }

    logger.info(`at=check job_id=${job.id} image_pulling_done`);
    logger.info(`at=check job_id=${job.id} image_run_started`);

    try {
      runData = await Promise.all(
        job.data.images.map(image =>
          new RunCommand({
            cmd: image.cmd,
            name: image.name,
            docker: this.docker
          }).execute()
        )
      );
    } catch (e) {
      return fail(e);
    }

    logger.info(`at=check job_id=${job.id} image_run_started_done`);

    let success = true;
    let data = {};

    job.data.images.forEach((image, index) => {
      data[image.uuid] = {
        name: image.name,
        run: runData[index],
        pull: pullData[index]
      };

      if (runData[index].status_code !== 0) {
        success = false;
      }
    });

    const hook = success
      ? job.data.webhooks.success
      : job.data.webhooks.failure;

    logger.info(`at=check job_id=${job.id} hook=${hook}`);

    https
      .get(hook, () => {
        logger.info(`at=check job_id=_${job.id} done`);
        job.progress(100, 100, data);
        done();
      })
      .on("error", e => done(e));
  }

  listen() {
    this.queue.process("check", 20, (job, done) => this.perform(job, done));
  }
}

module.exports = CheckWorker;
