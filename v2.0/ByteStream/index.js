const ByteArray = require("./ByteArray");

/**
 * ByteStream
 *
 * For clear communication between client and server.
 *
 */
class ByteStream {
  constructor(data) {
    // eslint-disable-next-line new-cap
    this.buffer = data != null ? data : Buffer.alloc(0);
    this.length = 0;
    this.offset = 0;
    this.bitOffset = 0;
  }

  /**
   *  Reading Int from Bytes
   * @returns { Number } Int
   */
  readInt() {
    this.bitOffset = 0;
    return (
      (this.buffer[this.offset++] << 24) |
      ((this.buffer[this.offset++] << 16) |
        ((this.buffer[this.offset++] << 8) | this.buffer[this.offset++]))
    );
  }

  /**
   * Skip bytes (moves the offset forward)
   * @param {Number} len Number of bytes to skip
   */
  skip(len) {
    this.offset += len;
    this.bitOffset = 0;
  }

  /**
   *  Reading Short from Bytes (`commonly isn't used.`)
   * @returns { Number } Short
   */
  readShort() {
    this.bitOffset = 0;
    return (this.buffer[this.offset++] << 8) | this.buffer[this.offset++];
  }

  readByte() {
    return this.buffer[this.offset++];
  }

  readAll() {
    return this.buffer;
  }

  /**
   * Writing value to Bytes as Short (c`ommonly isn't used`)
   * @param {Number} value Your value to write.
   */
  writeShort(value) {
    this.bitOffset = 0;
    this.ensureCapacity(2);
    this.buffer[this.offset++] = value >> 8;
    this.buffer[this.offset++] = value;
  }

  /**
   * Writing value to Bytes as Int
   * @param {Number} value Your value to write.
   */
  writeInt(value) {
    this.bitOffset = 0;
    this.ensureCapacity(4);
    this.buffer[this.offset++] = value >> 24;
    this.buffer[this.offset++] = value >> 16;
    this.buffer[this.offset++] = value >> 8;
    this.buffer[this.offset++] = value;
  }

  /**
   * Get Bytes in String
   * @returns { String } Bytes in String form (`AA-BB-CC`)
   */
  getHex() {
    return ByteArray.bytesToHex(this.buffer);
  }

  /**
   *  Reading String from Bytes
   *  Supercell format: uint32 length, -1 means empty string.
   * @returns { String } String
   */
  readString() {
    const length = this.readInt();

    if (length === -1) {
      return "";
    }

    if (length > 0 && length < 90000) {
      const stringBytes = this.buffer.slice(this.offset, this.offset + length);
      const string = stringBytes.toString("utf8");
      this.offset += length;
      return string;
    }
    return "";
  }

  /**
   * Reading VarInt from Bytes (Supercell RRS int32)
   * @returns { Number } VarInt
   */
  readVInt() {
    this.bitOffset = 0;
    let c = 0;
    let value = 0;
    let seventh, msb, b;
    do {
      b = this.buffer[this.offset++];
      if (c === 0) {
        seventh = (b & 0x40) >> 6;
        msb = (b & 0x80) >> 7;
        b = b << 1;
        b = b & ~0x181;
        b = b | (msb << 7) | seventh;
      }
      value |= (b & 0x7f) << (7 * c);
      ++c;
    } while ((b & 0x80) !== 0);
    value = ((value >>> 1) ^ -(value & 1)) | 0;
    return value;
  }

  /**
   * Reading 2 VarInts from Bytes
   * @returns { Array<Number> } Commonly CSVID and ReferenceID
   */
  readDataReference() {
    const a1 = this.readVInt();
    return [a1, a1 == 0 ? 0 : this.readVInt()];
  }

  /**
   * Writing values to Bytes as VarInts
   * If value1 is 0, then 2nd value doesn't used
   *
   * @param {Number} value1 Your value to write. Commonly it's a CSVID
   * @param {Number} value2 Your value to write. Commonly it's a ReferenceID
   */
  writeDataReference(value1, value2) {
    if (value1 < 1) {
      this.writeVInt(0);
    } else {
      this.writeVInt(value1);
      this.writeVInt(value2);
    }
  }

  /**
   * Writing value to Bytes as VarInt (Supercell RRS int32)
   * @param {Number} value Your value to write.
   */
  writeVInt(value) {
    this.bitOffset = 0;
    if (value === 0) {
      this.writeByte(0);
      return;
    }

    // ZigZag encoding and unsigned shift
    let v = ((value << 1) ^ (value >> 31)) >>> 0;
    let rotate = true;

    while (v) {
      let b = v & 0x7f;
      if (v >= 0x80) {
        b |= 0x80;
      }
      if (rotate) {
        rotate = false;
        const lsb = b & 0x1;
        const msb = (b & 0x80) >> 7;
        b = b >> 1;
        b = b & ~0xc0;
        b = b | (msb << 7) | (lsb << 6);
      }
      this.writeByte(b);
      v >>>= 7;
    }
  }

