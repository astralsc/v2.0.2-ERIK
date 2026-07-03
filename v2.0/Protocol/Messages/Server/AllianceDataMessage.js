const PiranhaMessage = require("../../PiranhaMessage");

class AllianceDataMessage extends PiranhaMessage {
  constructor(client) {
    super();
    this.id = 24301;
    this.client = client;
    this.version = 0;
  }

  async encode() {
    let clan = {
      id: {
        high: 0,
        low: 1,
      },
      name: "i'm a Clan",
      description: "",
      badge: 4,
      access: 1,
      trophies: 6767,
      requiredTrophies: 1200,
      donations: 0,
      region: 0,
      members: [
        {
          id: {
            high: 0,
            low: 1,
          },
          username: "Player",
          arena: 4,
          stats: {
            level: 12,
            exp: 0,
            trophies: 0,
          },
          clanStats: {
            role: 0,
            donations: 0,
          },
        },
      ],
    };

    this.writeInt(clan.id.high);
    this.writeInt(clan.id.low);
    this.writeString(clan.name); //NAME
    this.writeVInt(16);
    this.writeVInt(clan.badge); //BADGE
    this.writeByte(clan.access); // STATUS
    this.writeByte(clan.members.length); // MEMBERS
    this.writeVInt(clan.trophies); //TROPHIES
    this.writeVInt(clan.requiredTrophies); //REQUIRED TROPHIES
    this.writeByte(0);
    this.writeByte(0);
    this.writeVInt(5);
    this.writeVInt(2578);
    this.writeVInt(clan.donations); //DONATIONS
    this.writeVInt(5);
    this.writeByte(0);
    this.writeByte(57);
    this.writeVInt(clan.region); // REGION
    this.writeByte(0);

    this.writeString(clan.description);

    this.writeVInt(clan.members.length);
    if (clan.members.length) {
      for (let i = 0; i < clan.members.length; i++) {
        let member = clan.members[i];

        this.writeInt(member.id.high);
        this.writeInt(member.id.low);
        this.writeString(member.username); // NICK
        this.writeVInt(54); // SCID ARENA
        this.writeVInt(member.arena); ////member[1] arena
        this.writeByte(member.clanStats.role); // ROLE
        this.writeByte(member.level); // LVL
        this.writeVInt(member.stats.trophies); // TROPHIES
        this.writeVInt(member.clanStats.donations); // DONATIONS

        this.writeVInt(15);

        this.writeByte(i + 1); //RANK
        this.writeByte(i); // PREV RANK

        this.writeVInt(0); // CLAN CHEST CROWNS
        this.writeVInt(26126);

        this.writeVInt(-64);
        this.writeVInt(-64);
        this.writeByte(38);
        this.writeByte(5);
        this.writeInt(member.id.high);
        this.writeInt(member.id.low);
      }
    }
    this.writeByte(0);
    this.writeByte(0);
    this.writeByte(0);
    this.writeByte(0);
    this.writeByte(0);
    this.writeVInt(10); // CLAN CHEST CROWNS
  }
}

module.exports = AllianceDataMessage;
