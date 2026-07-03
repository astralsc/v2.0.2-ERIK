const PiranhaMessage = require("../../PiranhaMessage");

class KeepAliveOkMessage extends PiranhaMessage {
  constructor(client) {
    super();
    this.id = 24304;
    this.client = client;
    this.version = 0;
  }

  async encode() {
    let clans = [
      {
        id: {
          high: 0,
          low: 1,
        },
        name: "i'm a Clan",
        description: "",
        badge: 4,
        access: 1,
        memberCount: 67,
        trophies: 6767,
        requiredTrophies: 1200,
        donations: 0,
        region: 0,
      },
    ];

    for (let i = 0; i < 199; i++) {
      clans.push(clans[0]);
    }

    this.writeVInt(clans.length);

    for (let i = 0; i < clans.length; i++) {
      this.writeInt(clans[i].id.high);
      this.writeInt(clans[i].id.low);
      this.writeString(clans[i].name); //NAME
      this.writeVInt(16);
      this.writeVInt(clans[i].badge); //BADGE
      this.writeByte(clans[i].access); // STATUS
      this.writeByte(clans[i].memberCount); // MEMBERS
      this.writeVInt(clans[i].trophies); //TROPHIES
      this.writeVInt(clans[i].requiredTrophies); //REQUIRED TROPHIES
      this.writeByte(0);
      this.writeByte(0);
      this.writeVInt(0);
      this.writeVInt(100);
      this.writeVInt(clans[i].donations); //DONATIONS
      this.writeVInt(182);
      this.writeByte(2);
      this.writeByte(i);
      this.writeByte(57);
      this.writeVInt(clans[i].region); // REGION
      this.writeByte(0);
    }
  }
}

module.exports = KeepAliveOkMessage;
