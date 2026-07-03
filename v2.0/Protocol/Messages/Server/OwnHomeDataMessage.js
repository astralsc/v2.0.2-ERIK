const PiranhaMessage = require("../../PiranhaMessage");
const cards = require("../../../Utils/Cards");
const chestsjson = require("../../../Utils/chests.json");

const shop = {};

shop.chest = (buffer, index, options) => {
  buffer.writeByte(3); // ITEM TYPE
  buffer.writeByte(0);
  buffer.writeByte(index); // INDEX
  buffer.writeVInt(335);
  buffer.writeByte(options.gold ? options.gold : 0); // GOLD
  buffer.writeByte(5);
  buffer.writeByte(1);
  buffer.writeVInt(19); // SCID HI (CHESTS: 19)
  buffer.writeVInt(options.id); // SCID LO
  buffer.writeByte(options.bought); // BOUGHT
};

shop.card = (buffer, index, options) => {
  buffer.writeByte(1); //TYPE
  buffer.writeByte(1);
  buffer.writeByte(index);
  buffer.writeVInt(335);
  buffer.writeByte(options.gold ? options.gold : 0); // GOLD
  buffer.writeByte(5);
  buffer.writeByte(1);
  buffer.writeVInt(cards.id[options.id].hilo.high); // SCID HI (CHESTS: 19)
  buffer.writeVInt(cards.id[options.id].hilo.low);
  buffer.writeVInt(options.count);
  buffer.writeByte(0);
  buffer.writeByte(0);
};

class OwnHomeDataMessage extends PiranhaMessage {
  constructor(client) {
    super();
    this.id = 24101;
    this.client = client;
    this.version = 0;
  }

