const Command = require("../../Command");
const TrainSectorStateMessage = require("../../Messages/Server/TrainSectorStateMessage");
const PvpMatchmakeNotificationMessage = require("../../Messages/Server/PvpMatchmakeNotificationMessage");
const Battle = require("../../../Logic/Battle");

class command548 extends Command {
  constructor(buf) {
    super(buf);
    this.buf = buf;
    this.id = 548;
    try {
      this.client = this.buf.client;
    } catch {}
  }

  async decode() {}

  async process() {
    console.log("battle " + this.is2v2);
    if (global.userInBattleSeach === null) {
      global.userInBattleSeach = this.client;
      if (global.connectedPlayers.length <= 7) {
        global.sendDiscordMessage(
          `${this.client.user.username} Is Searching for battle on Eriks Royale`,
        );
        global.connectedPlayers.forEach((otherclient) => {
          new PvpMatchmakeNotificationMessage(otherclient).send();
        });
      }
    } else if (global.userInBattleSeach !== this.client) {
      //await new TrainSectorStateMessage(this.client).send();
      let b = new Battle([global.userInBattleSeach, this.client]);
      b.start();
      global.userInBattleSeach = null;
    }
  }
}

module.exports = command548;
