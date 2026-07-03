const PiranhaMessage = require("../../PiranhaMessage");
const towers = require("../../../Utils/towers.json");

class SectorHearbeatMessage extends PiranhaMessage {
  constructor(client, hearbeatid, events) {
    super();
    this.id = 21902;
    this.client = client;
    this.version = 0;
    this.hearbeatid = hearbeatid;
    this.events = events;
  }

  async encode() {
    this.writeVInt(this.hearbeatid);
    this.writeVInt(0);

    this.writeVInt(this.events.length);
    for (let event of this.events) {
      this.writeVInt(event.type);
      switch (event.type) {
        case 1:
          this.writeVInt(event.tick);
          this.writeVInt(event.tick);

          this.writeVInt(event.userId.high);
          this.writeVInt(event.userId.low);

          this.writeVInt(event.deckIndex);
          this.writeVInt(event.card.high);
          this.writeVInt(event.card.low);

          this.writeVInt(event.spellIndex); // CARD ID
          this.writeVInt(event.card.level);
          this.writeVInt(event.coords.x);
          this.writeVInt(event.coords.y);
      }
    }
  }
}

module.exports = SectorHearbeatMessage;
