const BattleEventMessage = require("../Protocol/Messages/Server/BattleEventMessage.js");
const BattleResultMessage = require("../Protocol/Messages/Server/BattleResultMessage.js");
const SectorHearbeatMessage = require("../Protocol/Messages/Server/SectorHearbeatMessage.js");
const SectorStateMessage = require("../Protocol/Messages/Server/SectorStateMessage.js");
const StopHomeLogicMessage = require("../Protocol/Messages/Server/StopHomeLogicMessage.js");

class Battle {
  constructor(clients) {
    this.hearBeatId = 1;
    this.commands = [];
    this.battleLastCommandTime = Date.now();
    this.crowns = [];
    this.clients = clients;
    for (let i = 0; i < this.clients.length; i++) {
      let el = this.clients[i];
      el.battle = this;
      this.crowns.push(0);
    }
  }

  start() {
    new StopHomeLogicMessage(this.clients[0]).send();
    new StopHomeLogicMessage(this.clients[1]).send();
    new SectorStateMessage(
      this.clients[0],
      this.clients[0],
      this.clients[1],
    ).send();
    new SectorStateMessage(
      this.clients[1],
      this.clients[0],
      this.clients[1],
    ).send();
    this.hearBeat = setInterval(() => {
      this.sendHearBeat();
    }, 500);
  }

  sendHearBeat() {
    console.log(this.crowns);
    console.log(Date.now() - this.battleLastCommandTime);
    if (
      Date.now() - this.battleLastCommandTime > 2000 &&
      this.hearBeatId >= 10 * 2
    ) {
      this.finish();
      return;
    }
    new SectorHearbeatMessage(
      this.clients[0],
      this.hearBeatId,
      this.commands,
    ).send();
    new SectorHearbeatMessage(
      this.clients[1],
      this.hearBeatId,
      this.commands,
    ).send();
    this.commands = [];
    this.hearBeatId += 1;
  }

  setCrowns(client, crowns) {
    this.crowns[this.clients.indexOf(client)] = crowns;
  }

  sendResult() {
    const player1Crowns = this.crowns[0];
    const player2Crowns = this.crowns[1];
    let player1trophies = 0;
    let player2trophies = 0;
    if (player1Crowns > player2Crowns) {
      player1trophies = 30;
    } else {
      player1trophies = -30;
    }
    player2trophies = -player1trophies;

    new BattleResultMessage(
      this.clients[0],
      player1Crowns,
      player2Crowns,
      player1trophies,
    ).send();
    new BattleResultMessage(
      this.clients[1],
      player2Crowns,
      player1Crowns,
      player2trophies,
    ).send();

    this.clients[0].user.stats.trophies += player1trophies;
    this.clients[1].user.stats.trophies += player2trophies;
    if (this.clients[0].user.stats.trophies < 0)
      this.clients[0].user.stats.trophies = 0;
    if (this.clients[1].user.stats.trophies < 0)
      this.clients[1].user.stats.trophies = 0;
    global.database.update(
      this.clients[0].user._systemid,
      this.clients[0].user,
    );
    global.database.update(
      this.clients[1].user._systemid,
      this.clients[1].user,
    );
  }

  sendEvent(event, from) {
    let to = this.clients.indexOf(from) === 0 ? 1 : 0;
    new BattleEventMessage(this.clients[to], event).send();
  }

  finish() {
    for (let i = 0; i < this.clients.length; i++) {
      let el = this.clients[i];
      el.battle = null;
    }
    this.sendResult();
    clearInterval(this.hearBeat);
  }
}

module.exports = Battle;
