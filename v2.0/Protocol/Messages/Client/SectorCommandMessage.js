const PiranhaMessage = require("../../PiranhaMessage");
const KeepAliveOkMessage = require("../Server/KeepAliveOkMessage");
const cards = require("../../../Utils/Cards");

let Utils = {
  range: function (val1, val2) {
    let arr = [];

    for (let i = val1; i < val2; i++) {
      arr.push(i);
    }

    return arr;
  },
};

class SectorCommandMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.id = 12904;
    this.client = client;
    this.version = 0;
    this.json = null;
  }

  async decode() {
    console.log(this.buffer);
    this.json = {};
    this.readVInt();
    this.json.tick = this.readVInt(); // Tick again
    if (this.json.tick <= 0) {
      this.client.end();
    }
    this.json.commandCount = this.readByte();

    this.json.commands = [];
    for (let i = 0; i < this.json.commandCount; i++) {
      try {
        let command = {};
        command.type = this.readByte();
        command.tick = this.readVInt();
        command.checksum = this.readByte();
        command.userId = {
          high: this.readVInt(),
          low: this.readVInt(),
        };
        command.deckIndex = this.readByte(); // Card slot ??
        command.card = {
          high: this.readByte(),
          low: this.readVInt(),
        }; // SCID
        console.log("card:", command.card);
        command.card.id =
          cards.scid[command.card.high * 1000000 + command.card.low].id;
        command.spellIndex = this.readByte();
        command.card.level = this.readByte();
        command.coords = {
          x: this.readVInt(),
          y: this.readVInt(),
        };
        command.deb =
          cards.scid[command.card.high * 1000000 + command.card.low].name;
        this.json.commands.push(command);
      } catch (e) {
        console.log(e);
      }
    }
  }

  async process() {
    if (this.client.battle !== null) {
      this.client.battle.battleLastCommandTime = Date.now();
    }
    if (this.json.commands !== null) {
      for (let command of this.json.commands) {
        if (command.type === 1) {
          this.client.battle.commands.push(command);
        }
      }
    }
  }
}

module.exports = SectorCommandMessage;
