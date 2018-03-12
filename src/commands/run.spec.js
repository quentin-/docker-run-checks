const RunCommand = require("./run");

const DOCKER_ERR = {
  run: jest.fn((name, cmd, writer, cb) => {
    const err = new Error(`could not find binary ${cmd[0]}`);
    err.statusCode = 1;

    cb(err, {});
  })
};

const DOCKER_OK = {
  run: jest.fn((name, cmd, writer, cb) => {
    writer._write("foo.txt\r\n");
    writer._write("bin.txt\r\n");

    cb(null, { StatusCode: 0 });
  })
};

describe("RunCommand", () => {
  let run;
  let docker;

  beforeEach(() => (run = new RunCommand({ docker })));

  describe("when image run errors", () => {
    beforeAll(() => (docker = DOCKER_ERR));

    it("returns the error", async () => {
      const data = await run.execute("ubuntu:latest", ["foo", "-h"]);

      expect(data).toEqual({
        logs: ["Error: could not find binary foo"],
        status_code: 1
      });
    });
  });

  describe("when image run is successful", () => {
    beforeAll(() => (docker = DOCKER_OK));

    it("returns data about the command", async () => {
      const data = await run.execute("ubuntu:latest", ["ls"]);

      expect(data).toEqual({
        logs: ["foo.txt", "bin.txt", ""],
        status_code: 0
      });
    });
  });
});
