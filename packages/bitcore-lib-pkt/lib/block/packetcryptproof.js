'use strict';

var _ = require('lodash');
var BN = require('../crypto/bn');
var BufferUtil = require('../util/buffer');
var BufferReader = require('../encoding/bufferreader');
var BufferWriter = require('../encoding/bufferwriter');
var Hash = require('../crypto/hash');
var JSUtil = require('../util/js');
var $ = require('../util/preconditions');

var GENESIS_BITS = 0x1d00ffff;

/**
 * Instantiate a PacketCryptProof from a Buffer, JSON object, or Object with
 * the properties of the PacketCryptProof
 *
 * @param {*} - A Buffer, JSON string, or Object
 * @returns {PacketCryptProof} - An instance of block header
 * @constructor
 */
var PacketCryptProof = function PacketCryptProof(arg) {
  if (!(this instanceof PacketCryptProof)) {
    return new PacketCryptProof(arg);
  }
  var info = PacketCryptProof._from(arg);
  this.entities = info.entities;

  return this;
};

/**
 * @param {*} - A Buffer, JSON string or Object
 * @returns {Object} - An object representing a PacketCryptProof
 * @throws {TypeError} - If the argument was not recognized
 * @private
 */
PacketCryptProof._from = function _from(arg) {
  if (BufferUtil.isBuffer(arg)) {
    return PacketCryptProof._fromBufferReader(BufferReader(arg));
  } else if (_.isObject(arg)) {
    return PacketCryptProof._fromObject(arg);
  } else {
    throw new TypeError('Unrecognized argument for PacketCryptProof ' + arg);
  }
};

/**
 * @param {Object} - A JSON string
 * @returns {Object} - An object representing a PacketCryptProof
 * @private
 */
PacketCryptProof._fromObject = function _fromObject(data) {
  $.checkArgument(data, 'data is required');
  var info = {
      entities: []
  };
  data.entities.forEach((e) => {
      var ed = e.data;
      if (typeof(ed) === 'string') {
        ed = Buffer.from(ed, 'hex');
      }
      info.entities.push({ type: e.type, data: ed });
  });
  return info;
};

/**
 * @param {Object} - A plain JavaScript object
 * @returns {PacketCryptProof} - An instance of a PacketCryptProof
 */
PacketCryptProof.fromObject = function fromObject(obj) {
  var info = PacketCryptProof._fromObject(obj);
  return new PacketCryptProof(info);
};

/**
 * @param {Binary} - Raw block binary data or buffer
 * @returns {PacketCryptProof} - An instance of PacketCryptProof
 */
PacketCryptProof.fromRawBlock = function fromRawBlock(data) {
  if (!BufferUtil.isBuffer(data)) {
    data = Buffer.from(data, 'binary');
  }
  var br = BufferReader(data);
  br.pos = PacketCryptProof.Constants.START_OF_PCP;
  var info = PacketCryptProof._fromBufferReader(br);
  return new PacketCryptProof(info);
};

/**
 * @param {Buffer} - A buffer of the PacketCryptProof
 * @returns {PacketCryptProof} - An instance of PacketCryptProof
 */
PacketCryptProof.fromBuffer = function fromBuffer(buf) {
  var info = PacketCryptProof._fromBufferReader(BufferReader(buf));
  return new PacketCryptProof(info);
};

/**
 * @param {string} - A hex encoded buffer of the PacketCryptProof
 * @returns {PacketCryptProof} - An instance of PacketCryptProof
 */
PacketCryptProof.fromString = function fromString(str) {
  var buf = Buffer.from(str, 'hex');
  return PacketCryptProof.fromBuffer(buf);
};

/**
 * @param {BufferReader} - A BufferReader of the PacketCryptProof
 * @returns {Object} - An object representing PacketCryptProof
 * @private
 */
PacketCryptProof._fromBufferReader = function _fromBufferReader(br) {
  var info = {
      entities: []
  };
  for (;;) {
    var type = br.readVarintNum();
    var length = br.readVarintNum();
    var data = Buffer.from(br.read(length));
    info.entities.push({ type: type, data: data });
    if (type === 0 && length === 0) { return info; }
  }
};

/**
 * @param {BufferReader} - A BufferReader of the PacketCryptProof
 * @returns {BlockHeader} - An instance of PacketCryptProof
 */
PacketCryptProof.fromBufferReader = function fromBufferReader(br) {
  var info = PacketCryptProof._fromBufferReader(br);
  return new PacketCryptProof(info);
};

/**
 * @returns {Object} - A plain object of the PacketCryptProof
 */
PacketCryptProof.prototype.toObject = PacketCryptProof.prototype.toJSON = function toObject() {
  var out = {
      entities: []
  };
  this.entities.forEach((e) => {
      out.entities.push({ type: e.type, data: e.data.toString('hex') });
  });
  return out;
};

/**
 * @returns {Buffer} - A Buffer of the PacketCryptProof
 */
PacketCryptProof.prototype.toBuffer = function toBuffer() {
  return this.toBufferWriter().concat();
};

/**
 * @returns {string} - A hex encoded string of the BlockHeader
 */
PacketCryptProof.prototype.toString = function toString() {
  return this.toBuffer().toString('hex');
};

/**
 * @param {BufferWriter} - An existing instance BufferWriter
 * @returns {BufferWriter} - An instance of BufferWriter representation of the PacketCryptProof
 */
PacketCryptProof.prototype.toBufferWriter = function toBufferWriter(bw) {
  if (!bw) {
    bw = new BufferWriter();
  }
  this.entities.forEach((e) => {
      bw.writeVarintNum(e.type);
      bw.writeVarintNum(e.data.length);
      bw.write(e.data);
  });
  return bw;
};

PacketCryptProof.Constants = {
  START_OF_PCP: 8 + 80, // Start buffer position in raw block data
};

module.exports = PacketCryptProof;
