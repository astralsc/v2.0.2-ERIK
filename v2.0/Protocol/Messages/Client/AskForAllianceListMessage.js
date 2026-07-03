const PiranhaMessage = require("../../PiranhaMessage");
const ServerHelloMessage = require("../Server/ServerHelloMessage");
const AllianceListMessage = require("../Server/AllianceListMessage");

class AskForAllianceListMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.client = client;
    this.id = 14303;
    this.version = 0;
  }

  async decode() {
    // this.readInt()
  }

  async process() {
    await new AllianceListMessage(this.client).send();
  }
}

module.exports = AskForAllianceListMessage;