  async encode() {
    let user = this.client.user;

    this.writeInt(user.id.high);
    this.writeInt(user.id.low);
    this.writeVInt(127); // CHECKSUM SEED
    this.writeVInt(257);
    this.writeVInt(3250);
    this.writeVInt(168720); // TICK?
    this.writeVInt((Date.now() / 1000) | 0); // UNKNOWN TIMESTAMP
    this.writeByte(1);

    this.writeByte(user.decks.length); // DECKS COUNT

    for (let deck of user.decks) {
      this.writeByte(deck.cards.length); // CARDS COUNT
      for (let card of deck.cards) {
        this.writeVInt(cards.id[card].scid);
      }
    }

    this.writeByte(-1);

    // CURRENT DECK
    for (let card of user.decks[user.resources.currentDeck].cards) {
      this.writeVInt(parseInt(card));
      this.writeVInt(user.cards[card][0] - 1); // LEVEL
      this.writeVInt(0);
      this.writeVInt(user.cards[card][1]); // COUNT
      this.writeVInt(0);
      this.writeVInt(0);
      this.writeVInt(0);
    }

    let userCardsIds = Object.keys(user.cards);
    this.writeVInt(userCardsIds.length);
    for (let card of userCardsIds) {
      this.writeVInt(parseInt(card));
      this.writeVInt(user.cards[card][0] - 1); // LEVEL
      this.writeVInt(0);
      this.writeVInt(user.cards[card][1]); // COUNT
      this.writeVInt(0);
      this.writeVInt(0);
      this.writeVInt(0);
    }
    this.writeVInt(user.resources.currentDeck);
    this.writeHex(
      "ff0d007f000000008301007f0000000017007f000000008f01007f0000000001007f0000000007007f000000009301007f000000000c007f000000001d9e137f",
    );
    this.writeVInt(1511717732); // TS
    this.writeByte(1);
    this.writeByte(0);

    let events = [
      {
        id: 100,
        name: "2v2 Button",
        startTime: 1503298800,
        endTime: 1523298800,
        visibleOn: 1503298800,
        type: 8,
        json: JSON.stringify({
          HideTimer: true,
          HidePopupTimer: true,
          ExtraGameModeChance: 0,
          GameMode: "TeamVsTeamLadder",
          ExtraGameMode: "None",
        }),
      },
    ];

    this.writeVInt(events.length);

    for (let event of events) {
      this.writeVInt(event.id);
      this.writeString(event.name);
      this.writeByte(event.type);
      this.writeVInt(event.startTime);
      this.writeVInt(event.endTime);
      this.writeVInt(event.visibleOn);
      this.writeInt(0);
      this.writeInt(0);
      this.writeString(event.name);
      this.writeString(event.json);
    }

    this.writeInt(0); // 4x 0x00
    this.writeByte(2);
    this.writeByte(0);
    this.writeVInt(1511424000); // TIMESTAMP
    this.writeInt(0); // 4x 0x00
    this.writeVInt(0); // C. LENGTH (RRSINT-BYTE)
    this.writeVInt(0); // C. LENGTH (RRSINT-BYTE-BYTE)
    this.writeByte(2);
    this.writeString("{}"); // CARD RELEASE Ex. {"ID":"CARD_RELEASE_V2","Params":{"Cards":[{"Spell":"SkeletonBalloon","Date":"20171117"}]}}
    this.writeByte(4);

    this.writeString("{}"); // CLAN CHEST ex. {"ID":"CLAN_CHEST","Params":{"StartTime":"20170317T070000.000Z","ActiveDuration":"P3dT0h","InactiveDuration":"P4dT0h","ChestType":["ClanCrowns"]}}

    this.writeByte(0);
    this.writeByte(4);

    // CHESTS
    for (let i = 0; i < user.chests.length; i++) {
      let chest = user.chests[i];
      if (i === 0) this.writeByte(1 << (chest.slot - 1));
      else this.writeByte(8 << (chest.slot - user.chests[i - 1].slot - 1));

      this.writeByte(19); // CHEST SCID
      this.writeVInt(chest.id);
      this.writeByte(chest.status);
      if (chest.status === 8) {
        //OPENING CHEST
        this.writeVInt(80400);
        this.writeVInt(10000);
        this.writeVInt(((Date.now() / 1000) | 0) + 120);
      }
      this.writeVInt(chest.slot); // ID
      this.writeByte(1);
      this.writeByte(chest.slot - 1);
      this.writeByte(0);
      this.writeByte(0);
    }

    this.writeByte(0);

    this.writeByte(0);
    this.writeByte(0);
    this.writeByte(-64);

    this.writeByte(0);
    this.writeByte(0);
    this.writeByte(-64);

    this.writeHex("000000000000000000000000070000007fb0d40380d3c701");
    this.writeVInt(((Date.now() / 1000) | 0) + 100); // CURRENT TS ??
    this.writeInt(127);

    this.writeByte(user.username !== "" ? 3 : 1); //1 name set, 2 upggrade card tutorial 3 name already set
    //this.writeByte(3); //for now

    this.writeInt(0);
    this.writeInt(2);

    this.writeVInt(user.stats.level); // OLD LEVEL (ANIMATION)
    this.writeByte(54);
    this.writeVInt(
      user.stats.arena < 11 ? user.stats.arena + 1 : user.stats.arena,
    ); // OLD ARENA
    this.writeByte(6);
    this.writeVInt(335);
    this.writeByte(1);

    this.writeVInt(72000); // NEXT SHOP UPDATE (TICKS) 1 second = 20 ticks
    this.writeVInt(72000);
    this.writeVInt(1512172799); // UNKNOWN TIMESTAMP (NIGHT AT 11:59 PM)

    this.writeHex(
      "0000007f00007f00007f13109605000000000000011a15010a00000000f807",
    );

    // CURRENT DECK
    for (let card of user.decks[1].cards) {
      this.writeVInt(card);
      this.writeVInt(user.cards[card][0] - 1); // LEVEL
      this.writeVInt(0);
      this.writeVInt(user.cards[card][1]); // COUNT
      this.writeVInt(0);
      this.writeVInt(0);
      this.writeVInt(0);
    }

    this.writeVInt(0); // C.LENGTH (CARDS => SCID)
    this.writeVInt(0); // C.LENGTH (CARDS => SCID)
    this.writeVInt(0); // C.LENGTH (CARDS => SCID)

    this.writeHex(
      "0000058cd2f83e8dd2f83e8ed2f83e89d2f83e8ad2f83e0800019081a1fe0b000201018ae6bf3302018a8919005a17ca0c5a1bbe8cb2be9d0a000000000000000000010000",
    );
    this.writeVInt(10);
    this.writeVInt(25);
    this.writeVInt(50);
    this.writeHex("01008f050003010004");

    this.writeVInt(chestsjson.ids.arenas[9].magical);
    this.writeInt(0);
    this.writeInt(0);
    this.writeInt(0);
    this.writeInt(13);
    this.writeHex("0202040104020200040306010400020004000204050304000502000008");

    this.writeByte(0); //0//3) //SHOP COUNT //1 temporary
    /*shop.card(buffer, 0, { id: 20, count: 0, gold: 0 })//
    shop.chest(buffer, 1, { id: chestsjson.ids.quests.legendary, gold: 20, bought: 0 })*/
    // shop.chest(this, 1, { id: chestsjson.ids.special.legendary, gold: 20, bought: 1 })
    // shop.chest(this, 1, { id: chestsjson.ids.special.legendary, gold: 20, bought: 1 })
    // shop.chest(this, 1, { id: chestsjson.ids.special.legendary, gold: 20, bought: 1 })

    this.writeByte(0);

    this.writeByte(0); //EVENT COMPONENT FOR SHOP

    this.writeInt(127);
    this.writeVInt(1109);
    this.writeByte(0);

    for (let i = 0; i < 3; i++) {
      this.writeVInt(user.id.high);
      this.writeVInt(user.id.low);
    }

    this.writeString(user.username);
    this.writeByte(0); // NAME CHANGED

    this.writeVInt(user.stats.arena + 1);
    this.writeVInt(user.stats.trophies);
    this.writeVInt(235); // UNKNOWN
    this.writeVInt(2380);
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

    this.writeVInt(16); // COMPONENT LENGTH

    this.writeByte(5);
    this.writeByte(1);
    this.writeVInt(user.resources.gold);

    this.writeByte(5);
    this.writeByte(2);
    this.writeVInt(150); // WON CHESTS

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
    this.writeByte(12);
    this.writeVInt(419); // NEXT SUPERMAGICAL

    this.writeByte(5);
    this.writeByte(13);
    this.writeVInt(0);

    this.writeByte(5);
    this.writeByte(14);
    this.writeVInt(0); // DAILY REWARDS

    this.writeByte(5);
    this.writeByte(15);
    this.writeVInt(0); // NEXT LEGENDARY

    this.writeByte(5);
    this.writeByte(16);
    this.writeVInt(1040); // SHOP DAYS

    this.writeByte(5);
    this.writeByte(17);
    this.writeVInt(1044); // SHOP LEGENDARY

    this.writeByte(5);
    this.writeByte(18);
    this.writeVInt(1043); // SHOP SM

    this.writeByte(5);
    this.writeByte(19);
    this.writeVInt(1049); // SHOP ARENA PACK

    this.writeByte(5);
    this.writeByte(22);
    this.writeVInt(1042); // SHOP EPIC

    this.writeByte(5);
    this.writeByte(28);
    this.writeByte(0);

    this.writeByte(5);
    this.writeByte(29);
    this.writeByte(72000006); // LAST GAME MODE

    this.writeByte(0);
    this.writeVInt(0); // C. LENGTH (BYTE-BYTE-RRSINT32) (ACHIEVEMENTS)
    this.writeVInt(0); // C. LENGTH (BYTE-BYTE-RRSINT32) (ACHIEVEMENTS)

    this.writeVInt(9); // C. LENGTH

    this.writeByte(5);
    this.writeByte(6);
    this.writeVInt(user.stats.record); // U. Record

    this.writeByte(5);
    this.writeByte(7);
    this.writeVInt(125); // 3 Crown Wins

    this.writeByte(5);
    this.writeByte(8);
    this.writeVInt(userCardsIds.length);

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

    this.writeByte(
      user.clan.tag
        ? user.username !== ""
          ? 9
          : 8
        : user.username !== ""
          ? 7
          : 6,
    ); // HAS CLAN ? 9 : Yes, 1: No
    //this.writeByte(6); //for now

    if (user.clan.tag) {
      let tag = tag2id.tag2id(user.clan.tag);
      this.writeVInt(tag.high);
      this.writeVInt(tag.low); // CLAN ID
      this.writeString(user.clan.name); //CLAN NAME
      this.writeVInt(user.clan.badge + 1); // CLAN BADGE (+1 because it's id and not scid)
      this.writeByte(user.clan.role); // PLAYER ROLE
    }

    this.writeVInt(342); // BATTLES PLAYED
    this.writeVInt(0); // TOURNEY BATTLES PLAYED
    this.writeVInt(0);

    this.writeVInt(193); // WINS
    this.writeVInt(128); // LOSES

    this.writeHex("7d08010000000092b2d8b602");
    this.writeVInt((Date.now() / 1000) | 0);
    this.writeHex("a1ef1a");
  }
}

module.exports = OwnHomeDataMessage;

/*
return buffer.buffer.slice(0, buffer.offset)
}

module.exports.callback = session => {
    session.cardsBuf = Object.keys(session.user.cards)
}


*/
