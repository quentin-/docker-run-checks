const kue = require("kue");
const joi = require("joi");
const uuid = require("uuid/v4");
const express = require("express");
const Docker = require("dockerode");

const docker = new Docker();
const queue = kue.createQueue();
const router = express.Router();

const RunCommand = require("./commands/run");
const PullCommand = require("./commands/pull");
const CheckWorker = require("./workers/check.js");

const runner = new RunCommand({ docker });
const puller = new PullCommand({ docker });
const worker = new CheckWorker({ queue, puller, runner });

worker.listen();

router.get("/checks/:id", (req, res) => {
  kue.Job.get(req.params.id, function(err, job) {
    if (err) {
      res.status(404);
      res.send({ error: `cannot find job with id ${req.params.id}` });
      return;
    }

    const checks = job.data.images.map(image => {
      let check = {
        pull_logs: [],
        cmd: image.cmd,
        name: image.name,
        execution_logs: [],
        executation_status_code: null
      };

      const progressData = job.progress_data || [];
      const progress = progressData.find(p => p.uuid === image.uuid);

      if (progress) {
        check = {
          ...check,
          download_logs: progress.pull.logs,
          execution_logs: progress.run.logs,
          executation_status_code: progress.run.status_code
        };
      }

      return check;
    });

    return res.status(200).send({
      checks: checks,
      state: job._state,
      created_at: job.created_at,
      updated_at: job.updated_at
    });
  });
});

router.post("/checks", (req, res) => {
  const schema = joi.object().keys({
    images: joi.array().items(
      joi.object().keys({
        name: joi.string(),
        cmd: joi.array().items(joi.string())
      })
    ),
    webhooks: joi.object().keys({
      success: joi.string(),
      failure: joi.string()
    })
  });

  const result = joi.validate(req.body, schema);

  if (result.error) {
    res.status(422).send({ error: result.error.details });
    return;
  }

  // add uuids to image items.
  const images = result.value.images.map(i => ({ ...i, uuid: uuid() }));
  const job = worker.enqueue({ images, webhooks: result.value.webhooks });

  job.save(function(err) {
    !err
      ? res.status(201).send({ check: job.id })
      : res.status(500).send({ error: "could not create job" });
  });
});

module.exports = router;
