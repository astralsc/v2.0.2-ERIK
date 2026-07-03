const PiranhaMessage = require("../../PiranhaMessage");
const AvaliableServerCommand = require("../Server/AvailableServerCommand");

class ChangeAvatarNameMessage extends PiranhaMessage {
  constructor(bytes, client) {
    super(bytes);
    this.id = 10212;
    this.client = client;
    this.version = 0;
  }

  async decode() {
    this.newName = this.readString();
  }

  async process() {
    this.client.user.username = this.newName;
    global.database.update(this.client.user._systemid, this.client.user);
    await new AvaliableServerCommand(this.client, "ChangeAvatarNameCommand", {
      newName: this.newName,
    }).send();
  }
}

module.exports = ChangeAvatarNameMessage;
