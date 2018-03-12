const PullCommand = require("./pull");

const DOCKER_ERR = {
  pull: jest.fn((name, cb) => {
    cb(new Error(`not authorized to pull ${name}`), {});
  })
};

const DOCKER_OK = {
  pull: jest.fn((name, cb) => cb(null, {})),
  modem: {
    followProgress: jest.fn((stream, onDone, onProgress) => {
      onProgress({ status: "something happened 1" });
      onProgress({ status: "something happened 2" });
      onProgress({ status: "something happened 3" });
      onDone();
    })
  }
};

describe("PullCommand", () => {
  let pull;
  let docker;

  beforeEach(() => (pull = new PullCommand({ docker })));

  describe("when image pull errors", () => {
    beforeAll(() => (docker = DOCKER_ERR));

    it("errros", async () => {
      try {
        await pull.execute("ubuntu:latest");
      } catch (e) {
        expect(e.message).toEqual("not authorized to pull ubuntu:latest");
      }
    });
  });

  describe("when image is successful", () => {
    beforeAll(() => (docker = DOCKER_OK));

    it("works and returns pull data", async () => {
      const data = await pull.execute("ubuntu:latest");

      expect(data).toEqual({
        logs: [
          "something happened 1",
          "something happened 2",
          "something happened 3"
        ]
      });
    });
  });
});
