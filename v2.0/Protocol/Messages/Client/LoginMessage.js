const PiranhaMessage = require("../../PiranhaMessage");
const LoginFailedMessage = require("../Server/LoginFailedMessage");
const LoginOkMessage = require("../Server/LoginOkMessage");
const OwnHomeDataMessage = require("../Server/OwnHomeDataMessage");
const cards = require("../../../Utils/Cards");
const fs = require("fs");
const path = require("path");

class LoginMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.client = client;
    this.id = 10101;
    this.version = 0;
  }

  async decode() {
    let json = {};

    json.id = {
      high: this.readInt(),
      low: this.readInt(),
    };
    //json.tag = tag2id.id2tag(json.id.high, json.id.low)

    json.token = this.readString();

    json.version = {};

    json.version.major = this.readVInt();
    json.version.minor = this.readVInt();
    json.version.patch = this.readVInt();

    json.resourceSha = this.readString();

    console.log(json);

    this.json = json;
  }

  async process() {
    // if (
    //   [
    //     "5765c06d5996ebf4a15b258903c3a0de922a57dd",
    //     "6765c06d5996ebf4a15b258903c3a0de922a57dd",
    //     "7728f4fbe305be4abae14ca2edc489fb94385be4",
    //   ].includes(this.json.fingerprintSha)
    // ) {
    //   await new LoginFailedMessage(this.client, { reason: "update" }).send();
    // }
    console.log(global.fingerprintSha);
    if (this.client.updateID !== global.updateID) {
      await new LoginFailedMessage(this.client, { reason: "update" }).send();
      return;
    }
    if (this.json.resourceSha !== global.fingerprintSha) {
      await new LoginFailedMessage(this.client, { reason: "patch" }).send();
      return;
    }

    let playerId = this.json.id;

    if (
      this.json.id === null ||
      this.json.id === undefined ||
      this.json.id.low === 0
    ) {
      playerId = {
        high: 0,
        low: global.newUserId++,
      };
      fs.writeFileSync(
        path.join(global.rootPath, "newUserId.txt"),
        global.newUserId.toString(),
      );
    }
    let databaseuser = global.database.findOneBy({ id: playerId });
    if (databaseuser == null) {
      databaseuser = global.database.create({
        id: playerId,
        username: "",

        token: "yqhbg17myn5emezkpelj8nbsp4h1lyn6nnkeaeq5",

        decks: [
          { cards: [27, 20, 8, 4, 5, 6, 7, 3] },
          { cards: [1, 2, 3, 4, 5, 6, 7, 8] },
          { cards: [1, 2, 3, 4, 5, 6, 7, 8] },
          { cards: [1, 2, 3, 4, 5, 6, 7, 8] },
          { cards: [1, 2, 3, 4, 5, 6, 7, 8] },
        ],

        cards: {},

        resources: {
          gold: 100000,
          gems: 1000,
          currentDeck: 0,
        },

        chests: [],

        stats: {
          level: 1,
          exp: 0,
          arena: 8,
          trophies: 0,
          record: 0,
        },

        clan: {},

        battleCrowns: 0,

        lastLogin: Date.now(),
      });
    }
    this.client.user = databaseuser;
    databaseuser.lastLogin = Date.now();
    global.database.update(databaseuser._systemid, databaseuser);

    let allcards = Object.keys(cards.id);
    for (let i = 0; i < allcards.length; i++) {
      this.client.user.cards[parseInt(allcards[i])] = [1, 1];
    }
    this.client.cardstmp = Object.keys(this.client.user.cards);
    await new LoginOkMessage(this.client).send();
    await new OwnHomeDataMessage(this.client).send();
  }
}

module.exports = LoginMessage;
