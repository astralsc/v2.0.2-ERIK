const fs = require("fs");

class CommandFactory {
  constructor() {
    this.commands = {};

    fs.readdir("./Protocol/Commands/Client", (err, files) => {
      if (err) console.log(err);
      files.forEach((e) => {
        try {
          const Packet = require(`./Commands/Client/${e.replace(".js", "")}`);
          const packetClass = new Packet();

          this.commands[packetClass.id] = Packet;
        } catch (err) {
          console.log(
            `[SERVER] >> A wild error while initializing "${e.replace(
              ".js",
              "",
            )}" packet!`,
          );
          console.log(err);
        }
      });
    });
  }

  handle(id) {
    return this.commands[id];
  }

  getCommands() {
    return Object.keys(this.commands);
  }
}

module.exports = CommandFactory;
