const PiranhaMessage = require("../../PiranhaMessage");

class PvpMatchmakeNotificationMessage extends PiranhaMessage {
  constructor(client) {
    super();
    this.id = 22957;
    this.client = client;
    this.version = 0;
  }

  async encode() {
    this.writeVInt(0);
  }
}

module.exports = PvpMatchmakeNotificationMessage;
