const PiranhaMessage = require("../../PiranhaMessage");
const cards = require("../../../Utils/Cards");

class AvatarStreamEntryMessage extends PiranhaMessage {
  constructor(client) {
    super();
    this.id = 24113;
    this.client = client;
    this.version = 0;
  }

  async encode() {
    let user = {
      id: { high: 0, low: 1 },
      username: "Player",

      decks: [
        { cards: [1, 2, 3, 4, 5, 6, 7, 8] },
        { cards: [1, 2, 3, 4, 5, 6, 7, 8] },
        { cards: [1, 2, 3, 4, 5, 6, 7, 8] },
        { cards: [1, 2, 3, 4, 5, 6, 7, 8] },
        { cards: [1, 2, 3, 4, 5, 6, 7, 8] },
      ],

      cards: {
        1: [1, 1],
        2: [1, 1],
        3: [1, 1],
        4: [1, 1],
        5: [1, 1],
        6: [1, 1],
        7: [1, 1],
        8: [1, 1],
        9: [1, 1],
      },

      resources: {
        gold: 100000,
        gems: 1000,
        currentDeck: 0,
      },

      chests: [],

      stats: {
        level: 12,
        exp: 0,
        arena: 8,
        trophies: 0,
        record: 0,
      },

      clan: {},
    };

    this.writeVInt(8);
    this.writeVInt(0);
    this.writeVInt(-128);

    // DECK
    for (let i = 0; i <= 7; i++) {
      let card = user.decks[user.resources.currentDeck].cards[i];
      this.writeVInt(card); // CARD ID
      this.writeVInt(user.cards[card][0]); // LEVEL
      this.writeVInt(0);
      this.writeVInt(user.cards[card][1]); // COUNT
      this.writeVInt(0);
      this.writeVInt(0);
      this.writeVInt(0);
    }

    this.writeInt(user.id.high);
    this.writeInt(user.id.low);

    this.writeByte(0); // IF 1 => C. (RRSINT-RRSINT)

    this.writeVInt(0); // SEASONS COUNT
    /* SEASONS COMPONENT */

    this.writeByte(1);

    for (let i = 0; i < 3; i++) {
      this.writeVInt(user.id.high);
      this.writeVInt(user.id.low);
    }

    this.writeString(user.username);
    this.writeByte(0); // NAME CHANGED

    this.writeVInt(user.stats.arena + 1);
    this.writeVInt(user.stats.trophies);
    this.writeVInt(0); // UNKNOWN
    this.writeVInt(0);
    this.writeVInt(0); // LEGEND TROPHIES
    this.writeVInt(0); // SEASON RECORD
    this.writeVInt(0);
    this.writeVInt(0); // BEST SEASON RANK
    this.writeVInt(0); // BEST SEASON TROPHIES

    this.writeByte(0);
    this.writeByte(37);

    this.writeVInt(0); // PREVIOUS SEASON RANK
    this.writeVInt(0); // PREVIOUS SEASON TROPHIES
    this.writeVInt(0); // PREVIOUS SEASON RECORD

    this.writeVInt(0);
    this.writeByte(0);
    this.writeByte(8);

    this.writeVInt(7); // COMPONENT LENGTH

    this.writeByte(5);
    this.writeByte(1);
    this.writeVInt(user.resources.gold);

    this.writeByte(5);
    this.writeByte(2);
    this.writeVInt(0); // WON CHESTS

    this.writeByte(5);
    this.writeByte(3);
    this.writeVInt(0);

    this.writeByte(5);
    this.writeByte(4);
    this.writeVInt(0);

    this.writeByte(5);
    this.writeByte(5);
    this.writeVInt(user.resources.gold);

    this.writeByte(5);
    this.writeByte(13);
    this.writeVInt(0);

    this.writeByte(5);
    this.writeByte(28);
    this.writeByte(0);

    this.writeByte(0);
    this.writeVInt(0); // C. LENGTH (BYTE-BYTE-RRSINT32)
    this.writeVInt(0); // C. LENGTH (BYTE-BYTE-RRSINT32)

    this.writeVInt(9); // C. LENGTH

    this.writeByte(5);
    this.writeByte(6);
    this.writeVInt(user.stats.record); // U. Record

    this.writeByte(5);
    this.writeByte(7);
    this.writeVInt(125); // 3 Crown Wins

    this.writeByte(5);
    this.writeByte(8);
    this.writeVInt(Object.keys(user.cards).length);

    this.writeByte(5);
    this.writeByte(9);
    this.writeVInt(cards.id[1].scid); // FAVOURITE CARD

    this.writeByte(5);
    this.writeByte(10);
    this.writeVInt(5000); // DONATIONS

    this.writeByte(5);
    this.writeByte(11);
    this.writeVInt(10);

    this.writeByte(5);
    this.writeByte(20);
    this.writeVInt(6); // SURVIVAL MAX WINS

    this.writeByte(5);
    this.writeByte(21);
    this.writeVInt(142);

    this.writeByte(5);
    this.writeByte(27);
    this.writeVInt(8); // MAX ARENA

    this.writeVInt(0); // C.LENGTH - CARDS (3x RRSINT32)
    this.writeByte(0); // IF 1 => C. (RRSINT-BYTE-BYTE)
    this.writeByte(0);

    this.writeVInt(user.resources.gems);
    this.writeVInt(user.resources.gems);
    this.writeVInt(user.stats.exp);
    this.writeVInt(user.stats.level);
    this.writeVInt(0);

    this.writeByte(user.clan.tag ? 9 : 1); // HAS CLAN ? 9 : Yes, 1: No
    if (user.clan.tag) {
      let tag = tag2id.tag2id(user.clan.tag);
      this.writeVInt(tag.high);
      this.writeVInt(tag.low); // CLAN ID
      this.writeString(user.clan.name); //CLAN NAME
      this.writeVInt(user.clan.badge); // CLAN BADGE
      this.writeByte(user.clan.role); // PLAYER ROLE
    }

    this.writeVInt(0); // BATTLES PLAYED
    this.writeVInt(0); // TOURNEY BATTLES PLAYED
    this.writeVInt(0);

    this.writeVInt(0); // WINS
    this.writeVInt(0); // LOSES
    this.writeHex(
      "7f90023c00000002099e94960c099e94960c099e94960c000000007f0100000000000000000027000000000008090501a9010502010503010505a901050d00050e0005108e09051d8888d54405260000033c07063c08063c09060002050806050b27041a00011a01011a03021a0d010000a401a4010001000000000000000001000000010000",
      "hex"
    );
  }
}

module.exports = AvatarStreamEntryMessage;
