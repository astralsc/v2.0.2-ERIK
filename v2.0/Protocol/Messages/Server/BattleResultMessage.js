const PiranhaMessage = require("../../PiranhaMessage");

class BattleResultMessage extends PiranhaMessage {
  constructor(client, ownCrowns, opponentCrowns, trophies) {
    super();
    this.id = 20225;
    this.client = client;
    this.version = 0;
    this.ownCrowns = ownCrowns;
    this.opponentCrowns = opponentCrowns;
    this.trophies = trophies;
  }

  async encode() {
    if (this.ownCrowns === this.opponentCrowns) {
      this.writeVInt(3);
    } else if (this.ownCrowns > this.opponentCrowns) {
      this.writeVInt(1);
    } else {
      this.writeVInt(2);
    }
    this.writeVInt(this.trophies); // Trophies (Own)

    this.writeVInt(0);
    this.writeVInt(-this.trophies); // Trophies (Opponent)

    this.writeVInt(0);
    this.writeVInt(63);

    this.writeVInt(0);
    this.writeVInt(0);
    this.writeVInt(this.ownCrowns); //own crowns
    this.writeVInt(this.opponentCrowns); //opponent crowns
    this.writeVInt(19);
    this.writeVInt(225);
    this.writeVInt(0);
    this.writeVInt(0);
    this.writeVInt(4);
    this.writeVInt(47);
    this.writeVInt(1260);
    this.writeVInt(1293);
    this.writeVInt(11);
    this.writeVInt(1260);

    // Treasure Chest
    this.writeVInt(58);
    this.writeVInt(205);

    this.writeVInt(21);
    this.writeVInt(1);
  }
}

module.exports = BattleResultMessage;
