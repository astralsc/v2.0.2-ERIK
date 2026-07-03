const PiranhaMessage = require("../../PiranhaMessage");

class CancelMatchmakeDoneMessage extends PiranhaMessage {
  constructor(client) {
    super();
    this.id = 24124;
    this.client = client;
    this.version = 0;
  }

  async encode() {}
}

module.exports = CancelMatchmakeDoneMessage;
