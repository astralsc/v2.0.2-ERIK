const PiranhaMessage = require("../../PiranhaMessage");
const OwnHomeDataMessage = require("../Server/OwnHomeDataMessage");

class GoHomeMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.id = 14101;
    this.client = client;
    this.version = 0;
  }

  async process() {
    await new OwnHomeDataMessage(this.client, { nameChanged: true }).send();
  }
}

module.exports = GoHomeMessage;
