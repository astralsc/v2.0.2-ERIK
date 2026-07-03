const PiranhaMessage = require("../../PiranhaMessage");
const TrainSectorStateMessage = require("../Server/TrainSectorStateMessage");
const StopHomeLogicMessage = require("../Server/StopHomeLogicMessage.js");

class RequestTrainSectorStateMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.id = 14104;
    this.client = client;
    this.version = 0;
  }

  async process() {
    await new TrainSectorStateMessage(this.client).send();
  }
}

module.exports = RequestTrainSectorStateMessage;
