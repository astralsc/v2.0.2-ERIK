const PiranhaMessage = require("../../PiranhaMessage");
const towers = require("../../../Utils/towers.json");

class SectorStateMessage extends PiranhaMessage {
  constructor(client, player1client, player2client) {
    super();
    this.id = 21903;
    this.client = client;
    this.version = 0;
    this.player1client = player1client;
    this.player2client = player2client;
  }

  async encode() {
    let player1user = this.player1client.user;

    let player2user = this.player2client.user;

    this.writeByte(0); // UNCOMPRESSED
    this.writeHex("2a");
    this.writeVInt(2);
    this.writeVInt(player1user.id.high);
    this.writeVInt(player1user.id.low);
    this.writeVInt(player1user.id.high);
    this.writeVInt(player1user.id.low);
    this.writeVInt(player1user.id.high);
    this.writeVInt(player1user.id.low);
    this.writeString(player1user.username);
    this.writeHex(
      "029b0200000000000000240000000000080000000000000000070004000000017f050000000102",
    );
    this.writeVInt(player2user.id.high);
    this.writeVInt(player2user.id.low);
    this.writeVInt(player2user.id.high);
    this.writeVInt(player2user.id.low);
    this.writeVInt(player2user.id.high);
    this.writeVInt(player2user.id.low);
    this.writeString(player2user.username);
    this.writeHex("021d00000000000000240000000000080000000000000000060001");
    this.writeHex("0000000000050000000fe2bda50b0b0000a79b0c05030200");
    this.writeVInt(6);
    this.writeVInt(player1user.id.high);
    this.writeVInt(player1user.id.low);
    this.writeByte(0);
    this.writeVInt(player2user.id.high);
    this.writeVInt(player2user.id.low);
    this.writeHex("0000000000000000000101000007");
    this.writeHex(
      "00000000000000b903c77c0000067a06230123012301230123002300010001000001050005010502050305040505",
    );
    /** TOWERS */
    //Own right tower
    this.writeVInt(player1user.stats.level - 1); //Level
    this.writeByte(13);
    this.writeVInt(towers.coordinates.own.right.x);
    this.writeVInt(towers.coordinates.own.right.y);
    this.writeHex("00007f00c07c0000020000000000");
    // Enemy right tower
    this.writeVInt(player2user.stats.level - 1); //Level
    this.writeByte(13);
    this.writeVInt(towers.coordinates.enemy.right.x);
    this.writeVInt(towers.coordinates.enemy.right.y);
    this.writeHex("00007f0080040000010000000000");
    //Own left tower
    this.writeVInt(player1user.stats.level - 1); //Level
    this.writeByte(13);
    this.writeVInt(towers.coordinates.own.left.x);
    this.writeVInt(towers.coordinates.own.left.y);
    this.writeHex("00007f00c07c0000010000000000");
    //Enemy left tower
    this.writeVInt(player2user.stats.level - 1); //Level
    this.writeByte(13);
    this.writeVInt(towers.coordinates.enemy.left.x);
    this.writeVInt(towers.coordinates.enemy.left.y);
    this.writeHex("00007f0080040000020000000000");
    //Enemy king tower
    this.writeVInt(player2user.stats.level - 1); //Level
    this.writeByte(13);
    this.writeVInt(towers.coordinates.enemy.king.x);
    this.writeVInt(towers.coordinates.enemy.king.y);
    this.writeHex(
      "00007f00800400000000000000000d0404017b060402010703007f7f000000000500000000007f7f7f7f7f7f7f7f00000000",
    );
    // Own King tower
    this.writeVInt(player1user.stats.level - 1); // level
    this.writeByte(13);
    this.writeVInt(towers.coordinates.own.king.x);
    this.writeVInt(towers.coordinates.own.king.y);
    this.writeHex(
      "00007f00c07c00000000000000000d04027f03010400030607007f7f000000000500000000007f7f7f7f7f7f7f7f000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
    );
    this.writeByte(0);
    this.writeVInt(towers.hp[player1user.stats.level].right);
    this.writeByte(0);
    this.writeVInt(towers.hp[player2user.stats.level].right);
    this.writeByte(0);
    this.writeVInt(towers.hp[player1user.stats.level].left);
    this.writeByte(0);
    this.writeVInt(towers.hp[player2user.stats.level].left);
    this.writeByte(0);
    this.writeVInt(towers.hp[player2user.stats.level].king);
    this.writeByte(0);
    this.writeVInt(towers.hp[player1user.stats.level].king);
    this.writeHex(
      "0000000000000000a401a4010000000000000000a401a4010000000000000000a401a4010000000000000000a401a4010000000000000000a401a4010000000000000000a401a401",
    );
    this.writeByte(0);
    this.writeByte(-1);
    this.writeByte(1);
    for (let card of player1user.decks[player1user.resources.currentDeck]
      .cards) {
      this.writeVInt(parseInt(card));
      this.writeVInt(player1user.cards[card][0] - 1); // LEVEL
    }

    this.writeByte(0);
    this.writeByte(-2);
    this.writeByte(3);
    for (let card of player2user.decks[player2user.resources.currentDeck]
      .cards) {
      this.writeVInt(parseInt(card));
      this.writeVInt(player2user.cards[card][0] - 1); // LEVEL
    }

    this.writeHex("0000050602020402010300000000000000000c000000add9a79d0300");
  }
}

module.exports = SectorStateMessage;
