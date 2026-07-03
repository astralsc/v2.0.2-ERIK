const PiranhaMessage = require("../../PiranhaMessage");

class AvaliableServerCommand extends PiranhaMessage {
  constructor(client, commandName, jsonparams) {
    super();
    this.id = 24111;
    this.client = client;
    this.version = 0;
    this.commandName = commandName;
    this.jsonparams = jsonparams;
    this.commandid = null;
  }

  async encode() {
    if (this.commandName === "ChangeAvatarNameCommand") {
      //name = jsonparams.name
      this.commandid = 201;
      this.writeVInt(this.commandid); //cmd id
      this.writeString(this.jsonparams.newName);
      this.writeVInt(0); //nameset
      this.client.user.username = this.jsonparams.newName;
    }
  }
}

module.exports = AvaliableServerCommand;
