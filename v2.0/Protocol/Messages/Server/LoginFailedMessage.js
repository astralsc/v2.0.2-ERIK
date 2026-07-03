const PiranhaMessage = require("../../PiranhaMessage");

class LoginFailedMessage extends PiranhaMessage {
  constructor(client, json) {
    super();
    this.id = 20103;
    this.client = client;
    this.version = 4;
    this.config = json;
  }

  async encode() {
    if (this.config.reason == "patch") {
      this.writeByte(7);
    } else {
      this.writeByte(8);
    }
    this.writeString(global.fingerprintString);
    this.writeString("https://1.com");
    this.writeString("http://an.rcq.com");
    this.writeString("https://eriksroyale.netlify.app");
    this.writeByte(0);
    this.writeByte(0);
    this.writeString("https://2.com");
    this.writeByte(2);
    this.writeString(
      `http://${global.globalIPV4}:${global.CONTENT_SERVER_PORT}`,
    );
    this.writeString(
      `http://${global.globalIPV4}:${global.CONTENT_SERVER_PORT}`,
    );
  }
}

module.exports = LoginFailedMessage;
