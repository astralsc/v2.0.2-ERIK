const PiranhaMessage = require("../../PiranhaMessage");
const cards = require("../../../Utils/Cards");

class AvatarRankingListMessage extends PiranhaMessage {
  constructor(client) {
    super();
    this.id = 24403;
    this.client = client;
    this.version = 0;
  }

  async encode() {
    var players = global.database.getAll();

    players.sort((a, b) => b.stats.trophies - a.stats.trophies).slice(0, 200);

    var count = players.length;

    this.writeVInt(count);

    for (var i = 0; i < count; i++) {
      var player = players[i];

      this.writeVInt(player.id.high);
      this.writeVInt(player.id.low);
      this.writeString(player.username == "" ? "NoName" : player.username);

      this.writeVInt(i + 1);
      this.writeVInt(player.stats.trophies);
      this.writeVInt(200);

      this.writeVInt(0);
      this.writeVInt(0);
      this.writeVInt(0);

      this.writeVInt(player.stats.level);

      this.writeByte(0);
      this.writeByte(0);
      this.writeByte(0);
      this.writeByte(0);

      this.writeByte(0);
      this.writeByte(0);
      this.writeByte(0);
      this.writeByte(0);

      this.writeByte(0);
      this.writeByte(0);
      this.writeByte(0);
      this.writeByte(0);

      this.writeByte(0);
      this.writeByte(0);
      this.writeByte(0);
      this.writeByte(0);

      this.writeByte(0);
      this.writeByte(0);
      this.writeByte(0);
      this.writeByte(0);

      this.writeString("DE");
      this.writeLong(player.id.high, player.id.low);

      this.writeByte(0);
      this.writeByte(0);
      this.writeByte(0);
      this.writeByte(0);
      this.writeByte(0);

      this.writeByte(0);
      this.writeByte(0);
      this.writeByte(0);

      var info = {
        HasClan: false,
        Id: 0,
        Name: "",
        Badge: 0,
      };

      if (info.HasClan) {
        this.writeBoolean(true);

        this.writeLong(info.Id);
        this.writeString(info.Name);

        this.writeByte(16);
        this.writeVInt(info.Badge);
      }

      this.writeVInt(0); // Has League
    }

    this.writeInt(0);
    this.writeInt(0);
  }
}

module.exports = AvatarRankingListMessage;
