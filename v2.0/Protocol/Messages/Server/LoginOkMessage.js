const PiranhaMessage = require("../../PiranhaMessage");

class LoginOkMessage extends PiranhaMessage {
  constructor(client) {
    super();
    this.id = 20104;
    this.client = client;
    this.version = 0;
  }

  async encode() {
    let user = this.client.user;

    this.writeInt(user.id.high);
    this.writeInt(user.id.low);
    this.writeInt(user.id.high);
    this.writeInt(user.id.low);
    this.writeString(user.token);
    this.writeString("");
    this.writeString("");
    this.writeVInt(3);
    this.writeVInt(193);
    this.writeVInt(193);
    this.writeVInt(14);
    this.writeString("prod");
    this.writeVInt(1);
    this.writeVInt(0);
    this.writeVInt(0);
    this.writeString("1475268786112433");
    this.writeString(((Date.now() / 1000) | 0).toString());
    this.writeString(((Date.now() / 1000) | 0).toString());
    this.writeByte(0);
    this.writeString("");
    this.writeString("");
    this.writeString("");
    this.writeString("ES");
    this.writeString("Paradise");
    this.writeString(
      "http://7166046b142482e67b30-2a63f4436c967aa7d355061bd0d924a1.r65.cf1.rackcdn.com",
    );
    this.writeString("https://event-assets.clashroyale.com");
    this.writeByte(1);
  }
}

module.exports = LoginOkMessage;
