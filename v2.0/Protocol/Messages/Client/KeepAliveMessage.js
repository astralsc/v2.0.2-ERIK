const PiranhaMessage = require("../../PiranhaMessage");
const KeepAliveOkMessage = require("../Server/KeepAliveOkMessage");

class KeepAliveMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.id = 10108;
    this.client = client;
    this.version = 0;
  }

  async process() {
    await new KeepAliveOkMessage(this.client).send();
  }
}

module.exports = KeepAliveMessage;
