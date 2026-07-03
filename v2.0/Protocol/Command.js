const ByteStream = require("../ByteStream");

/**
 * PiranhaMessage
 *
 * A main handler of packets.
 */
class Command {
  /**
   * PiranhaMessage
   *
   * A main handler of packets.
   *
   * @param { ByteStream } buf a bytestream
   */
  constructor(buf) {
    this.buf = buf;
    /**
     * Packet ID.
     */
    this.id = 0;
    /**
     * Client variable.
     */
    this.client = null;
  }

  /**
   * Encode function for server packets.
   *
   * Need to use `write` functions
   */
  encode() {}

  /**
   * Decode function for client packets.
   *
   * Need to use `read` functions
   */
  decode() {}

  /**
   * Process function for client packets.
   *
   * Your code here.
   */
  process() {}
}

module.exports = Command;
