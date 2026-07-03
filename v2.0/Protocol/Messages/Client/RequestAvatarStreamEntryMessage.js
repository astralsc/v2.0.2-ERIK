const PiranhaMessage = require('../../PiranhaMessage')
const AvatarStreamEntryMessage = require('../Server/AvatarStreamEntryMessage')

class RequestAvatarStreamEntryMessage extends PiranhaMessage {
    constructor (bytes, client) {
        super(bytes)
        this.id = 14113
        this.client = client
        this.version = 0
    }

    async process() {
        await new AvatarStreamEntryMessage(this.client).send();
    }
}

module.exports = RequestAvatarStreamEntryMessage
