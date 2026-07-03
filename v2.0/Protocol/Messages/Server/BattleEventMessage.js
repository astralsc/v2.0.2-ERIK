const PiranhaMessage = require("../../PiranhaMessage");

class BattleEventMessage extends PiranhaMessage {
  constructor(client, data) {
    super();
    this.id = 22952;
    this.client = client;
    this.version = 0;
    this.data = data;
  }

  async encode() {
    this.writeByte(this.data.type);
    this.writeVInt(this.data.id.high);
    this.writeVInt(this.data.id.low);
    this.writeByte(this.data.unk);
    this.writeVInt(this.data.tick);
    this.writeByte(this.data.unk2);
    this.writeByte(this.data.unk3);
    this.writeByte(this.data.unk4);
  }
}

module.exports = BattleEventMessage;
