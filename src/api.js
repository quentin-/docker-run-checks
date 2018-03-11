const kue = require("kue");
const joi = require("joi");
const uuid = require("uuid/v4");
const express = require("express");
const Docker = require("dockerode");

const docker = new Docker();
const queue = kue.createQueue();
const router = express.Router();

const CheckWorker = require("./workers/check.js");
const checkWorker = new CheckWorker({ docker: docker, queue: queue });

checkWorker.listen();

router.get("/checks/:id", (req, res) => {
  kue.Job.get(req.params.id, function(err, job) {
    if (err) {
      res
        .status(404)
        .send({ error: `cannot find job with id ${req.params.id}` });
      return;
    }

    const checks = job.data.images.map(image => {
      let check = {
        cmd: image.cmd,
        name: image.name,
        pull_logs: [],
        execution_logs: [],
        executation_status_code: null
      };

      const progress = (job.progress_data || {})[image.uuid];

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
      state: job._state,
      created_at: job.created_at,
      updated_at: job.updated_at,
      checks: checks
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
  const job = checkWorker.create({ images, webhooks: result.value.webhooks });

  job.save(function(err) {
    !err
      ? res.status(201).send({ job: job.id })
      : res.status(500).send({ error: "could not create job" });
  });
});

module.exports = router;
