const PiranhaMessage = require("../../PiranhaMessage");
const CancelMatchmakeDoneMessage = require("../Server/CancelMatchmakeDoneMessage");

class CancelMatchmakeMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.id = 14107;
    this.client = client;
    this.version = 0;
  }

  async process() {
    if (global.userInBattleSeach === this.client) {
      global.userInBattleSeach = null;
    }
    await new CancelMatchmakeDoneMessage(this.client).send();
  }
}

module.exports = CancelMatchmakeMessage;
