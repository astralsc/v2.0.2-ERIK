const PiranhaMessage = require("../../PiranhaMessage");
const CommandFactory = require("../../CommandFactory");
const Commads = new CommandFactory();

let Utils = {
  range: function (val1, val2) {
    let arr = [];

    for (let i = val1; i < val2; i++) {
      arr.push(i);
    }

    return arr;
  },
};

class EndClientTurnMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.id = 14102;
    this.client = client;
    this.version = 0;
    this.json = {};
  }

  async decode() {
    this.json.tick = this.readVInt();
    this.json.checksum = this.readVInt();
    this.cmdCount = this.readVInt();
  }

  async process() {
    //console.log(this.cmdCount);
    if (this.json.tick < 0) {
      console.log("tick is corrupted");
      this.client.end();
    }

    /* if (this.json.cmdCount == 0 || this.json.cmdCount > 32) {
      // in case if we receive broken command
      let lastEncount = 0;
      let lastByte = 0;

      do {
        lastEncount = this.offset;
        lastByte = this.readVInt();
      } while (
        !Utils.range(500, 600).includes(lastByte) &&
        Commads.getCommands().indexOf(String(lastByte)) == -1
      );

      if (Utils.range(500, 600).includes(lastByte)) {
        this.offset = lastEncount;
        this.data.Count = 2;
      }
    }*/

    this.json.commands = [];

    for (let i = 0; i < this.cmdCount; i++) {
      let cmdId = this.readVInt();
      if (cmdId < 500) break;
      console.log(cmdId);
      if (Commads.getCommands().includes(cmdId.toString())) {
        let command = new (Commads.handle(cmdId.toString()))(this);
        command.decode();
        command.process();
        console.log(`Gotcha ${cmdId} (${command.constructor.name}) command! `);
        this.json.commands.push(command);
      } else {
        console.log("cmd " + cmdId + " is unhandled");
      }
    }
  }
}

module.exports = EndClientTurnMessage;
