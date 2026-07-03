const PiranhaMessage = require("../../PiranhaMessage");
const towers = require("../../../Utils/towers.json");

class TrainSectorStateMessage extends PiranhaMessage {
  constructor(client) {
    super();
    this.id = 21903;
    this.client = client;
    this.version = 0;
  }

  async encode() {
    let user = this.client.user;

    this.writeByte(0); // UNCOMPRESSED
    this.writeHex(
      "2a027f7f7f7f0000000000000200000000000000000000000000000800000000000000000100000000000000000000000102",
    );
    this.writeVInt(user.id.high);
    this.writeVInt(user.id.low);
    this.writeVInt(user.id.high);
    this.writeVInt(user.id.low);
    this.writeVInt(user.id.high);
    this.writeVInt(user.id.low);
    this.writeString(user.username);
    this.writeHex(
      "0200000000000000002400000000000800000000000000000600903f960900b916901404a9020c000000002b002185baa9a50b0b005b71545fac9380a905020212017f7f00",
    );
    this.writeVInt(user.id.high);
    this.writeVInt(user.id.low);
    this.writeHex(
      "0000000000000000000701000009000000010000008e02f27d0000067a06230123012301230123002300010001000001050005010502050305040505",
    );

    /** TOWERS */
    //Own right tower
    this.writeVInt(user.stats.level - 1); //Level
    this.writeByte(13);
    this.writeVInt(towers.coordinates.own.right.x);
    this.writeVInt(towers.coordinates.own.right.y);
    this.writeHex("00007f00c07c0000020000000000");
    // Enemy right tower
    this.writeVInt(user.stats.level - 1); //Level
    this.writeByte(13);
    this.writeVInt(towers.coordinates.enemy.right.x);
    this.writeVInt(towers.coordinates.enemy.right.y);
    this.writeHex("00007f0080040000010000000000");
    //Own left tower
    this.writeVInt(user.stats.level - 1); //Level
    this.writeByte(13);
    this.writeVInt(towers.coordinates.own.left.x);
    this.writeVInt(towers.coordinates.own.left.y);
    this.writeHex("00007f00c07c0000010000000000");
    //Enemy left tower
    this.writeVInt(user.stats.level - 1); //Level
    this.writeByte(13);
    this.writeVInt(towers.coordinates.enemy.left.x);
    this.writeVInt(towers.coordinates.enemy.left.y);
    this.writeHex("00007f0080040000020000000000");
    //Enemy king tower
    this.writeVInt(user.stats.level - 1); //Level
    this.writeByte(13);
    this.writeVInt(towers.coordinates.enemy.king.x);
    this.writeVInt(towers.coordinates.enemy.king.y);
    this.writeHex(
      "00007f00800400000000000000000d0404017b060402010703007f7f000000000500000000007f7f7f7f7f7f7f7f00000000",
    );
    // Own King tower
    this.writeVInt(user.stats.level - 1); // level
    this.writeByte(13);
    this.writeVInt(towers.coordinates.own.king.x);
    this.writeVInt(towers.coordinates.own.king.y);
    this.writeHex(
      "00007f00c07c00000000000000000d04027f03010400030607007f7f000000000500000000007f7f7f7f7f7f7f7f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    );
    this.writeByte(0);
    this.writeVInt(towers.hp[user.stats.level].right);
    this.writeByte(0);
    this.writeVInt(towers.hp[user.stats.level].right);
    this.writeByte(0);
    this.writeVInt(towers.hp[user.stats.level].left);
    this.writeByte(0);
    this.writeVInt(towers.hp[user.stats.level].left);
    this.writeByte(0);
    this.writeVInt(towers.hp[user.stats.level].king);
    this.writeByte(0);
    this.writeVInt(towers.hp[user.stats.level].king);

    this.writeHex(
      "0000000000000000a401a4010000000000000000a401a4010000000000000000a401a4010000000000000000a401a4010000000000000000a401a4010000000000000000a401a40100ff0186010814083a0629069a01031b0018001e0000fe03",
    );
    for (let i = 0; i < 8; i++) {
      let card = user.decks[user.resources.currentDeck].cards[i];
      this.writeVInt(card);
      this.writeVInt(user.cards[card][0] - 1); // Level - 1
    }
    this.writeHex("0000050602020402010300000000000000000c00000093df85c80800");
  }
}

module.exports = TrainSectorStateMessage;
