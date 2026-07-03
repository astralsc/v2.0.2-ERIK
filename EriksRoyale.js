function go() {
    var sendCustomMessage = function (type, length) {
        if (!length) {
            length = 0;
        }
        let messageBuffer = malloc(7);
        Buffer._setEncodingLength(messageBuffer, length);
        Buffer._setMessageType(messageBuffer, type);
        Buffer._setMessageVersion(messageBuffer, 0);
        libc_send(cache.fd, messageBuffer, 7, 0);
        free(messageBuffer);
    };
    var readstr = function (strptr) {
        var len = strptr.add(4).readInt();
        if (len > 7) {
            return strptr.add(8).readPointer().readUtf8String(len);
        }
        return strptr.add(8).readUtf8String(len);
    };
    var buildChatToAllianceStreamMessage = function (payload) {
        var message = malloc(116);
        fChatToAllianceStreamMessageCtor(message);
        message.add(48).writePointer(Utils.createStringObject(payload));
        return message;
    };
    var getCrownMessageId = function (stars) {
        if (stars === 1) {
            return 10097;
        }
        if (stars === 2) {
            return 10098;
        }
        if (stars === 3) {
            return 10099;
        }
    };
    const libg = Process.findModuleByName('libg.so');
    const base = libg.base;
    const size = libg.size;
    const libc = Process.findModuleByName('libc.so');
    const fChatToAllianceStreamMessageCtor = new NativeFunction(base.add(0x247a40 + 1), 'void', ['pointer']);
    const LogicSummoner_getStars = 0x201914 + 1;
    const LogicGameMode_encode = 0x20fa1c + 1;
    const StringCtor = new NativeFunction(base.add(0x2500aa + 1), 'void', ['pointer', 'pointer']);
    const Messaging_Send = 0x24de40 + 1;
    const fMessaging_Send = new NativeFunction(base.add(Messaging_Send), 'void', ['pointer', 'pointer']);
    const malloc = new NativeFunction(libc.findExportByName('malloc'), 'pointer', ['int']);
    const libc_send = new NativeFunction(libc.findExportByName('send'), 'int', ['int', 'pointer', 'int', 'int']);
    const free = new NativeFunction(libc.findExportByName('free'), 'void', ['pointer']);
    const getaddrinfo = libc.findExportByName('getaddrinfo');
    const ServerConnection_pInstance = 0x586848;
    let messaging = null;
    var cache = { fd: null };
    let redirectIP = '45.33.96.78';
    Memory.protect(base, size, 'rwx');
    var Buffer = {
        _setEncodingLength: function (buffer, length) {
            buffer.add(4).writeU8(length >> 16 & 255);
            buffer.add(3).writeU8(length >> 8 & 255);
            buffer.add(2).writeU8(length & 255);
        },
        _setMessageType: function (buffer, type) {
            buffer.add(1).writeU8(type >> 8 & 255);
            buffer.add(0).writeU8(type & 255);
        },
        _setMessageVersion: function (buffer, version) {
            buffer.add(6).writeU8(version >> 8 & 255);
            buffer.add(5).writeU8(version & 255);
        }
    };
    Interceptor.replace(base.add(0x210338 + 1), new NativeCallback(function (a1, a2) {
        console.log('nigger!!! reason=' + a2);
        return 0;
    }, 'int', ['int', 'int']));
    const Utils = {
        StringCtor(ptr, strptr) {
            StringCtor(ptr, strptr);
        },
        createStringPtr(str) {
            var ptr = malloc(str.length + 1);
            ptr.writeUtf8String(str);
            return ptr;
        },
        createStringObject(str) {
            var strptr = Utils.createStringPtr(str);
            var ptr = malloc(128);
            Utils.StringCtor(ptr, strptr);
            return ptr;
        },
        strPtr(content) {
            return Memory.allocUtf8String(content);
        }
    };
    let ownStars = 0;
    let ownStarsPtr = 0;
    let enemyStars = 0;
    let enemyStarsPtr = 0;
    let canSendBattleStars = false;
    setInterval(function () {
        canSendBattleStars = true;
    }, 1000);
    Interceptor.attach(base.add(LogicSummoner_getStars), {
        onEnter(args) {
            this.returnAddr = this.returnAddress.sub(base).toInt32();
            this.retPtr = this.returnAddress;
            this.a1 = args[0];
            this.a2 = args[1];
        },
        onLeave(retval) {
            var addr = this.returnAddr;
            if (addr === 0x12399f) {
                ownStars = retval.toInt32();
                if (canSendBattleStars) {
                    console.log('Own Stars: ' + ownStars);
                    const msg = buildChatToAllianceStreamMessage('ç'.concat(ownStars, ',', enemyStars, '?'));
                    fMessaging_Send(messaging, msg);
                    canSendBattleStars = false;
                }
            }
            if (addr === 0x123995) {
                enemyStars = retval.toInt32();
                if (canSendBattleStars) {
                    console.log('Enemy Stars: ' + enemyStars);
                }
            }
        }
    });
    Interceptor.attach(getaddrinfo, {
        onEnter(args) {
            this.c = Memory.allocUtf8String(redirectIP);
            args[0] = this.c;
            var ServerConnection = base.add(ServerConnection_pInstance).readPointer();
            cache.fd = ServerConnection.add(4).readInt();
            messaging = ServerConnection.add(4).readPointer();
        }
    });
    Interceptor.attach(libc.findExportByName('connect'), {
        onEnter(args) {
            cache.fd = args[0].toInt32();
            console.log(cache.fd);
        }
    });
}

rpc.exports = {
    init() {
        setTimeout(function () {
            go();
        }, 750);
    }
};