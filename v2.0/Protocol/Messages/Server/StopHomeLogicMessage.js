const PiranhaMessage = require("../../PiranhaMessage");

class StopHomeLogicMessage extends PiranhaMessage {
  constructor(client) {
    super();
    this.id = 24106;
    this.client = client;
    this.version = 0;
  }

  async encode() {}
}

module.exports = StopHomeLogicMessage;
