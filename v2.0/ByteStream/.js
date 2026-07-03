function go() {
  const libg = Process.findModuleByName("libg.so");
  const base = libg.base;
  const size = libg.size;
  const libc = Process.findModuleByName("libc.so");

  //ChatToAllianceStreamMessage::ChatToAllianceStreamMessage - sub_247A40

  const fChatToAllianceStreamMessageCtor = new NativeFunction(
    base.add(0x247a40 + 1),
    "void",
    ["pointer"],
  );

  const LogicSummoner_getStars = 0x201914 + 1;

  const LogicGameMode_encode = 0x20fa1c + 1;

  const StringCtor = new NativeFunction(base.add(0x2500aa + 1), "void", [
    "pointer",
    "pointer",
  ]);

  const Messaging_Send = 0x24de40 + 1;

  const fMessaging_Send = new NativeFunction(base.add(Messaging_Send), "void", [
    "pointer",
    "pointer",
  ]);

  const malloc = new NativeFunction(
    libc.findExportByName("malloc"),
    "pointer",
    ["int"],
  );
  const libc_send = new NativeFunction(libc.findExportByName("send"), "int", [
    "int",
    "pointer",
    "int",
    "int",
  ]);
  const free = new NativeFunction(libc.findExportByName("free"), "void", [
    "pointer",
  ]);
  const getaddrinfo = libc.findExportByName("getaddrinfo");

  const ServerConnection_pInstance = 0x59cbf0;

  //var ntohs = new NativeFunction(Module.findExportByName('libc.so', 'ntohs'), 'uint16', ['uint16']);

  var cache = { fd: null };

  let redirectIP = "10.0.2.2";

  Memory.protect(base, size, "rwx");

  var Buffer = {
    _setEncodingLength: function (buffer, length) {
      console.log(buffer);
      buffer.add(2).writeU8((length >> 16) & 0xff);
      buffer.add(3).writeU8((length >> 8) & 0xff);
      buffer.add(4).writeU8(length & 0xff);
    },
    _setMessageType: function (buffer, type) {
      buffer.add(0).writeU8((type >> 8) & 0xff);
      buffer.add(1).writeU8(type & 0xff);
    },
    _setMessageVersion: function (buffer, version) {
      buffer.add(5).writeU8((version >> 8) & 0xff);
      buffer.add(6).writeU8(version & 0xff);
    },
  };

  function sendCustomMessage(type, length = 0) {
    var messageBuffer = malloc(7);
    Buffer._setEncodingLength(messageBuffer, length);
    Buffer._setMessageType(messageBuffer, type);
    Buffer._setMessageVersion(messageBuffer, 0);
    libc_send(cache.fd, messageBuffer, 7, 0);
    free(messageBuffer);
  }

  function getCrownMessageId(stars) {
    if (stars === 1) return 10097;
    if (stars === 2) return 10098;
    if (stars === 3) return 10099;
  }

  let ownStars = 0;
  let enemyStars = 0;

  let canSendBattleStars = false;

  setInterval(() => {
    canSendBattleStars = true;
  }, 1000);

  ///case 14315:
  ///v171 = operator new(0x34u);
  ///result = ChatToAllianceStreamMessage::ChatToAllianceStreamMessage(v171);

  // LogicSummoner::getStars called by CombatHUD::updateGaindedStars
  Interceptor.attach(base.add(LogicSummoner_getStars), {
    onEnter(args) {
      this.returnAddr = this.returnAddress.sub(base).toInt32();
    },
    onLeave(retval) {
      const addr = this.returnAddr;
      switch (addr) {
        case 1194399: // CombatHUD::updateGaindedStars 1st entry
          ownStars = retval.toInt32();
          if (canSendBattleStars) {
            canSendBattleStars = false;
            console.log("Own Stars: " + ownStars);
            /*let msg = buildChatToAllianceStreamMessage(`{${ownStars},${enemyStars}}`);
					fMessaging_Send(messaging, msg);
					canSendBattleStars = false;*/
            if (ownStars > 0) {
              sendCustomMessage(getCrownMessageId(ownStars));
            }
          }
          break;
        case 1194389: // CombatHUD::updateGaindedStars 2nd entry
          enemyStars = retval.toInt32();
          if (canSendBattleStars) {
            console.log("Enemy Stars: " + enemyStars);
            /*let msg = buildChatToAllianceStreamMessage(`{${ownStars},${enemyStars}}`);
					fMessaging_Send(messaging, msg);
					canSendBattleStars = false;*/
            //canSendBattleStars = false;
          }
          break;
      }
    },
  });

  Interceptor.replace(
    base.add(0x7f3e8 + 1),
    new NativeCallback(
      function () {
        return -1; // frida protection bypass
      },
      "int",
      [],
    ),
  );

  Interceptor.replace(
    base.add(0x210338 + 1),
    new NativeCallback(
      function () {
        return -1; // frida protection bypass
      },
      "int",
      [],
    ),
  );

  /*Interceptor.attach(base.add(0x7EED8 + 1), { //connect
	onEnter: function(args) {
		//cache.fd = args[0].toInt32();
	}
});*/

  /*const openPtr = base.add(0x7EFB0);
Interceptor.attach(openPtr, {
  onEnter(args) {
    this.path = args[0].readCString();
    if (this.path.includes("/proc/self/maps")) {
      this.hide = true;
    }
  }
});*/

  const readPtr = base.add(0x7f3f4);
  Interceptor.attach(readPtr, {
    onLeave(retval) {
      retval.replace(-1);
    },
  });

  /*Interceptor.attach(base.add(0x24B0F8 + 1), { // instruction after socket()
	  onEnter() {
		console.log("r5 int32 =", this.context.r5.toInt32());
		cache.fd = this.context.r5.toInt32();
	  }
	}
);*/

  Interceptor.attach(getaddrinfo, {
    onEnter(args) {
      this.c = Memory.allocUtf8String(redirectIP);
      args[0] = this.c;
    },
  });

  Interceptor.attach(libc.findExportByName("connect"), {
    // instruction after socket()
    onEnter(args) {
      //console.log("r5 int32 =", args[0].toInt32());
      cache.fd = args[0].toInt32();
      console.log(cache.fd);
    },
  });
}

rpc.exports = {
  init() {
    setTimeout(() => {
      go();
    }, 750);
  },
};
