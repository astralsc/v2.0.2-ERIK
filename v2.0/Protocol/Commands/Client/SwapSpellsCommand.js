const Command = require("../../Command");

class SwapSpellsCommand extends Command {
  constructor(buf) {
    super(buf);
    this.buf = buf;
    this.id = 500;
    if (this.buf) {
      this.client = this.buf.client;
    }
  }

  async decode() {
    this.buf.readVInt();
    this.buf.readVInt();
    this.buf.readVInt();
    this.buf.readVInt();

    this.card = this.buf.readVInt();
    this.slot = this.buf.readByte();
  }

  async process() {
    console.log("======");
    console.log("old: ");
    console.log(this.client.cardstmp);
    const card = parseInt(this.client.cardstmp[this.card]);
    const oldCard = parseInt(
      this.client.user.decks[this.client.user.resources.currentDeck].cards[
        this.slot
      ],
    );

    this.client.user.decks[this.client.user.resources.currentDeck].cards[
      this.slot
    ] = card;

    this.client.cardstmp[this.card] = oldCard.toString();

    console.log("======");
    console.log("new: ");
    console.log(this.client.cardstmp);
  }
}

module.exports = SwapSpellsCommand;