  /**
   * Writing value to Bytes as Boolean
   * @param {Boolean} value Your value to write.
   */
  writeBoolean(value) {
    if (this.bitOffset === 0) {
      this.ensureCapacity(1);
      this.buffer[this.offset++] = 0;
    }

    if (value) {
      this.buffer[this.offset - 1] |= 1 << this.bitOffset;
    }

    this.bitOffset = (this.bitOffset + 1) & 7;
  }

  /**
   * Reading Boolean from Bytes
   * @returns { Boolean } Boolean (`true|false`)
   */
  readBoolean() {
    return this.readVInt() >= 1;
  }

  /**
   * Writing value to Bytes as String
   * Supercell format: uint32 length, -1 means empty string.
   * @param {String} value Your value to write.
   */
  writeString(value) {
    if (value == null) {
      this.writeInt(-1);
      return;
    }

    if (typeof value !== "string") {
      value = String(value);
    }

    if (value.length === 0) {
      this.writeInt(-1);
      return;
    }

    if (value.length > 90000) {
      this.writeInt(-1);
      return;
    }

    const buf = Buffer.from(value, "utf8");
    this.writeInt(buf.length);
    this.buffer = Buffer.concat([this.buffer, buf]);
    this.offset += buf.length;
  }

  /**
   * Writing value to Bytes as String (`You can just use writeString()`)
   * @param {String} value Your value to write.
   */
  writeStringReference = this.writeString;

  /**
   * Writing value to Bytes as LongLong (`commonly isn't used`)
   * @param {Number} value Your value to write.
   */
  writeLongLong(value) {
    this.writeInt(value >> 32);
    this.writeInt(value);
  }

  /**
   * Writing values to Bytes as VarInts
   *
   * @param {Number} value1 Your value to write.
   * @param {Number} value2 Your value to write.
   */
  writeLogicLong(value1, value2) {
    this.writeVInt(value1);
    this.writeVInt(value2);
  }

  /**
   * Reading 2 VarInts from Bytes
   * @returns { Array<Number> } LogicLong VarInts
   */
  readLogicLong() {
    return [this.readVInt(), this.readVInt()];
  }

  /**
   * Writing values to Bytes as Ints
   *
   * @param {Number} value1 Your value to write.
   * @param {Number} value2 Your value to write.
   */
  writeLong(value1, value2) {
    this.writeInt(value1);
    this.writeInt(value2);
  }

  /**
   * Reading 2 Ints from Bytes
   * @returns { Array<Number> } Long Ints
   */
  readLong() {
    return [this.readInt(), this.readInt()];
  }

  /**
   * Writing value to Bytes as Byte
   * @param {Number} value Your value to write.
   */
  writeByte(value) {
    this.bitOffset = 0;
    this.ensureCapacity(1);
    this.buffer[this.offset++] = value;
  }

  /**
   * Writing value to Bytes as ByteArray
   * @param {Buffer} buffer Your buffer to write.
   */
  writeBytes(hex) {
    let buffer = Buffer.from(hex, "hex");
    const length = buffer.length;

    if (buffer != null) {
      this.buffer = Buffer.concat([this.buffer, buffer]);
      this.offset += length;
    }
  }

  writeHex(hex) {
    let buffer = Buffer.from(hex, "hex");

    if (buffer != null) {
      this.buffer = Buffer.concat([this.buffer, buffer]);
      this.offset += buffer.length;
    }
  }

  /**
   * Adding more space to Buffer
   * @param {Number} capacity Amount of new space
   */
  ensureCapacity(capacity) {
    const bufferLength = this.buffer.length;

    if (this.offset + capacity > bufferLength) {
      // eslint-disable-next-line new-cap
      const tmpBuffer = new Buffer.alloc(capacity);
      this.buffer = Buffer.concat([this.buffer, tmpBuffer]);
    }
  }

  /**
   * Send a packet to the server.
   */
  send() {
    if (this.id < 20000) return;

    this.encode();

    const header = Buffer.alloc(7);
    header.writeUInt16BE(this.id, 0);
    header.writeUIntBE(this.buffer.length, 2, 3);
    header.writeUInt16BE(this.version, 5);

    let crypted = this.client.crypto.encrypt(this.id, this.buffer);

    this.client.write(
      Buffer.concat([
        header,
        crypted,
        //Buffer.from([0xff, 0xff, 0x0, 0x0, 0x0, 0x0, 0x0]),
      ]),
    );
    this.client.log(`Packet ${this.id} (${this.constructor.name}) was sent.`);
  }
}

module.exports = ByteStream;
