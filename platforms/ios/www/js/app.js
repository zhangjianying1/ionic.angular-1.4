(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var lookup = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

;(function (exports) {
	'use strict';

  var Arr = (typeof Uint8Array !== 'undefined')
    ? Uint8Array
    : Array

	var PLUS   = '+'.charCodeAt(0)
	var SLASH  = '/'.charCodeAt(0)
	var NUMBER = '0'.charCodeAt(0)
	var LOWER  = 'a'.charCodeAt(0)
	var UPPER  = 'A'.charCodeAt(0)
	var PLUS_URL_SAFE = '-'.charCodeAt(0)
	var SLASH_URL_SAFE = '_'.charCodeAt(0)

	function decode (elt) {
		var code = elt.charCodeAt(0)
		if (code === PLUS ||
		    code === PLUS_URL_SAFE)
			return 62 // '+'
		if (code === SLASH ||
		    code === SLASH_URL_SAFE)
			return 63 // '/'
		if (code < NUMBER)
			return -1 //no match
		if (code < NUMBER + 10)
			return code - NUMBER + 26 + 26
		if (code < UPPER + 26)
			return code - UPPER
		if (code < LOWER + 26)
			return code - LOWER + 26
	}

	function b64ToByteArray (b64) {
		var i, j, l, tmp, placeHolders, arr

		if (b64.length % 4 > 0) {
			throw new Error('Invalid string. Length must be a multiple of 4')
		}

		// the number of equal signs (place holders)
		// if there are two placeholders, than the two characters before it
		// represent one byte
		// if there is only one, then the three characters before it represent 2 bytes
		// this is just a cheap hack to not do indexOf twice
		var len = b64.length
		placeHolders = '=' === b64.charAt(len - 2) ? 2 : '=' === b64.charAt(len - 1) ? 1 : 0

		// base64 is 4/3 + up to two characters of the original data
		arr = new Arr(b64.length * 3 / 4 - placeHolders)

		// if there are placeholders, only get up to the last complete 4 chars
		l = placeHolders > 0 ? b64.length - 4 : b64.length

		var L = 0

		function push (v) {
			arr[L++] = v
		}

		for (i = 0, j = 0; i < l; i += 4, j += 3) {
			tmp = (decode(b64.charAt(i)) << 18) | (decode(b64.charAt(i + 1)) << 12) | (decode(b64.charAt(i + 2)) << 6) | decode(b64.charAt(i + 3))
			push((tmp & 0xFF0000) >> 16)
			push((tmp & 0xFF00) >> 8)
			push(tmp & 0xFF)
		}

		if (placeHolders === 2) {
			tmp = (decode(b64.charAt(i)) << 2) | (decode(b64.charAt(i + 1)) >> 4)
			push(tmp & 0xFF)
		} else if (placeHolders === 1) {
			tmp = (decode(b64.charAt(i)) << 10) | (decode(b64.charAt(i + 1)) << 4) | (decode(b64.charAt(i + 2)) >> 2)
			push((tmp >> 8) & 0xFF)
			push(tmp & 0xFF)
		}

		return arr
	}

	function uint8ToBase64 (uint8) {
		var i,
			extraBytes = uint8.length % 3, // if we have 1 byte left, pad 2 bytes
			output = "",
			temp, length

		function encode (num) {
			return lookup.charAt(num)
		}

		function tripletToBase64 (num) {
			return encode(num >> 18 & 0x3F) + encode(num >> 12 & 0x3F) + encode(num >> 6 & 0x3F) + encode(num & 0x3F)
		}

		// go through the array every three bytes, we'll deal with trailing stuff later
		for (i = 0, length = uint8.length - extraBytes; i < length; i += 3) {
			temp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2])
			output += tripletToBase64(temp)
		}

		// pad the end with zeros, but make sure to not forget the extra bytes
		switch (extraBytes) {
			case 1:
				temp = uint8[uint8.length - 1]
				output += encode(temp >> 2)
				output += encode((temp << 4) & 0x3F)
				output += '=='
				break
			case 2:
				temp = (uint8[uint8.length - 2] << 8) + (uint8[uint8.length - 1])
				output += encode(temp >> 10)
				output += encode((temp >> 4) & 0x3F)
				output += encode((temp << 2) & 0x3F)
				output += '='
				break
		}

		return output
	}

	exports.toByteArray = b64ToByteArray
	exports.fromByteArray = uint8ToBase64
}(typeof exports === 'undefined' ? (this.base64js = {}) : exports))

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/base64-js/lib/b64.js","/../../node_modules/base64-js/lib")
},{"buffer":2,"rH1JPG":4}],2:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

var base64 = require('base64-js')
var ieee754 = require('ieee754')

exports.Buffer = Buffer
exports.SlowBuffer = Buffer
exports.INSPECT_MAX_BYTES = 50
Buffer.poolSize = 8192

/**
 * If `Buffer._useTypedArrays`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (compatible down to IE6)
 */
Buffer._useTypedArrays = (function () {
  // Detect if browser supports Typed Arrays. Supported browsers are IE 10+, Firefox 4+,
  // Chrome 7+, Safari 5.1+, Opera 11.6+, iOS 4.2+. If the browser does not support adding
  // properties to `Uint8Array` instances, then that's the same as no `Uint8Array` support
  // because we need to be able to add all the node Buffer API methods. This is an issue
  // in Firefox 4-29. Now fixed: https://bugzilla.mozilla.org/show_bug.cgi?id=695438
  try {
    var buf = new ArrayBuffer(0)
    var arr = new Uint8Array(buf)
    arr.foo = function () { return 42 }
    return 42 === arr.foo() &&
        typeof arr.subarray === 'function' // Chrome 9-10 lack `subarray`
  } catch (e) {
    return false
  }
})()

/**
 * Class: Buffer
 * =============
 *
 * The Buffer constructor returns instances of `Uint8Array` that are augmented
 * with function properties for all the node `Buffer` API functions. We use
 * `Uint8Array` so that square bracket notation works as expected -- it returns
 * a single octet.
 *
 * By augmenting the instances, we can avoid modifying the `Uint8Array`
 * prototype.
 */
function Buffer (subject, encoding, noZero) {
  if (!(this instanceof Buffer))
    return new Buffer(subject, encoding, noZero)

  var type = typeof subject

  // Workaround: node's base64 implementation allows for non-padded strings
  // while base64-js does not.
  if (encoding === 'base64' && type === 'string') {
    subject = stringtrim(subject)
    while (subject.length % 4 !== 0) {
      subject = subject + '='
    }
  }

  // Find the length
  var length
  if (type === 'number')
    length = coerce(subject)
  else if (type === 'string')
    length = Buffer.byteLength(subject, encoding)
  else if (type === 'object')
    length = coerce(subject.length) // assume that object is array-like
  else
    throw new Error('First argument needs to be a number, array or string.')

  var buf
  if (Buffer._useTypedArrays) {
    // Preferred: Return an augmented `Uint8Array` instance for best performance
    buf = Buffer._augment(new Uint8Array(length))
  } else {
    // Fallback: Return THIS instance of Buffer (created by `new`)
    buf = this
    buf.length = length
    buf._isBuffer = true
  }

  var i
  if (Buffer._useTypedArrays && typeof subject.byteLength === 'number') {
    // Speed optimization -- use set if we're copying from a typed array
    buf._set(subject)
  } else if (isArrayish(subject)) {
    // Treat array-ish objects as a byte array
    for (i = 0; i < length; i++) {
      if (Buffer.isBuffer(subject))
        buf[i] = subject.readUInt8(i)
      else
        buf[i] = subject[i]
    }
  } else if (type === 'string') {
    buf.write(subject, 0, encoding)
  } else if (type === 'number' && !Buffer._useTypedArrays && !noZero) {
    for (i = 0; i < length; i++) {
      buf[i] = 0
    }
  }

  return buf
}

// STATIC METHODS
// ==============

Buffer.isEncoding = function (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'binary':
    case 'base64':
    case 'raw':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.isBuffer = function (b) {
  return !!(b !== null && b !== undefined && b._isBuffer)
}

Buffer.byteLength = function (str, encoding) {
  var ret
  str = str + ''
  switch (encoding || 'utf8') {
    case 'hex':
      ret = str.length / 2
      break
    case 'utf8':
    case 'utf-8':
      ret = utf8ToBytes(str).length
      break
    case 'ascii':
    case 'binary':
    case 'raw':
      ret = str.length
      break
    case 'base64':
      ret = base64ToBytes(str).length
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = str.length * 2
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.concat = function (list, totalLength) {
  assert(isArray(list), 'Usage: Buffer.concat(list, [totalLength])\n' +
      'list should be an Array.')

  if (list.length === 0) {
    return new Buffer(0)
  } else if (list.length === 1) {
    return list[0]
  }

  var i
  if (typeof totalLength !== 'number') {
    totalLength = 0
    for (i = 0; i < list.length; i++) {
      totalLength += list[i].length
    }
  }

  var buf = new Buffer(totalLength)
  var pos = 0
  for (i = 0; i < list.length; i++) {
    var item = list[i]
    item.copy(buf, pos)
    pos += item.length
  }
  return buf
}

// BUFFER INSTANCE METHODS
// =======================

function _hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  assert(strLen % 2 === 0, 'Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; i++) {
    var byte = parseInt(string.substr(i * 2, 2), 16)
    assert(!isNaN(byte), 'Invalid hex string')
    buf[offset + i] = byte
  }
  Buffer._charsWritten = i * 2
  return i
}

function _utf8Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf8ToBytes(string), buf, offset, length)
  return charsWritten
}

function _asciiWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(asciiToBytes(string), buf, offset, length)
  return charsWritten
}

function _binaryWrite (buf, string, offset, length) {
  return _asciiWrite(buf, string, offset, length)
}

function _base64Write (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(base64ToBytes(string), buf, offset, length)
  return charsWritten
}

function _utf16leWrite (buf, string, offset, length) {
  var charsWritten = Buffer._charsWritten =
    blitBuffer(utf16leToBytes(string), buf, offset, length)
  return charsWritten
}

Buffer.prototype.write = function (string, offset, length, encoding) {
  // Support both (string, offset, length, encoding)
  // and the legacy (string, encoding, offset, length)
  if (isFinite(offset)) {
    if (!isFinite(length)) {
      encoding = length
      length = undefined
    }
  } else {  // legacy
    var swap = encoding
    encoding = offset
    offset = length
    length = swap
  }

  offset = Number(offset) || 0
  var remaining = this.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }
  encoding = String(encoding || 'utf8').toLowerCase()

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexWrite(this, string, offset, length)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Write(this, string, offset, length)
      break
    case 'ascii':
      ret = _asciiWrite(this, string, offset, length)
      break
    case 'binary':
      ret = _binaryWrite(this, string, offset, length)
      break
    case 'base64':
      ret = _base64Write(this, string, offset, length)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leWrite(this, string, offset, length)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toString = function (encoding, start, end) {
  var self = this

  encoding = String(encoding || 'utf8').toLowerCase()
  start = Number(start) || 0
  end = (end !== undefined)
    ? Number(end)
    : end = self.length

  // Fastpath empty strings
  if (end === start)
    return ''

  var ret
  switch (encoding) {
    case 'hex':
      ret = _hexSlice(self, start, end)
      break
    case 'utf8':
    case 'utf-8':
      ret = _utf8Slice(self, start, end)
      break
    case 'ascii':
      ret = _asciiSlice(self, start, end)
      break
    case 'binary':
      ret = _binarySlice(self, start, end)
      break
    case 'base64':
      ret = _base64Slice(self, start, end)
      break
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      ret = _utf16leSlice(self, start, end)
      break
    default:
      throw new Error('Unknown encoding')
  }
  return ret
}

Buffer.prototype.toJSON = function () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function (target, target_start, start, end) {
  var source = this

  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (!target_start) target_start = 0

  // Copy 0 bytes; we're done
  if (end === start) return
  if (target.length === 0 || source.length === 0) return

  // Fatal error conditions
  assert(end >= start, 'sourceEnd < sourceStart')
  assert(target_start >= 0 && target_start < target.length,
      'targetStart out of bounds')
  assert(start >= 0 && start < source.length, 'sourceStart out of bounds')
  assert(end >= 0 && end <= source.length, 'sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length)
    end = this.length
  if (target.length - target_start < end - start)
    end = target.length - target_start + start

  var len = end - start

  if (len < 100 || !Buffer._useTypedArrays) {
    for (var i = 0; i < len; i++)
      target[i + target_start] = this[i + start]
  } else {
    target._set(this.subarray(start, start + len), target_start)
  }
}

function _base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function _utf8Slice (buf, start, end) {
  var res = ''
  var tmp = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++) {
    if (buf[i] <= 0x7F) {
      res += decodeUtf8Char(tmp) + String.fromCharCode(buf[i])
      tmp = ''
    } else {
      tmp += '%' + buf[i].toString(16)
    }
  }

  return res + decodeUtf8Char(tmp)
}

function _asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; i++)
    ret += String.fromCharCode(buf[i])
  return ret
}

function _binarySlice (buf, start, end) {
  return _asciiSlice(buf, start, end)
}

function _hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; i++) {
    out += toHex(buf[i])
  }
  return out
}

function _utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i+1] * 256)
  }
  return res
}

Buffer.prototype.slice = function (start, end) {
  var len = this.length
  start = clamp(start, len, 0)
  end = clamp(end, len, len)

  if (Buffer._useTypedArrays) {
    return Buffer._augment(this.subarray(start, end))
  } else {
    var sliceLen = end - start
    var newBuf = new Buffer(sliceLen, undefined, true)
    for (var i = 0; i < sliceLen; i++) {
      newBuf[i] = this[i + start]
    }
    return newBuf
  }
}

// `get` will be removed in Node 0.13+
Buffer.prototype.get = function (offset) {
  console.log('.get() is deprecated. Access using array indexes instead.')
  return this.readUInt8(offset)
}

// `set` will be removed in Node 0.13+
Buffer.prototype.set = function (v, offset) {
  console.log('.set() is deprecated. Access using array indexes instead.')
  return this.writeUInt8(v, offset)
}

Buffer.prototype.readUInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  return this[offset]
}

function _readUInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    val = buf[offset]
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
  } else {
    val = buf[offset] << 8
    if (offset + 1 < len)
      val |= buf[offset + 1]
  }
  return val
}

Buffer.prototype.readUInt16LE = function (offset, noAssert) {
  return _readUInt16(this, offset, true, noAssert)
}

Buffer.prototype.readUInt16BE = function (offset, noAssert) {
  return _readUInt16(this, offset, false, noAssert)
}

function _readUInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val
  if (littleEndian) {
    if (offset + 2 < len)
      val = buf[offset + 2] << 16
    if (offset + 1 < len)
      val |= buf[offset + 1] << 8
    val |= buf[offset]
    if (offset + 3 < len)
      val = val + (buf[offset + 3] << 24 >>> 0)
  } else {
    if (offset + 1 < len)
      val = buf[offset + 1] << 16
    if (offset + 2 < len)
      val |= buf[offset + 2] << 8
    if (offset + 3 < len)
      val |= buf[offset + 3]
    val = val + (buf[offset] << 24 >>> 0)
  }
  return val
}

Buffer.prototype.readUInt32LE = function (offset, noAssert) {
  return _readUInt32(this, offset, true, noAssert)
}

Buffer.prototype.readUInt32BE = function (offset, noAssert) {
  return _readUInt32(this, offset, false, noAssert)
}

Buffer.prototype.readInt8 = function (offset, noAssert) {
  if (!noAssert) {
    assert(offset !== undefined && offset !== null,
        'missing offset')
    assert(offset < this.length, 'Trying to read beyond buffer length')
  }

  if (offset >= this.length)
    return

  var neg = this[offset] & 0x80
  if (neg)
    return (0xff - this[offset] + 1) * -1
  else
    return this[offset]
}

function _readInt16 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt16(buf, offset, littleEndian, true)
  var neg = val & 0x8000
  if (neg)
    return (0xffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt16LE = function (offset, noAssert) {
  return _readInt16(this, offset, true, noAssert)
}

Buffer.prototype.readInt16BE = function (offset, noAssert) {
  return _readInt16(this, offset, false, noAssert)
}

function _readInt32 (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  var len = buf.length
  if (offset >= len)
    return

  var val = _readUInt32(buf, offset, littleEndian, true)
  var neg = val & 0x80000000
  if (neg)
    return (0xffffffff - val + 1) * -1
  else
    return val
}

Buffer.prototype.readInt32LE = function (offset, noAssert) {
  return _readInt32(this, offset, true, noAssert)
}

Buffer.prototype.readInt32BE = function (offset, noAssert) {
  return _readInt32(this, offset, false, noAssert)
}

function _readFloat (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 3 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 23, 4)
}

Buffer.prototype.readFloatLE = function (offset, noAssert) {
  return _readFloat(this, offset, true, noAssert)
}

Buffer.prototype.readFloatBE = function (offset, noAssert) {
  return _readFloat(this, offset, false, noAssert)
}

function _readDouble (buf, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset + 7 < buf.length, 'Trying to read beyond buffer length')
  }

  return ieee754.read(buf, offset, littleEndian, 52, 8)
}

Buffer.prototype.readDoubleLE = function (offset, noAssert) {
  return _readDouble(this, offset, true, noAssert)
}

Buffer.prototype.readDoubleBE = function (offset, noAssert) {
  return _readDouble(this, offset, false, noAssert)
}

Buffer.prototype.writeUInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'trying to write beyond buffer length')
    verifuint(value, 0xff)
  }

  if (offset >= this.length) return

  this[offset] = value
}

function _writeUInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 2); i < j; i++) {
    buf[offset + i] =
        (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
            (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt16BE = function (value, offset, noAssert) {
  _writeUInt16(this, value, offset, false, noAssert)
}

function _writeUInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'trying to write beyond buffer length')
    verifuint(value, 0xffffffff)
  }

  var len = buf.length
  if (offset >= len)
    return

  for (var i = 0, j = Math.min(len - offset, 4); i < j; i++) {
    buf[offset + i] =
        (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeUInt32BE = function (value, offset, noAssert) {
  _writeUInt32(this, value, offset, false, noAssert)
}

Buffer.prototype.writeInt8 = function (value, offset, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset < this.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7f, -0x80)
  }

  if (offset >= this.length)
    return

  if (value >= 0)
    this.writeUInt8(value, offset, noAssert)
  else
    this.writeUInt8(0xff + value + 1, offset, noAssert)
}

function _writeInt16 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 1 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fff, -0x8000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt16(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt16(buf, 0xffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt16LE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt16BE = function (value, offset, noAssert) {
  _writeInt16(this, value, offset, false, noAssert)
}

function _writeInt32 (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifsint(value, 0x7fffffff, -0x80000000)
  }

  var len = buf.length
  if (offset >= len)
    return

  if (value >= 0)
    _writeUInt32(buf, value, offset, littleEndian, noAssert)
  else
    _writeUInt32(buf, 0xffffffff + value + 1, offset, littleEndian, noAssert)
}

Buffer.prototype.writeInt32LE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, true, noAssert)
}

Buffer.prototype.writeInt32BE = function (value, offset, noAssert) {
  _writeInt32(this, value, offset, false, noAssert)
}

function _writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 3 < buf.length, 'Trying to write beyond buffer length')
    verifIEEE754(value, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 23, 4)
}

Buffer.prototype.writeFloatLE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function (value, offset, noAssert) {
  _writeFloat(this, value, offset, false, noAssert)
}

function _writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    assert(value !== undefined && value !== null, 'missing value')
    assert(typeof littleEndian === 'boolean', 'missing or invalid endian')
    assert(offset !== undefined && offset !== null, 'missing offset')
    assert(offset + 7 < buf.length,
        'Trying to write beyond buffer length')
    verifIEEE754(value, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }

  var len = buf.length
  if (offset >= len)
    return

  ieee754.write(buf, value, offset, littleEndian, 52, 8)
}

Buffer.prototype.writeDoubleLE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function (value, offset, noAssert) {
  _writeDouble(this, value, offset, false, noAssert)
}

// fill(value, start=0, end=buffer.length)
Buffer.prototype.fill = function (value, start, end) {
  if (!value) value = 0
  if (!start) start = 0
  if (!end) end = this.length

  if (typeof value === 'string') {
    value = value.charCodeAt(0)
  }

  assert(typeof value === 'number' && !isNaN(value), 'value is not a number')
  assert(end >= start, 'end < start')

  // Fill 0 bytes; we're done
  if (end === start) return
  if (this.length === 0) return

  assert(start >= 0 && start < this.length, 'start out of bounds')
  assert(end >= 0 && end <= this.length, 'end out of bounds')

  for (var i = start; i < end; i++) {
    this[i] = value
  }
}

Buffer.prototype.inspect = function () {
  var out = []
  var len = this.length
  for (var i = 0; i < len; i++) {
    out[i] = toHex(this[i])
    if (i === exports.INSPECT_MAX_BYTES) {
      out[i + 1] = '...'
      break
    }
  }
  return '<Buffer ' + out.join(' ') + '>'
}

/**
 * Creates a new `ArrayBuffer` with the *copied* memory of the buffer instance.
 * Added in Node 0.12. Only available in browsers that support ArrayBuffer.
 */
Buffer.prototype.toArrayBuffer = function () {
  if (typeof Uint8Array !== 'undefined') {
    if (Buffer._useTypedArrays) {
      return (new Buffer(this)).buffer
    } else {
      var buf = new Uint8Array(this.length)
      for (var i = 0, len = buf.length; i < len; i += 1)
        buf[i] = this[i]
      return buf.buffer
    }
  } else {
    throw new Error('Buffer.toArrayBuffer not supported in this browser')
  }
}

// HELPER FUNCTIONS
// ================

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

var BP = Buffer.prototype

/**
 * Augment a Uint8Array *instance* (not the Uint8Array class!) with Buffer methods
 */
Buffer._augment = function (arr) {
  arr._isBuffer = true

  // save reference to original Uint8Array get/set methods before overwriting
  arr._get = arr.get
  arr._set = arr.set

  // deprecated, will be removed in node 0.13+
  arr.get = BP.get
  arr.set = BP.set

  arr.write = BP.write
  arr.toString = BP.toString
  arr.toLocaleString = BP.toString
  arr.toJSON = BP.toJSON
  arr.copy = BP.copy
  arr.slice = BP.slice
  arr.readUInt8 = BP.readUInt8
  arr.readUInt16LE = BP.readUInt16LE
  arr.readUInt16BE = BP.readUInt16BE
  arr.readUInt32LE = BP.readUInt32LE
  arr.readUInt32BE = BP.readUInt32BE
  arr.readInt8 = BP.readInt8
  arr.readInt16LE = BP.readInt16LE
  arr.readInt16BE = BP.readInt16BE
  arr.readInt32LE = BP.readInt32LE
  arr.readInt32BE = BP.readInt32BE
  arr.readFloatLE = BP.readFloatLE
  arr.readFloatBE = BP.readFloatBE
  arr.readDoubleLE = BP.readDoubleLE
  arr.readDoubleBE = BP.readDoubleBE
  arr.writeUInt8 = BP.writeUInt8
  arr.writeUInt16LE = BP.writeUInt16LE
  arr.writeUInt16BE = BP.writeUInt16BE
  arr.writeUInt32LE = BP.writeUInt32LE
  arr.writeUInt32BE = BP.writeUInt32BE
  arr.writeInt8 = BP.writeInt8
  arr.writeInt16LE = BP.writeInt16LE
  arr.writeInt16BE = BP.writeInt16BE
  arr.writeInt32LE = BP.writeInt32LE
  arr.writeInt32BE = BP.writeInt32BE
  arr.writeFloatLE = BP.writeFloatLE
  arr.writeFloatBE = BP.writeFloatBE
  arr.writeDoubleLE = BP.writeDoubleLE
  arr.writeDoubleBE = BP.writeDoubleBE
  arr.fill = BP.fill
  arr.inspect = BP.inspect
  arr.toArrayBuffer = BP.toArrayBuffer

  return arr
}

// slice(start, end)
function clamp (index, len, defaultValue) {
  if (typeof index !== 'number') return defaultValue
  index = ~~index;  // Coerce to integer.
  if (index >= len) return len
  if (index >= 0) return index
  index += len
  if (index >= 0) return index
  return 0
}

function coerce (length) {
  // Coerce length to a number (possibly NaN), round up
  // in case it's fractional (e.g. 123.456) then do a
  // double negate to coerce a NaN to 0. Easy, right?
  length = ~~Math.ceil(+length)
  return length < 0 ? 0 : length
}

function isArray (subject) {
  return (Array.isArray || function (subject) {
    return Object.prototype.toString.call(subject) === '[object Array]'
  })(subject)
}

function isArrayish (subject) {
  return isArray(subject) || Buffer.isBuffer(subject) ||
      subject && typeof subject === 'object' &&
      typeof subject.length === 'number'
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    var b = str.charCodeAt(i)
    if (b <= 0x7F)
      byteArray.push(str.charCodeAt(i))
    else {
      var start = i
      if (b >= 0xD800 && b <= 0xDFFF) i++
      var h = encodeURIComponent(str.slice(start, i+1)).substr(1).split('%')
      for (var j = 0; j < h.length; j++)
        byteArray.push(parseInt(h[j], 16))
    }
  }
  return byteArray
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; i++) {
    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(str)
}

function blitBuffer (src, dst, offset, length) {
  var pos
  for (var i = 0; i < length; i++) {
    if ((i + offset >= dst.length) || (i >= src.length))
      break
    dst[i + offset] = src[i]
  }
  return i
}

function decodeUtf8Char (str) {
  try {
    return decodeURIComponent(str)
  } catch (err) {
    return String.fromCharCode(0xFFFD) // UTF 8 invalid char
  }
}

/*
 * We have to make sure that the value is a valid integer. This means that it
 * is non-negative. It has no fractional component and that it does not
 * exceed the maximum allowed value.
 */
function verifuint (value, max) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value >= 0, 'specified a negative value for writing an unsigned value')
  assert(value <= max, 'value is larger than maximum value for type')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifsint (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
  assert(Math.floor(value) === value, 'value has a fractional component')
}

function verifIEEE754 (value, max, min) {
  assert(typeof value === 'number', 'cannot write a non-number as a number')
  assert(value <= max, 'value larger than maximum allowed value')
  assert(value >= min, 'value smaller than minimum allowed value')
}

function assert (test, message) {
  if (!test) throw new Error(message || 'Failed assertion')
}

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/buffer/index.js","/../../node_modules/buffer")
},{"base64-js":1,"buffer":2,"ieee754":3,"rH1JPG":4}],3:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/ieee754/index.js","/../../node_modules/ieee754")
},{"buffer":2,"rH1JPG":4}],4:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../../node_modules/process/browser.js","/../../node_modules/process")
},{"buffer":2,"rH1JPG":4}],5:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * 下拉刷新加载最新数据
 */
var directiveModule = require('../../js/directiveModule.js');


directiveModule.directive('dorpDown', function() {

    function getParent(ele, arg){
        var parent = ele.parentNode;

        return parent;
    }

    function getEleTransform(ele){

        if (!ele) return 0;

        var re = /\s([-0-9\.]*)\p/;

        var translate = ele.style.webkitTransform;

        var result =  re.exec(translate);

        return result && result[1];
    }
return {
    restrict: 'AE',
    transclude: true,
    replace: true,
    require: '^slideTabs',
    template: '<div class="dorp-down" set-height><div class="up-load"><span class="{loading: isload}"></span></div><div class="dorpcont" ><ion-scroll set-height overflow-scroll="true"><div ng-transclude ></div></ion-scroll></div>{{t}}</div>',
    link: function (scope, ele, attrs, tabCtrl) {

        scope.$on('refreshComplete', function(){

            scrollTo(0);
        })
        var options = {
            element: ele[0],
            pull: ele.find('div').eq(0).find('span')[0],
            scrollH: 80,
            scrollCritical: 68,
            speed: 300,
            deltaY: 0,
            start: 0,
            bBtn: false
        }, oScroll = null

        // 触摸屏幕开始
        options.element.addEventListener('touchstart', function (event) {

            // 获取触摸点的位置（只获取Y轴）
            options.start = event.touches && event.touches[0].pageY;
            options.startX = event.touches && event.touches[0].pageX;
            // 禁用动画
            options.element.style.webkitTransitionDuration = '0ms';

            // 当页面滚动大于0时禁用下拉加载
            scrollT = ele.find('ion-scroll')[0].scrollTop;

            if ( scrollT < 2 && (document.body.scrollTop || document.documentElement.scrollTop) < 2) {
                options.bBtn = true;
            }


        });
        // 触摸并滑动屏幕
        options.element.addEventListener('touchmove', function (event) {

            scope.t = tabCtrl.stopOtherScroll;

            if ( !tabCtrl.stopOtherScroll && options.bBtn && (document.body.scrollTop || document.documentElement.scrollTop) < 2) {
                // 获取滑动的距离
                options.deltaY = event.touches && event.touches[0].pageY - options.start;


              if (Math.abs(options.deltaY) < Math.abs(event.touches[0].pageX - options.startX)) {
                    options.bBtn = false;
                    event.preventDefault();
                    return;
                } else {
                    options.bBtn = true;
                }

                // 如果滑动向上变成负数 则不执行里面的代码
                if (options.deltaY > 0) {
                    moveTo();
                    // 阻止默认行为（会滚动屏幕，但是滚动已经在最顶端了，但还是阻止吧）
                    event.preventDefault();
                }
            }
        })
        // 触摸并离开屏幕
        options.element.addEventListener('touchend', function () {

            options.deltaY > 0 && options.bBtn && scrollOver();

        })
        /**
         * 触摸移动
         */
        function moveTo() {
            // 计算触摸距离（大于向下滑动的最高值时进行阻挠滑动）
            options.deltaY = options.deltaY > options.scrollH ? options.deltaY / (options.deltaY / window.innerHeight + 1) : options.deltaY;

            // 滑动的距离大于 可以松手刷新的时候
            if (options.deltaY > options.scrollCritical) {
                // 提示松手刷新
                options.pull.style.webkitTransform = 'rotate(0deg)';
            } else {
                options.pull.style.webkitTransform = 'rotate(180deg)';
            }

            // 滑动

            options.element.style.transform = 'translate3d(0, ' + options.deltaY + 'px , 0)';
            options.element.style.webkitTransform = 'translate3d(0, ' + options.deltaY + 'px , 0)';

        }

        /**
         * 停止滑动并松手离开
         *
         */
        function scrollOver() {

            // 滑动的距离大于可以松手加载的最大值时
            if (options.deltaY > options.scrollCritical) {
                scrollTo(68);

                setTimeout(function(){

                    scope.$apply(attrs.fn);

                }, 1000)

            } else {
                // 滚动到 0
                scrollTo(0)
            }

        }

        /**
         * 滚动到
         * @param distance {Number} 滚动到的距离
         * @param speed { Number } 动画时间
         */
        function scrollTo(distance, speed) {
            // 没传时间就用默认时间
            if (!speed) {
                speed = options.speed;
            }
            // 传入的距离
            switch (distance) {
                // 滚动到 0 时
                case 0:
                    setTimeout(function () {
                        // 可以进行下次下拉加载
                        options.bBtn = false;
                        options.pull.className = '';
                        options.deltaY = 0;
                        options.element.removeEventListener('touchmove', preventDefault, false);
                        options.element.style.transform = 'none';
                        options.element.style.webkitTransform = 'none';
                    }, 100)
                    break;
                case 68:
                    // 绑定的touchmove 里面不执行 shez options.bBtn = true;
                    options.pull.className = 'loading';
                    options.element.addEventListener('touchmove', preventDefault, false);
                    break;
                //default:
            }

            options.element.style.webkitTransitionDuration = speed + 'ms';
            options.element.style.webkitTransform = 'translate3d(0, ' + distance + 'px , 0)';
        }

        // 阻止默认行为（在加载数据的时候禁止用户滑动屏幕）
        function preventDefault(e) {
            e.preventDefault();
        }
    }
}

});


}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../components/dorpdown/DorpDown.js","/../components/dorpdown")
},{"../../js/directiveModule.js":36,"buffer":2,"rH1JPG":4}],6:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var directiveModule = require('../../js/directiveModule.js');

// 滑动的tab
directiveModule.directive('touchScroll', function($timeout) {

    return {
        restrict: 'AE',
        transclude: true,
        replace: true,
        scope: {},
        template: '<div style="overflow:hidden; background-clip:content-border"><div ng-transclude style="overflow:hidden;"></div></div>',
        controller: ['$scope', function($scope){

            this.addFn = function(fn){
                $scope.loadMore = fn;
            }
        }],
        link: function(scope, ele, attrs){



            var obj = ele.find('div')[0];



            var boundaryL = 0,
                moveDistance = 0,
                temp = 0,
                speed = 0,
                scroll = 0,
                timer = null,
                parentDiv = ele[0],
                s = 1,
                moveL = 0;

                /**
                 * 触摸开始
                 * @param e {Object}
                 */
                function tStart(e){
                    var event = e.touches[0];
                    boundaryL = event.pageX;
                    clearInterval(timer);
                    obj.style.transform = 'translateX(' + moveL  + 'px)';
                    obj.style.webkitTransform = 'translateX(' + moveL  + 'px)';
                }

                /**
                 * 滑动
                 * @param e {Object}
                 */
                function tMove(e){

                    var event = e.touches[0];

                    moveDistance = (event.pageX - boundaryL);

                    speed = event.pageX - temp;
                    temp = event.pageX;

                    moveDistance = goDefault(moveDistance , s);

                    obj.style.transform = 'translate3d(' + (moveL + moveDistance)  + 'px, 0, 0)';
                    obj.style.webkitTransform = 'translate3d(' + (moveL + moveDistance)  + 'px, 0, 0)';
                    obj.style.transitionDuration = '0';
                    obj.style.webkitTransitionDuration = '0';


                }

                /**
                 * 触摸结束
                 * @param e
                 */
                function tEnd(e){
                    moveL += moveDistance;
                    //requestAnimationFrame(function(){
                    //    speed = speed * .95;
                    //    moveL += speed;
                    //
                    //    if (Math.abs(speed) <= 1 || moveL > 0 || Math.abs(moveL) >  (obj.offsetWidth - parentDiv.offsetWidth)) {
                    //        speed = 0;
                    //
                    //
                    //        obj.style.transitionDuration = '100ms';
                    //        obj.style.webkitTransitionDuration = '100ms';
                    //        if (moveL > 0) {
                    //            moveL = 0;
                    //        }
                    //        if (moveL < -obj.offsetWidth + parentDiv.offsetWidth){
                    //            moveL = -obj.offsetWidth + parentDiv.offsetWidth;
                    //        }
                    //
                    //
                    //
                    //    } else {
                    //        //tEnd();
                    //        moveL = goDefault(moveL , s);
                    //
                    //    }
                    //    obj.style.transform = 'translate3d('+ moveL + 'px, 0, 0)';
                    //    obj.style.webkitTransform = 'translate3d('+ moveL + 'px, 0, 0)';
                    //
                    //})
                }

                obj.addEventListener('touchstart' , tStart , false);
                obj.addEventListener('touchmove' , tMove, false);
                obj.addEventListener('touchend' , tEnd, false);


                /**
                 * 减速
                 * @param moveL {Number}
                 * @param s {Number}
                 * @returns moveL {Number}
                 */
                function goDefault(moveL , s){
                    obj.style.width = '1000px';
                    if (moveL > 0 ) {
                        s = ( 1 + moveL / (parentDiv.offsetWidth / 2));
                        moveL = moveL / s
                    } else if (moveL < -obj.offsetWidth + parentDiv.offsetWidth){

                        var iMove = moveL + (obj.offsetWidth - parentDiv.offsetWidth);
                        s = ( 1 + Math.abs(iMove) / (parentDiv.offsetWidth / 2));

                        moveL = (-obj.offsetWidth + parentDiv.offsetWidth) + iMove / s;
                    }
                    return moveL;
                }

        }
    }
})
.directive('scrollInfiniteMore', function(){

    return {
        restrict: 'AE',
        transclude: true,
        replace: true,
        template: '<div ng-transclude style="overflow:hidden" style="Width:40px; line-Width:40px; text-align: center">加载中...</div>',
        link: function (scope, ele, attrs, touchScrollCtrl) {

            var clientH = document.documentElement.clientWidth,
                iTop = 0;

            window.onscroll = function(){

                setTimeout(function(){
                    iTop = ele[0].getBoundingClientRect().top;

                    if (iTop <= clientH) {
                        scope.$apply(attrs.onInfinite);
                    }
                },10)

            }
            setTimeout(function(){

                iTop = ele[0].getBoundingClientRect().top;

                if (iTop <= clientH) {

                    scope.$apply(attrs.onInfinite);
                }
            },1000)
        }
    }
}).directive('scroll', function(){

        return {
            restrict: 'AE',
            link: function (scope, ele, attrs) {
                var oHeader = ele.find('div')[0],
                    oScroll = ele.find('div')[4];

                oScroll.onscroll = function(event){

                    console.log(this.scrollTop)
                    oHeader.style.left = -this.scrollLeft + 'px';
                    oHeader.style.position = 'relative';
                }


            }
        }
    });






}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../components/scroll/TouchScrollDirective.js","/../components/scroll")
},{"../../js/directiveModule.js":36,"buffer":2,"rH1JPG":4}],7:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var directiveModule = require('../../js/directiveModule.js');
/**
 * tab
 */
 directiveModule.directive('tab', function(){
    return {
        restrict: 'AE',
        transclude: true,
        replace: true,
        require: '^?tabs',
        scope: {
            title: '@',  // tab title
        },
        template: '<div ><div ng-transclude style="display:{{active ? \'block\' : \'none\'}}"></div></div>',
        link: function(scope, ele, attrs, tabCtrl){
            scope.width = document.documentElement.clientWidth;
            tabCtrl.setPanels(scope);
        }
    }
}).directive('tabs', ['$ionicScrollDelegate', function($ionicScrollDelegate){
        var winWidth = document.documentElement.clientWidth;

        return {
            restrict: 'AE',
            transclude: true,
            replace: true,
            scope: {
                index: '=',
                isHeaderBor: '@',
                isScroll: '@'
            },
            controller: ['$scope', function($scope){
                $scope.panels = [];
                $scope.childrenLen = 0;

                this.setPanels = function(scope) {

                    if ($scope.panels.length == 0) {
                        scope.active = true;
                    } else {
                        scope.active = false;
                    }
                    $scope.childrenLen += 1;
                    $scope.panels.push(scope);
                    $scope.width = ($scope.childrenLen * winWidth) + 'px';
                }



                this.index = $scope.index || 0;


            }],
            template: '<div class="slide-tabs"><div class="tab-header-wrap"><ion-scroll delegate-handle="nav" style="width:100%" direction="x"  scrollbar-x="false" style="height: 34px" ><div class="slide-tab-header" >' +
            '<div class="tab-header-box"  ng-class="{active: panel.active }" on-tap="selectHandle($event, $index, panel)" ng-repeat="panel in panels" >' +
            '<div class="tab-header-style" ng-class="{\'show-bor\': isHeaderBor}"><span>{{panel.title}}</span></div></div></div></ion-scroll></div>' +
            '<div class="slide-tab-cont"  ng-transclude ></div></div>',
            link: function(scope, ele, attrs, ctrl){
                var winW = document.documentElement.clientWidth,
                  oNav = $ionicScrollDelegate.$getByHandle('nav'),
                  oNavW,
                  oActiveBox = null;


                scope.selectHandle = function($event, $index, panel){


                    angular.forEach(scope.panels, function(panel){
                        panel.active = false;
                    })
                    panel.active = true;

                    setTimeout(function(){
                        scope.$apply(function(){
                            scope.index = $index;
                        });

                    }, 0);

                  oActiveBox = parent($event.target, 'tab-header-box');
                  oNavW = oActiveBox.offsetWidth * scope.panels.length;
                  willCenter(oActiveBox)
                }

                function parent(o, selector){
                  var result = o;

                  while (result.nodeType == 1 && !result.classList.contains(selector)) {

                    result = result.parentNode;
                  }
                  return result;
                }



                function willCenter(dom){

                  var posData = dom.getBoundingClientRect(),
                    oDomW = dom.offsetWidth,
                    offsetL = dom.offsetLeft,
                    offsetR = oNavW - offsetL + oDomW;


                  if ( offsetL < winW/2 ) {
                    oNav.scrollTo(0, 0, true)
                  } else if (offsetR < winW / 2) {
                    oNav.scrollTo(oNavW - offsetR, 0, true);
                  } else {
                    oNav.scrollTo(Math.abs(offsetL - winW/2 + oDomW/2), 0, true);
                  }
                }
            }
        }
    }]).directive('slideTab', function(){
    return {
        restrict: 'AE',
        transclude: true,
        replace: true,
        require: ['^?slideTabs'],
        scope: {
            title: '@',  // tab title

        },
        template: '<div class="slide-tab" style="width: {{width}}px" > <div ng-transclude ></div></div>',
        link: function(scope, ele, attrs, tabCtrl){
            tabCtrl = tabCtrl[0];
            scope.width = document.documentElement.clientWidth;
            tabCtrl.setPanels(scope);
        }

    }
}).directive('slideTabs', function(){
        var winWidth = document.documentElement.clientWidth;

        return {
            restrict: 'AE',
            transclude: true,
            replace: true,
            scope: {
                index: '=',
                isHeaderBor: '@'
            },
            controller: ['$scope', function($scope){
                $scope.panels = [];
                $scope.childrenLen = 0;
                this.stopOtherScroll = false;
                this.setPanels = function(scope) {

                    $scope.childrenLen += 1;
                    $scope.panels.push(scope);
                    $scope.width = ($scope.childrenLen * winWidth) + 'px';
                }

                this.index = $scope.index || 0;
            }],
            template: '<div class="slide-tabs"><div class="tab-header-wrap"><ion-scroll id="scroll-header" style="width:100%" direction="x"  scrollbar-x="false" style="height: 34px"><div class="slide-tab-header" >' +
            '<div class="tab-header-box"  ng-class="{active: $index == index}" on-tap="selectHandle($index)" ng-repeat="panel in panels" >' +
            '<div class="tab-header-style" ng-class="{\'show-bor\': isHeaderBor}"><span>{{panel.title}}</span></div></div></div></ion-scroll></div>' +
            '<div class="slide-tab-cont"  ><div class="slide-tab-one" ng-transclude style="width: {{width}}"></div></ion-scroll></div></div>',
            link: function(scope, ele, attrs, ctrl){

                var tabCont = ele[0].querySelector('.slide-tab-one'),
                    tabHeaderBox,
                    touchData = {},
                    ratio = 1,
                    index = scope.index,
                    isAnimation = true,
                    touch = null,
                    isScroll = false;

                scope.selectHandle = function($index){



                    if ($index != undefined) {

                        index = $index;
                        scope.index = $index;
                        setTimeout(function(){
                            scope.$apply();
                        }, 0)
                    }
                    tabCont.style.webkitTransitionDuration = '300ms';
                    tabCont.style.transitionDuration = '300ms';
                    tabCont.style.webkitTransform = 'translate3d(' + (-index * winWidth) + 'px, 0, 0)';
                    tabCont.style.transform = 'translate3d(' + (-index * winWidth) + 'px, 0, 0)';




                }

                function getEleTransform(ele){
                    var re = /\s([0-9\.]*)\p/;

                    var translate = ele.style.webkitTransform;

                    var result =  re.exec(translate);

                    return result && result[1];
                }


                tabCont.addEventListener('touchstart', function(event){
                    isAnimation = true;
                    touch = {
                        touchTime: new Date().getTime(),
                        touchX: event.touches[0].pageX,
                        touchY: event.touches[0].pageY,
                        touchDistance: 0,
                        countDistance: -1,

                    }
                  ctrl.stopOtherScroll = undefined;

                })

                tabCont.addEventListener('touchmove', function(event){

                    if (event.touches.length == 1) {

                        if (ctrl.stopOtherScroll === false) {
                          event.preventDefault();
                          return;
                        }
                        tabCont.style.transitionDuration = '0ms';
                        tabCont.style.webkitTransitionDuration = '0ms';
                        // 滑动的距离
                        touch.touchDistance = event.touches[0].pageX - touch.touchX;


                        // 左右滑动的距离小于上下的
                        if (Math.abs(touch.touchDistance) < Math.abs(event.touches[0].pageY -touch.touchY)) {

                          if (ctrl.stopOtherScroll == undefined) {
                            ctrl.stopOtherScroll = false;
                          }
                          isAnimation = false;

                        } else {

                          isAnimation = true;
                          if (ctrl.stopOtherScroll == undefined) {
                            ctrl.stopOtherScroll = true;
                          }

                        }

                        // 滑动到两端进行限制
                        if ((touch.touchDistance > 0  && index == 0) || (touch.touchDistance < 0 &&  index == (scope.childrenLen-1))) {
                          isAnimation = false;
                          return;
                          //ratio -= (touch.touchDistance / winWidth);
                        }

                        // 减速
                        touch.touchDistance = touch.touchDistance * ratio;
                        touch.countDistance = -index * winWidth + touch.touchDistance;

                        tabCont.style.webkitTransform = 'translateX(' + touch.countDistance + 'px)'
                        tabCont.style.transform = 'translateX(' + touch.countDistance + 'px)'
                      }



                    //event.preventDefault();
                })
                tabCont.addEventListener('touchend', function(event){
                    touch.touchTime = new Date().getTime() - touch.touchTime;

                    // 滑动时间小于250 或者 滑动的距离大于屏幕的一半
                    if (isAnimation && (touch.touchTime < 250 || Math.abs(touch.touchDistance) > winWidth/2)){

                        // 右滑动
                        if (isAnimation && touch.touchDistance < 0) {
                            index += 1;
                        }
                        // 左滑动
                        else if (isAnimation && touch.touchDistance > 0) {
                            index -= 1;
                        }
                    }
                    scope.selectHandle(index);
                    ctrl.stopOtherScroll = undefined;
                    return;
                })




            }
        }
    })

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../components/slideTab/SlideTabsDirective.js","/../components/slideTab")
},{"../../js/directiveModule.js":36,"buffer":2,"rH1JPG":4}],8:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var directiveModule = require('../../js/directiveModule.js');
/**
 * date 2016-10-19
 * auth zhang
 * tel 15210007185
 */

directiveModule.directive('selectPicker', function(){
    return {
        restrict: 'AE',
        replace: true,
        transclude: true,
        scope: {
            picker: '=',
            pickerVal: '='
        },
        template: '<div class="select-pick"><span class="ion-ios-arrow-back" ng-click="pickLeft()" ng-disabled="pickerVal==0"></span>' +
        '<em>{{picker[pickerVal]}}</em><span class="ion-ios-arrow-forward" ng-click="pickRight()"  ng-disabled="pickerVal==(picker.length-1)"></span></div>',
        link: function(scope, ele, attrs, toggelPanelCtrl){
            var index = scope.pickerVal;

            // 选择左边
            scope.pickLeft = function(){

                if (scope.pickerVal == 0) return;
                scope.pickerVal --;
            }

            // 选择右边
            scope.pickRight = function(){
                if (scope.pickerVal == (scope.picker.length-1)) return;
                scope.pickerVal ++;
            }
        }
    }
})
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../components/toggle/SelectPickDirective.js","/../components/toggle")
},{"../../js/directiveModule.js":36,"buffer":2,"rH1JPG":4}],9:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var directiveModule = require('../../js/directiveModule.js');
/**
 * date 2016-10-19
 * auth zhang
 * tel 15210007185
 */

directiveModule.directive('togglePanel', function(){
    return {
        restrict: 'AE',
        replace: true,
        transclude: true,
        template: '<div ng-transclude></div>',
        controller: ['$scope', function($scope){
            var panels = $scope.panels = [];

            this.pushPanel = function(panel){

                panel.active = false;
                panels.push(panel);
            }

            // 点击显示
            this.showHandle = function(scope){

                if (scope.active == true) {
                    scope.active = false;
                    return;
                }
                angular.forEach(panels, function(panel){
                    panel.active = false;
                    scope.active = true;
                })
            }

        }]

    }

}).directive('panel', function(){
    return {
        restrict: 'AE',
        replace: true,
        transclude: true,
        require: '^?togglePanel',
        template: '<div ng-transclude ng-click="showHandle()" ng-class="{\'active-show\': active}"></div>',
        link: function(scope, ele, attrs, toggelPanelCtrl){
            toggelPanelCtrl.pushPanel(scope);

            scope.showHandle = function(){
                toggelPanelCtrl.showHandle(scope);
            }
        }
    }
})
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../components/toggle/TogglePanelDirective.js","/../components/toggle")
},{"../../js/directiveModule.js":36,"buffer":2,"rH1JPG":4}],10:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var controllerModule = require('../../js/controllerModule.js');

/**
 * 活动
 * date 2016-11-13
 * auth zhang
 * tel 15210007185
 */
controllerModule
    .controller('SignCtrl', ['$scope', 'globalServices', 'activityServices', function($scope, globalServices, activityServices) {
        var bBtn = true;

        $scope.signData = {
            activityPrizeList: [0,1,2,3,4,5]
        }
        $scope.count = -1;
        activityServices.getActivity($scope);
        $scope.againOnce = function(){
            bBtn = true;
            $scope.signData = {
                activityPrizeList: [0,1,2,3,4,5]
            }
        }
        $scope.signHandle = function(index){

            if ($scope.count == 0 || bBtn == false) return;
            bBtn = false;

            activityServices.receiveSign($scope.activityId).then(function(re){
                var tempArr = re.activity.activityPrizeList,
                    tempObj;

                angular.forEach(tempArr, function(card, i){

                    if (card.prizeValue == re.activity.prizeValue) {
                        tempObj = tempArr.splice(i, 1);
                    }
                })

                tempArr.splice(index, 0, tempObj[0]);

                $scope.signData = re.activity;
                $scope.active = index;
                $scope.count --;
            })
        }
    }])

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/activity/ActivityCtrl.js","/../containers/activity")
},{"../../js/controllerModule.js":35,"buffer":2,"rH1JPG":4}],11:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var serviceModule = require('../../js/serviceModule.js');

/**
 * @date 2016-10-22
 * @auth zhang
 * @tel 15210007185
 */

// 开奖
serviceModule.factory('activityServices', ['globalServices', function(globalServices) {
    /**
     * lotteryCode 001 => 双色球
     * lotteryCode 002 => 福彩3D
     * lotteryCode 113 => 大乐透
     * lotteryCode 108 => 排列三
     * lotteryCode 109 => 排列五
     * lotteryCode 004 => 七乐彩
     * lotteryCode 110 => 七星彩
     * lotteryCode 018 => 北京快三
     * lotteryCode 011 => 江苏快三
     * lotteryCode 010 => 安徽快三
     * lotteryCode 110 => 七星彩
     * lotteryCode 110 => 七星彩
     */

    return {
        getActivity: function($scope){

            return globalServices.serialPost('3500', 'detail', {activityId: 'A014800561377970001'}).then(function(re){

                // 活动已经结束
                if (re.activity.status != 1) {
                  $scope.activityId = re.activity.activityId;

                  // 还有参加条件
                  if (re.activity.attendedTimes < re.activity.attendTimes) {
                    re.activity.activityPrizeList = $scope.signData.activityPrizeList
                    $scope.count = re.activity.attendTimes - re.activity.attendedTimes;
                  } else {
                    $scope.count = 0;
                  }
                }


                $scope.signData = re.activity;

            });
        },
        receiveSign: function(activityId) {
            return globalServices.post('3500', 'join', {activityId: activityId});
        }

    }
}])

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/activity/activityServices.js","/../containers/activity")
},{"../../js/serviceModule.js":39,"buffer":2,"rH1JPG":4}],12:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var controllerModule = require('../../js/controllerModule.js');

/**
 * date 2016-10-20
 * auth zhang
 * tel 15210007185
 */

/**
 * lotteryCode 001 => 双色球
 * lotteryCode 002 => 福彩3D
 * lotteryCode 113 => 大乐透
 * lotteryCode 108 => 排列三
 * lotteryCode 109 => 排列五
 * lotteryCode 004 => 七乐彩
 * lotteryCode 110 => 七星彩
 * lotteryCode 018 => 北京快三
 * lotteryCode 011 => 江苏快三
 * lotteryCode 010 => 安徽快三
 * lotteryCode 110 => 七星彩
 * lotteryCode 110 => 七星彩
 */

// 彩种走势
controllerModule.controller('BonusTrendCtrl', ['$scope',  '$stateParams', 'bonusTrendServices',
    function($scope,  $stateParams, bonusTrendServices) {


          // 默认tab显示的
          $scope.default = {
              index: 0,  // tab 显示的索引
              pickerVal: 0,
              issueNum: [],
              remnantW: document.documentElement.clientWidth-60,
          }

          $scope.issueList = [];


          // 页面的title
          $scope.bonusTitle = bonusTrendServices.getLotteryName($stateParams.id);

          $scope.$watch('default.index', function (newVal, oldVal) {
              if (newVal == oldVal) return;
              $scope.$broadcast('hideMore')

          })

          var sign;

          $scope.$watch('default.pickerVal', function (newVal, oldVal) {

              if (newVal == oldVal) return;
              $scope.$broadcast('hideMore');

          });

          // 滚动加载
          $scope.$on('loadMore', function(){
              $scope.loadMore();
          });
          switch ($stateParams.id) {
              case '001':
                  $scope.default.signHC = 'SSQ';
                  $scope.default.digitArr = new Array(33);
                  break;
              case '002':

                  $scope.default.signHC = '3D';
                  break;
              case '113':
                  $scope.default.digitArr = new Array(35);
                  $scope.default.signHC = 'DLT';
                  break;
              case '108':

                  $scope.default.signHC = 'PL3';
                  break;
              case '109':
                  $scope.default.digitArr = [0, 2, 4, 6, 8];
                  $scope.default.signHC = 'PL5';
                  break;
              case '004':

                  $scope.default.signHC = '7LC';
                  break;
              case '110':
                  $scope.default.digitArr = [0, 2, 4, 6, 8, 10, 12]
                  $scope.default.signHC = '7XC';
                  break;
              case '018':
                  $scope.default.signHC = 'BJK3';
                  break;
              case '010':
                $scope.default.signHC = 'AHK3';
                break;
              case '011':
                $scope.default.signHC = 'JSK3';
                break;
              case '114':
                $scope.default.signHC = '115';
                break;
          }

          bonusIssue = bonusTrendServices.bonusIssue($scope.default.signHC, $scope);

          /**
           * 加载数据
           * @param index {String} 是不是下拉加载的凭证（不为空就下拉加载）
           * @param isRefersh {Boolean} 重新加载数据
           */
          $scope.loadMore = function (index, isRefersh){
            //$scope.issueList = bonusTrendServices.issueDataHandle($scope.default.signHC).slice(0, 20);
            bonusIssue(index, isRefersh);

          }

         $scope.$on('$ionicView.afterEnter', function(){
           $scope.isMore = true;
           $scope.loadMore(0, true);
         })




    }])
  .controller('BonusK3Ctrl', ['$scope', '$stateParams', 'bonusTrendServices',
    function($scope, $stateParams, bonusTrendServices) {


      // 默认tab显示的
      $scope.default = {
        index: 0,  // tab 显示的索引
        issueNum: [],
        remnantW: document.documentElement.clientWidth-60
      }

      $scope.isMore = true;
      $scope.isMoreGroup = true;

      // 页面的title
      $scope.bonusTitle = bonusTrendServices.getLotteryName($stateParams.id);

      switch ($stateParams.id) {
        case '018':
          $scope.default.signHC = 'BJK3';
          break;
        case '010':
          $scope.default.signHC = 'AHK3';
          break;
        case '011':
          $scope.default.signHC = 'JSK3';
          break;
      }


      $scope.$on('$ionicView.afterEnter', function(){

          bonusTrendServices.chartKSGroup($stateParams, $scope, 'group');

      })

      $scope.$on('$ionicView.leave', function(){
        // 清除缓存的期次
        bonusTrendServices.issueHandle($scope.default.signHC, '');

      })

      // 改变组合数据
      $scope.$on('changeGroupData', function(event, groupData){

        $scope.groupData = groupData;
      })

      var bonusIssue = bonusTrendServices.bonusIssue($scope.default.signHC, $scope);

      /**
       * 加载数据
       * @param index {String} 是不是下拉加载的凭证（不为空就下拉加载）
       * @param isRefersh {Boolean} 重新加载数据
       */
      $scope.loadMore = function (index, isRefersh){

        // 获取开奖的平均数据
        !$scope.sumData && bonusTrendServices.chartSum($stateParams.id).then(function(re){
          $scope.sumData = re;
        });

        bonusIssue(index, isRefersh);
      }
    }])


}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/bonustrend/BonusTrendCtrl.js","/../containers/bonustrend")
},{"../../js/controllerModule.js":35,"buffer":2,"rH1JPG":4}],13:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var directiveModule = require('../../js/directiveModule.js');

/**
 * data 2016-10-26
 * auth zhang
 * tel 15210007185
 *
 */
directiveModule.directive('bonusFull', ['bonusTrendServices', '$rootScope', function(bonusTrendServices, $rootScope) {


    return {
        restrict: 'AE',
        transclude: true,
        replace: true,
        scope: {
            signCache: '=',
            sign: '@',
            issueList: '='
        },
        template: '<div><div class="column-body">' +
                '<div style="width:60px"><section></section></div>'+
                '<div class="column-left-other cont"><section class="column-scroll-x" chart-client-width></section></div>'+
                '</div></div>',
        link: function(scope, ele, attrs){
            var winH, winW,ifr1win,
                scrollL,scrollDom;


            ifr1win = ele.find('section')[1];
            winH = document.documentElement.clientHeight;
            winW = document.documentElement.clientWidth;

            ifr1win.onscroll = function(event){
                scrollDom = ele[0].parentNode.querySelector('section');
                scrollL = event.target.scrollLeft;

                if (scrollDom) {

                    scrollDom.style.webkitTransform = 'translate3d('+ -scrollL + 'px, 0, 0)';
                    scrollDom.style.transform = 'translate3d(' + -scrollL + 'px, 0, 0)';
                }


            }

          var oSection1 = ele.find('section')[0];
          var oSection2 = ele.find('section')[1];


          var i = 0;
          scope.$watch('sign', function(newVal, oldVal){

            i += 1;

            if (i > 1) {
              if (newVal.indexOf('def') > -1){

                showChart(scope.signCache);
              }
            }

          })
          scope.$watch('issueList', function(newVal, oldVal){

            if (newVal) {
              showChart();
            }
          })

          function showChart(sign){
            var oc1, oc2,
              data = scope.issueList;
            if (!data.length) return;
            if (!sign) {
              oc1 = drawChartIssue(data);
              oSection1.appendChild(oc1);
            } else {
              oSection2.innerHTML = '';
              data = bonusTrendServices.issueData[sign];
            }


            oc2 = drawChart(data, scope.sign);
            oSection2.appendChild(oc2);
          }
          /**
           *
           * @param oCanvas
           * @param datas
           */
            function drawChartIssue(datas){
              var cellW = 120, cellH = 68,
                ocW = cellW,
                ocH = cellH * datas.length;

              var oCanvas = document.createElement('canvas');
              oCanvas.width = ocW;
              oCanvas.height = ocH;



            if (oCanvas.getContext) {
                var oc = oCanvas.getContext('2d');

                datas.forEach(function(data, index){

                    drawNum(oc, cellW, cellH, index, data.issue);

                })
              oCanvas.style.width = ocW /2 + 'px';
              oCanvas.style.height = ocH / 2+ 'px';
              return oCanvas;
            }

              function drawNum(oc, width, height, rowIndex, num) {



                if (rowIndex % 2) {
                  oc.beginPath();
                  oc.fillStyle = '#f4f4f4';
                  oc.fillRect(0, rowIndex * cellH, cellW, cellH);
                  oc.closePath()
                }

                oc.beginPath();
                oc.lineWidth = 1;
                oc.strokeStyle = '#ddd';

                oc.moveTo(0, rowIndex*height + height);
                oc.lineTo(width, rowIndex*height + height);

                oc.lineTo(width, rowIndex*height);
                oc.stroke();

                oc.beginPath();
                oc.font = "24px Arial";
                oc.fillStyle = '#666';
                oc.textAlign = 'center';
                oc.textBaseline = 'middle';
                oc.fillText(num,  width / 2, rowIndex * height + height / 2);
              }

            }

          /**
           *
           * @param oCanvas
           * @param datas
           * @param sign
           */
            function drawChart(datas, sign){

              var cellW = 60, cellH = 68,
                contW = document.documentElement.clientWidth - 60,
                cellLen = datas[0].yiLou[sign].length;

              if (contW > cellLen * 30) {
                cellW = contW / cellLen * 2;
              }

            var oCanvas = document.createElement('canvas');
              var ocH = datas.length * cellH;
              var ocW = cellLen * cellW,
                  arcStyle = (sign == 'blue' ? '#167CE8' : '#ff3939');
              oCanvas.width = ocW ;
              oCanvas.height = ocH ;


              if (oCanvas.getContext) {
                var oc = oCanvas.getContext('2d');

                datas.forEach(function(data, index){
                  data.yiLou[sign].forEach(function(nums, i){
                    drawNum(oc, cellW, cellH, index, i, nums, arcStyle);
                  })
                })
                oCanvas.style.width = ocW /2 + 'px';
                oCanvas.style.height = ocH / 2+ 'px';
                return oCanvas;
              }

              function drawNum(oc, width, height,  rowIndex, cellIndex, num, arcStyle) {


                if (rowIndex % 2) {
                  oc.beginPath();
                  oc.fillStyle = '#f4f4f4';
                  oc.fillRect(cellIndex * cellW, rowIndex * cellH, cellW, cellH);
                  oc.closePath()
                }

                if (num == 0) {

                  if (sign == 'red' || sign == 'blue') {
                    num = cellIndex + 1;
                  } else {
                    num = cellIndex;
                  }

                  oc.beginPath();
                  oc.fillStyle = arcStyle;
                  oc.arc(cellIndex * width + width / 2, rowIndex * height + height / 2, height / 2 - 10, 0, Math.PI * 2);
                  oc.fill();
                  oc.fillStyle = '#fff';
                } else {
                  oc.fillStyle = '#666';
                }


                oc.beginPath();
                oc.lineWidth = 1;
                oc.strokeStyle = '#ddd';

                oc.moveTo(cellIndex * width, rowIndex*height);
                oc.lineTo(cellIndex * width, rowIndex*height + height);

                oc.lineTo(cellIndex * width + width, rowIndex*height + height);
                oc.stroke();

                oc.beginPath();
                oc.font = "24px Arial";

                oc.textAlign = 'center';
                oc.textBaseline = 'middle'
                oc.fillText(num, cellIndex * width + width / 2, rowIndex * height + height / 2);


              }
            }
        }
    }
}])

    //查看更多
.directive('showMore', ['bonusTrendServices', '$stateParams', function(bonusTrendServices, $stateParams) {

    return {
        restrict: 'AE',
        transclude: true,
        replace: true,
        scope: {
            pickerVal: '=',
            signArr: '=',
            index: '=',
            isFull: '='
        },
        templateUrl:'miss.html',
        link: function(scope, ele, attrs){

            var once = true,
                chartSum,
                signSup;

            scope.bBtn = false;
            scope.promptTitle = '查看历史统计';
            scope.totalSum = [];
            scope.avgYiLou = [];
            scope.maxYilou = [];
            scope.maxLianChu= [];
            scope.winW = document.documentElement.clientWidth;


            function setData(chartSum){
                // 是数组
                if (angular.isArray(scope.signArr[scope.index])){

                    signSup = scope.signArr[scope.index][scope.pickerVal];

                } else {
                    signSup = scope.signArr[scope.index];
                }

                scope.totalSum = chartSum.totalSum[signSup] || chartSum.totalSum.def && chartSum.totalSum.def.slice(scope.index*10, scope.signArr[scope.index] + scope.index*10);
                scope.avgYiLou = chartSum.avgYiLou[signSup] || chartSum.totalSum.def && chartSum.avgYiLou.def.slice(scope.index*10, scope.signArr[scope.index] + scope.index*10);
                scope.maxYiLou = chartSum.maxYiLou[signSup] || chartSum.totalSum.def && chartSum.maxYiLou.def.slice(scope.index*10, scope.signArr[scope.index] + scope.index*10);
                scope.maxLianChu = chartSum.maxLianChu[signSup] || chartSum.totalSum.def && chartSum.maxLianChu.def.slice(scope.index*10, scope.signArr[scope.index] + scope.index*10);

            }

            scope.showSum = function(){

                scope.bBtn = !scope.bBtn;

                if (scope.bBtn) {
                    ele.css('height', '180px');
                    scope.promptTitle = '收起历史统计';
                    if (once) {
                        once = false;
                        setTimeout(function(){
                          // 获取开奖的平均数据
                          bonusTrendServices.chartSum($stateParams.id).then(function (re) {
                            chartSum = re;
                            setData(chartSum);
                          })
                        }, 100)

                    } else {
                        setData(chartSum);
                    }




                } else {
                    ele.css('height', '44px');
                    scope.promptTitle = '查看历史统计';
                }





            }

            scope.$on('hideMore', function(){
                ele.css('height', '44px');
                scope.promptTitle = '查看历史数据';
                scope.bBtn = false;
            })
        }
    }
}])  // 设置图表高度
.directive('chartHeight', function(){

    return{
        restrict: 'AE',
        link: function(scope, ele, attrs){
            winW = document.documentElement.clientWidth;

            ele.css({'height': document.documentElement.clientHeight - 160 + 'px'})
        }
    }
})
  .directive('chartClientWidth', function(){

      return{
          restrict: 'AE',
          link: function(scope, ele, attrs){
              winW = document.documentElement.clientWidth;

              ele.css({'width': (winW - 60) + 'px'})
          }
      }
  })
  .directive('issue', function(){
    return {
      restrict: 'AE',
      replace: true,
      scope: {
        issueData: '='
      },
      template: '<div class="bonus-row"><div class="bonus-col bg-fdd9d9" ng-repeat="number in issueData track by $index" style="width:{{width}}px"><span >{{number}}</span></div></div>',
      link: function(scope, ele, attrs){
        var contW = document.documentElement.clientWidth - 60,
            len =  scope.issueData.length;

        scope.width = 30;


        if (contW > scope.width * len) {
          scope.width = contW / len;
        }
      }

    }})
  .directive('showGroup', ['bonusTrendServices', function(bonusTrendServices){
    return{
      restrict: 'AE',
      scope: {
        sign: '@'
      },
      template: '<div class="group-more" ><h3 class="group-header" on-tap="showLayer()">{{playName}}<i class="icon icon-down-more" ng-class="{\'direction-up\': isUp}"></i></h3>' +
        '<div class="group-title-list"><div><em  on-tap="selectHandle()" ng-class="{active: playName == \'组合\'}">全部组合</em></div>' +
        '<div ng-repeat="groups in cacheData track by groups.playName"><em  on-tap="selectHandle(groups.playName)" ng-class="{active: \'\' + groups.playName == playName}">{{groups.playName}}</em></div></div></div>',
      link: function(scope, ele, attrs){
        var oList = ele.find('div')[0].querySelector('.group-title-list'),
            groupData = [];

        scope.cacheData = bonusTrendServices.issueDataHandle(scope.sign);

        scope.playName = '组合';
        scope.selectHandle = function(arg){

          if (!arg) {
            groupData = scope.cacheData;
            scope.playName = '组合';

          } else {
            angular.forEach(scope.cacheData, function(data, index){

              if (data.playName == arg) {
                scope.playName = arg;
                groupData = scope.cacheData.slice(index, index+1);
              }
            })
          }
          translateToY(0);

          document.body.scrollTop = document.documentElement.scrollTop = 0;
          scope.$emit('changeGroupData', groupData);
          scope.isUp = false;
        }
        scope.showLayer = function(){
          var y;

          if (scope.isUp) {
            y = 0;
          } else {
            y = -oList.offsetHeight;
          }

          translateToY(y);
          scope.isUp = !scope.isUp;
        }

        function translateToY(y){

          oList.style.transform = 'translate3d(0, ' + y + 'px, 0)';
          oList.style.webkitTransform = 'translate3d(0, ' + y + 'px, 0)';
        }
      }
    }
  }])
  .directive('bonusK3', ['bonusTrendServices', '$rootScope', function(bonusTrendServices, $rootScope) {


    return {
      restrict: 'AE',
      transclude: true,
      replace: true,
      scope: {
        sign: '@',
        issueList: '=',
        sumData: '='
      },
      template: '<section></section>',
      link: function(scope, ele, attrs){
        scope.isOffLine = $rootScope.isOffLine;
        scope.winW = document.documentElement.clientWidth;

        var oSection = ele[0],
            index = 0;




        scope.$watch('issueList', function(newVal, oldVal){
          index += 1;

          if (newVal) showChart(scope.sign, index < 2);
        })
        function showChart(sign, isAdd){
          var oc,
            data = getConcatData(sign, isAdd);

          oc = drawChart(data, sign, isAdd);
          oSection.appendChild(oc);
        }

        /**
         * 重新组合数据
          * @param newVal
         */
        function getConcatData(sign, isAdd){

          var sumData = angular.copy(scope.sumData),
              result = [];
          angular.copy(scope.issueList, result);

          if (isAdd) {

            // 和值 4-10
            if (sign.indexOf('sum4') > -1) {
              angular.forEach(result, function(val){
                if (val.yiLou.sum) {
                  val.yiLou.def = val.yiLou.sum.slice(0, 7);
                }
              })
              sign = 'sum';
              shiftData(0, 7);
            } else if (sign.indexOf('sum11') > -1) {
              angular.forEach(result, function(val){
                if (val.yiLou.sum) {
                  val.yiLou.def = val.yiLou.sum.slice(7, 15);
                }
              })
              sign = 'sum';
              shiftData(7, 7);
            } else if (sign.indexOf('span') > -1) {
              angular.forEach(result, function(val){
                if (val.yiLou.span) {
                  val.yiLou.def = val.yiLou.span
                }
              })
              shiftData();
            } else {
              shiftData();
            }

          }
          angular.forEach(result, function(val, index){
            var newArr = val.yiLou.def;
            newArr.unshift(val.issue.substring(4));

            if (index == 0 && isAdd) {

              newArr.splice(1, 0, '最大遗漏');

            } else if (index == 1 && isAdd){
              newArr.splice(1, 0, '平均遗漏')

            } else {
              newArr.splice(1, 0, val.bonusNumber.split(',').join(' '))

            }
          })


          return result;

          function shiftData(index, len){
            if (angular.isArray(result)) {

              // 添加最大遗漏
              result.unshift({
                issue: '',
                yiLou: {
                  def: sign == 'sum' ? sumData.avgYiLou[sign].slice(index, index + len) : sumData.avgYiLou[sign]
                }
              });

              // 添加平均遗漏
              result.unshift({
                issue: '',
                yiLou: {
                  def: sign == 'sum' ? sumData.maxYiLou[sign].slice(index, index + len) : sumData.maxYiLou[sign]
                }
              });
            }
          }
        }


        /**
         *
         * @param oCanvas
         * @param datas
         * @param sign
         * @param isAdd 是否添加其他样式
         */
        function drawChart(datas, sign, isAdd){
          var cellW = 60, cellH = 68,
            winW = document.documentElement.clientWidth,
            cellLen = datas[0].yiLou.def.length;


          if (cellLen <= 10) {
            cellW = ((winW - 120) / (cellLen - 2)) * 2;

          }

          var ocH = datas.length * cellH;
            arcStyle = '#ff3939',
              oCanvas = document.createElement('canvas');
          oCanvas.width = winW * 2;
          oCanvas.height = ocH;

          if (oCanvas.getContext) {
            datas.forEach(function(data, index){
              data.yiLou.def.forEach(function(nums, i){
                drawNum(oCanvas, cellW, cellH, index, i, nums, arcStyle);
              })
            })
            return oCanvas;
          }

          function drawNum(oCanvas, width, height,  rowIndex, cellIndex, num, arcStyle) {
            var oc = oCanvas.getContext('2d'),
              bg;


            if (rowIndex == 0 && isAdd) {
              bg = '#FCF2CE';

            } else if (rowIndex == 1 && isAdd) {
              bg = '#DFEFFF';
            } else {
              if (rowIndex % 2) {
                bg = '#f4f4f4';
              } else {
                bg = '#fff';
              }
            }
            drawRect(oc, width, bg);

            if (cellIndex == 1 || cellIndex == 0) {

              drawLine(oc, rowIndex, cellIndex, 120, height);
              if ((cellIndex == 1 && rowIndex > 1) || (!isAdd && cellIndex ==1) ) {
                drawFont(oc, width, num, sign, {color: '#ff3939'});
              } else {
                drawFont(oc, width,  num, sign);
              }

            } else {
              drawLine(oc, rowIndex, cellIndex, width, height);
              drawFont(oc, width, num, sign);

            }

            oCanvas.style.width = winW  + 'px';
            oCanvas.style.height = ocH / 2 + 'px';

            function drawRect(oc, width, style){
              if (cellIndex == 0 || cellIndex == 1) {
                width = 120;

              }

              oc.beginPath();
              oc.fillStyle = style;

              if (cellIndex > 1) {
                oc.fillRect(cellIndex * width + (120 -width) * 2 , rowIndex * cellH, width, cellH);
              } else {
                oc.fillRect(cellIndex * width, rowIndex * cellH, width, cellH);
              }
            }
            function drawArc(){
              if (num === 0) {

                oc.beginPath();
                oc.fillStyle = arcStyle;

                if (cellIndex == 0) {
                  oc.arc(cellIndex * width + width / 2, rowIndex * height + height / 2, height / 2 - 10, 0, Math.PI * 2);

                } else if (cellIndex == 1) {
                  oc.arc(cellIndex * width + width / 2 + (120 -width), rowIndex * height + height / 2, height / 2 - 10, 0, Math.PI * 2);

                } else {
                  oc.arc(cellIndex * width + width / 2 + (120 -width) * 2, rowIndex * height + height / 2, height / 2 - 10, 0, Math.PI * 2);

                }
                oc.fill();

              }
            }
            function drawLine(oc, rowIndex, cellIndex, width, height){


              oc.beginPath();
              oc.lineWidth = 1;
              oc.strokeStyle = '#ddd';
              if (cellIndex == 0){
                oc.moveTo(cellIndex * width, rowIndex*height);
                oc.lineTo(cellIndex * width, rowIndex*height + height);
                oc.lineTo(cellIndex * width + width, rowIndex*height + height);

              } else if (cellIndex == 1){
                oc.moveTo(cellIndex * width + (120 -width), rowIndex*height);
                oc.lineTo(cellIndex * width + (120 -width), rowIndex*height + height);
                oc.lineTo(cellIndex * width + width + (120 -width), rowIndex*height + height);
              } else {
                oc.moveTo(cellIndex * width + (120 -width) * 2, rowIndex*height);
                oc.lineTo(cellIndex * width + (120 -width) * 2, rowIndex*height + height);
                oc.lineTo(cellIndex * width + width + (120 -width) * 2, rowIndex*height + height);
              }

              oc.stroke();
            }

            /*
             * @param oc
             * @param width
             * @param num
             * @param style
             * @param sign {写字的规则}
             */
            function drawFont(oc, width, num, sign, style){
              drawArc();
              var baseStyle = {};

              if (style) {
                baseStyle = style;
              } else if (num == 0) {
                baseStyle.color = '#fff';
              } else {
                baseStyle.color = '#666';
              }
              oc.beginPath();
              if (num === 0) {
                oc.fillStyle = baseStyle.color;
                num = cellIndex + ((sign == 'span') ? -2 : (sign == 'sum4') ? 2 : (sign == 'sum11') ? 9 : -1);
              } else {
                oc.fillStyle = baseStyle.color;
              }

              oc.font = "24px Arial";

              oc.textAlign = 'center';
              oc.textBaseline = 'middle';

              if (cellIndex == 0) {
                oc.fillText(num, 60, rowIndex * height + height / 2);

              } else if (cellIndex == 1) {
                oc.fillText(num, 180, rowIndex * height + height / 2);

              } else {
                oc.fillText(num, cellIndex * width + width / 2 + (120 - width) * 2, rowIndex * height + height / 2);

              }
            }
          }
        }
      }
    }
  }])
  .directive('scrollLoad', ['bonusTrendServices', '$rootScope', function(bonusTrendServices, $rootScope) {


    return {
      restrict: 'AE',
      transclude: true,
      replace: true,
      template: '<div style="width: 100%"><div class="off-line" ng-if="isOffLine">网络连接失败,请检查网络!</div>' +
      '<div class="loading-wrap" ng-if="!isOffLine"><span class="loading" style="-webkit-transform: rotate(0deg);"></span></div></div>',
      link: function (scope, ele, attrs) {

        var loading = null,
          bBtn = true,
          scrollT = 0,
          winH = document.documentElement.clientHeight,
          distance = attrs.distance || 40;

        if (!attrs.onInfinite) return;

        setTimeout(function(){
          window.onscroll = loadingData;
        }, 1000)

        function loadingData(){
          scrollT = document.body.scrollTop || document.documentElement.scrollTop;

          loading = ele[0].querySelector('.loading-wrap');

          if (bBtn) {
            bBtn = false;

            setTimeout(function(){

              if (loading && winH - loading.getBoundingClientRect().top > distance ) {
                scope.$apply(attrs.onInfinite);
              }
              bBtn = true;
            }, 100)
          }

        }
        if (attrs.isScrollLoad == 'false') {
          setTimeout(function(){
            loadingData();
          }, 100)
        }

      }
    }
  }])


}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/bonustrend/bonusDirective.js","/../containers/bonustrend")
},{"../../js/directiveModule.js":36,"buffer":2,"rH1JPG":4}],14:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var servicesModule = require('../../js/serviceModule.js');

/**
 *
 * 2016-10-20
 * @auth zhang
 * @tel 15210007185
 * 入口服务
 */


servicesModule.factory('bonusTrendServices', ['lotteryServices', 'globalServices', '$stateParams', '$rootScope', function(lotteryServices, globalServices, $stateParams, $rootScope){
    "use strict";
    return{
        issueData: {},
        /**
         * 缓存数据
         * @param sign {String}数据的key
         * @param data {Array} 数组数据
         * @param isClean {Boolean} 是否先清除数据
         */
        issueDataHandle: function(sign, data, isClean){

            if (data) {
                // 清除数据(重新缓存)
                if (isClean) {
                    this.issueData[sign] = [];
                }
                if (angular.isArray(this.issueData[sign])) {
                    this.issueData[sign] = this.issueData[sign].concat(data);
                } else {
                    this.issueData[sign] = data;
                }

            } else {

                return this.issueData[sign] || [];
            }

        },
        issue: {},
        issueHandle: function(sign, issue){

            this.issue[sign] = issue;
        },
        bBtn: true,
        bonusIssue: function(sign, $scope){

            var This = this,
                startI = 0;

            return function(index, isRefersh, fn){



                if (isRefersh) {
                    This.issueHandle(sign, '');
                }

                globalServices.serialPost(4001, 'number', {lotteryCode: $stateParams.id, issue: (This.issue[sign] || ''), pageSize: 20}).then(function(re){

                    // 有数据
                    if (re.issueList.length > 0) {

                        This.issueDataHandle(sign, re.issueList, isRefersh);

                        This.issueHandle(sign, getLastIssue(re.issueList))


                    }

                    // 没有数据或最后一页的时候
                    if (re.issueList.length < 20){
                      dataHandle(re.issueList, 'nothing');
                      //dataHandle(This.issueData[sign], 'nothing');
                    } else {
                      dataHandle(re.issueList);
                      //dataHandle(This.issueData[sign]);
                    }

                    //$scope.$broadcast('drawChart', This.issueData[sign]);

                });


            }
          /**
           * 处理七乐彩数据
           * @param data
           */
            function changeData(data){
              angular.forEach(data, function(issue){
                angular.forEach([1,2,3], function(num, i){
                  issue.yiLou['def' + num] = issue.yiLou.def.slice(i*10,i*10+10);
                })

              })
            }
            /**
             * 处理十一选五数据
             * @param data
             */
            function change115Data(data){


              angular.forEach(data, function(issue){

                issue.issue = issue.issue.slice(-6);
                angular.forEach(issue.yiLou, function(val, key){

                  // 如果是前三
                  if (/three\d/.test(key)) {
                    if (!angular.isArray(issue.yiLou['three'])) {
                      issue.yiLou['three'] = [];
                    }
                    issue.yiLou['three'] = issue.yiLou['three'].concat(val);
                  }

                  // 如果是前二
                  if (/two\d/.test(key)) {

                    if (!angular.isArray(issue.yiLou['two'])) {
                      issue.yiLou['two'] = [];
                    }
                    issue.yiLou['two'] = issue.yiLou['two'].concat(val);
                  }
                })




              })
            }
            function dataHandle(data, isNothing){

                // 七乐彩数据重构
                if ($scope.default.signHC == '7LC') {
                  changeData(data);
                }

                if ($scope.default.signHC == '115') {
                  change115Data(data);
                }
                $scope.issueList = data;
                $rootScope.chart = 'chart';

                // 没有数据了
                if (isNothing) {
                  $scope.isMore = false;
                }

            }
            function getLastIssue(issueData){
                return issueData.slice(-1)[0].issue;
            }
            function hasIssue(issueStr){
                var bool = false;

                angular.forEach(This.issueData[sign], function(issue, index){

                    if (issue.issue == issueStr) {

                        bool = true;
                    }
                })
                return bool;
            }



        },
        chartSum: function(lotteryCode){
                return globalServices.post(4001, 'numberCount', {lotteryCode: lotteryCode});
        },
        chartKSGroup: function($stateParams, $scope, sign){

          var This = this;

          globalServices.serialPost(4001, 'k3', {lotteryCode: $stateParams.id}).then(function(re){

            // 有数据
            if (re.dataList.length > 0) {

              $scope.groupData = re.dataList;
              This.issueDataHandle(sign, re.dataList, true);
              $rootScope.chart = 'chart';
              $scope.isMoreGroup = false;
            }

          });
        },
        // 根据lotteryCode 得到彩种名称
        getLotteryName: function(lotteryCode){

          var lotteryName;

          switch (lotteryCode) {

            case '001':
              lotteryName = '双色球';
              break;
            case '002':
              lotteryName = '福彩3D';
              break;
            case '113':
              lotteryName = '大乐透';
              break;
            case '108':
              lotteryName = '排列三';
              break;
            case '109':
              lotteryName = '排列五';
              break;
            case '004':
              lotteryName = '七乐彩';
              break;
            case '110':
              lotteryName = '七星彩';
              break;
            case '011':
              lotteryName = '江苏快三';
              break;
            case '010':
              lotteryName = '安徽快三';
              break;
            case '018':
              lotteryName = '北京快三';
              break;
            // default:
          }
          return lotteryName;

        }
    }
}])

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/bonustrend/bonusTrendServices.js","/../containers/bonustrend")
},{"../../js/serviceModule.js":39,"buffer":2,"rH1JPG":4}],15:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var controllerModule = require('../../js/controllerModule.js');

/**
 * 算奖
 * date 2017-1-5
 * auth zhang
 * tel 15210007185
 */
controllerModule
  .controller('CalculateCtrl', ['$scope', 'globalServices', 'calculateServices', '$stateParams', function($scope, globalServices, calculateServices, $stateParams) {
    //Wechat.isInstalled(function (installed) {
    //  alert("Wechat installed: " + (installed ? "Yes" : "No"));
    //}, function (reason) {
    //  alert("Failed: " + reason);
    //});
    $scope.default = {
      isAdditional: false,
      lotteryName: '',
      lotteryCode: $stateParams.lotteryCode,
      bonusNumber: []
    }
    // 选号规则
    $scope.redBall = {
      number: [],
      ballLen: $stateParams.lotteryCode == '001' ? 33 : 35,
      minSize: $stateParams.lotteryCode == '001' ? 6 : 5
    };
    $scope.blueBall = {
      number: [],
      ballLen: $stateParams.lotteryCode == '001' ? 16 : 12,
      minSize: $stateParams.lotteryCode == '001' ? 1 : 2
    };
    // 清空选号
    $scope.cleanBall = function(){
      $scope.$broadcast('cleanBall');
    }

    // 获取最近十次开奖信息
    calculateServices.getLastIssue($scope);


    $scope.calculateHandle = function(){

      if ($scope.redBall.number.length < $scope.redBall.minSize) {
        globalServices.errorPrompt('红球最少选择' + $scope.redBall.minSize);
      } else if ($scope.blueBall.number.length < $scope.blueBall.minSize) {
        globalServices.errorPrompt('蓝球最少选择' + $scope.blueBall.minSize);
      } else {
        var number = $scope.redBall.number.join(',') + '#' + $scope.blueBall.number.join(',');
        calculateServices.calculateHandle({lotteryCode: $scope.default.lotteryCode, issue: $scope.issue, playCode: $scope.default.isAdditional ? '02' : '01', numbrer: number});
      }

    }
    $scope.share = function(){
      Wechat.share({
        message: {
          title: "Hi, there",
          description: "This is description.",
          thumb: "www/img/thumbnail.png",
          media: {
            type: Wechat.Type.LINK,
            webpageUrl: "http://tech.qq.com/"
          }
        },
        scene: Wechat.Scene.TIMELINE   // share to Timeline
      }, function () {

        alert("Success");
      }, function (reason) {
        alert("Failed: " + reason);
      });
    }
  }])

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/calculate/CalculateCtrl.js","/../containers/calculate")
},{"../../js/controllerModule.js":35,"buffer":2,"rH1JPG":4}],16:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var servicesModule = require('../../js/serviceModule.js');

/**
 *
 * 2017-1-11
 * @auth zhang
 * @tel 15210007185
 * 计算奖金服务
 */


servicesModule.factory('calculateServices', ['lotteryServices', 'globalServices', '$rootScope', function(lotteryServices, globalServices, $rootScope) {
  "use strict";
  return {
    getLastIssue: function($scope){
      globalServices.post(4000, 'list', {lotteryCode: $scope.default.lotteryCode, page: 1}).then(function(re){

        if (angular.isArray(re.issueList)) {
          lotteryServices.serializeLottery(re.issueList);
          $scope.lastIssue = re.issueList;

          $scope.default.lotteryName = re.issueList[0].lotteryName;
          $scope.default.bonusNumber = re.issueList[0].bonusNumber;
        }
      });
    },
    calculateHandle: function(arg){

      // playCode 01 => 单式 02 => 复式
      globalServices.serialPost(4000, 'calc', arg).then(function(re){

      });
    }
  }
}])

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/calculate/calculateServices.js","/../containers/calculate")
},{"../../js/serviceModule.js":39,"buffer":2,"rH1JPG":4}],17:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var controllerModule = require('../../js/controllerModule.js');

/**
 * date 2016-10-12
 * auth zhang
 * tel 15210007185
 */
// 充值
controllerModule.controller('RechargeCtrl', ['$scope', 'globalServices', function($scope, globalServices) {
    $scope.inputData = {
        amount: 10000,
        rechargeType: 'alipayWap'

    }

    // 选择充值金额
    $scope.selectamountHandle = function(amount){
        $scope.inputData.amount =  amount;
    }

    // 选择充值方式
    $scope.selectRechargeTypeHandle = function(type){
        $scope.inputData.rechargeType =  type;
    }

    // 提交充值请求
    $scope.rechargeSub = function(){



        globalServices.serialPost('3201', $scope.inputData.rechargeType, {amount: $scope.inputData.amount/100, mcoin: $scope.inputData.amount}).then(function(re){

         /// re = {rquestUrl: 'http://115.28.186.127:8080/yb_aliwap_pay/Yb_AliwapPay_Servlet', body: 'fdf'};

          var result = '',
            url = '';

          if ($scope.inputData.rechargeType == 'llfWap') {
            angular.forEach(re, function(val, key){
              result += key  + '=' + val + '&';

            })

            url = 'http://h5.icaimi.com/recharge.html?' + result;
          } else {
            url = re.requestUrl;
          }

          if (window.cordova && cordova.InAppBrowser) {
            var ref = window.open(encodeURI(url), '_system', 'location=yes');
          } else {
            location.href = url;
          }
        })
    }

}])

    // 优惠券
    .controller('CouponCtrl', ['$scope', 'capitalServices', function($scope, capitalServices) {


    // 默认tab显示的
    $scope.default= {
        index: 0
    };

    var noUse = $scope.noUse =  {
        page: 0,
        data: [],
        isMore: true,
        status: 0,
        index: 0
    };

    var used = $scope.used =  {
        page: 0,
        data: [],
        isMore: true,
        status: 2,
        index: 1,
    };

    var overdue = $scope.overdue =  {
        page: 0,
        data: [],
        isMore: true,
        status: 3,
        index: 2
    };

    //// 加载数据已使用
    $scope.loadNoUse = function(page, fn){
        capitalServices.getCoupon($scope, 'noUse', page, fn);

    }

    // 下拉刷新未使用
    $scope.doRefreshNoUse = function(){
        $scope.loadNoUse(1, function(){
            $scope.$broadcast('refreshComplete');
        })
    }

    //// 加载数据已使用
    $scope.loadUsed = function(page, fn){
        capitalServices.getCoupon($scope, 'used', page, fn);
    }

    // 下拉刷新已使用
    $scope.doRefreshUsed = function(){
        $scope.loadUsed(1, function(){
            $scope.$broadcast('refreshComplete');
        })

    }

    //// 加载数据已过期
    $scope.loadOverdue = function(page, fn){
        capitalServices.getCoupon($scope, 'overdue', page, fn);
    }

    // 下拉刷新已使用
    $scope.doRefreshOverdue = function(){
        $scope.loadOverdue(1, function(){
            $scope.$broadcast('refreshComplete');
        })

    }

    // 监听default.index变化
    $scope.$watch('default.index', function(newVal, oldVal){

        // 没有变化(第一次进入页面等...)
        if (newVal == oldVal) return;

        switch (newVal) {
            case 0:
                if (!noUse.page) {
                    $scope.loadNoUse();
                }
                break;
            case 1:
                if (!used.page) {
                    $scope.loadUsed();
                }
                break;
            case 2:
                if (!overdue.page) {
                    $scope.loadOverdue();
                }
                break;
        }
    })

}])
    // 账户余额
    .controller('BalanceCtrl', ['$scope', 'globalServices', 'capitalServices', function($scope, globalServices, capitalServices) {
        $scope.mcoin =  globalServices.userBaseMsg.mcoin || 0;
        $scope.default = {
            index: 0
        }

        //  全部
        var all = $scope.all =  {
            page: 0,
            data: [],
            isMore: true,
            status: 0,
            func: 'mcoin',
            cmd: '3200',
        };

        //  充值
        var recharge = $scope.recharge =  {
            page: 0,
            data: [],
            isMore: true,
            status: 1,
            func: 'list',
            cmd: '3201',
        };


        // 加载数据全部
        $scope.loadAll = function(page, fn){

            capitalServices.getCapitalChangeList($scope, $scope.all, page, fn);
        }

        // 下拉刷新全部
        $scope.doRefreshAll = function(){
            $scope.loadAll(1, function(){
                $scope.$broadcast('refreshComplete');
            })

        }
        // 加载数据充值记录
        $scope.loadRecharge = function(page, fn){

            // 加载数据回调函数
            var callback = function(){

                // 缓存充值列表
                capitalServices.rechargeListHandle($scope.recharge.data);

                if (fn) fn();

            }
            capitalServices.getCapitalChangeList($scope, $scope.recharge,  page, callback);
        }

        // 下拉刷新充值记录
        $scope.doRefreshRecharge = function(){
            $scope.loadRecharge(1, function(){

                $scope.$broadcast('refreshComplete');
            })

        }

        // 监听default.index变化
        $scope.$watch('default.index', function(newVal, oldVal){

            // 没有变化(第一次进入页面等...)
            if (newVal == oldVal) return;

            switch (newVal) {
                case 0:
                    if (!all.page) {
                        $scope.doRefreshAll();
                    }
                    break;
                case 1:
                    if (!recharge.page) {
                        $scope.doRefreshRecharge();
                    }
                    break;
                //default:
            }
        })
    }])
    //充值详情
    .controller('RechargeDetailCtrl', ['$scope', 'capitalServices', 'globalServices', '$stateParams', function($scope, capitalServices, globalServices, $stateParams){

        $scope.rechargeData = capitalServices.rechargeListHandle($stateParams.id);

        $scope.mcoin = globalServices.userBaseMsg.mcoin;

    }])

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/capital/CapitalController.js","/../containers/capital")
},{"../../js/controllerModule.js":35,"buffer":2,"rH1JPG":4}],18:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var serviceModule = require('../../js/serviceModule.js');

serviceModule.factory('capitalServices', ['globalServices', function(globalServices){

    return {

        // 充值记录列表
        rechargeList: [],

        // 处理充值列表
        rechargeListHandle: function(param){

            var result;

            // 是数据
             if (angular.isArray(param)) {
                 this.rechargeList = param;
             } else {
                 angular.forEach(this.rechargeList, function(recharge, index){

                     if (recharge.orderId == param) {
                         result = recharge;
                     }
                 })
             }
            return result;

        },
        /*
         * @param scope {Object} scope对象
         * @tabObj {Object} 当前传递过来的数据
         * @page {String} 指定加载的页码
         * @fn {Function} 回调函数
         */
        getCoupon: function(scope, key, page, fn){

            // 如果不是当前显示的就返回
            if (scope.default.index != scope[key].index) return;

            if (page) {
                scope[key].page = page;
            } else {
                scope[key].page += 1;
            }

            globalServices.serialPost('3202', 'list', {page: scope[key].page, status: scope[key].status}).then(function(re){

                // 没有返回数据
                if (re.couponList.length < 10) {
                    scope[key].isMore = false;
                }
                scope.$broadcast('scroll.infiniteScrollComplete');
                // 第一页
                if (scope[key].page == 1) {
                    scope[key].data = re.couponList;
                    // 下拉刷新时显示无线加载
                    if (re.couponList.length == 10) scope[key].isMore = true;
                } else {
                    scope[key].data = scope[key].data.concat(re.couponList);

                }



                if (fn) fn();
            })
        },
        /**
         *
         * @param scope {Object} 传递的scope对象
         * @param tabObj {Object} 当前tab传递的对象
         * @param func {String} 请求的地址
         * @param page {String} 请求的页码
         * @param fn {Function} 回调函数
         */
        getCapitalChangeList: function(scope, tabObj, page, fn){

            // 如果不是当前显示的就返回
            if (scope.default.index != tabObj.status) return;

            if (page) {
                tabObj.page = page;
            } else {
                tabObj.page += 1;
            }



            globalServices.serialPost(tabObj.cmd, tabObj.func, {page: tabObj.page}).then(function(re){

                var resultData = re.fillList || re.accountLogList;

                // 没有返回数据
                if (resultData.length < 10) {
                    tabObj.isMore = false;
                }
                // 第一页
                if (tabObj.page == 1) {
                    tabObj.data = resultData;

                    // 下拉刷新时显示无线加载
                    if (resultData.length == 10) tabObj.isMore = true;

                } else {
                    tabObj.data = tabObj.data.concat(resultData);

                }
                scope.$broadcast('scroll.infiniteScrollComplete');


                if (fn) fn();

            })
        }
    }
}])
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/capital/capitalServices.js","/../containers/capital")
},{"../../js/serviceModule.js":39,"buffer":2,"rH1JPG":4}],19:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var directiveModule = require('../../js/directiveModule.js');

// 密码输入框
directiveModule.directive('myInput', function(){
    return {
        restrict: 'AE',
        transclude: true,
        replace: true,
        scope: {
            value: '=',
            easyStyle: '@'
        },
        template: '<div style="-webkit-box-flex: 1; -webkit-flex: 1; flex:1; display: -webkit-box; -webkit-box-align: center">' +
        '<div ng-transclude style="box-flex: 1; -webkit-box-flex:1"></div>' +
        '<i ng-if="value" ng-class="{\'ion-close-round\': easyStyle, \'icon-clean\': !easyStyle}" ng-click="cleanHandler()"></i></div>',
        link: function(scope, ele, attrs){

            scope.cleanHandler = function(){
                scope.value = '';
            }

        }
    }
}).directive('number', function(){

    return {
        restrict: 'AE',
        require: '^ngModel',
        link: function(scope, ele, attrs, ngModelCtrl){

           var val;

           ele.bind('input', function(event){
               val = this.value;

               if (isNaN(val)) {
                   val = val.slice(0, -1);
                   this.value = val;
               }
               ngModelCtrl.$setViewValue(val);
           })


        }
    }
});
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/entry/InputDirective.js","/../containers/entry")
},{"../../js/directiveModule.js":36,"buffer":2,"rH1JPG":4}],20:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var controllerModule = require('../../js/controllerModule.js');
/*
 * date 2016-9-26
 * auth zhang
 * tel 15210007185
 *
 * 入口控制
 */

// 登录
controllerModule.controller('LoginCtrl', ['$scope', 'entryServices', '$ionicPopup', '$stateParams', '$ionicHistory', '$state', '$rootScope',
    function($scope, entryServices, $ionicPopup, $stateParams, $ionicHistory, $state, $rootScope) {

    $scope.inputData = {};
    $scope.isShow = true;



    var storyView = $ionicHistory.backView() || {},
        backURL,
        ele = entryServices.setHeader({
        back: function(){

            if (backURL = $stateParams.backURL) {
                $state.go(backURL);
            } else {
                $ionicHistory.goBack();
            }

        },
        isShow: $scope.isShow
    });
    $scope.$on('$destroy',function(){
        ele.remove();

    })
    // 登录
    $scope.loginSub = function(){
        entryServices.signIn($scope.inputData, $stateParams.backURL);
    }

    $scope.unionLogin = function(msg){

        var pop = $ionicPopup.show({

            template: '<div class="union-popup"><p class="fs-14">如果您已注册过彩米账号，输入密码即可关联到此账号。</p>' +
            '<label class="item item-input password-input"><em><span>账户:</span></em><input type="text"  ng-model="userName" placeholder="手机号/用户名" required>' +
            '</label><pass-word style="margin-bottom: 3px;" password="password" placeholder="请输入密码">密码:</pass-word><p class="c-red fs-13">密码错误，请重新输入</p></div>',
            title: '是否关联已注册过的彩米账号',
            scope: $scope,
            buttons: [
                { text: '不关联登陆' },
                {
                    text: '<b>关联并登录</b>',
                    type: 'c-red',
                    onTap: function(e) {

                        setTimeout(function(){
                            pop.close();
                        }, 1000)
                        e.preventDefault();
                    }
                },
            ]
        });

    }


}])
    // 注册
    .controller('RegisterCtrl', ['$scope', '$location', 'entryServices', function($scope, $location, entryServices) {

    $scope.inputData = {}

    $scope.formSub = function(){
        entryServices.createAccount($scope.inputData);
    }

}])
    // 忘记密码(发送手机和验证码验证)
    .controller('ForgetPasswordCtrl', ['$scope', '$location', 'entryServices', '$stateParams', function($scope, $location, entryServices, $stateParams) {

        $scope.inputData = {};

        $scope.formSub = function(){
            // 指定自己要跳转的页面的路由域
            entryServices.forgetPassword($scope.inputData, $stateParams.scopeURL);
        }

    }])
    // 验证成功后重设密码
    .controller('ResetPasswordCtrl', ['$scope', 'globalServices', 'entryServices', '$stateParams', function($scope, globalServices, entryServices, $stateParams) {

        $scope.inputData = {
            mobile: $stateParams.mobile
        };
        $scope.formSub = function() {
            if ($scope.inputData.password == $scope.inputData.repeatPassword) {
                entryServices.resetPassword($scope.inputData, 'tab.login');
            }
        }

    }])

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/entry/LoginController.js","/../containers/entry")
},{"../../js/controllerModule.js":35,"buffer":2,"rH1JPG":4}],21:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var directiveModule = require('../../js/directiveModule.js');

// 密码输入框
directiveModule.directive('passWord', function(){

    return {
        restrict: 'AE',
        transclude: true,
        replace: true,
        scope: {
            placeholder: '@',
            error: '@',
            validate: '=',
            password: '='
        },
        template: '<div class="item item-input password-input" style="position: relative; overflow: visible"><em ng-transclude is-hide ></em>' +
        '<input checkpassword ng-model="password"  type="password" placeholder={{placeholder}} required />' +
        '<i  ng-class="{iconshoweye: bBtn , iconlockeye: !bBtn}" ng-click="toggleEye()"></i><div ng-if="isShow" class="password-error" >{{error}}</div></div></div>',
        link: function(scope, ele, attrs){


            // 是否显示密码
            scope.bBtn = false;

            scope.toggleEye = function(event){

                var oInput =  ele.find('input')[0];

                if (scope.bBtn) {
                    oInput.setAttribute('type', 'password')
                } else {
                    oInput.setAttribute('type', 'text')

                }
                scope.bBtn = !scope.bBtn;

            };

            scope.$watch('validate', function(newVal, oldVal){

              if (newVal == scope.password) {
                scope.isShow = false;
              }
            })


        }
    }
}).directive('checkpassword', function(){
    var passwordRE = /^.{6,16}$/;
    return {
        link: function (scope, ele, attrs) {
            scope.isShow = false;

            // 不用错误提醒
            if (!scope.error) return;

            ele[0].onfocus =  function(){
                scope.isShow = false;
            };
            ele.bind('change', inputEvent);
            ele.bind('blue', inputEvent);

          function inputEvent(event){
            var val = ele[0].value;

            // 如果是重复密码
            if (scope.validate && scope.validate != val) {
              scope.isShow = true;
            } else if (passwordRE.test(ele[0].value)) {
              scope.isShow = false;
            } else {
              scope.isShow = true;
            }
            scope.$apply();

          }


        }

    }

}).directive('isHide', function(){
    return{
        restrict: 'AE',
        link: function(scope, ele, attrs){

            var html = ele[0].innerHTML;

            if (!html) {
                ele.remove();
            }
        }
    }
})

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/entry/PasswordInputDirective.js","/../containers/entry")
},{"../../js/directiveModule.js":36,"buffer":2,"rH1JPG":4}],22:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var directiveModule = require('../../js/directiveModule.js');

/**
 * 2016-9-22
 * @auth zhang
 * @tel 15210007185
 */

// 发送验证码
directiveModule.directive('sendcode', ['$timeout', 'globalServices', function($timeout, globalServices){

    return {
        restrict: 'AE',
        scope: {
            mobile: '=',
            func: '@'
        },
        template: '<div class="item item-input" style="z-index:6; overflow: visible"><input type="tel" maxlength="11" ng-maxlength="11" ng-model="mobile" placeholder="请输入你注册时的手机号" required >' +
            '<a class="assertive-btn small-btn send-btn" ng-class="{disabled: (mobile.length < 11) || !mobile }" ng-click="sendCode($event)" href="">{{btnText}}</a>' +
            '<p class="sended-tips service-tel" ng-show="bBtn">我们已发送了验证码到你的手机</p></div>',
        link: function(scope, ele, attrs){
            scope.btnText = '发送验证码';
            scope.bBtn = false;
            var countDown = (function(){
                var time = 60;

                return function(){
                    time --;
                    if (time == 0) {
                        $timeout.cancel();
                        scope.btnText = '发送验证码';
                        time = 60;
                        return;
                    } else {
                        scope.btnText = time + '秒';
                    }
                    $timeout(countDown, 1000);
                }
            }());

            scope.sendCode = function($event){
                var re = velidatePhone(scope.mobile);

                if (re === true) {
                    scope.error = '';

                    if (scope.btnText == '发送验证码'){

                        globalServices.serialPost('3104', scope.func, {mobile: scope.mobile}).then(function(re){

                            scope.bBtn = true;
                            countDown();

                        }, function(re){
                            "use strict";
                            console.log(re)
                        });
                    }
                } else {
                    scope.error = re;
                }

            };
            var velidatePhone = function(mobile, bool){
                var re = /1[3456789]\d{9}/,
                    re2 = /\S/;
                //为空
                if (!re2.test(mobile)) {

                    if (bool) return false;
                    return '亲，手机号不能为空哦';
                } else {
                    if (re.test(mobile)) {
                        return true;
                    } else {

                        if (bool) return false;
                        return '亲，手机号不正确哦';
                    }
                }
            };
            var velidateCode = function(){
                var re = /^[0-9]{6}$/,
                    re2 = /\S/;
                //为空
                if (!re2.test(scope.code)) {
                    return '亲，验证码不能为空哦';
                } else {
                    if (re.test(scope.code)) {
                        return true;
                    } else {
                        return '亲，验证码不正确哦';
                    }
                }
            };



        }
    }
}])

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/entry/SendCodeDirective.js","/../containers/entry")
},{"../../js/directiveModule.js":36,"buffer":2,"rH1JPG":4}],23:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var servicesModule = require('../../js/serviceModule.js');

/**
 *
 * 2016-09-28
 * @auth zhang
 * @tel 15210007185
 * 入口服务
 */
servicesModule.factory('entryServices', ['globalServices', '$state', '$rootScope', '$document', '$compile', function(globalServices, $state, $rootScope, $document, $compile){

    return {
        setHeader: function(data){

            var html = '<div class="login-header"><div on-tap="back()"><i class="ion ion-ios-arrow-back"></i></div></div>'

            var ele = angular.element(html),
                scope = $rootScope.$new();

            angular.extend(scope, {
                back: function(){
                    data.back();
                    ele.remove();

                }
            });
            $document.find('body').append(ele);
            $compile(ele)(scope);
            return ele;

        },
        // 登录
        signIn: function(data, backURL){
            var password = md5(data.password);

            globalServices.signIn({mobile: data.mobile, password: password}, function(re){

                if (re.token) {

                    // 缓存用户的账号信息（自动登录用）
                    globalServices.localStorageHandle('account', {mobile: data.mobile, password: password})
                    globalServices.setUserBaseMsg(re);
                    backURL = backURL ? backURL : 'tab.account';
                    $state.go(backURL);
                } else {
                    if (re.errCount > 0) {
                        globalServices.errorPrompt('用户名或密码错误');
                    } else if (re.errCount == 0) {
                        globalServices.errorPrompt('用户已被锁定');

                    }
                }

            })
        },

        // 注册
        createAccount: function (data) {
            var password = md5(data.password);

            if (data.password == data.repeatPassword) {
                globalServices.serialPost('3100', 'mobile', {mobile: data.mobile, testCode: data.testCode, password: password}).then(function (re) {
                    globalServices.setUserBaseMsg(re);
                    globalServices.localStorageHandle('account', {mobile: data.mobile, password: password})
                    $state.go('tab.account');
                })
            }

        },
        /**
         * 忘记密码（发送验证码）
         * @params data {Object} 电话号码和验证码
         * @params scopeURL {String} 当前的路由域
         */

        forgetPassword: function(data, scopeURL){

            // 如果有指定路由域
            scopeURL = scopeURL ? 'tab.accountresetpassword' : 'tab.resetpassword';

            globalServices.serialPost('3105', 'forgetPassword', data).then(function(re){
                $state.go(scopeURL, {mobile: data.mobile})
            })
        },

        // 重置密码
        resetPassword: function(data, backURL){
            var password = md5(data.password);
            globalServices.serialPost('3103', 'resetPassword', {mobile: data.mobile, password: password}).then(function(re){
                $state.go(backURL);
            })

        }
    }

}])

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/entry/entryServices.js","/../containers/entry")
},{"../../js/serviceModule.js":39,"buffer":2,"rH1JPG":4}],24:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var controllerModule = require('../../js/controllerModule.js');
/**
 * @date 2016-11-18
 * @auth zhang
 * @tel 15210007185
 */

// 发现首页
controllerModule.controller('FoundCtrl', ['$scope', 'globalServices', 'foundServices', function($scope, globalServices, foundServices) {
    $scope.bouns = {};


    foundServices.getBouns($scope);


}])
    // 资讯
    .controller('ConsultCtrl', ['$scope', 'globalServices', 'foundServices', function($scope, globalServices, foundServices) {
        $scope.consults = globalServices.cache('consults', 10) || [];
        $scope.$on('$ionicView.beforeEnter', function(){
            $scope.isMore = true;
            var getConsult = foundServices.consult($scope);
            $scope.loadMore = function(){
                getConsult();
            }
            $scope.doRefresh = function() {
                getConsult(1);
            }


        })
        $scope.$on('$ionicView.afterEnter', function(){
          $scope.$broadcast('loadImg');
        });

    }])
    // 资讯详情
    .controller('ConsultDetailCtrl', ['$scope', 'globalServices', 'foundServices', '$stateParams', function($scope, globalServices, foundServices, $stateParams) {
        $scope.consultDetail = {};
        $scope.consultDetail = globalServices.cache('consults', $stateParams.id);
        foundServices.getConsultByCode($scope,  $stateParams.id);
    }])
    // 公告
    .controller('NoticeCtrl', ['$scope', 'globalServices', 'foundServices', function($scope, globalServices, foundServices) {
        $scope.default = {
            index: 0
        }

        var notice = foundServices.notice($scope);
        var receiveNotice = foundServices.receiveNotice($scope);
        $scope.selfNotice = {
            doRefresh: function(){
                notice(1);

            },
            loadMore: function(){
                notice();
            },
            isMore: true,
            data: [],
            index: 0,
        }
        $scope.pushNotice = {
            doRefresh: function(){
                receiveNotice(1);

            },
            loadMore: function(){
                receiveNotice();
            },
            isMore: true,
            data: [],
            index: 1
        }
        $scope.selfNotice.data = globalServices.cache('notices', 10) || [];

        // 监听default.index变化
        $scope.$watch('default.index', function(newVal, oldVal){

            // 没有变化(第一次进入页面等...)
            if (newVal == oldVal) return;

            switch (newVal) {
                case 0:
                    if (!$scope.selfNotice.page) {
                        notice(1);
                    }
                    break;
                case 1:
                    if (!$scope.pushNotice.page) {
                        receiveNotice(1);
                    }
                    break;
            }
        })
    }])
    // 公告详情
    .controller('NoticeDetailCtrl', ['$scope', 'globalServices', 'foundServices', '$stateParams', function($scope, globalServices, foundServices, $stateParams) {

        // 推送详情页
        if ($stateParams.push) {
            foundServices.getPushNoticeByCode($scope, $stateParams.id);
        } else {
            $scope.noticeDetail = {};
            $scope.noticeDetail = globalServices.cache('notices', $stateParams.id);
            foundServices.getNoticeByCode($scope,  $stateParams.id);
        }



    }])




}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/found/FoundCtrl.js","/../containers/found")
},{"../../js/controllerModule.js":35,"buffer":2,"rH1JPG":4}],25:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var serviceModule = require('../../js/serviceModule.js');

/**
 * @date 2016-11-18
 * @auth zhang
 * @tel 15210007185
 */

// 开奖
serviceModule.factory('foundServices', ['globalServices', 'lotteryServices', '$sce', function(globalServices, lotteryServices, $sce) {
    return {
        /**
         * 请求数据返回处理函数
         * @param $scope {Object}
         * @param argPage {Number} 如果是下拉刷新
         * @param currentPage {Number} 当前页码
         * @param data {Array} 缓存的数据
         * @param cacheId {String} 缓存的key

         * @param limit {Number} 数据最大条数
         */
        responseDataHandle: function($scope, argPage, currentPage, data, cacheId, limit){

            if (data.isOffLine) {
              $scope.$broadcast('scroll.refreshComplete');
              $scope.$broadcast('scroll.infiniteScrollComplete');
              return;
            }

            if (currentPage == 1) {

                $scope[cacheId] = data;
                $scope.isMore = true;
                $scope.$broadcast('scroll.refreshComplete')
            } else {
                $scope[cacheId] =  $scope[cacheId].concat(data);


            }
            if (data.length < 10) {
              $scope.isMore = false;
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');

            // 缓存咨询数据
            globalServices.cache(cacheId, data);

        },
        getBouns: function($scope){
            globalServices.post('4000', 'last').then(function(re){
                re.issue.bonusNumber = lotteryServices.sliceNum(re.issue.bonusNumber);
                $scope.bonus = re.issue;
            });
        },
        /**
         * 取缓存数据的指定数据
         * @param cacheId {String}
         * @param id
         * @returns {Array}
         */
        getDateById: function(cacheId, id){
            var reData = globalServices.cache(cacheId),
                result = [];

            angular.forEach(reData, function(data){

                if (data.id == id) {
                   result = data;
                }
            })
            return result;

        },
        /**
         * 获取资讯数据列表
         * @param $scope
         * @returns {Function}
         */
        consult: function($scope){

            var page = 0,
                This = this;

            return function(argPage){

                if (argPage) {
                    page = argPage;
                } else {
                    page += 1;
                }

                globalServices.serialPost('5000', 'newsList', {page: page, pageSize: 10}).then(function(re){
                    This.responseDataHandle($scope, argPage, page, re.newsList, 'consults', 10);

                });
            }

        },
        /**
         * 获取资讯详情
         * @param $scope
         * @param articleCode
         * @returns {Function}
         */
        getConsultByCode: function($scope, articleCode){

            globalServices.post('5000', 'newsDetail', {articleCode: articleCode}).then(function(re){

                if (re.news && re.news.content) {
                  re.news.content = $sce.trustAsHtml(re.news.content);
                }

                $scope.consultDetail = re && re.news;
            });
        },
        /**
         * 获取公告数据列表
         * @param $scope
         * @returns {Function}
         */
        notice: function($scope){
            var page = 0,
                This = this;

            return function(argPage){

                if ($scope.default.index !== $scope.selfNotice.index) return;

                if (argPage) {
                    page = argPage;
                } else {
                    page += 1;
                }

                globalServices.serialPost('5000', 'noticeList', {page: page, pageSize: 10}).then(function(re){

                    if (argPage){
                        $scope.selfNotice.isMore = true;
                        $scope.$broadcast('refreshComplete');
                    }

                    if ((re.noticeList.length < 10) && (page == 1)) {
                        $scope.selfNotice.isMore = false;
                        $scope.selfNotice.data = re.noticeList;
                    } else {
                        $scope.selfNotice.data =  $scope.selfNotice.data.concat(re.noticeList);
                    }
                    // 缓存咨询数据
                    globalServices.cache('notices', re.noticeList);
                });

            }

        },
        /**
         * 接收消息
         * @param $scope
         * @returns {Function}
         */
        receiveNotice: function($scope){
            var page = 0,
                This = this;

            return function(argPage){

                if ($scope.default.index !== $scope.pushNotice.index) return;

                if (argPage) {
                    page = 0;
                    $scope.selfNotice.isMore = true;
                    $scope.$broadcast('refreshComplete');
                }

                var result = globalServices.localStorageHandle({key: 'notices', page: page, pageSize: 10}) || [];

                angular.forEach(result, function(re){
                    // 时间序列化
                    re.createTime = This.timeHandle(re.createTime);
                })
                page += 1;

                if (page == 1) {
                    $scope.pushNotice.data = result;

                    if (result.length < 10) {
                        $scope.pushNotice.isMore = false;
                    }
                } else {
                    $scope.pushNotice.data =  $scope.pushNotice.data.concat(result);

                }
                $scope.$broadcast('scroll.infiniteScrollComplete');



            }

        },
        /**
         * 获取公告详情
         * @param $scope
         * @param noticeCode
         * @returns {Function}
         */
        getNoticeByCode: function($scope, noticeCode){

            globalServices.post('5000', 'noticeDetail', {noticeCode: noticeCode}).then(function(re){
                $scope.noticeDetail = re.notice;
            });
        },
        /**
         * 获取推送消息
         * @param $scope {Object}
         * @param pushNoticeCode {Number}
         * @returns {Object}
         */
        getPushNoticeByCode: function($scope, pushNoticeCode){
            var result = globalServices.localStorageHandle('notices');

            angular.forEach(result, function(obj){

                if (obj.pushNoticeCode == pushNoticeCode) {
                    $scope.noticeDetail = obj;
                }
            })


        },
        /**
         * 时间处理
         * @param time
         */
        timeHandle: function(time) {
            var oTimeDate = new Date(time),
                oDate = new Date(),
                todayTimes = oDate.getHours() * 3600;

            // 今天
            if ((oDate.getTime() - oTimeDate.getTime()) < todayTimes) {
                return oTimeDate.getHours() + ':' + oTimeDate.getMinutes();
            } else {
                return (oTimeDate.getMonth() + 1) + '/' + oTimeDate.getDate();
            }

        }
    }
}])

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/found/foundServices.js","/../containers/found")
},{"../../js/serviceModule.js":39,"buffer":2,"rH1JPG":4}],26:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var controllerModule = require('../../js/controllerModule.js');

/**
 * 首页
 */

controllerModule.controller('StartUpCtrl', ['$scope', 'globalServices', '$state', function($scope, globalServices, $state) {

    // 隐藏启动画面
    document.addEventListener("deviceready", function(){
        if(navigator && navigator.splashscreen) {
            navigator.splashscreen.hide();
        }
    }, false);

    $scope.startPlay = function(){
        globalServices.localStorageHandle('start', true);
        $state.go('tab.index');
    }
}])
    // 首页
    .controller('IndexCtrl', ['$scope', 'globalServices', 'indexServices', '$ionicScrollDelegate', '$rootScope', '$location', function($scope, globalServices, indexServices, $ionicScrollDelegate, $rootScope, $location) {

        document.addEventListener("deviceready", function(){
          initLoad();
          // 检查是否更新
          if (window.device) {
            globalServices.updateAPP();
          }

        }, false);


        function initLoad(){

            $scope.adList = globalServices.localStorageHandle('adList');
            $scope.lotteryList = globalServices.localStorageHandle('lotteryList');
            indexServices.getIndexLayer($scope);
        }




        $scope.$on('$ionicView.beforeEnter', function(){
          !window.device && initLoad();
          // 设置banner图高度
          $scope.banHeight = document.documentElement.clientWidth * 350/750 + 'px';
        });

        ////// 进入页面时
        $scope.$on('$ionicView.enter', function(){
          $scope.lotteryList = globalServices.localStorageHandle('lotteryList');
          $rootScope.rootTransparentHeader = false;
          $scope.$broadcast('loadImg');
        });

        $scope.repeatFinish = function(){
          $scope.$broadcast('loadImg');
        }
        // 页面加载完成
        $scope.$on('$ionicView.afterEnter', function(){
          globalServices.preImage(['./img/entry/login-bg.png',  './img/usercenter/bg_wo.png', './img/usercenter/ic_find_active.png', './img/usercenter/ic_programme_active.png', './img/usercenter/ic_house_active.png', './img/usercenter/ic_user_active.png']);
        })

    }])

    .controller('CustomizeCtrl', ['$scope', 'globalServices', function($scope, globalServices) {

        $scope.getImgPath = globalServices.getLotterySpell;
        $scope.lotteryList = globalServices.localStorageHandle('lotteryList');

        /**
         *
         * @param lotteryCode {Number}
         * @param status {String}
         */
        $scope.toggleHandle = function(lotteryCode, status){

            angular.forEach($scope.lotteryList, function(lottery){

                if (lottery.lotteryCode == lotteryCode) {
                    if (status == 1) {
                        lottery.status = 0;
                        globalServices.errorPrompt('已移除该彩种');
                    } else {
                        lottery.status = 1;
                        globalServices.errorPrompt('已成功添加该彩种');
                    }

                }
            })

            globalServices.localStorageHandle('lotteryList', $scope.lotteryList);

        }

    }])

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/index/IndexController.js","/../containers/index")
},{"../../js/controllerModule.js":35,"buffer":2,"rH1JPG":4}],27:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var serviceModule = require('../../js/serviceModule.js');

/**
 * @date 2016-10-22
 * @auth zhang
 * @tel 15210007185
 */

// 开奖
serviceModule.factory('indexServices', ['globalServices', '$rootScope', function(globalServices, $rootScope) {
    /**
     * lotteryCode 001 => 双色球
     * lotteryCode 002 => 福彩3D
     * lotteryCode 113 => 大乐透
     * lotteryCode 108 => 排列三
     * lotteryCode 109 => 排列五
     * lotteryCode 004 => 七乐彩
     * lotteryCode 110 => 七星彩
     * lotteryCode 018 => 北京快三
     * lotteryCode 011 => 江苏快三
     * lotteryCode 010 => 安徽快三
     * lotteryCode 110 => 七星彩
     * lotteryCode 110 => 七星彩
     */

    return {
        getIndexLayer: function($scope){
            var account = globalServices.localStorageHandle('account');

           globalServices.post('1000', 'start').then(function(re){
                var lotteryList;

                if (re.lotteryList) {
                    // status 0 => 要隐藏的彩种 1 => 要显示的彩种
                    angular.forEach(re.lotteryList, function(lottery, index){
                        if (index < 7) {
                            lottery.status= 1;
                        } else {
                            lottery.status = 0;
                        }
                    })

                    $scope.adList = re.adList;

                    globalServices.localStorageHandle('adList', re.adList);

                    // 第一次进入app
                    if (!(lotteryList = globalServices.localStorageHandle('lotteryList'))) {
                        $scope.lotteryList = re.lotteryList;
                        globalServices.localStorageHandle('lotteryList', re.lotteryList);

                    } else {
                        $scope.$broadcast('scroll.refreshComplete')
                    }
                }


               // 隐藏启动画面
               if(navigator && navigator.splashscreen) {

                   navigator.splashscreen.hide();
                   // 自动登录
                   globalServices.autoSignin(account)
               }
            });

        }
    }
}])

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/index/indexServices.js","/../containers/index")
},{"../../js/serviceModule.js":39,"buffer":2,"rH1JPG":4}],28:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var controllerModule = require('../../js/controllerModule.js');

/**
*date 2016-10-18
* auth zhang
* tel 15210007185
 */

// 开奖
controllerModule.controller('LotteryCtrl', ['$scope', 'lotteryServices', 'globalServices', function($scope, lotteryServices, globalServices){
    $scope.lotterys = [];



    /**
     * lotteryCode 001 => 双色球
     * lotteryCode 002 => 福彩3D
     * lotteryCode 113 => 大乐透
     * lotteryCode 108 => 排列三
     * lotteryCode 109 => 排列五
     * lotteryCode 004 => 七乐彩
     * lotteryCode 110 => 七星彩
     * lotteryCode 018 => 北京快三
     * lotteryCode 011 => 江苏快三
     * lotteryCode 010 => 安徽快三
     * lotteryCode 110 => 七星彩
     * lotteryCode 110 => 七星彩
     */
    $scope.lotterys = globalServices.localStorageHandle('lottery');
    $scope.$on('$ionicView.afterEnter', function(){
      lotteryServices.lottery($scope);
    });
    $scope.doRefresh = function(){
      lotteryServices.lottery($scope);
    }



}]).controller('LotteryListCtrl', ['$scope', 'lotteryServices', '$stateParams', function($scope, lotteryServices, $stateParams){
    $scope.lotteryList = [];
    $scope.lotteryCode = $stateParams.id;
    var lotteryBonus = lotteryServices.LotteryBonus($scope.lotteryCode);
    $scope.$on('$ionicView.afterEnter', function(){
        $scope.isMore = true;
        $scope.doRefresh = function(){
            $scope.loadMore(1, function(){
                $scope.$broadcast('scroll.refreshComplete')
            })
        }

        $scope.loadMore = function(page, fn){


            // 获取中奖信息
            lotteryBonus(page).then(function(re){

                if (re.isOffLine) {
                  $scope.$broadcast('scroll.refreshComplete');
                  $scope.$broadcast('scroll.infiniteScrollComplete');
                  return;
                }
                // 没有下一页
                if (re.issueList < 10) {
                    $scope.isMore = false;
                }

                // 追加数据
                if (!page && $scope.lotteryList.length ) {
                    $scope.lotteryList = $scope.lotteryList.concat(lotteryServices.serializeLottery(re.issueList));
                } else {
                    $scope.lotteryList = lotteryServices.serializeLottery(re.issueList);
                }
                $scope.lotteryTitle = $scope.lotteryList[0].lotteryName;

                // 下拉刷新
                if (fn) {
                    fn();
                } else {
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
            })
        }
    })

}])

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/lottery/LotteryCtrl.js","/../containers/lottery")
},{"../../js/controllerModule.js":35,"buffer":2,"rH1JPG":4}],29:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var serviceModule = require('../../js/serviceModule.js');

/**
 * @date 2016-09-30
 * @auth zhang
 * @tel 15210007185
 */

// 开奖
serviceModule.factory('lotteryServices', ['globalServices', function(globalServices){
    /**
     * lotteryCode 001 => 双色球
     * lotteryCode 002 => 福彩3D
     * lotteryCode 113 => 大乐透
     * lotteryCode 108 => 排列三
     * lotteryCode 109 => 排列五
     * lotteryCode 004 => 七乐彩
     * lotteryCode 110 => 七星彩
     * lotteryCode 018 => 北京快三
     * lotteryCode 011 => 江苏快三
     * lotteryCode 010 => 安徽快三
     * lotteryCode 110 => 七星彩
     * lotteryCode 110 => 七星彩
     */

    return{
        // 获取开奖信息
        lottery: function($scope){
            var This = this;

            globalServices.post(4000, 'index').then(function(re){

              $scope.lotterys = This.serializeLottery(re.issueList);
              $scope.$broadcast('scroll.refreshComplete');
              globalServices.localStorageHandle('lottery', $scope.lotterys);
            });
        },


        // 序列化开奖信息
      /**
       *
       * @param lotteryList {Array}
       * @returns {Array}
       */
        serializeLottery: function(lotteryList){
            var This = this,
                lotteryCode;

            if (!angular.isArray(lotteryList)) return [];

            angular.forEach(lotteryList, function(issue){
                lotteryCode = issue.lotteryCode;

                // 处理开奖号码
                issue.bonusNumber = This.sliceNum(issue.bonusNumber);

                // 处理时间
                try{
                    issue.bonusTime = issue.bonusTime.split(' ')[0];

                } catch(e){

                }

            })



            return lotteryList;
        },
        // 截取红篮球
        sliceNum: function(str){


            var firstSliceArr = [],
                result = [],
                blueArr = [];

            if (typeof str !== 'string') result;

            if (str.indexOf('#') != -1) {
                firstSliceArr = str.split('#');

                // 循环切割的数组
                angular.forEach(firstSliceArr, function(numArr, index){

                    // 红球不区分
                    if (index == 0) {
                        result = numArr.split(',');
                    } else {

                        // 篮球
                        blueArr = numArr.split(',');

                        angular.forEach(blueArr, function(num){

                            result.push({blueBool: num})
                        })
                    }

                })
            } else {

                // 如果没有开奖号码
                if (!str || str == '-') {
                    return '';
                }

                result = str.split(',');
            }
            return result;
        },

        // 获取彩种开奖信息
        LotteryBonus: function(lotteryCode){

            var page = 0;


            return function(argPage){

                if (!argPage) {
                    page ++;
                } else {
                    page = argPage;
                }
                return  globalServices.post(4000, 'list', {lotteryCode: lotteryCode, page: page});
            }


        }
    }

}])

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/lottery/lotteryServices.js","/../containers/lottery")
},{"../../js/serviceModule.js":39,"buffer":2,"rH1JPG":4}],30:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var controllerModule = require('../../js/controllerModule.js');

/**
 * 用户中心
 * @date 2016-10-27
 * @auth zhang
 * @tel 15210007185
 */

// 账户中心
controllerModule.controller('ProgrammeCtrl', ['$scope', 'globalServices', 'programmeServices', function($scope, globalServices, programmeServices) {
    $scope.programmes = [];
    $scope.isMore = true;
    //globalServices.showLoginLayout();

    $scope.loadMore = function(index){

        programmeServices.programme($scope, index)
    }
    $scope.doRefresh = function(){
        $scope.loadMore(1)
    };

}])


// 方案详情
.controller('ProgrammeDetailCtrl', ['$scope', 'globalServices', 'programmeServices', '$stateParams', '$ionicPopup', '$state', function($scope, globalServices, programmeServices, $stateParams, $ionicPopup, $state) {

    var programme = $scope.programme = programmeServices.getProgramme($stateParams.programmeCode);
    $scope.programme.couponAmount = $stateParams.couponAmount;
    $scope.programme.payCount = ($scope.programme.rewardAmount - $scope.programme.couponAmount) < 0 ? 0 : ($scope.programme.rewardAmount - $scope.programme.couponAmount);

    programmeServices.getAccountBalance(programme.lotteryCode, programme.rewardAmount, $scope);

    $scope.buySubmit = function(bool){
        if (bool) {
            $state.go('tab.programmerecharge', {backURL: ''})
        } else {
            programmeServices.buyProgramme($scope, programme.programCode, programme.rewardAmount, $stateParams.couponCode, $stateParams.couponAmount)
        }

    }

}])
// 使用优惠券
.controller('UseCouponCtrl', ['$scope', 'globalServices', 'programmeServices', '$stateParams', '$state', function($scope, globalServices, programmeServices, $stateParams, $state) {


        // 默认tab显示的
        $scope.default= {
            index: 0,
            lotteryCode: $stateParams.lotteryCode,
            amount: $stateParams.rewardAmount,

        };
        $scope.couponData = {};
        var sCouponCode, iCouponAmount;

        var noUse = $scope.noUse =  {
            page: 0,
            data: [],
            isMore: true,
            flag: 0
        };

        var used = $scope.used =  {
            page: 0,
            data: [],
            isMore: true,
            flag: 1
        };


        //// 加载数据已使用
        $scope.loadNoUse = function(page, fn){
            programmeServices.getCoupon($scope, 'noUse', page, fn);

        }

        // 下拉刷新未使用
        $scope.doRefreshNoUse = function(){
            $scope.loadNoUse(1, function(){
                $scope.$broadcast('refreshComplete');
            })
        }

        //// 加载数据已使用
        $scope.loadUsed = function(page, fn){
            programmeServices.getCoupon($scope, 'used', page, fn);
        }

        // 下拉刷新已使用
        $scope.doRefreshUsed = function(){
            $scope.loadUsed(1, function(){
                $scope.$broadcast('refreshComplete');
            })

        }



        // 监听default.index变化
        $scope.$watch('default.index', function(newVal, oldVal){

            // 没有变化(第一次进入页面等...)
            if (newVal == oldVal) return;

            switch (newVal) {
                case 0:
                    if (!noUse.page) {
                        $scope.loadNoUse();
                    }
                    break;
                case 1:
                    if (!used.page) {
                        $scope.loadUsed();
                    }
                    break;
            }
        })

        // 选择优惠券
        $scope.selectCoupon = function(couponCode, couponAmount){
            angular.forEach($scope.noUse.data, function(data){

                // 选择当前点击的
                if (data.couponId == couponCode) {
                    data.active = true;
                } else {
                    data.active = false;
                }
            })
            sCouponCode = couponCode;
            iCouponAmount = couponAmount;
        }
        $scope.useCoupon = function(){
            $state.go('tab.programmedetail', {programmeCode: $stateParams.programmeCode, couponCode: sCouponCode, couponAmount: iCouponAmount})
        }

}])
    // 方案订单详情
    .controller('ProgrammeOrderCtrl', ['$scope', 'programmeServices', '$stateParams', function($scope, programmeServices, $stateParams) {

        programmeServices.getOrderDetail($scope, $stateParams.orderCode);

    }])

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/programme/ProgrammeCtrl.js","/../containers/programme")
},{"../../js/controllerModule.js":35,"buffer":2,"rH1JPG":4}],31:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var serviceModule = require('../../js/serviceModule.js');

/**
 * @date 2016-09-30
 * @auth zhang
 * @tel 15210007185
 */

// 开奖
serviceModule.factory('programmeServices', ['globalServices', '$state', '$ionicPopup', 'lotteryServices', '$ionicTabsDelegate', function(globalServices, $state, $ionicPopup, lotteryServices, $ionicTabsDelegate){
    /**
     * lotteryCode 001 => 双色球
     * lotteryCode 002 => 福彩3D
     * lotteryCode 113 => 大乐透
     * lotteryCode 108 => 排列三
     * lotteryCode 109 => 排列五
     * lotteryCode 004 => 七乐彩
     * lotteryCode 110 => 七星彩
     * lotteryCode 018 => 北京快三
     * lotteryCode 011 => 江苏快三
     * lotteryCode 010 => 安徽快三
     * lotteryCode 110 => 七星彩
     * lotteryCode 110 => 七星彩
     */

    return{
        // 获取方案列表
        programme: (function(){
            var page = 0;

            /**
             * $scope {Object}
             * argPage {Number} 指定加载的页码
             *
             */
            return function($scope, argPage){

                if (!argPage) {
                    page ++;
                } else {
                    page = argPage;
                }

               globalServices.serialPost(2000, 'list', {page: page, pageSizepageSize: 10}).then(function(re){

                   if (re.isOffLine) {
                     $scope.$broadcast('scroll.refreshComplete');
                     $scope.$broadcast('scroll.infiniteScrollComplete');
                     return;
                   }
                   // 没有更多数据了
                   if (re.programList.length < 10) {
                       $scope.isMore = false;
                   }

                   // 直接覆盖数据
                   if (argPage) {
                       $scope.programmes = re.programList;
                       $scope.$broadcast('scroll.refreshComplete')
                   } else {
                       $scope.programmes = $scope.programmes.concat(re.programList);
                       $scope.$broadcast('scroll.infiniteScrollComplete');
                   }
                   globalServices.cache('programme', $scope.programmes);
                });;
            }
        }()),
        /**
         * 根据id获取方案
         * @param id
         * @returns {{}}
         */
        getProgramme: function(id){
            var programme = globalServices.cache('programme'),
                result = {};
            angular.forEach(programme, function(p){

                if (p.programCode == id) {
                    result = p;
                }
            })
            return result;
        },
        /**
         * 获取用户余额及优惠券
         * @param lotteryCode {String} 彩种code
         * @param rewardAmount {Number} 支付的金额
         */
        getAccountBalance: function(lotteryCode, rewardAmount, $scope){

            globalServices.post(3102, 'account', {amount: rewardAmount, lotteryCode: lotteryCode}).then(function(re){
                $scope.account = re;
            })


        },
        /**
         * 购买方案
         * @param programCode {String} 方案id
         * @param amount {Number} 支付金额
         * @param mcoin {Number} 用户余额
         * @param couponCode {String} 优惠券id
         * @param couponAmount {Number} 优惠券金额
         */
        buyProgramme: function($scope, programCode, amount, couponCode, couponAmount){
            $scope.data = {};
            var myPopup = $ionicPopup.show({
                template: '<div><p class="c-333 fs-15" style="margin: 15px 5px; padding-left:15px;border: 1px solid #ddd; border-radius:4px"><my-input><input type="password" id="password" ng-model="data.password" placeholder="登录密码" /></my-input></p><div class="c-red">{{data.wring}}</div></div>',
                title: '请输入您的登录密码',
                scope: $scope,
                buttons: [
                    {text: '取消'},
                    {
                        text: '确定',
                        type: 'c-red',
                        onTap: function (e) {
                            valdatePasswrod($scope.data.password, e);
                            e.preventDefault();
                        }
                    }
                ]
            });


            function valdatePasswrod(password, e){
                globalServices.serialPost(3102, 'password', {password: md5(password)}).then(function(re){


                    if (re.isTrue) {
                        myPopup.close();
                        buySubmit();
                    } else {

                        if (re.errCount == 0) {
                            $scope.data.wring = '您的账户已被锁定！'
                            setTimeout(function(){
                                myPopup.close();
                                $state.go('tab.login', {backURL: 'tab.index'});
                            }, 1000)

                        } else {
                            $scope.data.wring = '密码输入错误，您还有' + re.errCount + '次机会';
                        }
                    }
                })
            }
            function buySubmit(){

                var buyCount = ((amount-couponAmount) < 0 ? '0' : (amount-couponAmount));

                globalServices.serialPost(2000, 'buy', {programCode: programCode, amount: amount, mcoin: buyCount, couponCode: couponCode || '', couponAmount: couponAmount || ''}).then(function(re){
                    $ionicPopup.show({
                        template: '<div class="programme-success"><img src="./img/programme/chenggong.png" /><p>您选择的方案已订购成功<br/>祝您好运</p><style>.popup-body{overflow: visible;padding:0}</style></div>',
                        scope: $scope,
                        buttons: [
                            {text: '取消'},
                            {
                                text: '确定',
                                type: 'c-red',
                                onTap: function (e) {
                                    $state.go('tab.programmeorder', {orderCode: re.orderCode})
                                }
                            }
                        ]
                    });
                })

            }

        },
        /*
         * @param scope {Object} scope对象
         * @tabObj {Object} 当前传递过来的数据
         * @page {String} 指定加载的页码
         * @fn {Function} 回调函数
         */
        getCoupon: function(scope, key, page, fn){

            // 如果不是当前显示的就返回
            if (scope.default.index != scope[key].flag) return;

            if (page) {
                scope[key].page = page;
            } else {
                scope[key].page += 1;
            }

            globalServices.serialPost('3202', 'limitList', {lotteryCode: scope.default.lotteryCode, amount: scope.default.amount, page: scope[key].page, flag: scope[key].flag, pageSize: 10}).then(function(re){

                // 没有返回数据
                if (re.couponList.length < 10) {
                    scope[key].isMore = false;
                }
                scope.$broadcast('scroll.infiniteScrollComplete');

                // 第一页
                if (scope[key].page == 1) {
                    scope[key].data = re.couponList;
                    scope.couponData.canUseSize = re.canUseSize;
                    scope.couponData.cantUseSize = re.cantUseSize;
                    // 下拉刷新时显示无线加载
                    if (re.couponList.length == 10) scope[key].isMore = true;
                } else {
                    scope[key].data = scope[key].data.concat(re.couponList);
                }

                if (fn) fn();
            })
        },
        getOrderDetail: function($scope, orderId){


            globalServices.post(2100, 'detail', {orderCode: orderId}).then(function(re){

                re.order.bonusNumber = lotteryServices.sliceNum(re.order.bonusNumber);
                $scope.orderDetail = re.order;
            })
        }

    }

}])

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/programme/programmeServices.js","/../containers/programme")
},{"../../js/serviceModule.js":39,"buffer":2,"rH1JPG":4}],32:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var controllerModule = require('../../js/controllerModule.js');

/**
 * 用户中心
 * @date 2016-09-25
 * @auth zhang
 * @tel 15210007185
 */

// 账户中心
controllerModule.controller('UserAccountCtrl', ['$scope', 'globalServices', 'accountService', function($scope, globalServices, accountService) {

    $scope.imgHeight = document.documentElement.clientWidth * 480/750;


    $scope.doRefresh = function() {

        accountService.getAccount($scope)
    };

    // 处理下拉刷新隐藏页头
    $scope.startScroll = function(){

        globalServices.handleHeader();

    }

    // 显示分享层
    $scope.showShargeLayer = function(){

        accountService.share({
            shareHandle: function(msg){
                /**
                 * msg 1 微信朋友
                 *     2 微信朋友圈
                 *     3 微博
                 */

            }
        });

    }


    $scope.$on('$ionicView.afterEnter', function(){
      accountService.getAccount($scope)
    })
}])


//个人资料
controllerModule.controller('UserMsgCtrl', ['$scope', 'globalServices', '$state', '$ionicHistory', function($scope, globalServices, $state, $ionicHistory) {
   $scope.userData = globalServices.userBaseMsg;

    //退出登录
    $scope.outLogin = function(){

        // 清除缓存的账户信息
        globalServices.localStorageHandle('account', '');
        globalServices.setUserBaseMsg('');
        $ionicHistory.clearHistory();
        $state.go('tab.login')
    }

}])


// 用户名设置
.controller('UserNameCtrl', ['$scope', 'globalServices', 'accountService', function($scope, globalServices, accountService) {

    $scope.inputData = {
        mobile: globalServices.userBaseMsg.mobile,
        headImgUrl: globalServices.userBaseMsg.headImgUrl
    };

    $scope.submit = function(){
        accountService.setMemberName($scope.inputData.memberName);
    }

}])

// 个人头像
.controller('UserPhotoCtrl', ['$scope', 'globalServices', '$cordovaCamera', '$state', function($scope, globalServices,  $cordovaCamera, $state) {
    $scope.photoURL = globalServices.userBaseMsg.headImgUrl || './img/usercenter/userphoto.png',
        cancelFN = null;

        // 上传图像
    $scope.selectPhoto = function(){
        cancelFN = globalServices.selectPrompt({
            func: [
                {text: '从手机相册选择', sign: 0},
                {text: '照相', sign: 1},
            ],
            accept: function(sgin){
                selectUploadType(sgin);
            }
        });
    }
    $scope.$on('$destroy', function(){
        cancelFN && cancelFN();
    })
    try {
        var options = {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URI=0,
            allowEdit: true,
            encodingType: Camera.EncodingType.JPEG,
            targetWidth: 100,
            targetHeight: 100,
            popoverOptions: CameraPopoverOptions,
            saveToPhotoAlbum: false,
            correctOrientation:true
        };
    } catch(e){

    }
    function selectUploadType (sign) {
      var file, fr, imgData;

      // 不是app
      if (!window.device) {

        file = sign.files[0];



        if (!/image/.test(file.type)) {
          globalServices.errorPrompt('请选择正确的图像文件');
          return;
        }
        fr = new FileReader();

        fr.onload = function(e) {
          $scope.photoURL = e.target.result;
          imgData = $scope.photoURL.substring($scope.photoURL.indexOf('base64,') + 7);
          updateImg(imgData);
        };

        fr.readAsDataURL(file);
        return;
      };

      // 默认是图库
      var type = 'PHOTOLIBRARY';


      // 拍照
      if (sign == 1) {
        type = 'CAMERA';
      }

      try {
        options.sourceType = Camera.PictureSourceType[type];


        $cordovaCamera.getPicture(options).then(function (imageData) {
          $scope.photoURL = 'data:image/jpeg;base64,' + imageData;
          updateImg(imageData);

        })

      } catch(e){

      }
    }
    function updateImg(imageData){

      globalServices.post('3103', 'headImg', {headImgUrl: imageData}).then(function(re){

        if (re.fileUrl) {
          globalServices.userBaseMsg.headImgUrl = re.fileUrl;
          globalServices.setUserBaseMsg(globalServices.userBaseMsg);
        }
        $state.go('tab.usermsg');
      })
    }

}])

// 修改密码
.controller('ModityPasswordCtrl', ['$scope', 'accountService', function($scope, accountService) {
    $scope.inputData = {};
    $scope.formSub = function(){
        accountService.modifyPassword($scope.inputData);
    }
}])

// 设置密码
.controller('SetPasswordCtrl', ['$scope', 'accountService', function($scope, accountService) {
    $scope.inputData = {};
    $scope.formSub = function(){
        accountService.setPassword($scope.inputData);
    }
}])

// 绑定手机号
.controller('UserMobileCtrl', ['$scope', 'globalServices',  'accountService', function($scope, globalServices, accountService) {

        $scope.inputData = {};

        $scope.formSub = function(){
            accountService.bindMobile($scope.inputData.mobile)
        }

}])


// 联合账户
.controller('UserUnionCtrl', ['$scope', 'globalServices', '$ionicPopup', '$state', function($scope, globalServices, $ionicPopup, $state) {

        //var pop = $ionicPopup.show({
        //    template: '<div style="margin: 15px 0 5px"><pass-word style="margin-bottom: 3px;" password="password" placeholder="请输入密码"></pass-word><p class="c-red fs-13">密码错误，请重新输入</p></div>',
        //    title: '请输入密码',
        //    scope: $scope,
        //    buttons: [
        //        { text: '取消' },
        //        {
        //            text: '<b>确定</b>',
        //            type: 'c-red',
        //            onTap: function(e) {
        //
        //                setTimeout(function(){
        //                    pop.close();
        //                }, 1000)
        //                e.preventDefault();
        //            }
        //        },
        //    ]
        //});

        //$ionicPopup.show({
        //    template: '<div><p class="c-333 fs-16" style="margin: 20px 5px 3px;">您确定要解除微信账户与当前账户的绑定?。</p><p class="fs-13" style="margin: 0 5px 23px;">解除绑定后，您仅可通过当前账户绑定的手机号或用户名登录</p></div>',
        //    title: '解除联合绑定',
        //    scope: $scope,
        //    buttons: [
        //        { text: '取消' },
        //        {
        //            text: '<b>确定</b>',
        //            type: 'c-red',
        //            onTap: function(e) {
        //               alert(3)
        //            }
        //        },
        //    ]
        //});

        $scope.bindAccount = function(msg) {

            var pop = $ionicPopup.show({
                template: '<p class="c-333 fs-15" style="margin: 30px 5px 33px;">您尚未设置登陆密码，解绑联合账户后可能造成账户无法登陆。</p>',
                title: '解除联合绑定',
                scope: $scope,
                buttons: [
                    {text: '取消'},
                    {
                        text: '<b>马上设置</b>',
                        type: 'c-red',
                        onTap: function (e) {

                            // 通知设置密码页,设置密码成功后返回的页面
                            $state.go('tab.accountsetpassword');
                        }
                    },
                ]
            });
        }
}])
// 我的订单
    .controller('OrderCtrl', ['$scope', 'globalServices', 'accountService', '$state', function($scope, globalServices, accountService, $state) {

        $scope.orders = [];
        $scope.isMore = true;

        var getOrderList = accountService.orderList($scope);

        $scope.loadMore = function() {
            getOrderList();
        }
        $scope.doRefresh = function(){
            getOrderList(1);
        }
    }])


}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/usercenter/UserAccountController.js","/../containers/usercenter")
},{"../../js/controllerModule.js":35,"buffer":2,"rH1JPG":4}],33:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var serviceModule = require('../../js/serviceModule.js');

/**
 * @date 2016-09-30
 * @auth zhang
 * @tel 15210007185
 */

serviceModule.factory('accountService', ['globalServices', '$state', '$rootScope', '$document', '$compile', 'entryServices', function(globalServices, $state, $rootScope, $document, $compile, entryServices){
    return{
        getAccount: function($scope){
          $scope.accountInfo = globalServices.userBaseMsg;

            globalServices.post('3102', 'member', {})
                .then(function(re) {
                    $scope.accountInfo = re;
                    $scope.$broadcast('scroll.refreshComplete');
                    // 更新用户信息
                    globalServices.setUserBaseMsg(angular.extend({token: globalServices.userBaseMsg.token}, re));
                    globalServices.localStorageHandle('account', {"mobile": re.mobile, "password":  globalServices.localStorageHandle('account').password});
                }, function(msg){
                    $scope.$broadcast('scroll.refreshComplete');
                })
        },
        // 设置用户名
        setMemberName: function(memberName){
            globalServices.serialPost('3103', 'memberName', {memberName: memberName}).then(function(re){

                // 更新用户信息
                globalServices.setUserBaseMsg(angular.extend(globalServices.userBaseMsg, {memberName: memberName}))
                $state.go('tab.usermsg');
            })
        },
        // 绑定手机号
        bindMobile: function(mobile){
            globalServices.serialPost('3103', 'mobile', {mobile: mobile}).then(function(re){

                // 修改缓存用户信息（手机号已绑定）
                globalServices.setUserBaseMsg(angular.extend({mobile: mobile}, globalServices.userBaseMsg))
                $state.go('tab.usermsg', null, {reload: true});
            })
        },

        // 修改密码
        modifyPassword: function(data){

            var password = md5(data.password),
                oldPassword = md5(data.oldPassword);

            if (data.password == data.repeatPassword) {
                globalServices.serialPost('3103', 'password', {password: password, oldPassword: oldPassword}).then(function(re){

                    globalServices.localStorageHandle('account', {mobile: globalServices.userBaseMsg.mobile, password: password})
                    $state.go('tab.usermsg');
                })
            }

        },
        // 设置密码
        setPassword: function(data){

            data.mobile = globalServices.userBaseMsg.mobile;
            var password = md5(data.password);

            if (data.password != data.repeatPassword) return;
            globalServices.serialPost('3103', 'resetPassword', {mobile: data.mobile, password: password}).then(function(re){
                globalServices.localStorageHandle('account', {"mobile": data.mobile, "password": password})
                // 修改缓存用户信息（密码已设置）
                globalServices.setUserBaseMsg(angular.extend(globalServices.userBaseMsg, {setPassword: 1}))
                $state.go('tab.usermsg');
            })

        },
        /**
         * 获取订单列表
         * @param $scope
         * @returns {Function}
         */
        orderList: function($scope){
            var page = 0;

            return function(argPage){

                if (argPage) {
                    page = 0;
                }
                page += 1;

                globalServices.serialPost('2100', 'list', {page: page, pageSize: 20}).then(function(re){

                    if (!argPage) {
                        $scope.orders = $scope.orders.concat(re.orderList);
                        $scope.$broadcast('scroll.infiniteScrollComplete');
                    } else {
                        $scope.$broadcast('scroll.refreshComplete');
                        $scope.isMore = true;
                    }

                    if (re.itemTotal < 15) {
                        $scope.isMore = false;
                    }
                })
            }


        },
        // 分享
        share: function(params){
            var html = '<div class="share-layer" ng-click="closeLayer()"><div class="row"> <div class="col" ng-click="shareHandle(1)"><img src="./img/usercenter/bt_weixin.png" /><br/>微信</div>' +
                '<div class="col" ng-click="shareHandle(2)"><img src="./img/usercenter/bt_pengyouquan.png" />' +
                '<br/>朋友圈</div><div class="col" ng-click="shareHandle(3)"><img src="./img/usercenter/bt_weibo.png" /><br/>微博</div></div></div>';


            var dom = angular.element(html);
            var scope = $rootScope.$new();
            angular.extend(scope, {
                closeLayer: function(){
                    "use strict";
                    dom.remove();
                },
                shareHandle: params.shareHandle
            });
            $document.find('body').append(dom);

            $compile(dom)(scope);


        }

    }
}])

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/usercenter/accountServices.js","/../containers/usercenter")
},{"../../js/serviceModule.js":39,"buffer":2,"rH1JPG":4}],34:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
var controllerModule = require('../../js/controllerModule.js');

/**
 * 用户中心
 * @date 2016-10-27
 * @auth zhang
 * @tel 15210007185
 */

// 账户中心
controllerModule.controller('UserFuncCtrl', ['$scope', 'globalServices', 'accountService', function($scope, globalServices, accountService) {

    $scope.loadMore = function(){

        alert(3)
    }
    $scope.text = '张'

}])
}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/../containers/userfunc/UserFuncCtrl.js","/../containers/userfunc")
},{"../../js/controllerModule.js":35,"buffer":2,"rH1JPG":4}],35:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
//
module.exports = (function(){

    return angular.module('starter.controllers', []);


}())

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/controllerModule.js","/")
},{"buffer":2,"rH1JPG":4}],36:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
//
module.exports = (function(){
    return angular.module('starter.directives', [])

      // 设置高度
      .directive('setHeight', function(){
          "use strict";
          return{
              restrict: 'AE',
              link: function(scope, ele, attrs){

                  ele.css('height', document.documentElement.clientHeight - ele[0].getBoundingClientRect().top - 44 + 'px')
              }
          }
      })
      // checkbox
      .directive('checkBox', function(){

        return{
          restrict: 'AE',
          replace: true,
          scope: {
            name: '@',
            value: '='
          },
          template: ' <div class="checkbox-btn" on-tap="toggleHandle()"><i class="icon icon-arc" ng-class="{\'icon-selected\': value}"></i>{{name}}</div>',
          link: function(scope, ele, attrs){

            scope.toggleHandle = function(){
              scope.value = !scope.value;
            }
          }
        }
      })
      // delete
      .directive('deleteBtn', function(){
        return{
          restrict: 'AE',

          template: '<div class="delete-btn" on-tap="toggleHandle()"><i class="icon icon-delete"></i>{{name}}</div>',
          link: function(scope, ele, attrs){
            scope.name = attrs.name;

            scope.toggleHandle = function(){

              setTimeout(function(){
                scope.$apply(attrs.deleteHandle);
              }, 0)
            }
          }
        }
      })
      // 懒加载图片
      .directive('setTimeOutLoadImg', ['$ionicScrollDelegate', function($ionicScrollDelegate){
        return{
          restrict: 'AE',
          replace: true,
          transclude: true,
          template: '<ion-content  overflow-scroll="false" has-bouncing="true" delegate-handle="oScroll" on-scroll="scrollHandle()" ><div ng-transclude=""></div> </ion-content>',
          link: function(scope, ele, attrs){

            var oScroll = $ionicScrollDelegate.$getByHandle('oScroll'),
              winH = document.documentElement.clientHeight,
              scrollData = null, oImgs,
              oImg = null, imgSrc, bBtn = true;


            // 注册 => 页面加载完成后加载图片
            scope.$on('loadImg', function(){
              loadImg();
            });
            setTimeout(loadImg, 200);
            scope.scrollHandle = function(){

              if (!bBtn) return;
              bBtn = false;
              setTimeout(function(){
                scrollData = oScroll.getScrollPosition();
                loadImg();

                // 触发上级注册的scorlling 事件
                scope.$emit('scrolling', scrollData);

                bBtn = true;
              }, 300)

            }

            function loadImg(){
              oImgs = ele.find('img');

              angular.forEach(oImgs, function(img){
                imgSrc = img.getAttribute('_src');

                if (img.getBoundingClientRect().top < winH && imgSrc) {
                  oImg = new Image();

                  oImg.onload = loadedImg(img, imgSrc);
                  oImg.src = imgSrc;
                }
              });
            }

            function loadedImg (img, imgSrc){

              img.src = imgSrc;
              img.removeAttribute('_src');
              img.style.opacity = 1;
            }

          }
        }
      }])
      .directive('repeatFinish',function(){
        return {
          link: function(scope,element,attr){

            if(scope.$last == true){

              setTimeout(function() {
                scope.$eval(attr.repeatFinish)
              }, 1000)
            }
          }
        }
      })
      // 选号
      .directive('pickerBall', [function() {
        return {
          restrict: 'AE',
          replace: true,
          transclude: true,
          scope: {
            value: '='
          },
          template: '<div ng-transclude><em  on-tap="selectBall(ball.value)" ng-repeat="ball in ballNumber track by $index" ng-class="{active: ball.active}">{{ball.value}}</em></div>',
          link: function (scope, ele, attrs) {
            var len = scope.value.ballLen,
              numberArr = [];

            while (len --) {
              numberArr.push({
                active: false,
                value: scope.value.ballLen - len
              })
            }
            scope.ballNumber = numberArr;

            scope.selectBall = function(val){
              scope.value.number.push(val);

              angular.forEach(numberArr, function(ball, index){

                if (ball.value == val) {
                  ball.active = !ball.active;
                }
              })

            }
            /**
             * 清空选号
             */
            scope.$on('cleanBall', function(){

              angular.forEach(numberArr, function(ball, index){
                ball.active = false;
              })
              scope.value.number = [];
            })
          }
        }
      }])
      // 选号
      .directive('selectVal', [function() {
        return {
          restrict: 'AE',
          replace: true,
          transclude: true,
          scope: {
            value: '='
          },
          template: '<div class="select"><span>{{value.issue}}</span> <datalist><option on-tap="selectHandle(i.issue)" ng-repeat="i in value">{{i.issue}}</option></datalist></div>',
          link: function (scope, ele, attrs) {
            scope;
            scope.selectHandle = function(val){

            }
          }
        }
      }])
}())



require('../components/toggle/TogglePanelDirective.js');
require('../components/toggle/SelectPickDirective.js');
require('../containers/bonustrend/bonusDirective.js');
require('../components/scroll/TouchScrollDirective.js');

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/directiveModule.js","/")
},{"../components/scroll/TouchScrollDirective.js":6,"../components/toggle/SelectPickDirective.js":8,"../components/toggle/TogglePanelDirective.js":9,"../containers/bonustrend/bonusDirective.js":13,"buffer":2,"rH1JPG":4}],37:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){

require('./serviceModule.js');
require('./controllerModule.js');
require('./directiveModule.js');
require('./filterModule.js');

require('../containers/entry/entryServices.js');
require('../containers/entry/LoginController.js');

require('../containers/userfunc/UserFuncCtrl.js');

require('../containers/index/indexServices.js');
require('../containers/index/IndexController.js');

require('../containers/capital/capitalServices.js');
require('../containers/capital/CapitalController.js');

require('../containers/entry/SendCodeDirective.js');
require('../containers/entry/PasswordInputDirective.js');
require('../containers/entry/InputDirective.js');
require('../components/slideTab/SlideTabsDirective.js');
require('../components/dorpdown/DorpDown.js');

require('../containers/lottery/LotteryCtrl.js');
require('../containers/lottery/lotteryServices.js');

require('../containers/activity/ActivityCtrl.js');
require('../containers/activity/activityServices.js');

require('../containers/bonustrend/bonusTrendServices.js');
require('../containers/bonustrend/BonusTrendCtrl.js');

require('../containers/programme/programmeServices.js');
require('../containers/programme/ProgrammeCtrl.js');

require('../containers/found/foundServices.js');
require('../containers/found/FoundCtrl.js');

require('../containers/usercenter/accountServices.js');
require('../containers/usercenter/UserAccountController.js');


require('../containers/calculate/CalculateCtrl.js');
require('../containers/calculate/calculateServices.js');


angular.module('starter', ['ionic', 'ngCordova', 'starter.controllers', 'starter.services', 'starter.directives', 'starter.filters'])

.run(['$ionicPlatform', '$rootScope', '$ionicLoading', 'globalServices', '$ionicViewSwitcher', '$ionicHistory', '$location', '$ionicPopup', '$state',
    function($ionicPlatform, $rootScope, $ionicLoading, globalServices, $ionicViewSwitcher, $ionicHistory, $location, $ionicPopup, $state) {
    var account = globalServices.localStorageHandle('account'),
        token = globalServices.userBaseMsg.token;

    $ionicPlatform.ready(function() {

        if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            //cordova.plugins.Keyboard.disableScroll(true);
        }

        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleLightContent();
        }

        //启动极光推送服务
        if (window.plugins && window.plugins.jPushPlugin) {
            window.plugins.jPushPlugin.init();

            // 获取极光的注册用户id
            var onGetRegistradionID = function(data) {

                try {
                    globalServices.localStorageHandle('registrationId', data);

                } catch(exception) {
                    alert(exception);
                }
            }
            window.plugins.jPushPlugin.getRegistrationID(onGetRegistradionID);
            var onOpenNotification = function(event){



                var alertContent = {};
                alertContent.createTime = new Date() - 1;

                if(device.platform == "Android") {
                    alertContent.pushNoticeCode = event.extras['cn.jpush.android.MSG_ID'];
                    alertContent.content = event.alert;
                } else {
                    alertContent.pushNoticeCode = event['_j_msgid'];
                    alertContent.content = event.aps.alert;
                }

                globalServices.localStorageHandle('notices', [alertContent], true);
                return alertContent;


            }
          //var onReceiveMessage = function(event) {
          //  try {
          //    var message
          //    if(device.platform == "Android") {
          //      message = window.plus.Push.receiveMessage.message;
          //    } else {
          //      message = event.content;
          //    }
          //    alert(JSON.stringify(message))
          //  } catch(exception) {
          //    alert("JPushPlugin:onReceiveMessage-->" + exception);
          //  }
          //}
          //
          //document.addEventListener("jpush.receiveMessage", onReceiveMessage, false);
            document.addEventListener("jpush.receiveNotification", onOpenNotification, false);
            document.addEventListener("jpush.openNotification", function(event){
                var pushNoticeCode = onOpenNotification(event).pushNoticeCode;
                $state.go('tab.indexpushnoticedetail', {id: pushNoticeCode})

            }, false);


        }
    });



    $ionicPlatform.registerBackButtonAction(function (e) {

        //判断处于哪个页面时双击退出
        if ($location.path() == '/tab/index' || $location.path() == '/tab/programme' || $location.path() == '/tab/found' || $location.path() == '/tab/account') {

            $ionicPopup.show({
                template: '<p class="c-333 fs-15" style="margin: 20px 5px 23px;">您确定要退出彩米智投？</p>',
                title: '退出提示',
                buttons: [
                    {text: '取消'},
                    {
                        text: '确定',
                        type: 'c-red',
                        onTap: function (e) {
                            ionic.Platform.exitApp();
                        }
                    }
                ]
            });

        } else if ($ionicHistory.backView()) {

            $ionicHistory.goBack();
            //$ionicViewSwitcher.nextDirection("back");
        } else {
            $state.go('tab.index');
        }

        e. preventDefault();
        return false;
    }, 101);


    $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams){

        token = globalServices.userBaseMsg.token;
        $rootScope.chart = '';

        switch (toState.name) {
            case 'tab.startup':

                $rootScope.isHideTab = true;
                break;
            case 'tab.login':

                $rootScope.isHideTab = true;
                break;
            case 'tab.index':
                $rootScope.isHideTab = false;

                $ionicHistory.nextViewOptions({
                    disableBack: true
                });
                break;
            case 'tab.programme':

                $rootScope.isHideTab = false;
                break;
            case 'tab.found':

                $rootScope.isHideTab = false;
                break;
            case 'tab.account':
                //
                $rootScope.isHideTab = false;


                //如果用户没有登录 并且 也不是第一次登录
                if (!token) {
                    $state.go('tab.login');
                    event.preventDefault();
                }

                break;
            case 'tab.sign':

                $rootScope.isHideTab = true;
                if (!token) {
                    $state.go('tab.login', {backURL: 'tab.index'});
                    event.preventDefault();
                }

                break;
            case 'tab.programmedetail':

                $rootScope.isHideTab = true;
                if (!token) {
                    $state.go('tab.login', {backURL: 'tab.programme'});
                    event.preventDefault();
                }
                break;
            default:

              $rootScope.isHideTab = true;

        }

        // 购买后后退到方案列表
        if (fromState.name == 'tab.programmeorder' && toState.name == 'tab.programmedetail') {

          $state.go('tab.programme');
          event.preventDefault();
        }

        // 退出登录后
        if (toState.name == 'tab.usermsg') {

            if (!token) {
                $state.go('tab.index');
                event.preventDefault();
            }
        }

      // 登录或注册成功后
      if ((toState.name == 'tab.login' || toState.name == 'tab.register') && fromState.name == 'tab.account') {
          $state.go('tab.index');
          event.preventDefault();

      }


    })
}])
.config(function($httpProvider){

    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

    $httpProvider.defaults.transformRequest = function(data){
        var arr = [];
        for (var i in data) {
            arr.push(encodeURIComponent(i) + '=' + JSON.stringify(data[i]));
        }

        return arr.join('&');
    }

})


.config(['$stateProvider', '$urlRouterProvider', '$ionicConfigProvider', '$httpProvider', function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $httpProvider) {
        $httpProvider.defaults.withCredentials = true;

        $ionicConfigProvider.platform.ios.tabs.style('standard');
        $ionicConfigProvider.platform.ios.tabs.position('bottom');
        $ionicConfigProvider.platform.android.tabs.style('standard');
        $ionicConfigProvider.platform.android.tabs.position('standard');

        $ionicConfigProvider.platform.ios.navBar.alignTitle('center');
        $ionicConfigProvider.platform.android.navBar.alignTitle('center');

        $ionicConfigProvider.platform.ios.backButton.previousTitleText('').icon('ion-ios-arrow-thin-left');
        $ionicConfigProvider.platform.android.backButton.previousTitleText('').icon('ion-android-arrow-back');

        $ionicConfigProvider.platform.ios.views.transition('ios');
        $ionicConfigProvider.platform.android.views.transition('android');

        $ionicConfigProvider.backButton.text("");
        $ionicConfigProvider.backButton.previousTitleText(false);
        $ionicConfigProvider.scrolling.jsScrolling(true);
        // 禁止ios滑动后退
        $ionicConfigProvider.views.swipeBackEnabled(false);


  $stateProvider
   .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
  })
  // startup
  .state('tab.startup', {
      url: '/startup',
      views: {
          'tab-index': {
              templateUrl: 'templates/index/startup.html',
              controller: 'StartUpCtrl'
          }
      }
  })
  // 首页 begin
  .state('tab.index', {
      url: '/index',
      views: {
          'tab-index': {
              templateUrl: 'templates/index/index.html',
              controller: 'IndexCtrl'
          }
      }
  })
  // 彩种定制
  .state('tab.lottercustomize', {
      url: '/lotterycustomize',
      views: {
          'tab-index': {
              templateUrl: 'templates/index/lotterycustomize.html',
              controller: 'CustomizeCtrl'
          }
      }
  })
  .state('tab.indexpushnoticedetail', {
      url: '/indexpushnoticedetail/:id',
      params: {push: 'push'},
      views: {
          'tab-index': {
              templateUrl: 'templates/found/noticedetail.html',
              controller: 'NoticeDetailCtrl'
          }
      }
  })

  // 首页 end
  // 首页登录相关 begin
  .state('tab.login', {
      url: '/login',
      params: {backURL: null},
      cache: false,
      views:{
          'tab-login': {
              templateUrl: 'templates/entry/login.html',
              controller: 'LoginCtrl'
          }
      }
  })


  // 忘记密码
  .state('tab.forgetpassword', {
      url: '/forgetpassword',
      cache: false,
      views: {
          'tab-login': {
              templateUrl: 'templates/entry/forgetpassword.html',
              controller: 'ForgetPasswordCtrl'
          }
      }
  })
  // 重设密码
  .state('tab.resetpassword', {
      url: '/resetpassword',
      params: {mobile: null},
      views: {
          'tab-login': {
              templateUrl: 'templates/entry/resetpassword.html',
              controller: 'ResetPasswordCtrl'
          }
      }
  })
  // 注册
  .state('tab.register', {
      url: '/register',
      cache: false,
      views: {
          'tab-login': {
              templateUrl: 'templates/entry/register.html',
              controller: 'RegisterCtrl'
          }
      }
  })
  // 注册协议
  .state('tab.registeragreement', {
      url: '/registeragreement',
      views: {
          'tab-login': {
              templateUrl: 'templates/entry/registeragreement.html'
          }
      }
  })
  // 登录相关 end


  // 个人中心 beigin
  .state('tab.account', {
    url: '/account',
    views: {
      'tab-account': {
        templateUrl: 'templates/usercenter/useraccount.html',
        controller: 'UserAccountCtrl'
      }
    }
  })
  // 余额
  .state('tab.setting', {
      url: '/setting',
      views: {
          'tab-account': {
              templateUrl: 'templates/userfunc/setting.html',
              controller: 'SettingCtrl'
          }
      }
  })
  // 余额
  .state('tab.balance', {
      url: '/balance',
      views: {
          'tab-account': {
              templateUrl: 'templates/capital/balance.html',
              controller: 'BalanceCtrl'
          }
      }
  })
  // 充值
  .state('tab.recharge', {
      url: '/recharge',
      views: {
          'tab-account': {
              templateUrl: 'templates/capital/recharge.html',
              controller: 'RechargeCtrl'
          }
      }
  })
  // 充值详情
  .state('tab.rechargedetail', {
      url: '/rechargedetail/:id',
      params: {id: null},
      views: {
          'tab-account': {
              templateUrl: 'templates/capital/rechargedetail.html',
              controller: 'RechargeDetailCtrl'
          }
      }
  })


  // 优惠券
  .state('tab.coupon', {
      url: '/coupon',
      views: {
          'tab-account': {
              templateUrl: 'templates/capital/coupon.html',
              controller: 'CouponCtrl'
          }
      }
  })
  // 优惠券
  .state('tab.indexcoupon', {
      url: '/indexcoupon',
      views: {
          'tab-index': {
              templateUrl: 'templates/capital/coupon.html',
              controller: 'CouponCtrl'
          }
      }
  })

  // 个人资料
  .state('tab.usermsg', {
        url: '/usermsg',
        cache:'false',
        views: {
            'tab-account': {
                templateUrl: 'templates/usercenter/usermsg.html',
                controller: 'UserMsgCtrl'
            }
        }
    })
  // 头像
  .state('tab.userphoto', {
      url: '/userphoto',
      views: {
          'tab-account': {
              templateUrl: 'templates/usercenter/userphoto.html',
              controller: 'UserPhotoCtrl'
          }
      }
  })

      // 用户名
  .state('tab.username', {
      url: '/username',
      views: {
          'tab-account': {
              templateUrl: 'templates/usercenter/username.html',
              controller: 'UserNameCtrl'
          }
      }
  })
      // 密码管理(修改密码)
  .state('tab.modifypassword', {
      url: '/modifypassword',
      views: {
          'tab-account': {
              templateUrl: 'templates/usercenter/moditypassword.html',
              controller: 'ModityPasswordCtrl'
          }
      }
  })
  // 密码管理(设置密码)
  .state('tab.setpassword', {
      url: '/setpassword',
      views: {
          'tab-account': {
              templateUrl: 'templates/usercenter/setpassword.html',
              controller: 'SetPasswordCtrl'
          }
      }
  })
  // 忘记密码
  .state('tab.accountforgetpassword', {
      url: '/accountforgetpassword/:scopeURL',
      cache: false,
      views: {
          'tab-account': {
              templateUrl: 'templates/entry/forgetpassword.html',
              controller: 'ForgetPasswordCtrl'
          }
      }
  })
  // 重设密码
  .state('tab.accountresetpassword', {
      url: '/accountresetpassword',
      params: {mobile: null},
      views: {
          'tab-account': {
              templateUrl: 'templates/entry/resetpassword.html',
              controller: 'ResetPasswordCtrl'
          }
      }
  })

  // 手机号绑定
  .state('tab.usermobile', {
      url: '/usermobile',
      views: {
          'tab-account': {
              templateUrl: 'templates/usercenter/usermobile.html',
              controller: 'UserMobileCtrl'
          }
      }
  })
  // 联合账户
  .state('tab.userunion', {
      url: '/userunion',
      views: {
          'tab-account': {
              templateUrl: 'templates/usercenter/userunion.html',
              controller: 'UserUnionCtrl'
          }
      }

  })
  // 投注订单
  .state('tab.order', {
      url: '/order',
      views: {
          'tab-account': {
              templateUrl: 'templates/usercenter/order.html',
              controller: 'OrderCtrl'
          }
      }

  })
    // 个人订单详情
    .state('tab.orderdetail', {
        url: '/orderdetail/:orderCode',
        params: {orderCode: null},
        views: {
            'tab-account': {
                templateUrl: 'templates/programme/programmeorder.html',
                controller: 'ProgrammeOrderCtrl'
            }
        }

    })
      // 使用帮助
      .state('tab.help', {
          url: '/help',
          views: {
              'tab-account': {
                  templateUrl: 'templates/userfunc/help.html',
              }
          }

      })
      // 关于我们
      .state('tab.aboutus', {
          url: '/aboutus',
          views: {
              'tab-account': {
                  templateUrl: 'templates/userfunc/aboutus.html',
              }
          }

      })
      // 个人中心 end
      // 开奖 begin
      .state('tab.lottery', {
          url: '/lottery',
          views: {
              'tab-index': {
                  templateUrl: 'templates/lottery/lottery.html',
                  controller: 'LotteryCtrl'
              }
          }

      })
      // 开奖列表
      .state('tab.lotterylist', {
          url: '/lotterylist/:id',
          views: {
              'tab-index': {
                  templateUrl: 'templates/lottery/lotterylist.html',
                  controller: 'LotteryListCtrl'
              }
          }

      })
      // 彩种走势首页
      .state('tab.bonusentry', {
          url: '/bonusentry',
          views: {
              'tab-index': {
                  templateUrl: 'templates/bonustrend/bonusentry.html'
              }
          }
      })
      // 双色球、大乐透走势
      .state('tab.bonucycle', {
          url: '/bonuscycle/:id',
          views: {
              'tab-index': {
                  templateUrl: 'templates/bonustrend/bonuscycle.html',
                  controller: 'BonusTrendCtrl'
              }
          }

      })
      // 排列五
      .state('tab.bonusP5', {
          url: '/bonusPAILIEWU/:id',
          views: {
              'tab-index': {
                  templateUrl: 'templates/bonustrend/bonusPAILIEWU.html',
                  controller: 'BonusTrendCtrl'
              }
          }

      })

      // 排列三、3d
      .state('tab.bonus3d', {
          url: '/bonus3d/:id',
          views: {
              'tab-index': {
                  templateUrl: 'templates/bonustrend/bonus3d.html',
                  controller: 'BonusTrendCtrl'
              }
          }

      })

      // 七乐彩
      .state('tab.bonusQILECAI', {
          url: '/bonusQILECAI/:id',
          views: {
              'tab-index': {
                  templateUrl: 'templates/bonustrend/bonusQILECAI.html',
                  controller: 'BonusTrendCtrl'
              }
          }

      })
      // 快三
      .state('tab.bonusKAUISAN', {
        url: '/bonusKUAISAN/:id',
        views: {
          'tab-index': {
            templateUrl: 'templates/bonustrend/bonusKUAISAN.html',
            controller: 'BonusK3Ctrl'
          }
        }

      })
    // 快三
    .state('tab.bonus115', {
      url: '/bonus115/:id',
      views: {
        'tab-index': {
          templateUrl: 'templates/bonustrend/bonus115.html',
          controller: 'BonusTrendCtrl'
        }
      }

    })
      // 开奖 end
      // 方案 begin
      .state('tab.programme', {
          url: '/programme',
          views: {
              'tab-programme': {
                  templateUrl: 'templates/programme/programme.html',
                  controller: 'ProgrammeCtrl'
              }
          }

      })
      // 方案详情
      .state('tab.programmedetail', {
          url: '/programmedetail/:programmeCode',
          params: {couponCode: null, couponAmount: null, programmeCode: null},
          views: {
              'tab-programme': {
                  templateUrl: 'templates/programme/programmedetail.html',
                  controller: 'ProgrammeDetailCtrl'
              }
          }

      })
      // 方案订单详情
      .state('tab.programmeorder', {
          url: '/programmeorder/:orderCode',
          params: {orderCode: null},
          views: {
              'tab-programme': {
                  templateUrl: 'templates/programme/programmeorder.html',
                  controller: 'ProgrammeOrderCtrl'
              }
          }

      })
        // 充值
        .state('tab.programmerecharge', {
            url: '/programmerecharge',
            views: {
                'tab-programme': {
                    templateUrl: 'templates/capital/recharge.html',
                    controller: 'RechargeCtrl'
                }
            }
        })
      // 使用优惠券
      .state('tab.usecoupon', {

          url: '/usecoupon/:lotteryCode/:rewardAmount/:programmeCode',
          views: {
              'tab-programme': {
                  templateUrl: 'templates/programme/usecoupon.html',
                  controller: 'UseCouponCtrl'
              }
          }

      })

      // 发现 begin
      .state('tab.found', {
          url: '/found',
          views: {
              'tab-found': {
                  templateUrl: 'templates/found/found.html',
                  controller: 'FoundCtrl'
              }
          }
      })
      .state('tab.consult', {
          url: '/consult',
          views: {
              'tab-found': {
                  templateUrl: 'templates/found/consult.html',
                  controller: 'ConsultCtrl'
              }
          }
      })
      .state('tab.consultdetail', {
          url: '/consultdetail/:id',
          views: {
              'tab-found': {
                  templateUrl: 'templates/found/consultdetail.html',
                  controller: 'ConsultDetailCtrl'
              }
          }
      })
      .state('tab.notice', {
          url: '/notice',
          views: {
              'tab-found': {
                  templateUrl: 'templates/found/notice.html',
                  controller: 'NoticeCtrl'
              }
          }
      })
      .state('tab.noticedetail', {
          url: '/noticedetail/:id',
          views: {
              'tab-found': {
                  templateUrl: 'templates/found/noticedetail.html',
                  controller: 'NoticeDetailCtrl'
              }
          }
      })
      .state('tab.pushnoticedetail', {
          url: '/pushnoticedetail/:id',
          params: {push: 'push'},
          views: {
              'tab-found': {
                  templateUrl: 'templates/found/noticedetail.html',
                  controller: 'NoticeDetailCtrl'
              }
          }
      })
      // 发现 中 开奖 begin
      .state('tab.foundlottery', {
          url: '/foundlottery',
          views: {
              'tab-found': {
                  templateUrl: 'templates/foundlottery/lottery.html',
                  controller: 'LotteryCtrl'
              }
          }

      })
      // 开奖列表
      .state('tab.foundlotterylist', {
          url: '/foundlotterylist/:id',
          views: {
              'tab-found': {
                  templateUrl: 'templates/lottery/lotterylist.html',
                  controller: 'LotteryListCtrl'
              }
          }

      })
      // 彩种走势首页
      .state('tab.foundbonusentry', {
          url: '/foundbonusentry',
          views: {
              'tab-found': {
                  templateUrl: 'templates/found/bonusentry.html'

              }
          }
      })
      // 双色球、大乐透走势
      .state('tab.foundbonucycle', {
          url: '/foundbonuscycle/:id',
          views: {
              'tab-found': {
                  templateUrl: 'templates/bonustrend/bonuscycle.html',
                  controller: 'BonusTrendCtrl'
              }
          }

      })
      // 排列五
      .state('tab.foundbonusP5', {
          url: '/foundbonusPAILIEWU/:id',
          views: {
              'tab-found': {
                  templateUrl: 'templates/bonustrend/bonusPAILIEWU.html',
                  controller: 'BonusTrendCtrl'
              }
          }

      })

      // 排列三、3d
      .state('tab.foundbonus3d', {
          url: '/foundbonus3d/:id',
          views: {
              'tab-found': {
                  templateUrl: 'templates/bonustrend/bonus3d.html',
                  controller: 'BonusTrendCtrl'
              }
          }

      })

      // 七乐彩
      .state('tab.foundbonusQILECAI', {
          url: '/foundbonusQILECAI/:id',
          views: {
              'tab-found': {
                  templateUrl: 'templates/bonustrend/bonusQILECAI.html',
                  controller: 'BonusTrendCtrl'
              }
          }

      })
    // 快三
    .state('tab.foundbonusKAUISAN', {
      url: '/foundbonusKUAISAN/:id',
      views: {
        'tab-found': {
          templateUrl: 'templates/bonustrend/bonusKUAISAN.html',
          controller: 'BonusK3Ctrl'
        }
      }

    })
      // 发现 end
        // 活动 （签到）
    .state('tab.sign', {
        url: '/sign',
        views: {
            'tab-index': {
                templateUrl: 'templates/activity/sign.html',
                controller: 'SignCtrl'
            }
        }
    })
    .state('tab.calculate', {
      url: '/calculate/:lotteryCode',
      views: {
        'tab-index': {
          templateUrl: 'templates/calculate/calculate.html',
          controller: 'CalculateCtrl'
        }
      }
    })

  var defaultURL = (localStorage.getItem('start') == 'false' || localStorage.getItem('start') == null)  ? '/tab/startup' : '/tab/index';

  $urlRouterProvider.otherwise(defaultURL);


}]);


document.documentElement.setAttribute('data-dpr', window.devicePixelRatio);
document.documentElement.style.fontSize = document.documentElement.clientWidth / 10 * 2 + 'px';



}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/fake_78a5a57c.js","/")
},{"../components/dorpdown/DorpDown.js":5,"../components/slideTab/SlideTabsDirective.js":7,"../containers/activity/ActivityCtrl.js":10,"../containers/activity/activityServices.js":11,"../containers/bonustrend/BonusTrendCtrl.js":12,"../containers/bonustrend/bonusTrendServices.js":14,"../containers/calculate/CalculateCtrl.js":15,"../containers/calculate/calculateServices.js":16,"../containers/capital/CapitalController.js":17,"../containers/capital/capitalServices.js":18,"../containers/entry/InputDirective.js":19,"../containers/entry/LoginController.js":20,"../containers/entry/PasswordInputDirective.js":21,"../containers/entry/SendCodeDirective.js":22,"../containers/entry/entryServices.js":23,"../containers/found/FoundCtrl.js":24,"../containers/found/foundServices.js":25,"../containers/index/IndexController.js":26,"../containers/index/indexServices.js":27,"../containers/lottery/LotteryCtrl.js":28,"../containers/lottery/lotteryServices.js":29,"../containers/programme/ProgrammeCtrl.js":30,"../containers/programme/programmeServices.js":31,"../containers/usercenter/UserAccountController.js":32,"../containers/usercenter/accountServices.js":33,"../containers/userfunc/UserFuncCtrl.js":34,"./controllerModule.js":35,"./directiveModule.js":36,"./filterModule.js":38,"./serviceModule.js":39,"buffer":2,"rH1JPG":4}],38:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
//
module.exports = (function(){
    return angular.module('starter.filters', []).
        filter('reduce', function(){

            return function(val){

                return val.reduce(function(a, b){

                    return Number(a) + Number(b);
                })
            }

        })
        // 日期格式化 2014-10-11 转换为 2014.10.11
        .filter('datetransfer', function(){
            return function(val) {
                return val.replace(/-/g, '.');
            }
        })
        // 日期格式化 2014-10-11 20:20:20 转换为 2014-10-11
        .filter('dateshort', function(){
            return function(val) {
                return val.split(' ')[0];
            }
        })
        //  期次简化 为六位
        .filter('issuefixed', function(){
          return function(val) {
            return val.slice(-5);
          }
        })
        // 取整
        .filter('parseInt', function(){
          return function(val) {
            return parseInt(val);
          }
        })
}())

}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/filterModule.js","/")
},{"buffer":2,"rH1JPG":4}],39:[function(require,module,exports){
(function (process,global,Buffer,__argument0,__argument1,__argument2,__argument3,__filename,__dirname){
/**
 * @date 2016-09-29
 * @auth zhang
 * @tel 15210007185
 */

//服务主模块
module.exports = (function(){

    var isLoacl = (location.hostname == 'localhost');

    return angular.module('starter.services', [])
        .factory('globalServices', ['$http', '$q', '$ionicScrollDelegate', '$rootScope', '$timeout',
            '$ionicLoading', '$document', '$ionicPlatform', '$compile', '$ionicModal', '$ionicPopup', '$cordovaFileTransfer', '$state', '$cordovaFile', '$cordovaFileOpener2',
            function($http, $q, $ionicScrollDelegate, $rootScope, $timeout, $ionicLoading, $document, $ionicPlatform, $compile, $ionicModal, $ionicPopup, $cordovaFileTransfer, $state, $cordovaFile, $cordovaFileOpener2){

            return{
                post: (function(){

                    var bBtn = true;
                   return function(cmd, func, data, hideError, isSerial){

                       angular.forEach(data, function(val, key){
                          data[key] = val + '';
                       })

                       var This = this,
                           tempData = null,
                           registrationId = This.localStorageHandle('registrationId'),
                           deferred = $q.defer(),
                           accountData,
                           networkStatus,
                           json = {
                               cmd: cmd + '',
                               func: func,
                               machId: registrationId || (window.device && device.uuid),
                               token: this.userBaseMsg.token || '',
                               msg: data || {}
                           };

                       // 如果cmd是对象
                       if (cmd.cmd) {
                           json = cmd;
                       }

                       /**
                        * 检测当前网络
                        */
                       function checkConnection() {

                           if (!json.machId || !navigator.connection) {

                               return null;
                           }

                           var networkState = navigator.connection.type,
                               states = {};
                           states[Connection.UNKNOWN]  = 'Unknown connection';
                           states[Connection.ETHERNET] = 'Ethernet connection';
                           states[Connection.WIFI]     = 'WiFi connection';
                           states[Connection.CELL_2G]  = 'Cell 2G connection';
                           states[Connection.CELL_3G]  = 'Cell 3G connection';
                           states[Connection.CELL_4G]  = 'Cell 4G connection';
                           states[Connection.CELL]     = 'Cell generic connection';
                           states[Connection.NONE]     = 'No network connection';

                       
                           return states[networkState]
                       }

                       networkStatus = checkConnection();
                       $rootScope.isOffLine = false;
                       
                       // 没有连接互联网
                        
                       if (networkStatus == 'No network connection') {
                           deferred.resolve({isOffLine: true});
                           $rootScope.isOffLine = true;

                           This.errorPrompt('网络连接失败!');
                           return deferred.promise;
                       }

                       if (json.machId) {


                           if (isSerial) {
                               bBtn = false;
                           }
                           http.httpsPost('https://interface.icaimi.com/interface', json, function(re){

                               re = JSON.parse(re);

                               responseHandle(deferred, re);
                               bBtn = true;

                           }, function(re){

                               deferred.reject(re.result);
                               bBtn = true;
                               // 提示错误
                               !hideError && This.errorPrompt(re.msg);
                           })

                       } else {

                           if (bBtn) {
                               if (isSerial) {
                                   bBtn = false;
                               }
                               $http({
                                   url: isLoacl ? '/' : '/h5/interface',
                                   method: isLoacl ? 'get' : 'post',
                                   data: {msg: json},
                                   headers: {
                                       'Content-Type': 'application/x-www-form-urlencoded'
                                   }
                               }).success(function(data, status){

                                   //$ionicLoading.hide();

                                   bBtn = true;
                                   responseHandle(deferred, data);
                               });
                           }
                       }
                       return deferred.promise;

                       function responseHandle(deferred, data) {

                            if (typeof data == 'string') {
                              data = {};
                              data.code = '0000'
                            }
                           // 未登录
                           if (data.code == '0008') {
                               tempData = json;
                               accountData = This.localStorageHandle('account');

                               if (accountData) {
                                   This.signIn(accountData, function(re){

                                       if (re.token) {
                                           tempData.token = re.token;
                                           This.post(tempData).then(function(re){
                                             deferred.resolve(re);
                                           })
                                       } else {
                                           $state.go('tab.login');
                                       }

                                   })
                               } else {
                                   $state.go('tab.login');
                               }


                           } else if (data.code === '0000') {
                               deferred.resolve(data.result);
                           } else {
                              deferred.reject(data.msg);
                               // 提示错误
                               !hideError &&  This.errorPrompt(data.msg);
                           }
                       }
                   }
                }()),
                serialPost: function(cmd, func, data, hideError){
                    return this.post(cmd, func, data, hideError, true);

                },

                // 处理顶部导航条
                handleHeader: function() {

                    $timeout(function(){

                        if ($ionicScrollDelegate.getScrollPosition().top < 0 ) {
                            $rootScope.$broadcast('header.hide');
                        } else {
                            $rootScope.$broadcast('header.show');
                        }
                        $rootScope.$digest();
                    }, 100)

                },

                // 用户信息
                userBaseMsg: {},

                // 设置用户信息
                setUserBaseMsg: function(msg){
                    this.userBaseMsg = msg;
                },

                // 是不是空对象
                isEmptyObject: function(obj){

                    for (var i in obj) {
                        return false;
                    }
                    return true;
                },
                cacheData: {},
                cache: function(sign, data){

                    if (data != undefined) {
                        if (angular.isArray(this.cacheData[sign])) {
                            this.cacheData[sign] = this.cacheData[sign].concat(data);
                        } else {
                            this.cacheData[sign] = data;
                        }
                    } else {
                        return this.cacheData[sign];
                    }

                },

                // 错误提示
                errorPrompt: function(msg){

                    var html = '<div class="error-prompt">' + msg + '</div>';

                    var promptDom = angular.element(html);

                    $document.find('body').append(promptDom);

                    $timeout(function(){
                        promptDom.remove();
                    }, 2000)
                },

                // 选择
               selectPrompt: function(obj){

                    var html = window.device ? '<div class="prompt-bottom"><div class="list"><div ng-repeat="i in data" class="item" ng-click="appect(i.sign)">{{i.text}}</div></div><div class="list"><div class="item"  ng-click="cancel()">取消</div></div></div>' :
                      '<div class="prompt-bottom"><div class="list"><div class="item">上传图像<form><input type="file" name="file" onchange="appect(this)"/></form></div></div><div class="list"><div class="item"  ng-click="cancel()">取消</div></div></div>';

                    var promptDom = angular.element(html),
                        scope = $rootScope.$new();

                    scope.data =  obj.func;

                    appect = scope.appect = function(sign){
                        obj.accept(sign);
                        scope.cancel();
                    };

                    scope.cancel= function(){
                        promptDom.remove();
                        if (obj.cancel) obj.cancel();
                    }


                    $document.find('body').append(promptDom);
                    $compile(promptDom)(scope);

                    return scope.cancel;
               },
                /**
                 * 处理缓存
                 * @param sign {String or Object} 缓存的key 注：取数据时格式可以以{key: 'sign', page: 1, pageSize: 10} 格式取指定的数据
                 * @param data {Object} 缓存的数据
                 * @param isPush {Boolean} 是不是追加数据
                 * @returns {*} {Object} 返回的数据
                 */
                localStorageHandle: function(sign, data, isPush){

                    var result,
                        key = sign.key || sign,
                        start = sign.page || 0,
                        end = sign.pageSize || 10;

                    if (data != undefined) {

                        if (isPush) {
                            result = JSON.parse(localStorage.getItem(key));

                            if (angular.isArray(result)) {
                                data = result.concat(data);
                            } else if (!this.isEmptyObject(result)) {
                                angular.extend(data, result);
                            }
                        }
                        try {

                          localStorage.setItem(sign, JSON.stringify(data));

                        } catch (e) {

                        }

                    } else {
                        try {

                            result = JSON.parse(localStorage.getItem(key));

                            if (angular.isArray(result)) {

                                result = result.slice(start * end, start * end + end);

                            }
                        } catch(e){

                        } finally{
                            return result;
                        }

                    }
               },
                /**
                 * 是否登录
                 * @returns {*|options.token|{type, shorthand}|null}
                 */
                isSignIn: function(){
                    return this.userBaseMsg.token;
                },
                /**
                 * 登录
                 * @param data {Object} 用户名密码
                 * @param fn {Function} 回调函数
                 * @param hideError {Boolean} 是否隐藏错误提示
                 */
                signIn: function(data, fn, hideError){

                    var This = this;

                    if (data && data.mobile) {
                        this.post('3101', 'password', data, hideError).then(function(re){
                            This.setUserBaseMsg(re);
                            if (fn) fn(re);
                        }, function(re){
                            if (fn) fn(re);
                        })
                    }

                },
                /**
                 * 自动登录
                 * @param account {Object} 用户信息
                 * @param fn {Function} 回调函数
                 */
                autoSignin: function(account, fn){

                    if (!this.isSignIn()){
                        this.signIn(account, fn, true);
                    } else {
                        fn && fn();
                    }
                },
                /**
                 * 系统更新
                 */
                updateAPP: function(){

                    var sid,
                        This = this;

                    //if (typeof http != 'undefined') {
                    //
                    //    http.getSid(function(sid){
                    //
                    //        sid = sid;
                    //        checkUpdate(sid);
                    //    })
                    //}
                  checkUpdate();
                    // 检查更新
                    function checkUpdate(sid) {

                        This.post('1000', 'version').then(function(re){

                            // 更新
                            if (re.status == 2) {

                                $ionicPopup.show({
                                    template: '<p class="c-333 fs-15" style="margin: 20px 5px 23px;">' + re.updateInfo + '</p>',
                                    title: '版本更新提示',
                                    buttons: [
                                        {text: '取消'},
                                        {
                                            text: '确定',
                                            type: 'c-red',
                                            onTap: function (e) {
                                                updateHandle(re);
                                            }
                                        }
                                    ]
                                });
                            }
                            // 强制更新
                            else if (re.status == 3) {
                                $ionicPopup.show({
                                    template: '<p class="c-333 fs-15" style="margin: 20px 5px 23px;">' + re.updateInfo + '</p>',
                                    title: '版本更新提示',
                                    buttons: [
                                        {
                                            text: '确定',
                                            type: 'c-red',
                                            onTap: function (e) {
                                                updateHandle(re);
                                            }
                                        }
                                    ]
                                });
                            }
                        })
                    }

                    function updateHandle(result) {


                        var url = result.downUrl || 'http://newapp.icaimi.com/apk/android-8000.apk',
                            options = {},
                            targetPath = cordova.file.externalRootDirectory + '/caimizhitou/com.icaimi.lottery.apk',
                            trustHosts = true,
                            progressed;

                        $cordovaFile.checkDir(cordova.file.externalRootDirectory, 'caimizhitou').then(function(re){

                            $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
                                .then(function(result) {

                                    This.localStorageHandle('start', false);
                                    $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive')
                                        .then(function () {


                                        }, function (err) {

                                        });
                                }, function(err) {
                                    $ionicLoading.show({template: '下载失败！', noBackdrop: true, duration: 2000});
                                }, function (progress) {
                                    setTimeout(function () {
                                        progressed = (progress.loaded / progress.total) * 100;

                                        $ionicLoading.show({
                                            template: '已经下载' + Math.floor(progressed) + '%'
                                        });
                                        if (progressed > 99) {
                                            $ionicLoading.hide();
                                        }
                                    }, 100);
                                });

                        }, function(re){

                            $cordovaFile.createDir(cordova.file.externalRootDirectory, "caimizhitou", false)
                                .then(function (success) {
                                    $cordovaFileTransfer.download(url, targetPath, options, trustHosts)
                                        .then(function(result) {

                                            This.localStorageHandle('start', false);
                                            $cordovaFileOpener2.open(targetPath, 'application/vnd.android.package-archive')
                                                .then(function () {



                                                }, function (err) {

                                                });
                                        }, function(err) {
                                            $ionicLoading.show({template: '下载失败！', noBackdrop: true, duration: 2000});
                                        }, function (progress) {
                                            setTimeout(function () {
                                                progressed = (progress.loaded / progress.total) * 100;

                                                $ionicLoading.show({
                                                    template: '已经下载' + Math.floor(progressed) + '%'
                                                });
                                                if (progressed > 99) {
                                                    $ionicLoading.hide();
                                                }
                                            }, 100);
                                        });

                                }, function (error) {
                                    alert('sd卡读写错误')
                                });

                        })
                    }

                },
                /**
                 * 存储本地文件
                 * @param sign {String} 缓存的key
                 * @param msg {String} 缓存的内容
                 */
                cacheSD: function(sign, msg){

                    var deferred = $q.defer();

                    // 判断是不是文件
                    $cordovaFile.checkFile(cordova.file.dataDirectory, sign)
                        .then(function (success) {

                            if (!msg) {
                                readFile(success);
                            } else {
                                writeFile();
                            }

                        }, function (error) {
                            writeFile();
                        });
                    return deferred.promise;

                    function writeFile(){
                        $cordovaFile.writeFile(cordova.file.dataDirectory, sign, msg, true)
                            .then(function (success) {
                                deferred.resolve(success);
                            }, function (error) {
                                deferred.reject(success);
                            });

                    }
                    function readFile(success){
                        $cordovaFile.readAsText(cordova.file.dataDirectory, success.name)
                            .then(function (success) {
                                deferred.resolve(success);
                            }, function (error) {
                                deferred.reject(success);
                            });

                    }
                },
                preImage: function(imgArr){
                    var oImg = null;
                    angular.forEach(imgArr, function(img){
                        "use strict";
                        oImg = new Image();

                        oImg.src = img;
                    })

                }
            }

        }])
}())


}).call(this,require("rH1JPG"),typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {},require("buffer").Buffer,arguments[3],arguments[4],arguments[5],arguments[6],"/serviceModule.js","/")
},{"buffer":2,"rH1JPG":4}]},{},[37])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy96ankvRGVza3RvcC9wb3JkdWN0L2xvdHRlcnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy96ankvRGVza3RvcC9wb3JkdWN0L2xvdHRlcnkvbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzIiwiL1VzZXJzL3pqeS9EZXNrdG9wL3BvcmR1Y3QvbG90dGVyeS9ub2RlX21vZHVsZXMvYnVmZmVyL2luZGV4LmpzIiwiL1VzZXJzL3pqeS9EZXNrdG9wL3BvcmR1Y3QvbG90dGVyeS9ub2RlX21vZHVsZXMvaWVlZTc1NC9pbmRleC5qcyIsIi9Vc2Vycy96ankvRGVza3RvcC9wb3JkdWN0L2xvdHRlcnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIi9Vc2Vycy96ankvRGVza3RvcC9wb3JkdWN0L2xvdHRlcnkvc3JjL2NvbXBvbmVudHMvZG9ycGRvd24vRG9ycERvd24uanMiLCIvVXNlcnMvemp5L0Rlc2t0b3AvcG9yZHVjdC9sb3R0ZXJ5L3NyYy9jb21wb25lbnRzL3Njcm9sbC9Ub3VjaFNjcm9sbERpcmVjdGl2ZS5qcyIsIi9Vc2Vycy96ankvRGVza3RvcC9wb3JkdWN0L2xvdHRlcnkvc3JjL2NvbXBvbmVudHMvc2xpZGVUYWIvU2xpZGVUYWJzRGlyZWN0aXZlLmpzIiwiL1VzZXJzL3pqeS9EZXNrdG9wL3BvcmR1Y3QvbG90dGVyeS9zcmMvY29tcG9uZW50cy90b2dnbGUvU2VsZWN0UGlja0RpcmVjdGl2ZS5qcyIsIi9Vc2Vycy96ankvRGVza3RvcC9wb3JkdWN0L2xvdHRlcnkvc3JjL2NvbXBvbmVudHMvdG9nZ2xlL1RvZ2dsZVBhbmVsRGlyZWN0aXZlLmpzIiwiL1VzZXJzL3pqeS9EZXNrdG9wL3BvcmR1Y3QvbG90dGVyeS9zcmMvY29udGFpbmVycy9hY3Rpdml0eS9BY3Rpdml0eUN0cmwuanMiLCIvVXNlcnMvemp5L0Rlc2t0b3AvcG9yZHVjdC9sb3R0ZXJ5L3NyYy9jb250YWluZXJzL2FjdGl2aXR5L2FjdGl2aXR5U2VydmljZXMuanMiLCIvVXNlcnMvemp5L0Rlc2t0b3AvcG9yZHVjdC9sb3R0ZXJ5L3NyYy9jb250YWluZXJzL2JvbnVzdHJlbmQvQm9udXNUcmVuZEN0cmwuanMiLCIvVXNlcnMvemp5L0Rlc2t0b3AvcG9yZHVjdC9sb3R0ZXJ5L3NyYy9jb250YWluZXJzL2JvbnVzdHJlbmQvYm9udXNEaXJlY3RpdmUuanMiLCIvVXNlcnMvemp5L0Rlc2t0b3AvcG9yZHVjdC9sb3R0ZXJ5L3NyYy9jb250YWluZXJzL2JvbnVzdHJlbmQvYm9udXNUcmVuZFNlcnZpY2VzLmpzIiwiL1VzZXJzL3pqeS9EZXNrdG9wL3BvcmR1Y3QvbG90dGVyeS9zcmMvY29udGFpbmVycy9jYWxjdWxhdGUvQ2FsY3VsYXRlQ3RybC5qcyIsIi9Vc2Vycy96ankvRGVza3RvcC9wb3JkdWN0L2xvdHRlcnkvc3JjL2NvbnRhaW5lcnMvY2FsY3VsYXRlL2NhbGN1bGF0ZVNlcnZpY2VzLmpzIiwiL1VzZXJzL3pqeS9EZXNrdG9wL3BvcmR1Y3QvbG90dGVyeS9zcmMvY29udGFpbmVycy9jYXBpdGFsL0NhcGl0YWxDb250cm9sbGVyLmpzIiwiL1VzZXJzL3pqeS9EZXNrdG9wL3BvcmR1Y3QvbG90dGVyeS9zcmMvY29udGFpbmVycy9jYXBpdGFsL2NhcGl0YWxTZXJ2aWNlcy5qcyIsIi9Vc2Vycy96ankvRGVza3RvcC9wb3JkdWN0L2xvdHRlcnkvc3JjL2NvbnRhaW5lcnMvZW50cnkvSW5wdXREaXJlY3RpdmUuanMiLCIvVXNlcnMvemp5L0Rlc2t0b3AvcG9yZHVjdC9sb3R0ZXJ5L3NyYy9jb250YWluZXJzL2VudHJ5L0xvZ2luQ29udHJvbGxlci5qcyIsIi9Vc2Vycy96ankvRGVza3RvcC9wb3JkdWN0L2xvdHRlcnkvc3JjL2NvbnRhaW5lcnMvZW50cnkvUGFzc3dvcmRJbnB1dERpcmVjdGl2ZS5qcyIsIi9Vc2Vycy96ankvRGVza3RvcC9wb3JkdWN0L2xvdHRlcnkvc3JjL2NvbnRhaW5lcnMvZW50cnkvU2VuZENvZGVEaXJlY3RpdmUuanMiLCIvVXNlcnMvemp5L0Rlc2t0b3AvcG9yZHVjdC9sb3R0ZXJ5L3NyYy9jb250YWluZXJzL2VudHJ5L2VudHJ5U2VydmljZXMuanMiLCIvVXNlcnMvemp5L0Rlc2t0b3AvcG9yZHVjdC9sb3R0ZXJ5L3NyYy9jb250YWluZXJzL2ZvdW5kL0ZvdW5kQ3RybC5qcyIsIi9Vc2Vycy96ankvRGVza3RvcC9wb3JkdWN0L2xvdHRlcnkvc3JjL2NvbnRhaW5lcnMvZm91bmQvZm91bmRTZXJ2aWNlcy5qcyIsIi9Vc2Vycy96ankvRGVza3RvcC9wb3JkdWN0L2xvdHRlcnkvc3JjL2NvbnRhaW5lcnMvaW5kZXgvSW5kZXhDb250cm9sbGVyLmpzIiwiL1VzZXJzL3pqeS9EZXNrdG9wL3BvcmR1Y3QvbG90dGVyeS9zcmMvY29udGFpbmVycy9pbmRleC9pbmRleFNlcnZpY2VzLmpzIiwiL1VzZXJzL3pqeS9EZXNrdG9wL3BvcmR1Y3QvbG90dGVyeS9zcmMvY29udGFpbmVycy9sb3R0ZXJ5L0xvdHRlcnlDdHJsLmpzIiwiL1VzZXJzL3pqeS9EZXNrdG9wL3BvcmR1Y3QvbG90dGVyeS9zcmMvY29udGFpbmVycy9sb3R0ZXJ5L2xvdHRlcnlTZXJ2aWNlcy5qcyIsIi9Vc2Vycy96ankvRGVza3RvcC9wb3JkdWN0L2xvdHRlcnkvc3JjL2NvbnRhaW5lcnMvcHJvZ3JhbW1lL1Byb2dyYW1tZUN0cmwuanMiLCIvVXNlcnMvemp5L0Rlc2t0b3AvcG9yZHVjdC9sb3R0ZXJ5L3NyYy9jb250YWluZXJzL3Byb2dyYW1tZS9wcm9ncmFtbWVTZXJ2aWNlcy5qcyIsIi9Vc2Vycy96ankvRGVza3RvcC9wb3JkdWN0L2xvdHRlcnkvc3JjL2NvbnRhaW5lcnMvdXNlcmNlbnRlci9Vc2VyQWNjb3VudENvbnRyb2xsZXIuanMiLCIvVXNlcnMvemp5L0Rlc2t0b3AvcG9yZHVjdC9sb3R0ZXJ5L3NyYy9jb250YWluZXJzL3VzZXJjZW50ZXIvYWNjb3VudFNlcnZpY2VzLmpzIiwiL1VzZXJzL3pqeS9EZXNrdG9wL3BvcmR1Y3QvbG90dGVyeS9zcmMvY29udGFpbmVycy91c2VyZnVuYy9Vc2VyRnVuY0N0cmwuanMiLCIvVXNlcnMvemp5L0Rlc2t0b3AvcG9yZHVjdC9sb3R0ZXJ5L3NyYy9qcy9jb250cm9sbGVyTW9kdWxlLmpzIiwiL1VzZXJzL3pqeS9EZXNrdG9wL3BvcmR1Y3QvbG90dGVyeS9zcmMvanMvZGlyZWN0aXZlTW9kdWxlLmpzIiwiL1VzZXJzL3pqeS9EZXNrdG9wL3BvcmR1Y3QvbG90dGVyeS9zcmMvanMvZmFrZV83OGE1YTU3Yy5qcyIsIi9Vc2Vycy96ankvRGVza3RvcC9wb3JkdWN0L2xvdHRlcnkvc3JjL2pzL2ZpbHRlck1vZHVsZS5qcyIsIi9Vc2Vycy96ankvRGVza3RvcC9wb3JkdWN0L2xvdHRlcnkvc3JjL2pzL3NlcnZpY2VNb2R1bGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5SEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2bENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0xBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25NQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeFNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3R3QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN09BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDelBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25HQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeklBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3UkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNySUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNUQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0N0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGxvb2t1cCA9ICdBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWmFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6MDEyMzQ1Njc4OSsvJztcblxuOyhmdW5jdGlvbiAoZXhwb3J0cykge1xuXHQndXNlIHN0cmljdCc7XG5cbiAgdmFyIEFyciA9ICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpXG4gICAgPyBVaW50OEFycmF5XG4gICAgOiBBcnJheVxuXG5cdHZhciBQTFVTICAgPSAnKycuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0ggID0gJy8nLmNoYXJDb2RlQXQoMClcblx0dmFyIE5VTUJFUiA9ICcwJy5jaGFyQ29kZUF0KDApXG5cdHZhciBMT1dFUiAgPSAnYScuY2hhckNvZGVBdCgwKVxuXHR2YXIgVVBQRVIgID0gJ0EnLmNoYXJDb2RlQXQoMClcblx0dmFyIFBMVVNfVVJMX1NBRkUgPSAnLScuY2hhckNvZGVBdCgwKVxuXHR2YXIgU0xBU0hfVVJMX1NBRkUgPSAnXycuY2hhckNvZGVBdCgwKVxuXG5cdGZ1bmN0aW9uIGRlY29kZSAoZWx0KSB7XG5cdFx0dmFyIGNvZGUgPSBlbHQuY2hhckNvZGVBdCgwKVxuXHRcdGlmIChjb2RlID09PSBQTFVTIHx8XG5cdFx0ICAgIGNvZGUgPT09IFBMVVNfVVJMX1NBRkUpXG5cdFx0XHRyZXR1cm4gNjIgLy8gJysnXG5cdFx0aWYgKGNvZGUgPT09IFNMQVNIIHx8XG5cdFx0ICAgIGNvZGUgPT09IFNMQVNIX1VSTF9TQUZFKVxuXHRcdFx0cmV0dXJuIDYzIC8vICcvJ1xuXHRcdGlmIChjb2RlIDwgTlVNQkVSKVxuXHRcdFx0cmV0dXJuIC0xIC8vbm8gbWF0Y2hcblx0XHRpZiAoY29kZSA8IE5VTUJFUiArIDEwKVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBOVU1CRVIgKyAyNiArIDI2XG5cdFx0aWYgKGNvZGUgPCBVUFBFUiArIDI2KVxuXHRcdFx0cmV0dXJuIGNvZGUgLSBVUFBFUlxuXHRcdGlmIChjb2RlIDwgTE9XRVIgKyAyNilcblx0XHRcdHJldHVybiBjb2RlIC0gTE9XRVIgKyAyNlxuXHR9XG5cblx0ZnVuY3Rpb24gYjY0VG9CeXRlQXJyYXkgKGI2NCkge1xuXHRcdHZhciBpLCBqLCBsLCB0bXAsIHBsYWNlSG9sZGVycywgYXJyXG5cblx0XHRpZiAoYjY0Lmxlbmd0aCAlIDQgPiAwKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgc3RyaW5nLiBMZW5ndGggbXVzdCBiZSBhIG11bHRpcGxlIG9mIDQnKVxuXHRcdH1cblxuXHRcdC8vIHRoZSBudW1iZXIgb2YgZXF1YWwgc2lnbnMgKHBsYWNlIGhvbGRlcnMpXG5cdFx0Ly8gaWYgdGhlcmUgYXJlIHR3byBwbGFjZWhvbGRlcnMsIHRoYW4gdGhlIHR3byBjaGFyYWN0ZXJzIGJlZm9yZSBpdFxuXHRcdC8vIHJlcHJlc2VudCBvbmUgYnl0ZVxuXHRcdC8vIGlmIHRoZXJlIGlzIG9ubHkgb25lLCB0aGVuIHRoZSB0aHJlZSBjaGFyYWN0ZXJzIGJlZm9yZSBpdCByZXByZXNlbnQgMiBieXRlc1xuXHRcdC8vIHRoaXMgaXMganVzdCBhIGNoZWFwIGhhY2sgdG8gbm90IGRvIGluZGV4T2YgdHdpY2Vcblx0XHR2YXIgbGVuID0gYjY0Lmxlbmd0aFxuXHRcdHBsYWNlSG9sZGVycyA9ICc9JyA9PT0gYjY0LmNoYXJBdChsZW4gLSAyKSA/IDIgOiAnPScgPT09IGI2NC5jaGFyQXQobGVuIC0gMSkgPyAxIDogMFxuXG5cdFx0Ly8gYmFzZTY0IGlzIDQvMyArIHVwIHRvIHR3byBjaGFyYWN0ZXJzIG9mIHRoZSBvcmlnaW5hbCBkYXRhXG5cdFx0YXJyID0gbmV3IEFycihiNjQubGVuZ3RoICogMyAvIDQgLSBwbGFjZUhvbGRlcnMpXG5cblx0XHQvLyBpZiB0aGVyZSBhcmUgcGxhY2Vob2xkZXJzLCBvbmx5IGdldCB1cCB0byB0aGUgbGFzdCBjb21wbGV0ZSA0IGNoYXJzXG5cdFx0bCA9IHBsYWNlSG9sZGVycyA+IDAgPyBiNjQubGVuZ3RoIC0gNCA6IGI2NC5sZW5ndGhcblxuXHRcdHZhciBMID0gMFxuXG5cdFx0ZnVuY3Rpb24gcHVzaCAodikge1xuXHRcdFx0YXJyW0wrK10gPSB2XG5cdFx0fVxuXG5cdFx0Zm9yIChpID0gMCwgaiA9IDA7IGkgPCBsOyBpICs9IDQsIGogKz0gMykge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxOCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCAxMikgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDIpKSA8PCA2KSB8IGRlY29kZShiNjQuY2hhckF0KGkgKyAzKSlcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMDAwKSA+PiAxNilcblx0XHRcdHB1c2goKHRtcCAmIDB4RkYwMCkgPj4gOClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9XG5cblx0XHRpZiAocGxhY2VIb2xkZXJzID09PSAyKSB7XG5cdFx0XHR0bXAgPSAoZGVjb2RlKGI2NC5jaGFyQXQoaSkpIDw8IDIpIHwgKGRlY29kZShiNjQuY2hhckF0KGkgKyAxKSkgPj4gNClcblx0XHRcdHB1c2godG1wICYgMHhGRilcblx0XHR9IGVsc2UgaWYgKHBsYWNlSG9sZGVycyA9PT0gMSkge1xuXHRcdFx0dG1wID0gKGRlY29kZShiNjQuY2hhckF0KGkpKSA8PCAxMCkgfCAoZGVjb2RlKGI2NC5jaGFyQXQoaSArIDEpKSA8PCA0KSB8IChkZWNvZGUoYjY0LmNoYXJBdChpICsgMikpID4+IDIpXG5cdFx0XHRwdXNoKCh0bXAgPj4gOCkgJiAweEZGKVxuXHRcdFx0cHVzaCh0bXAgJiAweEZGKVxuXHRcdH1cblxuXHRcdHJldHVybiBhcnJcblx0fVxuXG5cdGZ1bmN0aW9uIHVpbnQ4VG9CYXNlNjQgKHVpbnQ4KSB7XG5cdFx0dmFyIGksXG5cdFx0XHRleHRyYUJ5dGVzID0gdWludDgubGVuZ3RoICUgMywgLy8gaWYgd2UgaGF2ZSAxIGJ5dGUgbGVmdCwgcGFkIDIgYnl0ZXNcblx0XHRcdG91dHB1dCA9IFwiXCIsXG5cdFx0XHR0ZW1wLCBsZW5ndGhcblxuXHRcdGZ1bmN0aW9uIGVuY29kZSAobnVtKSB7XG5cdFx0XHRyZXR1cm4gbG9va3VwLmNoYXJBdChudW0pXG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gdHJpcGxldFRvQmFzZTY0IChudW0pIHtcblx0XHRcdHJldHVybiBlbmNvZGUobnVtID4+IDE4ICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDEyICYgMHgzRikgKyBlbmNvZGUobnVtID4+IDYgJiAweDNGKSArIGVuY29kZShudW0gJiAweDNGKVxuXHRcdH1cblxuXHRcdC8vIGdvIHRocm91Z2ggdGhlIGFycmF5IGV2ZXJ5IHRocmVlIGJ5dGVzLCB3ZSdsbCBkZWFsIHdpdGggdHJhaWxpbmcgc3R1ZmYgbGF0ZXJcblx0XHRmb3IgKGkgPSAwLCBsZW5ndGggPSB1aW50OC5sZW5ndGggLSBleHRyYUJ5dGVzOyBpIDwgbGVuZ3RoOyBpICs9IDMpIHtcblx0XHRcdHRlbXAgPSAodWludDhbaV0gPDwgMTYpICsgKHVpbnQ4W2kgKyAxXSA8PCA4KSArICh1aW50OFtpICsgMl0pXG5cdFx0XHRvdXRwdXQgKz0gdHJpcGxldFRvQmFzZTY0KHRlbXApXG5cdFx0fVxuXG5cdFx0Ly8gcGFkIHRoZSBlbmQgd2l0aCB6ZXJvcywgYnV0IG1ha2Ugc3VyZSB0byBub3QgZm9yZ2V0IHRoZSBleHRyYSBieXRlc1xuXHRcdHN3aXRjaCAoZXh0cmFCeXRlcykge1xuXHRcdFx0Y2FzZSAxOlxuXHRcdFx0XHR0ZW1wID0gdWludDhbdWludDgubGVuZ3RoIC0gMV1cblx0XHRcdFx0b3V0cHV0ICs9IGVuY29kZSh0ZW1wID4+IDIpXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPDwgNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gJz09J1xuXHRcdFx0XHRicmVha1xuXHRcdFx0Y2FzZSAyOlxuXHRcdFx0XHR0ZW1wID0gKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDJdIDw8IDgpICsgKHVpbnQ4W3VpbnQ4Lmxlbmd0aCAtIDFdKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKHRlbXAgPj4gMTApXG5cdFx0XHRcdG91dHB1dCArPSBlbmNvZGUoKHRlbXAgPj4gNCkgJiAweDNGKVxuXHRcdFx0XHRvdXRwdXQgKz0gZW5jb2RlKCh0ZW1wIDw8IDIpICYgMHgzRilcblx0XHRcdFx0b3V0cHV0ICs9ICc9J1xuXHRcdFx0XHRicmVha1xuXHRcdH1cblxuXHRcdHJldHVybiBvdXRwdXRcblx0fVxuXG5cdGV4cG9ydHMudG9CeXRlQXJyYXkgPSBiNjRUb0J5dGVBcnJheVxuXHRleHBvcnRzLmZyb21CeXRlQXJyYXkgPSB1aW50OFRvQmFzZTY0XG59KHR5cGVvZiBleHBvcnRzID09PSAndW5kZWZpbmVkJyA/ICh0aGlzLmJhc2U2NGpzID0ge30pIDogZXhwb3J0cykpXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWIvYjY0LmpzXCIsXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2Jhc2U2NC1qcy9saWJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKiFcbiAqIFRoZSBidWZmZXIgbW9kdWxlIGZyb20gbm9kZS5qcywgZm9yIHRoZSBicm93c2VyLlxuICpcbiAqIEBhdXRob3IgICBGZXJvc3MgQWJvdWtoYWRpamVoIDxmZXJvc3NAZmVyb3NzLm9yZz4gPGh0dHA6Ly9mZXJvc3Mub3JnPlxuICogQGxpY2Vuc2UgIE1JVFxuICovXG5cbnZhciBiYXNlNjQgPSByZXF1aXJlKCdiYXNlNjQtanMnKVxudmFyIGllZWU3NTQgPSByZXF1aXJlKCdpZWVlNzU0JylcblxuZXhwb3J0cy5CdWZmZXIgPSBCdWZmZXJcbmV4cG9ydHMuU2xvd0J1ZmZlciA9IEJ1ZmZlclxuZXhwb3J0cy5JTlNQRUNUX01BWF9CWVRFUyA9IDUwXG5CdWZmZXIucG9vbFNpemUgPSA4MTkyXG5cbi8qKlxuICogSWYgYEJ1ZmZlci5fdXNlVHlwZWRBcnJheXNgOlxuICogICA9PT0gdHJ1ZSAgICBVc2UgVWludDhBcnJheSBpbXBsZW1lbnRhdGlvbiAoZmFzdGVzdClcbiAqICAgPT09IGZhbHNlICAgVXNlIE9iamVjdCBpbXBsZW1lbnRhdGlvbiAoY29tcGF0aWJsZSBkb3duIHRvIElFNilcbiAqL1xuQnVmZmVyLl91c2VUeXBlZEFycmF5cyA9IChmdW5jdGlvbiAoKSB7XG4gIC8vIERldGVjdCBpZiBicm93c2VyIHN1cHBvcnRzIFR5cGVkIEFycmF5cy4gU3VwcG9ydGVkIGJyb3dzZXJzIGFyZSBJRSAxMCssIEZpcmVmb3ggNCssXG4gIC8vIENocm9tZSA3KywgU2FmYXJpIDUuMSssIE9wZXJhIDExLjYrLCBpT1MgNC4yKy4gSWYgdGhlIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBhZGRpbmdcbiAgLy8gcHJvcGVydGllcyB0byBgVWludDhBcnJheWAgaW5zdGFuY2VzLCB0aGVuIHRoYXQncyB0aGUgc2FtZSBhcyBubyBgVWludDhBcnJheWAgc3VwcG9ydFxuICAvLyBiZWNhdXNlIHdlIG5lZWQgdG8gYmUgYWJsZSB0byBhZGQgYWxsIHRoZSBub2RlIEJ1ZmZlciBBUEkgbWV0aG9kcy4gVGhpcyBpcyBhbiBpc3N1ZVxuICAvLyBpbiBGaXJlZm94IDQtMjkuIE5vdyBmaXhlZDogaHR0cHM6Ly9idWd6aWxsYS5tb3ppbGxhLm9yZy9zaG93X2J1Zy5jZ2k/aWQ9Njk1NDM4XG4gIHRyeSB7XG4gICAgdmFyIGJ1ZiA9IG5ldyBBcnJheUJ1ZmZlcigwKVxuICAgIHZhciBhcnIgPSBuZXcgVWludDhBcnJheShidWYpXG4gICAgYXJyLmZvbyA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuIDQyIH1cbiAgICByZXR1cm4gNDIgPT09IGFyci5mb28oKSAmJlxuICAgICAgICB0eXBlb2YgYXJyLnN1YmFycmF5ID09PSAnZnVuY3Rpb24nIC8vIENocm9tZSA5LTEwIGxhY2sgYHN1YmFycmF5YFxuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlXG4gIH1cbn0pKClcblxuLyoqXG4gKiBDbGFzczogQnVmZmVyXG4gKiA9PT09PT09PT09PT09XG4gKlxuICogVGhlIEJ1ZmZlciBjb25zdHJ1Y3RvciByZXR1cm5zIGluc3RhbmNlcyBvZiBgVWludDhBcnJheWAgdGhhdCBhcmUgYXVnbWVudGVkXG4gKiB3aXRoIGZ1bmN0aW9uIHByb3BlcnRpZXMgZm9yIGFsbCB0aGUgbm9kZSBgQnVmZmVyYCBBUEkgZnVuY3Rpb25zLiBXZSB1c2VcbiAqIGBVaW50OEFycmF5YCBzbyB0aGF0IHNxdWFyZSBicmFja2V0IG5vdGF0aW9uIHdvcmtzIGFzIGV4cGVjdGVkIC0tIGl0IHJldHVybnNcbiAqIGEgc2luZ2xlIG9jdGV0LlxuICpcbiAqIEJ5IGF1Z21lbnRpbmcgdGhlIGluc3RhbmNlcywgd2UgY2FuIGF2b2lkIG1vZGlmeWluZyB0aGUgYFVpbnQ4QXJyYXlgXG4gKiBwcm90b3R5cGUuXG4gKi9cbmZ1bmN0aW9uIEJ1ZmZlciAoc3ViamVjdCwgZW5jb2RpbmcsIG5vWmVybykge1xuICBpZiAoISh0aGlzIGluc3RhbmNlb2YgQnVmZmVyKSlcbiAgICByZXR1cm4gbmV3IEJ1ZmZlcihzdWJqZWN0LCBlbmNvZGluZywgbm9aZXJvKVxuXG4gIHZhciB0eXBlID0gdHlwZW9mIHN1YmplY3RcblxuICAvLyBXb3JrYXJvdW5kOiBub2RlJ3MgYmFzZTY0IGltcGxlbWVudGF0aW9uIGFsbG93cyBmb3Igbm9uLXBhZGRlZCBzdHJpbmdzXG4gIC8vIHdoaWxlIGJhc2U2NC1qcyBkb2VzIG5vdC5cbiAgaWYgKGVuY29kaW5nID09PSAnYmFzZTY0JyAmJiB0eXBlID09PSAnc3RyaW5nJykge1xuICAgIHN1YmplY3QgPSBzdHJpbmd0cmltKHN1YmplY3QpXG4gICAgd2hpbGUgKHN1YmplY3QubGVuZ3RoICUgNCAhPT0gMCkge1xuICAgICAgc3ViamVjdCA9IHN1YmplY3QgKyAnPSdcbiAgICB9XG4gIH1cblxuICAvLyBGaW5kIHRoZSBsZW5ndGhcbiAgdmFyIGxlbmd0aFxuICBpZiAodHlwZSA9PT0gJ251bWJlcicpXG4gICAgbGVuZ3RoID0gY29lcmNlKHN1YmplY3QpXG4gIGVsc2UgaWYgKHR5cGUgPT09ICdzdHJpbmcnKVxuICAgIGxlbmd0aCA9IEJ1ZmZlci5ieXRlTGVuZ3RoKHN1YmplY3QsIGVuY29kaW5nKVxuICBlbHNlIGlmICh0eXBlID09PSAnb2JqZWN0JylcbiAgICBsZW5ndGggPSBjb2VyY2Uoc3ViamVjdC5sZW5ndGgpIC8vIGFzc3VtZSB0aGF0IG9iamVjdCBpcyBhcnJheS1saWtlXG4gIGVsc2VcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ZpcnN0IGFyZ3VtZW50IG5lZWRzIHRvIGJlIGEgbnVtYmVyLCBhcnJheSBvciBzdHJpbmcuJylcblxuICB2YXIgYnVmXG4gIGlmIChCdWZmZXIuX3VzZVR5cGVkQXJyYXlzKSB7XG4gICAgLy8gUHJlZmVycmVkOiBSZXR1cm4gYW4gYXVnbWVudGVkIGBVaW50OEFycmF5YCBpbnN0YW5jZSBmb3IgYmVzdCBwZXJmb3JtYW5jZVxuICAgIGJ1ZiA9IEJ1ZmZlci5fYXVnbWVudChuZXcgVWludDhBcnJheShsZW5ndGgpKVxuICB9IGVsc2Uge1xuICAgIC8vIEZhbGxiYWNrOiBSZXR1cm4gVEhJUyBpbnN0YW5jZSBvZiBCdWZmZXIgKGNyZWF0ZWQgYnkgYG5ld2ApXG4gICAgYnVmID0gdGhpc1xuICAgIGJ1Zi5sZW5ndGggPSBsZW5ndGhcbiAgICBidWYuX2lzQnVmZmVyID0gdHJ1ZVxuICB9XG5cbiAgdmFyIGlcbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMgJiYgdHlwZW9mIHN1YmplY3QuYnl0ZUxlbmd0aCA9PT0gJ251bWJlcicpIHtcbiAgICAvLyBTcGVlZCBvcHRpbWl6YXRpb24gLS0gdXNlIHNldCBpZiB3ZSdyZSBjb3B5aW5nIGZyb20gYSB0eXBlZCBhcnJheVxuICAgIGJ1Zi5fc2V0KHN1YmplY3QpXG4gIH0gZWxzZSBpZiAoaXNBcnJheWlzaChzdWJqZWN0KSkge1xuICAgIC8vIFRyZWF0IGFycmF5LWlzaCBvYmplY3RzIGFzIGEgYnl0ZSBhcnJheVxuICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSlcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdC5yZWFkVUludDgoaSlcbiAgICAgIGVsc2VcbiAgICAgICAgYnVmW2ldID0gc3ViamVjdFtpXVxuICAgIH1cbiAgfSBlbHNlIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xuICAgIGJ1Zi53cml0ZShzdWJqZWN0LCAwLCBlbmNvZGluZylcbiAgfSBlbHNlIGlmICh0eXBlID09PSAnbnVtYmVyJyAmJiAhQnVmZmVyLl91c2VUeXBlZEFycmF5cyAmJiAhbm9aZXJvKSB7XG4gICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBidWZbaV0gPSAwXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGJ1ZlxufVxuXG4vLyBTVEFUSUMgTUVUSE9EU1xuLy8gPT09PT09PT09PT09PT1cblxuQnVmZmVyLmlzRW5jb2RpbmcgPSBmdW5jdGlvbiAoZW5jb2RpbmcpIHtcbiAgc3dpdGNoIChTdHJpbmcoZW5jb2RpbmcpLnRvTG93ZXJDYXNlKCkpIHtcbiAgICBjYXNlICdoZXgnOlxuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgY2FzZSAnYmluYXJ5JzpcbiAgICBjYXNlICdiYXNlNjQnOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldHVybiB0cnVlXG4gICAgZGVmYXVsdDpcbiAgICAgIHJldHVybiBmYWxzZVxuICB9XG59XG5cbkJ1ZmZlci5pc0J1ZmZlciA9IGZ1bmN0aW9uIChiKSB7XG4gIHJldHVybiAhIShiICE9PSBudWxsICYmIGIgIT09IHVuZGVmaW5lZCAmJiBiLl9pc0J1ZmZlcilcbn1cblxuQnVmZmVyLmJ5dGVMZW5ndGggPSBmdW5jdGlvbiAoc3RyLCBlbmNvZGluZykge1xuICB2YXIgcmV0XG4gIHN0ciA9IHN0ciArICcnXG4gIHN3aXRjaCAoZW5jb2RpbmcgfHwgJ3V0ZjgnKSB7XG4gICAgY2FzZSAnaGV4JzpcbiAgICAgIHJldCA9IHN0ci5sZW5ndGggLyAyXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3V0ZjgnOlxuICAgIGNhc2UgJ3V0Zi04JzpcbiAgICAgIHJldCA9IHV0ZjhUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2FzY2lpJzpcbiAgICBjYXNlICdiaW5hcnknOlxuICAgIGNhc2UgJ3Jhdyc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBiYXNlNjRUb0J5dGVzKHN0cikubGVuZ3RoXG4gICAgICBicmVha1xuICAgIGNhc2UgJ3VjczInOlxuICAgIGNhc2UgJ3Vjcy0yJzpcbiAgICBjYXNlICd1dGYxNmxlJzpcbiAgICBjYXNlICd1dGYtMTZsZSc6XG4gICAgICByZXQgPSBzdHIubGVuZ3RoICogMlxuICAgICAgYnJlYWtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmtub3duIGVuY29kaW5nJylcbiAgfVxuICByZXR1cm4gcmV0XG59XG5cbkJ1ZmZlci5jb25jYXQgPSBmdW5jdGlvbiAobGlzdCwgdG90YWxMZW5ndGgpIHtcbiAgYXNzZXJ0KGlzQXJyYXkobGlzdCksICdVc2FnZTogQnVmZmVyLmNvbmNhdChsaXN0LCBbdG90YWxMZW5ndGhdKVxcbicgK1xuICAgICAgJ2xpc3Qgc2hvdWxkIGJlIGFuIEFycmF5LicpXG5cbiAgaWYgKGxpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgcmV0dXJuIG5ldyBCdWZmZXIoMClcbiAgfSBlbHNlIGlmIChsaXN0Lmxlbmd0aCA9PT0gMSkge1xuICAgIHJldHVybiBsaXN0WzBdXG4gIH1cblxuICB2YXIgaVxuICBpZiAodHlwZW9mIHRvdGFsTGVuZ3RoICE9PSAnbnVtYmVyJykge1xuICAgIHRvdGFsTGVuZ3RoID0gMFxuICAgIGZvciAoaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICB0b3RhbExlbmd0aCArPSBsaXN0W2ldLmxlbmd0aFxuICAgIH1cbiAgfVxuXG4gIHZhciBidWYgPSBuZXcgQnVmZmVyKHRvdGFsTGVuZ3RoKVxuICB2YXIgcG9zID0gMFxuICBmb3IgKGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgIHZhciBpdGVtID0gbGlzdFtpXVxuICAgIGl0ZW0uY29weShidWYsIHBvcylcbiAgICBwb3MgKz0gaXRlbS5sZW5ndGhcbiAgfVxuICByZXR1cm4gYnVmXG59XG5cbi8vIEJVRkZFUiBJTlNUQU5DRSBNRVRIT0RTXG4vLyA9PT09PT09PT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBfaGV4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSBidWYubGVuZ3RoIC0gb2Zmc2V0XG4gIGlmICghbGVuZ3RoKSB7XG4gICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gIH0gZWxzZSB7XG4gICAgbGVuZ3RoID0gTnVtYmVyKGxlbmd0aClcbiAgICBpZiAobGVuZ3RoID4gcmVtYWluaW5nKSB7XG4gICAgICBsZW5ndGggPSByZW1haW5pbmdcbiAgICB9XG4gIH1cblxuICAvLyBtdXN0IGJlIGFuIGV2ZW4gbnVtYmVyIG9mIGRpZ2l0c1xuICB2YXIgc3RyTGVuID0gc3RyaW5nLmxlbmd0aFxuICBhc3NlcnQoc3RyTGVuICUgMiA9PT0gMCwgJ0ludmFsaWQgaGV4IHN0cmluZycpXG5cbiAgaWYgKGxlbmd0aCA+IHN0ckxlbiAvIDIpIHtcbiAgICBsZW5ndGggPSBzdHJMZW4gLyAyXG4gIH1cbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIHZhciBieXRlID0gcGFyc2VJbnQoc3RyaW5nLnN1YnN0cihpICogMiwgMiksIDE2KVxuICAgIGFzc2VydCghaXNOYU4oYnl0ZSksICdJbnZhbGlkIGhleCBzdHJpbmcnKVxuICAgIGJ1ZltvZmZzZXQgKyBpXSA9IGJ5dGVcbiAgfVxuICBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9IGkgKiAyXG4gIHJldHVybiBpXG59XG5cbmZ1bmN0aW9uIF91dGY4V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmOFRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYXNjaWlXcml0ZSAoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBjaGFyc1dyaXR0ZW4gPSBCdWZmZXIuX2NoYXJzV3JpdHRlbiA9XG4gICAgYmxpdEJ1ZmZlcihhc2NpaVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5mdW5jdGlvbiBfYmluYXJ5V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICByZXR1cm4gX2FzY2lpV3JpdGUoYnVmLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0V3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIoYmFzZTY0VG9CeXRlcyhzdHJpbmcpLCBidWYsIG9mZnNldCwgbGVuZ3RoKVxuICByZXR1cm4gY2hhcnNXcml0dGVuXG59XG5cbmZ1bmN0aW9uIF91dGYxNmxlV3JpdGUgKGJ1Ziwgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCkge1xuICB2YXIgY2hhcnNXcml0dGVuID0gQnVmZmVyLl9jaGFyc1dyaXR0ZW4gPVxuICAgIGJsaXRCdWZmZXIodXRmMTZsZVRvQnl0ZXMoc3RyaW5nKSwgYnVmLCBvZmZzZXQsIGxlbmd0aClcbiAgcmV0dXJuIGNoYXJzV3JpdHRlblxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlID0gZnVuY3Rpb24gKHN0cmluZywgb2Zmc2V0LCBsZW5ndGgsIGVuY29kaW5nKSB7XG4gIC8vIFN1cHBvcnQgYm90aCAoc3RyaW5nLCBvZmZzZXQsIGxlbmd0aCwgZW5jb2RpbmcpXG4gIC8vIGFuZCB0aGUgbGVnYWN5IChzdHJpbmcsIGVuY29kaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgaWYgKGlzRmluaXRlKG9mZnNldCkpIHtcbiAgICBpZiAoIWlzRmluaXRlKGxlbmd0aCkpIHtcbiAgICAgIGVuY29kaW5nID0gbGVuZ3RoXG4gICAgICBsZW5ndGggPSB1bmRlZmluZWRcbiAgICB9XG4gIH0gZWxzZSB7ICAvLyBsZWdhY3lcbiAgICB2YXIgc3dhcCA9IGVuY29kaW5nXG4gICAgZW5jb2RpbmcgPSBvZmZzZXRcbiAgICBvZmZzZXQgPSBsZW5ndGhcbiAgICBsZW5ndGggPSBzd2FwXG4gIH1cblxuICBvZmZzZXQgPSBOdW1iZXIob2Zmc2V0KSB8fCAwXG4gIHZhciByZW1haW5pbmcgPSB0aGlzLmxlbmd0aCAtIG9mZnNldFxuICBpZiAoIWxlbmd0aCkge1xuICAgIGxlbmd0aCA9IHJlbWFpbmluZ1xuICB9IGVsc2Uge1xuICAgIGxlbmd0aCA9IE51bWJlcihsZW5ndGgpXG4gICAgaWYgKGxlbmd0aCA+IHJlbWFpbmluZykge1xuICAgICAgbGVuZ3RoID0gcmVtYWluaW5nXG4gICAgfVxuICB9XG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlXcml0ZSh0aGlzLCBzdHJpbmcsIG9mZnNldCwgbGVuZ3RoKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVdyaXRlKHRoaXMsIHN0cmluZywgb2Zmc2V0LCBsZW5ndGgpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0V3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlV3JpdGUodGhpcywgc3RyaW5nLCBvZmZzZXQsIGxlbmd0aClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24gKGVuY29kaW5nLCBzdGFydCwgZW5kKSB7XG4gIHZhciBzZWxmID0gdGhpc1xuXG4gIGVuY29kaW5nID0gU3RyaW5nKGVuY29kaW5nIHx8ICd1dGY4JykudG9Mb3dlckNhc2UoKVxuICBzdGFydCA9IE51bWJlcihzdGFydCkgfHwgMFxuICBlbmQgPSAoZW5kICE9PSB1bmRlZmluZWQpXG4gICAgPyBOdW1iZXIoZW5kKVxuICAgIDogZW5kID0gc2VsZi5sZW5ndGhcblxuICAvLyBGYXN0cGF0aCBlbXB0eSBzdHJpbmdzXG4gIGlmIChlbmQgPT09IHN0YXJ0KVxuICAgIHJldHVybiAnJ1xuXG4gIHZhciByZXRcbiAgc3dpdGNoIChlbmNvZGluZykge1xuICAgIGNhc2UgJ2hleCc6XG4gICAgICByZXQgPSBfaGV4U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndXRmOCc6XG4gICAgY2FzZSAndXRmLTgnOlxuICAgICAgcmV0ID0gX3V0ZjhTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdhc2NpaSc6XG4gICAgICByZXQgPSBfYXNjaWlTbGljZShzZWxmLCBzdGFydCwgZW5kKVxuICAgICAgYnJlYWtcbiAgICBjYXNlICdiaW5hcnknOlxuICAgICAgcmV0ID0gX2JpbmFyeVNsaWNlKHNlbGYsIHN0YXJ0LCBlbmQpXG4gICAgICBicmVha1xuICAgIGNhc2UgJ2Jhc2U2NCc6XG4gICAgICByZXQgPSBfYmFzZTY0U2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgY2FzZSAndWNzMic6XG4gICAgY2FzZSAndWNzLTInOlxuICAgIGNhc2UgJ3V0ZjE2bGUnOlxuICAgIGNhc2UgJ3V0Zi0xNmxlJzpcbiAgICAgIHJldCA9IF91dGYxNmxlU2xpY2Uoc2VsZiwgc3RhcnQsIGVuZClcbiAgICAgIGJyZWFrXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcignVW5rbm93biBlbmNvZGluZycpXG4gIH1cbiAgcmV0dXJuIHJldFxufVxuXG5CdWZmZXIucHJvdG90eXBlLnRvSlNPTiA9IGZ1bmN0aW9uICgpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnQnVmZmVyJyxcbiAgICBkYXRhOiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbCh0aGlzLl9hcnIgfHwgdGhpcywgMClcbiAgfVxufVxuXG4vLyBjb3B5KHRhcmdldEJ1ZmZlciwgdGFyZ2V0U3RhcnQ9MCwgc291cmNlU3RhcnQ9MCwgc291cmNlRW5kPWJ1ZmZlci5sZW5ndGgpXG5CdWZmZXIucHJvdG90eXBlLmNvcHkgPSBmdW5jdGlvbiAodGFyZ2V0LCB0YXJnZXRfc3RhcnQsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIHNvdXJjZSA9IHRoaXNcblxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgJiYgZW5kICE9PSAwKSBlbmQgPSB0aGlzLmxlbmd0aFxuICBpZiAoIXRhcmdldF9zdGFydCkgdGFyZ2V0X3N0YXJ0ID0gMFxuXG4gIC8vIENvcHkgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0YXJnZXQubGVuZ3RoID09PSAwIHx8IHNvdXJjZS5sZW5ndGggPT09IDApIHJldHVyblxuXG4gIC8vIEZhdGFsIGVycm9yIGNvbmRpdGlvbnNcbiAgYXNzZXJ0KGVuZCA+PSBzdGFydCwgJ3NvdXJjZUVuZCA8IHNvdXJjZVN0YXJ0JylcbiAgYXNzZXJ0KHRhcmdldF9zdGFydCA+PSAwICYmIHRhcmdldF9zdGFydCA8IHRhcmdldC5sZW5ndGgsXG4gICAgICAndGFyZ2V0U3RhcnQgb3V0IG9mIGJvdW5kcycpXG4gIGFzc2VydChzdGFydCA+PSAwICYmIHN0YXJ0IDwgc291cmNlLmxlbmd0aCwgJ3NvdXJjZVN0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHNvdXJjZS5sZW5ndGgsICdzb3VyY2VFbmQgb3V0IG9mIGJvdW5kcycpXG5cbiAgLy8gQXJlIHdlIG9vYj9cbiAgaWYgKGVuZCA+IHRoaXMubGVuZ3RoKVxuICAgIGVuZCA9IHRoaXMubGVuZ3RoXG4gIGlmICh0YXJnZXQubGVuZ3RoIC0gdGFyZ2V0X3N0YXJ0IDwgZW5kIC0gc3RhcnQpXG4gICAgZW5kID0gdGFyZ2V0Lmxlbmd0aCAtIHRhcmdldF9zdGFydCArIHN0YXJ0XG5cbiAgdmFyIGxlbiA9IGVuZCAtIHN0YXJ0XG5cbiAgaWYgKGxlbiA8IDEwMCB8fCAhQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspXG4gICAgICB0YXJnZXRbaSArIHRhcmdldF9zdGFydF0gPSB0aGlzW2kgKyBzdGFydF1cbiAgfSBlbHNlIHtcbiAgICB0YXJnZXQuX3NldCh0aGlzLnN1YmFycmF5KHN0YXJ0LCBzdGFydCArIGxlbiksIHRhcmdldF9zdGFydClcbiAgfVxufVxuXG5mdW5jdGlvbiBfYmFzZTY0U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICBpZiAoc3RhcnQgPT09IDAgJiYgZW5kID09PSBidWYubGVuZ3RoKSB7XG4gICAgcmV0dXJuIGJhc2U2NC5mcm9tQnl0ZUFycmF5KGJ1ZilcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gYmFzZTY0LmZyb21CeXRlQXJyYXkoYnVmLnNsaWNlKHN0YXJ0LCBlbmQpKVxuICB9XG59XG5cbmZ1bmN0aW9uIF91dGY4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmVzID0gJydcbiAgdmFyIHRtcCA9ICcnXG4gIGVuZCA9IE1hdGgubWluKGJ1Zi5sZW5ndGgsIGVuZClcblxuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIGlmIChidWZbaV0gPD0gMHg3Rikge1xuICAgICAgcmVzICs9IGRlY29kZVV0ZjhDaGFyKHRtcCkgKyBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgICAgIHRtcCA9ICcnXG4gICAgfSBlbHNlIHtcbiAgICAgIHRtcCArPSAnJScgKyBidWZbaV0udG9TdHJpbmcoMTYpXG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcyArIGRlY29kZVV0ZjhDaGFyKHRtcClcbn1cblxuZnVuY3Rpb24gX2FzY2lpU2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgcmV0ID0gJydcbiAgZW5kID0gTWF0aC5taW4oYnVmLmxlbmd0aCwgZW5kKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKVxuICAgIHJldCArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGJ1ZltpXSlcbiAgcmV0dXJuIHJldFxufVxuXG5mdW5jdGlvbiBfYmluYXJ5U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICByZXR1cm4gX2FzY2lpU2xpY2UoYnVmLCBzdGFydCwgZW5kKVxufVxuXG5mdW5jdGlvbiBfaGV4U2xpY2UgKGJ1Ziwgc3RhcnQsIGVuZCkge1xuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuXG4gIGlmICghc3RhcnQgfHwgc3RhcnQgPCAwKSBzdGFydCA9IDBcbiAgaWYgKCFlbmQgfHwgZW5kIDwgMCB8fCBlbmQgPiBsZW4pIGVuZCA9IGxlblxuXG4gIHZhciBvdXQgPSAnJ1xuICBmb3IgKHZhciBpID0gc3RhcnQ7IGkgPCBlbmQ7IGkrKykge1xuICAgIG91dCArPSB0b0hleChidWZbaV0pXG4gIH1cbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiBfdXRmMTZsZVNsaWNlIChidWYsIHN0YXJ0LCBlbmQpIHtcbiAgdmFyIGJ5dGVzID0gYnVmLnNsaWNlKHN0YXJ0LCBlbmQpXG4gIHZhciByZXMgPSAnJ1xuICBmb3IgKHZhciBpID0gMDsgaSA8IGJ5dGVzLmxlbmd0aDsgaSArPSAyKSB7XG4gICAgcmVzICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoYnl0ZXNbaV0gKyBieXRlc1tpKzFdICogMjU2KVxuICB9XG4gIHJldHVybiByZXNcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5zbGljZSA9IGZ1bmN0aW9uIChzdGFydCwgZW5kKSB7XG4gIHZhciBsZW4gPSB0aGlzLmxlbmd0aFxuICBzdGFydCA9IGNsYW1wKHN0YXJ0LCBsZW4sIDApXG4gIGVuZCA9IGNsYW1wKGVuZCwgbGVuLCBsZW4pXG5cbiAgaWYgKEJ1ZmZlci5fdXNlVHlwZWRBcnJheXMpIHtcbiAgICByZXR1cm4gQnVmZmVyLl9hdWdtZW50KHRoaXMuc3ViYXJyYXkoc3RhcnQsIGVuZCkpXG4gIH0gZWxzZSB7XG4gICAgdmFyIHNsaWNlTGVuID0gZW5kIC0gc3RhcnRcbiAgICB2YXIgbmV3QnVmID0gbmV3IEJ1ZmZlcihzbGljZUxlbiwgdW5kZWZpbmVkLCB0cnVlKVxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2xpY2VMZW47IGkrKykge1xuICAgICAgbmV3QnVmW2ldID0gdGhpc1tpICsgc3RhcnRdXG4gICAgfVxuICAgIHJldHVybiBuZXdCdWZcbiAgfVxufVxuXG4vLyBgZ2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAob2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuZ2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy5yZWFkVUludDgob2Zmc2V0KVxufVxuXG4vLyBgc2V0YCB3aWxsIGJlIHJlbW92ZWQgaW4gTm9kZSAwLjEzK1xuQnVmZmVyLnByb3RvdHlwZS5zZXQgPSBmdW5jdGlvbiAodiwgb2Zmc2V0KSB7XG4gIGNvbnNvbGUubG9nKCcuc2V0KCkgaXMgZGVwcmVjYXRlZC4gQWNjZXNzIHVzaW5nIGFycmF5IGluZGV4ZXMgaW5zdGVhZC4nKVxuICByZXR1cm4gdGhpcy53cml0ZVVJbnQ4KHYsIG9mZnNldClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHJldHVybiB0aGlzW29mZnNldF1cbn1cblxuZnVuY3Rpb24gX3JlYWRVSW50MTYgKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICB2YXIgdmFsXG4gIGlmIChsaXR0bGVFbmRpYW4pIHtcbiAgICB2YWwgPSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXSA8PCA4XG4gIH0gZWxzZSB7XG4gICAgdmFsID0gYnVmW29mZnNldF0gPDwgOFxuICAgIGlmIChvZmZzZXQgKyAxIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAxXVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2TEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MTYodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF9yZWFkVUludDMyIChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbFxuICBpZiAobGl0dGxlRW5kaWFuKSB7XG4gICAgaWYgKG9mZnNldCArIDIgPCBsZW4pXG4gICAgICB2YWwgPSBidWZbb2Zmc2V0ICsgMl0gPDwgMTZcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCB8PSBidWZbb2Zmc2V0ICsgMV0gPDwgOFxuICAgIHZhbCB8PSBidWZbb2Zmc2V0XVxuICAgIGlmIChvZmZzZXQgKyAzIDwgbGVuKVxuICAgICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXQgKyAzXSA8PCAyNCA+Pj4gMClcbiAgfSBlbHNlIHtcbiAgICBpZiAob2Zmc2V0ICsgMSA8IGxlbilcbiAgICAgIHZhbCA9IGJ1ZltvZmZzZXQgKyAxXSA8PCAxNlxuICAgIGlmIChvZmZzZXQgKyAyIDwgbGVuKVxuICAgICAgdmFsIHw9IGJ1ZltvZmZzZXQgKyAyXSA8PCA4XG4gICAgaWYgKG9mZnNldCArIDMgPCBsZW4pXG4gICAgICB2YWwgfD0gYnVmW29mZnNldCArIDNdXG4gICAgdmFsID0gdmFsICsgKGJ1ZltvZmZzZXRdIDw8IDI0ID4+PiAwKVxuICB9XG4gIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyTEUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkVUludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRVSW50MzIodGhpcywgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDggPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCxcbiAgICAgICAgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIHZhciBuZWcgPSB0aGlzW29mZnNldF0gJiAweDgwXG4gIGlmIChuZWcpXG4gICAgcmV0dXJuICgweGZmIC0gdGhpc1tvZmZzZXRdICsgMSkgKiAtMVxuICBlbHNlXG4gICAgcmV0dXJuIHRoaXNbb2Zmc2V0XVxufVxuXG5mdW5jdGlvbiBfcmVhZEludDE2IChidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDEgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHJlYWQgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgdmFyIHZhbCA9IF9yZWFkVUludDE2KGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIHRydWUpXG4gIHZhciBuZWcgPSB2YWwgJiAweDgwMDBcbiAgaWYgKG5lZylcbiAgICByZXR1cm4gKDB4ZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MTZMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDE2KHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDE2QkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQxNih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRJbnQzMiAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAzIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byByZWFkIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIHZhciB2YWwgPSBfcmVhZFVJbnQzMihidWYsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCB0cnVlKVxuICB2YXIgbmVnID0gdmFsICYgMHg4MDAwMDAwMFxuICBpZiAobmVnKVxuICAgIHJldHVybiAoMHhmZmZmZmZmZiAtIHZhbCArIDEpICogLTFcbiAgZWxzZVxuICAgIHJldHVybiB2YWxcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkSW50MzJMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEludDMyKHRoaXMsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUucmVhZEludDMyQkUgPSBmdW5jdGlvbiAob2Zmc2V0LCBub0Fzc2VydCkge1xuICByZXR1cm4gX3JlYWRJbnQzMih0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3JlYWRGbG9hdCAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDIzLCA0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWRGbG9hdExFID0gZnVuY3Rpb24gKG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgcmV0dXJuIF9yZWFkRmxvYXQodGhpcywgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS5yZWFkRmxvYXRCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZEZsb2F0KHRoaXMsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfcmVhZERvdWJsZSAoYnVmLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICsgNyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gcmVhZCBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gIH1cblxuICByZXR1cm4gaWVlZTc1NC5yZWFkKGJ1Ziwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIDUyLCA4KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVMRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLnJlYWREb3VibGVCRSA9IGZ1bmN0aW9uIChvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIHJldHVybiBfcmVhZERvdWJsZSh0aGlzLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZVVJbnQ4ID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCA8IHRoaXMubGVuZ3RoLCAndHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnVpbnQodmFsdWUsIDB4ZmYpXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKSByZXR1cm5cblxuICB0aGlzW29mZnNldF0gPSB2YWx1ZVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MTYgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMSA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgZm9yICh2YXIgaSA9IDAsIGogPSBNYXRoLm1pbihsZW4gLSBvZmZzZXQsIDIpOyBpIDwgajsgaSsrKSB7XG4gICAgYnVmW29mZnNldCArIGldID1cbiAgICAgICAgKHZhbHVlICYgKDB4ZmYgPDwgKDggKiAobGl0dGxlRW5kaWFuID8gaSA6IDEgLSBpKSkpKSA+Pj5cbiAgICAgICAgICAgIChsaXR0bGVFbmRpYW4gPyBpIDogMSAtIGkpICogOFxuICB9XG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZMRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVVSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVVSW50MTYodGhpcywgdmFsdWUsIG9mZnNldCwgZmFsc2UsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVVSW50MzIgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICd0cnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmdWludCh2YWx1ZSwgMHhmZmZmZmZmZilcbiAgfVxuXG4gIHZhciBsZW4gPSBidWYubGVuZ3RoXG4gIGlmIChvZmZzZXQgPj0gbGVuKVxuICAgIHJldHVyblxuXG4gIGZvciAodmFyIGkgPSAwLCBqID0gTWF0aC5taW4obGVuIC0gb2Zmc2V0LCA0KTsgaSA8IGo7IGkrKykge1xuICAgIGJ1ZltvZmZzZXQgKyBpXSA9XG4gICAgICAgICh2YWx1ZSA+Pj4gKGxpdHRsZUVuZGlhbiA/IGkgOiAzIC0gaSkgKiA4KSAmIDB4ZmZcbiAgfVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlVUludDMyQkUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlVUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDggPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0IDwgdGhpcy5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmc2ludCh2YWx1ZSwgMHg3ZiwgLTB4ODApXG4gIH1cblxuICBpZiAob2Zmc2V0ID49IHRoaXMubGVuZ3RoKVxuICAgIHJldHVyblxuXG4gIGlmICh2YWx1ZSA+PSAwKVxuICAgIHRoaXMud3JpdGVVSW50OCh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydClcbiAgZWxzZVxuICAgIHRoaXMud3JpdGVVSW50OCgweGZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIG5vQXNzZXJ0KVxufVxuXG5mdW5jdGlvbiBfd3JpdGVJbnQxNiAoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KSB7XG4gIGlmICghbm9Bc3NlcnQpIHtcbiAgICBhc3NlcnQodmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2YWx1ZSAhPT0gbnVsbCwgJ21pc3NpbmcgdmFsdWUnKVxuICAgIGFzc2VydCh0eXBlb2YgbGl0dGxlRW5kaWFuID09PSAnYm9vbGVhbicsICdtaXNzaW5nIG9yIGludmFsaWQgZW5kaWFuJylcbiAgICBhc3NlcnQob2Zmc2V0ICE9PSB1bmRlZmluZWQgJiYgb2Zmc2V0ICE9PSBudWxsLCAnbWlzc2luZyBvZmZzZXQnKVxuICAgIGFzc2VydChvZmZzZXQgKyAxIDwgYnVmLmxlbmd0aCwgJ1RyeWluZyB0byB3cml0ZSBiZXlvbmQgYnVmZmVyIGxlbmd0aCcpXG4gICAgdmVyaWZzaW50KHZhbHVlLCAweDdmZmYsIC0weDgwMDApXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZiAodmFsdWUgPj0gMClcbiAgICBfd3JpdGVVSW50MTYoYnVmLCB2YWx1ZSwgb2Zmc2V0LCBsaXR0bGVFbmRpYW4sIG5vQXNzZXJ0KVxuICBlbHNlXG4gICAgX3dyaXRlVUludDE2KGJ1ZiwgMHhmZmZmICsgdmFsdWUgKyAxLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQxNkxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDE2KHRoaXMsIHZhbHVlLCBvZmZzZXQsIHRydWUsIG5vQXNzZXJ0KVxufVxuXG5CdWZmZXIucHJvdG90eXBlLndyaXRlSW50MTZCRSA9IGZ1bmN0aW9uICh2YWx1ZSwgb2Zmc2V0LCBub0Fzc2VydCkge1xuICBfd3JpdGVJbnQxNih0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbmZ1bmN0aW9uIF93cml0ZUludDMyIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDMgPCBidWYubGVuZ3RoLCAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZnNpbnQodmFsdWUsIDB4N2ZmZmZmZmYsIC0weDgwMDAwMDAwKVxuICB9XG5cbiAgdmFyIGxlbiA9IGJ1Zi5sZW5ndGhcbiAgaWYgKG9mZnNldCA+PSBsZW4pXG4gICAgcmV0dXJuXG5cbiAgaWYgKHZhbHVlID49IDApXG4gICAgX3dyaXRlVUludDMyKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbiAgZWxzZVxuICAgIF93cml0ZVVJbnQzMihidWYsIDB4ZmZmZmZmZmYgKyB2YWx1ZSArIDEsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUludDMyTEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlSW50MzIodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVJbnQzMkJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUludDMyKHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRmxvYXQgKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCBub0Fzc2VydCkge1xuICBpZiAoIW5vQXNzZXJ0KSB7XG4gICAgYXNzZXJ0KHZhbHVlICE9PSB1bmRlZmluZWQgJiYgdmFsdWUgIT09IG51bGwsICdtaXNzaW5nIHZhbHVlJylcbiAgICBhc3NlcnQodHlwZW9mIGxpdHRsZUVuZGlhbiA9PT0gJ2Jvb2xlYW4nLCAnbWlzc2luZyBvciBpbnZhbGlkIGVuZGlhbicpXG4gICAgYXNzZXJ0KG9mZnNldCAhPT0gdW5kZWZpbmVkICYmIG9mZnNldCAhPT0gbnVsbCwgJ21pc3Npbmcgb2Zmc2V0JylcbiAgICBhc3NlcnQob2Zmc2V0ICsgMyA8IGJ1Zi5sZW5ndGgsICdUcnlpbmcgdG8gd3JpdGUgYmV5b25kIGJ1ZmZlciBsZW5ndGgnKVxuICAgIHZlcmlmSUVFRTc1NCh2YWx1ZSwgMy40MDI4MjM0NjYzODUyODg2ZSszOCwgLTMuNDAyODIzNDY2Mzg1Mjg4NmUrMzgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCAyMywgNClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZUZsb2F0TEUgPSBmdW5jdGlvbiAodmFsdWUsIG9mZnNldCwgbm9Bc3NlcnQpIHtcbiAgX3dyaXRlRmxvYXQodGhpcywgdmFsdWUsIG9mZnNldCwgdHJ1ZSwgbm9Bc3NlcnQpXG59XG5cbkJ1ZmZlci5wcm90b3R5cGUud3JpdGVGbG9hdEJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZUZsb2F0KHRoaXMsIHZhbHVlLCBvZmZzZXQsIGZhbHNlLCBub0Fzc2VydClcbn1cblxuZnVuY3Rpb24gX3dyaXRlRG91YmxlIChidWYsIHZhbHVlLCBvZmZzZXQsIGxpdHRsZUVuZGlhbiwgbm9Bc3NlcnQpIHtcbiAgaWYgKCFub0Fzc2VydCkge1xuICAgIGFzc2VydCh2YWx1ZSAhPT0gdW5kZWZpbmVkICYmIHZhbHVlICE9PSBudWxsLCAnbWlzc2luZyB2YWx1ZScpXG4gICAgYXNzZXJ0KHR5cGVvZiBsaXR0bGVFbmRpYW4gPT09ICdib29sZWFuJywgJ21pc3Npbmcgb3IgaW52YWxpZCBlbmRpYW4nKVxuICAgIGFzc2VydChvZmZzZXQgIT09IHVuZGVmaW5lZCAmJiBvZmZzZXQgIT09IG51bGwsICdtaXNzaW5nIG9mZnNldCcpXG4gICAgYXNzZXJ0KG9mZnNldCArIDcgPCBidWYubGVuZ3RoLFxuICAgICAgICAnVHJ5aW5nIHRvIHdyaXRlIGJleW9uZCBidWZmZXIgbGVuZ3RoJylcbiAgICB2ZXJpZklFRUU3NTQodmFsdWUsIDEuNzk3NjkzMTM0ODYyMzE1N0UrMzA4LCAtMS43OTc2OTMxMzQ4NjIzMTU3RSszMDgpXG4gIH1cblxuICB2YXIgbGVuID0gYnVmLmxlbmd0aFxuICBpZiAob2Zmc2V0ID49IGxlbilcbiAgICByZXR1cm5cblxuICBpZWVlNzU0LndyaXRlKGJ1ZiwgdmFsdWUsIG9mZnNldCwgbGl0dGxlRW5kaWFuLCA1MiwgOClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUxFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCB0cnVlLCBub0Fzc2VydClcbn1cblxuQnVmZmVyLnByb3RvdHlwZS53cml0ZURvdWJsZUJFID0gZnVuY3Rpb24gKHZhbHVlLCBvZmZzZXQsIG5vQXNzZXJ0KSB7XG4gIF93cml0ZURvdWJsZSh0aGlzLCB2YWx1ZSwgb2Zmc2V0LCBmYWxzZSwgbm9Bc3NlcnQpXG59XG5cbi8vIGZpbGwodmFsdWUsIHN0YXJ0PTAsIGVuZD1idWZmZXIubGVuZ3RoKVxuQnVmZmVyLnByb3RvdHlwZS5maWxsID0gZnVuY3Rpb24gKHZhbHVlLCBzdGFydCwgZW5kKSB7XG4gIGlmICghdmFsdWUpIHZhbHVlID0gMFxuICBpZiAoIXN0YXJ0KSBzdGFydCA9IDBcbiAgaWYgKCFlbmQpIGVuZCA9IHRoaXMubGVuZ3RoXG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycpIHtcbiAgICB2YWx1ZSA9IHZhbHVlLmNoYXJDb2RlQXQoMClcbiAgfVxuXG4gIGFzc2VydCh0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmICFpc05hTih2YWx1ZSksICd2YWx1ZSBpcyBub3QgYSBudW1iZXInKVxuICBhc3NlcnQoZW5kID49IHN0YXJ0LCAnZW5kIDwgc3RhcnQnKVxuXG4gIC8vIEZpbGwgMCBieXRlczsgd2UncmUgZG9uZVxuICBpZiAoZW5kID09PSBzdGFydCkgcmV0dXJuXG4gIGlmICh0aGlzLmxlbmd0aCA9PT0gMCkgcmV0dXJuXG5cbiAgYXNzZXJ0KHN0YXJ0ID49IDAgJiYgc3RhcnQgPCB0aGlzLmxlbmd0aCwgJ3N0YXJ0IG91dCBvZiBib3VuZHMnKVxuICBhc3NlcnQoZW5kID49IDAgJiYgZW5kIDw9IHRoaXMubGVuZ3RoLCAnZW5kIG91dCBvZiBib3VuZHMnKVxuXG4gIGZvciAodmFyIGkgPSBzdGFydDsgaSA8IGVuZDsgaSsrKSB7XG4gICAgdGhpc1tpXSA9IHZhbHVlXG4gIH1cbn1cblxuQnVmZmVyLnByb3RvdHlwZS5pbnNwZWN0ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgb3V0ID0gW11cbiAgdmFyIGxlbiA9IHRoaXMubGVuZ3RoXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuOyBpKyspIHtcbiAgICBvdXRbaV0gPSB0b0hleCh0aGlzW2ldKVxuICAgIGlmIChpID09PSBleHBvcnRzLklOU1BFQ1RfTUFYX0JZVEVTKSB7XG4gICAgICBvdXRbaSArIDFdID0gJy4uLidcbiAgICAgIGJyZWFrXG4gICAgfVxuICB9XG4gIHJldHVybiAnPEJ1ZmZlciAnICsgb3V0LmpvaW4oJyAnKSArICc+J1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgYEFycmF5QnVmZmVyYCB3aXRoIHRoZSAqY29waWVkKiBtZW1vcnkgb2YgdGhlIGJ1ZmZlciBpbnN0YW5jZS5cbiAqIEFkZGVkIGluIE5vZGUgMC4xMi4gT25seSBhdmFpbGFibGUgaW4gYnJvd3NlcnMgdGhhdCBzdXBwb3J0IEFycmF5QnVmZmVyLlxuICovXG5CdWZmZXIucHJvdG90eXBlLnRvQXJyYXlCdWZmZXIgPSBmdW5jdGlvbiAoKSB7XG4gIGlmICh0eXBlb2YgVWludDhBcnJheSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAoQnVmZmVyLl91c2VUeXBlZEFycmF5cykge1xuICAgICAgcmV0dXJuIChuZXcgQnVmZmVyKHRoaXMpKS5idWZmZXJcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGJ1ZiA9IG5ldyBVaW50OEFycmF5KHRoaXMubGVuZ3RoKVxuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGJ1Zi5sZW5ndGg7IGkgPCBsZW47IGkgKz0gMSlcbiAgICAgICAgYnVmW2ldID0gdGhpc1tpXVxuICAgICAgcmV0dXJuIGJ1Zi5idWZmZXJcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdCdWZmZXIudG9BcnJheUJ1ZmZlciBub3Qgc3VwcG9ydGVkIGluIHRoaXMgYnJvd3NlcicpXG4gIH1cbn1cblxuLy8gSEVMUEVSIEZVTkNUSU9OU1xuLy8gPT09PT09PT09PT09PT09PVxuXG5mdW5jdGlvbiBzdHJpbmd0cmltIChzdHIpIHtcbiAgaWYgKHN0ci50cmltKSByZXR1cm4gc3RyLnRyaW0oKVxuICByZXR1cm4gc3RyLnJlcGxhY2UoL15cXHMrfFxccyskL2csICcnKVxufVxuXG52YXIgQlAgPSBCdWZmZXIucHJvdG90eXBlXG5cbi8qKlxuICogQXVnbWVudCBhIFVpbnQ4QXJyYXkgKmluc3RhbmNlKiAobm90IHRoZSBVaW50OEFycmF5IGNsYXNzISkgd2l0aCBCdWZmZXIgbWV0aG9kc1xuICovXG5CdWZmZXIuX2F1Z21lbnQgPSBmdW5jdGlvbiAoYXJyKSB7XG4gIGFyci5faXNCdWZmZXIgPSB0cnVlXG5cbiAgLy8gc2F2ZSByZWZlcmVuY2UgdG8gb3JpZ2luYWwgVWludDhBcnJheSBnZXQvc2V0IG1ldGhvZHMgYmVmb3JlIG92ZXJ3cml0aW5nXG4gIGFyci5fZ2V0ID0gYXJyLmdldFxuICBhcnIuX3NldCA9IGFyci5zZXRcblxuICAvLyBkZXByZWNhdGVkLCB3aWxsIGJlIHJlbW92ZWQgaW4gbm9kZSAwLjEzK1xuICBhcnIuZ2V0ID0gQlAuZ2V0XG4gIGFyci5zZXQgPSBCUC5zZXRcblxuICBhcnIud3JpdGUgPSBCUC53cml0ZVxuICBhcnIudG9TdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9Mb2NhbGVTdHJpbmcgPSBCUC50b1N0cmluZ1xuICBhcnIudG9KU09OID0gQlAudG9KU09OXG4gIGFyci5jb3B5ID0gQlAuY29weVxuICBhcnIuc2xpY2UgPSBCUC5zbGljZVxuICBhcnIucmVhZFVJbnQ4ID0gQlAucmVhZFVJbnQ4XG4gIGFyci5yZWFkVUludDE2TEUgPSBCUC5yZWFkVUludDE2TEVcbiAgYXJyLnJlYWRVSW50MTZCRSA9IEJQLnJlYWRVSW50MTZCRVxuICBhcnIucmVhZFVJbnQzMkxFID0gQlAucmVhZFVJbnQzMkxFXG4gIGFyci5yZWFkVUludDMyQkUgPSBCUC5yZWFkVUludDMyQkVcbiAgYXJyLnJlYWRJbnQ4ID0gQlAucmVhZEludDhcbiAgYXJyLnJlYWRJbnQxNkxFID0gQlAucmVhZEludDE2TEVcbiAgYXJyLnJlYWRJbnQxNkJFID0gQlAucmVhZEludDE2QkVcbiAgYXJyLnJlYWRJbnQzMkxFID0gQlAucmVhZEludDMyTEVcbiAgYXJyLnJlYWRJbnQzMkJFID0gQlAucmVhZEludDMyQkVcbiAgYXJyLnJlYWRGbG9hdExFID0gQlAucmVhZEZsb2F0TEVcbiAgYXJyLnJlYWRGbG9hdEJFID0gQlAucmVhZEZsb2F0QkVcbiAgYXJyLnJlYWREb3VibGVMRSA9IEJQLnJlYWREb3VibGVMRVxuICBhcnIucmVhZERvdWJsZUJFID0gQlAucmVhZERvdWJsZUJFXG4gIGFyci53cml0ZVVJbnQ4ID0gQlAud3JpdGVVSW50OFxuICBhcnIud3JpdGVVSW50MTZMRSA9IEJQLndyaXRlVUludDE2TEVcbiAgYXJyLndyaXRlVUludDE2QkUgPSBCUC53cml0ZVVJbnQxNkJFXG4gIGFyci53cml0ZVVJbnQzMkxFID0gQlAud3JpdGVVSW50MzJMRVxuICBhcnIud3JpdGVVSW50MzJCRSA9IEJQLndyaXRlVUludDMyQkVcbiAgYXJyLndyaXRlSW50OCA9IEJQLndyaXRlSW50OFxuICBhcnIud3JpdGVJbnQxNkxFID0gQlAud3JpdGVJbnQxNkxFXG4gIGFyci53cml0ZUludDE2QkUgPSBCUC53cml0ZUludDE2QkVcbiAgYXJyLndyaXRlSW50MzJMRSA9IEJQLndyaXRlSW50MzJMRVxuICBhcnIud3JpdGVJbnQzMkJFID0gQlAud3JpdGVJbnQzMkJFXG4gIGFyci53cml0ZUZsb2F0TEUgPSBCUC53cml0ZUZsb2F0TEVcbiAgYXJyLndyaXRlRmxvYXRCRSA9IEJQLndyaXRlRmxvYXRCRVxuICBhcnIud3JpdGVEb3VibGVMRSA9IEJQLndyaXRlRG91YmxlTEVcbiAgYXJyLndyaXRlRG91YmxlQkUgPSBCUC53cml0ZURvdWJsZUJFXG4gIGFyci5maWxsID0gQlAuZmlsbFxuICBhcnIuaW5zcGVjdCA9IEJQLmluc3BlY3RcbiAgYXJyLnRvQXJyYXlCdWZmZXIgPSBCUC50b0FycmF5QnVmZmVyXG5cbiAgcmV0dXJuIGFyclxufVxuXG4vLyBzbGljZShzdGFydCwgZW5kKVxuZnVuY3Rpb24gY2xhbXAgKGluZGV4LCBsZW4sIGRlZmF1bHRWYWx1ZSkge1xuICBpZiAodHlwZW9mIGluZGV4ICE9PSAnbnVtYmVyJykgcmV0dXJuIGRlZmF1bHRWYWx1ZVxuICBpbmRleCA9IH5+aW5kZXg7ICAvLyBDb2VyY2UgdG8gaW50ZWdlci5cbiAgaWYgKGluZGV4ID49IGxlbikgcmV0dXJuIGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIGluZGV4ICs9IGxlblxuICBpZiAoaW5kZXggPj0gMCkgcmV0dXJuIGluZGV4XG4gIHJldHVybiAwXG59XG5cbmZ1bmN0aW9uIGNvZXJjZSAobGVuZ3RoKSB7XG4gIC8vIENvZXJjZSBsZW5ndGggdG8gYSBudW1iZXIgKHBvc3NpYmx5IE5hTiksIHJvdW5kIHVwXG4gIC8vIGluIGNhc2UgaXQncyBmcmFjdGlvbmFsIChlLmcuIDEyMy40NTYpIHRoZW4gZG8gYVxuICAvLyBkb3VibGUgbmVnYXRlIHRvIGNvZXJjZSBhIE5hTiB0byAwLiBFYXN5LCByaWdodD9cbiAgbGVuZ3RoID0gfn5NYXRoLmNlaWwoK2xlbmd0aClcbiAgcmV0dXJuIGxlbmd0aCA8IDAgPyAwIDogbGVuZ3RoXG59XG5cbmZ1bmN0aW9uIGlzQXJyYXkgKHN1YmplY3QpIHtcbiAgcmV0dXJuIChBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChzdWJqZWN0KSB7XG4gICAgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzdWJqZWN0KSA9PT0gJ1tvYmplY3QgQXJyYXldJ1xuICB9KShzdWJqZWN0KVxufVxuXG5mdW5jdGlvbiBpc0FycmF5aXNoIChzdWJqZWN0KSB7XG4gIHJldHVybiBpc0FycmF5KHN1YmplY3QpIHx8IEJ1ZmZlci5pc0J1ZmZlcihzdWJqZWN0KSB8fFxuICAgICAgc3ViamVjdCAmJiB0eXBlb2Ygc3ViamVjdCA9PT0gJ29iamVjdCcgJiZcbiAgICAgIHR5cGVvZiBzdWJqZWN0Lmxlbmd0aCA9PT0gJ251bWJlcidcbn1cblxuZnVuY3Rpb24gdG9IZXggKG4pIHtcbiAgaWYgKG4gPCAxNikgcmV0dXJuICcwJyArIG4udG9TdHJpbmcoMTYpXG4gIHJldHVybiBuLnRvU3RyaW5nKDE2KVxufVxuXG5mdW5jdGlvbiB1dGY4VG9CeXRlcyAoc3RyKSB7XG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIHZhciBiID0gc3RyLmNoYXJDb2RlQXQoaSlcbiAgICBpZiAoYiA8PSAweDdGKVxuICAgICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkpXG4gICAgZWxzZSB7XG4gICAgICB2YXIgc3RhcnQgPSBpXG4gICAgICBpZiAoYiA+PSAweEQ4MDAgJiYgYiA8PSAweERGRkYpIGkrK1xuICAgICAgdmFyIGggPSBlbmNvZGVVUklDb21wb25lbnQoc3RyLnNsaWNlKHN0YXJ0LCBpKzEpKS5zdWJzdHIoMSkuc3BsaXQoJyUnKVxuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBoLmxlbmd0aDsgaisrKVxuICAgICAgICBieXRlQXJyYXkucHVzaChwYXJzZUludChoW2pdLCAxNikpXG4gICAgfVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gYXNjaWlUb0J5dGVzIChzdHIpIHtcbiAgdmFyIGJ5dGVBcnJheSA9IFtdXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgc3RyLmxlbmd0aDsgaSsrKSB7XG4gICAgLy8gTm9kZSdzIGNvZGUgc2VlbXMgdG8gYmUgZG9pbmcgdGhpcyBhbmQgbm90ICYgMHg3Ri4uXG4gICAgYnl0ZUFycmF5LnB1c2goc3RyLmNoYXJDb2RlQXQoaSkgJiAweEZGKVxuICB9XG4gIHJldHVybiBieXRlQXJyYXlcbn1cblxuZnVuY3Rpb24gdXRmMTZsZVRvQnl0ZXMgKHN0cikge1xuICB2YXIgYywgaGksIGxvXG4gIHZhciBieXRlQXJyYXkgPSBbXVxuICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7IGkrKykge1xuICAgIGMgPSBzdHIuY2hhckNvZGVBdChpKVxuICAgIGhpID0gYyA+PiA4XG4gICAgbG8gPSBjICUgMjU2XG4gICAgYnl0ZUFycmF5LnB1c2gobG8pXG4gICAgYnl0ZUFycmF5LnB1c2goaGkpXG4gIH1cblxuICByZXR1cm4gYnl0ZUFycmF5XG59XG5cbmZ1bmN0aW9uIGJhc2U2NFRvQnl0ZXMgKHN0cikge1xuICByZXR1cm4gYmFzZTY0LnRvQnl0ZUFycmF5KHN0cilcbn1cblxuZnVuY3Rpb24gYmxpdEJ1ZmZlciAoc3JjLCBkc3QsIG9mZnNldCwgbGVuZ3RoKSB7XG4gIHZhciBwb3NcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgIGlmICgoaSArIG9mZnNldCA+PSBkc3QubGVuZ3RoKSB8fCAoaSA+PSBzcmMubGVuZ3RoKSlcbiAgICAgIGJyZWFrXG4gICAgZHN0W2kgKyBvZmZzZXRdID0gc3JjW2ldXG4gIH1cbiAgcmV0dXJuIGlcbn1cblxuZnVuY3Rpb24gZGVjb2RlVXRmOENoYXIgKHN0cikge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQoc3RyKVxuICB9IGNhdGNoIChlcnIpIHtcbiAgICByZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSgweEZGRkQpIC8vIFVURiA4IGludmFsaWQgY2hhclxuICB9XG59XG5cbi8qXG4gKiBXZSBoYXZlIHRvIG1ha2Ugc3VyZSB0aGF0IHRoZSB2YWx1ZSBpcyBhIHZhbGlkIGludGVnZXIuIFRoaXMgbWVhbnMgdGhhdCBpdFxuICogaXMgbm9uLW5lZ2F0aXZlLiBJdCBoYXMgbm8gZnJhY3Rpb25hbCBjb21wb25lbnQgYW5kIHRoYXQgaXQgZG9lcyBub3RcbiAqIGV4Y2VlZCB0aGUgbWF4aW11bSBhbGxvd2VkIHZhbHVlLlxuICovXG5mdW5jdGlvbiB2ZXJpZnVpbnQgKHZhbHVlLCBtYXgpIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlID49IDAsICdzcGVjaWZpZWQgYSBuZWdhdGl2ZSB2YWx1ZSBmb3Igd3JpdGluZyBhbiB1bnNpZ25lZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA8PSBtYXgsICd2YWx1ZSBpcyBsYXJnZXIgdGhhbiBtYXhpbXVtIHZhbHVlIGZvciB0eXBlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZzaW50ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbiAgYXNzZXJ0KE1hdGguZmxvb3IodmFsdWUpID09PSB2YWx1ZSwgJ3ZhbHVlIGhhcyBhIGZyYWN0aW9uYWwgY29tcG9uZW50Jylcbn1cblxuZnVuY3Rpb24gdmVyaWZJRUVFNzU0ICh2YWx1ZSwgbWF4LCBtaW4pIHtcbiAgYXNzZXJ0KHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicsICdjYW5ub3Qgd3JpdGUgYSBub24tbnVtYmVyIGFzIGEgbnVtYmVyJylcbiAgYXNzZXJ0KHZhbHVlIDw9IG1heCwgJ3ZhbHVlIGxhcmdlciB0aGFuIG1heGltdW0gYWxsb3dlZCB2YWx1ZScpXG4gIGFzc2VydCh2YWx1ZSA+PSBtaW4sICd2YWx1ZSBzbWFsbGVyIHRoYW4gbWluaW11bSBhbGxvd2VkIHZhbHVlJylcbn1cblxuZnVuY3Rpb24gYXNzZXJ0ICh0ZXN0LCBtZXNzYWdlKSB7XG4gIGlmICghdGVzdCkgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UgfHwgJ0ZhaWxlZCBhc3NlcnRpb24nKVxufVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9idWZmZXIvaW5kZXguanNcIixcIi8uLi8uLi9ub2RlX21vZHVsZXMvYnVmZmVyXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xuZXhwb3J0cy5yZWFkID0gZnVuY3Rpb24gKGJ1ZmZlciwgb2Zmc2V0LCBpc0xFLCBtTGVuLCBuQnl0ZXMpIHtcbiAgdmFyIGUsIG1cbiAgdmFyIGVMZW4gPSBuQnl0ZXMgKiA4IC0gbUxlbiAtIDFcbiAgdmFyIGVNYXggPSAoMSA8PCBlTGVuKSAtIDFcbiAgdmFyIGVCaWFzID0gZU1heCA+PiAxXG4gIHZhciBuQml0cyA9IC03XG4gIHZhciBpID0gaXNMRSA/IChuQnl0ZXMgLSAxKSA6IDBcbiAgdmFyIGQgPSBpc0xFID8gLTEgOiAxXG4gIHZhciBzID0gYnVmZmVyW29mZnNldCArIGldXG5cbiAgaSArPSBkXG5cbiAgZSA9IHMgJiAoKDEgPDwgKC1uQml0cykpIC0gMSlcbiAgcyA+Pj0gKC1uQml0cylcbiAgbkJpdHMgKz0gZUxlblxuICBmb3IgKDsgbkJpdHMgPiAwOyBlID0gZSAqIDI1NiArIGJ1ZmZlcltvZmZzZXQgKyBpXSwgaSArPSBkLCBuQml0cyAtPSA4KSB7fVxuXG4gIG0gPSBlICYgKCgxIDw8ICgtbkJpdHMpKSAtIDEpXG4gIGUgPj49ICgtbkJpdHMpXG4gIG5CaXRzICs9IG1MZW5cbiAgZm9yICg7IG5CaXRzID4gMDsgbSA9IG0gKiAyNTYgKyBidWZmZXJbb2Zmc2V0ICsgaV0sIGkgKz0gZCwgbkJpdHMgLT0gOCkge31cblxuICBpZiAoZSA9PT0gMCkge1xuICAgIGUgPSAxIC0gZUJpYXNcbiAgfSBlbHNlIGlmIChlID09PSBlTWF4KSB7XG4gICAgcmV0dXJuIG0gPyBOYU4gOiAoKHMgPyAtMSA6IDEpICogSW5maW5pdHkpXG4gIH0gZWxzZSB7XG4gICAgbSA9IG0gKyBNYXRoLnBvdygyLCBtTGVuKVxuICAgIGUgPSBlIC0gZUJpYXNcbiAgfVxuICByZXR1cm4gKHMgPyAtMSA6IDEpICogbSAqIE1hdGgucG93KDIsIGUgLSBtTGVuKVxufVxuXG5leHBvcnRzLndyaXRlID0gZnVuY3Rpb24gKGJ1ZmZlciwgdmFsdWUsIG9mZnNldCwgaXNMRSwgbUxlbiwgbkJ5dGVzKSB7XG4gIHZhciBlLCBtLCBjXG4gIHZhciBlTGVuID0gbkJ5dGVzICogOCAtIG1MZW4gLSAxXG4gIHZhciBlTWF4ID0gKDEgPDwgZUxlbikgLSAxXG4gIHZhciBlQmlhcyA9IGVNYXggPj4gMVxuICB2YXIgcnQgPSAobUxlbiA9PT0gMjMgPyBNYXRoLnBvdygyLCAtMjQpIC0gTWF0aC5wb3coMiwgLTc3KSA6IDApXG4gIHZhciBpID0gaXNMRSA/IDAgOiAobkJ5dGVzIC0gMSlcbiAgdmFyIGQgPSBpc0xFID8gMSA6IC0xXG4gIHZhciBzID0gdmFsdWUgPCAwIHx8ICh2YWx1ZSA9PT0gMCAmJiAxIC8gdmFsdWUgPCAwKSA/IDEgOiAwXG5cbiAgdmFsdWUgPSBNYXRoLmFicyh2YWx1ZSlcblxuICBpZiAoaXNOYU4odmFsdWUpIHx8IHZhbHVlID09PSBJbmZpbml0eSkge1xuICAgIG0gPSBpc05hTih2YWx1ZSkgPyAxIDogMFxuICAgIGUgPSBlTWF4XG4gIH0gZWxzZSB7XG4gICAgZSA9IE1hdGguZmxvb3IoTWF0aC5sb2codmFsdWUpIC8gTWF0aC5MTjIpXG4gICAgaWYgKHZhbHVlICogKGMgPSBNYXRoLnBvdygyLCAtZSkpIDwgMSkge1xuICAgICAgZS0tXG4gICAgICBjICo9IDJcbiAgICB9XG4gICAgaWYgKGUgKyBlQmlhcyA+PSAxKSB7XG4gICAgICB2YWx1ZSArPSBydCAvIGNcbiAgICB9IGVsc2Uge1xuICAgICAgdmFsdWUgKz0gcnQgKiBNYXRoLnBvdygyLCAxIC0gZUJpYXMpXG4gICAgfVxuICAgIGlmICh2YWx1ZSAqIGMgPj0gMikge1xuICAgICAgZSsrXG4gICAgICBjIC89IDJcbiAgICB9XG5cbiAgICBpZiAoZSArIGVCaWFzID49IGVNYXgpIHtcbiAgICAgIG0gPSAwXG4gICAgICBlID0gZU1heFxuICAgIH0gZWxzZSBpZiAoZSArIGVCaWFzID49IDEpIHtcbiAgICAgIG0gPSAodmFsdWUgKiBjIC0gMSkgKiBNYXRoLnBvdygyLCBtTGVuKVxuICAgICAgZSA9IGUgKyBlQmlhc1xuICAgIH0gZWxzZSB7XG4gICAgICBtID0gdmFsdWUgKiBNYXRoLnBvdygyLCBlQmlhcyAtIDEpICogTWF0aC5wb3coMiwgbUxlbilcbiAgICAgIGUgPSAwXG4gICAgfVxuICB9XG5cbiAgZm9yICg7IG1MZW4gPj0gODsgYnVmZmVyW29mZnNldCArIGldID0gbSAmIDB4ZmYsIGkgKz0gZCwgbSAvPSAyNTYsIG1MZW4gLT0gOCkge31cblxuICBlID0gKGUgPDwgbUxlbikgfCBtXG4gIGVMZW4gKz0gbUxlblxuICBmb3IgKDsgZUxlbiA+IDA7IGJ1ZmZlcltvZmZzZXQgKyBpXSA9IGUgJiAweGZmLCBpICs9IGQsIGUgLz0gMjU2LCBlTGVuIC09IDgpIHt9XG5cbiAgYnVmZmVyW29mZnNldCArIGkgLSBkXSB8PSBzICogMTI4XG59XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vLi4vbm9kZV9tb2R1bGVzL2llZWU3NTQvaW5kZXguanNcIixcIi8uLi8uLi9ub2RlX21vZHVsZXMvaWVlZTc1NFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG5cbnByb2Nlc3MubmV4dFRpY2sgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW5TZXRJbW1lZGlhdGUgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5zZXRJbW1lZGlhdGU7XG4gICAgdmFyIGNhblBvc3QgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJ1xuICAgICYmIHdpbmRvdy5wb3N0TWVzc2FnZSAmJiB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lclxuICAgIDtcblxuICAgIGlmIChjYW5TZXRJbW1lZGlhdGUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChmKSB7IHJldHVybiB3aW5kb3cuc2V0SW1tZWRpYXRlKGYpIH07XG4gICAgfVxuXG4gICAgaWYgKGNhblBvc3QpIHtcbiAgICAgICAgdmFyIHF1ZXVlID0gW107XG4gICAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGV2KSB7XG4gICAgICAgICAgICB2YXIgc291cmNlID0gZXYuc291cmNlO1xuICAgICAgICAgICAgaWYgKChzb3VyY2UgPT09IHdpbmRvdyB8fCBzb3VyY2UgPT09IG51bGwpICYmIGV2LmRhdGEgPT09ICdwcm9jZXNzLXRpY2snKSB7XG4gICAgICAgICAgICAgICAgZXYuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgICAgICAgICAgaWYgKHF1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZuID0gcXVldWUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICAgICAgZm4oKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIHRydWUpO1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0VGljayhmbikge1xuICAgICAgICAgICAgcXVldWUucHVzaChmbik7XG4gICAgICAgICAgICB3aW5kb3cucG9zdE1lc3NhZ2UoJ3Byb2Nlc3MtdGljaycsICcqJyk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uIG5leHRUaWNrKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG59KSgpO1xuXG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn1cblxuLy8gVE9ETyhzaHR5bG1hbilcbnByb2Nlc3MuY3dkID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gJy8nIH07XG5wcm9jZXNzLmNoZGlyID0gZnVuY3Rpb24gKGRpcikge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5jaGRpciBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uLy4uL25vZGVfbW9kdWxlcy9wcm9jZXNzL2Jyb3dzZXIuanNcIixcIi8uLi8uLi9ub2RlX21vZHVsZXMvcHJvY2Vzc1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8qKlxuICog5LiL5ouJ5Yi35paw5Yqg6L295pyA5paw5pWw5o2uXG4gKi9cbnZhciBkaXJlY3RpdmVNb2R1bGUgPSByZXF1aXJlKCcuLi8uLi9qcy9kaXJlY3RpdmVNb2R1bGUuanMnKTtcblxuXG5kaXJlY3RpdmVNb2R1bGUuZGlyZWN0aXZlKCdkb3JwRG93bicsIGZ1bmN0aW9uKCkge1xuXG4gICAgZnVuY3Rpb24gZ2V0UGFyZW50KGVsZSwgYXJnKXtcbiAgICAgICAgdmFyIHBhcmVudCA9IGVsZS5wYXJlbnROb2RlO1xuXG4gICAgICAgIHJldHVybiBwYXJlbnQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZ2V0RWxlVHJhbnNmb3JtKGVsZSl7XG5cbiAgICAgICAgaWYgKCFlbGUpIHJldHVybiAwO1xuXG4gICAgICAgIHZhciByZSA9IC9cXHMoWy0wLTlcXC5dKilcXHAvO1xuXG4gICAgICAgIHZhciB0cmFuc2xhdGUgPSBlbGUuc3R5bGUud2Via2l0VHJhbnNmb3JtO1xuXG4gICAgICAgIHZhciByZXN1bHQgPSAgcmUuZXhlYyh0cmFuc2xhdGUpO1xuXG4gICAgICAgIHJldHVybiByZXN1bHQgJiYgcmVzdWx0WzFdO1xuICAgIH1cbnJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdBRScsXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICByZXBsYWNlOiB0cnVlLFxuICAgIHJlcXVpcmU6ICdec2xpZGVUYWJzJyxcbiAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJkb3JwLWRvd25cIiBzZXQtaGVpZ2h0PjxkaXYgY2xhc3M9XCJ1cC1sb2FkXCI+PHNwYW4gY2xhc3M9XCJ7bG9hZGluZzogaXNsb2FkfVwiPjwvc3Bhbj48L2Rpdj48ZGl2IGNsYXNzPVwiZG9ycGNvbnRcIiA+PGlvbi1zY3JvbGwgc2V0LWhlaWdodCBvdmVyZmxvdy1zY3JvbGw9XCJ0cnVlXCI+PGRpdiBuZy10cmFuc2NsdWRlID48L2Rpdj48L2lvbi1zY3JvbGw+PC9kaXY+e3t0fX08L2Rpdj4nLFxuICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlLCBhdHRycywgdGFiQ3RybCkge1xuXG4gICAgICAgIHNjb3BlLiRvbigncmVmcmVzaENvbXBsZXRlJywgZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgc2Nyb2xsVG8oMCk7XG4gICAgICAgIH0pXG4gICAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICAgICAgZWxlbWVudDogZWxlWzBdLFxuICAgICAgICAgICAgcHVsbDogZWxlLmZpbmQoJ2RpdicpLmVxKDApLmZpbmQoJ3NwYW4nKVswXSxcbiAgICAgICAgICAgIHNjcm9sbEg6IDgwLFxuICAgICAgICAgICAgc2Nyb2xsQ3JpdGljYWw6IDY4LFxuICAgICAgICAgICAgc3BlZWQ6IDMwMCxcbiAgICAgICAgICAgIGRlbHRhWTogMCxcbiAgICAgICAgICAgIHN0YXJ0OiAwLFxuICAgICAgICAgICAgYkJ0bjogZmFsc2VcbiAgICAgICAgfSwgb1Njcm9sbCA9IG51bGxcblxuICAgICAgICAvLyDop6bmkbjlsY/luZXlvIDlp4tcbiAgICAgICAgb3B0aW9ucy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQpIHtcblxuICAgICAgICAgICAgLy8g6I635Y+W6Kem5pG454K555qE5L2N572u77yI5Y+q6I635Y+WWei9tO+8iVxuICAgICAgICAgICAgb3B0aW9ucy5zdGFydCA9IGV2ZW50LnRvdWNoZXMgJiYgZXZlbnQudG91Y2hlc1swXS5wYWdlWTtcbiAgICAgICAgICAgIG9wdGlvbnMuc3RhcnRYID0gZXZlbnQudG91Y2hlcyAmJiBldmVudC50b3VjaGVzWzBdLnBhZ2VYO1xuICAgICAgICAgICAgLy8g56aB55So5Yqo55S7XG4gICAgICAgICAgICBvcHRpb25zLmVsZW1lbnQuc3R5bGUud2Via2l0VHJhbnNpdGlvbkR1cmF0aW9uID0gJzBtcyc7XG5cbiAgICAgICAgICAgIC8vIOW9k+mhtemdoua7muWKqOWkp+S6jjDml7bnpoHnlKjkuIvmi4nliqDovb1cbiAgICAgICAgICAgIHNjcm9sbFQgPSBlbGUuZmluZCgnaW9uLXNjcm9sbCcpWzBdLnNjcm9sbFRvcDtcblxuICAgICAgICAgICAgaWYgKCBzY3JvbGxUIDwgMiAmJiAoZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCkgPCAyKSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5iQnRuID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgIH0pO1xuICAgICAgICAvLyDop6bmkbjlubbmu5HliqjlsY/luZVcbiAgICAgICAgb3B0aW9ucy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIGZ1bmN0aW9uIChldmVudCkge1xuXG4gICAgICAgICAgICBzY29wZS50ID0gdGFiQ3RybC5zdG9wT3RoZXJTY3JvbGw7XG5cbiAgICAgICAgICAgIGlmICggIXRhYkN0cmwuc3RvcE90aGVyU2Nyb2xsICYmIG9wdGlvbnMuYkJ0biAmJiAoZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCkgPCAyKSB7XG4gICAgICAgICAgICAgICAgLy8g6I635Y+W5ruR5Yqo55qE6Led56a7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5kZWx0YVkgPSBldmVudC50b3VjaGVzICYmIGV2ZW50LnRvdWNoZXNbMF0ucGFnZVkgLSBvcHRpb25zLnN0YXJ0O1xuXG5cbiAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKG9wdGlvbnMuZGVsdGFZKSA8IE1hdGguYWJzKGV2ZW50LnRvdWNoZXNbMF0ucGFnZVggLSBvcHRpb25zLnN0YXJ0WCkpIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5iQnRuID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmJCdG4gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIOWmguaenOa7keWKqOWQkeS4iuWPmOaIkOi0n+aVsCDliJnkuI3miafooYzph4zpnaLnmoTku6PnoIFcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy5kZWx0YVkgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vdmVUbygpO1xuICAgICAgICAgICAgICAgICAgICAvLyDpmLvmraLpu5jorqTooYzkuLrvvIjkvJrmu5rliqjlsY/luZXvvIzkvYbmmK/mu5rliqjlt7Lnu4/lnKjmnIDpobbnq6/kuobvvIzkvYbov5jmmK/pmLvmraLlkKfvvIlcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC8vIOinpuaRuOW5tuemu+W8gOWxj+W5lVxuICAgICAgICBvcHRpb25zLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBmdW5jdGlvbiAoKSB7XG5cbiAgICAgICAgICAgIG9wdGlvbnMuZGVsdGFZID4gMCAmJiBvcHRpb25zLmJCdG4gJiYgc2Nyb2xsT3ZlcigpO1xuXG4gICAgICAgIH0pXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDop6bmkbjnp7vliqhcbiAgICAgICAgICovXG4gICAgICAgIGZ1bmN0aW9uIG1vdmVUbygpIHtcbiAgICAgICAgICAgIC8vIOiuoeeul+inpuaRuOi3neemu++8iOWkp+S6juWQkeS4i+a7keWKqOeahOacgOmrmOWAvOaXtui/m+ihjOmYu+aMoOa7keWKqO+8iVxuICAgICAgICAgICAgb3B0aW9ucy5kZWx0YVkgPSBvcHRpb25zLmRlbHRhWSA+IG9wdGlvbnMuc2Nyb2xsSCA/IG9wdGlvbnMuZGVsdGFZIC8gKG9wdGlvbnMuZGVsdGFZIC8gd2luZG93LmlubmVySGVpZ2h0ICsgMSkgOiBvcHRpb25zLmRlbHRhWTtcblxuICAgICAgICAgICAgLy8g5ruR5Yqo55qE6Led56a75aSn5LqOIOWPr+S7peadvuaJi+WIt+aWsOeahOaXtuWAmVxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuZGVsdGFZID4gb3B0aW9ucy5zY3JvbGxDcml0aWNhbCkge1xuICAgICAgICAgICAgICAgIC8vIOaPkOekuuadvuaJi+WIt+aWsFxuICAgICAgICAgICAgICAgIG9wdGlvbnMucHVsbC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAncm90YXRlKDBkZWcpJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb3B0aW9ucy5wdWxsLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICdyb3RhdGUoMTgwZGVnKSc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOa7keWKqFxuXG4gICAgICAgICAgICBvcHRpb25zLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZTNkKDAsICcgKyBvcHRpb25zLmRlbHRhWSArICdweCAsIDApJztcbiAgICAgICAgICAgIG9wdGlvbnMuZWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoMCwgJyArIG9wdGlvbnMuZGVsdGFZICsgJ3B4ICwgMCknO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICog5YGc5q2i5ruR5Yqo5bm25p2+5omL56a75byAXG4gICAgICAgICAqXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBzY3JvbGxPdmVyKCkge1xuXG4gICAgICAgICAgICAvLyDmu5HliqjnmoTot53nprvlpKfkuo7lj6/ku6Xmnb7miYvliqDovb3nmoTmnIDlpKflgLzml7ZcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmRlbHRhWSA+IG9wdGlvbnMuc2Nyb2xsQ3JpdGljYWwpIHtcbiAgICAgICAgICAgICAgICBzY3JvbGxUbyg2OCk7XG5cbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KGF0dHJzLmZuKTtcblxuICAgICAgICAgICAgICAgIH0sIDEwMDApXG5cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8g5rua5Yqo5YiwIDBcbiAgICAgICAgICAgICAgICBzY3JvbGxUbygwKVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICog5rua5Yqo5YiwXG4gICAgICAgICAqIEBwYXJhbSBkaXN0YW5jZSB7TnVtYmVyfSDmu5rliqjliLDnmoTot53nprtcbiAgICAgICAgICogQHBhcmFtIHNwZWVkIHsgTnVtYmVyIH0g5Yqo55S75pe26Ze0XG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBzY3JvbGxUbyhkaXN0YW5jZSwgc3BlZWQpIHtcbiAgICAgICAgICAgIC8vIOayoeS8oOaXtumXtOWwseeUqOm7mOiupOaXtumXtFxuICAgICAgICAgICAgaWYgKCFzcGVlZCkge1xuICAgICAgICAgICAgICAgIHNwZWVkID0gb3B0aW9ucy5zcGVlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIOS8oOWFpeeahOi3neemu1xuICAgICAgICAgICAgc3dpdGNoIChkaXN0YW5jZSkge1xuICAgICAgICAgICAgICAgIC8vIOa7muWKqOWIsCAwIOaXtlxuICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlj6/ku6Xov5vooYzkuIvmrKHkuIvmi4nliqDovb1cbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMuYkJ0biA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5wdWxsLmNsYXNzTmFtZSA9ICcnO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5kZWx0YVkgPSAwO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHByZXZlbnREZWZhdWx0LCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLmVsZW1lbnQuc3R5bGUudHJhbnNmb3JtID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5lbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICdub25lJztcbiAgICAgICAgICAgICAgICAgICAgfSwgMTAwKVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDY4OlxuICAgICAgICAgICAgICAgICAgICAvLyDnu5HlrprnmoR0b3VjaG1vdmUg6YeM6Z2i5LiN5omn6KGMIHNoZXogb3B0aW9ucy5iQnRuID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5wdWxsLmNsYXNzTmFtZSA9ICdsb2FkaW5nJztcbiAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNobW92ZScsIHByZXZlbnREZWZhdWx0LCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIC8vZGVmYXVsdDpcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb3B0aW9ucy5lbGVtZW50LnN0eWxlLndlYmtpdFRyYW5zaXRpb25EdXJhdGlvbiA9IHNwZWVkICsgJ21zJztcbiAgICAgICAgICAgIG9wdGlvbnMuZWxlbWVudC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoMCwgJyArIGRpc3RhbmNlICsgJ3B4ICwgMCknO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g6Zi75q2i6buY6K6k6KGM5Li677yI5Zyo5Yqg6L295pWw5o2u55qE5pe25YCZ56aB5q2i55So5oi35ruR5Yqo5bGP5bmV77yJXG4gICAgICAgIGZ1bmN0aW9uIHByZXZlbnREZWZhdWx0KGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxufSk7XG5cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9jb21wb25lbnRzL2RvcnBkb3duL0RvcnBEb3duLmpzXCIsXCIvLi4vY29tcG9uZW50cy9kb3JwZG93blwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBkaXJlY3RpdmVNb2R1bGUgPSByZXF1aXJlKCcuLi8uLi9qcy9kaXJlY3RpdmVNb2R1bGUuanMnKTtcblxuLy8g5ruR5Yqo55qEdGFiXG5kaXJlY3RpdmVNb2R1bGUuZGlyZWN0aXZlKCd0b3VjaFNjcm9sbCcsIGZ1bmN0aW9uKCR0aW1lb3V0KSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0FFJyxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgc2NvcGU6IHt9LFxuICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgc3R5bGU9XCJvdmVyZmxvdzpoaWRkZW47IGJhY2tncm91bmQtY2xpcDpjb250ZW50LWJvcmRlclwiPjxkaXYgbmctdHJhbnNjbHVkZSBzdHlsZT1cIm92ZXJmbG93OmhpZGRlbjtcIj48L2Rpdj48L2Rpdj4nLFxuICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsIGZ1bmN0aW9uKCRzY29wZSl7XG5cbiAgICAgICAgICAgIHRoaXMuYWRkRm4gPSBmdW5jdGlvbihmbil7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmxvYWRNb3JlID0gZm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1dLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlLCBhdHRycyl7XG5cblxuXG4gICAgICAgICAgICB2YXIgb2JqID0gZWxlLmZpbmQoJ2RpdicpWzBdO1xuXG5cblxuICAgICAgICAgICAgdmFyIGJvdW5kYXJ5TCA9IDAsXG4gICAgICAgICAgICAgICAgbW92ZURpc3RhbmNlID0gMCxcbiAgICAgICAgICAgICAgICB0ZW1wID0gMCxcbiAgICAgICAgICAgICAgICBzcGVlZCA9IDAsXG4gICAgICAgICAgICAgICAgc2Nyb2xsID0gMCxcbiAgICAgICAgICAgICAgICB0aW1lciA9IG51bGwsXG4gICAgICAgICAgICAgICAgcGFyZW50RGl2ID0gZWxlWzBdLFxuICAgICAgICAgICAgICAgIHMgPSAxLFxuICAgICAgICAgICAgICAgIG1vdmVMID0gMDtcblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIOinpuaRuOW8gOWni1xuICAgICAgICAgICAgICAgICAqIEBwYXJhbSBlIHtPYmplY3R9XG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gdFN0YXJ0KGUpe1xuICAgICAgICAgICAgICAgICAgICB2YXIgZXZlbnQgPSBlLnRvdWNoZXNbMF07XG4gICAgICAgICAgICAgICAgICAgIGJvdW5kYXJ5TCA9IGV2ZW50LnBhZ2VYO1xuICAgICAgICAgICAgICAgICAgICBjbGVhckludGVydmFsKHRpbWVyKTtcbiAgICAgICAgICAgICAgICAgICAgb2JqLnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyBtb3ZlTCAgKyAncHgpJztcbiAgICAgICAgICAgICAgICAgICAgb2JqLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyBtb3ZlTCAgKyAncHgpJztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiDmu5HliqhcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0gZSB7T2JqZWN0fVxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHRNb3ZlKGUpe1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBldmVudCA9IGUudG91Y2hlc1swXTtcblxuICAgICAgICAgICAgICAgICAgICBtb3ZlRGlzdGFuY2UgPSAoZXZlbnQucGFnZVggLSBib3VuZGFyeUwpO1xuXG4gICAgICAgICAgICAgICAgICAgIHNwZWVkID0gZXZlbnQucGFnZVggLSB0ZW1wO1xuICAgICAgICAgICAgICAgICAgICB0ZW1wID0gZXZlbnQucGFnZVg7XG5cbiAgICAgICAgICAgICAgICAgICAgbW92ZURpc3RhbmNlID0gZ29EZWZhdWx0KG1vdmVEaXN0YW5jZSAsIHMpO1xuXG4gICAgICAgICAgICAgICAgICAgIG9iai5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoJyArIChtb3ZlTCArIG1vdmVEaXN0YW5jZSkgICsgJ3B4LCAwLCAwKSc7XG4gICAgICAgICAgICAgICAgICAgIG9iai5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoJyArIChtb3ZlTCArIG1vdmVEaXN0YW5jZSkgICsgJ3B4LCAwLCAwKSc7XG4gICAgICAgICAgICAgICAgICAgIG9iai5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSAnMCc7XG4gICAgICAgICAgICAgICAgICAgIG9iai5zdHlsZS53ZWJraXRUcmFuc2l0aW9uRHVyYXRpb24gPSAnMCc7XG5cblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIOinpuaRuOe7k+adn1xuICAgICAgICAgICAgICAgICAqIEBwYXJhbSBlXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gdEVuZChlKXtcbiAgICAgICAgICAgICAgICAgICAgbW92ZUwgKz0gbW92ZURpc3RhbmNlO1xuICAgICAgICAgICAgICAgICAgICAvL3JlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAvLyAgICBzcGVlZCA9IHNwZWVkICogLjk1O1xuICAgICAgICAgICAgICAgICAgICAvLyAgICBtb3ZlTCArPSBzcGVlZDtcbiAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgaWYgKE1hdGguYWJzKHNwZWVkKSA8PSAxIHx8IG1vdmVMID4gMCB8fCBNYXRoLmFicyhtb3ZlTCkgPiAgKG9iai5vZmZzZXRXaWR0aCAtIHBhcmVudERpdi5vZmZzZXRXaWR0aCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIHNwZWVkID0gMDtcbiAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy8gICAgICAgIG9iai5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSAnMTAwbXMnO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgb2JqLnN0eWxlLndlYmtpdFRyYW5zaXRpb25EdXJhdGlvbiA9ICcxMDBtcyc7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBpZiAobW92ZUwgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgbW92ZUwgPSAwO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgaWYgKG1vdmVMIDwgLW9iai5vZmZzZXRXaWR0aCArIHBhcmVudERpdi5vZmZzZXRXaWR0aCl7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgICAgbW92ZUwgPSAtb2JqLm9mZnNldFdpZHRoICsgcGFyZW50RGl2Lm9mZnNldFdpZHRoO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgLy90RW5kKCk7XG4gICAgICAgICAgICAgICAgICAgIC8vICAgICAgICBtb3ZlTCA9IGdvRGVmYXVsdChtb3ZlTCAsIHMpO1xuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyAgICB9XG4gICAgICAgICAgICAgICAgICAgIC8vICAgIG9iai5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlM2QoJysgbW92ZUwgKyAncHgsIDAsIDApJztcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgb2JqLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgnKyBtb3ZlTCArICdweCwgMCwgMCknO1xuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvL30pXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgb2JqLmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnICwgdFN0YXJ0ICwgZmFsc2UpO1xuICAgICAgICAgICAgICAgIG9iai5hZGRFdmVudExpc3RlbmVyKCd0b3VjaG1vdmUnICwgdE1vdmUsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICBvYmouYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnICwgdEVuZCwgZmFsc2UpO1xuXG5cbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiDlh4/pgJ9cbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0gbW92ZUwge051bWJlcn1cbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0gcyB7TnVtYmVyfVxuICAgICAgICAgICAgICAgICAqIEByZXR1cm5zIG1vdmVMIHtOdW1iZXJ9XG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZ29EZWZhdWx0KG1vdmVMICwgcyl7XG4gICAgICAgICAgICAgICAgICAgIG9iai5zdHlsZS53aWR0aCA9ICcxMDAwcHgnO1xuICAgICAgICAgICAgICAgICAgICBpZiAobW92ZUwgPiAwICkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcyA9ICggMSArIG1vdmVMIC8gKHBhcmVudERpdi5vZmZzZXRXaWR0aCAvIDIpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vdmVMID0gbW92ZUwgLyBzXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobW92ZUwgPCAtb2JqLm9mZnNldFdpZHRoICsgcGFyZW50RGl2Lm9mZnNldFdpZHRoKXtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlNb3ZlID0gbW92ZUwgKyAob2JqLm9mZnNldFdpZHRoIC0gcGFyZW50RGl2Lm9mZnNldFdpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHMgPSAoIDEgKyBNYXRoLmFicyhpTW92ZSkgLyAocGFyZW50RGl2Lm9mZnNldFdpZHRoIC8gMikpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBtb3ZlTCA9ICgtb2JqLm9mZnNldFdpZHRoICsgcGFyZW50RGl2Lm9mZnNldFdpZHRoKSArIGlNb3ZlIC8gcztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbW92ZUw7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cbiAgICB9XG59KVxuLmRpcmVjdGl2ZSgnc2Nyb2xsSW5maW5pdGVNb3JlJywgZnVuY3Rpb24oKXtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgbmctdHJhbnNjbHVkZSBzdHlsZT1cIm92ZXJmbG93OmhpZGRlblwiIHN0eWxlPVwiV2lkdGg6NDBweDsgbGluZS1XaWR0aDo0MHB4OyB0ZXh0LWFsaWduOiBjZW50ZXJcIj7liqDovb3kuK0uLi48L2Rpdj4nLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZSwgYXR0cnMsIHRvdWNoU2Nyb2xsQ3RybCkge1xuXG4gICAgICAgICAgICB2YXIgY2xpZW50SCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCxcbiAgICAgICAgICAgICAgICBpVG9wID0gMDtcblxuICAgICAgICAgICAgd2luZG93Lm9uc2Nyb2xsID0gZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgaVRvcCA9IGVsZVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGlUb3AgPD0gY2xpZW50SCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KGF0dHJzLm9uSW5maW5pdGUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwxMClcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgICAgaVRvcCA9IGVsZVswXS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3A7XG5cbiAgICAgICAgICAgICAgICBpZiAoaVRvcCA8PSBjbGllbnRIKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KGF0dHJzLm9uSW5maW5pdGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sMTAwMClcbiAgICAgICAgfVxuICAgIH1cbn0pLmRpcmVjdGl2ZSgnc2Nyb2xsJywgZnVuY3Rpb24oKXtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBRScsXG4gICAgICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZSwgYXR0cnMpIHtcbiAgICAgICAgICAgICAgICB2YXIgb0hlYWRlciA9IGVsZS5maW5kKCdkaXYnKVswXSxcbiAgICAgICAgICAgICAgICAgICAgb1Njcm9sbCA9IGVsZS5maW5kKCdkaXYnKVs0XTtcblxuICAgICAgICAgICAgICAgIG9TY3JvbGwub25zY3JvbGwgPSBmdW5jdGlvbihldmVudCl7XG5cbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codGhpcy5zY3JvbGxUb3ApXG4gICAgICAgICAgICAgICAgICAgIG9IZWFkZXIuc3R5bGUubGVmdCA9IC10aGlzLnNjcm9sbExlZnQgKyAncHgnO1xuICAgICAgICAgICAgICAgICAgICBvSGVhZGVyLnN0eWxlLnBvc2l0aW9uID0gJ3JlbGF0aXZlJztcbiAgICAgICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG5cblxuXG5cblxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL2NvbXBvbmVudHMvc2Nyb2xsL1RvdWNoU2Nyb2xsRGlyZWN0aXZlLmpzXCIsXCIvLi4vY29tcG9uZW50cy9zY3JvbGxcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgZGlyZWN0aXZlTW9kdWxlID0gcmVxdWlyZSgnLi4vLi4vanMvZGlyZWN0aXZlTW9kdWxlLmpzJyk7XG4vKipcbiAqIHRhYlxuICovXG4gZGlyZWN0aXZlTW9kdWxlLmRpcmVjdGl2ZSgndGFiJywgZnVuY3Rpb24oKXtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0FFJyxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZTogJ14/dGFicycsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICB0aXRsZTogJ0AnLCAgLy8gdGFiIHRpdGxlXG4gICAgICAgIH0sXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiA+PGRpdiBuZy10cmFuc2NsdWRlIHN0eWxlPVwiZGlzcGxheTp7e2FjdGl2ZSA/IFxcJ2Jsb2NrXFwnIDogXFwnbm9uZVxcJ319XCI+PC9kaXY+PC9kaXY+JyxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZSwgYXR0cnMsIHRhYkN0cmwpe1xuICAgICAgICAgICAgc2NvcGUud2lkdGggPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICAgICAgICB0YWJDdHJsLnNldFBhbmVscyhzY29wZSk7XG4gICAgICAgIH1cbiAgICB9XG59KS5kaXJlY3RpdmUoJ3RhYnMnLCBbJyRpb25pY1Njcm9sbERlbGVnYXRlJywgZnVuY3Rpb24oJGlvbmljU2Nyb2xsRGVsZWdhdGUpe1xuICAgICAgICB2YXIgd2luV2lkdGggPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGg7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgICAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIGluZGV4OiAnPScsXG4gICAgICAgICAgICAgICAgaXNIZWFkZXJCb3I6ICdAJyxcbiAgICAgICAgICAgICAgICBpc1Njcm9sbDogJ0AnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCBmdW5jdGlvbigkc2NvcGUpe1xuICAgICAgICAgICAgICAgICRzY29wZS5wYW5lbHMgPSBbXTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuY2hpbGRyZW5MZW4gPSAwO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRQYW5lbHMgPSBmdW5jdGlvbihzY29wZSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUucGFuZWxzLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5hY3RpdmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNoaWxkcmVuTGVuICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5wYW5lbHMucHVzaChzY29wZSk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS53aWR0aCA9ICgkc2NvcGUuY2hpbGRyZW5MZW4gKiB3aW5XaWR0aCkgKyAncHgnO1xuICAgICAgICAgICAgICAgIH1cblxuXG5cbiAgICAgICAgICAgICAgICB0aGlzLmluZGV4ID0gJHNjb3BlLmluZGV4IHx8IDA7XG5cblxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgY2xhc3M9XCJzbGlkZS10YWJzXCI+PGRpdiBjbGFzcz1cInRhYi1oZWFkZXItd3JhcFwiPjxpb24tc2Nyb2xsIGRlbGVnYXRlLWhhbmRsZT1cIm5hdlwiIHN0eWxlPVwid2lkdGg6MTAwJVwiIGRpcmVjdGlvbj1cInhcIiAgc2Nyb2xsYmFyLXg9XCJmYWxzZVwiIHN0eWxlPVwiaGVpZ2h0OiAzNHB4XCIgPjxkaXYgY2xhc3M9XCJzbGlkZS10YWItaGVhZGVyXCIgPicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJ0YWItaGVhZGVyLWJveFwiICBuZy1jbGFzcz1cInthY3RpdmU6IHBhbmVsLmFjdGl2ZSB9XCIgb24tdGFwPVwic2VsZWN0SGFuZGxlKCRldmVudCwgJGluZGV4LCBwYW5lbClcIiBuZy1yZXBlYXQ9XCJwYW5lbCBpbiBwYW5lbHNcIiA+JyArXG4gICAgICAgICAgICAnPGRpdiBjbGFzcz1cInRhYi1oZWFkZXItc3R5bGVcIiBuZy1jbGFzcz1cIntcXCdzaG93LWJvclxcJzogaXNIZWFkZXJCb3J9XCI+PHNwYW4+e3twYW5lbC50aXRsZX19PC9zcGFuPjwvZGl2PjwvZGl2PjwvZGl2PjwvaW9uLXNjcm9sbD48L2Rpdj4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwic2xpZGUtdGFiLWNvbnRcIiAgbmctdHJhbnNjbHVkZSA+PC9kaXY+PC9kaXY+JyxcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGUsIGF0dHJzLCBjdHJsKXtcbiAgICAgICAgICAgICAgICB2YXIgd2luVyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCxcbiAgICAgICAgICAgICAgICAgIG9OYXYgPSAkaW9uaWNTY3JvbGxEZWxlZ2F0ZS4kZ2V0QnlIYW5kbGUoJ25hdicpLFxuICAgICAgICAgICAgICAgICAgb05hdlcsXG4gICAgICAgICAgICAgICAgICBvQWN0aXZlQm94ID0gbnVsbDtcblxuXG4gICAgICAgICAgICAgICAgc2NvcGUuc2VsZWN0SGFuZGxlID0gZnVuY3Rpb24oJGV2ZW50LCAkaW5kZXgsIHBhbmVsKXtcblxuXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChzY29wZS5wYW5lbHMsIGZ1bmN0aW9uKHBhbmVsKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhbmVsLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBwYW5lbC5hY3RpdmUgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmluZGV4ID0gJGluZGV4O1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSwgMCk7XG5cbiAgICAgICAgICAgICAgICAgIG9BY3RpdmVCb3ggPSBwYXJlbnQoJGV2ZW50LnRhcmdldCwgJ3RhYi1oZWFkZXItYm94Jyk7XG4gICAgICAgICAgICAgICAgICBvTmF2VyA9IG9BY3RpdmVCb3gub2Zmc2V0V2lkdGggKiBzY29wZS5wYW5lbHMubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgd2lsbENlbnRlcihvQWN0aXZlQm94KVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHBhcmVudChvLCBzZWxlY3Rvcil7XG4gICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gbztcblxuICAgICAgICAgICAgICAgICAgd2hpbGUgKHJlc3VsdC5ub2RlVHlwZSA9PSAxICYmICFyZXN1bHQuY2xhc3NMaXN0LmNvbnRhaW5zKHNlbGVjdG9yKSkge1xuXG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IHJlc3VsdC5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgICAgICAgICB9XG5cblxuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gd2lsbENlbnRlcihkb20pe1xuXG4gICAgICAgICAgICAgICAgICB2YXIgcG9zRGF0YSA9IGRvbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxcbiAgICAgICAgICAgICAgICAgICAgb0RvbVcgPSBkb20ub2Zmc2V0V2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIG9mZnNldEwgPSBkb20ub2Zmc2V0TGVmdCxcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0UiA9IG9OYXZXIC0gb2Zmc2V0TCArIG9Eb21XO1xuXG5cbiAgICAgICAgICAgICAgICAgIGlmICggb2Zmc2V0TCA8IHdpblcvMiApIHtcbiAgICAgICAgICAgICAgICAgICAgb05hdi5zY3JvbGxUbygwLCAwLCB0cnVlKVxuICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChvZmZzZXRSIDwgd2luVyAvIDIpIHtcbiAgICAgICAgICAgICAgICAgICAgb05hdi5zY3JvbGxUbyhvTmF2VyAtIG9mZnNldFIsIDAsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb05hdi5zY3JvbGxUbyhNYXRoLmFicyhvZmZzZXRMIC0gd2luVy8yICsgb0RvbVcvMiksIDAsIHRydWUpO1xuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1dKS5kaXJlY3RpdmUoJ3NsaWRlVGFiJywgZnVuY3Rpb24oKXtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0FFJyxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZTogWydeP3NsaWRlVGFicyddLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgdGl0bGU6ICdAJywgIC8vIHRhYiB0aXRsZVxuXG4gICAgICAgIH0sXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cInNsaWRlLXRhYlwiIHN0eWxlPVwid2lkdGg6IHt7d2lkdGh9fXB4XCIgPiA8ZGl2IG5nLXRyYW5zY2x1ZGUgPjwvZGl2PjwvZGl2PicsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGUsIGF0dHJzLCB0YWJDdHJsKXtcbiAgICAgICAgICAgIHRhYkN0cmwgPSB0YWJDdHJsWzBdO1xuICAgICAgICAgICAgc2NvcGUud2lkdGggPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGg7XG4gICAgICAgICAgICB0YWJDdHJsLnNldFBhbmVscyhzY29wZSk7XG4gICAgICAgIH1cblxuICAgIH1cbn0pLmRpcmVjdGl2ZSgnc2xpZGVUYWJzJywgZnVuY3Rpb24oKXtcbiAgICAgICAgdmFyIHdpbldpZHRoID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXN0cmljdDogJ0FFJyxcbiAgICAgICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgICAgICBpbmRleDogJz0nLFxuICAgICAgICAgICAgICAgIGlzSGVhZGVyQm9yOiAnQCdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjb250cm9sbGVyOiBbJyRzY29wZScsIGZ1bmN0aW9uKCRzY29wZSl7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnBhbmVscyA9IFtdO1xuICAgICAgICAgICAgICAgICRzY29wZS5jaGlsZHJlbkxlbiA9IDA7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wT3RoZXJTY3JvbGwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB0aGlzLnNldFBhbmVscyA9IGZ1bmN0aW9uKHNjb3BlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNoaWxkcmVuTGVuICs9IDE7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5wYW5lbHMucHVzaChzY29wZSk7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS53aWR0aCA9ICgkc2NvcGUuY2hpbGRyZW5MZW4gKiB3aW5XaWR0aCkgKyAncHgnO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMuaW5kZXggPSAkc2NvcGUuaW5kZXggfHwgMDtcbiAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwic2xpZGUtdGFic1wiPjxkaXYgY2xhc3M9XCJ0YWItaGVhZGVyLXdyYXBcIj48aW9uLXNjcm9sbCBpZD1cInNjcm9sbC1oZWFkZXJcIiBzdHlsZT1cIndpZHRoOjEwMCVcIiBkaXJlY3Rpb249XCJ4XCIgIHNjcm9sbGJhci14PVwiZmFsc2VcIiBzdHlsZT1cImhlaWdodDogMzRweFwiPjxkaXYgY2xhc3M9XCJzbGlkZS10YWItaGVhZGVyXCIgPicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJ0YWItaGVhZGVyLWJveFwiICBuZy1jbGFzcz1cInthY3RpdmU6ICRpbmRleCA9PSBpbmRleH1cIiBvbi10YXA9XCJzZWxlY3RIYW5kbGUoJGluZGV4KVwiIG5nLXJlcGVhdD1cInBhbmVsIGluIHBhbmVsc1wiID4nICtcbiAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwidGFiLWhlYWRlci1zdHlsZVwiIG5nLWNsYXNzPVwie1xcJ3Nob3ctYm9yXFwnOiBpc0hlYWRlckJvcn1cIj48c3Bhbj57e3BhbmVsLnRpdGxlfX08L3NwYW4+PC9kaXY+PC9kaXY+PC9kaXY+PC9pb24tc2Nyb2xsPjwvZGl2PicgK1xuICAgICAgICAgICAgJzxkaXYgY2xhc3M9XCJzbGlkZS10YWItY29udFwiICA+PGRpdiBjbGFzcz1cInNsaWRlLXRhYi1vbmVcIiBuZy10cmFuc2NsdWRlIHN0eWxlPVwid2lkdGg6IHt7d2lkdGh9fVwiPjwvZGl2PjwvaW9uLXNjcm9sbD48L2Rpdj48L2Rpdj4nLFxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZSwgYXR0cnMsIGN0cmwpe1xuXG4gICAgICAgICAgICAgICAgdmFyIHRhYkNvbnQgPSBlbGVbMF0ucXVlcnlTZWxlY3RvcignLnNsaWRlLXRhYi1vbmUnKSxcbiAgICAgICAgICAgICAgICAgICAgdGFiSGVhZGVyQm94LFxuICAgICAgICAgICAgICAgICAgICB0b3VjaERhdGEgPSB7fSxcbiAgICAgICAgICAgICAgICAgICAgcmF0aW8gPSAxLFxuICAgICAgICAgICAgICAgICAgICBpbmRleCA9IHNjb3BlLmluZGV4LFxuICAgICAgICAgICAgICAgICAgICBpc0FuaW1hdGlvbiA9IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHRvdWNoID0gbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgaXNTY3JvbGwgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIHNjb3BlLnNlbGVjdEhhbmRsZSA9IGZ1bmN0aW9uKCRpbmRleCl7XG5cblxuXG4gICAgICAgICAgICAgICAgICAgIGlmICgkaW5kZXggIT0gdW5kZWZpbmVkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4ID0gJGluZGV4O1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuaW5kZXggPSAkaW5kZXg7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAwKVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRhYkNvbnQuc3R5bGUud2Via2l0VHJhbnNpdGlvbkR1cmF0aW9uID0gJzMwMG1zJztcbiAgICAgICAgICAgICAgICAgICAgdGFiQ29udC5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSAnMzAwbXMnO1xuICAgICAgICAgICAgICAgICAgICB0YWJDb250LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgnICsgKC1pbmRleCAqIHdpbldpZHRoKSArICdweCwgMCwgMCknO1xuICAgICAgICAgICAgICAgICAgICB0YWJDb250LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgnICsgKC1pbmRleCAqIHdpbldpZHRoKSArICdweCwgMCwgMCknO1xuXG5cblxuXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZnVuY3Rpb24gZ2V0RWxlVHJhbnNmb3JtKGVsZSl7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZSA9IC9cXHMoWzAtOVxcLl0qKVxccC87XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHRyYW5zbGF0ZSA9IGVsZS5zdHlsZS53ZWJraXRUcmFuc2Zvcm07XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdCA9ICByZS5leGVjKHRyYW5zbGF0ZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdCAmJiByZXN1bHRbMV07XG4gICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgICAgICB0YWJDb250LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoc3RhcnQnLCBmdW5jdGlvbihldmVudCl7XG4gICAgICAgICAgICAgICAgICAgIGlzQW5pbWF0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdG91Y2ggPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3VjaFRpbWU6IG5ldyBEYXRlKCkuZ2V0VGltZSgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG91Y2hYOiBldmVudC50b3VjaGVzWzBdLnBhZ2VYLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG91Y2hZOiBldmVudC50b3VjaGVzWzBdLnBhZ2VZLFxuICAgICAgICAgICAgICAgICAgICAgICAgdG91Y2hEaXN0YW5jZTogMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50RGlzdGFuY2U6IC0xLFxuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIGN0cmwuc3RvcE90aGVyU2Nyb2xsID0gdW5kZWZpbmVkO1xuXG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgIHRhYkNvbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2htb3ZlJywgZnVuY3Rpb24oZXZlbnQpe1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChldmVudC50b3VjaGVzLmxlbmd0aCA9PSAxKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdHJsLnN0b3BPdGhlclNjcm9sbCA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgdGFiQ29udC5zdHlsZS50cmFuc2l0aW9uRHVyYXRpb24gPSAnMG1zJztcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhYkNvbnQuc3R5bGUud2Via2l0VHJhbnNpdGlvbkR1cmF0aW9uID0gJzBtcyc7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDmu5HliqjnmoTot53nprtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdWNoLnRvdWNoRGlzdGFuY2UgPSBldmVudC50b3VjaGVzWzBdLnBhZ2VYIC0gdG91Y2gudG91Y2hYO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOW3puWPs+a7keWKqOeahOi3neemu+Wwj+S6juS4iuS4i+eahFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKHRvdWNoLnRvdWNoRGlzdGFuY2UpIDwgTWF0aC5hYnMoZXZlbnQudG91Y2hlc1swXS5wYWdlWSAtdG91Y2gudG91Y2hZKSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdHJsLnN0b3BPdGhlclNjcm9sbCA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnN0b3BPdGhlclNjcm9sbCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlzQW5pbWF0aW9uID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgaXNBbmltYXRpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY3RybC5zdG9wT3RoZXJTY3JvbGwgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zdG9wT3RoZXJTY3JvbGwgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g5ruR5Yqo5Yiw5Lik56uv6L+b6KGM6ZmQ5Yi2XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoKHRvdWNoLnRvdWNoRGlzdGFuY2UgPiAwICAmJiBpbmRleCA9PSAwKSB8fCAodG91Y2gudG91Y2hEaXN0YW5jZSA8IDAgJiYgIGluZGV4ID09IChzY29wZS5jaGlsZHJlbkxlbi0xKSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgaXNBbmltYXRpb24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAvL3JhdGlvIC09ICh0b3VjaC50b3VjaERpc3RhbmNlIC8gd2luV2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDlh4/pgJ9cbiAgICAgICAgICAgICAgICAgICAgICAgIHRvdWNoLnRvdWNoRGlzdGFuY2UgPSB0b3VjaC50b3VjaERpc3RhbmNlICogcmF0aW87XG4gICAgICAgICAgICAgICAgICAgICAgICB0b3VjaC5jb3VudERpc3RhbmNlID0gLWluZGV4ICogd2luV2lkdGggKyB0b3VjaC50b3VjaERpc3RhbmNlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB0YWJDb250LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGVYKCcgKyB0b3VjaC5jb3VudERpc3RhbmNlICsgJ3B4KSdcbiAgICAgICAgICAgICAgICAgICAgICAgIHRhYkNvbnQuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoJyArIHRvdWNoLmNvdW50RGlzdGFuY2UgKyAncHgpJ1xuICAgICAgICAgICAgICAgICAgICAgIH1cblxuXG5cbiAgICAgICAgICAgICAgICAgICAgLy9ldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgdGFiQ29udC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICAgICAgICAgICAgdG91Y2gudG91Y2hUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSB0b3VjaC50b3VjaFRpbWU7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8g5ruR5Yqo5pe26Ze05bCP5LqOMjUwIOaIluiAhSDmu5HliqjnmoTot53nprvlpKfkuo7lsY/luZXnmoTkuIDljYpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzQW5pbWF0aW9uICYmICh0b3VjaC50b3VjaFRpbWUgPCAyNTAgfHwgTWF0aC5hYnModG91Y2gudG91Y2hEaXN0YW5jZSkgPiB3aW5XaWR0aC8yKSl7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWPs+a7keWKqFxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzQW5pbWF0aW9uICYmIHRvdWNoLnRvdWNoRGlzdGFuY2UgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5kZXggKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOW3pua7keWKqFxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoaXNBbmltYXRpb24gJiYgdG91Y2gudG91Y2hEaXN0YW5jZSA+IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpbmRleCAtPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnNlbGVjdEhhbmRsZShpbmRleCk7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwuc3RvcE90aGVyU2Nyb2xsID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfSlcblxuXG5cblxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSlcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9jb21wb25lbnRzL3NsaWRlVGFiL1NsaWRlVGFic0RpcmVjdGl2ZS5qc1wiLFwiLy4uL2NvbXBvbmVudHMvc2xpZGVUYWJcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgZGlyZWN0aXZlTW9kdWxlID0gcmVxdWlyZSgnLi4vLi4vanMvZGlyZWN0aXZlTW9kdWxlLmpzJyk7XG4vKipcbiAqIGRhdGUgMjAxNi0xMC0xOVxuICogYXV0aCB6aGFuZ1xuICogdGVsIDE1MjEwMDA3MTg1XG4gKi9cblxuZGlyZWN0aXZlTW9kdWxlLmRpcmVjdGl2ZSgnc2VsZWN0UGlja2VyJywgZnVuY3Rpb24oKXtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0FFJyxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIHBpY2tlcjogJz0nLFxuICAgICAgICAgICAgcGlja2VyVmFsOiAnPSdcbiAgICAgICAgfSxcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwic2VsZWN0LXBpY2tcIj48c3BhbiBjbGFzcz1cImlvbi1pb3MtYXJyb3ctYmFja1wiIG5nLWNsaWNrPVwicGlja0xlZnQoKVwiIG5nLWRpc2FibGVkPVwicGlja2VyVmFsPT0wXCI+PC9zcGFuPicgK1xuICAgICAgICAnPGVtPnt7cGlja2VyW3BpY2tlclZhbF19fTwvZW0+PHNwYW4gY2xhc3M9XCJpb24taW9zLWFycm93LWZvcndhcmRcIiBuZy1jbGljaz1cInBpY2tSaWdodCgpXCIgIG5nLWRpc2FibGVkPVwicGlja2VyVmFsPT0ocGlja2VyLmxlbmd0aC0xKVwiPjwvc3Bhbj48L2Rpdj4nLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlLCBhdHRycywgdG9nZ2VsUGFuZWxDdHJsKXtcbiAgICAgICAgICAgIHZhciBpbmRleCA9IHNjb3BlLnBpY2tlclZhbDtcblxuICAgICAgICAgICAgLy8g6YCJ5oup5bem6L65XG4gICAgICAgICAgICBzY29wZS5waWNrTGVmdCA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgICAgICBpZiAoc2NvcGUucGlja2VyVmFsID09IDApIHJldHVybjtcbiAgICAgICAgICAgICAgICBzY29wZS5waWNrZXJWYWwgLS07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOmAieaLqeWPs+i+uVxuICAgICAgICAgICAgc2NvcGUucGlja1JpZ2h0ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBpZiAoc2NvcGUucGlja2VyVmFsID09IChzY29wZS5waWNrZXIubGVuZ3RoLTEpKSByZXR1cm47XG4gICAgICAgICAgICAgICAgc2NvcGUucGlja2VyVmFsICsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSlcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vY29tcG9uZW50cy90b2dnbGUvU2VsZWN0UGlja0RpcmVjdGl2ZS5qc1wiLFwiLy4uL2NvbXBvbmVudHMvdG9nZ2xlXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGRpcmVjdGl2ZU1vZHVsZSA9IHJlcXVpcmUoJy4uLy4uL2pzL2RpcmVjdGl2ZU1vZHVsZS5qcycpO1xuLyoqXG4gKiBkYXRlIDIwMTYtMTAtMTlcbiAqIGF1dGggemhhbmdcbiAqIHRlbCAxNTIxMDAwNzE4NVxuICovXG5cbmRpcmVjdGl2ZU1vZHVsZS5kaXJlY3RpdmUoJ3RvZ2dsZVBhbmVsJywgZnVuY3Rpb24oKXtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0FFJyxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IG5nLXRyYW5zY2x1ZGU+PC9kaXY+JyxcbiAgICAgICAgY29udHJvbGxlcjogWyckc2NvcGUnLCBmdW5jdGlvbigkc2NvcGUpe1xuICAgICAgICAgICAgdmFyIHBhbmVscyA9ICRzY29wZS5wYW5lbHMgPSBbXTtcblxuICAgICAgICAgICAgdGhpcy5wdXNoUGFuZWwgPSBmdW5jdGlvbihwYW5lbCl7XG5cbiAgICAgICAgICAgICAgICBwYW5lbC5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBwYW5lbHMucHVzaChwYW5lbCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIOeCueWHu+aYvuekulxuICAgICAgICAgICAgdGhpcy5zaG93SGFuZGxlID0gZnVuY3Rpb24oc2NvcGUpe1xuXG4gICAgICAgICAgICAgICAgaWYgKHNjb3BlLmFjdGl2ZSA9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChwYW5lbHMsIGZ1bmN0aW9uKHBhbmVsKXtcbiAgICAgICAgICAgICAgICAgICAgcGFuZWwuYWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XVxuXG4gICAgfVxuXG59KS5kaXJlY3RpdmUoJ3BhbmVsJywgZnVuY3Rpb24oKXtcbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0FFJyxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgcmVxdWlyZTogJ14/dG9nZ2xlUGFuZWwnLFxuICAgICAgICB0ZW1wbGF0ZTogJzxkaXYgbmctdHJhbnNjbHVkZSBuZy1jbGljaz1cInNob3dIYW5kbGUoKVwiIG5nLWNsYXNzPVwie1xcJ2FjdGl2ZS1zaG93XFwnOiBhY3RpdmV9XCI+PC9kaXY+JyxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZSwgYXR0cnMsIHRvZ2dlbFBhbmVsQ3RybCl7XG4gICAgICAgICAgICB0b2dnZWxQYW5lbEN0cmwucHVzaFBhbmVsKHNjb3BlKTtcblxuICAgICAgICAgICAgc2NvcGUuc2hvd0hhbmRsZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdG9nZ2VsUGFuZWxDdHJsLnNob3dIYW5kbGUoc2NvcGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSlcbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vY29tcG9uZW50cy90b2dnbGUvVG9nZ2xlUGFuZWxEaXJlY3RpdmUuanNcIixcIi8uLi9jb21wb25lbnRzL3RvZ2dsZVwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBjb250cm9sbGVyTW9kdWxlID0gcmVxdWlyZSgnLi4vLi4vanMvY29udHJvbGxlck1vZHVsZS5qcycpO1xuXG4vKipcbiAqIOa0u+WKqFxuICogZGF0ZSAyMDE2LTExLTEzXG4gKiBhdXRoIHpoYW5nXG4gKiB0ZWwgMTUyMTAwMDcxODVcbiAqL1xuY29udHJvbGxlck1vZHVsZVxuICAgIC5jb250cm9sbGVyKCdTaWduQ3RybCcsIFsnJHNjb3BlJywgJ2dsb2JhbFNlcnZpY2VzJywgJ2FjdGl2aXR5U2VydmljZXMnLCBmdW5jdGlvbigkc2NvcGUsIGdsb2JhbFNlcnZpY2VzLCBhY3Rpdml0eVNlcnZpY2VzKSB7XG4gICAgICAgIHZhciBiQnRuID0gdHJ1ZTtcblxuICAgICAgICAkc2NvcGUuc2lnbkRhdGEgPSB7XG4gICAgICAgICAgICBhY3Rpdml0eVByaXplTGlzdDogWzAsMSwyLDMsNCw1XVxuICAgICAgICB9XG4gICAgICAgICRzY29wZS5jb3VudCA9IC0xO1xuICAgICAgICBhY3Rpdml0eVNlcnZpY2VzLmdldEFjdGl2aXR5KCRzY29wZSk7XG4gICAgICAgICRzY29wZS5hZ2Fpbk9uY2UgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgYkJ0biA9IHRydWU7XG4gICAgICAgICAgICAkc2NvcGUuc2lnbkRhdGEgPSB7XG4gICAgICAgICAgICAgICAgYWN0aXZpdHlQcml6ZUxpc3Q6IFswLDEsMiwzLDQsNV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAkc2NvcGUuc2lnbkhhbmRsZSA9IGZ1bmN0aW9uKGluZGV4KXtcblxuICAgICAgICAgICAgaWYgKCRzY29wZS5jb3VudCA9PSAwIHx8IGJCdG4gPT0gZmFsc2UpIHJldHVybjtcbiAgICAgICAgICAgIGJCdG4gPSBmYWxzZTtcblxuICAgICAgICAgICAgYWN0aXZpdHlTZXJ2aWNlcy5yZWNlaXZlU2lnbigkc2NvcGUuYWN0aXZpdHlJZCkudGhlbihmdW5jdGlvbihyZSl7XG4gICAgICAgICAgICAgICAgdmFyIHRlbXBBcnIgPSByZS5hY3Rpdml0eS5hY3Rpdml0eVByaXplTGlzdCxcbiAgICAgICAgICAgICAgICAgICAgdGVtcE9iajtcblxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0ZW1wQXJyLCBmdW5jdGlvbihjYXJkLCBpKXtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoY2FyZC5wcml6ZVZhbHVlID09IHJlLmFjdGl2aXR5LnByaXplVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBPYmogPSB0ZW1wQXJyLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICB0ZW1wQXJyLnNwbGljZShpbmRleCwgMCwgdGVtcE9ialswXSk7XG5cbiAgICAgICAgICAgICAgICAkc2NvcGUuc2lnbkRhdGEgPSByZS5hY3Rpdml0eTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuYWN0aXZlID0gaW5kZXg7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmNvdW50IC0tO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1dKVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL2NvbnRhaW5lcnMvYWN0aXZpdHkvQWN0aXZpdHlDdHJsLmpzXCIsXCIvLi4vY29udGFpbmVycy9hY3Rpdml0eVwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBzZXJ2aWNlTW9kdWxlID0gcmVxdWlyZSgnLi4vLi4vanMvc2VydmljZU1vZHVsZS5qcycpO1xuXG4vKipcbiAqIEBkYXRlIDIwMTYtMTAtMjJcbiAqIEBhdXRoIHpoYW5nXG4gKiBAdGVsIDE1MjEwMDA3MTg1XG4gKi9cblxuLy8g5byA5aWWXG5zZXJ2aWNlTW9kdWxlLmZhY3RvcnkoJ2FjdGl2aXR5U2VydmljZXMnLCBbJ2dsb2JhbFNlcnZpY2VzJywgZnVuY3Rpb24oZ2xvYmFsU2VydmljZXMpIHtcbiAgICAvKipcbiAgICAgKiBsb3R0ZXJ5Q29kZSAwMDEgPT4g5Y+M6Imy55CDXG4gICAgICogbG90dGVyeUNvZGUgMDAyID0+IOemj+W9qTNEXG4gICAgICogbG90dGVyeUNvZGUgMTEzID0+IOWkp+S5kOmAj1xuICAgICAqIGxvdHRlcnlDb2RlIDEwOCA9PiDmjpLliJfkuIlcbiAgICAgKiBsb3R0ZXJ5Q29kZSAxMDkgPT4g5o6S5YiX5LqUXG4gICAgICogbG90dGVyeUNvZGUgMDA0ID0+IOS4g+S5kOW9qVxuICAgICAqIGxvdHRlcnlDb2RlIDExMCA9PiDkuIPmmJ/lvalcbiAgICAgKiBsb3R0ZXJ5Q29kZSAwMTggPT4g5YyX5Lqs5b+r5LiJXG4gICAgICogbG90dGVyeUNvZGUgMDExID0+IOaxn+iLj+W/q+S4iVxuICAgICAqIGxvdHRlcnlDb2RlIDAxMCA9PiDlronlvr3lv6vkuIlcbiAgICAgKiBsb3R0ZXJ5Q29kZSAxMTAgPT4g5LiD5pif5b2pXG4gICAgICogbG90dGVyeUNvZGUgMTEwID0+IOS4g+aYn+W9qVxuICAgICAqL1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgZ2V0QWN0aXZpdHk6IGZ1bmN0aW9uKCRzY29wZSl7XG5cbiAgICAgICAgICAgIHJldHVybiBnbG9iYWxTZXJ2aWNlcy5zZXJpYWxQb3N0KCczNTAwJywgJ2RldGFpbCcsIHthY3Rpdml0eUlkOiAnQTAxNDgwMDU2MTM3Nzk3MDAwMSd9KS50aGVuKGZ1bmN0aW9uKHJlKXtcblxuICAgICAgICAgICAgICAgIC8vIOa0u+WKqOW3sue7j+e7k+adn1xuICAgICAgICAgICAgICAgIGlmIChyZS5hY3Rpdml0eS5zdGF0dXMgIT0gMSkge1xuICAgICAgICAgICAgICAgICAgJHNjb3BlLmFjdGl2aXR5SWQgPSByZS5hY3Rpdml0eS5hY3Rpdml0eUlkO1xuXG4gICAgICAgICAgICAgICAgICAvLyDov5jmnInlj4LliqDmnaHku7ZcbiAgICAgICAgICAgICAgICAgIGlmIChyZS5hY3Rpdml0eS5hdHRlbmRlZFRpbWVzIDwgcmUuYWN0aXZpdHkuYXR0ZW5kVGltZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmUuYWN0aXZpdHkuYWN0aXZpdHlQcml6ZUxpc3QgPSAkc2NvcGUuc2lnbkRhdGEuYWN0aXZpdHlQcml6ZUxpc3RcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvdW50ID0gcmUuYWN0aXZpdHkuYXR0ZW5kVGltZXMgLSByZS5hY3Rpdml0eS5hdHRlbmRlZFRpbWVzO1xuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmNvdW50ID0gMDtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgICAgICRzY29wZS5zaWduRGF0YSA9IHJlLmFjdGl2aXR5O1xuXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgcmVjZWl2ZVNpZ246IGZ1bmN0aW9uKGFjdGl2aXR5SWQpIHtcbiAgICAgICAgICAgIHJldHVybiBnbG9iYWxTZXJ2aWNlcy5wb3N0KCczNTAwJywgJ2pvaW4nLCB7YWN0aXZpdHlJZDogYWN0aXZpdHlJZH0pO1xuICAgICAgICB9XG5cbiAgICB9XG59XSlcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9jb250YWluZXJzL2FjdGl2aXR5L2FjdGl2aXR5U2VydmljZXMuanNcIixcIi8uLi9jb250YWluZXJzL2FjdGl2aXR5XCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGNvbnRyb2xsZXJNb2R1bGUgPSByZXF1aXJlKCcuLi8uLi9qcy9jb250cm9sbGVyTW9kdWxlLmpzJyk7XG5cbi8qKlxuICogZGF0ZSAyMDE2LTEwLTIwXG4gKiBhdXRoIHpoYW5nXG4gKiB0ZWwgMTUyMTAwMDcxODVcbiAqL1xuXG4vKipcbiAqIGxvdHRlcnlDb2RlIDAwMSA9PiDlj4zoibLnkINcbiAqIGxvdHRlcnlDb2RlIDAwMiA9PiDnpo/lvakzRFxuICogbG90dGVyeUNvZGUgMTEzID0+IOWkp+S5kOmAj1xuICogbG90dGVyeUNvZGUgMTA4ID0+IOaOkuWIl+S4iVxuICogbG90dGVyeUNvZGUgMTA5ID0+IOaOkuWIl+S6lFxuICogbG90dGVyeUNvZGUgMDA0ID0+IOS4g+S5kOW9qVxuICogbG90dGVyeUNvZGUgMTEwID0+IOS4g+aYn+W9qVxuICogbG90dGVyeUNvZGUgMDE4ID0+IOWMl+S6rOW/q+S4iVxuICogbG90dGVyeUNvZGUgMDExID0+IOaxn+iLj+W/q+S4iVxuICogbG90dGVyeUNvZGUgMDEwID0+IOWuieW+veW/q+S4iVxuICogbG90dGVyeUNvZGUgMTEwID0+IOS4g+aYn+W9qVxuICogbG90dGVyeUNvZGUgMTEwID0+IOS4g+aYn+W9qVxuICovXG5cbi8vIOW9qeenjei1sOWKv1xuY29udHJvbGxlck1vZHVsZS5jb250cm9sbGVyKCdCb251c1RyZW5kQ3RybCcsIFsnJHNjb3BlJywgICckc3RhdGVQYXJhbXMnLCAnYm9udXNUcmVuZFNlcnZpY2VzJyxcbiAgICBmdW5jdGlvbigkc2NvcGUsICAkc3RhdGVQYXJhbXMsIGJvbnVzVHJlbmRTZXJ2aWNlcykge1xuXG5cbiAgICAgICAgICAvLyDpu5jorqR0YWLmmL7npLrnmoRcbiAgICAgICAgICAkc2NvcGUuZGVmYXVsdCA9IHtcbiAgICAgICAgICAgICAgaW5kZXg6IDAsICAvLyB0YWIg5pi+56S655qE57Si5byVXG4gICAgICAgICAgICAgIHBpY2tlclZhbDogMCxcbiAgICAgICAgICAgICAgaXNzdWVOdW06IFtdLFxuICAgICAgICAgICAgICByZW1uYW50VzogZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLTYwLFxuICAgICAgICAgIH1cblxuICAgICAgICAgICRzY29wZS5pc3N1ZUxpc3QgPSBbXTtcblxuXG4gICAgICAgICAgLy8g6aG16Z2i55qEdGl0bGVcbiAgICAgICAgICAkc2NvcGUuYm9udXNUaXRsZSA9IGJvbnVzVHJlbmRTZXJ2aWNlcy5nZXRMb3R0ZXJ5TmFtZSgkc3RhdGVQYXJhbXMuaWQpO1xuXG4gICAgICAgICAgJHNjb3BlLiR3YXRjaCgnZGVmYXVsdC5pbmRleCcsIGZ1bmN0aW9uIChuZXdWYWwsIG9sZFZhbCkge1xuICAgICAgICAgICAgICBpZiAobmV3VmFsID09IG9sZFZhbCkgcmV0dXJuO1xuICAgICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnaGlkZU1vcmUnKVxuXG4gICAgICAgICAgfSlcblxuICAgICAgICAgIHZhciBzaWduO1xuXG4gICAgICAgICAgJHNjb3BlLiR3YXRjaCgnZGVmYXVsdC5waWNrZXJWYWwnLCBmdW5jdGlvbiAobmV3VmFsLCBvbGRWYWwpIHtcblxuICAgICAgICAgICAgICBpZiAobmV3VmFsID09IG9sZFZhbCkgcmV0dXJuO1xuICAgICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnaGlkZU1vcmUnKTtcblxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgLy8g5rua5Yqo5Yqg6L29XG4gICAgICAgICAgJHNjb3BlLiRvbignbG9hZE1vcmUnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAkc2NvcGUubG9hZE1vcmUoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBzd2l0Y2ggKCRzdGF0ZVBhcmFtcy5pZCkge1xuICAgICAgICAgICAgICBjYXNlICcwMDEnOlxuICAgICAgICAgICAgICAgICAgJHNjb3BlLmRlZmF1bHQuc2lnbkhDID0gJ1NTUSc7XG4gICAgICAgICAgICAgICAgICAkc2NvcGUuZGVmYXVsdC5kaWdpdEFyciA9IG5ldyBBcnJheSgzMyk7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSAnMDAyJzpcblxuICAgICAgICAgICAgICAgICAgJHNjb3BlLmRlZmF1bHQuc2lnbkhDID0gJzNEJztcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlICcxMTMnOlxuICAgICAgICAgICAgICAgICAgJHNjb3BlLmRlZmF1bHQuZGlnaXRBcnIgPSBuZXcgQXJyYXkoMzUpO1xuICAgICAgICAgICAgICAgICAgJHNjb3BlLmRlZmF1bHQuc2lnbkhDID0gJ0RMVCc7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSAnMTA4JzpcblxuICAgICAgICAgICAgICAgICAgJHNjb3BlLmRlZmF1bHQuc2lnbkhDID0gJ1BMMyc7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSAnMTA5JzpcbiAgICAgICAgICAgICAgICAgICRzY29wZS5kZWZhdWx0LmRpZ2l0QXJyID0gWzAsIDIsIDQsIDYsIDhdO1xuICAgICAgICAgICAgICAgICAgJHNjb3BlLmRlZmF1bHQuc2lnbkhDID0gJ1BMNSc7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSAnMDA0JzpcblxuICAgICAgICAgICAgICAgICAgJHNjb3BlLmRlZmF1bHQuc2lnbkhDID0gJzdMQyc7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSAnMTEwJzpcbiAgICAgICAgICAgICAgICAgICRzY29wZS5kZWZhdWx0LmRpZ2l0QXJyID0gWzAsIDIsIDQsIDYsIDgsIDEwLCAxMl1cbiAgICAgICAgICAgICAgICAgICRzY29wZS5kZWZhdWx0LnNpZ25IQyA9ICc3WEMnO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgJzAxOCc6XG4gICAgICAgICAgICAgICAgICAkc2NvcGUuZGVmYXVsdC5zaWduSEMgPSAnQkpLMyc7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgY2FzZSAnMDEwJzpcbiAgICAgICAgICAgICAgICAkc2NvcGUuZGVmYXVsdC5zaWduSEMgPSAnQUhLMyc7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIGNhc2UgJzAxMSc6XG4gICAgICAgICAgICAgICAgJHNjb3BlLmRlZmF1bHQuc2lnbkhDID0gJ0pTSzMnO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICBjYXNlICcxMTQnOlxuICAgICAgICAgICAgICAgICRzY29wZS5kZWZhdWx0LnNpZ25IQyA9ICcxMTUnO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGJvbnVzSXNzdWUgPSBib251c1RyZW5kU2VydmljZXMuYm9udXNJc3N1ZSgkc2NvcGUuZGVmYXVsdC5zaWduSEMsICRzY29wZSk7XG5cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiDliqDovb3mlbDmja5cbiAgICAgICAgICAgKiBAcGFyYW0gaW5kZXgge1N0cmluZ30g5piv5LiN5piv5LiL5ouJ5Yqg6L2955qE5Yet6K+B77yI5LiN5Li656m65bCx5LiL5ouJ5Yqg6L2977yJXG4gICAgICAgICAgICogQHBhcmFtIGlzUmVmZXJzaCB7Qm9vbGVhbn0g6YeN5paw5Yqg6L295pWw5o2uXG4gICAgICAgICAgICovXG4gICAgICAgICAgJHNjb3BlLmxvYWRNb3JlID0gZnVuY3Rpb24gKGluZGV4LCBpc1JlZmVyc2gpe1xuICAgICAgICAgICAgLy8kc2NvcGUuaXNzdWVMaXN0ID0gYm9udXNUcmVuZFNlcnZpY2VzLmlzc3VlRGF0YUhhbmRsZSgkc2NvcGUuZGVmYXVsdC5zaWduSEMpLnNsaWNlKDAsIDIwKTtcbiAgICAgICAgICAgIGJvbnVzSXNzdWUoaW5kZXgsIGlzUmVmZXJzaCk7XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICRzY29wZS4kb24oJyRpb25pY1ZpZXcuYWZ0ZXJFbnRlcicsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICRzY29wZS5pc01vcmUgPSB0cnVlO1xuICAgICAgICAgICAkc2NvcGUubG9hZE1vcmUoMCwgdHJ1ZSk7XG4gICAgICAgICB9KVxuXG5cblxuXG4gICAgfV0pXG4gIC5jb250cm9sbGVyKCdCb251c0szQ3RybCcsIFsnJHNjb3BlJywgJyRzdGF0ZVBhcmFtcycsICdib251c1RyZW5kU2VydmljZXMnLFxuICAgIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlUGFyYW1zLCBib251c1RyZW5kU2VydmljZXMpIHtcblxuXG4gICAgICAvLyDpu5jorqR0YWLmmL7npLrnmoRcbiAgICAgICRzY29wZS5kZWZhdWx0ID0ge1xuICAgICAgICBpbmRleDogMCwgIC8vIHRhYiDmmL7npLrnmoTntKLlvJVcbiAgICAgICAgaXNzdWVOdW06IFtdLFxuICAgICAgICByZW1uYW50VzogZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLTYwXG4gICAgICB9XG5cbiAgICAgICRzY29wZS5pc01vcmUgPSB0cnVlO1xuICAgICAgJHNjb3BlLmlzTW9yZUdyb3VwID0gdHJ1ZTtcblxuICAgICAgLy8g6aG16Z2i55qEdGl0bGVcbiAgICAgICRzY29wZS5ib251c1RpdGxlID0gYm9udXNUcmVuZFNlcnZpY2VzLmdldExvdHRlcnlOYW1lKCRzdGF0ZVBhcmFtcy5pZCk7XG5cbiAgICAgIHN3aXRjaCAoJHN0YXRlUGFyYW1zLmlkKSB7XG4gICAgICAgIGNhc2UgJzAxOCc6XG4gICAgICAgICAgJHNjb3BlLmRlZmF1bHQuc2lnbkhDID0gJ0JKSzMnO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICcwMTAnOlxuICAgICAgICAgICRzY29wZS5kZWZhdWx0LnNpZ25IQyA9ICdBSEszJztcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnMDExJzpcbiAgICAgICAgICAkc2NvcGUuZGVmYXVsdC5zaWduSEMgPSAnSlNLMyc7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG5cblxuICAgICAgJHNjb3BlLiRvbignJGlvbmljVmlldy5hZnRlckVudGVyJywgZnVuY3Rpb24oKXtcblxuICAgICAgICAgIGJvbnVzVHJlbmRTZXJ2aWNlcy5jaGFydEtTR3JvdXAoJHN0YXRlUGFyYW1zLCAkc2NvcGUsICdncm91cCcpO1xuXG4gICAgICB9KVxuXG4gICAgICAkc2NvcGUuJG9uKCckaW9uaWNWaWV3LmxlYXZlJywgZnVuY3Rpb24oKXtcbiAgICAgICAgLy8g5riF6Zmk57yT5a2Y55qE5pyf5qyhXG4gICAgICAgIGJvbnVzVHJlbmRTZXJ2aWNlcy5pc3N1ZUhhbmRsZSgkc2NvcGUuZGVmYXVsdC5zaWduSEMsICcnKTtcblxuICAgICAgfSlcblxuICAgICAgLy8g5pS55Y+Y57uE5ZCI5pWw5o2uXG4gICAgICAkc2NvcGUuJG9uKCdjaGFuZ2VHcm91cERhdGEnLCBmdW5jdGlvbihldmVudCwgZ3JvdXBEYXRhKXtcblxuICAgICAgICAkc2NvcGUuZ3JvdXBEYXRhID0gZ3JvdXBEYXRhO1xuICAgICAgfSlcblxuICAgICAgdmFyIGJvbnVzSXNzdWUgPSBib251c1RyZW5kU2VydmljZXMuYm9udXNJc3N1ZSgkc2NvcGUuZGVmYXVsdC5zaWduSEMsICRzY29wZSk7XG5cbiAgICAgIC8qKlxuICAgICAgICog5Yqg6L295pWw5o2uXG4gICAgICAgKiBAcGFyYW0gaW5kZXgge1N0cmluZ30g5piv5LiN5piv5LiL5ouJ5Yqg6L2955qE5Yet6K+B77yI5LiN5Li656m65bCx5LiL5ouJ5Yqg6L2977yJXG4gICAgICAgKiBAcGFyYW0gaXNSZWZlcnNoIHtCb29sZWFufSDph43mlrDliqDovb3mlbDmja5cbiAgICAgICAqL1xuICAgICAgJHNjb3BlLmxvYWRNb3JlID0gZnVuY3Rpb24gKGluZGV4LCBpc1JlZmVyc2gpe1xuXG4gICAgICAgIC8vIOiOt+WPluW8gOWllueahOW5s+Wdh+aVsOaNrlxuICAgICAgICAhJHNjb3BlLnN1bURhdGEgJiYgYm9udXNUcmVuZFNlcnZpY2VzLmNoYXJ0U3VtKCRzdGF0ZVBhcmFtcy5pZCkudGhlbihmdW5jdGlvbihyZSl7XG4gICAgICAgICAgJHNjb3BlLnN1bURhdGEgPSByZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgYm9udXNJc3N1ZShpbmRleCwgaXNSZWZlcnNoKTtcbiAgICAgIH1cbiAgICB9XSlcblxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL2NvbnRhaW5lcnMvYm9udXN0cmVuZC9Cb251c1RyZW5kQ3RybC5qc1wiLFwiLy4uL2NvbnRhaW5lcnMvYm9udXN0cmVuZFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBkaXJlY3RpdmVNb2R1bGUgPSByZXF1aXJlKCcuLi8uLi9qcy9kaXJlY3RpdmVNb2R1bGUuanMnKTtcblxuLyoqXG4gKiBkYXRhIDIwMTYtMTAtMjZcbiAqIGF1dGggemhhbmdcbiAqIHRlbCAxNTIxMDAwNzE4NVxuICpcbiAqL1xuZGlyZWN0aXZlTW9kdWxlLmRpcmVjdGl2ZSgnYm9udXNGdWxsJywgWydib251c1RyZW5kU2VydmljZXMnLCAnJHJvb3RTY29wZScsIGZ1bmN0aW9uKGJvbnVzVHJlbmRTZXJ2aWNlcywgJHJvb3RTY29wZSkge1xuXG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0FFJyxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIHNpZ25DYWNoZTogJz0nLFxuICAgICAgICAgICAgc2lnbjogJ0AnLFxuICAgICAgICAgICAgaXNzdWVMaXN0OiAnPSdcbiAgICAgICAgfSxcbiAgICAgICAgdGVtcGxhdGU6ICc8ZGl2PjxkaXYgY2xhc3M9XCJjb2x1bW4tYm9keVwiPicgK1xuICAgICAgICAgICAgICAgICc8ZGl2IHN0eWxlPVwid2lkdGg6NjBweFwiPjxzZWN0aW9uPjwvc2VjdGlvbj48L2Rpdj4nK1xuICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwiY29sdW1uLWxlZnQtb3RoZXIgY29udFwiPjxzZWN0aW9uIGNsYXNzPVwiY29sdW1uLXNjcm9sbC14XCIgY2hhcnQtY2xpZW50LXdpZHRoPjwvc2VjdGlvbj48L2Rpdj4nK1xuICAgICAgICAgICAgICAgICc8L2Rpdj48L2Rpdj4nLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlLCBhdHRycyl7XG4gICAgICAgICAgICB2YXIgd2luSCwgd2luVyxpZnIxd2luLFxuICAgICAgICAgICAgICAgIHNjcm9sbEwsc2Nyb2xsRG9tO1xuXG5cbiAgICAgICAgICAgIGlmcjF3aW4gPSBlbGUuZmluZCgnc2VjdGlvbicpWzFdO1xuICAgICAgICAgICAgd2luSCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQ7XG4gICAgICAgICAgICB3aW5XID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xuXG4gICAgICAgICAgICBpZnIxd2luLm9uc2Nyb2xsID0gZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgICAgIHNjcm9sbERvbSA9IGVsZVswXS5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoJ3NlY3Rpb24nKTtcbiAgICAgICAgICAgICAgICBzY3JvbGxMID0gZXZlbnQudGFyZ2V0LnNjcm9sbExlZnQ7XG5cbiAgICAgICAgICAgICAgICBpZiAoc2Nyb2xsRG9tKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsRG9tLnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgnKyAtc2Nyb2xsTCArICdweCwgMCwgMCknO1xuICAgICAgICAgICAgICAgICAgICBzY3JvbGxEb20uc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZTNkKCcgKyAtc2Nyb2xsTCArICdweCwgMCwgMCknO1xuICAgICAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgb1NlY3Rpb24xID0gZWxlLmZpbmQoJ3NlY3Rpb24nKVswXTtcbiAgICAgICAgICB2YXIgb1NlY3Rpb24yID0gZWxlLmZpbmQoJ3NlY3Rpb24nKVsxXTtcblxuXG4gICAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICAgIHNjb3BlLiR3YXRjaCgnc2lnbicsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKXtcblxuICAgICAgICAgICAgaSArPSAxO1xuXG4gICAgICAgICAgICBpZiAoaSA+IDEpIHtcbiAgICAgICAgICAgICAgaWYgKG5ld1ZhbC5pbmRleE9mKCdkZWYnKSA+IC0xKXtcblxuICAgICAgICAgICAgICAgIHNob3dDaGFydChzY29wZS5zaWduQ2FjaGUpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICB9KVxuICAgICAgICAgIHNjb3BlLiR3YXRjaCgnaXNzdWVMaXN0JywgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpe1xuXG4gICAgICAgICAgICBpZiAobmV3VmFsKSB7XG4gICAgICAgICAgICAgIHNob3dDaGFydCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG5cbiAgICAgICAgICBmdW5jdGlvbiBzaG93Q2hhcnQoc2lnbil7XG4gICAgICAgICAgICB2YXIgb2MxLCBvYzIsXG4gICAgICAgICAgICAgIGRhdGEgPSBzY29wZS5pc3N1ZUxpc3Q7XG4gICAgICAgICAgICBpZiAoIWRhdGEubGVuZ3RoKSByZXR1cm47XG4gICAgICAgICAgICBpZiAoIXNpZ24pIHtcbiAgICAgICAgICAgICAgb2MxID0gZHJhd0NoYXJ0SXNzdWUoZGF0YSk7XG4gICAgICAgICAgICAgIG9TZWN0aW9uMS5hcHBlbmRDaGlsZChvYzEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgb1NlY3Rpb24yLmlubmVySFRNTCA9ICcnO1xuICAgICAgICAgICAgICBkYXRhID0gYm9udXNUcmVuZFNlcnZpY2VzLmlzc3VlRGF0YVtzaWduXTtcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgICAgICBvYzIgPSBkcmF3Q2hhcnQoZGF0YSwgc2NvcGUuc2lnbik7XG4gICAgICAgICAgICBvU2VjdGlvbjIuYXBwZW5kQ2hpbGQob2MyKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICpcbiAgICAgICAgICAgKiBAcGFyYW0gb0NhbnZhc1xuICAgICAgICAgICAqIEBwYXJhbSBkYXRhc1xuICAgICAgICAgICAqL1xuICAgICAgICAgICAgZnVuY3Rpb24gZHJhd0NoYXJ0SXNzdWUoZGF0YXMpe1xuICAgICAgICAgICAgICB2YXIgY2VsbFcgPSAxMjAsIGNlbGxIID0gNjgsXG4gICAgICAgICAgICAgICAgb2NXID0gY2VsbFcsXG4gICAgICAgICAgICAgICAgb2NIID0gY2VsbEggKiBkYXRhcy5sZW5ndGg7XG5cbiAgICAgICAgICAgICAgdmFyIG9DYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgICAgICAgb0NhbnZhcy53aWR0aCA9IG9jVztcbiAgICAgICAgICAgICAgb0NhbnZhcy5oZWlnaHQgPSBvY0g7XG5cblxuXG4gICAgICAgICAgICBpZiAob0NhbnZhcy5nZXRDb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgdmFyIG9jID0gb0NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuXG4gICAgICAgICAgICAgICAgZGF0YXMuZm9yRWFjaChmdW5jdGlvbihkYXRhLCBpbmRleCl7XG5cbiAgICAgICAgICAgICAgICAgICAgZHJhd051bShvYywgY2VsbFcsIGNlbGxILCBpbmRleCwgZGF0YS5pc3N1ZSk7XG5cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICBvQ2FudmFzLnN0eWxlLndpZHRoID0gb2NXIC8yICsgJ3B4JztcbiAgICAgICAgICAgICAgb0NhbnZhcy5zdHlsZS5oZWlnaHQgPSBvY0ggLyAyKyAncHgnO1xuICAgICAgICAgICAgICByZXR1cm4gb0NhbnZhcztcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBmdW5jdGlvbiBkcmF3TnVtKG9jLCB3aWR0aCwgaGVpZ2h0LCByb3dJbmRleCwgbnVtKSB7XG5cblxuXG4gICAgICAgICAgICAgICAgaWYgKHJvd0luZGV4ICUgMikge1xuICAgICAgICAgICAgICAgICAgb2MuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgICBvYy5maWxsU3R5bGUgPSAnI2Y0ZjRmNCc7XG4gICAgICAgICAgICAgICAgICBvYy5maWxsUmVjdCgwLCByb3dJbmRleCAqIGNlbGxILCBjZWxsVywgY2VsbEgpO1xuICAgICAgICAgICAgICAgICAgb2MuY2xvc2VQYXRoKClcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBvYy5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICBvYy5saW5lV2lkdGggPSAxO1xuICAgICAgICAgICAgICAgIG9jLnN0cm9rZVN0eWxlID0gJyNkZGQnO1xuXG4gICAgICAgICAgICAgICAgb2MubW92ZVRvKDAsIHJvd0luZGV4KmhlaWdodCArIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgb2MubGluZVRvKHdpZHRoLCByb3dJbmRleCpoZWlnaHQgKyBoZWlnaHQpO1xuXG4gICAgICAgICAgICAgICAgb2MubGluZVRvKHdpZHRoLCByb3dJbmRleCpoZWlnaHQpO1xuICAgICAgICAgICAgICAgIG9jLnN0cm9rZSgpO1xuXG4gICAgICAgICAgICAgICAgb2MuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgb2MuZm9udCA9IFwiMjRweCBBcmlhbFwiO1xuICAgICAgICAgICAgICAgIG9jLmZpbGxTdHlsZSA9ICcjNjY2JztcbiAgICAgICAgICAgICAgICBvYy50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICAgICAgICAgICAgICBvYy50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJztcbiAgICAgICAgICAgICAgICBvYy5maWxsVGV4dChudW0sICB3aWR0aCAvIDIsIHJvd0luZGV4ICogaGVpZ2h0ICsgaGVpZ2h0IC8gMik7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICpcbiAgICAgICAgICAgKiBAcGFyYW0gb0NhbnZhc1xuICAgICAgICAgICAqIEBwYXJhbSBkYXRhc1xuICAgICAgICAgICAqIEBwYXJhbSBzaWduXG4gICAgICAgICAgICovXG4gICAgICAgICAgICBmdW5jdGlvbiBkcmF3Q2hhcnQoZGF0YXMsIHNpZ24pe1xuXG4gICAgICAgICAgICAgIHZhciBjZWxsVyA9IDYwLCBjZWxsSCA9IDY4LFxuICAgICAgICAgICAgICAgIGNvbnRXID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIC0gNjAsXG4gICAgICAgICAgICAgICAgY2VsbExlbiA9IGRhdGFzWzBdLnlpTG91W3NpZ25dLmxlbmd0aDtcblxuICAgICAgICAgICAgICBpZiAoY29udFcgPiBjZWxsTGVuICogMzApIHtcbiAgICAgICAgICAgICAgICBjZWxsVyA9IGNvbnRXIC8gY2VsbExlbiAqIDI7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIG9DYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgICAgICAgdmFyIG9jSCA9IGRhdGFzLmxlbmd0aCAqIGNlbGxIO1xuICAgICAgICAgICAgICB2YXIgb2NXID0gY2VsbExlbiAqIGNlbGxXLFxuICAgICAgICAgICAgICAgICAgYXJjU3R5bGUgPSAoc2lnbiA9PSAnYmx1ZScgPyAnIzE2N0NFOCcgOiAnI2ZmMzkzOScpO1xuICAgICAgICAgICAgICBvQ2FudmFzLndpZHRoID0gb2NXIDtcbiAgICAgICAgICAgICAgb0NhbnZhcy5oZWlnaHQgPSBvY0ggO1xuXG5cbiAgICAgICAgICAgICAgaWYgKG9DYW52YXMuZ2V0Q29udGV4dCkge1xuICAgICAgICAgICAgICAgIHZhciBvYyA9IG9DYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcblxuICAgICAgICAgICAgICAgIGRhdGFzLmZvckVhY2goZnVuY3Rpb24oZGF0YSwgaW5kZXgpe1xuICAgICAgICAgICAgICAgICAgZGF0YS55aUxvdVtzaWduXS5mb3JFYWNoKGZ1bmN0aW9uKG51bXMsIGkpe1xuICAgICAgICAgICAgICAgICAgICBkcmF3TnVtKG9jLCBjZWxsVywgY2VsbEgsIGluZGV4LCBpLCBudW1zLCBhcmNTdHlsZSk7XG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgb0NhbnZhcy5zdHlsZS53aWR0aCA9IG9jVyAvMiArICdweCc7XG4gICAgICAgICAgICAgICAgb0NhbnZhcy5zdHlsZS5oZWlnaHQgPSBvY0ggLyAyKyAncHgnO1xuICAgICAgICAgICAgICAgIHJldHVybiBvQ2FudmFzO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgZnVuY3Rpb24gZHJhd051bShvYywgd2lkdGgsIGhlaWdodCwgIHJvd0luZGV4LCBjZWxsSW5kZXgsIG51bSwgYXJjU3R5bGUpIHtcblxuXG4gICAgICAgICAgICAgICAgaWYgKHJvd0luZGV4ICUgMikge1xuICAgICAgICAgICAgICAgICAgb2MuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgICAgICBvYy5maWxsU3R5bGUgPSAnI2Y0ZjRmNCc7XG4gICAgICAgICAgICAgICAgICBvYy5maWxsUmVjdChjZWxsSW5kZXggKiBjZWxsVywgcm93SW5kZXggKiBjZWxsSCwgY2VsbFcsIGNlbGxIKTtcbiAgICAgICAgICAgICAgICAgIG9jLmNsb3NlUGF0aCgpXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKG51bSA9PSAwKSB7XG5cbiAgICAgICAgICAgICAgICAgIGlmIChzaWduID09ICdyZWQnIHx8IHNpZ24gPT0gJ2JsdWUnKSB7XG4gICAgICAgICAgICAgICAgICAgIG51bSA9IGNlbGxJbmRleCArIDE7XG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBudW0gPSBjZWxsSW5kZXg7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIG9jLmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgICAgb2MuZmlsbFN0eWxlID0gYXJjU3R5bGU7XG4gICAgICAgICAgICAgICAgICBvYy5hcmMoY2VsbEluZGV4ICogd2lkdGggKyB3aWR0aCAvIDIsIHJvd0luZGV4ICogaGVpZ2h0ICsgaGVpZ2h0IC8gMiwgaGVpZ2h0IC8gMiAtIDEwLCAwLCBNYXRoLlBJICogMik7XG4gICAgICAgICAgICAgICAgICBvYy5maWxsKCk7XG4gICAgICAgICAgICAgICAgICBvYy5maWxsU3R5bGUgPSAnI2ZmZic7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIG9jLmZpbGxTdHlsZSA9ICcjNjY2JztcbiAgICAgICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgICAgIG9jLmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICAgIG9jLmxpbmVXaWR0aCA9IDE7XG4gICAgICAgICAgICAgICAgb2Muc3Ryb2tlU3R5bGUgPSAnI2RkZCc7XG5cbiAgICAgICAgICAgICAgICBvYy5tb3ZlVG8oY2VsbEluZGV4ICogd2lkdGgsIHJvd0luZGV4KmhlaWdodCk7XG4gICAgICAgICAgICAgICAgb2MubGluZVRvKGNlbGxJbmRleCAqIHdpZHRoLCByb3dJbmRleCpoZWlnaHQgKyBoZWlnaHQpO1xuXG4gICAgICAgICAgICAgICAgb2MubGluZVRvKGNlbGxJbmRleCAqIHdpZHRoICsgd2lkdGgsIHJvd0luZGV4KmhlaWdodCArIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgb2Muc3Ryb2tlKCk7XG5cbiAgICAgICAgICAgICAgICBvYy5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICBvYy5mb250ID0gXCIyNHB4IEFyaWFsXCI7XG5cbiAgICAgICAgICAgICAgICBvYy50ZXh0QWxpZ24gPSAnY2VudGVyJztcbiAgICAgICAgICAgICAgICBvYy50ZXh0QmFzZWxpbmUgPSAnbWlkZGxlJ1xuICAgICAgICAgICAgICAgIG9jLmZpbGxUZXh0KG51bSwgY2VsbEluZGV4ICogd2lkdGggKyB3aWR0aCAvIDIsIHJvd0luZGV4ICogaGVpZ2h0ICsgaGVpZ2h0IC8gMik7XG5cblxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XSlcblxuICAgIC8v5p+l55yL5pu05aSaXG4uZGlyZWN0aXZlKCdzaG93TW9yZScsIFsnYm9udXNUcmVuZFNlcnZpY2VzJywgJyRzdGF0ZVBhcmFtcycsIGZ1bmN0aW9uKGJvbnVzVHJlbmRTZXJ2aWNlcywgJHN0YXRlUGFyYW1zKSB7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0FFJyxcbiAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIHBpY2tlclZhbDogJz0nLFxuICAgICAgICAgICAgc2lnbkFycjogJz0nLFxuICAgICAgICAgICAgaW5kZXg6ICc9JyxcbiAgICAgICAgICAgIGlzRnVsbDogJz0nXG4gICAgICAgIH0sXG4gICAgICAgIHRlbXBsYXRlVXJsOidtaXNzLmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlLCBhdHRycyl7XG5cbiAgICAgICAgICAgIHZhciBvbmNlID0gdHJ1ZSxcbiAgICAgICAgICAgICAgICBjaGFydFN1bSxcbiAgICAgICAgICAgICAgICBzaWduU3VwO1xuXG4gICAgICAgICAgICBzY29wZS5iQnRuID0gZmFsc2U7XG4gICAgICAgICAgICBzY29wZS5wcm9tcHRUaXRsZSA9ICfmn6XnnIvljoblj7Lnu5/orqEnO1xuICAgICAgICAgICAgc2NvcGUudG90YWxTdW0gPSBbXTtcbiAgICAgICAgICAgIHNjb3BlLmF2Z1lpTG91ID0gW107XG4gICAgICAgICAgICBzY29wZS5tYXhZaWxvdSA9IFtdO1xuICAgICAgICAgICAgc2NvcGUubWF4TGlhbkNodT0gW107XG4gICAgICAgICAgICBzY29wZS53aW5XID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoO1xuXG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHNldERhdGEoY2hhcnRTdW0pe1xuICAgICAgICAgICAgICAgIC8vIOaYr+aVsOe7hFxuICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzQXJyYXkoc2NvcGUuc2lnbkFycltzY29wZS5pbmRleF0pKXtcblxuICAgICAgICAgICAgICAgICAgICBzaWduU3VwID0gc2NvcGUuc2lnbkFycltzY29wZS5pbmRleF1bc2NvcGUucGlja2VyVmFsXTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNpZ25TdXAgPSBzY29wZS5zaWduQXJyW3Njb3BlLmluZGV4XTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBzY29wZS50b3RhbFN1bSA9IGNoYXJ0U3VtLnRvdGFsU3VtW3NpZ25TdXBdIHx8IGNoYXJ0U3VtLnRvdGFsU3VtLmRlZiAmJiBjaGFydFN1bS50b3RhbFN1bS5kZWYuc2xpY2Uoc2NvcGUuaW5kZXgqMTAsIHNjb3BlLnNpZ25BcnJbc2NvcGUuaW5kZXhdICsgc2NvcGUuaW5kZXgqMTApO1xuICAgICAgICAgICAgICAgIHNjb3BlLmF2Z1lpTG91ID0gY2hhcnRTdW0uYXZnWWlMb3Vbc2lnblN1cF0gfHwgY2hhcnRTdW0udG90YWxTdW0uZGVmICYmIGNoYXJ0U3VtLmF2Z1lpTG91LmRlZi5zbGljZShzY29wZS5pbmRleCoxMCwgc2NvcGUuc2lnbkFycltzY29wZS5pbmRleF0gKyBzY29wZS5pbmRleCoxMCk7XG4gICAgICAgICAgICAgICAgc2NvcGUubWF4WWlMb3UgPSBjaGFydFN1bS5tYXhZaUxvdVtzaWduU3VwXSB8fCBjaGFydFN1bS50b3RhbFN1bS5kZWYgJiYgY2hhcnRTdW0ubWF4WWlMb3UuZGVmLnNsaWNlKHNjb3BlLmluZGV4KjEwLCBzY29wZS5zaWduQXJyW3Njb3BlLmluZGV4XSArIHNjb3BlLmluZGV4KjEwKTtcbiAgICAgICAgICAgICAgICBzY29wZS5tYXhMaWFuQ2h1ID0gY2hhcnRTdW0ubWF4TGlhbkNodVtzaWduU3VwXSB8fCBjaGFydFN1bS50b3RhbFN1bS5kZWYgJiYgY2hhcnRTdW0ubWF4TGlhbkNodS5kZWYuc2xpY2Uoc2NvcGUuaW5kZXgqMTAsIHNjb3BlLnNpZ25BcnJbc2NvcGUuaW5kZXhdICsgc2NvcGUuaW5kZXgqMTApO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNjb3BlLnNob3dTdW0gPSBmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgICAgc2NvcGUuYkJ0biA9ICFzY29wZS5iQnRuO1xuXG4gICAgICAgICAgICAgICAgaWYgKHNjb3BlLmJCdG4pIHtcbiAgICAgICAgICAgICAgICAgICAgZWxlLmNzcygnaGVpZ2h0JywgJzE4MHB4Jyk7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLnByb21wdFRpdGxlID0gJ+aUtui1t+WOhuWPsue7n+iuoSc7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvbmNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOiOt+WPluW8gOWllueahOW5s+Wdh+aVsOaNrlxuICAgICAgICAgICAgICAgICAgICAgICAgICBib251c1RyZW5kU2VydmljZXMuY2hhcnRTdW0oJHN0YXRlUGFyYW1zLmlkKS50aGVuKGZ1bmN0aW9uIChyZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNoYXJ0U3VtID0gcmU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0RGF0YShjaGFydFN1bSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAxMDApXG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNldERhdGEoY2hhcnRTdW0pO1xuICAgICAgICAgICAgICAgICAgICB9XG5cblxuXG5cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbGUuY3NzKCdoZWlnaHQnLCAnNDRweCcpO1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5wcm9tcHRUaXRsZSA9ICfmn6XnnIvljoblj7Lnu5/orqEnO1xuICAgICAgICAgICAgICAgIH1cblxuXG5cblxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNjb3BlLiRvbignaGlkZU1vcmUnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIGVsZS5jc3MoJ2hlaWdodCcsICc0NHB4Jyk7XG4gICAgICAgICAgICAgICAgc2NvcGUucHJvbXB0VGl0bGUgPSAn5p+l55yL5Y6G5Y+y5pWw5o2uJztcbiAgICAgICAgICAgICAgICBzY29wZS5iQnRuID0gZmFsc2U7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgfVxufV0pICAvLyDorr7nva7lm77ooajpq5jluqZcbi5kaXJlY3RpdmUoJ2NoYXJ0SGVpZ2h0JywgZnVuY3Rpb24oKXtcblxuICAgIHJldHVybntcbiAgICAgICAgcmVzdHJpY3Q6ICdBRScsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGUsIGF0dHJzKXtcbiAgICAgICAgICAgIHdpblcgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGg7XG5cbiAgICAgICAgICAgIGVsZS5jc3MoeydoZWlnaHQnOiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0IC0gMTYwICsgJ3B4J30pXG4gICAgICAgIH1cbiAgICB9XG59KVxuICAuZGlyZWN0aXZlKCdjaGFydENsaWVudFdpZHRoJywgZnVuY3Rpb24oKXtcblxuICAgICAgcmV0dXJue1xuICAgICAgICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGUsIGF0dHJzKXtcbiAgICAgICAgICAgICAgd2luVyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcblxuICAgICAgICAgICAgICBlbGUuY3NzKHsnd2lkdGgnOiAod2luVyAtIDYwKSArICdweCd9KVxuICAgICAgICAgIH1cbiAgICAgIH1cbiAgfSlcbiAgLmRpcmVjdGl2ZSgnaXNzdWUnLCBmdW5jdGlvbigpe1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljdDogJ0FFJyxcbiAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICBzY29wZToge1xuICAgICAgICBpc3N1ZURhdGE6ICc9J1xuICAgICAgfSxcbiAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cImJvbnVzLXJvd1wiPjxkaXYgY2xhc3M9XCJib251cy1jb2wgYmctZmRkOWQ5XCIgbmctcmVwZWF0PVwibnVtYmVyIGluIGlzc3VlRGF0YSB0cmFjayBieSAkaW5kZXhcIiBzdHlsZT1cIndpZHRoOnt7d2lkdGh9fXB4XCI+PHNwYW4gPnt7bnVtYmVyfX08L3NwYW4+PC9kaXY+PC9kaXY+JyxcbiAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGUsIGF0dHJzKXtcbiAgICAgICAgdmFyIGNvbnRXID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoIC0gNjAsXG4gICAgICAgICAgICBsZW4gPSAgc2NvcGUuaXNzdWVEYXRhLmxlbmd0aDtcblxuICAgICAgICBzY29wZS53aWR0aCA9IDMwO1xuXG5cbiAgICAgICAgaWYgKGNvbnRXID4gc2NvcGUud2lkdGggKiBsZW4pIHtcbiAgICAgICAgICBzY29wZS53aWR0aCA9IGNvbnRXIC8gbGVuO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9fSlcbiAgLmRpcmVjdGl2ZSgnc2hvd0dyb3VwJywgWydib251c1RyZW5kU2VydmljZXMnLCBmdW5jdGlvbihib251c1RyZW5kU2VydmljZXMpe1xuICAgIHJldHVybntcbiAgICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgICAgc2NvcGU6IHtcbiAgICAgICAgc2lnbjogJ0AnXG4gICAgICB9LFxuICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwiZ3JvdXAtbW9yZVwiID48aDMgY2xhc3M9XCJncm91cC1oZWFkZXJcIiBvbi10YXA9XCJzaG93TGF5ZXIoKVwiPnt7cGxheU5hbWV9fTxpIGNsYXNzPVwiaWNvbiBpY29uLWRvd24tbW9yZVwiIG5nLWNsYXNzPVwie1xcJ2RpcmVjdGlvbi11cFxcJzogaXNVcH1cIj48L2k+PC9oMz4nICtcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJncm91cC10aXRsZS1saXN0XCI+PGRpdj48ZW0gIG9uLXRhcD1cInNlbGVjdEhhbmRsZSgpXCIgbmctY2xhc3M9XCJ7YWN0aXZlOiBwbGF5TmFtZSA9PSBcXCfnu4TlkIhcXCd9XCI+5YWo6YOo57uE5ZCIPC9lbT48L2Rpdj4nICtcbiAgICAgICAgJzxkaXYgbmctcmVwZWF0PVwiZ3JvdXBzIGluIGNhY2hlRGF0YSB0cmFjayBieSBncm91cHMucGxheU5hbWVcIj48ZW0gIG9uLXRhcD1cInNlbGVjdEhhbmRsZShncm91cHMucGxheU5hbWUpXCIgbmctY2xhc3M9XCJ7YWN0aXZlOiBcXCdcXCcgKyBncm91cHMucGxheU5hbWUgPT0gcGxheU5hbWV9XCI+e3tncm91cHMucGxheU5hbWV9fTwvZW0+PC9kaXY+PC9kaXY+PC9kaXY+JyxcbiAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGUsIGF0dHJzKXtcbiAgICAgICAgdmFyIG9MaXN0ID0gZWxlLmZpbmQoJ2RpdicpWzBdLnF1ZXJ5U2VsZWN0b3IoJy5ncm91cC10aXRsZS1saXN0JyksXG4gICAgICAgICAgICBncm91cERhdGEgPSBbXTtcblxuICAgICAgICBzY29wZS5jYWNoZURhdGEgPSBib251c1RyZW5kU2VydmljZXMuaXNzdWVEYXRhSGFuZGxlKHNjb3BlLnNpZ24pO1xuXG4gICAgICAgIHNjb3BlLnBsYXlOYW1lID0gJ+e7hOWQiCc7XG4gICAgICAgIHNjb3BlLnNlbGVjdEhhbmRsZSA9IGZ1bmN0aW9uKGFyZyl7XG5cbiAgICAgICAgICBpZiAoIWFyZykge1xuICAgICAgICAgICAgZ3JvdXBEYXRhID0gc2NvcGUuY2FjaGVEYXRhO1xuICAgICAgICAgICAgc2NvcGUucGxheU5hbWUgPSAn57uE5ZCIJztcblxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goc2NvcGUuY2FjaGVEYXRhLCBmdW5jdGlvbihkYXRhLCBpbmRleCl7XG5cbiAgICAgICAgICAgICAgaWYgKGRhdGEucGxheU5hbWUgPT0gYXJnKSB7XG4gICAgICAgICAgICAgICAgc2NvcGUucGxheU5hbWUgPSBhcmc7XG4gICAgICAgICAgICAgICAgZ3JvdXBEYXRhID0gc2NvcGUuY2FjaGVEYXRhLnNsaWNlKGluZGV4LCBpbmRleCsxKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgICAgdHJhbnNsYXRlVG9ZKDApO1xuXG4gICAgICAgICAgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wID0gMDtcbiAgICAgICAgICBzY29wZS4kZW1pdCgnY2hhbmdlR3JvdXBEYXRhJywgZ3JvdXBEYXRhKTtcbiAgICAgICAgICBzY29wZS5pc1VwID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgc2NvcGUuc2hvd0xheWVyID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICB2YXIgeTtcblxuICAgICAgICAgIGlmIChzY29wZS5pc1VwKSB7XG4gICAgICAgICAgICB5ID0gMDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgeSA9IC1vTGlzdC5vZmZzZXRIZWlnaHQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgdHJhbnNsYXRlVG9ZKHkpO1xuICAgICAgICAgIHNjb3BlLmlzVXAgPSAhc2NvcGUuaXNVcDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHRyYW5zbGF0ZVRvWSh5KXtcblxuICAgICAgICAgIG9MaXN0LnN0eWxlLnRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgwLCAnICsgeSArICdweCwgMCknO1xuICAgICAgICAgIG9MaXN0LnN0eWxlLndlYmtpdFRyYW5zZm9ybSA9ICd0cmFuc2xhdGUzZCgwLCAnICsgeSArICdweCwgMCknO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XSlcbiAgLmRpcmVjdGl2ZSgnYm9udXNLMycsIFsnYm9udXNUcmVuZFNlcnZpY2VzJywgJyRyb290U2NvcGUnLCBmdW5jdGlvbihib251c1RyZW5kU2VydmljZXMsICRyb290U2NvcGUpIHtcblxuXG4gICAgcmV0dXJuIHtcbiAgICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICBzY29wZToge1xuICAgICAgICBzaWduOiAnQCcsXG4gICAgICAgIGlzc3VlTGlzdDogJz0nLFxuICAgICAgICBzdW1EYXRhOiAnPSdcbiAgICAgIH0sXG4gICAgICB0ZW1wbGF0ZTogJzxzZWN0aW9uPjwvc2VjdGlvbj4nLFxuICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZSwgYXR0cnMpe1xuICAgICAgICBzY29wZS5pc09mZkxpbmUgPSAkcm9vdFNjb3BlLmlzT2ZmTGluZTtcbiAgICAgICAgc2NvcGUud2luVyA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aDtcblxuICAgICAgICB2YXIgb1NlY3Rpb24gPSBlbGVbMF0sXG4gICAgICAgICAgICBpbmRleCA9IDA7XG5cblxuXG5cbiAgICAgICAgc2NvcGUuJHdhdGNoKCdpc3N1ZUxpc3QnLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCl7XG4gICAgICAgICAgaW5kZXggKz0gMTtcblxuICAgICAgICAgIGlmIChuZXdWYWwpIHNob3dDaGFydChzY29wZS5zaWduLCBpbmRleCA8IDIpO1xuICAgICAgICB9KVxuICAgICAgICBmdW5jdGlvbiBzaG93Q2hhcnQoc2lnbiwgaXNBZGQpe1xuICAgICAgICAgIHZhciBvYyxcbiAgICAgICAgICAgIGRhdGEgPSBnZXRDb25jYXREYXRhKHNpZ24sIGlzQWRkKTtcblxuICAgICAgICAgIG9jID0gZHJhd0NoYXJ0KGRhdGEsIHNpZ24sIGlzQWRkKTtcbiAgICAgICAgICBvU2VjdGlvbi5hcHBlbmRDaGlsZChvYyk7XG4gICAgICAgIH1cblxuICAgICAgICAvKipcbiAgICAgICAgICog6YeN5paw57uE5ZCI5pWw5o2uXG4gICAgICAgICAgKiBAcGFyYW0gbmV3VmFsXG4gICAgICAgICAqL1xuICAgICAgICBmdW5jdGlvbiBnZXRDb25jYXREYXRhKHNpZ24sIGlzQWRkKXtcblxuICAgICAgICAgIHZhciBzdW1EYXRhID0gYW5ndWxhci5jb3B5KHNjb3BlLnN1bURhdGEpLFxuICAgICAgICAgICAgICByZXN1bHQgPSBbXTtcbiAgICAgICAgICBhbmd1bGFyLmNvcHkoc2NvcGUuaXNzdWVMaXN0LCByZXN1bHQpO1xuXG4gICAgICAgICAgaWYgKGlzQWRkKSB7XG5cbiAgICAgICAgICAgIC8vIOWSjOWAvCA0LTEwXG4gICAgICAgICAgICBpZiAoc2lnbi5pbmRleE9mKCdzdW00JykgPiAtMSkge1xuICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gocmVzdWx0LCBmdW5jdGlvbih2YWwpe1xuICAgICAgICAgICAgICAgIGlmICh2YWwueWlMb3Uuc3VtKSB7XG4gICAgICAgICAgICAgICAgICB2YWwueWlMb3UuZGVmID0gdmFsLnlpTG91LnN1bS5zbGljZSgwLCA3KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIHNpZ24gPSAnc3VtJztcbiAgICAgICAgICAgICAgc2hpZnREYXRhKDAsIDcpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChzaWduLmluZGV4T2YoJ3N1bTExJykgPiAtMSkge1xuICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gocmVzdWx0LCBmdW5jdGlvbih2YWwpe1xuICAgICAgICAgICAgICAgIGlmICh2YWwueWlMb3Uuc3VtKSB7XG4gICAgICAgICAgICAgICAgICB2YWwueWlMb3UuZGVmID0gdmFsLnlpTG91LnN1bS5zbGljZSg3LCAxNSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICBzaWduID0gJ3N1bSc7XG4gICAgICAgICAgICAgIHNoaWZ0RGF0YSg3LCA3KTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc2lnbi5pbmRleE9mKCdzcGFuJykgPiAtMSkge1xuICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gocmVzdWx0LCBmdW5jdGlvbih2YWwpe1xuICAgICAgICAgICAgICAgIGlmICh2YWwueWlMb3Uuc3Bhbikge1xuICAgICAgICAgICAgICAgICAgdmFsLnlpTG91LmRlZiA9IHZhbC55aUxvdS5zcGFuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICBzaGlmdERhdGEoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHNoaWZ0RGF0YSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfVxuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChyZXN1bHQsIGZ1bmN0aW9uKHZhbCwgaW5kZXgpe1xuICAgICAgICAgICAgdmFyIG5ld0FyciA9IHZhbC55aUxvdS5kZWY7XG4gICAgICAgICAgICBuZXdBcnIudW5zaGlmdCh2YWwuaXNzdWUuc3Vic3RyaW5nKDQpKTtcblxuICAgICAgICAgICAgaWYgKGluZGV4ID09IDAgJiYgaXNBZGQpIHtcblxuICAgICAgICAgICAgICBuZXdBcnIuc3BsaWNlKDEsIDAsICfmnIDlpKfpgZfmvI8nKTtcblxuICAgICAgICAgICAgfSBlbHNlIGlmIChpbmRleCA9PSAxICYmIGlzQWRkKXtcbiAgICAgICAgICAgICAgbmV3QXJyLnNwbGljZSgxLCAwLCAn5bmz5Z2H6YGX5ryPJylcblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgbmV3QXJyLnNwbGljZSgxLCAwLCB2YWwuYm9udXNOdW1iZXIuc3BsaXQoJywnKS5qb2luKCcgJykpXG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuXG5cbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuXG4gICAgICAgICAgZnVuY3Rpb24gc2hpZnREYXRhKGluZGV4LCBsZW4pe1xuICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNBcnJheShyZXN1bHQpKSB7XG5cbiAgICAgICAgICAgICAgLy8g5re75Yqg5pyA5aSn6YGX5ryPXG4gICAgICAgICAgICAgIHJlc3VsdC51bnNoaWZ0KHtcbiAgICAgICAgICAgICAgICBpc3N1ZTogJycsXG4gICAgICAgICAgICAgICAgeWlMb3U6IHtcbiAgICAgICAgICAgICAgICAgIGRlZjogc2lnbiA9PSAnc3VtJyA/IHN1bURhdGEuYXZnWWlMb3Vbc2lnbl0uc2xpY2UoaW5kZXgsIGluZGV4ICsgbGVuKSA6IHN1bURhdGEuYXZnWWlMb3Vbc2lnbl1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIC8vIOa3u+WKoOW5s+Wdh+mBl+a8j1xuICAgICAgICAgICAgICByZXN1bHQudW5zaGlmdCh7XG4gICAgICAgICAgICAgICAgaXNzdWU6ICcnLFxuICAgICAgICAgICAgICAgIHlpTG91OiB7XG4gICAgICAgICAgICAgICAgICBkZWY6IHNpZ24gPT0gJ3N1bScgPyBzdW1EYXRhLm1heFlpTG91W3NpZ25dLnNsaWNlKGluZGV4LCBpbmRleCArIGxlbikgOiBzdW1EYXRhLm1heFlpTG91W3NpZ25dXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKlxuICAgICAgICAgKiBAcGFyYW0gb0NhbnZhc1xuICAgICAgICAgKiBAcGFyYW0gZGF0YXNcbiAgICAgICAgICogQHBhcmFtIHNpZ25cbiAgICAgICAgICogQHBhcmFtIGlzQWRkIOaYr+WQpua3u+WKoOWFtuS7luagt+W8j1xuICAgICAgICAgKi9cbiAgICAgICAgZnVuY3Rpb24gZHJhd0NoYXJ0KGRhdGFzLCBzaWduLCBpc0FkZCl7XG4gICAgICAgICAgdmFyIGNlbGxXID0gNjAsIGNlbGxIID0gNjgsXG4gICAgICAgICAgICB3aW5XID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoLFxuICAgICAgICAgICAgY2VsbExlbiA9IGRhdGFzWzBdLnlpTG91LmRlZi5sZW5ndGg7XG5cblxuICAgICAgICAgIGlmIChjZWxsTGVuIDw9IDEwKSB7XG4gICAgICAgICAgICBjZWxsVyA9ICgod2luVyAtIDEyMCkgLyAoY2VsbExlbiAtIDIpKSAqIDI7XG5cbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgb2NIID0gZGF0YXMubGVuZ3RoICogY2VsbEg7XG4gICAgICAgICAgICBhcmNTdHlsZSA9ICcjZmYzOTM5JyxcbiAgICAgICAgICAgICAgb0NhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgICAgIG9DYW52YXMud2lkdGggPSB3aW5XICogMjtcbiAgICAgICAgICBvQ2FudmFzLmhlaWdodCA9IG9jSDtcblxuICAgICAgICAgIGlmIChvQ2FudmFzLmdldENvbnRleHQpIHtcbiAgICAgICAgICAgIGRhdGFzLmZvckVhY2goZnVuY3Rpb24oZGF0YSwgaW5kZXgpe1xuICAgICAgICAgICAgICBkYXRhLnlpTG91LmRlZi5mb3JFYWNoKGZ1bmN0aW9uKG51bXMsIGkpe1xuICAgICAgICAgICAgICAgIGRyYXdOdW0ob0NhbnZhcywgY2VsbFcsIGNlbGxILCBpbmRleCwgaSwgbnVtcywgYXJjU3R5bGUpO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJldHVybiBvQ2FudmFzO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGZ1bmN0aW9uIGRyYXdOdW0ob0NhbnZhcywgd2lkdGgsIGhlaWdodCwgIHJvd0luZGV4LCBjZWxsSW5kZXgsIG51bSwgYXJjU3R5bGUpIHtcbiAgICAgICAgICAgIHZhciBvYyA9IG9DYW52YXMuZ2V0Q29udGV4dCgnMmQnKSxcbiAgICAgICAgICAgICAgYmc7XG5cblxuICAgICAgICAgICAgaWYgKHJvd0luZGV4ID09IDAgJiYgaXNBZGQpIHtcbiAgICAgICAgICAgICAgYmcgPSAnI0ZDRjJDRSc7XG5cbiAgICAgICAgICAgIH0gZWxzZSBpZiAocm93SW5kZXggPT0gMSAmJiBpc0FkZCkge1xuICAgICAgICAgICAgICBiZyA9ICcjREZFRkZGJztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIGlmIChyb3dJbmRleCAlIDIpIHtcbiAgICAgICAgICAgICAgICBiZyA9ICcjZjRmNGY0JztcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiZyA9ICcjZmZmJztcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZHJhd1JlY3Qob2MsIHdpZHRoLCBiZyk7XG5cbiAgICAgICAgICAgIGlmIChjZWxsSW5kZXggPT0gMSB8fCBjZWxsSW5kZXggPT0gMCkge1xuXG4gICAgICAgICAgICAgIGRyYXdMaW5lKG9jLCByb3dJbmRleCwgY2VsbEluZGV4LCAxMjAsIGhlaWdodCk7XG4gICAgICAgICAgICAgIGlmICgoY2VsbEluZGV4ID09IDEgJiYgcm93SW5kZXggPiAxKSB8fCAoIWlzQWRkICYmIGNlbGxJbmRleCA9PTEpICkge1xuICAgICAgICAgICAgICAgIGRyYXdGb250KG9jLCB3aWR0aCwgbnVtLCBzaWduLCB7Y29sb3I6ICcjZmYzOTM5J30pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRyYXdGb250KG9jLCB3aWR0aCwgIG51bSwgc2lnbik7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgZHJhd0xpbmUob2MsIHJvd0luZGV4LCBjZWxsSW5kZXgsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgICBkcmF3Rm9udChvYywgd2lkdGgsIG51bSwgc2lnbik7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgb0NhbnZhcy5zdHlsZS53aWR0aCA9IHdpblcgICsgJ3B4JztcbiAgICAgICAgICAgIG9DYW52YXMuc3R5bGUuaGVpZ2h0ID0gb2NIIC8gMiArICdweCc7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGRyYXdSZWN0KG9jLCB3aWR0aCwgc3R5bGUpe1xuICAgICAgICAgICAgICBpZiAoY2VsbEluZGV4ID09IDAgfHwgY2VsbEluZGV4ID09IDEpIHtcbiAgICAgICAgICAgICAgICB3aWR0aCA9IDEyMDtcblxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgb2MuYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICAgIG9jLmZpbGxTdHlsZSA9IHN0eWxlO1xuXG4gICAgICAgICAgICAgIGlmIChjZWxsSW5kZXggPiAxKSB7XG4gICAgICAgICAgICAgICAgb2MuZmlsbFJlY3QoY2VsbEluZGV4ICogd2lkdGggKyAoMTIwIC13aWR0aCkgKiAyICwgcm93SW5kZXggKiBjZWxsSCwgd2lkdGgsIGNlbGxIKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvYy5maWxsUmVjdChjZWxsSW5kZXggKiB3aWR0aCwgcm93SW5kZXggKiBjZWxsSCwgd2lkdGgsIGNlbGxIKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gZHJhd0FyYygpe1xuICAgICAgICAgICAgICBpZiAobnVtID09PSAwKSB7XG5cbiAgICAgICAgICAgICAgICBvYy5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgICAgICBvYy5maWxsU3R5bGUgPSBhcmNTdHlsZTtcblxuICAgICAgICAgICAgICAgIGlmIChjZWxsSW5kZXggPT0gMCkge1xuICAgICAgICAgICAgICAgICAgb2MuYXJjKGNlbGxJbmRleCAqIHdpZHRoICsgd2lkdGggLyAyLCByb3dJbmRleCAqIGhlaWdodCArIGhlaWdodCAvIDIsIGhlaWdodCAvIDIgLSAxMCwgMCwgTWF0aC5QSSAqIDIpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjZWxsSW5kZXggPT0gMSkge1xuICAgICAgICAgICAgICAgICAgb2MuYXJjKGNlbGxJbmRleCAqIHdpZHRoICsgd2lkdGggLyAyICsgKDEyMCAtd2lkdGgpLCByb3dJbmRleCAqIGhlaWdodCArIGhlaWdodCAvIDIsIGhlaWdodCAvIDIgLSAxMCwgMCwgTWF0aC5QSSAqIDIpO1xuXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgIG9jLmFyYyhjZWxsSW5kZXggKiB3aWR0aCArIHdpZHRoIC8gMiArICgxMjAgLXdpZHRoKSAqIDIsIHJvd0luZGV4ICogaGVpZ2h0ICsgaGVpZ2h0IC8gMiwgaGVpZ2h0IC8gMiAtIDEwLCAwLCBNYXRoLlBJICogMik7XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgb2MuZmlsbCgpO1xuXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIGRyYXdMaW5lKG9jLCByb3dJbmRleCwgY2VsbEluZGV4LCB3aWR0aCwgaGVpZ2h0KXtcblxuXG4gICAgICAgICAgICAgIG9jLmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICBvYy5saW5lV2lkdGggPSAxO1xuICAgICAgICAgICAgICBvYy5zdHJva2VTdHlsZSA9ICcjZGRkJztcbiAgICAgICAgICAgICAgaWYgKGNlbGxJbmRleCA9PSAwKXtcbiAgICAgICAgICAgICAgICBvYy5tb3ZlVG8oY2VsbEluZGV4ICogd2lkdGgsIHJvd0luZGV4KmhlaWdodCk7XG4gICAgICAgICAgICAgICAgb2MubGluZVRvKGNlbGxJbmRleCAqIHdpZHRoLCByb3dJbmRleCpoZWlnaHQgKyBoZWlnaHQpO1xuICAgICAgICAgICAgICAgIG9jLmxpbmVUbyhjZWxsSW5kZXggKiB3aWR0aCArIHdpZHRoLCByb3dJbmRleCpoZWlnaHQgKyBoZWlnaHQpO1xuXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoY2VsbEluZGV4ID09IDEpe1xuICAgICAgICAgICAgICAgIG9jLm1vdmVUbyhjZWxsSW5kZXggKiB3aWR0aCArICgxMjAgLXdpZHRoKSwgcm93SW5kZXgqaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBvYy5saW5lVG8oY2VsbEluZGV4ICogd2lkdGggKyAoMTIwIC13aWR0aCksIHJvd0luZGV4KmhlaWdodCArIGhlaWdodCk7XG4gICAgICAgICAgICAgICAgb2MubGluZVRvKGNlbGxJbmRleCAqIHdpZHRoICsgd2lkdGggKyAoMTIwIC13aWR0aCksIHJvd0luZGV4KmhlaWdodCArIGhlaWdodCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb2MubW92ZVRvKGNlbGxJbmRleCAqIHdpZHRoICsgKDEyMCAtd2lkdGgpICogMiwgcm93SW5kZXgqaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBvYy5saW5lVG8oY2VsbEluZGV4ICogd2lkdGggKyAoMTIwIC13aWR0aCkgKiAyLCByb3dJbmRleCpoZWlnaHQgKyBoZWlnaHQpO1xuICAgICAgICAgICAgICAgIG9jLmxpbmVUbyhjZWxsSW5kZXggKiB3aWR0aCArIHdpZHRoICsgKDEyMCAtd2lkdGgpICogMiwgcm93SW5kZXgqaGVpZ2h0ICsgaGVpZ2h0KTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIG9jLnN0cm9rZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvKlxuICAgICAgICAgICAgICogQHBhcmFtIG9jXG4gICAgICAgICAgICAgKiBAcGFyYW0gd2lkdGhcbiAgICAgICAgICAgICAqIEBwYXJhbSBudW1cbiAgICAgICAgICAgICAqIEBwYXJhbSBzdHlsZVxuICAgICAgICAgICAgICogQHBhcmFtIHNpZ24ge+WGmeWtl+eahOinhOWImX1cbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgZnVuY3Rpb24gZHJhd0ZvbnQob2MsIHdpZHRoLCBudW0sIHNpZ24sIHN0eWxlKXtcbiAgICAgICAgICAgICAgZHJhd0FyYygpO1xuICAgICAgICAgICAgICB2YXIgYmFzZVN0eWxlID0ge307XG5cbiAgICAgICAgICAgICAgaWYgKHN0eWxlKSB7XG4gICAgICAgICAgICAgICAgYmFzZVN0eWxlID0gc3R5bGU7XG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAobnVtID09IDApIHtcbiAgICAgICAgICAgICAgICBiYXNlU3R5bGUuY29sb3IgPSAnI2ZmZic7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmFzZVN0eWxlLmNvbG9yID0gJyM2NjYnO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIG9jLmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgICBpZiAobnVtID09PSAwKSB7XG4gICAgICAgICAgICAgICAgb2MuZmlsbFN0eWxlID0gYmFzZVN0eWxlLmNvbG9yO1xuICAgICAgICAgICAgICAgIG51bSA9IGNlbGxJbmRleCArICgoc2lnbiA9PSAnc3BhbicpID8gLTIgOiAoc2lnbiA9PSAnc3VtNCcpID8gMiA6IChzaWduID09ICdzdW0xMScpID8gOSA6IC0xKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvYy5maWxsU3R5bGUgPSBiYXNlU3R5bGUuY29sb3I7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBvYy5mb250ID0gXCIyNHB4IEFyaWFsXCI7XG5cbiAgICAgICAgICAgICAgb2MudGV4dEFsaWduID0gJ2NlbnRlcic7XG4gICAgICAgICAgICAgIG9jLnRleHRCYXNlbGluZSA9ICdtaWRkbGUnO1xuXG4gICAgICAgICAgICAgIGlmIChjZWxsSW5kZXggPT0gMCkge1xuICAgICAgICAgICAgICAgIG9jLmZpbGxUZXh0KG51bSwgNjAsIHJvd0luZGV4ICogaGVpZ2h0ICsgaGVpZ2h0IC8gMik7XG5cbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChjZWxsSW5kZXggPT0gMSkge1xuICAgICAgICAgICAgICAgIG9jLmZpbGxUZXh0KG51bSwgMTgwLCByb3dJbmRleCAqIGhlaWdodCArIGhlaWdodCAvIDIpO1xuXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgb2MuZmlsbFRleHQobnVtLCBjZWxsSW5kZXggKiB3aWR0aCArIHdpZHRoIC8gMiArICgxMjAgLSB3aWR0aCkgKiAyLCByb3dJbmRleCAqIGhlaWdodCArIGhlaWdodCAvIDIpO1xuXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1dKVxuICAuZGlyZWN0aXZlKCdzY3JvbGxMb2FkJywgWydib251c1RyZW5kU2VydmljZXMnLCAnJHJvb3RTY29wZScsIGZ1bmN0aW9uKGJvbnVzVHJlbmRTZXJ2aWNlcywgJHJvb3RTY29wZSkge1xuXG5cbiAgICByZXR1cm4ge1xuICAgICAgcmVzdHJpY3Q6ICdBRScsXG4gICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgIHRlbXBsYXRlOiAnPGRpdiBzdHlsZT1cIndpZHRoOiAxMDAlXCI+PGRpdiBjbGFzcz1cIm9mZi1saW5lXCIgbmctaWY9XCJpc09mZkxpbmVcIj7nvZHnu5zov57mjqXlpLHotKUs6K+35qOA5p+l572R57ucITwvZGl2PicgK1xuICAgICAgJzxkaXYgY2xhc3M9XCJsb2FkaW5nLXdyYXBcIiBuZy1pZj1cIiFpc09mZkxpbmVcIj48c3BhbiBjbGFzcz1cImxvYWRpbmdcIiBzdHlsZT1cIi13ZWJraXQtdHJhbnNmb3JtOiByb3RhdGUoMGRlZyk7XCI+PC9zcGFuPjwvZGl2PjwvZGl2PicsXG4gICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZSwgYXR0cnMpIHtcblxuICAgICAgICB2YXIgbG9hZGluZyA9IG51bGwsXG4gICAgICAgICAgYkJ0biA9IHRydWUsXG4gICAgICAgICAgc2Nyb2xsVCA9IDAsXG4gICAgICAgICAgd2luSCA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQsXG4gICAgICAgICAgZGlzdGFuY2UgPSBhdHRycy5kaXN0YW5jZSB8fCA0MDtcblxuICAgICAgICBpZiAoIWF0dHJzLm9uSW5maW5pdGUpIHJldHVybjtcblxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgd2luZG93Lm9uc2Nyb2xsID0gbG9hZGluZ0RhdGE7XG4gICAgICAgIH0sIDEwMDApXG5cbiAgICAgICAgZnVuY3Rpb24gbG9hZGluZ0RhdGEoKXtcbiAgICAgICAgICBzY3JvbGxUID0gZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcDtcblxuICAgICAgICAgIGxvYWRpbmcgPSBlbGVbMF0ucXVlcnlTZWxlY3RvcignLmxvYWRpbmctd3JhcCcpO1xuXG4gICAgICAgICAgaWYgKGJCdG4pIHtcbiAgICAgICAgICAgIGJCdG4gPSBmYWxzZTtcblxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgIGlmIChsb2FkaW5nICYmIHdpbkggLSBsb2FkaW5nLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCA+IGRpc3RhbmNlICkge1xuICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseShhdHRycy5vbkluZmluaXRlKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBiQnRuID0gdHJ1ZTtcbiAgICAgICAgICAgIH0sIDEwMClcbiAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgICAgICBpZiAoYXR0cnMuaXNTY3JvbGxMb2FkID09ICdmYWxzZScpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBsb2FkaW5nRGF0YSgpO1xuICAgICAgICAgIH0sIDEwMClcbiAgICAgICAgfVxuXG4gICAgICB9XG4gICAgfVxuICB9XSlcblxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL2NvbnRhaW5lcnMvYm9udXN0cmVuZC9ib251c0RpcmVjdGl2ZS5qc1wiLFwiLy4uL2NvbnRhaW5lcnMvYm9udXN0cmVuZFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBzZXJ2aWNlc01vZHVsZSA9IHJlcXVpcmUoJy4uLy4uL2pzL3NlcnZpY2VNb2R1bGUuanMnKTtcblxuLyoqXG4gKlxuICogMjAxNi0xMC0yMFxuICogQGF1dGggemhhbmdcbiAqIEB0ZWwgMTUyMTAwMDcxODVcbiAqIOWFpeWPo+acjeWKoVxuICovXG5cblxuc2VydmljZXNNb2R1bGUuZmFjdG9yeSgnYm9udXNUcmVuZFNlcnZpY2VzJywgWydsb3R0ZXJ5U2VydmljZXMnLCAnZ2xvYmFsU2VydmljZXMnLCAnJHN0YXRlUGFyYW1zJywgJyRyb290U2NvcGUnLCBmdW5jdGlvbihsb3R0ZXJ5U2VydmljZXMsIGdsb2JhbFNlcnZpY2VzLCAkc3RhdGVQYXJhbXMsICRyb290U2NvcGUpe1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIHJldHVybntcbiAgICAgICAgaXNzdWVEYXRhOiB7fSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOe8k+WtmOaVsOaNrlxuICAgICAgICAgKiBAcGFyYW0gc2lnbiB7U3RyaW5nfeaVsOaNrueahGtleVxuICAgICAgICAgKiBAcGFyYW0gZGF0YSB7QXJyYXl9IOaVsOe7hOaVsOaNrlxuICAgICAgICAgKiBAcGFyYW0gaXNDbGVhbiB7Qm9vbGVhbn0g5piv5ZCm5YWI5riF6Zmk5pWw5o2uXG4gICAgICAgICAqL1xuICAgICAgICBpc3N1ZURhdGFIYW5kbGU6IGZ1bmN0aW9uKHNpZ24sIGRhdGEsIGlzQ2xlYW4pe1xuXG4gICAgICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgICAgIC8vIOa4hemZpOaVsOaNrijph43mlrDnvJPlrZgpXG4gICAgICAgICAgICAgICAgaWYgKGlzQ2xlYW4pIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc3N1ZURhdGFbc2lnbl0gPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNBcnJheSh0aGlzLmlzc3VlRGF0YVtzaWduXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc3N1ZURhdGFbc2lnbl0gPSB0aGlzLmlzc3VlRGF0YVtzaWduXS5jb25jYXQoZGF0YSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc3N1ZURhdGFbc2lnbl0gPSBkYXRhO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmlzc3VlRGF0YVtzaWduXSB8fCBbXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuICAgICAgICBpc3N1ZToge30sXG4gICAgICAgIGlzc3VlSGFuZGxlOiBmdW5jdGlvbihzaWduLCBpc3N1ZSl7XG5cbiAgICAgICAgICAgIHRoaXMuaXNzdWVbc2lnbl0gPSBpc3N1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgYkJ0bjogdHJ1ZSxcbiAgICAgICAgYm9udXNJc3N1ZTogZnVuY3Rpb24oc2lnbiwgJHNjb3BlKXtcblxuICAgICAgICAgICAgdmFyIFRoaXMgPSB0aGlzLFxuICAgICAgICAgICAgICAgIHN0YXJ0SSA9IDA7XG5cbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihpbmRleCwgaXNSZWZlcnNoLCBmbil7XG5cblxuXG4gICAgICAgICAgICAgICAgaWYgKGlzUmVmZXJzaCkge1xuICAgICAgICAgICAgICAgICAgICBUaGlzLmlzc3VlSGFuZGxlKHNpZ24sICcnKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBnbG9iYWxTZXJ2aWNlcy5zZXJpYWxQb3N0KDQwMDEsICdudW1iZXInLCB7bG90dGVyeUNvZGU6ICRzdGF0ZVBhcmFtcy5pZCwgaXNzdWU6IChUaGlzLmlzc3VlW3NpZ25dIHx8ICcnKSwgcGFnZVNpemU6IDIwfSkudGhlbihmdW5jdGlvbihyZSl7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8g5pyJ5pWw5o2uXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZS5pc3N1ZUxpc3QubGVuZ3RoID4gMCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBUaGlzLmlzc3VlRGF0YUhhbmRsZShzaWduLCByZS5pc3N1ZUxpc3QsIGlzUmVmZXJzaCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIFRoaXMuaXNzdWVIYW5kbGUoc2lnbiwgZ2V0TGFzdElzc3VlKHJlLmlzc3VlTGlzdCkpXG5cblxuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8g5rKh5pyJ5pWw5o2u5oiW5pyA5ZCO5LiA6aG155qE5pe25YCZXG4gICAgICAgICAgICAgICAgICAgIGlmIChyZS5pc3N1ZUxpc3QubGVuZ3RoIDwgMjApe1xuICAgICAgICAgICAgICAgICAgICAgIGRhdGFIYW5kbGUocmUuaXNzdWVMaXN0LCAnbm90aGluZycpO1xuICAgICAgICAgICAgICAgICAgICAgIC8vZGF0YUhhbmRsZShUaGlzLmlzc3VlRGF0YVtzaWduXSwgJ25vdGhpbmcnKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICBkYXRhSGFuZGxlKHJlLmlzc3VlTGlzdCk7XG4gICAgICAgICAgICAgICAgICAgICAgLy9kYXRhSGFuZGxlKFRoaXMuaXNzdWVEYXRhW3NpZ25dKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIC8vJHNjb3BlLiRicm9hZGNhc3QoJ2RyYXdDaGFydCcsIFRoaXMuaXNzdWVEYXRhW3NpZ25dKTtcblxuICAgICAgICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAvKipcbiAgICAgICAgICAgKiDlpITnkIbkuIPkuZDlvanmlbDmja5cbiAgICAgICAgICAgKiBAcGFyYW0gZGF0YVxuICAgICAgICAgICAqL1xuICAgICAgICAgICAgZnVuY3Rpb24gY2hhbmdlRGF0YShkYXRhKXtcbiAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uKGlzc3VlKXtcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goWzEsMiwzXSwgZnVuY3Rpb24obnVtLCBpKXtcbiAgICAgICAgICAgICAgICAgIGlzc3VlLnlpTG91WydkZWYnICsgbnVtXSA9IGlzc3VlLnlpTG91LmRlZi5zbGljZShpKjEwLGkqMTArMTApO1xuICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICog5aSE55CG5Y2B5LiA6YCJ5LqU5pWw5o2uXG4gICAgICAgICAgICAgKiBAcGFyYW0gZGF0YVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBmdW5jdGlvbiBjaGFuZ2UxMTVEYXRhKGRhdGEpe1xuXG5cbiAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uKGlzc3VlKXtcblxuICAgICAgICAgICAgICAgIGlzc3VlLmlzc3VlID0gaXNzdWUuaXNzdWUuc2xpY2UoLTYpO1xuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChpc3N1ZS55aUxvdSwgZnVuY3Rpb24odmFsLCBrZXkpe1xuXG4gICAgICAgICAgICAgICAgICAvLyDlpoLmnpzmmK/liY3kuIlcbiAgICAgICAgICAgICAgICAgIGlmICgvdGhyZWVcXGQvLnRlc3Qoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWFuZ3VsYXIuaXNBcnJheShpc3N1ZS55aUxvdVsndGhyZWUnXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpc3N1ZS55aUxvdVsndGhyZWUnXSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlzc3VlLnlpTG91Wyd0aHJlZSddID0gaXNzdWUueWlMb3VbJ3RocmVlJ10uY29uY2F0KHZhbCk7XG4gICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgIC8vIOWmguaenOaYr+WJjeS6jFxuICAgICAgICAgICAgICAgICAgaWYgKC90d29cXGQvLnRlc3Qoa2V5KSkge1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghYW5ndWxhci5pc0FycmF5KGlzc3VlLnlpTG91Wyd0d28nXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICBpc3N1ZS55aUxvdVsndHdvJ10gPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpc3N1ZS55aUxvdVsndHdvJ10gPSBpc3N1ZS55aUxvdVsndHdvJ10uY29uY2F0KHZhbCk7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcblxuXG5cblxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gZGF0YUhhbmRsZShkYXRhLCBpc05vdGhpbmcpe1xuXG4gICAgICAgICAgICAgICAgLy8g5LiD5LmQ5b2p5pWw5o2u6YeN5p6EXG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5kZWZhdWx0LnNpZ25IQyA9PSAnN0xDJykge1xuICAgICAgICAgICAgICAgICAgY2hhbmdlRGF0YShkYXRhKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmRlZmF1bHQuc2lnbkhDID09ICcxMTUnKSB7XG4gICAgICAgICAgICAgICAgICBjaGFuZ2UxMTVEYXRhKGRhdGEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkc2NvcGUuaXNzdWVMaXN0ID0gZGF0YTtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmNoYXJ0ID0gJ2NoYXJ0JztcblxuICAgICAgICAgICAgICAgIC8vIOayoeacieaVsOaNruS6hlxuICAgICAgICAgICAgICAgIGlmIChpc05vdGhpbmcpIHtcbiAgICAgICAgICAgICAgICAgICRzY29wZS5pc01vcmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIGdldExhc3RJc3N1ZShpc3N1ZURhdGEpe1xuICAgICAgICAgICAgICAgIHJldHVybiBpc3N1ZURhdGEuc2xpY2UoLTEpWzBdLmlzc3VlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gaGFzSXNzdWUoaXNzdWVTdHIpe1xuICAgICAgICAgICAgICAgIHZhciBib29sID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goVGhpcy5pc3N1ZURhdGFbc2lnbl0sIGZ1bmN0aW9uKGlzc3VlLCBpbmRleCl7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzc3VlLmlzc3VlID09IGlzc3VlU3RyKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGJvb2wgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICByZXR1cm4gYm9vbDtcbiAgICAgICAgICAgIH1cblxuXG5cbiAgICAgICAgfSxcbiAgICAgICAgY2hhcnRTdW06IGZ1bmN0aW9uKGxvdHRlcnlDb2RlKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2xvYmFsU2VydmljZXMucG9zdCg0MDAxLCAnbnVtYmVyQ291bnQnLCB7bG90dGVyeUNvZGU6IGxvdHRlcnlDb2RlfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNoYXJ0S1NHcm91cDogZnVuY3Rpb24oJHN0YXRlUGFyYW1zLCAkc2NvcGUsIHNpZ24pe1xuXG4gICAgICAgICAgdmFyIFRoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgZ2xvYmFsU2VydmljZXMuc2VyaWFsUG9zdCg0MDAxLCAnazMnLCB7bG90dGVyeUNvZGU6ICRzdGF0ZVBhcmFtcy5pZH0pLnRoZW4oZnVuY3Rpb24ocmUpe1xuXG4gICAgICAgICAgICAvLyDmnInmlbDmja5cbiAgICAgICAgICAgIGlmIChyZS5kYXRhTGlzdC5sZW5ndGggPiAwKSB7XG5cbiAgICAgICAgICAgICAgJHNjb3BlLmdyb3VwRGF0YSA9IHJlLmRhdGFMaXN0O1xuICAgICAgICAgICAgICBUaGlzLmlzc3VlRGF0YUhhbmRsZShzaWduLCByZS5kYXRhTGlzdCwgdHJ1ZSk7XG4gICAgICAgICAgICAgICRyb290U2NvcGUuY2hhcnQgPSAnY2hhcnQnO1xuICAgICAgICAgICAgICAkc2NvcGUuaXNNb3JlR3JvdXAgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvLyDmoLnmja5sb3R0ZXJ5Q29kZSDlvpfliLDlvannp43lkI3np7BcbiAgICAgICAgZ2V0TG90dGVyeU5hbWU6IGZ1bmN0aW9uKGxvdHRlcnlDb2RlKXtcblxuICAgICAgICAgIHZhciBsb3R0ZXJ5TmFtZTtcblxuICAgICAgICAgIHN3aXRjaCAobG90dGVyeUNvZGUpIHtcblxuICAgICAgICAgICAgY2FzZSAnMDAxJzpcbiAgICAgICAgICAgICAgbG90dGVyeU5hbWUgPSAn5Y+M6Imy55CDJztcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICcwMDInOlxuICAgICAgICAgICAgICBsb3R0ZXJ5TmFtZSA9ICfnpo/lvakzRCc7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnMTEzJzpcbiAgICAgICAgICAgICAgbG90dGVyeU5hbWUgPSAn5aSn5LmQ6YCPJztcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICcxMDgnOlxuICAgICAgICAgICAgICBsb3R0ZXJ5TmFtZSA9ICfmjpLliJfkuIknO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJzEwOSc6XG4gICAgICAgICAgICAgIGxvdHRlcnlOYW1lID0gJ+aOkuWIl+S6lCc7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnMDA0JzpcbiAgICAgICAgICAgICAgbG90dGVyeU5hbWUgPSAn5LiD5LmQ5b2pJztcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICcxMTAnOlxuICAgICAgICAgICAgICBsb3R0ZXJ5TmFtZSA9ICfkuIPmmJ/lvaknO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJzAxMSc6XG4gICAgICAgICAgICAgIGxvdHRlcnlOYW1lID0gJ+axn+iLj+W/q+S4iSc7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnMDEwJzpcbiAgICAgICAgICAgICAgbG90dGVyeU5hbWUgPSAn5a6J5b695b+r5LiJJztcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICcwMTgnOlxuICAgICAgICAgICAgICBsb3R0ZXJ5TmFtZSA9ICfljJfkuqzlv6vkuIknO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIC8vIGRlZmF1bHQ6XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBsb3R0ZXJ5TmFtZTtcblxuICAgICAgICB9XG4gICAgfVxufV0pXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vY29udGFpbmVycy9ib251c3RyZW5kL2JvbnVzVHJlbmRTZXJ2aWNlcy5qc1wiLFwiLy4uL2NvbnRhaW5lcnMvYm9udXN0cmVuZFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBjb250cm9sbGVyTW9kdWxlID0gcmVxdWlyZSgnLi4vLi4vanMvY29udHJvbGxlck1vZHVsZS5qcycpO1xuXG4vKipcbiAqIOeul+WlllxuICogZGF0ZSAyMDE3LTEtNVxuICogYXV0aCB6aGFuZ1xuICogdGVsIDE1MjEwMDA3MTg1XG4gKi9cbmNvbnRyb2xsZXJNb2R1bGVcbiAgLmNvbnRyb2xsZXIoJ0NhbGN1bGF0ZUN0cmwnLCBbJyRzY29wZScsICdnbG9iYWxTZXJ2aWNlcycsICdjYWxjdWxhdGVTZXJ2aWNlcycsICckc3RhdGVQYXJhbXMnLCBmdW5jdGlvbigkc2NvcGUsIGdsb2JhbFNlcnZpY2VzLCBjYWxjdWxhdGVTZXJ2aWNlcywgJHN0YXRlUGFyYW1zKSB7XG4gICAgLy9XZWNoYXQuaXNJbnN0YWxsZWQoZnVuY3Rpb24gKGluc3RhbGxlZCkge1xuICAgIC8vICBhbGVydChcIldlY2hhdCBpbnN0YWxsZWQ6IFwiICsgKGluc3RhbGxlZCA/IFwiWWVzXCIgOiBcIk5vXCIpKTtcbiAgICAvL30sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAvLyAgYWxlcnQoXCJGYWlsZWQ6IFwiICsgcmVhc29uKTtcbiAgICAvL30pO1xuICAgICRzY29wZS5kZWZhdWx0ID0ge1xuICAgICAgaXNBZGRpdGlvbmFsOiBmYWxzZSxcbiAgICAgIGxvdHRlcnlOYW1lOiAnJyxcbiAgICAgIGxvdHRlcnlDb2RlOiAkc3RhdGVQYXJhbXMubG90dGVyeUNvZGUsXG4gICAgICBib251c051bWJlcjogW11cbiAgICB9XG4gICAgLy8g6YCJ5Y+36KeE5YiZXG4gICAgJHNjb3BlLnJlZEJhbGwgPSB7XG4gICAgICBudW1iZXI6IFtdLFxuICAgICAgYmFsbExlbjogJHN0YXRlUGFyYW1zLmxvdHRlcnlDb2RlID09ICcwMDEnID8gMzMgOiAzNSxcbiAgICAgIG1pblNpemU6ICRzdGF0ZVBhcmFtcy5sb3R0ZXJ5Q29kZSA9PSAnMDAxJyA/IDYgOiA1XG4gICAgfTtcbiAgICAkc2NvcGUuYmx1ZUJhbGwgPSB7XG4gICAgICBudW1iZXI6IFtdLFxuICAgICAgYmFsbExlbjogJHN0YXRlUGFyYW1zLmxvdHRlcnlDb2RlID09ICcwMDEnID8gMTYgOiAxMixcbiAgICAgIG1pblNpemU6ICRzdGF0ZVBhcmFtcy5sb3R0ZXJ5Q29kZSA9PSAnMDAxJyA/IDEgOiAyXG4gICAgfTtcbiAgICAvLyDmuIXnqbrpgInlj7dcbiAgICAkc2NvcGUuY2xlYW5CYWxsID0gZnVuY3Rpb24oKXtcbiAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdjbGVhbkJhbGwnKTtcbiAgICB9XG5cbiAgICAvLyDojrflj5bmnIDov5HljYHmrKHlvIDlpZbkv6Hmga9cbiAgICBjYWxjdWxhdGVTZXJ2aWNlcy5nZXRMYXN0SXNzdWUoJHNjb3BlKTtcblxuXG4gICAgJHNjb3BlLmNhbGN1bGF0ZUhhbmRsZSA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgIGlmICgkc2NvcGUucmVkQmFsbC5udW1iZXIubGVuZ3RoIDwgJHNjb3BlLnJlZEJhbGwubWluU2l6ZSkge1xuICAgICAgICBnbG9iYWxTZXJ2aWNlcy5lcnJvclByb21wdCgn57qi55CD5pyA5bCR6YCJ5oupJyArICRzY29wZS5yZWRCYWxsLm1pblNpemUpO1xuICAgICAgfSBlbHNlIGlmICgkc2NvcGUuYmx1ZUJhbGwubnVtYmVyLmxlbmd0aCA8ICRzY29wZS5ibHVlQmFsbC5taW5TaXplKSB7XG4gICAgICAgIGdsb2JhbFNlcnZpY2VzLmVycm9yUHJvbXB0KCfok53nkIPmnIDlsJHpgInmi6knICsgJHNjb3BlLmJsdWVCYWxsLm1pblNpemUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG51bWJlciA9ICRzY29wZS5yZWRCYWxsLm51bWJlci5qb2luKCcsJykgKyAnIycgKyAkc2NvcGUuYmx1ZUJhbGwubnVtYmVyLmpvaW4oJywnKTtcbiAgICAgICAgY2FsY3VsYXRlU2VydmljZXMuY2FsY3VsYXRlSGFuZGxlKHtsb3R0ZXJ5Q29kZTogJHNjb3BlLmRlZmF1bHQubG90dGVyeUNvZGUsIGlzc3VlOiAkc2NvcGUuaXNzdWUsIHBsYXlDb2RlOiAkc2NvcGUuZGVmYXVsdC5pc0FkZGl0aW9uYWwgPyAnMDInIDogJzAxJywgbnVtYnJlcjogbnVtYmVyfSk7XG4gICAgICB9XG5cbiAgICB9XG4gICAgJHNjb3BlLnNoYXJlID0gZnVuY3Rpb24oKXtcbiAgICAgIFdlY2hhdC5zaGFyZSh7XG4gICAgICAgIG1lc3NhZ2U6IHtcbiAgICAgICAgICB0aXRsZTogXCJIaSwgdGhlcmVcIixcbiAgICAgICAgICBkZXNjcmlwdGlvbjogXCJUaGlzIGlzIGRlc2NyaXB0aW9uLlwiLFxuICAgICAgICAgIHRodW1iOiBcInd3dy9pbWcvdGh1bWJuYWlsLnBuZ1wiLFxuICAgICAgICAgIG1lZGlhOiB7XG4gICAgICAgICAgICB0eXBlOiBXZWNoYXQuVHlwZS5MSU5LLFxuICAgICAgICAgICAgd2VicGFnZVVybDogXCJodHRwOi8vdGVjaC5xcS5jb20vXCJcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHNjZW5lOiBXZWNoYXQuU2NlbmUuVElNRUxJTkUgICAvLyBzaGFyZSB0byBUaW1lbGluZVxuICAgICAgfSwgZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIGFsZXJ0KFwiU3VjY2Vzc1wiKTtcbiAgICAgIH0sIGZ1bmN0aW9uIChyZWFzb24pIHtcbiAgICAgICAgYWxlcnQoXCJGYWlsZWQ6IFwiICsgcmVhc29uKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgfV0pXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vY29udGFpbmVycy9jYWxjdWxhdGUvQ2FsY3VsYXRlQ3RybC5qc1wiLFwiLy4uL2NvbnRhaW5lcnMvY2FsY3VsYXRlXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIHNlcnZpY2VzTW9kdWxlID0gcmVxdWlyZSgnLi4vLi4vanMvc2VydmljZU1vZHVsZS5qcycpO1xuXG4vKipcbiAqXG4gKiAyMDE3LTEtMTFcbiAqIEBhdXRoIHpoYW5nXG4gKiBAdGVsIDE1MjEwMDA3MTg1XG4gKiDorqHnrpflpZbph5HmnI3liqFcbiAqL1xuXG5cbnNlcnZpY2VzTW9kdWxlLmZhY3RvcnkoJ2NhbGN1bGF0ZVNlcnZpY2VzJywgWydsb3R0ZXJ5U2VydmljZXMnLCAnZ2xvYmFsU2VydmljZXMnLCAnJHJvb3RTY29wZScsIGZ1bmN0aW9uKGxvdHRlcnlTZXJ2aWNlcywgZ2xvYmFsU2VydmljZXMsICRyb290U2NvcGUpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG4gIHJldHVybiB7XG4gICAgZ2V0TGFzdElzc3VlOiBmdW5jdGlvbigkc2NvcGUpe1xuICAgICAgZ2xvYmFsU2VydmljZXMucG9zdCg0MDAwLCAnbGlzdCcsIHtsb3R0ZXJ5Q29kZTogJHNjb3BlLmRlZmF1bHQubG90dGVyeUNvZGUsIHBhZ2U6IDF9KS50aGVuKGZ1bmN0aW9uKHJlKXtcblxuICAgICAgICBpZiAoYW5ndWxhci5pc0FycmF5KHJlLmlzc3VlTGlzdCkpIHtcbiAgICAgICAgICBsb3R0ZXJ5U2VydmljZXMuc2VyaWFsaXplTG90dGVyeShyZS5pc3N1ZUxpc3QpO1xuICAgICAgICAgICRzY29wZS5sYXN0SXNzdWUgPSByZS5pc3N1ZUxpc3Q7XG5cbiAgICAgICAgICAkc2NvcGUuZGVmYXVsdC5sb3R0ZXJ5TmFtZSA9IHJlLmlzc3VlTGlzdFswXS5sb3R0ZXJ5TmFtZTtcbiAgICAgICAgICAkc2NvcGUuZGVmYXVsdC5ib251c051bWJlciA9IHJlLmlzc3VlTGlzdFswXS5ib251c051bWJlcjtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSxcbiAgICBjYWxjdWxhdGVIYW5kbGU6IGZ1bmN0aW9uKGFyZyl7XG5cbiAgICAgIC8vIHBsYXlDb2RlIDAxID0+IOWNleW8jyAwMiA9PiDlpI3lvI9cbiAgICAgIGdsb2JhbFNlcnZpY2VzLnNlcmlhbFBvc3QoNDAwMCwgJ2NhbGMnLCBhcmcpLnRoZW4oZnVuY3Rpb24ocmUpe1xuXG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1dKVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL2NvbnRhaW5lcnMvY2FsY3VsYXRlL2NhbGN1bGF0ZVNlcnZpY2VzLmpzXCIsXCIvLi4vY29udGFpbmVycy9jYWxjdWxhdGVcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgY29udHJvbGxlck1vZHVsZSA9IHJlcXVpcmUoJy4uLy4uL2pzL2NvbnRyb2xsZXJNb2R1bGUuanMnKTtcblxuLyoqXG4gKiBkYXRlIDIwMTYtMTAtMTJcbiAqIGF1dGggemhhbmdcbiAqIHRlbCAxNTIxMDAwNzE4NVxuICovXG4vLyDlhYXlgLxcbmNvbnRyb2xsZXJNb2R1bGUuY29udHJvbGxlcignUmVjaGFyZ2VDdHJsJywgWyckc2NvcGUnLCAnZ2xvYmFsU2VydmljZXMnLCBmdW5jdGlvbigkc2NvcGUsIGdsb2JhbFNlcnZpY2VzKSB7XG4gICAgJHNjb3BlLmlucHV0RGF0YSA9IHtcbiAgICAgICAgYW1vdW50OiAxMDAwMCxcbiAgICAgICAgcmVjaGFyZ2VUeXBlOiAnYWxpcGF5V2FwJ1xuXG4gICAgfVxuXG4gICAgLy8g6YCJ5oup5YWF5YC86YeR6aKdXG4gICAgJHNjb3BlLnNlbGVjdGFtb3VudEhhbmRsZSA9IGZ1bmN0aW9uKGFtb3VudCl7XG4gICAgICAgICRzY29wZS5pbnB1dERhdGEuYW1vdW50ID0gIGFtb3VudDtcbiAgICB9XG5cbiAgICAvLyDpgInmi6nlhYXlgLzmlrnlvI9cbiAgICAkc2NvcGUuc2VsZWN0UmVjaGFyZ2VUeXBlSGFuZGxlID0gZnVuY3Rpb24odHlwZSl7XG4gICAgICAgICRzY29wZS5pbnB1dERhdGEucmVjaGFyZ2VUeXBlID0gIHR5cGU7XG4gICAgfVxuXG4gICAgLy8g5o+Q5Lqk5YWF5YC86K+35rGCXG4gICAgJHNjb3BlLnJlY2hhcmdlU3ViID0gZnVuY3Rpb24oKXtcblxuXG5cbiAgICAgICAgZ2xvYmFsU2VydmljZXMuc2VyaWFsUG9zdCgnMzIwMScsICRzY29wZS5pbnB1dERhdGEucmVjaGFyZ2VUeXBlLCB7YW1vdW50OiAkc2NvcGUuaW5wdXREYXRhLmFtb3VudC8xMDAsIG1jb2luOiAkc2NvcGUuaW5wdXREYXRhLmFtb3VudH0pLnRoZW4oZnVuY3Rpb24ocmUpe1xuXG4gICAgICAgICAvLy8gcmUgPSB7cnF1ZXN0VXJsOiAnaHR0cDovLzExNS4yOC4xODYuMTI3OjgwODAveWJfYWxpd2FwX3BheS9ZYl9BbGl3YXBQYXlfU2VydmxldCcsIGJvZHk6ICdmZGYnfTtcblxuICAgICAgICAgIHZhciByZXN1bHQgPSAnJyxcbiAgICAgICAgICAgIHVybCA9ICcnO1xuXG4gICAgICAgICAgaWYgKCRzY29wZS5pbnB1dERhdGEucmVjaGFyZ2VUeXBlID09ICdsbGZXYXAnKSB7XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gocmUsIGZ1bmN0aW9uKHZhbCwga2V5KXtcbiAgICAgICAgICAgICAgcmVzdWx0ICs9IGtleSAgKyAnPScgKyB2YWwgKyAnJic7XG5cbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgIHVybCA9ICdodHRwOi8vaDUuaWNhaW1pLmNvbS9yZWNoYXJnZS5odG1sPycgKyByZXN1bHQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHVybCA9IHJlLnJlcXVlc3RVcmw7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHdpbmRvdy5jb3Jkb3ZhICYmIGNvcmRvdmEuSW5BcHBCcm93c2VyKSB7XG4gICAgICAgICAgICB2YXIgcmVmID0gd2luZG93Lm9wZW4oZW5jb2RlVVJJKHVybCksICdfc3lzdGVtJywgJ2xvY2F0aW9uPXllcycpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gdXJsO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG5cbn1dKVxuXG4gICAgLy8g5LyY5oOg5Yi4XG4gICAgLmNvbnRyb2xsZXIoJ0NvdXBvbkN0cmwnLCBbJyRzY29wZScsICdjYXBpdGFsU2VydmljZXMnLCBmdW5jdGlvbigkc2NvcGUsIGNhcGl0YWxTZXJ2aWNlcykge1xuXG5cbiAgICAvLyDpu5jorqR0YWLmmL7npLrnmoRcbiAgICAkc2NvcGUuZGVmYXVsdD0ge1xuICAgICAgICBpbmRleDogMFxuICAgIH07XG5cbiAgICB2YXIgbm9Vc2UgPSAkc2NvcGUubm9Vc2UgPSAge1xuICAgICAgICBwYWdlOiAwLFxuICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgaXNNb3JlOiB0cnVlLFxuICAgICAgICBzdGF0dXM6IDAsXG4gICAgICAgIGluZGV4OiAwXG4gICAgfTtcblxuICAgIHZhciB1c2VkID0gJHNjb3BlLnVzZWQgPSAge1xuICAgICAgICBwYWdlOiAwLFxuICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgaXNNb3JlOiB0cnVlLFxuICAgICAgICBzdGF0dXM6IDIsXG4gICAgICAgIGluZGV4OiAxLFxuICAgIH07XG5cbiAgICB2YXIgb3ZlcmR1ZSA9ICRzY29wZS5vdmVyZHVlID0gIHtcbiAgICAgICAgcGFnZTogMCxcbiAgICAgICAgZGF0YTogW10sXG4gICAgICAgIGlzTW9yZTogdHJ1ZSxcbiAgICAgICAgc3RhdHVzOiAzLFxuICAgICAgICBpbmRleDogMlxuICAgIH07XG5cbiAgICAvLy8vIOWKoOi9veaVsOaNruW3suS9v+eUqFxuICAgICRzY29wZS5sb2FkTm9Vc2UgPSBmdW5jdGlvbihwYWdlLCBmbil7XG4gICAgICAgIGNhcGl0YWxTZXJ2aWNlcy5nZXRDb3Vwb24oJHNjb3BlLCAnbm9Vc2UnLCBwYWdlLCBmbik7XG5cbiAgICB9XG5cbiAgICAvLyDkuIvmi4nliLfmlrDmnKrkvb/nlKhcbiAgICAkc2NvcGUuZG9SZWZyZXNoTm9Vc2UgPSBmdW5jdGlvbigpe1xuICAgICAgICAkc2NvcGUubG9hZE5vVXNlKDEsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgncmVmcmVzaENvbXBsZXRlJyk7XG4gICAgICAgIH0pXG4gICAgfVxuXG4gICAgLy8vLyDliqDovb3mlbDmja7lt7Lkvb/nlKhcbiAgICAkc2NvcGUubG9hZFVzZWQgPSBmdW5jdGlvbihwYWdlLCBmbil7XG4gICAgICAgIGNhcGl0YWxTZXJ2aWNlcy5nZXRDb3Vwb24oJHNjb3BlLCAndXNlZCcsIHBhZ2UsIGZuKTtcbiAgICB9XG5cbiAgICAvLyDkuIvmi4nliLfmlrDlt7Lkvb/nlKhcbiAgICAkc2NvcGUuZG9SZWZyZXNoVXNlZCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5sb2FkVXNlZCgxLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3JlZnJlc2hDb21wbGV0ZScpO1xuICAgICAgICB9KVxuXG4gICAgfVxuXG4gICAgLy8vLyDliqDovb3mlbDmja7lt7Lov4fmnJ9cbiAgICAkc2NvcGUubG9hZE92ZXJkdWUgPSBmdW5jdGlvbihwYWdlLCBmbil7XG4gICAgICAgIGNhcGl0YWxTZXJ2aWNlcy5nZXRDb3Vwb24oJHNjb3BlLCAnb3ZlcmR1ZScsIHBhZ2UsIGZuKTtcbiAgICB9XG5cbiAgICAvLyDkuIvmi4nliLfmlrDlt7Lkvb/nlKhcbiAgICAkc2NvcGUuZG9SZWZyZXNoT3ZlcmR1ZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5sb2FkT3ZlcmR1ZSgxLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3JlZnJlc2hDb21wbGV0ZScpO1xuICAgICAgICB9KVxuXG4gICAgfVxuXG4gICAgLy8g55uR5ZCsZGVmYXVsdC5pbmRleOWPmOWMllxuICAgICRzY29wZS4kd2F0Y2goJ2RlZmF1bHQuaW5kZXgnLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCl7XG5cbiAgICAgICAgLy8g5rKh5pyJ5Y+Y5YyWKOesrOS4gOasoei/m+WFpemhtemdouetiS4uLilcbiAgICAgICAgaWYgKG5ld1ZhbCA9PSBvbGRWYWwpIHJldHVybjtcblxuICAgICAgICBzd2l0Y2ggKG5ld1ZhbCkge1xuICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgIGlmICghbm9Vc2UucGFnZSkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubG9hZE5vVXNlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgIGlmICghdXNlZC5wYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sb2FkVXNlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgICBpZiAoIW92ZXJkdWUucGFnZSkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUubG9hZE92ZXJkdWUoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9KVxuXG59XSlcbiAgICAvLyDotKbmiLfkvZnpop1cbiAgICAuY29udHJvbGxlcignQmFsYW5jZUN0cmwnLCBbJyRzY29wZScsICdnbG9iYWxTZXJ2aWNlcycsICdjYXBpdGFsU2VydmljZXMnLCBmdW5jdGlvbigkc2NvcGUsIGdsb2JhbFNlcnZpY2VzLCBjYXBpdGFsU2VydmljZXMpIHtcbiAgICAgICAgJHNjb3BlLm1jb2luID0gIGdsb2JhbFNlcnZpY2VzLnVzZXJCYXNlTXNnLm1jb2luIHx8IDA7XG4gICAgICAgICRzY29wZS5kZWZhdWx0ID0ge1xuICAgICAgICAgICAgaW5kZXg6IDBcbiAgICAgICAgfVxuXG4gICAgICAgIC8vICDlhajpg6hcbiAgICAgICAgdmFyIGFsbCA9ICRzY29wZS5hbGwgPSAge1xuICAgICAgICAgICAgcGFnZTogMCxcbiAgICAgICAgICAgIGRhdGE6IFtdLFxuICAgICAgICAgICAgaXNNb3JlOiB0cnVlLFxuICAgICAgICAgICAgc3RhdHVzOiAwLFxuICAgICAgICAgICAgZnVuYzogJ21jb2luJyxcbiAgICAgICAgICAgIGNtZDogJzMyMDAnLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vICDlhYXlgLxcbiAgICAgICAgdmFyIHJlY2hhcmdlID0gJHNjb3BlLnJlY2hhcmdlID0gIHtcbiAgICAgICAgICAgIHBhZ2U6IDAsXG4gICAgICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgICAgIGlzTW9yZTogdHJ1ZSxcbiAgICAgICAgICAgIHN0YXR1czogMSxcbiAgICAgICAgICAgIGZ1bmM6ICdsaXN0JyxcbiAgICAgICAgICAgIGNtZDogJzMyMDEnLFxuICAgICAgICB9O1xuXG5cbiAgICAgICAgLy8g5Yqg6L295pWw5o2u5YWo6YOoXG4gICAgICAgICRzY29wZS5sb2FkQWxsID0gZnVuY3Rpb24ocGFnZSwgZm4pe1xuXG4gICAgICAgICAgICBjYXBpdGFsU2VydmljZXMuZ2V0Q2FwaXRhbENoYW5nZUxpc3QoJHNjb3BlLCAkc2NvcGUuYWxsLCBwYWdlLCBmbik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDkuIvmi4nliLfmlrDlhajpg6hcbiAgICAgICAgJHNjb3BlLmRvUmVmcmVzaEFsbCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAkc2NvcGUubG9hZEFsbCgxLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdyZWZyZXNoQ29tcGxldGUnKTtcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgfVxuICAgICAgICAvLyDliqDovb3mlbDmja7lhYXlgLzorrDlvZVcbiAgICAgICAgJHNjb3BlLmxvYWRSZWNoYXJnZSA9IGZ1bmN0aW9uKHBhZ2UsIGZuKXtcblxuICAgICAgICAgICAgLy8g5Yqg6L295pWw5o2u5Zue6LCD5Ye95pWwXG4gICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgICAgLy8g57yT5a2Y5YWF5YC85YiX6KGoXG4gICAgICAgICAgICAgICAgY2FwaXRhbFNlcnZpY2VzLnJlY2hhcmdlTGlzdEhhbmRsZSgkc2NvcGUucmVjaGFyZ2UuZGF0YSk7XG5cbiAgICAgICAgICAgICAgICBpZiAoZm4pIGZuKCk7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhcGl0YWxTZXJ2aWNlcy5nZXRDYXBpdGFsQ2hhbmdlTGlzdCgkc2NvcGUsICRzY29wZS5yZWNoYXJnZSwgIHBhZ2UsIGNhbGxiYWNrKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIOS4i+aLieWIt+aWsOWFheWAvOiusOW9lVxuICAgICAgICAkc2NvcGUuZG9SZWZyZXNoUmVjaGFyZ2UgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgJHNjb3BlLmxvYWRSZWNoYXJnZSgxLCBmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3JlZnJlc2hDb21wbGV0ZScpO1xuICAgICAgICAgICAgfSlcblxuICAgICAgICB9XG5cbiAgICAgICAgLy8g55uR5ZCsZGVmYXVsdC5pbmRleOWPmOWMllxuICAgICAgICAkc2NvcGUuJHdhdGNoKCdkZWZhdWx0LmluZGV4JywgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpe1xuXG4gICAgICAgICAgICAvLyDmsqHmnInlj5jljJYo56ys5LiA5qyh6L+b5YWl6aG16Z2i562JLi4uKVxuICAgICAgICAgICAgaWYgKG5ld1ZhbCA9PSBvbGRWYWwpIHJldHVybjtcblxuICAgICAgICAgICAgc3dpdGNoIChuZXdWYWwpIHtcbiAgICAgICAgICAgICAgICBjYXNlIDA6XG4gICAgICAgICAgICAgICAgICAgIGlmICghYWxsLnBhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5kb1JlZnJlc2hBbGwoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgIGlmICghcmVjaGFyZ2UucGFnZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRvUmVmcmVzaFJlY2hhcmdlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgLy9kZWZhdWx0OlxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1dKVxuICAgIC8v5YWF5YC86K+m5oOFXG4gICAgLmNvbnRyb2xsZXIoJ1JlY2hhcmdlRGV0YWlsQ3RybCcsIFsnJHNjb3BlJywgJ2NhcGl0YWxTZXJ2aWNlcycsICdnbG9iYWxTZXJ2aWNlcycsICckc3RhdGVQYXJhbXMnLCBmdW5jdGlvbigkc2NvcGUsIGNhcGl0YWxTZXJ2aWNlcywgZ2xvYmFsU2VydmljZXMsICRzdGF0ZVBhcmFtcyl7XG5cbiAgICAgICAgJHNjb3BlLnJlY2hhcmdlRGF0YSA9IGNhcGl0YWxTZXJ2aWNlcy5yZWNoYXJnZUxpc3RIYW5kbGUoJHN0YXRlUGFyYW1zLmlkKTtcblxuICAgICAgICAkc2NvcGUubWNvaW4gPSBnbG9iYWxTZXJ2aWNlcy51c2VyQmFzZU1zZy5tY29pbjtcblxuICAgIH1dKVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL2NvbnRhaW5lcnMvY2FwaXRhbC9DYXBpdGFsQ29udHJvbGxlci5qc1wiLFwiLy4uL2NvbnRhaW5lcnMvY2FwaXRhbFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBzZXJ2aWNlTW9kdWxlID0gcmVxdWlyZSgnLi4vLi4vanMvc2VydmljZU1vZHVsZS5qcycpO1xuXG5zZXJ2aWNlTW9kdWxlLmZhY3RvcnkoJ2NhcGl0YWxTZXJ2aWNlcycsIFsnZ2xvYmFsU2VydmljZXMnLCBmdW5jdGlvbihnbG9iYWxTZXJ2aWNlcyl7XG5cbiAgICByZXR1cm4ge1xuXG4gICAgICAgIC8vIOWFheWAvOiusOW9leWIl+ihqFxuICAgICAgICByZWNoYXJnZUxpc3Q6IFtdLFxuXG4gICAgICAgIC8vIOWkhOeQhuWFheWAvOWIl+ihqFxuICAgICAgICByZWNoYXJnZUxpc3RIYW5kbGU6IGZ1bmN0aW9uKHBhcmFtKXtcblxuICAgICAgICAgICAgdmFyIHJlc3VsdDtcblxuICAgICAgICAgICAgLy8g5piv5pWw5o2uXG4gICAgICAgICAgICAgaWYgKGFuZ3VsYXIuaXNBcnJheShwYXJhbSkpIHtcbiAgICAgICAgICAgICAgICAgdGhpcy5yZWNoYXJnZUxpc3QgPSBwYXJhbTtcbiAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2godGhpcy5yZWNoYXJnZUxpc3QsIGZ1bmN0aW9uKHJlY2hhcmdlLCBpbmRleCl7XG5cbiAgICAgICAgICAgICAgICAgICAgIGlmIChyZWNoYXJnZS5vcmRlcklkID09IHBhcmFtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVjaGFyZ2U7XG4gICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcblxuICAgICAgICB9LFxuICAgICAgICAvKlxuICAgICAgICAgKiBAcGFyYW0gc2NvcGUge09iamVjdH0gc2NvcGXlr7nosaFcbiAgICAgICAgICogQHRhYk9iaiB7T2JqZWN0fSDlvZPliY3kvKDpgJLov4fmnaXnmoTmlbDmja5cbiAgICAgICAgICogQHBhZ2Uge1N0cmluZ30g5oyH5a6a5Yqg6L2955qE6aG156CBXG4gICAgICAgICAqIEBmbiB7RnVuY3Rpb259IOWbnuiwg+WHveaVsFxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0Q291cG9uOiBmdW5jdGlvbihzY29wZSwga2V5LCBwYWdlLCBmbil7XG5cbiAgICAgICAgICAgIC8vIOWmguaenOS4jeaYr+W9k+WJjeaYvuekuueahOWwsei/lOWbnlxuICAgICAgICAgICAgaWYgKHNjb3BlLmRlZmF1bHQuaW5kZXggIT0gc2NvcGVba2V5XS5pbmRleCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBpZiAocGFnZSkge1xuICAgICAgICAgICAgICAgIHNjb3BlW2tleV0ucGFnZSA9IHBhZ2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNjb3BlW2tleV0ucGFnZSArPSAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBnbG9iYWxTZXJ2aWNlcy5zZXJpYWxQb3N0KCczMjAyJywgJ2xpc3QnLCB7cGFnZTogc2NvcGVba2V5XS5wYWdlLCBzdGF0dXM6IHNjb3BlW2tleV0uc3RhdHVzfSkudGhlbihmdW5jdGlvbihyZSl7XG5cbiAgICAgICAgICAgICAgICAvLyDmsqHmnInov5Tlm57mlbDmja5cbiAgICAgICAgICAgICAgICBpZiAocmUuY291cG9uTGlzdC5sZW5ndGggPCAxMCkge1xuICAgICAgICAgICAgICAgICAgICBzY29wZVtrZXldLmlzTW9yZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzY29wZS4kYnJvYWRjYXN0KCdzY3JvbGwuaW5maW5pdGVTY3JvbGxDb21wbGV0ZScpO1xuICAgICAgICAgICAgICAgIC8vIOesrOS4gOmhtVxuICAgICAgICAgICAgICAgIGlmIChzY29wZVtrZXldLnBhZ2UgPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICBzY29wZVtrZXldLmRhdGEgPSByZS5jb3Vwb25MaXN0O1xuICAgICAgICAgICAgICAgICAgICAvLyDkuIvmi4nliLfmlrDml7bmmL7npLrml6Dnur/liqDovb1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlLmNvdXBvbkxpc3QubGVuZ3RoID09IDEwKSBzY29wZVtrZXldLmlzTW9yZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGVba2V5XS5kYXRhID0gc2NvcGVba2V5XS5kYXRhLmNvbmNhdChyZS5jb3Vwb25MaXN0KTtcblxuICAgICAgICAgICAgICAgIH1cblxuXG5cbiAgICAgICAgICAgICAgICBpZiAoZm4pIGZuKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIHNjb3BlIHtPYmplY3R9IOS8oOmAkueahHNjb3Bl5a+56LGhXG4gICAgICAgICAqIEBwYXJhbSB0YWJPYmoge09iamVjdH0g5b2T5YmNdGFi5Lyg6YCS55qE5a+56LGhXG4gICAgICAgICAqIEBwYXJhbSBmdW5jIHtTdHJpbmd9IOivt+axgueahOWcsOWdgFxuICAgICAgICAgKiBAcGFyYW0gcGFnZSB7U3RyaW5nfSDor7fmsYLnmoTpobXnoIFcbiAgICAgICAgICogQHBhcmFtIGZuIHtGdW5jdGlvbn0g5Zue6LCD5Ye95pWwXG4gICAgICAgICAqL1xuICAgICAgICBnZXRDYXBpdGFsQ2hhbmdlTGlzdDogZnVuY3Rpb24oc2NvcGUsIHRhYk9iaiwgcGFnZSwgZm4pe1xuXG4gICAgICAgICAgICAvLyDlpoLmnpzkuI3mmK/lvZPliY3mmL7npLrnmoTlsLHov5Tlm55cbiAgICAgICAgICAgIGlmIChzY29wZS5kZWZhdWx0LmluZGV4ICE9IHRhYk9iai5zdGF0dXMpIHJldHVybjtcblxuICAgICAgICAgICAgaWYgKHBhZ2UpIHtcbiAgICAgICAgICAgICAgICB0YWJPYmoucGFnZSA9IHBhZ2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRhYk9iai5wYWdlICs9IDE7XG4gICAgICAgICAgICB9XG5cblxuXG4gICAgICAgICAgICBnbG9iYWxTZXJ2aWNlcy5zZXJpYWxQb3N0KHRhYk9iai5jbWQsIHRhYk9iai5mdW5jLCB7cGFnZTogdGFiT2JqLnBhZ2V9KS50aGVuKGZ1bmN0aW9uKHJlKXtcblxuICAgICAgICAgICAgICAgIHZhciByZXN1bHREYXRhID0gcmUuZmlsbExpc3QgfHwgcmUuYWNjb3VudExvZ0xpc3Q7XG5cbiAgICAgICAgICAgICAgICAvLyDmsqHmnInov5Tlm57mlbDmja5cbiAgICAgICAgICAgICAgICBpZiAocmVzdWx0RGF0YS5sZW5ndGggPCAxMCkge1xuICAgICAgICAgICAgICAgICAgICB0YWJPYmouaXNNb3JlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOesrOS4gOmhtVxuICAgICAgICAgICAgICAgIGlmICh0YWJPYmoucGFnZSA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhYk9iai5kYXRhID0gcmVzdWx0RGF0YTtcblxuICAgICAgICAgICAgICAgICAgICAvLyDkuIvmi4nliLfmlrDml7bmmL7npLrml6Dnur/liqDovb1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdERhdGEubGVuZ3RoID09IDEwKSB0YWJPYmouaXNNb3JlID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRhYk9iai5kYXRhID0gdGFiT2JqLmRhdGEuY29uY2F0KHJlc3VsdERhdGEpO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNjb3BlLiRicm9hZGNhc3QoJ3Njcm9sbC5pbmZpbml0ZVNjcm9sbENvbXBsZXRlJyk7XG5cblxuICAgICAgICAgICAgICAgIGlmIChmbikgZm4oKTtcblxuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cbn1dKVxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9jb250YWluZXJzL2NhcGl0YWwvY2FwaXRhbFNlcnZpY2VzLmpzXCIsXCIvLi4vY29udGFpbmVycy9jYXBpdGFsXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGRpcmVjdGl2ZU1vZHVsZSA9IHJlcXVpcmUoJy4uLy4uL2pzL2RpcmVjdGl2ZU1vZHVsZS5qcycpO1xuXG4vLyDlr4bnoIHovpPlhaXmoYZcbmRpcmVjdGl2ZU1vZHVsZS5kaXJlY3RpdmUoJ215SW5wdXQnLCBmdW5jdGlvbigpe1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgdmFsdWU6ICc9JyxcbiAgICAgICAgICAgIGVhc3lTdHlsZTogJ0AnXG4gICAgICAgIH0sXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBzdHlsZT1cIi13ZWJraXQtYm94LWZsZXg6IDE7IC13ZWJraXQtZmxleDogMTsgZmxleDoxOyBkaXNwbGF5OiAtd2Via2l0LWJveDsgLXdlYmtpdC1ib3gtYWxpZ246IGNlbnRlclwiPicgK1xuICAgICAgICAnPGRpdiBuZy10cmFuc2NsdWRlIHN0eWxlPVwiYm94LWZsZXg6IDE7IC13ZWJraXQtYm94LWZsZXg6MVwiPjwvZGl2PicgK1xuICAgICAgICAnPGkgbmctaWY9XCJ2YWx1ZVwiIG5nLWNsYXNzPVwie1xcJ2lvbi1jbG9zZS1yb3VuZFxcJzogZWFzeVN0eWxlLCBcXCdpY29uLWNsZWFuXFwnOiAhZWFzeVN0eWxlfVwiIG5nLWNsaWNrPVwiY2xlYW5IYW5kbGVyKClcIj48L2k+PC9kaXY+JyxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZSwgYXR0cnMpe1xuXG4gICAgICAgICAgICBzY29wZS5jbGVhbkhhbmRsZXIgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHNjb3BlLnZhbHVlID0gJyc7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuICAgIH1cbn0pLmRpcmVjdGl2ZSgnbnVtYmVyJywgZnVuY3Rpb24oKXtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgICAgICByZXF1aXJlOiAnXm5nTW9kZWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlLCBhdHRycywgbmdNb2RlbEN0cmwpe1xuXG4gICAgICAgICAgIHZhciB2YWw7XG5cbiAgICAgICAgICAgZWxlLmJpbmQoJ2lucHV0JywgZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgICAgdmFsID0gdGhpcy52YWx1ZTtcblxuICAgICAgICAgICAgICAgaWYgKGlzTmFOKHZhbCkpIHtcbiAgICAgICAgICAgICAgICAgICB2YWwgPSB2YWwuc2xpY2UoMCwgLTEpO1xuICAgICAgICAgICAgICAgICAgIHRoaXMudmFsdWUgPSB2YWw7XG4gICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICBuZ01vZGVsQ3RybC4kc2V0Vmlld1ZhbHVlKHZhbCk7XG4gICAgICAgICAgIH0pXG5cblxuICAgICAgICB9XG4gICAgfVxufSk7XG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL2NvbnRhaW5lcnMvZW50cnkvSW5wdXREaXJlY3RpdmUuanNcIixcIi8uLi9jb250YWluZXJzL2VudHJ5XCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGNvbnRyb2xsZXJNb2R1bGUgPSByZXF1aXJlKCcuLi8uLi9qcy9jb250cm9sbGVyTW9kdWxlLmpzJyk7XG4vKlxuICogZGF0ZSAyMDE2LTktMjZcbiAqIGF1dGggemhhbmdcbiAqIHRlbCAxNTIxMDAwNzE4NVxuICpcbiAqIOWFpeWPo+aOp+WItlxuICovXG5cbi8vIOeZu+W9lVxuY29udHJvbGxlck1vZHVsZS5jb250cm9sbGVyKCdMb2dpbkN0cmwnLCBbJyRzY29wZScsICdlbnRyeVNlcnZpY2VzJywgJyRpb25pY1BvcHVwJywgJyRzdGF0ZVBhcmFtcycsICckaW9uaWNIaXN0b3J5JywgJyRzdGF0ZScsICckcm9vdFNjb3BlJyxcbiAgICBmdW5jdGlvbigkc2NvcGUsIGVudHJ5U2VydmljZXMsICRpb25pY1BvcHVwLCAkc3RhdGVQYXJhbXMsICRpb25pY0hpc3RvcnksICRzdGF0ZSwgJHJvb3RTY29wZSkge1xuXG4gICAgJHNjb3BlLmlucHV0RGF0YSA9IHt9O1xuICAgICRzY29wZS5pc1Nob3cgPSB0cnVlO1xuXG5cblxuICAgIHZhciBzdG9yeVZpZXcgPSAkaW9uaWNIaXN0b3J5LmJhY2tWaWV3KCkgfHwge30sXG4gICAgICAgIGJhY2tVUkwsXG4gICAgICAgIGVsZSA9IGVudHJ5U2VydmljZXMuc2V0SGVhZGVyKHtcbiAgICAgICAgYmFjazogZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgaWYgKGJhY2tVUkwgPSAkc3RhdGVQYXJhbXMuYmFja1VSTCkge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbyhiYWNrVVJMKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJGlvbmljSGlzdG9yeS5nb0JhY2soKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuICAgICAgICBpc1Nob3c6ICRzY29wZS5pc1Nob3dcbiAgICB9KTtcbiAgICAkc2NvcGUuJG9uKCckZGVzdHJveScsZnVuY3Rpb24oKXtcbiAgICAgICAgZWxlLnJlbW92ZSgpO1xuXG4gICAgfSlcbiAgICAvLyDnmbvlvZVcbiAgICAkc2NvcGUubG9naW5TdWIgPSBmdW5jdGlvbigpe1xuICAgICAgICBlbnRyeVNlcnZpY2VzLnNpZ25Jbigkc2NvcGUuaW5wdXREYXRhLCAkc3RhdGVQYXJhbXMuYmFja1VSTCk7XG4gICAgfVxuXG4gICAgJHNjb3BlLnVuaW9uTG9naW4gPSBmdW5jdGlvbihtc2cpe1xuXG4gICAgICAgIHZhciBwb3AgPSAkaW9uaWNQb3B1cC5zaG93KHtcblxuICAgICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwidW5pb24tcG9wdXBcIj48cCBjbGFzcz1cImZzLTE0XCI+5aaC5p6c5oKo5bey5rOo5YaM6L+H5b2p57Gz6LSm5Y+377yM6L6T5YWl5a+G56CB5Y2z5Y+v5YWz6IGU5Yiw5q2k6LSm5Y+344CCPC9wPicgK1xuICAgICAgICAgICAgJzxsYWJlbCBjbGFzcz1cIml0ZW0gaXRlbS1pbnB1dCBwYXNzd29yZC1pbnB1dFwiPjxlbT48c3Bhbj7otKbmiLc6PC9zcGFuPjwvZW0+PGlucHV0IHR5cGU9XCJ0ZXh0XCIgIG5nLW1vZGVsPVwidXNlck5hbWVcIiBwbGFjZWhvbGRlcj1cIuaJi+acuuWPty/nlKjmiLflkI1cIiByZXF1aXJlZD4nICtcbiAgICAgICAgICAgICc8L2xhYmVsPjxwYXNzLXdvcmQgc3R5bGU9XCJtYXJnaW4tYm90dG9tOiAzcHg7XCIgcGFzc3dvcmQ9XCJwYXNzd29yZFwiIHBsYWNlaG9sZGVyPVwi6K+36L6T5YWl5a+G56CBXCI+5a+G56CBOjwvcGFzcy13b3JkPjxwIGNsYXNzPVwiYy1yZWQgZnMtMTNcIj7lr4bnoIHplJnor6/vvIzor7fph43mlrDovpPlhaU8L3A+PC9kaXY+JyxcbiAgICAgICAgICAgIHRpdGxlOiAn5piv5ZCm5YWz6IGU5bey5rOo5YaM6L+H55qE5b2p57Gz6LSm5Y+3JyxcbiAgICAgICAgICAgIHNjb3BlOiAkc2NvcGUsXG4gICAgICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAgICAgICAgeyB0ZXh0OiAn5LiN5YWz6IGU55m76ZmGJyB9LFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgdGV4dDogJzxiPuWFs+iBlOW5tueZu+W9lTwvYj4nLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYy1yZWQnLFxuICAgICAgICAgICAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9wLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LCAxMDAwKVxuICAgICAgICAgICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF1cbiAgICAgICAgfSk7XG5cbiAgICB9XG5cblxufV0pXG4gICAgLy8g5rOo5YaMXG4gICAgLmNvbnRyb2xsZXIoJ1JlZ2lzdGVyQ3RybCcsIFsnJHNjb3BlJywgJyRsb2NhdGlvbicsICdlbnRyeVNlcnZpY2VzJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9jYXRpb24sIGVudHJ5U2VydmljZXMpIHtcblxuICAgICRzY29wZS5pbnB1dERhdGEgPSB7fVxuXG4gICAgJHNjb3BlLmZvcm1TdWIgPSBmdW5jdGlvbigpe1xuICAgICAgICBlbnRyeVNlcnZpY2VzLmNyZWF0ZUFjY291bnQoJHNjb3BlLmlucHV0RGF0YSk7XG4gICAgfVxuXG59XSlcbiAgICAvLyDlv5jorrDlr4bnoIEo5Y+R6YCB5omL5py65ZKM6aqM6K+B56CB6aqM6K+BKVxuICAgIC5jb250cm9sbGVyKCdGb3JnZXRQYXNzd29yZEN0cmwnLCBbJyRzY29wZScsICckbG9jYXRpb24nLCAnZW50cnlTZXJ2aWNlcycsICckc3RhdGVQYXJhbXMnLCBmdW5jdGlvbigkc2NvcGUsICRsb2NhdGlvbiwgZW50cnlTZXJ2aWNlcywgJHN0YXRlUGFyYW1zKSB7XG5cbiAgICAgICAgJHNjb3BlLmlucHV0RGF0YSA9IHt9O1xuXG4gICAgICAgICRzY29wZS5mb3JtU3ViID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIC8vIOaMh+WumuiHquW3seimgei3s+i9rOeahOmhtemdoueahOi3r+eUseWfn1xuICAgICAgICAgICAgZW50cnlTZXJ2aWNlcy5mb3JnZXRQYXNzd29yZCgkc2NvcGUuaW5wdXREYXRhLCAkc3RhdGVQYXJhbXMuc2NvcGVVUkwpO1xuICAgICAgICB9XG5cbiAgICB9XSlcbiAgICAvLyDpqozor4HmiJDlip/lkI7ph43orr7lr4bnoIFcbiAgICAuY29udHJvbGxlcignUmVzZXRQYXNzd29yZEN0cmwnLCBbJyRzY29wZScsICdnbG9iYWxTZXJ2aWNlcycsICdlbnRyeVNlcnZpY2VzJywgJyRzdGF0ZVBhcmFtcycsIGZ1bmN0aW9uKCRzY29wZSwgZ2xvYmFsU2VydmljZXMsIGVudHJ5U2VydmljZXMsICRzdGF0ZVBhcmFtcykge1xuXG4gICAgICAgICRzY29wZS5pbnB1dERhdGEgPSB7XG4gICAgICAgICAgICBtb2JpbGU6ICRzdGF0ZVBhcmFtcy5tb2JpbGVcbiAgICAgICAgfTtcbiAgICAgICAgJHNjb3BlLmZvcm1TdWIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUuaW5wdXREYXRhLnBhc3N3b3JkID09ICRzY29wZS5pbnB1dERhdGEucmVwZWF0UGFzc3dvcmQpIHtcbiAgICAgICAgICAgICAgICBlbnRyeVNlcnZpY2VzLnJlc2V0UGFzc3dvcmQoJHNjb3BlLmlucHV0RGF0YSwgJ3RhYi5sb2dpbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9XSlcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9jb250YWluZXJzL2VudHJ5L0xvZ2luQ29udHJvbGxlci5qc1wiLFwiLy4uL2NvbnRhaW5lcnMvZW50cnlcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgZGlyZWN0aXZlTW9kdWxlID0gcmVxdWlyZSgnLi4vLi4vanMvZGlyZWN0aXZlTW9kdWxlLmpzJyk7XG5cbi8vIOWvhueggei+k+WFpeahhlxuZGlyZWN0aXZlTW9kdWxlLmRpcmVjdGl2ZSgncGFzc1dvcmQnLCBmdW5jdGlvbigpe1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdBRScsXG4gICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBwbGFjZWhvbGRlcjogJ0AnLFxuICAgICAgICAgICAgZXJyb3I6ICdAJyxcbiAgICAgICAgICAgIHZhbGlkYXRlOiAnPScsXG4gICAgICAgICAgICBwYXNzd29yZDogJz0nXG4gICAgICAgIH0sXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cIml0ZW0gaXRlbS1pbnB1dCBwYXNzd29yZC1pbnB1dFwiIHN0eWxlPVwicG9zaXRpb246IHJlbGF0aXZlOyBvdmVyZmxvdzogdmlzaWJsZVwiPjxlbSBuZy10cmFuc2NsdWRlIGlzLWhpZGUgPjwvZW0+JyArXG4gICAgICAgICc8aW5wdXQgY2hlY2twYXNzd29yZCBuZy1tb2RlbD1cInBhc3N3b3JkXCIgIHR5cGU9XCJwYXNzd29yZFwiIHBsYWNlaG9sZGVyPXt7cGxhY2Vob2xkZXJ9fSByZXF1aXJlZCAvPicgK1xuICAgICAgICAnPGkgIG5nLWNsYXNzPVwie2ljb25zaG93ZXllOiBiQnRuICwgaWNvbmxvY2tleWU6ICFiQnRufVwiIG5nLWNsaWNrPVwidG9nZ2xlRXllKClcIj48L2k+PGRpdiBuZy1pZj1cImlzU2hvd1wiIGNsYXNzPVwicGFzc3dvcmQtZXJyb3JcIiA+e3tlcnJvcn19PC9kaXY+PC9kaXY+PC9kaXY+JyxcbiAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZSwgYXR0cnMpe1xuXG5cbiAgICAgICAgICAgIC8vIOaYr+WQpuaYvuekuuWvhueggVxuICAgICAgICAgICAgc2NvcGUuYkJ0biA9IGZhbHNlO1xuXG4gICAgICAgICAgICBzY29wZS50b2dnbGVFeWUgPSBmdW5jdGlvbihldmVudCl7XG5cbiAgICAgICAgICAgICAgICB2YXIgb0lucHV0ID0gIGVsZS5maW5kKCdpbnB1dCcpWzBdO1xuXG4gICAgICAgICAgICAgICAgaWYgKHNjb3BlLmJCdG4pIHtcbiAgICAgICAgICAgICAgICAgICAgb0lucHV0LnNldEF0dHJpYnV0ZSgndHlwZScsICdwYXNzd29yZCcpXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgb0lucHV0LnNldEF0dHJpYnV0ZSgndHlwZScsICd0ZXh0JylcblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBzY29wZS5iQnRuID0gIXNjb3BlLmJCdG47XG5cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHNjb3BlLiR3YXRjaCgndmFsaWRhdGUnLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCl7XG5cbiAgICAgICAgICAgICAgaWYgKG5ld1ZhbCA9PSBzY29wZS5wYXNzd29yZCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLmlzU2hvdyA9IGZhbHNlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuXG5cbiAgICAgICAgfVxuICAgIH1cbn0pLmRpcmVjdGl2ZSgnY2hlY2twYXNzd29yZCcsIGZ1bmN0aW9uKCl7XG4gICAgdmFyIHBhc3N3b3JkUkUgPSAvXi57NiwxNn0kLztcbiAgICByZXR1cm4ge1xuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZSwgYXR0cnMpIHtcbiAgICAgICAgICAgIHNjb3BlLmlzU2hvdyA9IGZhbHNlO1xuXG4gICAgICAgICAgICAvLyDkuI3nlKjplJnor6/mj5DphpJcbiAgICAgICAgICAgIGlmICghc2NvcGUuZXJyb3IpIHJldHVybjtcblxuICAgICAgICAgICAgZWxlWzBdLm9uZm9jdXMgPSAgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBzY29wZS5pc1Nob3cgPSBmYWxzZTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBlbGUuYmluZCgnY2hhbmdlJywgaW5wdXRFdmVudCk7XG4gICAgICAgICAgICBlbGUuYmluZCgnYmx1ZScsIGlucHV0RXZlbnQpO1xuXG4gICAgICAgICAgZnVuY3Rpb24gaW5wdXRFdmVudChldmVudCl7XG4gICAgICAgICAgICB2YXIgdmFsID0gZWxlWzBdLnZhbHVlO1xuXG4gICAgICAgICAgICAvLyDlpoLmnpzmmK/ph43lpI3lr4bnoIFcbiAgICAgICAgICAgIGlmIChzY29wZS52YWxpZGF0ZSAmJiBzY29wZS52YWxpZGF0ZSAhPSB2YWwpIHtcbiAgICAgICAgICAgICAgc2NvcGUuaXNTaG93ID0gdHJ1ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAocGFzc3dvcmRSRS50ZXN0KGVsZVswXS52YWx1ZSkpIHtcbiAgICAgICAgICAgICAgc2NvcGUuaXNTaG93ID0gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzY29wZS5pc1Nob3cgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc2NvcGUuJGFwcGx5KCk7XG5cbiAgICAgICAgICB9XG5cblxuICAgICAgICB9XG5cbiAgICB9XG5cbn0pLmRpcmVjdGl2ZSgnaXNIaWRlJywgZnVuY3Rpb24oKXtcbiAgICByZXR1cm57XG4gICAgICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlLCBhdHRycyl7XG5cbiAgICAgICAgICAgIHZhciBodG1sID0gZWxlWzBdLmlubmVySFRNTDtcblxuICAgICAgICAgICAgaWYgKCFodG1sKSB7XG4gICAgICAgICAgICAgICAgZWxlLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufSlcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9jb250YWluZXJzL2VudHJ5L1Bhc3N3b3JkSW5wdXREaXJlY3RpdmUuanNcIixcIi8uLi9jb250YWluZXJzL2VudHJ5XCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIGRpcmVjdGl2ZU1vZHVsZSA9IHJlcXVpcmUoJy4uLy4uL2pzL2RpcmVjdGl2ZU1vZHVsZS5qcycpO1xuXG4vKipcbiAqIDIwMTYtOS0yMlxuICogQGF1dGggemhhbmdcbiAqIEB0ZWwgMTUyMTAwMDcxODVcbiAqL1xuXG4vLyDlj5HpgIHpqozor4HnoIFcbmRpcmVjdGl2ZU1vZHVsZS5kaXJlY3RpdmUoJ3NlbmRjb2RlJywgWyckdGltZW91dCcsICdnbG9iYWxTZXJ2aWNlcycsIGZ1bmN0aW9uKCR0aW1lb3V0LCBnbG9iYWxTZXJ2aWNlcyl7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICByZXN0cmljdDogJ0FFJyxcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIG1vYmlsZTogJz0nLFxuICAgICAgICAgICAgZnVuYzogJ0AnXG4gICAgICAgIH0sXG4gICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cIml0ZW0gaXRlbS1pbnB1dFwiIHN0eWxlPVwiei1pbmRleDo2OyBvdmVyZmxvdzogdmlzaWJsZVwiPjxpbnB1dCB0eXBlPVwidGVsXCIgbWF4bGVuZ3RoPVwiMTFcIiBuZy1tYXhsZW5ndGg9XCIxMVwiIG5nLW1vZGVsPVwibW9iaWxlXCIgcGxhY2Vob2xkZXI9XCLor7fovpPlhaXkvaDms6jlhozml7bnmoTmiYvmnLrlj7dcIiByZXF1aXJlZCA+JyArXG4gICAgICAgICAgICAnPGEgY2xhc3M9XCJhc3NlcnRpdmUtYnRuIHNtYWxsLWJ0biBzZW5kLWJ0blwiIG5nLWNsYXNzPVwie2Rpc2FibGVkOiAobW9iaWxlLmxlbmd0aCA8IDExKSB8fCAhbW9iaWxlIH1cIiBuZy1jbGljaz1cInNlbmRDb2RlKCRldmVudClcIiBocmVmPVwiXCI+e3tidG5UZXh0fX08L2E+JyArXG4gICAgICAgICAgICAnPHAgY2xhc3M9XCJzZW5kZWQtdGlwcyBzZXJ2aWNlLXRlbFwiIG5nLXNob3c9XCJiQnRuXCI+5oiR5Lus5bey5Y+R6YCB5LqG6aqM6K+B56CB5Yiw5L2g55qE5omL5py6PC9wPjwvZGl2PicsXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGUsIGF0dHJzKXtcbiAgICAgICAgICAgIHNjb3BlLmJ0blRleHQgPSAn5Y+R6YCB6aqM6K+B56CBJztcbiAgICAgICAgICAgIHNjb3BlLmJCdG4gPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciBjb3VudERvd24gPSAoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICB2YXIgdGltZSA9IDYwO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIHRpbWUgLS07XG4gICAgICAgICAgICAgICAgICAgIGlmICh0aW1lID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICR0aW1lb3V0LmNhbmNlbCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuYnRuVGV4dCA9ICflj5HpgIHpqozor4HnoIEnO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGltZSA9IDYwO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuYnRuVGV4dCA9IHRpbWUgKyAn56eSJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAkdGltZW91dChjb3VudERvd24sIDEwMDApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0oKSk7XG5cbiAgICAgICAgICAgIHNjb3BlLnNlbmRDb2RlID0gZnVuY3Rpb24oJGV2ZW50KXtcbiAgICAgICAgICAgICAgICB2YXIgcmUgPSB2ZWxpZGF0ZVBob25lKHNjb3BlLm1vYmlsZSk7XG5cbiAgICAgICAgICAgICAgICBpZiAocmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuZXJyb3IgPSAnJztcblxuICAgICAgICAgICAgICAgICAgICBpZiAoc2NvcGUuYnRuVGV4dCA9PSAn5Y+R6YCB6aqM6K+B56CBJyl7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbFNlcnZpY2VzLnNlcmlhbFBvc3QoJzMxMDQnLCBzY29wZS5mdW5jLCB7bW9iaWxlOiBzY29wZS5tb2JpbGV9KS50aGVuKGZ1bmN0aW9uKHJlKXtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLmJCdG4gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvdW50RG93bigpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihyZSl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ1c2Ugc3RyaWN0XCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2cocmUpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmVycm9yID0gcmU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHZlbGlkYXRlUGhvbmUgPSBmdW5jdGlvbihtb2JpbGUsIGJvb2wpe1xuICAgICAgICAgICAgICAgIHZhciByZSA9IC8xWzM0NTY3ODldXFxkezl9LyxcbiAgICAgICAgICAgICAgICAgICAgcmUyID0gL1xcUy87XG4gICAgICAgICAgICAgICAgLy/kuLrnqbpcbiAgICAgICAgICAgICAgICBpZiAoIXJlMi50ZXN0KG1vYmlsZSkpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoYm9vbCkgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ+S6su+8jOaJi+acuuWPt+S4jeiDveS4uuepuuWTpic7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlLnRlc3QobW9iaWxlKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChib29sKSByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ+S6su+8jOaJi+acuuWPt+S4jeato+ehruWTpic7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgdmFyIHZlbGlkYXRlQ29kZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgdmFyIHJlID0gL15bMC05XXs2fSQvLFxuICAgICAgICAgICAgICAgICAgICByZTIgPSAvXFxTLztcbiAgICAgICAgICAgICAgICAvL+S4uuepulxuICAgICAgICAgICAgICAgIGlmICghcmUyLnRlc3Qoc2NvcGUuY29kZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICfkurLvvIzpqozor4HnoIHkuI3og73kuLrnqbrlk6YnO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZS50ZXN0KHNjb3BlLmNvZGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAn5Lqy77yM6aqM6K+B56CB5LiN5q2j56Gu5ZOmJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cblxuXG4gICAgICAgIH1cbiAgICB9XG59XSlcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9jb250YWluZXJzL2VudHJ5L1NlbmRDb2RlRGlyZWN0aXZlLmpzXCIsXCIvLi4vY29udGFpbmVycy9lbnRyeVwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBzZXJ2aWNlc01vZHVsZSA9IHJlcXVpcmUoJy4uLy4uL2pzL3NlcnZpY2VNb2R1bGUuanMnKTtcblxuLyoqXG4gKlxuICogMjAxNi0wOS0yOFxuICogQGF1dGggemhhbmdcbiAqIEB0ZWwgMTUyMTAwMDcxODVcbiAqIOWFpeWPo+acjeWKoVxuICovXG5zZXJ2aWNlc01vZHVsZS5mYWN0b3J5KCdlbnRyeVNlcnZpY2VzJywgWydnbG9iYWxTZXJ2aWNlcycsICckc3RhdGUnLCAnJHJvb3RTY29wZScsICckZG9jdW1lbnQnLCAnJGNvbXBpbGUnLCBmdW5jdGlvbihnbG9iYWxTZXJ2aWNlcywgJHN0YXRlLCAkcm9vdFNjb3BlLCAkZG9jdW1lbnQsICRjb21waWxlKXtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHNldEhlYWRlcjogZnVuY3Rpb24oZGF0YSl7XG5cbiAgICAgICAgICAgIHZhciBodG1sID0gJzxkaXYgY2xhc3M9XCJsb2dpbi1oZWFkZXJcIj48ZGl2IG9uLXRhcD1cImJhY2soKVwiPjxpIGNsYXNzPVwiaW9uIGlvbi1pb3MtYXJyb3ctYmFja1wiPjwvaT48L2Rpdj48L2Rpdj4nXG5cbiAgICAgICAgICAgIHZhciBlbGUgPSBhbmd1bGFyLmVsZW1lbnQoaHRtbCksXG4gICAgICAgICAgICAgICAgc2NvcGUgPSAkcm9vdFNjb3BlLiRuZXcoKTtcblxuICAgICAgICAgICAgYW5ndWxhci5leHRlbmQoc2NvcGUsIHtcbiAgICAgICAgICAgICAgICBiYWNrOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBkYXRhLmJhY2soKTtcbiAgICAgICAgICAgICAgICAgICAgZWxlLnJlbW92ZSgpO1xuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkZG9jdW1lbnQuZmluZCgnYm9keScpLmFwcGVuZChlbGUpO1xuICAgICAgICAgICAgJGNvbXBpbGUoZWxlKShzY29wZSk7XG4gICAgICAgICAgICByZXR1cm4gZWxlO1xuXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOeZu+W9lVxuICAgICAgICBzaWduSW46IGZ1bmN0aW9uKGRhdGEsIGJhY2tVUkwpe1xuICAgICAgICAgICAgdmFyIHBhc3N3b3JkID0gbWQ1KGRhdGEucGFzc3dvcmQpO1xuXG4gICAgICAgICAgICBnbG9iYWxTZXJ2aWNlcy5zaWduSW4oe21vYmlsZTogZGF0YS5tb2JpbGUsIHBhc3N3b3JkOiBwYXNzd29yZH0sIGZ1bmN0aW9uKHJlKXtcblxuICAgICAgICAgICAgICAgIGlmIChyZS50b2tlbikge1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIOe8k+WtmOeUqOaIt+eahOi0puWPt+S/oeaBr++8iOiHquWKqOeZu+W9leeUqO+8iVxuICAgICAgICAgICAgICAgICAgICBnbG9iYWxTZXJ2aWNlcy5sb2NhbFN0b3JhZ2VIYW5kbGUoJ2FjY291bnQnLCB7bW9iaWxlOiBkYXRhLm1vYmlsZSwgcGFzc3dvcmQ6IHBhc3N3b3JkfSlcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsU2VydmljZXMuc2V0VXNlckJhc2VNc2cocmUpO1xuICAgICAgICAgICAgICAgICAgICBiYWNrVVJMID0gYmFja1VSTCA/IGJhY2tVUkwgOiAndGFiLmFjY291bnQnO1xuICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oYmFja1VSTCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlLmVyckNvdW50ID4gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZ2xvYmFsU2VydmljZXMuZXJyb3JQcm9tcHQoJ+eUqOaIt+WQjeaIluWvhueggemUmeivrycpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlLmVyckNvdW50ID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbFNlcnZpY2VzLmVycm9yUHJvbXB0KCfnlKjmiLflt7LooqvplIHlrponKTtcblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuXG4gICAgICAgIC8vIOazqOWGjFxuICAgICAgICBjcmVhdGVBY2NvdW50OiBmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgICAgdmFyIHBhc3N3b3JkID0gbWQ1KGRhdGEucGFzc3dvcmQpO1xuXG4gICAgICAgICAgICBpZiAoZGF0YS5wYXNzd29yZCA9PSBkYXRhLnJlcGVhdFBhc3N3b3JkKSB7XG4gICAgICAgICAgICAgICAgZ2xvYmFsU2VydmljZXMuc2VyaWFsUG9zdCgnMzEwMCcsICdtb2JpbGUnLCB7bW9iaWxlOiBkYXRhLm1vYmlsZSwgdGVzdENvZGU6IGRhdGEudGVzdENvZGUsIHBhc3N3b3JkOiBwYXNzd29yZH0pLnRoZW4oZnVuY3Rpb24gKHJlKSB7XG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbFNlcnZpY2VzLnNldFVzZXJCYXNlTXNnKHJlKTtcbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsU2VydmljZXMubG9jYWxTdG9yYWdlSGFuZGxlKCdhY2NvdW50Jywge21vYmlsZTogZGF0YS5tb2JpbGUsIHBhc3N3b3JkOiBwYXNzd29yZH0pXG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygndGFiLmFjY291bnQnKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDlv5jorrDlr4bnoIHvvIjlj5HpgIHpqozor4HnoIHvvIlcbiAgICAgICAgICogQHBhcmFtcyBkYXRhIHtPYmplY3R9IOeUteivneWPt+eggeWSjOmqjOivgeeggVxuICAgICAgICAgKiBAcGFyYW1zIHNjb3BlVVJMIHtTdHJpbmd9IOW9k+WJjeeahOi3r+eUseWfn1xuICAgICAgICAgKi9cblxuICAgICAgICBmb3JnZXRQYXNzd29yZDogZnVuY3Rpb24oZGF0YSwgc2NvcGVVUkwpe1xuXG4gICAgICAgICAgICAvLyDlpoLmnpzmnInmjIflrprot6/nlLHln59cbiAgICAgICAgICAgIHNjb3BlVVJMID0gc2NvcGVVUkwgPyAndGFiLmFjY291bnRyZXNldHBhc3N3b3JkJyA6ICd0YWIucmVzZXRwYXNzd29yZCc7XG5cbiAgICAgICAgICAgIGdsb2JhbFNlcnZpY2VzLnNlcmlhbFBvc3QoJzMxMDUnLCAnZm9yZ2V0UGFzc3dvcmQnLCBkYXRhKS50aGVuKGZ1bmN0aW9uKHJlKXtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oc2NvcGVVUkwsIHttb2JpbGU6IGRhdGEubW9iaWxlfSlcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8g6YeN572u5a+G56CBXG4gICAgICAgIHJlc2V0UGFzc3dvcmQ6IGZ1bmN0aW9uKGRhdGEsIGJhY2tVUkwpe1xuICAgICAgICAgICAgdmFyIHBhc3N3b3JkID0gbWQ1KGRhdGEucGFzc3dvcmQpO1xuICAgICAgICAgICAgZ2xvYmFsU2VydmljZXMuc2VyaWFsUG9zdCgnMzEwMycsICdyZXNldFBhc3N3b3JkJywge21vYmlsZTogZGF0YS5tb2JpbGUsIHBhc3N3b3JkOiBwYXNzd29yZH0pLnRoZW4oZnVuY3Rpb24ocmUpe1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbyhiYWNrVVJMKTtcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgfVxuICAgIH1cblxufV0pXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vY29udGFpbmVycy9lbnRyeS9lbnRyeVNlcnZpY2VzLmpzXCIsXCIvLi4vY29udGFpbmVycy9lbnRyeVwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBjb250cm9sbGVyTW9kdWxlID0gcmVxdWlyZSgnLi4vLi4vanMvY29udHJvbGxlck1vZHVsZS5qcycpO1xuLyoqXG4gKiBAZGF0ZSAyMDE2LTExLTE4XG4gKiBAYXV0aCB6aGFuZ1xuICogQHRlbCAxNTIxMDAwNzE4NVxuICovXG5cbi8vIOWPkeeOsOmmlumhtVxuY29udHJvbGxlck1vZHVsZS5jb250cm9sbGVyKCdGb3VuZEN0cmwnLCBbJyRzY29wZScsICdnbG9iYWxTZXJ2aWNlcycsICdmb3VuZFNlcnZpY2VzJywgZnVuY3Rpb24oJHNjb3BlLCBnbG9iYWxTZXJ2aWNlcywgZm91bmRTZXJ2aWNlcykge1xuICAgICRzY29wZS5ib3VucyA9IHt9O1xuXG5cbiAgICBmb3VuZFNlcnZpY2VzLmdldEJvdW5zKCRzY29wZSk7XG5cblxufV0pXG4gICAgLy8g6LWE6K6vXG4gICAgLmNvbnRyb2xsZXIoJ0NvbnN1bHRDdHJsJywgWyckc2NvcGUnLCAnZ2xvYmFsU2VydmljZXMnLCAnZm91bmRTZXJ2aWNlcycsIGZ1bmN0aW9uKCRzY29wZSwgZ2xvYmFsU2VydmljZXMsIGZvdW5kU2VydmljZXMpIHtcbiAgICAgICAgJHNjb3BlLmNvbnN1bHRzID0gZ2xvYmFsU2VydmljZXMuY2FjaGUoJ2NvbnN1bHRzJywgMTApIHx8IFtdO1xuICAgICAgICAkc2NvcGUuJG9uKCckaW9uaWNWaWV3LmJlZm9yZUVudGVyJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICRzY29wZS5pc01vcmUgPSB0cnVlO1xuICAgICAgICAgICAgdmFyIGdldENvbnN1bHQgPSBmb3VuZFNlcnZpY2VzLmNvbnN1bHQoJHNjb3BlKTtcbiAgICAgICAgICAgICRzY29wZS5sb2FkTW9yZSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgZ2V0Q29uc3VsdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHNjb3BlLmRvUmVmcmVzaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGdldENvbnN1bHQoMSk7XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICB9KVxuICAgICAgICAkc2NvcGUuJG9uKCckaW9uaWNWaWV3LmFmdGVyRW50ZXInLCBmdW5jdGlvbigpe1xuICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdsb2FkSW1nJyk7XG4gICAgICAgIH0pO1xuXG4gICAgfV0pXG4gICAgLy8g6LWE6K6v6K+m5oOFXG4gICAgLmNvbnRyb2xsZXIoJ0NvbnN1bHREZXRhaWxDdHJsJywgWyckc2NvcGUnLCAnZ2xvYmFsU2VydmljZXMnLCAnZm91bmRTZXJ2aWNlcycsICckc3RhdGVQYXJhbXMnLCBmdW5jdGlvbigkc2NvcGUsIGdsb2JhbFNlcnZpY2VzLCBmb3VuZFNlcnZpY2VzLCAkc3RhdGVQYXJhbXMpIHtcbiAgICAgICAgJHNjb3BlLmNvbnN1bHREZXRhaWwgPSB7fTtcbiAgICAgICAgJHNjb3BlLmNvbnN1bHREZXRhaWwgPSBnbG9iYWxTZXJ2aWNlcy5jYWNoZSgnY29uc3VsdHMnLCAkc3RhdGVQYXJhbXMuaWQpO1xuICAgICAgICBmb3VuZFNlcnZpY2VzLmdldENvbnN1bHRCeUNvZGUoJHNjb3BlLCAgJHN0YXRlUGFyYW1zLmlkKTtcbiAgICB9XSlcbiAgICAvLyDlhazlkYpcbiAgICAuY29udHJvbGxlcignTm90aWNlQ3RybCcsIFsnJHNjb3BlJywgJ2dsb2JhbFNlcnZpY2VzJywgJ2ZvdW5kU2VydmljZXMnLCBmdW5jdGlvbigkc2NvcGUsIGdsb2JhbFNlcnZpY2VzLCBmb3VuZFNlcnZpY2VzKSB7XG4gICAgICAgICRzY29wZS5kZWZhdWx0ID0ge1xuICAgICAgICAgICAgaW5kZXg6IDBcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBub3RpY2UgPSBmb3VuZFNlcnZpY2VzLm5vdGljZSgkc2NvcGUpO1xuICAgICAgICB2YXIgcmVjZWl2ZU5vdGljZSA9IGZvdW5kU2VydmljZXMucmVjZWl2ZU5vdGljZSgkc2NvcGUpO1xuICAgICAgICAkc2NvcGUuc2VsZk5vdGljZSA9IHtcbiAgICAgICAgICAgIGRvUmVmcmVzaDogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBub3RpY2UoMSk7XG5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsb2FkTW9yZTogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICBub3RpY2UoKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBpc01vcmU6IHRydWUsXG4gICAgICAgICAgICBkYXRhOiBbXSxcbiAgICAgICAgICAgIGluZGV4OiAwLFxuICAgICAgICB9XG4gICAgICAgICRzY29wZS5wdXNoTm90aWNlID0ge1xuICAgICAgICAgICAgZG9SZWZyZXNoOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHJlY2VpdmVOb3RpY2UoMSk7XG5cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsb2FkTW9yZTogZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICByZWNlaXZlTm90aWNlKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaXNNb3JlOiB0cnVlLFxuICAgICAgICAgICAgZGF0YTogW10sXG4gICAgICAgICAgICBpbmRleDogMVxuICAgICAgICB9XG4gICAgICAgICRzY29wZS5zZWxmTm90aWNlLmRhdGEgPSBnbG9iYWxTZXJ2aWNlcy5jYWNoZSgnbm90aWNlcycsIDEwKSB8fCBbXTtcblxuICAgICAgICAvLyDnm5HlkKxkZWZhdWx0LmluZGV45Y+Y5YyWXG4gICAgICAgICRzY29wZS4kd2F0Y2goJ2RlZmF1bHQuaW5kZXgnLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCl7XG5cbiAgICAgICAgICAgIC8vIOayoeacieWPmOWMlijnrKzkuIDmrKHov5vlhaXpobXpnaLnrYkuLi4pXG4gICAgICAgICAgICBpZiAobmV3VmFsID09IG9sZFZhbCkgcmV0dXJuO1xuXG4gICAgICAgICAgICBzd2l0Y2ggKG5ld1ZhbCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDpcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEkc2NvcGUuc2VsZk5vdGljZS5wYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBub3RpY2UoMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAgICAgICBpZiAoISRzY29wZS5wdXNoTm90aWNlLnBhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlY2VpdmVOb3RpY2UoMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfV0pXG4gICAgLy8g5YWs5ZGK6K+m5oOFXG4gICAgLmNvbnRyb2xsZXIoJ05vdGljZURldGFpbEN0cmwnLCBbJyRzY29wZScsICdnbG9iYWxTZXJ2aWNlcycsICdmb3VuZFNlcnZpY2VzJywgJyRzdGF0ZVBhcmFtcycsIGZ1bmN0aW9uKCRzY29wZSwgZ2xvYmFsU2VydmljZXMsIGZvdW5kU2VydmljZXMsICRzdGF0ZVBhcmFtcykge1xuXG4gICAgICAgIC8vIOaOqOmAgeivpuaDhemhtVxuICAgICAgICBpZiAoJHN0YXRlUGFyYW1zLnB1c2gpIHtcbiAgICAgICAgICAgIGZvdW5kU2VydmljZXMuZ2V0UHVzaE5vdGljZUJ5Q29kZSgkc2NvcGUsICRzdGF0ZVBhcmFtcy5pZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkc2NvcGUubm90aWNlRGV0YWlsID0ge307XG4gICAgICAgICAgICAkc2NvcGUubm90aWNlRGV0YWlsID0gZ2xvYmFsU2VydmljZXMuY2FjaGUoJ25vdGljZXMnLCAkc3RhdGVQYXJhbXMuaWQpO1xuICAgICAgICAgICAgZm91bmRTZXJ2aWNlcy5nZXROb3RpY2VCeUNvZGUoJHNjb3BlLCAgJHN0YXRlUGFyYW1zLmlkKTtcbiAgICAgICAgfVxuXG5cblxuICAgIH1dKVxuXG5cblxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL2NvbnRhaW5lcnMvZm91bmQvRm91bmRDdHJsLmpzXCIsXCIvLi4vY29udGFpbmVycy9mb3VuZFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBzZXJ2aWNlTW9kdWxlID0gcmVxdWlyZSgnLi4vLi4vanMvc2VydmljZU1vZHVsZS5qcycpO1xuXG4vKipcbiAqIEBkYXRlIDIwMTYtMTEtMThcbiAqIEBhdXRoIHpoYW5nXG4gKiBAdGVsIDE1MjEwMDA3MTg1XG4gKi9cblxuLy8g5byA5aWWXG5zZXJ2aWNlTW9kdWxlLmZhY3RvcnkoJ2ZvdW5kU2VydmljZXMnLCBbJ2dsb2JhbFNlcnZpY2VzJywgJ2xvdHRlcnlTZXJ2aWNlcycsICckc2NlJywgZnVuY3Rpb24oZ2xvYmFsU2VydmljZXMsIGxvdHRlcnlTZXJ2aWNlcywgJHNjZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiDor7fmsYLmlbDmja7ov5Tlm57lpITnkIblh73mlbBcbiAgICAgICAgICogQHBhcmFtICRzY29wZSB7T2JqZWN0fVxuICAgICAgICAgKiBAcGFyYW0gYXJnUGFnZSB7TnVtYmVyfSDlpoLmnpzmmK/kuIvmi4nliLfmlrBcbiAgICAgICAgICogQHBhcmFtIGN1cnJlbnRQYWdlIHtOdW1iZXJ9IOW9k+WJjemhteeggVxuICAgICAgICAgKiBAcGFyYW0gZGF0YSB7QXJyYXl9IOe8k+WtmOeahOaVsOaNrlxuICAgICAgICAgKiBAcGFyYW0gY2FjaGVJZCB7U3RyaW5nfSDnvJPlrZjnmoRrZXlcblxuICAgICAgICAgKiBAcGFyYW0gbGltaXQge051bWJlcn0g5pWw5o2u5pyA5aSn5p2h5pWwXG4gICAgICAgICAqL1xuICAgICAgICByZXNwb25zZURhdGFIYW5kbGU6IGZ1bmN0aW9uKCRzY29wZSwgYXJnUGFnZSwgY3VycmVudFBhZ2UsIGRhdGEsIGNhY2hlSWQsIGxpbWl0KXtcblxuICAgICAgICAgICAgaWYgKGRhdGEuaXNPZmZMaW5lKSB7XG4gICAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzY3JvbGwucmVmcmVzaENvbXBsZXRlJyk7XG4gICAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzY3JvbGwuaW5maW5pdGVTY3JvbGxDb21wbGV0ZScpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjdXJyZW50UGFnZSA9PSAxKSB7XG5cbiAgICAgICAgICAgICAgICAkc2NvcGVbY2FjaGVJZF0gPSBkYXRhO1xuICAgICAgICAgICAgICAgICRzY29wZS5pc01vcmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzY3JvbGwucmVmcmVzaENvbXBsZXRlJylcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlW2NhY2hlSWRdID0gICRzY29wZVtjYWNoZUlkXS5jb25jYXQoZGF0YSk7XG5cblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRhdGEubGVuZ3RoIDwgMTApIHtcbiAgICAgICAgICAgICAgJHNjb3BlLmlzTW9yZSA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Njcm9sbC5pbmZpbml0ZVNjcm9sbENvbXBsZXRlJyk7XG5cbiAgICAgICAgICAgIC8vIOe8k+WtmOWSqOivouaVsOaNrlxuICAgICAgICAgICAgZ2xvYmFsU2VydmljZXMuY2FjaGUoY2FjaGVJZCwgZGF0YSk7XG5cbiAgICAgICAgfSxcbiAgICAgICAgZ2V0Qm91bnM6IGZ1bmN0aW9uKCRzY29wZSl7XG4gICAgICAgICAgICBnbG9iYWxTZXJ2aWNlcy5wb3N0KCc0MDAwJywgJ2xhc3QnKS50aGVuKGZ1bmN0aW9uKHJlKXtcbiAgICAgICAgICAgICAgICByZS5pc3N1ZS5ib251c051bWJlciA9IGxvdHRlcnlTZXJ2aWNlcy5zbGljZU51bShyZS5pc3N1ZS5ib251c051bWJlcik7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmJvbnVzID0gcmUuaXNzdWU7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOWPlue8k+WtmOaVsOaNrueahOaMh+WumuaVsOaNrlxuICAgICAgICAgKiBAcGFyYW0gY2FjaGVJZCB7U3RyaW5nfVxuICAgICAgICAgKiBAcGFyYW0gaWRcbiAgICAgICAgICogQHJldHVybnMge0FycmF5fVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0RGF0ZUJ5SWQ6IGZ1bmN0aW9uKGNhY2hlSWQsIGlkKXtcbiAgICAgICAgICAgIHZhciByZURhdGEgPSBnbG9iYWxTZXJ2aWNlcy5jYWNoZShjYWNoZUlkKSxcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBbXTtcblxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHJlRGF0YSwgZnVuY3Rpb24oZGF0YSl7XG5cbiAgICAgICAgICAgICAgICBpZiAoZGF0YS5pZCA9PSBpZCkge1xuICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IGRhdGE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG5cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOiOt+WPlui1hOiur+aVsOaNruWIl+ihqFxuICAgICAgICAgKiBAcGFyYW0gJHNjb3BlXG4gICAgICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAgICAgICAgICovXG4gICAgICAgIGNvbnN1bHQ6IGZ1bmN0aW9uKCRzY29wZSl7XG5cbiAgICAgICAgICAgIHZhciBwYWdlID0gMCxcbiAgICAgICAgICAgICAgICBUaGlzID0gdGhpcztcblxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGFyZ1BhZ2Upe1xuXG4gICAgICAgICAgICAgICAgaWYgKGFyZ1BhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFnZSA9IGFyZ1BhZ2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcGFnZSArPSAxO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGdsb2JhbFNlcnZpY2VzLnNlcmlhbFBvc3QoJzUwMDAnLCAnbmV3c0xpc3QnLCB7cGFnZTogcGFnZSwgcGFnZVNpemU6IDEwfSkudGhlbihmdW5jdGlvbihyZSl7XG4gICAgICAgICAgICAgICAgICAgIFRoaXMucmVzcG9uc2VEYXRhSGFuZGxlKCRzY29wZSwgYXJnUGFnZSwgcGFnZSwgcmUubmV3c0xpc3QsICdjb25zdWx0cycsIDEwKTtcblxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDojrflj5botYTorq/or6bmg4VcbiAgICAgICAgICogQHBhcmFtICRzY29wZVxuICAgICAgICAgKiBAcGFyYW0gYXJ0aWNsZUNvZGVcbiAgICAgICAgICogQHJldHVybnMge0Z1bmN0aW9ufVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0Q29uc3VsdEJ5Q29kZTogZnVuY3Rpb24oJHNjb3BlLCBhcnRpY2xlQ29kZSl7XG5cbiAgICAgICAgICAgIGdsb2JhbFNlcnZpY2VzLnBvc3QoJzUwMDAnLCAnbmV3c0RldGFpbCcsIHthcnRpY2xlQ29kZTogYXJ0aWNsZUNvZGV9KS50aGVuKGZ1bmN0aW9uKHJlKXtcblxuICAgICAgICAgICAgICAgIGlmIChyZS5uZXdzICYmIHJlLm5ld3MuY29udGVudCkge1xuICAgICAgICAgICAgICAgICAgcmUubmV3cy5jb250ZW50ID0gJHNjZS50cnVzdEFzSHRtbChyZS5uZXdzLmNvbnRlbnQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICRzY29wZS5jb25zdWx0RGV0YWlsID0gcmUgJiYgcmUubmV3cztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LFxuICAgICAgICAvKipcbiAgICAgICAgICog6I635Y+W5YWs5ZGK5pWw5o2u5YiX6KGoXG4gICAgICAgICAqIEBwYXJhbSAkc2NvcGVcbiAgICAgICAgICogQHJldHVybnMge0Z1bmN0aW9ufVxuICAgICAgICAgKi9cbiAgICAgICAgbm90aWNlOiBmdW5jdGlvbigkc2NvcGUpe1xuICAgICAgICAgICAgdmFyIHBhZ2UgPSAwLFxuICAgICAgICAgICAgICAgIFRoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oYXJnUGFnZSl7XG5cbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmRlZmF1bHQuaW5kZXggIT09ICRzY29wZS5zZWxmTm90aWNlLmluZGV4KSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBpZiAoYXJnUGFnZSkge1xuICAgICAgICAgICAgICAgICAgICBwYWdlID0gYXJnUGFnZTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBwYWdlICs9IDE7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZ2xvYmFsU2VydmljZXMuc2VyaWFsUG9zdCgnNTAwMCcsICdub3RpY2VMaXN0Jywge3BhZ2U6IHBhZ2UsIHBhZ2VTaXplOiAxMH0pLnRoZW4oZnVuY3Rpb24ocmUpe1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChhcmdQYWdlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zZWxmTm90aWNlLmlzTW9yZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgncmVmcmVzaENvbXBsZXRlJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAoKHJlLm5vdGljZUxpc3QubGVuZ3RoIDwgMTApICYmIChwYWdlID09IDEpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2VsZk5vdGljZS5pc01vcmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zZWxmTm90aWNlLmRhdGEgPSByZS5ub3RpY2VMaXN0O1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNlbGZOb3RpY2UuZGF0YSA9ICAkc2NvcGUuc2VsZk5vdGljZS5kYXRhLmNvbmNhdChyZS5ub3RpY2VMaXN0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyDnvJPlrZjlkqjor6LmlbDmja5cbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsU2VydmljZXMuY2FjaGUoJ25vdGljZXMnLCByZS5ub3RpY2VMaXN0KTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDmjqXmlLbmtojmga9cbiAgICAgICAgICogQHBhcmFtICRzY29wZVxuICAgICAgICAgKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gICAgICAgICAqL1xuICAgICAgICByZWNlaXZlTm90aWNlOiBmdW5jdGlvbigkc2NvcGUpe1xuICAgICAgICAgICAgdmFyIHBhZ2UgPSAwLFxuICAgICAgICAgICAgICAgIFRoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oYXJnUGFnZSl7XG5cbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLmRlZmF1bHQuaW5kZXggIT09ICRzY29wZS5wdXNoTm90aWNlLmluZGV4KSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICBpZiAoYXJnUGFnZSkge1xuICAgICAgICAgICAgICAgICAgICBwYWdlID0gMDtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNlbGZOb3RpY2UuaXNNb3JlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3JlZnJlc2hDb21wbGV0ZScpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBnbG9iYWxTZXJ2aWNlcy5sb2NhbFN0b3JhZ2VIYW5kbGUoe2tleTogJ25vdGljZXMnLCBwYWdlOiBwYWdlLCBwYWdlU2l6ZTogMTB9KSB8fCBbXTtcblxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChyZXN1bHQsIGZ1bmN0aW9uKHJlKXtcbiAgICAgICAgICAgICAgICAgICAgLy8g5pe26Ze05bqP5YiX5YyWXG4gICAgICAgICAgICAgICAgICAgIHJlLmNyZWF0ZVRpbWUgPSBUaGlzLnRpbWVIYW5kbGUocmUuY3JlYXRlVGltZSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICBwYWdlICs9IDE7XG5cbiAgICAgICAgICAgICAgICBpZiAocGFnZSA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5wdXNoTm90aWNlLmRhdGEgPSByZXN1bHQ7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5sZW5ndGggPCAxMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnB1c2hOb3RpY2UuaXNNb3JlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUucHVzaE5vdGljZS5kYXRhID0gICRzY29wZS5wdXNoTm90aWNlLmRhdGEuY29uY2F0KHJlc3VsdCk7XG5cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Njcm9sbC5pbmZpbml0ZVNjcm9sbENvbXBsZXRlJyk7XG5cblxuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOiOt+WPluWFrOWRiuivpuaDhVxuICAgICAgICAgKiBAcGFyYW0gJHNjb3BlXG4gICAgICAgICAqIEBwYXJhbSBub3RpY2VDb2RlXG4gICAgICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAgICAgICAgICovXG4gICAgICAgIGdldE5vdGljZUJ5Q29kZTogZnVuY3Rpb24oJHNjb3BlLCBub3RpY2VDb2RlKXtcblxuICAgICAgICAgICAgZ2xvYmFsU2VydmljZXMucG9zdCgnNTAwMCcsICdub3RpY2VEZXRhaWwnLCB7bm90aWNlQ29kZTogbm90aWNlQ29kZX0pLnRoZW4oZnVuY3Rpb24ocmUpe1xuICAgICAgICAgICAgICAgICRzY29wZS5ub3RpY2VEZXRhaWwgPSByZS5ub3RpY2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOiOt+WPluaOqOmAgea2iOaBr1xuICAgICAgICAgKiBAcGFyYW0gJHNjb3BlIHtPYmplY3R9XG4gICAgICAgICAqIEBwYXJhbSBwdXNoTm90aWNlQ29kZSB7TnVtYmVyfVxuICAgICAgICAgKiBAcmV0dXJucyB7T2JqZWN0fVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0UHVzaE5vdGljZUJ5Q29kZTogZnVuY3Rpb24oJHNjb3BlLCBwdXNoTm90aWNlQ29kZSl7XG4gICAgICAgICAgICB2YXIgcmVzdWx0ID0gZ2xvYmFsU2VydmljZXMubG9jYWxTdG9yYWdlSGFuZGxlKCdub3RpY2VzJyk7XG5cbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChyZXN1bHQsIGZ1bmN0aW9uKG9iail7XG5cbiAgICAgICAgICAgICAgICBpZiAob2JqLnB1c2hOb3RpY2VDb2RlID09IHB1c2hOb3RpY2VDb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5ub3RpY2VEZXRhaWwgPSBvYmo7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcblxuXG4gICAgICAgIH0sXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDml7bpl7TlpITnkIZcbiAgICAgICAgICogQHBhcmFtIHRpbWVcbiAgICAgICAgICovXG4gICAgICAgIHRpbWVIYW5kbGU6IGZ1bmN0aW9uKHRpbWUpIHtcbiAgICAgICAgICAgIHZhciBvVGltZURhdGUgPSBuZXcgRGF0ZSh0aW1lKSxcbiAgICAgICAgICAgICAgICBvRGF0ZSA9IG5ldyBEYXRlKCksXG4gICAgICAgICAgICAgICAgdG9kYXlUaW1lcyA9IG9EYXRlLmdldEhvdXJzKCkgKiAzNjAwO1xuXG4gICAgICAgICAgICAvLyDku4rlpKlcbiAgICAgICAgICAgIGlmICgob0RhdGUuZ2V0VGltZSgpIC0gb1RpbWVEYXRlLmdldFRpbWUoKSkgPCB0b2RheVRpbWVzKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9UaW1lRGF0ZS5nZXRIb3VycygpICsgJzonICsgb1RpbWVEYXRlLmdldE1pbnV0ZXMoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChvVGltZURhdGUuZ2V0TW9udGgoKSArIDEpICsgJy8nICsgb1RpbWVEYXRlLmdldERhdGUoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgfVxufV0pXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vY29udGFpbmVycy9mb3VuZC9mb3VuZFNlcnZpY2VzLmpzXCIsXCIvLi4vY29udGFpbmVycy9mb3VuZFwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBjb250cm9sbGVyTW9kdWxlID0gcmVxdWlyZSgnLi4vLi4vanMvY29udHJvbGxlck1vZHVsZS5qcycpO1xuXG4vKipcbiAqIOmmlumhtVxuICovXG5cbmNvbnRyb2xsZXJNb2R1bGUuY29udHJvbGxlcignU3RhcnRVcEN0cmwnLCBbJyRzY29wZScsICdnbG9iYWxTZXJ2aWNlcycsICckc3RhdGUnLCBmdW5jdGlvbigkc2NvcGUsIGdsb2JhbFNlcnZpY2VzLCAkc3RhdGUpIHtcblxuICAgIC8vIOmakOiXj+WQr+WKqOeUu+mdolxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkZXZpY2VyZWFkeVwiLCBmdW5jdGlvbigpe1xuICAgICAgICBpZihuYXZpZ2F0b3IgJiYgbmF2aWdhdG9yLnNwbGFzaHNjcmVlbikge1xuICAgICAgICAgICAgbmF2aWdhdG9yLnNwbGFzaHNjcmVlbi5oaWRlKCk7XG4gICAgICAgIH1cbiAgICB9LCBmYWxzZSk7XG5cbiAgICAkc2NvcGUuc3RhcnRQbGF5ID0gZnVuY3Rpb24oKXtcbiAgICAgICAgZ2xvYmFsU2VydmljZXMubG9jYWxTdG9yYWdlSGFuZGxlKCdzdGFydCcsIHRydWUpO1xuICAgICAgICAkc3RhdGUuZ28oJ3RhYi5pbmRleCcpO1xuICAgIH1cbn1dKVxuICAgIC8vIOmmlumhtVxuICAgIC5jb250cm9sbGVyKCdJbmRleEN0cmwnLCBbJyRzY29wZScsICdnbG9iYWxTZXJ2aWNlcycsICdpbmRleFNlcnZpY2VzJywgJyRpb25pY1Njcm9sbERlbGVnYXRlJywgJyRyb290U2NvcGUnLCAnJGxvY2F0aW9uJywgZnVuY3Rpb24oJHNjb3BlLCBnbG9iYWxTZXJ2aWNlcywgaW5kZXhTZXJ2aWNlcywgJGlvbmljU2Nyb2xsRGVsZWdhdGUsICRyb290U2NvcGUsICRsb2NhdGlvbikge1xuXG4gICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJkZXZpY2VyZWFkeVwiLCBmdW5jdGlvbigpe1xuICAgICAgICAgIGluaXRMb2FkKCk7XG4gICAgICAgICAgLy8g5qOA5p+l5piv5ZCm5pu05pawXG4gICAgICAgICAgaWYgKHdpbmRvdy5kZXZpY2UpIHtcbiAgICAgICAgICAgIGdsb2JhbFNlcnZpY2VzLnVwZGF0ZUFQUCgpO1xuICAgICAgICAgIH1cblxuICAgICAgICB9LCBmYWxzZSk7XG5cblxuICAgICAgICBmdW5jdGlvbiBpbml0TG9hZCgpe1xuXG4gICAgICAgICAgICAkc2NvcGUuYWRMaXN0ID0gZ2xvYmFsU2VydmljZXMubG9jYWxTdG9yYWdlSGFuZGxlKCdhZExpc3QnKTtcbiAgICAgICAgICAgICRzY29wZS5sb3R0ZXJ5TGlzdCA9IGdsb2JhbFNlcnZpY2VzLmxvY2FsU3RvcmFnZUhhbmRsZSgnbG90dGVyeUxpc3QnKTtcbiAgICAgICAgICAgIGluZGV4U2VydmljZXMuZ2V0SW5kZXhMYXllcigkc2NvcGUpO1xuICAgICAgICB9XG5cblxuXG5cbiAgICAgICAgJHNjb3BlLiRvbignJGlvbmljVmlldy5iZWZvcmVFbnRlcicsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgIXdpbmRvdy5kZXZpY2UgJiYgaW5pdExvYWQoKTtcbiAgICAgICAgICAvLyDorr7nva5iYW5uZXLlm77pq5jluqZcbiAgICAgICAgICAkc2NvcGUuYmFuSGVpZ2h0ID0gZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFdpZHRoICogMzUwLzc1MCArICdweCc7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vLy8vLyDov5vlhaXpobXpnaLml7ZcbiAgICAgICAgJHNjb3BlLiRvbignJGlvbmljVmlldy5lbnRlcicsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgJHNjb3BlLmxvdHRlcnlMaXN0ID0gZ2xvYmFsU2VydmljZXMubG9jYWxTdG9yYWdlSGFuZGxlKCdsb3R0ZXJ5TGlzdCcpO1xuICAgICAgICAgICRyb290U2NvcGUucm9vdFRyYW5zcGFyZW50SGVhZGVyID0gZmFsc2U7XG4gICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ2xvYWRJbWcnKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHNjb3BlLnJlcGVhdEZpbmlzaCA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ2xvYWRJbWcnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyDpobXpnaLliqDovb3lrozmiJBcbiAgICAgICAgJHNjb3BlLiRvbignJGlvbmljVmlldy5hZnRlckVudGVyJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICBnbG9iYWxTZXJ2aWNlcy5wcmVJbWFnZShbJy4vaW1nL2VudHJ5L2xvZ2luLWJnLnBuZycsICAnLi9pbWcvdXNlcmNlbnRlci9iZ193by5wbmcnLCAnLi9pbWcvdXNlcmNlbnRlci9pY19maW5kX2FjdGl2ZS5wbmcnLCAnLi9pbWcvdXNlcmNlbnRlci9pY19wcm9ncmFtbWVfYWN0aXZlLnBuZycsICcuL2ltZy91c2VyY2VudGVyL2ljX2hvdXNlX2FjdGl2ZS5wbmcnLCAnLi9pbWcvdXNlcmNlbnRlci9pY191c2VyX2FjdGl2ZS5wbmcnXSk7XG4gICAgICAgIH0pXG5cbiAgICB9XSlcblxuICAgIC5jb250cm9sbGVyKCdDdXN0b21pemVDdHJsJywgWyckc2NvcGUnLCAnZ2xvYmFsU2VydmljZXMnLCBmdW5jdGlvbigkc2NvcGUsIGdsb2JhbFNlcnZpY2VzKSB7XG5cbiAgICAgICAgJHNjb3BlLmdldEltZ1BhdGggPSBnbG9iYWxTZXJ2aWNlcy5nZXRMb3R0ZXJ5U3BlbGw7XG4gICAgICAgICRzY29wZS5sb3R0ZXJ5TGlzdCA9IGdsb2JhbFNlcnZpY2VzLmxvY2FsU3RvcmFnZUhhbmRsZSgnbG90dGVyeUxpc3QnKTtcblxuICAgICAgICAvKipcbiAgICAgICAgICpcbiAgICAgICAgICogQHBhcmFtIGxvdHRlcnlDb2RlIHtOdW1iZXJ9XG4gICAgICAgICAqIEBwYXJhbSBzdGF0dXMge1N0cmluZ31cbiAgICAgICAgICovXG4gICAgICAgICRzY29wZS50b2dnbGVIYW5kbGUgPSBmdW5jdGlvbihsb3R0ZXJ5Q29kZSwgc3RhdHVzKXtcblxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKCRzY29wZS5sb3R0ZXJ5TGlzdCwgZnVuY3Rpb24obG90dGVyeSl7XG5cbiAgICAgICAgICAgICAgICBpZiAobG90dGVyeS5sb3R0ZXJ5Q29kZSA9PSBsb3R0ZXJ5Q29kZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHVzID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvdHRlcnkuc3RhdHVzID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbFNlcnZpY2VzLmVycm9yUHJvbXB0KCflt7Lnp7vpmaTor6Xlvannp40nKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxvdHRlcnkuc3RhdHVzID0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGdsb2JhbFNlcnZpY2VzLmVycm9yUHJvbXB0KCflt7LmiJDlip/mt7vliqDor6Xlvannp40nKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgZ2xvYmFsU2VydmljZXMubG9jYWxTdG9yYWdlSGFuZGxlKCdsb3R0ZXJ5TGlzdCcsICRzY29wZS5sb3R0ZXJ5TGlzdCk7XG5cbiAgICAgICAgfVxuXG4gICAgfV0pXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vY29udGFpbmVycy9pbmRleC9JbmRleENvbnRyb2xsZXIuanNcIixcIi8uLi9jb250YWluZXJzL2luZGV4XCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIHNlcnZpY2VNb2R1bGUgPSByZXF1aXJlKCcuLi8uLi9qcy9zZXJ2aWNlTW9kdWxlLmpzJyk7XG5cbi8qKlxuICogQGRhdGUgMjAxNi0xMC0yMlxuICogQGF1dGggemhhbmdcbiAqIEB0ZWwgMTUyMTAwMDcxODVcbiAqL1xuXG4vLyDlvIDlpZZcbnNlcnZpY2VNb2R1bGUuZmFjdG9yeSgnaW5kZXhTZXJ2aWNlcycsIFsnZ2xvYmFsU2VydmljZXMnLCAnJHJvb3RTY29wZScsIGZ1bmN0aW9uKGdsb2JhbFNlcnZpY2VzLCAkcm9vdFNjb3BlKSB7XG4gICAgLyoqXG4gICAgICogbG90dGVyeUNvZGUgMDAxID0+IOWPjOiJsueQg1xuICAgICAqIGxvdHRlcnlDb2RlIDAwMiA9PiDnpo/lvakzRFxuICAgICAqIGxvdHRlcnlDb2RlIDExMyA9PiDlpKfkuZDpgI9cbiAgICAgKiBsb3R0ZXJ5Q29kZSAxMDggPT4g5o6S5YiX5LiJXG4gICAgICogbG90dGVyeUNvZGUgMTA5ID0+IOaOkuWIl+S6lFxuICAgICAqIGxvdHRlcnlDb2RlIDAwNCA9PiDkuIPkuZDlvalcbiAgICAgKiBsb3R0ZXJ5Q29kZSAxMTAgPT4g5LiD5pif5b2pXG4gICAgICogbG90dGVyeUNvZGUgMDE4ID0+IOWMl+S6rOW/q+S4iVxuICAgICAqIGxvdHRlcnlDb2RlIDAxMSA9PiDmsZ/oi4/lv6vkuIlcbiAgICAgKiBsb3R0ZXJ5Q29kZSAwMTAgPT4g5a6J5b695b+r5LiJXG4gICAgICogbG90dGVyeUNvZGUgMTEwID0+IOS4g+aYn+W9qVxuICAgICAqIGxvdHRlcnlDb2RlIDExMCA9PiDkuIPmmJ/lvalcbiAgICAgKi9cblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldEluZGV4TGF5ZXI6IGZ1bmN0aW9uKCRzY29wZSl7XG4gICAgICAgICAgICB2YXIgYWNjb3VudCA9IGdsb2JhbFNlcnZpY2VzLmxvY2FsU3RvcmFnZUhhbmRsZSgnYWNjb3VudCcpO1xuXG4gICAgICAgICAgIGdsb2JhbFNlcnZpY2VzLnBvc3QoJzEwMDAnLCAnc3RhcnQnKS50aGVuKGZ1bmN0aW9uKHJlKXtcbiAgICAgICAgICAgICAgICB2YXIgbG90dGVyeUxpc3Q7XG5cbiAgICAgICAgICAgICAgICBpZiAocmUubG90dGVyeUxpc3QpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gc3RhdHVzIDAgPT4g6KaB6ZqQ6JeP55qE5b2p56eNIDEgPT4g6KaB5pi+56S655qE5b2p56eNXG4gICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChyZS5sb3R0ZXJ5TGlzdCwgZnVuY3Rpb24obG90dGVyeSwgaW5kZXgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluZGV4IDwgNykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxvdHRlcnkuc3RhdHVzPSAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb3R0ZXJ5LnN0YXR1cyA9IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmFkTGlzdCA9IHJlLmFkTGlzdDtcblxuICAgICAgICAgICAgICAgICAgICBnbG9iYWxTZXJ2aWNlcy5sb2NhbFN0b3JhZ2VIYW5kbGUoJ2FkTGlzdCcsIHJlLmFkTGlzdCk7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8g56ys5LiA5qyh6L+b5YWlYXBwXG4gICAgICAgICAgICAgICAgICAgIGlmICghKGxvdHRlcnlMaXN0ID0gZ2xvYmFsU2VydmljZXMubG9jYWxTdG9yYWdlSGFuZGxlKCdsb3R0ZXJ5TGlzdCcpKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxvdHRlcnlMaXN0ID0gcmUubG90dGVyeUxpc3Q7XG4gICAgICAgICAgICAgICAgICAgICAgICBnbG9iYWxTZXJ2aWNlcy5sb2NhbFN0b3JhZ2VIYW5kbGUoJ2xvdHRlcnlMaXN0JywgcmUubG90dGVyeUxpc3QpO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2Nyb2xsLnJlZnJlc2hDb21wbGV0ZScpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cblxuICAgICAgICAgICAgICAgLy8g6ZqQ6JeP5ZCv5Yqo55S76Z2iXG4gICAgICAgICAgICAgICBpZihuYXZpZ2F0b3IgJiYgbmF2aWdhdG9yLnNwbGFzaHNjcmVlbikge1xuXG4gICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLnNwbGFzaHNjcmVlbi5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgLy8g6Ieq5Yqo55m75b2VXG4gICAgICAgICAgICAgICAgICAgZ2xvYmFsU2VydmljZXMuYXV0b1NpZ25pbihhY2NvdW50KVxuICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfVxuICAgIH1cbn1dKVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL2NvbnRhaW5lcnMvaW5kZXgvaW5kZXhTZXJ2aWNlcy5qc1wiLFwiLy4uL2NvbnRhaW5lcnMvaW5kZXhcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgY29udHJvbGxlck1vZHVsZSA9IHJlcXVpcmUoJy4uLy4uL2pzL2NvbnRyb2xsZXJNb2R1bGUuanMnKTtcblxuLyoqXG4qZGF0ZSAyMDE2LTEwLTE4XG4qIGF1dGggemhhbmdcbiogdGVsIDE1MjEwMDA3MTg1XG4gKi9cblxuLy8g5byA5aWWXG5jb250cm9sbGVyTW9kdWxlLmNvbnRyb2xsZXIoJ0xvdHRlcnlDdHJsJywgWyckc2NvcGUnLCAnbG90dGVyeVNlcnZpY2VzJywgJ2dsb2JhbFNlcnZpY2VzJywgZnVuY3Rpb24oJHNjb3BlLCBsb3R0ZXJ5U2VydmljZXMsIGdsb2JhbFNlcnZpY2VzKXtcbiAgICAkc2NvcGUubG90dGVyeXMgPSBbXTtcblxuXG5cbiAgICAvKipcbiAgICAgKiBsb3R0ZXJ5Q29kZSAwMDEgPT4g5Y+M6Imy55CDXG4gICAgICogbG90dGVyeUNvZGUgMDAyID0+IOemj+W9qTNEXG4gICAgICogbG90dGVyeUNvZGUgMTEzID0+IOWkp+S5kOmAj1xuICAgICAqIGxvdHRlcnlDb2RlIDEwOCA9PiDmjpLliJfkuIlcbiAgICAgKiBsb3R0ZXJ5Q29kZSAxMDkgPT4g5o6S5YiX5LqUXG4gICAgICogbG90dGVyeUNvZGUgMDA0ID0+IOS4g+S5kOW9qVxuICAgICAqIGxvdHRlcnlDb2RlIDExMCA9PiDkuIPmmJ/lvalcbiAgICAgKiBsb3R0ZXJ5Q29kZSAwMTggPT4g5YyX5Lqs5b+r5LiJXG4gICAgICogbG90dGVyeUNvZGUgMDExID0+IOaxn+iLj+W/q+S4iVxuICAgICAqIGxvdHRlcnlDb2RlIDAxMCA9PiDlronlvr3lv6vkuIlcbiAgICAgKiBsb3R0ZXJ5Q29kZSAxMTAgPT4g5LiD5pif5b2pXG4gICAgICogbG90dGVyeUNvZGUgMTEwID0+IOS4g+aYn+W9qVxuICAgICAqL1xuICAgICRzY29wZS5sb3R0ZXJ5cyA9IGdsb2JhbFNlcnZpY2VzLmxvY2FsU3RvcmFnZUhhbmRsZSgnbG90dGVyeScpO1xuICAgICRzY29wZS4kb24oJyRpb25pY1ZpZXcuYWZ0ZXJFbnRlcicsIGZ1bmN0aW9uKCl7XG4gICAgICBsb3R0ZXJ5U2VydmljZXMubG90dGVyeSgkc2NvcGUpO1xuICAgIH0pO1xuICAgICRzY29wZS5kb1JlZnJlc2ggPSBmdW5jdGlvbigpe1xuICAgICAgbG90dGVyeVNlcnZpY2VzLmxvdHRlcnkoJHNjb3BlKTtcbiAgICB9XG5cblxuXG59XSkuY29udHJvbGxlcignTG90dGVyeUxpc3RDdHJsJywgWyckc2NvcGUnLCAnbG90dGVyeVNlcnZpY2VzJywgJyRzdGF0ZVBhcmFtcycsIGZ1bmN0aW9uKCRzY29wZSwgbG90dGVyeVNlcnZpY2VzLCAkc3RhdGVQYXJhbXMpe1xuICAgICRzY29wZS5sb3R0ZXJ5TGlzdCA9IFtdO1xuICAgICRzY29wZS5sb3R0ZXJ5Q29kZSA9ICRzdGF0ZVBhcmFtcy5pZDtcbiAgICB2YXIgbG90dGVyeUJvbnVzID0gbG90dGVyeVNlcnZpY2VzLkxvdHRlcnlCb251cygkc2NvcGUubG90dGVyeUNvZGUpO1xuICAgICRzY29wZS4kb24oJyRpb25pY1ZpZXcuYWZ0ZXJFbnRlcicsIGZ1bmN0aW9uKCl7XG4gICAgICAgICRzY29wZS5pc01vcmUgPSB0cnVlO1xuICAgICAgICAkc2NvcGUuZG9SZWZyZXNoID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICRzY29wZS5sb2FkTW9yZSgxLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzY3JvbGwucmVmcmVzaENvbXBsZXRlJylcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUubG9hZE1vcmUgPSBmdW5jdGlvbihwYWdlLCBmbil7XG5cblxuICAgICAgICAgICAgLy8g6I635Y+W5Lit5aWW5L+h5oGvXG4gICAgICAgICAgICBsb3R0ZXJ5Qm9udXMocGFnZSkudGhlbihmdW5jdGlvbihyZSl7XG5cbiAgICAgICAgICAgICAgICBpZiAocmUuaXNPZmZMaW5lKSB7XG4gICAgICAgICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2Nyb2xsLnJlZnJlc2hDb21wbGV0ZScpO1xuICAgICAgICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Njcm9sbC5pbmZpbml0ZVNjcm9sbENvbXBsZXRlJyk7XG4gICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIOayoeacieS4i+S4gOmhtVxuICAgICAgICAgICAgICAgIGlmIChyZS5pc3N1ZUxpc3QgPCAxMCkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuaXNNb3JlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8g6L+95Yqg5pWw5o2uXG4gICAgICAgICAgICAgICAgaWYgKCFwYWdlICYmICRzY29wZS5sb3R0ZXJ5TGlzdC5sZW5ndGggKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sb3R0ZXJ5TGlzdCA9ICRzY29wZS5sb3R0ZXJ5TGlzdC5jb25jYXQobG90dGVyeVNlcnZpY2VzLnNlcmlhbGl6ZUxvdHRlcnkocmUuaXNzdWVMaXN0KSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxvdHRlcnlMaXN0ID0gbG90dGVyeVNlcnZpY2VzLnNlcmlhbGl6ZUxvdHRlcnkocmUuaXNzdWVMaXN0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgJHNjb3BlLmxvdHRlcnlUaXRsZSA9ICRzY29wZS5sb3R0ZXJ5TGlzdFswXS5sb3R0ZXJ5TmFtZTtcblxuICAgICAgICAgICAgICAgIC8vIOS4i+aLieWIt+aWsFxuICAgICAgICAgICAgICAgIGlmIChmbikge1xuICAgICAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzY3JvbGwuaW5maW5pdGVTY3JvbGxDb21wbGV0ZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9KVxuXG59XSlcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9jb250YWluZXJzL2xvdHRlcnkvTG90dGVyeUN0cmwuanNcIixcIi8uLi9jb250YWluZXJzL2xvdHRlcnlcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgc2VydmljZU1vZHVsZSA9IHJlcXVpcmUoJy4uLy4uL2pzL3NlcnZpY2VNb2R1bGUuanMnKTtcblxuLyoqXG4gKiBAZGF0ZSAyMDE2LTA5LTMwXG4gKiBAYXV0aCB6aGFuZ1xuICogQHRlbCAxNTIxMDAwNzE4NVxuICovXG5cbi8vIOW8gOWlllxuc2VydmljZU1vZHVsZS5mYWN0b3J5KCdsb3R0ZXJ5U2VydmljZXMnLCBbJ2dsb2JhbFNlcnZpY2VzJywgZnVuY3Rpb24oZ2xvYmFsU2VydmljZXMpe1xuICAgIC8qKlxuICAgICAqIGxvdHRlcnlDb2RlIDAwMSA9PiDlj4zoibLnkINcbiAgICAgKiBsb3R0ZXJ5Q29kZSAwMDIgPT4g56aP5b2pM0RcbiAgICAgKiBsb3R0ZXJ5Q29kZSAxMTMgPT4g5aSn5LmQ6YCPXG4gICAgICogbG90dGVyeUNvZGUgMTA4ID0+IOaOkuWIl+S4iVxuICAgICAqIGxvdHRlcnlDb2RlIDEwOSA9PiDmjpLliJfkupRcbiAgICAgKiBsb3R0ZXJ5Q29kZSAwMDQgPT4g5LiD5LmQ5b2pXG4gICAgICogbG90dGVyeUNvZGUgMTEwID0+IOS4g+aYn+W9qVxuICAgICAqIGxvdHRlcnlDb2RlIDAxOCA9PiDljJfkuqzlv6vkuIlcbiAgICAgKiBsb3R0ZXJ5Q29kZSAwMTEgPT4g5rGf6IuP5b+r5LiJXG4gICAgICogbG90dGVyeUNvZGUgMDEwID0+IOWuieW+veW/q+S4iVxuICAgICAqIGxvdHRlcnlDb2RlIDExMCA9PiDkuIPmmJ/lvalcbiAgICAgKiBsb3R0ZXJ5Q29kZSAxMTAgPT4g5LiD5pif5b2pXG4gICAgICovXG5cbiAgICByZXR1cm57XG4gICAgICAgIC8vIOiOt+WPluW8gOWlluS/oeaBr1xuICAgICAgICBsb3R0ZXJ5OiBmdW5jdGlvbigkc2NvcGUpe1xuICAgICAgICAgICAgdmFyIFRoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICBnbG9iYWxTZXJ2aWNlcy5wb3N0KDQwMDAsICdpbmRleCcpLnRoZW4oZnVuY3Rpb24ocmUpe1xuXG4gICAgICAgICAgICAgICRzY29wZS5sb3R0ZXJ5cyA9IFRoaXMuc2VyaWFsaXplTG90dGVyeShyZS5pc3N1ZUxpc3QpO1xuICAgICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2Nyb2xsLnJlZnJlc2hDb21wbGV0ZScpO1xuICAgICAgICAgICAgICBnbG9iYWxTZXJ2aWNlcy5sb2NhbFN0b3JhZ2VIYW5kbGUoJ2xvdHRlcnknLCAkc2NvcGUubG90dGVyeXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG5cblxuICAgICAgICAvLyDluo/liJfljJblvIDlpZbkv6Hmga9cbiAgICAgIC8qKlxuICAgICAgICpcbiAgICAgICAqIEBwYXJhbSBsb3R0ZXJ5TGlzdCB7QXJyYXl9XG4gICAgICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAgICAgKi9cbiAgICAgICAgc2VyaWFsaXplTG90dGVyeTogZnVuY3Rpb24obG90dGVyeUxpc3Qpe1xuICAgICAgICAgICAgdmFyIFRoaXMgPSB0aGlzLFxuICAgICAgICAgICAgICAgIGxvdHRlcnlDb2RlO1xuXG4gICAgICAgICAgICBpZiAoIWFuZ3VsYXIuaXNBcnJheShsb3R0ZXJ5TGlzdCkpIHJldHVybiBbXTtcblxuICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGxvdHRlcnlMaXN0LCBmdW5jdGlvbihpc3N1ZSl7XG4gICAgICAgICAgICAgICAgbG90dGVyeUNvZGUgPSBpc3N1ZS5sb3R0ZXJ5Q29kZTtcblxuICAgICAgICAgICAgICAgIC8vIOWkhOeQhuW8gOWlluWPt+eggVxuICAgICAgICAgICAgICAgIGlzc3VlLmJvbnVzTnVtYmVyID0gVGhpcy5zbGljZU51bShpc3N1ZS5ib251c051bWJlcik7XG5cbiAgICAgICAgICAgICAgICAvLyDlpITnkIbml7bpl7RcbiAgICAgICAgICAgICAgICB0cnl7XG4gICAgICAgICAgICAgICAgICAgIGlzc3VlLmJvbnVzVGltZSA9IGlzc3VlLmJvbnVzVGltZS5zcGxpdCgnICcpWzBdO1xuXG4gICAgICAgICAgICAgICAgfSBjYXRjaChlKXtcblxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSlcblxuXG5cbiAgICAgICAgICAgIHJldHVybiBsb3R0ZXJ5TGlzdDtcbiAgICAgICAgfSxcbiAgICAgICAgLy8g5oiq5Y+W57qi56+u55CDXG4gICAgICAgIHNsaWNlTnVtOiBmdW5jdGlvbihzdHIpe1xuXG5cbiAgICAgICAgICAgIHZhciBmaXJzdFNsaWNlQXJyID0gW10sXG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gW10sXG4gICAgICAgICAgICAgICAgYmx1ZUFyciA9IFtdO1xuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHN0ciAhPT0gJ3N0cmluZycpIHJlc3VsdDtcblxuICAgICAgICAgICAgaWYgKHN0ci5pbmRleE9mKCcjJykgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICBmaXJzdFNsaWNlQXJyID0gc3RyLnNwbGl0KCcjJyk7XG5cbiAgICAgICAgICAgICAgICAvLyDlvqrnjq/liIflibLnmoTmlbDnu4RcbiAgICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goZmlyc3RTbGljZUFyciwgZnVuY3Rpb24obnVtQXJyLCBpbmRleCl7XG5cbiAgICAgICAgICAgICAgICAgICAgLy8g57qi55CD5LiN5Yy65YiGXG4gICAgICAgICAgICAgICAgICAgIGlmIChpbmRleCA9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSBudW1BcnIuc3BsaXQoJywnKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8g56+u55CDXG4gICAgICAgICAgICAgICAgICAgICAgICBibHVlQXJyID0gbnVtQXJyLnNwbGl0KCcsJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChibHVlQXJyLCBmdW5jdGlvbihudW0pe1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0LnB1c2goe2JsdWVCb29sOiBudW19KVxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICAgICAgICAvLyDlpoLmnpzmsqHmnInlvIDlpZblj7fnoIFcbiAgICAgICAgICAgICAgICBpZiAoIXN0ciB8fCBzdHIgPT0gJy0nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAnJztcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXN1bHQgPSBzdHIuc3BsaXQoJywnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLy8g6I635Y+W5b2p56eN5byA5aWW5L+h5oGvXG4gICAgICAgIExvdHRlcnlCb251czogZnVuY3Rpb24obG90dGVyeUNvZGUpe1xuXG4gICAgICAgICAgICB2YXIgcGFnZSA9IDA7XG5cblxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGFyZ1BhZ2Upe1xuXG4gICAgICAgICAgICAgICAgaWYgKCFhcmdQYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhZ2UgKys7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcGFnZSA9IGFyZ1BhZ2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiAgZ2xvYmFsU2VydmljZXMucG9zdCg0MDAwLCAnbGlzdCcsIHtsb3R0ZXJ5Q29kZTogbG90dGVyeUNvZGUsIHBhZ2U6IHBhZ2V9KTtcbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgIH1cbiAgICB9XG5cbn1dKVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL2NvbnRhaW5lcnMvbG90dGVyeS9sb3R0ZXJ5U2VydmljZXMuanNcIixcIi8uLi9jb250YWluZXJzL2xvdHRlcnlcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgY29udHJvbGxlck1vZHVsZSA9IHJlcXVpcmUoJy4uLy4uL2pzL2NvbnRyb2xsZXJNb2R1bGUuanMnKTtcblxuLyoqXG4gKiDnlKjmiLfkuK3lv4NcbiAqIEBkYXRlIDIwMTYtMTAtMjdcbiAqIEBhdXRoIHpoYW5nXG4gKiBAdGVsIDE1MjEwMDA3MTg1XG4gKi9cblxuLy8g6LSm5oi35Lit5b+DXG5jb250cm9sbGVyTW9kdWxlLmNvbnRyb2xsZXIoJ1Byb2dyYW1tZUN0cmwnLCBbJyRzY29wZScsICdnbG9iYWxTZXJ2aWNlcycsICdwcm9ncmFtbWVTZXJ2aWNlcycsIGZ1bmN0aW9uKCRzY29wZSwgZ2xvYmFsU2VydmljZXMsIHByb2dyYW1tZVNlcnZpY2VzKSB7XG4gICAgJHNjb3BlLnByb2dyYW1tZXMgPSBbXTtcbiAgICAkc2NvcGUuaXNNb3JlID0gdHJ1ZTtcbiAgICAvL2dsb2JhbFNlcnZpY2VzLnNob3dMb2dpbkxheW91dCgpO1xuXG4gICAgJHNjb3BlLmxvYWRNb3JlID0gZnVuY3Rpb24oaW5kZXgpe1xuXG4gICAgICAgIHByb2dyYW1tZVNlcnZpY2VzLnByb2dyYW1tZSgkc2NvcGUsIGluZGV4KVxuICAgIH1cbiAgICAkc2NvcGUuZG9SZWZyZXNoID0gZnVuY3Rpb24oKXtcbiAgICAgICAgJHNjb3BlLmxvYWRNb3JlKDEpXG4gICAgfTtcblxufV0pXG5cblxuLy8g5pa55qGI6K+m5oOFXG4uY29udHJvbGxlcignUHJvZ3JhbW1lRGV0YWlsQ3RybCcsIFsnJHNjb3BlJywgJ2dsb2JhbFNlcnZpY2VzJywgJ3Byb2dyYW1tZVNlcnZpY2VzJywgJyRzdGF0ZVBhcmFtcycsICckaW9uaWNQb3B1cCcsICckc3RhdGUnLCBmdW5jdGlvbigkc2NvcGUsIGdsb2JhbFNlcnZpY2VzLCBwcm9ncmFtbWVTZXJ2aWNlcywgJHN0YXRlUGFyYW1zLCAkaW9uaWNQb3B1cCwgJHN0YXRlKSB7XG5cbiAgICB2YXIgcHJvZ3JhbW1lID0gJHNjb3BlLnByb2dyYW1tZSA9IHByb2dyYW1tZVNlcnZpY2VzLmdldFByb2dyYW1tZSgkc3RhdGVQYXJhbXMucHJvZ3JhbW1lQ29kZSk7XG4gICAgJHNjb3BlLnByb2dyYW1tZS5jb3Vwb25BbW91bnQgPSAkc3RhdGVQYXJhbXMuY291cG9uQW1vdW50O1xuICAgICRzY29wZS5wcm9ncmFtbWUucGF5Q291bnQgPSAoJHNjb3BlLnByb2dyYW1tZS5yZXdhcmRBbW91bnQgLSAkc2NvcGUucHJvZ3JhbW1lLmNvdXBvbkFtb3VudCkgPCAwID8gMCA6ICgkc2NvcGUucHJvZ3JhbW1lLnJld2FyZEFtb3VudCAtICRzY29wZS5wcm9ncmFtbWUuY291cG9uQW1vdW50KTtcblxuICAgIHByb2dyYW1tZVNlcnZpY2VzLmdldEFjY291bnRCYWxhbmNlKHByb2dyYW1tZS5sb3R0ZXJ5Q29kZSwgcHJvZ3JhbW1lLnJld2FyZEFtb3VudCwgJHNjb3BlKTtcblxuICAgICRzY29wZS5idXlTdWJtaXQgPSBmdW5jdGlvbihib29sKXtcbiAgICAgICAgaWYgKGJvb2wpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygndGFiLnByb2dyYW1tZXJlY2hhcmdlJywge2JhY2tVUkw6ICcnfSlcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHByb2dyYW1tZVNlcnZpY2VzLmJ1eVByb2dyYW1tZSgkc2NvcGUsIHByb2dyYW1tZS5wcm9ncmFtQ29kZSwgcHJvZ3JhbW1lLnJld2FyZEFtb3VudCwgJHN0YXRlUGFyYW1zLmNvdXBvbkNvZGUsICRzdGF0ZVBhcmFtcy5jb3Vwb25BbW91bnQpXG4gICAgICAgIH1cblxuICAgIH1cblxufV0pXG4vLyDkvb/nlKjkvJjmg6DliLhcbi5jb250cm9sbGVyKCdVc2VDb3Vwb25DdHJsJywgWyckc2NvcGUnLCAnZ2xvYmFsU2VydmljZXMnLCAncHJvZ3JhbW1lU2VydmljZXMnLCAnJHN0YXRlUGFyYW1zJywgJyRzdGF0ZScsIGZ1bmN0aW9uKCRzY29wZSwgZ2xvYmFsU2VydmljZXMsIHByb2dyYW1tZVNlcnZpY2VzLCAkc3RhdGVQYXJhbXMsICRzdGF0ZSkge1xuXG5cbiAgICAgICAgLy8g6buY6K6kdGFi5pi+56S655qEXG4gICAgICAgICRzY29wZS5kZWZhdWx0PSB7XG4gICAgICAgICAgICBpbmRleDogMCxcbiAgICAgICAgICAgIGxvdHRlcnlDb2RlOiAkc3RhdGVQYXJhbXMubG90dGVyeUNvZGUsXG4gICAgICAgICAgICBhbW91bnQ6ICRzdGF0ZVBhcmFtcy5yZXdhcmRBbW91bnQsXG5cbiAgICAgICAgfTtcbiAgICAgICAgJHNjb3BlLmNvdXBvbkRhdGEgPSB7fTtcbiAgICAgICAgdmFyIHNDb3Vwb25Db2RlLCBpQ291cG9uQW1vdW50O1xuXG4gICAgICAgIHZhciBub1VzZSA9ICRzY29wZS5ub1VzZSA9ICB7XG4gICAgICAgICAgICBwYWdlOiAwLFxuICAgICAgICAgICAgZGF0YTogW10sXG4gICAgICAgICAgICBpc01vcmU6IHRydWUsXG4gICAgICAgICAgICBmbGFnOiAwXG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIHVzZWQgPSAkc2NvcGUudXNlZCA9ICB7XG4gICAgICAgICAgICBwYWdlOiAwLFxuICAgICAgICAgICAgZGF0YTogW10sXG4gICAgICAgICAgICBpc01vcmU6IHRydWUsXG4gICAgICAgICAgICBmbGFnOiAxXG4gICAgICAgIH07XG5cblxuICAgICAgICAvLy8vIOWKoOi9veaVsOaNruW3suS9v+eUqFxuICAgICAgICAkc2NvcGUubG9hZE5vVXNlID0gZnVuY3Rpb24ocGFnZSwgZm4pe1xuICAgICAgICAgICAgcHJvZ3JhbW1lU2VydmljZXMuZ2V0Q291cG9uKCRzY29wZSwgJ25vVXNlJywgcGFnZSwgZm4pO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvLyDkuIvmi4nliLfmlrDmnKrkvb/nlKhcbiAgICAgICAgJHNjb3BlLmRvUmVmcmVzaE5vVXNlID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICRzY29wZS5sb2FkTm9Vc2UoMSwgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgncmVmcmVzaENvbXBsZXRlJyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICAgICAgLy8vLyDliqDovb3mlbDmja7lt7Lkvb/nlKhcbiAgICAgICAgJHNjb3BlLmxvYWRVc2VkID0gZnVuY3Rpb24ocGFnZSwgZm4pe1xuICAgICAgICAgICAgcHJvZ3JhbW1lU2VydmljZXMuZ2V0Q291cG9uKCRzY29wZSwgJ3VzZWQnLCBwYWdlLCBmbik7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDkuIvmi4nliLfmlrDlt7Lkvb/nlKhcbiAgICAgICAgJHNjb3BlLmRvUmVmcmVzaFVzZWQgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgJHNjb3BlLmxvYWRVc2VkKDEsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3JlZnJlc2hDb21wbGV0ZScpO1xuICAgICAgICAgICAgfSlcblxuICAgICAgICB9XG5cblxuXG4gICAgICAgIC8vIOebkeWQrGRlZmF1bHQuaW5kZXjlj5jljJZcbiAgICAgICAgJHNjb3BlLiR3YXRjaCgnZGVmYXVsdC5pbmRleCcsIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKXtcblxuICAgICAgICAgICAgLy8g5rKh5pyJ5Y+Y5YyWKOesrOS4gOasoei/m+WFpemhtemdouetiS4uLilcbiAgICAgICAgICAgIGlmIChuZXdWYWwgPT0gb2xkVmFsKSByZXR1cm47XG5cbiAgICAgICAgICAgIHN3aXRjaCAobmV3VmFsKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOlxuICAgICAgICAgICAgICAgICAgICBpZiAoIW5vVXNlLnBhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5sb2FkTm9Vc2UoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIDE6XG4gICAgICAgICAgICAgICAgICAgIGlmICghdXNlZC5wYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUubG9hZFVzZWQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcblxuICAgICAgICAvLyDpgInmi6nkvJjmg6DliLhcbiAgICAgICAgJHNjb3BlLnNlbGVjdENvdXBvbiA9IGZ1bmN0aW9uKGNvdXBvbkNvZGUsIGNvdXBvbkFtb3VudCl7XG4gICAgICAgICAgICBhbmd1bGFyLmZvckVhY2goJHNjb3BlLm5vVXNlLmRhdGEsIGZ1bmN0aW9uKGRhdGEpe1xuXG4gICAgICAgICAgICAgICAgLy8g6YCJ5oup5b2T5YmN54K55Ye755qEXG4gICAgICAgICAgICAgICAgaWYgKGRhdGEuY291cG9uSWQgPT0gY291cG9uQ29kZSkge1xuICAgICAgICAgICAgICAgICAgICBkYXRhLmFjdGl2ZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YS5hY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgc0NvdXBvbkNvZGUgPSBjb3Vwb25Db2RlO1xuICAgICAgICAgICAgaUNvdXBvbkFtb3VudCA9IGNvdXBvbkFtb3VudDtcbiAgICAgICAgfVxuICAgICAgICAkc2NvcGUudXNlQ291cG9uID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICRzdGF0ZS5nbygndGFiLnByb2dyYW1tZWRldGFpbCcsIHtwcm9ncmFtbWVDb2RlOiAkc3RhdGVQYXJhbXMucHJvZ3JhbW1lQ29kZSwgY291cG9uQ29kZTogc0NvdXBvbkNvZGUsIGNvdXBvbkFtb3VudDogaUNvdXBvbkFtb3VudH0pXG4gICAgICAgIH1cblxufV0pXG4gICAgLy8g5pa55qGI6K6i5Y2V6K+m5oOFXG4gICAgLmNvbnRyb2xsZXIoJ1Byb2dyYW1tZU9yZGVyQ3RybCcsIFsnJHNjb3BlJywgJ3Byb2dyYW1tZVNlcnZpY2VzJywgJyRzdGF0ZVBhcmFtcycsIGZ1bmN0aW9uKCRzY29wZSwgcHJvZ3JhbW1lU2VydmljZXMsICRzdGF0ZVBhcmFtcykge1xuXG4gICAgICAgIHByb2dyYW1tZVNlcnZpY2VzLmdldE9yZGVyRGV0YWlsKCRzY29wZSwgJHN0YXRlUGFyYW1zLm9yZGVyQ29kZSk7XG5cbiAgICB9XSlcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9jb250YWluZXJzL3Byb2dyYW1tZS9Qcm9ncmFtbWVDdHJsLmpzXCIsXCIvLi4vY29udGFpbmVycy9wcm9ncmFtbWVcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgc2VydmljZU1vZHVsZSA9IHJlcXVpcmUoJy4uLy4uL2pzL3NlcnZpY2VNb2R1bGUuanMnKTtcblxuLyoqXG4gKiBAZGF0ZSAyMDE2LTA5LTMwXG4gKiBAYXV0aCB6aGFuZ1xuICogQHRlbCAxNTIxMDAwNzE4NVxuICovXG5cbi8vIOW8gOWlllxuc2VydmljZU1vZHVsZS5mYWN0b3J5KCdwcm9ncmFtbWVTZXJ2aWNlcycsIFsnZ2xvYmFsU2VydmljZXMnLCAnJHN0YXRlJywgJyRpb25pY1BvcHVwJywgJ2xvdHRlcnlTZXJ2aWNlcycsICckaW9uaWNUYWJzRGVsZWdhdGUnLCBmdW5jdGlvbihnbG9iYWxTZXJ2aWNlcywgJHN0YXRlLCAkaW9uaWNQb3B1cCwgbG90dGVyeVNlcnZpY2VzLCAkaW9uaWNUYWJzRGVsZWdhdGUpe1xuICAgIC8qKlxuICAgICAqIGxvdHRlcnlDb2RlIDAwMSA9PiDlj4zoibLnkINcbiAgICAgKiBsb3R0ZXJ5Q29kZSAwMDIgPT4g56aP5b2pM0RcbiAgICAgKiBsb3R0ZXJ5Q29kZSAxMTMgPT4g5aSn5LmQ6YCPXG4gICAgICogbG90dGVyeUNvZGUgMTA4ID0+IOaOkuWIl+S4iVxuICAgICAqIGxvdHRlcnlDb2RlIDEwOSA9PiDmjpLliJfkupRcbiAgICAgKiBsb3R0ZXJ5Q29kZSAwMDQgPT4g5LiD5LmQ5b2pXG4gICAgICogbG90dGVyeUNvZGUgMTEwID0+IOS4g+aYn+W9qVxuICAgICAqIGxvdHRlcnlDb2RlIDAxOCA9PiDljJfkuqzlv6vkuIlcbiAgICAgKiBsb3R0ZXJ5Q29kZSAwMTEgPT4g5rGf6IuP5b+r5LiJXG4gICAgICogbG90dGVyeUNvZGUgMDEwID0+IOWuieW+veW/q+S4iVxuICAgICAqIGxvdHRlcnlDb2RlIDExMCA9PiDkuIPmmJ/lvalcbiAgICAgKiBsb3R0ZXJ5Q29kZSAxMTAgPT4g5LiD5pif5b2pXG4gICAgICovXG5cbiAgICByZXR1cm57XG4gICAgICAgIC8vIOiOt+WPluaWueahiOWIl+ihqFxuICAgICAgICBwcm9ncmFtbWU6IChmdW5jdGlvbigpe1xuICAgICAgICAgICAgdmFyIHBhZ2UgPSAwO1xuXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqICRzY29wZSB7T2JqZWN0fVxuICAgICAgICAgICAgICogYXJnUGFnZSB7TnVtYmVyfSDmjIflrprliqDovb3nmoTpobXnoIFcbiAgICAgICAgICAgICAqXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigkc2NvcGUsIGFyZ1BhZ2Upe1xuXG4gICAgICAgICAgICAgICAgaWYgKCFhcmdQYWdlKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhZ2UgKys7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcGFnZSA9IGFyZ1BhZ2U7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICBnbG9iYWxTZXJ2aWNlcy5zZXJpYWxQb3N0KDIwMDAsICdsaXN0Jywge3BhZ2U6IHBhZ2UsIHBhZ2VTaXplcGFnZVNpemU6IDEwfSkudGhlbihmdW5jdGlvbihyZSl7XG5cbiAgICAgICAgICAgICAgICAgICBpZiAocmUuaXNPZmZMaW5lKSB7XG4gICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2Nyb2xsLnJlZnJlc2hDb21wbGV0ZScpO1xuICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Njcm9sbC5pbmZpbml0ZVNjcm9sbENvbXBsZXRlJyk7XG4gICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIC8vIOayoeacieabtOWkmuaVsOaNruS6hlxuICAgICAgICAgICAgICAgICAgIGlmIChyZS5wcm9ncmFtTGlzdC5sZW5ndGggPCAxMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuaXNNb3JlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgLy8g55u05o6l6KaG55uW5pWw5o2uXG4gICAgICAgICAgICAgICAgICAgaWYgKGFyZ1BhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnByb2dyYW1tZXMgPSByZS5wcm9ncmFtTGlzdDtcbiAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Njcm9sbC5yZWZyZXNoQ29tcGxldGUnKVxuICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5wcm9ncmFtbWVzID0gJHNjb3BlLnByb2dyYW1tZXMuY29uY2F0KHJlLnByb2dyYW1MaXN0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Njcm9sbC5pbmZpbml0ZVNjcm9sbENvbXBsZXRlJyk7XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgIGdsb2JhbFNlcnZpY2VzLmNhY2hlKCdwcm9ncmFtbWUnLCAkc2NvcGUucHJvZ3JhbW1lcyk7XG4gICAgICAgICAgICAgICAgfSk7O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KCkpLFxuICAgICAgICAvKipcbiAgICAgICAgICog5qC55o2uaWTojrflj5bmlrnmoYhcbiAgICAgICAgICogQHBhcmFtIGlkXG4gICAgICAgICAqIEByZXR1cm5zIHt7fX1cbiAgICAgICAgICovXG4gICAgICAgIGdldFByb2dyYW1tZTogZnVuY3Rpb24oaWQpe1xuICAgICAgICAgICAgdmFyIHByb2dyYW1tZSA9IGdsb2JhbFNlcnZpY2VzLmNhY2hlKCdwcm9ncmFtbWUnKSxcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB7fTtcbiAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChwcm9ncmFtbWUsIGZ1bmN0aW9uKHApe1xuXG4gICAgICAgICAgICAgICAgaWYgKHAucHJvZ3JhbUNvZGUgPT0gaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOiOt+WPlueUqOaIt+S9memineWPiuS8mOaDoOWIuFxuICAgICAgICAgKiBAcGFyYW0gbG90dGVyeUNvZGUge1N0cmluZ30g5b2p56eNY29kZVxuICAgICAgICAgKiBAcGFyYW0gcmV3YXJkQW1vdW50IHtOdW1iZXJ9IOaUr+S7mOeahOmHkeminVxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0QWNjb3VudEJhbGFuY2U6IGZ1bmN0aW9uKGxvdHRlcnlDb2RlLCByZXdhcmRBbW91bnQsICRzY29wZSl7XG5cbiAgICAgICAgICAgIGdsb2JhbFNlcnZpY2VzLnBvc3QoMzEwMiwgJ2FjY291bnQnLCB7YW1vdW50OiByZXdhcmRBbW91bnQsIGxvdHRlcnlDb2RlOiBsb3R0ZXJ5Q29kZX0pLnRoZW4oZnVuY3Rpb24ocmUpe1xuICAgICAgICAgICAgICAgICRzY29wZS5hY2NvdW50ID0gcmU7XG4gICAgICAgICAgICB9KVxuXG5cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOi0reS5sOaWueahiFxuICAgICAgICAgKiBAcGFyYW0gcHJvZ3JhbUNvZGUge1N0cmluZ30g5pa55qGIaWRcbiAgICAgICAgICogQHBhcmFtIGFtb3VudCB7TnVtYmVyfSDmlK/ku5jph5Hpop1cbiAgICAgICAgICogQHBhcmFtIG1jb2luIHtOdW1iZXJ9IOeUqOaIt+S9meminVxuICAgICAgICAgKiBAcGFyYW0gY291cG9uQ29kZSB7U3RyaW5nfSDkvJjmg6DliLhpZFxuICAgICAgICAgKiBAcGFyYW0gY291cG9uQW1vdW50IHtOdW1iZXJ9IOS8mOaDoOWIuOmHkeminVxuICAgICAgICAgKi9cbiAgICAgICAgYnV5UHJvZ3JhbW1lOiBmdW5jdGlvbigkc2NvcGUsIHByb2dyYW1Db2RlLCBhbW91bnQsIGNvdXBvbkNvZGUsIGNvdXBvbkFtb3VudCl7XG4gICAgICAgICAgICAkc2NvcGUuZGF0YSA9IHt9O1xuICAgICAgICAgICAgdmFyIG15UG9wdXAgPSAkaW9uaWNQb3B1cC5zaG93KHtcbiAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxkaXY+PHAgY2xhc3M9XCJjLTMzMyBmcy0xNVwiIHN0eWxlPVwibWFyZ2luOiAxNXB4IDVweDsgcGFkZGluZy1sZWZ0OjE1cHg7Ym9yZGVyOiAxcHggc29saWQgI2RkZDsgYm9yZGVyLXJhZGl1czo0cHhcIj48bXktaW5wdXQ+PGlucHV0IHR5cGU9XCJwYXNzd29yZFwiIGlkPVwicGFzc3dvcmRcIiBuZy1tb2RlbD1cImRhdGEucGFzc3dvcmRcIiBwbGFjZWhvbGRlcj1cIueZu+W9leWvhueggVwiIC8+PC9teS1pbnB1dD48L3A+PGRpdiBjbGFzcz1cImMtcmVkXCI+e3tkYXRhLndyaW5nfX08L2Rpdj48L2Rpdj4nLFxuICAgICAgICAgICAgICAgIHRpdGxlOiAn6K+36L6T5YWl5oKo55qE55m75b2V5a+G56CBJyxcbiAgICAgICAgICAgICAgICBzY29wZTogJHNjb3BlLFxuICAgICAgICAgICAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAge3RleHQ6ICflj5bmtognfSxcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGV4dDogJ+ehruWumicsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYy1yZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25UYXA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsZGF0ZVBhc3N3cm9kKCRzY29wZS5kYXRhLnBhc3N3b3JkLCBlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgICAgICBmdW5jdGlvbiB2YWxkYXRlUGFzc3dyb2QocGFzc3dvcmQsIGUpe1xuICAgICAgICAgICAgICAgIGdsb2JhbFNlcnZpY2VzLnNlcmlhbFBvc3QoMzEwMiwgJ3Bhc3N3b3JkJywge3Bhc3N3b3JkOiBtZDUocGFzc3dvcmQpfSkudGhlbihmdW5jdGlvbihyZSl7XG5cblxuICAgICAgICAgICAgICAgICAgICBpZiAocmUuaXNUcnVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBteVBvcHVwLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBidXlTdWJtaXQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlLmVyckNvdW50ID09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS53cmluZyA9ICfmgqjnmoTotKbmiLflt7LooqvplIHlrprvvIEnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBteVBvcHVwLmNsb3NlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygndGFiLmxvZ2luJywge2JhY2tVUkw6ICd0YWIuaW5kZXgnfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgMTAwMClcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZGF0YS53cmluZyA9ICflr4bnoIHovpPlhaXplJnor6/vvIzmgqjov5jmnIknICsgcmUuZXJyQ291bnQgKyAn5qyh5py65LyaJztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBidXlTdWJtaXQoKXtcblxuICAgICAgICAgICAgICAgIHZhciBidXlDb3VudCA9ICgoYW1vdW50LWNvdXBvbkFtb3VudCkgPCAwID8gJzAnIDogKGFtb3VudC1jb3Vwb25BbW91bnQpKTtcblxuICAgICAgICAgICAgICAgIGdsb2JhbFNlcnZpY2VzLnNlcmlhbFBvc3QoMjAwMCwgJ2J1eScsIHtwcm9ncmFtQ29kZTogcHJvZ3JhbUNvZGUsIGFtb3VudDogYW1vdW50LCBtY29pbjogYnV5Q291bnQsIGNvdXBvbkNvZGU6IGNvdXBvbkNvZGUgfHwgJycsIGNvdXBvbkFtb3VudDogY291cG9uQW1vdW50IHx8ICcnfSkudGhlbihmdW5jdGlvbihyZSl7XG4gICAgICAgICAgICAgICAgICAgICRpb25pY1BvcHVwLnNob3coe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwicHJvZ3JhbW1lLXN1Y2Nlc3NcIj48aW1nIHNyYz1cIi4vaW1nL3Byb2dyYW1tZS9jaGVuZ2dvbmcucG5nXCIgLz48cD7mgqjpgInmi6nnmoTmlrnmoYjlt7LorqLotK3miJDlip88YnIvPuelneaCqOWlvei/kDwvcD48c3R5bGU+LnBvcHVwLWJvZHl7b3ZlcmZsb3c6IHZpc2libGU7cGFkZGluZzowfTwvc3R5bGU+PC9kaXY+JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlOiAkc2NvcGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge3RleHQ6ICflj5bmtognfSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICfnoa7lrponLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYy1yZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblRhcDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygndGFiLnByb2dyYW1tZW9yZGVyJywge29yZGVyQ29kZTogcmUub3JkZXJDb2RlfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sXG4gICAgICAgIC8qXG4gICAgICAgICAqIEBwYXJhbSBzY29wZSB7T2JqZWN0fSBzY29wZeWvueixoVxuICAgICAgICAgKiBAdGFiT2JqIHtPYmplY3R9IOW9k+WJjeS8oOmAkui/h+adpeeahOaVsOaNrlxuICAgICAgICAgKiBAcGFnZSB7U3RyaW5nfSDmjIflrprliqDovb3nmoTpobXnoIFcbiAgICAgICAgICogQGZuIHtGdW5jdGlvbn0g5Zue6LCD5Ye95pWwXG4gICAgICAgICAqL1xuICAgICAgICBnZXRDb3Vwb246IGZ1bmN0aW9uKHNjb3BlLCBrZXksIHBhZ2UsIGZuKXtcblxuICAgICAgICAgICAgLy8g5aaC5p6c5LiN5piv5b2T5YmN5pi+56S655qE5bCx6L+U5ZueXG4gICAgICAgICAgICBpZiAoc2NvcGUuZGVmYXVsdC5pbmRleCAhPSBzY29wZVtrZXldLmZsYWcpIHJldHVybjtcblxuICAgICAgICAgICAgaWYgKHBhZ2UpIHtcbiAgICAgICAgICAgICAgICBzY29wZVtrZXldLnBhZ2UgPSBwYWdlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzY29wZVtrZXldLnBhZ2UgKz0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZ2xvYmFsU2VydmljZXMuc2VyaWFsUG9zdCgnMzIwMicsICdsaW1pdExpc3QnLCB7bG90dGVyeUNvZGU6IHNjb3BlLmRlZmF1bHQubG90dGVyeUNvZGUsIGFtb3VudDogc2NvcGUuZGVmYXVsdC5hbW91bnQsIHBhZ2U6IHNjb3BlW2tleV0ucGFnZSwgZmxhZzogc2NvcGVba2V5XS5mbGFnLCBwYWdlU2l6ZTogMTB9KS50aGVuKGZ1bmN0aW9uKHJlKXtcblxuICAgICAgICAgICAgICAgIC8vIOayoeaciei/lOWbnuaVsOaNrlxuICAgICAgICAgICAgICAgIGlmIChyZS5jb3Vwb25MaXN0Lmxlbmd0aCA8IDEwKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlW2tleV0uaXNNb3JlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHNjb3BlLiRicm9hZGNhc3QoJ3Njcm9sbC5pbmZpbml0ZVNjcm9sbENvbXBsZXRlJyk7XG5cbiAgICAgICAgICAgICAgICAvLyDnrKzkuIDpobVcbiAgICAgICAgICAgICAgICBpZiAoc2NvcGVba2V5XS5wYWdlID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGVba2V5XS5kYXRhID0gcmUuY291cG9uTGlzdDtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuY291cG9uRGF0YS5jYW5Vc2VTaXplID0gcmUuY2FuVXNlU2l6ZTtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuY291cG9uRGF0YS5jYW50VXNlU2l6ZSA9IHJlLmNhbnRVc2VTaXplO1xuICAgICAgICAgICAgICAgICAgICAvLyDkuIvmi4nliLfmlrDml7bmmL7npLrml6Dnur/liqDovb1cbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlLmNvdXBvbkxpc3QubGVuZ3RoID09IDEwKSBzY29wZVtrZXldLmlzTW9yZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGVba2V5XS5kYXRhID0gc2NvcGVba2V5XS5kYXRhLmNvbmNhdChyZS5jb3Vwb25MaXN0KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAoZm4pIGZuKCk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9LFxuICAgICAgICBnZXRPcmRlckRldGFpbDogZnVuY3Rpb24oJHNjb3BlLCBvcmRlcklkKXtcblxuXG4gICAgICAgICAgICBnbG9iYWxTZXJ2aWNlcy5wb3N0KDIxMDAsICdkZXRhaWwnLCB7b3JkZXJDb2RlOiBvcmRlcklkfSkudGhlbihmdW5jdGlvbihyZSl7XG5cbiAgICAgICAgICAgICAgICByZS5vcmRlci5ib251c051bWJlciA9IGxvdHRlcnlTZXJ2aWNlcy5zbGljZU51bShyZS5vcmRlci5ib251c051bWJlcik7XG4gICAgICAgICAgICAgICAgJHNjb3BlLm9yZGVyRGV0YWlsID0gcmUub3JkZXI7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG5cbiAgICB9XG5cbn1dKVxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiLy4uL2NvbnRhaW5lcnMvcHJvZ3JhbW1lL3Byb2dyYW1tZVNlcnZpY2VzLmpzXCIsXCIvLi4vY29udGFpbmVycy9wcm9ncmFtbWVcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG52YXIgY29udHJvbGxlck1vZHVsZSA9IHJlcXVpcmUoJy4uLy4uL2pzL2NvbnRyb2xsZXJNb2R1bGUuanMnKTtcblxuLyoqXG4gKiDnlKjmiLfkuK3lv4NcbiAqIEBkYXRlIDIwMTYtMDktMjVcbiAqIEBhdXRoIHpoYW5nXG4gKiBAdGVsIDE1MjEwMDA3MTg1XG4gKi9cblxuLy8g6LSm5oi35Lit5b+DXG5jb250cm9sbGVyTW9kdWxlLmNvbnRyb2xsZXIoJ1VzZXJBY2NvdW50Q3RybCcsIFsnJHNjb3BlJywgJ2dsb2JhbFNlcnZpY2VzJywgJ2FjY291bnRTZXJ2aWNlJywgZnVuY3Rpb24oJHNjb3BlLCBnbG9iYWxTZXJ2aWNlcywgYWNjb3VudFNlcnZpY2UpIHtcblxuICAgICRzY29wZS5pbWdIZWlnaHQgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50V2lkdGggKiA0ODAvNzUwO1xuXG5cbiAgICAkc2NvcGUuZG9SZWZyZXNoID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICAgYWNjb3VudFNlcnZpY2UuZ2V0QWNjb3VudCgkc2NvcGUpXG4gICAgfTtcblxuICAgIC8vIOWkhOeQhuS4i+aLieWIt+aWsOmakOiXj+mhteWktFxuICAgICRzY29wZS5zdGFydFNjcm9sbCA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgZ2xvYmFsU2VydmljZXMuaGFuZGxlSGVhZGVyKCk7XG5cbiAgICB9XG5cbiAgICAvLyDmmL7npLrliIbkuqvlsYJcbiAgICAkc2NvcGUuc2hvd1NoYXJnZUxheWVyID0gZnVuY3Rpb24oKXtcblxuICAgICAgICBhY2NvdW50U2VydmljZS5zaGFyZSh7XG4gICAgICAgICAgICBzaGFyZUhhbmRsZTogZnVuY3Rpb24obXNnKXtcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiBtc2cgMSDlvq7kv6HmnIvlj4tcbiAgICAgICAgICAgICAgICAgKiAgICAgMiDlvq7kv6HmnIvlj4vlnIhcbiAgICAgICAgICAgICAgICAgKiAgICAgMyDlvq7ljZpcbiAgICAgICAgICAgICAgICAgKi9cblxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH1cblxuXG4gICAgJHNjb3BlLiRvbignJGlvbmljVmlldy5hZnRlckVudGVyJywgZnVuY3Rpb24oKXtcbiAgICAgIGFjY291bnRTZXJ2aWNlLmdldEFjY291bnQoJHNjb3BlKVxuICAgIH0pXG59XSlcblxuXG4vL+S4quS6uui1hOaWmVxuY29udHJvbGxlck1vZHVsZS5jb250cm9sbGVyKCdVc2VyTXNnQ3RybCcsIFsnJHNjb3BlJywgJ2dsb2JhbFNlcnZpY2VzJywgJyRzdGF0ZScsICckaW9uaWNIaXN0b3J5JywgZnVuY3Rpb24oJHNjb3BlLCBnbG9iYWxTZXJ2aWNlcywgJHN0YXRlLCAkaW9uaWNIaXN0b3J5KSB7XG4gICAkc2NvcGUudXNlckRhdGEgPSBnbG9iYWxTZXJ2aWNlcy51c2VyQmFzZU1zZztcblxuICAgIC8v6YCA5Ye655m75b2VXG4gICAgJHNjb3BlLm91dExvZ2luID0gZnVuY3Rpb24oKXtcblxuICAgICAgICAvLyDmuIXpmaTnvJPlrZjnmoTotKbmiLfkv6Hmga9cbiAgICAgICAgZ2xvYmFsU2VydmljZXMubG9jYWxTdG9yYWdlSGFuZGxlKCdhY2NvdW50JywgJycpO1xuICAgICAgICBnbG9iYWxTZXJ2aWNlcy5zZXRVc2VyQmFzZU1zZygnJyk7XG4gICAgICAgICRpb25pY0hpc3RvcnkuY2xlYXJIaXN0b3J5KCk7XG4gICAgICAgICRzdGF0ZS5nbygndGFiLmxvZ2luJylcbiAgICB9XG5cbn1dKVxuXG5cbi8vIOeUqOaIt+WQjeiuvue9rlxuLmNvbnRyb2xsZXIoJ1VzZXJOYW1lQ3RybCcsIFsnJHNjb3BlJywgJ2dsb2JhbFNlcnZpY2VzJywgJ2FjY291bnRTZXJ2aWNlJywgZnVuY3Rpb24oJHNjb3BlLCBnbG9iYWxTZXJ2aWNlcywgYWNjb3VudFNlcnZpY2UpIHtcblxuICAgICRzY29wZS5pbnB1dERhdGEgPSB7XG4gICAgICAgIG1vYmlsZTogZ2xvYmFsU2VydmljZXMudXNlckJhc2VNc2cubW9iaWxlLFxuICAgICAgICBoZWFkSW1nVXJsOiBnbG9iYWxTZXJ2aWNlcy51c2VyQmFzZU1zZy5oZWFkSW1nVXJsXG4gICAgfTtcblxuICAgICRzY29wZS5zdWJtaXQgPSBmdW5jdGlvbigpe1xuICAgICAgICBhY2NvdW50U2VydmljZS5zZXRNZW1iZXJOYW1lKCRzY29wZS5pbnB1dERhdGEubWVtYmVyTmFtZSk7XG4gICAgfVxuXG59XSlcblxuLy8g5Liq5Lq65aS05YOPXG4uY29udHJvbGxlcignVXNlclBob3RvQ3RybCcsIFsnJHNjb3BlJywgJ2dsb2JhbFNlcnZpY2VzJywgJyRjb3Jkb3ZhQ2FtZXJhJywgJyRzdGF0ZScsIGZ1bmN0aW9uKCRzY29wZSwgZ2xvYmFsU2VydmljZXMsICAkY29yZG92YUNhbWVyYSwgJHN0YXRlKSB7XG4gICAgJHNjb3BlLnBob3RvVVJMID0gZ2xvYmFsU2VydmljZXMudXNlckJhc2VNc2cuaGVhZEltZ1VybCB8fCAnLi9pbWcvdXNlcmNlbnRlci91c2VycGhvdG8ucG5nJyxcbiAgICAgICAgY2FuY2VsRk4gPSBudWxsO1xuXG4gICAgICAgIC8vIOS4iuS8oOWbvuWDj1xuICAgICRzY29wZS5zZWxlY3RQaG90byA9IGZ1bmN0aW9uKCl7XG4gICAgICAgIGNhbmNlbEZOID0gZ2xvYmFsU2VydmljZXMuc2VsZWN0UHJvbXB0KHtcbiAgICAgICAgICAgIGZ1bmM6IFtcbiAgICAgICAgICAgICAgICB7dGV4dDogJ+S7juaJi+acuuebuOWGjOmAieaLqScsIHNpZ246IDB9LFxuICAgICAgICAgICAgICAgIHt0ZXh0OiAn54Wn55u4Jywgc2lnbjogMX0sXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgYWNjZXB0OiBmdW5jdGlvbihzZ2luKXtcbiAgICAgICAgICAgICAgICBzZWxlY3RVcGxvYWRUeXBlKHNnaW4pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgJHNjb3BlLiRvbignJGRlc3Ryb3knLCBmdW5jdGlvbigpe1xuICAgICAgICBjYW5jZWxGTiAmJiBjYW5jZWxGTigpO1xuICAgIH0pXG4gICAgdHJ5IHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICBxdWFsaXR5OiA1MCxcbiAgICAgICAgICAgIGRlc3RpbmF0aW9uVHlwZTogQ2FtZXJhLkRlc3RpbmF0aW9uVHlwZS5EQVRBX1VSST0wLFxuICAgICAgICAgICAgYWxsb3dFZGl0OiB0cnVlLFxuICAgICAgICAgICAgZW5jb2RpbmdUeXBlOiBDYW1lcmEuRW5jb2RpbmdUeXBlLkpQRUcsXG4gICAgICAgICAgICB0YXJnZXRXaWR0aDogMTAwLFxuICAgICAgICAgICAgdGFyZ2V0SGVpZ2h0OiAxMDAsXG4gICAgICAgICAgICBwb3BvdmVyT3B0aW9uczogQ2FtZXJhUG9wb3Zlck9wdGlvbnMsXG4gICAgICAgICAgICBzYXZlVG9QaG90b0FsYnVtOiBmYWxzZSxcbiAgICAgICAgICAgIGNvcnJlY3RPcmllbnRhdGlvbjp0cnVlXG4gICAgICAgIH07XG4gICAgfSBjYXRjaChlKXtcblxuICAgIH1cbiAgICBmdW5jdGlvbiBzZWxlY3RVcGxvYWRUeXBlIChzaWduKSB7XG4gICAgICB2YXIgZmlsZSwgZnIsIGltZ0RhdGE7XG5cbiAgICAgIC8vIOS4jeaYr2FwcFxuICAgICAgaWYgKCF3aW5kb3cuZGV2aWNlKSB7XG5cbiAgICAgICAgZmlsZSA9IHNpZ24uZmlsZXNbMF07XG5cblxuXG4gICAgICAgIGlmICghL2ltYWdlLy50ZXN0KGZpbGUudHlwZSkpIHtcbiAgICAgICAgICBnbG9iYWxTZXJ2aWNlcy5lcnJvclByb21wdCgn6K+36YCJ5oup5q2j56Gu55qE5Zu+5YOP5paH5Lu2Jyk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGZyID0gbmV3IEZpbGVSZWFkZXIoKTtcblxuICAgICAgICBmci5vbmxvYWQgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgJHNjb3BlLnBob3RvVVJMID0gZS50YXJnZXQucmVzdWx0O1xuICAgICAgICAgIGltZ0RhdGEgPSAkc2NvcGUucGhvdG9VUkwuc3Vic3RyaW5nKCRzY29wZS5waG90b1VSTC5pbmRleE9mKCdiYXNlNjQsJykgKyA3KTtcbiAgICAgICAgICB1cGRhdGVJbWcoaW1nRGF0YSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgZnIucmVhZEFzRGF0YVVSTChmaWxlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfTtcblxuICAgICAgLy8g6buY6K6k5piv5Zu+5bqTXG4gICAgICB2YXIgdHlwZSA9ICdQSE9UT0xJQlJBUlknO1xuXG5cbiAgICAgIC8vIOaLjeeFp1xuICAgICAgaWYgKHNpZ24gPT0gMSkge1xuICAgICAgICB0eXBlID0gJ0NBTUVSQSc7XG4gICAgICB9XG5cbiAgICAgIHRyeSB7XG4gICAgICAgIG9wdGlvbnMuc291cmNlVHlwZSA9IENhbWVyYS5QaWN0dXJlU291cmNlVHlwZVt0eXBlXTtcblxuXG4gICAgICAgICRjb3Jkb3ZhQ2FtZXJhLmdldFBpY3R1cmUob3B0aW9ucykudGhlbihmdW5jdGlvbiAoaW1hZ2VEYXRhKSB7XG4gICAgICAgICAgJHNjb3BlLnBob3RvVVJMID0gJ2RhdGE6aW1hZ2UvanBlZztiYXNlNjQsJyArIGltYWdlRGF0YTtcbiAgICAgICAgICB1cGRhdGVJbWcoaW1hZ2VEYXRhKTtcblxuICAgICAgICB9KVxuXG4gICAgICB9IGNhdGNoKGUpe1xuXG4gICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIHVwZGF0ZUltZyhpbWFnZURhdGEpe1xuXG4gICAgICBnbG9iYWxTZXJ2aWNlcy5wb3N0KCczMTAzJywgJ2hlYWRJbWcnLCB7aGVhZEltZ1VybDogaW1hZ2VEYXRhfSkudGhlbihmdW5jdGlvbihyZSl7XG5cbiAgICAgICAgaWYgKHJlLmZpbGVVcmwpIHtcbiAgICAgICAgICBnbG9iYWxTZXJ2aWNlcy51c2VyQmFzZU1zZy5oZWFkSW1nVXJsID0gcmUuZmlsZVVybDtcbiAgICAgICAgICBnbG9iYWxTZXJ2aWNlcy5zZXRVc2VyQmFzZU1zZyhnbG9iYWxTZXJ2aWNlcy51c2VyQmFzZU1zZyk7XG4gICAgICAgIH1cbiAgICAgICAgJHN0YXRlLmdvKCd0YWIudXNlcm1zZycpO1xuICAgICAgfSlcbiAgICB9XG5cbn1dKVxuXG4vLyDkv67mlLnlr4bnoIFcbi5jb250cm9sbGVyKCdNb2RpdHlQYXNzd29yZEN0cmwnLCBbJyRzY29wZScsICdhY2NvdW50U2VydmljZScsIGZ1bmN0aW9uKCRzY29wZSwgYWNjb3VudFNlcnZpY2UpIHtcbiAgICAkc2NvcGUuaW5wdXREYXRhID0ge307XG4gICAgJHNjb3BlLmZvcm1TdWIgPSBmdW5jdGlvbigpe1xuICAgICAgICBhY2NvdW50U2VydmljZS5tb2RpZnlQYXNzd29yZCgkc2NvcGUuaW5wdXREYXRhKTtcbiAgICB9XG59XSlcblxuLy8g6K6+572u5a+G56CBXG4uY29udHJvbGxlcignU2V0UGFzc3dvcmRDdHJsJywgWyckc2NvcGUnLCAnYWNjb3VudFNlcnZpY2UnLCBmdW5jdGlvbigkc2NvcGUsIGFjY291bnRTZXJ2aWNlKSB7XG4gICAgJHNjb3BlLmlucHV0RGF0YSA9IHt9O1xuICAgICRzY29wZS5mb3JtU3ViID0gZnVuY3Rpb24oKXtcbiAgICAgICAgYWNjb3VudFNlcnZpY2Uuc2V0UGFzc3dvcmQoJHNjb3BlLmlucHV0RGF0YSk7XG4gICAgfVxufV0pXG5cbi8vIOe7keWumuaJi+acuuWPt1xuLmNvbnRyb2xsZXIoJ1VzZXJNb2JpbGVDdHJsJywgWyckc2NvcGUnLCAnZ2xvYmFsU2VydmljZXMnLCAgJ2FjY291bnRTZXJ2aWNlJywgZnVuY3Rpb24oJHNjb3BlLCBnbG9iYWxTZXJ2aWNlcywgYWNjb3VudFNlcnZpY2UpIHtcblxuICAgICAgICAkc2NvcGUuaW5wdXREYXRhID0ge307XG5cbiAgICAgICAgJHNjb3BlLmZvcm1TdWIgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgYWNjb3VudFNlcnZpY2UuYmluZE1vYmlsZSgkc2NvcGUuaW5wdXREYXRhLm1vYmlsZSlcbiAgICAgICAgfVxuXG59XSlcblxuXG4vLyDogZTlkIjotKbmiLdcbi5jb250cm9sbGVyKCdVc2VyVW5pb25DdHJsJywgWyckc2NvcGUnLCAnZ2xvYmFsU2VydmljZXMnLCAnJGlvbmljUG9wdXAnLCAnJHN0YXRlJywgZnVuY3Rpb24oJHNjb3BlLCBnbG9iYWxTZXJ2aWNlcywgJGlvbmljUG9wdXAsICRzdGF0ZSkge1xuXG4gICAgICAgIC8vdmFyIHBvcCA9ICRpb25pY1BvcHVwLnNob3coe1xuICAgICAgICAvLyAgICB0ZW1wbGF0ZTogJzxkaXYgc3R5bGU9XCJtYXJnaW46IDE1cHggMCA1cHhcIj48cGFzcy13b3JkIHN0eWxlPVwibWFyZ2luLWJvdHRvbTogM3B4O1wiIHBhc3N3b3JkPVwicGFzc3dvcmRcIiBwbGFjZWhvbGRlcj1cIuivt+i+k+WFpeWvhueggVwiPjwvcGFzcy13b3JkPjxwIGNsYXNzPVwiYy1yZWQgZnMtMTNcIj7lr4bnoIHplJnor6/vvIzor7fph43mlrDovpPlhaU8L3A+PC9kaXY+JyxcbiAgICAgICAgLy8gICAgdGl0bGU6ICfor7fovpPlhaXlr4bnoIEnLFxuICAgICAgICAvLyAgICBzY29wZTogJHNjb3BlLFxuICAgICAgICAvLyAgICBidXR0b25zOiBbXG4gICAgICAgIC8vICAgICAgICB7IHRleHQ6ICflj5bmtognIH0sXG4gICAgICAgIC8vICAgICAgICB7XG4gICAgICAgIC8vICAgICAgICAgICAgdGV4dDogJzxiPuehruWumjwvYj4nLFxuICAgICAgICAvLyAgICAgICAgICAgIHR5cGU6ICdjLXJlZCcsXG4gICAgICAgIC8vICAgICAgICAgICAgb25UYXA6IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAvLyAgICAgICAgICAgICAgICAgICAgcG9wLmNsb3NlKCk7XG4gICAgICAgIC8vICAgICAgICAgICAgICAgIH0sIDEwMDApXG4gICAgICAgIC8vICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgLy8gICAgICAgICAgICB9XG4gICAgICAgIC8vICAgICAgICB9LFxuICAgICAgICAvLyAgICBdXG4gICAgICAgIC8vfSk7XG5cbiAgICAgICAgLy8kaW9uaWNQb3B1cC5zaG93KHtcbiAgICAgICAgLy8gICAgdGVtcGxhdGU6ICc8ZGl2PjxwIGNsYXNzPVwiYy0zMzMgZnMtMTZcIiBzdHlsZT1cIm1hcmdpbjogMjBweCA1cHggM3B4O1wiPuaCqOehruWumuimgeino+mZpOW+ruS/oei0puaIt+S4juW9k+WJjei0puaIt+eahOe7keWumj/jgII8L3A+PHAgY2xhc3M9XCJmcy0xM1wiIHN0eWxlPVwibWFyZ2luOiAwIDVweCAyM3B4O1wiPuino+mZpOe7keWumuWQju+8jOaCqOS7heWPr+mAmui/h+W9k+WJjei0puaIt+e7keWumueahOaJi+acuuWPt+aIlueUqOaIt+WQjeeZu+W9lTwvcD48L2Rpdj4nLFxuICAgICAgICAvLyAgICB0aXRsZTogJ+ino+mZpOiBlOWQiOe7keWumicsXG4gICAgICAgIC8vICAgIHNjb3BlOiAkc2NvcGUsXG4gICAgICAgIC8vICAgIGJ1dHRvbnM6IFtcbiAgICAgICAgLy8gICAgICAgIHsgdGV4dDogJ+WPlua2iCcgfSxcbiAgICAgICAgLy8gICAgICAgIHtcbiAgICAgICAgLy8gICAgICAgICAgICB0ZXh0OiAnPGI+56Gu5a6aPC9iPicsXG4gICAgICAgIC8vICAgICAgICAgICAgdHlwZTogJ2MtcmVkJyxcbiAgICAgICAgLy8gICAgICAgICAgICBvblRhcDogZnVuY3Rpb24oZSkge1xuICAgICAgICAvLyAgICAgICAgICAgICAgIGFsZXJ0KDMpXG4gICAgICAgIC8vICAgICAgICAgICAgfVxuICAgICAgICAvLyAgICAgICAgfSxcbiAgICAgICAgLy8gICAgXVxuICAgICAgICAvL30pO1xuXG4gICAgICAgICRzY29wZS5iaW5kQWNjb3VudCA9IGZ1bmN0aW9uKG1zZykge1xuXG4gICAgICAgICAgICB2YXIgcG9wID0gJGlvbmljUG9wdXAuc2hvdyh7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGU6ICc8cCBjbGFzcz1cImMtMzMzIGZzLTE1XCIgc3R5bGU9XCJtYXJnaW46IDMwcHggNXB4IDMzcHg7XCI+5oKo5bCa5pyq6K6+572u55m76ZmG5a+G56CB77yM6Kej57uR6IGU5ZCI6LSm5oi35ZCO5Y+v6IO96YCg5oiQ6LSm5oi35peg5rOV55m76ZmG44CCPC9wPicsXG4gICAgICAgICAgICAgICAgdGl0bGU6ICfop6PpmaTogZTlkIjnu5HlrponLFxuICAgICAgICAgICAgICAgIHNjb3BlOiAkc2NvcGUsXG4gICAgICAgICAgICAgICAgYnV0dG9uczogW1xuICAgICAgICAgICAgICAgICAgICB7dGV4dDogJ+WPlua2iCd9LFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAnPGI+6ams5LiK6K6+572uPC9iPicsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYy1yZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgb25UYXA6IGZ1bmN0aW9uIChlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDpgJrnn6Xorr7nva7lr4bnoIHpobUs6K6+572u5a+G56CB5oiQ5Yqf5ZCO6L+U5Zue55qE6aG16Z2iXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCd0YWIuYWNjb3VudHNldHBhc3N3b3JkJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbn1dKVxuLy8g5oiR55qE6K6i5Y2VXG4gICAgLmNvbnRyb2xsZXIoJ09yZGVyQ3RybCcsIFsnJHNjb3BlJywgJ2dsb2JhbFNlcnZpY2VzJywgJ2FjY291bnRTZXJ2aWNlJywgJyRzdGF0ZScsIGZ1bmN0aW9uKCRzY29wZSwgZ2xvYmFsU2VydmljZXMsIGFjY291bnRTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgICAgICAkc2NvcGUub3JkZXJzID0gW107XG4gICAgICAgICRzY29wZS5pc01vcmUgPSB0cnVlO1xuXG4gICAgICAgIHZhciBnZXRPcmRlckxpc3QgPSBhY2NvdW50U2VydmljZS5vcmRlckxpc3QoJHNjb3BlKTtcblxuICAgICAgICAkc2NvcGUubG9hZE1vcmUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGdldE9yZGVyTGlzdCgpO1xuICAgICAgICB9XG4gICAgICAgICRzY29wZS5kb1JlZnJlc2ggPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgZ2V0T3JkZXJMaXN0KDEpO1xuICAgICAgICB9XG4gICAgfV0pXG5cblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9jb250YWluZXJzL3VzZXJjZW50ZXIvVXNlckFjY291bnRDb250cm9sbGVyLmpzXCIsXCIvLi4vY29udGFpbmVycy91c2VyY2VudGVyXCIpIiwiKGZ1bmN0aW9uIChwcm9jZXNzLGdsb2JhbCxCdWZmZXIsX19hcmd1bWVudDAsX19hcmd1bWVudDEsX19hcmd1bWVudDIsX19hcmd1bWVudDMsX19maWxlbmFtZSxfX2Rpcm5hbWUpe1xudmFyIHNlcnZpY2VNb2R1bGUgPSByZXF1aXJlKCcuLi8uLi9qcy9zZXJ2aWNlTW9kdWxlLmpzJyk7XG5cbi8qKlxuICogQGRhdGUgMjAxNi0wOS0zMFxuICogQGF1dGggemhhbmdcbiAqIEB0ZWwgMTUyMTAwMDcxODVcbiAqL1xuXG5zZXJ2aWNlTW9kdWxlLmZhY3RvcnkoJ2FjY291bnRTZXJ2aWNlJywgWydnbG9iYWxTZXJ2aWNlcycsICckc3RhdGUnLCAnJHJvb3RTY29wZScsICckZG9jdW1lbnQnLCAnJGNvbXBpbGUnLCAnZW50cnlTZXJ2aWNlcycsIGZ1bmN0aW9uKGdsb2JhbFNlcnZpY2VzLCAkc3RhdGUsICRyb290U2NvcGUsICRkb2N1bWVudCwgJGNvbXBpbGUsIGVudHJ5U2VydmljZXMpe1xuICAgIHJldHVybntcbiAgICAgICAgZ2V0QWNjb3VudDogZnVuY3Rpb24oJHNjb3BlKXtcbiAgICAgICAgICAkc2NvcGUuYWNjb3VudEluZm8gPSBnbG9iYWxTZXJ2aWNlcy51c2VyQmFzZU1zZztcblxuICAgICAgICAgICAgZ2xvYmFsU2VydmljZXMucG9zdCgnMzEwMicsICdtZW1iZXInLCB7fSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZSkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuYWNjb3VudEluZm8gPSByZTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Njcm9sbC5yZWZyZXNoQ29tcGxldGUnKTtcbiAgICAgICAgICAgICAgICAgICAgLy8g5pu05paw55So5oi35L+h5oGvXG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbFNlcnZpY2VzLnNldFVzZXJCYXNlTXNnKGFuZ3VsYXIuZXh0ZW5kKHt0b2tlbjogZ2xvYmFsU2VydmljZXMudXNlckJhc2VNc2cudG9rZW59LCByZSkpO1xuICAgICAgICAgICAgICAgICAgICBnbG9iYWxTZXJ2aWNlcy5sb2NhbFN0b3JhZ2VIYW5kbGUoJ2FjY291bnQnLCB7XCJtb2JpbGVcIjogcmUubW9iaWxlLCBcInBhc3N3b3JkXCI6ICBnbG9iYWxTZXJ2aWNlcy5sb2NhbFN0b3JhZ2VIYW5kbGUoJ2FjY291bnQnKS5wYXNzd29yZH0pO1xuICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKG1zZyl7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYnJvYWRjYXN0KCdzY3JvbGwucmVmcmVzaENvbXBsZXRlJyk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgICAgLy8g6K6+572u55So5oi35ZCNXG4gICAgICAgIHNldE1lbWJlck5hbWU6IGZ1bmN0aW9uKG1lbWJlck5hbWUpe1xuICAgICAgICAgICAgZ2xvYmFsU2VydmljZXMuc2VyaWFsUG9zdCgnMzEwMycsICdtZW1iZXJOYW1lJywge21lbWJlck5hbWU6IG1lbWJlck5hbWV9KS50aGVuKGZ1bmN0aW9uKHJlKXtcblxuICAgICAgICAgICAgICAgIC8vIOabtOaWsOeUqOaIt+S/oeaBr1xuICAgICAgICAgICAgICAgIGdsb2JhbFNlcnZpY2VzLnNldFVzZXJCYXNlTXNnKGFuZ3VsYXIuZXh0ZW5kKGdsb2JhbFNlcnZpY2VzLnVzZXJCYXNlTXNnLCB7bWVtYmVyTmFtZTogbWVtYmVyTmFtZX0pKVxuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygndGFiLnVzZXJtc2cnKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgICAgIC8vIOe7keWumuaJi+acuuWPt1xuICAgICAgICBiaW5kTW9iaWxlOiBmdW5jdGlvbihtb2JpbGUpe1xuICAgICAgICAgICAgZ2xvYmFsU2VydmljZXMuc2VyaWFsUG9zdCgnMzEwMycsICdtb2JpbGUnLCB7bW9iaWxlOiBtb2JpbGV9KS50aGVuKGZ1bmN0aW9uKHJlKXtcblxuICAgICAgICAgICAgICAgIC8vIOS/ruaUuee8k+WtmOeUqOaIt+S/oeaBr++8iOaJi+acuuWPt+W3sue7keWumu+8iVxuICAgICAgICAgICAgICAgIGdsb2JhbFNlcnZpY2VzLnNldFVzZXJCYXNlTXNnKGFuZ3VsYXIuZXh0ZW5kKHttb2JpbGU6IG1vYmlsZX0sIGdsb2JhbFNlcnZpY2VzLnVzZXJCYXNlTXNnKSlcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ3RhYi51c2VybXNnJywgbnVsbCwge3JlbG9hZDogdHJ1ZX0pO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcblxuICAgICAgICAvLyDkv67mlLnlr4bnoIFcbiAgICAgICAgbW9kaWZ5UGFzc3dvcmQ6IGZ1bmN0aW9uKGRhdGEpe1xuXG4gICAgICAgICAgICB2YXIgcGFzc3dvcmQgPSBtZDUoZGF0YS5wYXNzd29yZCksXG4gICAgICAgICAgICAgICAgb2xkUGFzc3dvcmQgPSBtZDUoZGF0YS5vbGRQYXNzd29yZCk7XG5cbiAgICAgICAgICAgIGlmIChkYXRhLnBhc3N3b3JkID09IGRhdGEucmVwZWF0UGFzc3dvcmQpIHtcbiAgICAgICAgICAgICAgICBnbG9iYWxTZXJ2aWNlcy5zZXJpYWxQb3N0KCczMTAzJywgJ3Bhc3N3b3JkJywge3Bhc3N3b3JkOiBwYXNzd29yZCwgb2xkUGFzc3dvcmQ6IG9sZFBhc3N3b3JkfSkudGhlbihmdW5jdGlvbihyZSl7XG5cbiAgICAgICAgICAgICAgICAgICAgZ2xvYmFsU2VydmljZXMubG9jYWxTdG9yYWdlSGFuZGxlKCdhY2NvdW50Jywge21vYmlsZTogZ2xvYmFsU2VydmljZXMudXNlckJhc2VNc2cubW9iaWxlLCBwYXNzd29yZDogcGFzc3dvcmR9KVxuICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ3RhYi51c2VybXNnJyk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuICAgICAgICAvLyDorr7nva7lr4bnoIFcbiAgICAgICAgc2V0UGFzc3dvcmQ6IGZ1bmN0aW9uKGRhdGEpe1xuXG4gICAgICAgICAgICBkYXRhLm1vYmlsZSA9IGdsb2JhbFNlcnZpY2VzLnVzZXJCYXNlTXNnLm1vYmlsZTtcbiAgICAgICAgICAgIHZhciBwYXNzd29yZCA9IG1kNShkYXRhLnBhc3N3b3JkKTtcblxuICAgICAgICAgICAgaWYgKGRhdGEucGFzc3dvcmQgIT0gZGF0YS5yZXBlYXRQYXNzd29yZCkgcmV0dXJuO1xuICAgICAgICAgICAgZ2xvYmFsU2VydmljZXMuc2VyaWFsUG9zdCgnMzEwMycsICdyZXNldFBhc3N3b3JkJywge21vYmlsZTogZGF0YS5tb2JpbGUsIHBhc3N3b3JkOiBwYXNzd29yZH0pLnRoZW4oZnVuY3Rpb24ocmUpe1xuICAgICAgICAgICAgICAgIGdsb2JhbFNlcnZpY2VzLmxvY2FsU3RvcmFnZUhhbmRsZSgnYWNjb3VudCcsIHtcIm1vYmlsZVwiOiBkYXRhLm1vYmlsZSwgXCJwYXNzd29yZFwiOiBwYXNzd29yZH0pXG4gICAgICAgICAgICAgICAgLy8g5L+u5pS557yT5a2Y55So5oi35L+h5oGv77yI5a+G56CB5bey6K6+572u77yJXG4gICAgICAgICAgICAgICAgZ2xvYmFsU2VydmljZXMuc2V0VXNlckJhc2VNc2coYW5ndWxhci5leHRlbmQoZ2xvYmFsU2VydmljZXMudXNlckJhc2VNc2csIHtzZXRQYXNzd29yZDogMX0pKVxuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygndGFiLnVzZXJtc2cnKTtcbiAgICAgICAgICAgIH0pXG5cbiAgICAgICAgfSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOiOt+WPluiuouWNleWIl+ihqFxuICAgICAgICAgKiBAcGFyYW0gJHNjb3BlXG4gICAgICAgICAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAgICAgICAgICovXG4gICAgICAgIG9yZGVyTGlzdDogZnVuY3Rpb24oJHNjb3BlKXtcbiAgICAgICAgICAgIHZhciBwYWdlID0gMDtcblxuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGFyZ1BhZ2Upe1xuXG4gICAgICAgICAgICAgICAgaWYgKGFyZ1BhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgcGFnZSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHBhZ2UgKz0gMTtcblxuICAgICAgICAgICAgICAgIGdsb2JhbFNlcnZpY2VzLnNlcmlhbFBvc3QoJzIxMDAnLCAnbGlzdCcsIHtwYWdlOiBwYWdlLCBwYWdlU2l6ZTogMjB9KS50aGVuKGZ1bmN0aW9uKHJlKXtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIWFyZ1BhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5vcmRlcnMgPSAkc2NvcGUub3JkZXJzLmNvbmNhdChyZS5vcmRlckxpc3QpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRicm9hZGNhc3QoJ3Njcm9sbC5pbmZpbml0ZVNjcm9sbENvbXBsZXRlJyk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnc2Nyb2xsLnJlZnJlc2hDb21wbGV0ZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmlzTW9yZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBpZiAocmUuaXRlbVRvdGFsIDwgMTUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5pc01vcmUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG5cblxuICAgICAgICB9LFxuICAgICAgICAvLyDliIbkuqtcbiAgICAgICAgc2hhcmU6IGZ1bmN0aW9uKHBhcmFtcyl7XG4gICAgICAgICAgICB2YXIgaHRtbCA9ICc8ZGl2IGNsYXNzPVwic2hhcmUtbGF5ZXJcIiBuZy1jbGljaz1cImNsb3NlTGF5ZXIoKVwiPjxkaXYgY2xhc3M9XCJyb3dcIj4gPGRpdiBjbGFzcz1cImNvbFwiIG5nLWNsaWNrPVwic2hhcmVIYW5kbGUoMSlcIj48aW1nIHNyYz1cIi4vaW1nL3VzZXJjZW50ZXIvYnRfd2VpeGluLnBuZ1wiIC8+PGJyLz7lvq7kv6E8L2Rpdj4nICtcbiAgICAgICAgICAgICAgICAnPGRpdiBjbGFzcz1cImNvbFwiIG5nLWNsaWNrPVwic2hhcmVIYW5kbGUoMilcIj48aW1nIHNyYz1cIi4vaW1nL3VzZXJjZW50ZXIvYnRfcGVuZ3lvdXF1YW4ucG5nXCIgLz4nICtcbiAgICAgICAgICAgICAgICAnPGJyLz7mnIvlj4vlnIg8L2Rpdj48ZGl2IGNsYXNzPVwiY29sXCIgbmctY2xpY2s9XCJzaGFyZUhhbmRsZSgzKVwiPjxpbWcgc3JjPVwiLi9pbWcvdXNlcmNlbnRlci9idF93ZWliby5wbmdcIiAvPjxici8+5b6u5Y2aPC9kaXY+PC9kaXY+PC9kaXY+JztcblxuXG4gICAgICAgICAgICB2YXIgZG9tID0gYW5ndWxhci5lbGVtZW50KGh0bWwpO1xuICAgICAgICAgICAgdmFyIHNjb3BlID0gJHJvb3RTY29wZS4kbmV3KCk7XG4gICAgICAgICAgICBhbmd1bGFyLmV4dGVuZChzY29wZSwge1xuICAgICAgICAgICAgICAgIGNsb3NlTGF5ZXI6IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgIFwidXNlIHN0cmljdFwiO1xuICAgICAgICAgICAgICAgICAgICBkb20ucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBzaGFyZUhhbmRsZTogcGFyYW1zLnNoYXJlSGFuZGxlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICRkb2N1bWVudC5maW5kKCdib2R5JykuYXBwZW5kKGRvbSk7XG5cbiAgICAgICAgICAgICRjb21waWxlKGRvbSkoc2NvcGUpO1xuXG5cbiAgICAgICAgfVxuXG4gICAgfVxufV0pXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvLi4vY29udGFpbmVycy91c2VyY2VudGVyL2FjY291bnRTZXJ2aWNlcy5qc1wiLFwiLy4uL2NvbnRhaW5lcnMvdXNlcmNlbnRlclwiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbnZhciBjb250cm9sbGVyTW9kdWxlID0gcmVxdWlyZSgnLi4vLi4vanMvY29udHJvbGxlck1vZHVsZS5qcycpO1xuXG4vKipcbiAqIOeUqOaIt+S4reW/g1xuICogQGRhdGUgMjAxNi0xMC0yN1xuICogQGF1dGggemhhbmdcbiAqIEB0ZWwgMTUyMTAwMDcxODVcbiAqL1xuXG4vLyDotKbmiLfkuK3lv4NcbmNvbnRyb2xsZXJNb2R1bGUuY29udHJvbGxlcignVXNlckZ1bmNDdHJsJywgWyckc2NvcGUnLCAnZ2xvYmFsU2VydmljZXMnLCAnYWNjb3VudFNlcnZpY2UnLCBmdW5jdGlvbigkc2NvcGUsIGdsb2JhbFNlcnZpY2VzLCBhY2NvdW50U2VydmljZSkge1xuXG4gICAgJHNjb3BlLmxvYWRNb3JlID0gZnVuY3Rpb24oKXtcblxuICAgICAgICBhbGVydCgzKVxuICAgIH1cbiAgICAkc2NvcGUudGV4dCA9ICflvKAnXG5cbn1dKVxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi8uLi9jb250YWluZXJzL3VzZXJmdW5jL1VzZXJGdW5jQ3RybC5qc1wiLFwiLy4uL2NvbnRhaW5lcnMvdXNlcmZ1bmNcIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vL1xubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtcblxuICAgIHJldHVybiBhbmd1bGFyLm1vZHVsZSgnc3RhcnRlci5jb250cm9sbGVycycsIFtdKTtcblxuXG59KCkpXG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKFwickgxSlBHXCIpLHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSxyZXF1aXJlKFwiYnVmZmVyXCIpLkJ1ZmZlcixhcmd1bWVudHNbM10sYXJndW1lbnRzWzRdLGFyZ3VtZW50c1s1XSxhcmd1bWVudHNbNl0sXCIvY29udHJvbGxlck1vZHVsZS5qc1wiLFwiL1wiKSIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwsQnVmZmVyLF9fYXJndW1lbnQwLF9fYXJndW1lbnQxLF9fYXJndW1lbnQyLF9fYXJndW1lbnQzLF9fZmlsZW5hbWUsX19kaXJuYW1lKXtcbi8vXG5tb2R1bGUuZXhwb3J0cyA9IChmdW5jdGlvbigpe1xuICAgIHJldHVybiBhbmd1bGFyLm1vZHVsZSgnc3RhcnRlci5kaXJlY3RpdmVzJywgW10pXG5cbiAgICAgIC8vIOiuvue9rumrmOW6plxuICAgICAgLmRpcmVjdGl2ZSgnc2V0SGVpZ2h0JywgZnVuY3Rpb24oKXtcbiAgICAgICAgICBcInVzZSBzdHJpY3RcIjtcbiAgICAgICAgICByZXR1cm57XG4gICAgICAgICAgICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgICAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlLCBhdHRycyl7XG5cbiAgICAgICAgICAgICAgICAgIGVsZS5jc3MoJ2hlaWdodCcsIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRIZWlnaHQgLSBlbGVbMF0uZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wIC0gNDQgKyAncHgnKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC8vIGNoZWNrYm94XG4gICAgICAuZGlyZWN0aXZlKCdjaGVja0JveCcsIGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgcmV0dXJue1xuICAgICAgICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIG5hbWU6ICdAJyxcbiAgICAgICAgICAgIHZhbHVlOiAnPSdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHRlbXBsYXRlOiAnIDxkaXYgY2xhc3M9XCJjaGVja2JveC1idG5cIiBvbi10YXA9XCJ0b2dnbGVIYW5kbGUoKVwiPjxpIGNsYXNzPVwiaWNvbiBpY29uLWFyY1wiIG5nLWNsYXNzPVwie1xcJ2ljb24tc2VsZWN0ZWRcXCc6IHZhbHVlfVwiPjwvaT57e25hbWV9fTwvZGl2PicsXG4gICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZSwgYXR0cnMpe1xuXG4gICAgICAgICAgICBzY29wZS50b2dnbGVIYW5kbGUgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICBzY29wZS52YWx1ZSA9ICFzY29wZS52YWx1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAvLyBkZWxldGVcbiAgICAgIC5kaXJlY3RpdmUoJ2RlbGV0ZUJ0bicsIGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybntcbiAgICAgICAgICByZXN0cmljdDogJ0FFJyxcblxuICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cImRlbGV0ZS1idG5cIiBvbi10YXA9XCJ0b2dnbGVIYW5kbGUoKVwiPjxpIGNsYXNzPVwiaWNvbiBpY29uLWRlbGV0ZVwiPjwvaT57e25hbWV9fTwvZGl2PicsXG4gICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZSwgYXR0cnMpe1xuICAgICAgICAgICAgc2NvcGUubmFtZSA9IGF0dHJzLm5hbWU7XG5cbiAgICAgICAgICAgIHNjb3BlLnRvZ2dsZUhhbmRsZSA9IGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseShhdHRycy5kZWxldGVIYW5kbGUpO1xuICAgICAgICAgICAgICB9LCAwKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC8vIOaHkuWKoOi9veWbvueJh1xuICAgICAgLmRpcmVjdGl2ZSgnc2V0VGltZU91dExvYWRJbWcnLCBbJyRpb25pY1Njcm9sbERlbGVnYXRlJywgZnVuY3Rpb24oJGlvbmljU2Nyb2xsRGVsZWdhdGUpe1xuICAgICAgICByZXR1cm57XG4gICAgICAgICAgcmVzdHJpY3Q6ICdBRScsXG4gICAgICAgICAgcmVwbGFjZTogdHJ1ZSxcbiAgICAgICAgICB0cmFuc2NsdWRlOiB0cnVlLFxuICAgICAgICAgIHRlbXBsYXRlOiAnPGlvbi1jb250ZW50ICBvdmVyZmxvdy1zY3JvbGw9XCJmYWxzZVwiIGhhcy1ib3VuY2luZz1cInRydWVcIiBkZWxlZ2F0ZS1oYW5kbGU9XCJvU2Nyb2xsXCIgb24tc2Nyb2xsPVwic2Nyb2xsSGFuZGxlKClcIiA+PGRpdiBuZy10cmFuc2NsdWRlPVwiXCI+PC9kaXY+IDwvaW9uLWNvbnRlbnQ+JyxcbiAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlLCBhdHRycyl7XG5cbiAgICAgICAgICAgIHZhciBvU2Nyb2xsID0gJGlvbmljU2Nyb2xsRGVsZWdhdGUuJGdldEJ5SGFuZGxlKCdvU2Nyb2xsJyksXG4gICAgICAgICAgICAgIHdpbkggPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50SGVpZ2h0LFxuICAgICAgICAgICAgICBzY3JvbGxEYXRhID0gbnVsbCwgb0ltZ3MsXG4gICAgICAgICAgICAgIG9JbWcgPSBudWxsLCBpbWdTcmMsIGJCdG4gPSB0cnVlO1xuXG5cbiAgICAgICAgICAgIC8vIOazqOWGjCA9PiDpobXpnaLliqDovb3lrozmiJDlkI7liqDovb3lm77niYdcbiAgICAgICAgICAgIHNjb3BlLiRvbignbG9hZEltZycsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgIGxvYWRJbWcoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgc2V0VGltZW91dChsb2FkSW1nLCAyMDApO1xuICAgICAgICAgICAgc2NvcGUuc2Nyb2xsSGFuZGxlID0gZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgICBpZiAoIWJCdG4pIHJldHVybjtcbiAgICAgICAgICAgICAgYkJ0biA9IGZhbHNlO1xuICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgc2Nyb2xsRGF0YSA9IG9TY3JvbGwuZ2V0U2Nyb2xsUG9zaXRpb24oKTtcbiAgICAgICAgICAgICAgICBsb2FkSW1nKCk7XG5cbiAgICAgICAgICAgICAgICAvLyDop6blj5HkuIrnuqfms6jlhoznmoRzY29ybGxpbmcg5LqL5Lu2XG4gICAgICAgICAgICAgICAgc2NvcGUuJGVtaXQoJ3Njcm9sbGluZycsIHNjcm9sbERhdGEpO1xuXG4gICAgICAgICAgICAgICAgYkJ0biA9IHRydWU7XG4gICAgICAgICAgICAgIH0sIDMwMClcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBsb2FkSW1nKCl7XG4gICAgICAgICAgICAgIG9JbWdzID0gZWxlLmZpbmQoJ2ltZycpO1xuXG4gICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChvSW1ncywgZnVuY3Rpb24oaW1nKXtcbiAgICAgICAgICAgICAgICBpbWdTcmMgPSBpbWcuZ2V0QXR0cmlidXRlKCdfc3JjJyk7XG5cbiAgICAgICAgICAgICAgICBpZiAoaW1nLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCA8IHdpbkggJiYgaW1nU3JjKSB7XG4gICAgICAgICAgICAgICAgICBvSW1nID0gbmV3IEltYWdlKCk7XG5cbiAgICAgICAgICAgICAgICAgIG9JbWcub25sb2FkID0gbG9hZGVkSW1nKGltZywgaW1nU3JjKTtcbiAgICAgICAgICAgICAgICAgIG9JbWcuc3JjID0gaW1nU3JjO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGxvYWRlZEltZyAoaW1nLCBpbWdTcmMpe1xuXG4gICAgICAgICAgICAgIGltZy5zcmMgPSBpbWdTcmM7XG4gICAgICAgICAgICAgIGltZy5yZW1vdmVBdHRyaWJ1dGUoJ19zcmMnKTtcbiAgICAgICAgICAgICAgaW1nLnN0eWxlLm9wYWNpdHkgPSAxO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XSlcbiAgICAgIC5kaXJlY3RpdmUoJ3JlcGVhdEZpbmlzaCcsZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSxlbGVtZW50LGF0dHIpe1xuXG4gICAgICAgICAgICBpZihzY29wZS4kbGFzdCA9PSB0cnVlKXtcblxuICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLiRldmFsKGF0dHIucmVwZWF0RmluaXNoKVxuICAgICAgICAgICAgICB9LCAxMDAwKVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC8vIOmAieWPt1xuICAgICAgLmRpcmVjdGl2ZSgncGlja2VyQmFsbCcsIFtmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICByZXN0cmljdDogJ0FFJyxcbiAgICAgICAgICByZXBsYWNlOiB0cnVlLFxuICAgICAgICAgIHRyYW5zY2x1ZGU6IHRydWUsXG4gICAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIHZhbHVlOiAnPSdcbiAgICAgICAgICB9LFxuICAgICAgICAgIHRlbXBsYXRlOiAnPGRpdiBuZy10cmFuc2NsdWRlPjxlbSAgb24tdGFwPVwic2VsZWN0QmFsbChiYWxsLnZhbHVlKVwiIG5nLXJlcGVhdD1cImJhbGwgaW4gYmFsbE51bWJlciB0cmFjayBieSAkaW5kZXhcIiBuZy1jbGFzcz1cInthY3RpdmU6IGJhbGwuYWN0aXZlfVwiPnt7YmFsbC52YWx1ZX19PC9lbT48L2Rpdj4nLFxuICAgICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlLCBhdHRycykge1xuICAgICAgICAgICAgdmFyIGxlbiA9IHNjb3BlLnZhbHVlLmJhbGxMZW4sXG4gICAgICAgICAgICAgIG51bWJlckFyciA9IFtdO1xuXG4gICAgICAgICAgICB3aGlsZSAobGVuIC0tKSB7XG4gICAgICAgICAgICAgIG51bWJlckFyci5wdXNoKHtcbiAgICAgICAgICAgICAgICBhY3RpdmU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBzY29wZS52YWx1ZS5iYWxsTGVuIC0gbGVuXG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBzY29wZS5iYWxsTnVtYmVyID0gbnVtYmVyQXJyO1xuXG4gICAgICAgICAgICBzY29wZS5zZWxlY3RCYWxsID0gZnVuY3Rpb24odmFsKXtcbiAgICAgICAgICAgICAgc2NvcGUudmFsdWUubnVtYmVyLnB1c2godmFsKTtcblxuICAgICAgICAgICAgICBhbmd1bGFyLmZvckVhY2gobnVtYmVyQXJyLCBmdW5jdGlvbihiYWxsLCBpbmRleCl7XG5cbiAgICAgICAgICAgICAgICBpZiAoYmFsbC52YWx1ZSA9PSB2YWwpIHtcbiAgICAgICAgICAgICAgICAgIGJhbGwuYWN0aXZlID0gIWJhbGwuYWN0aXZlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiDmuIXnqbrpgInlj7dcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgc2NvcGUuJG9uKCdjbGVhbkJhbGwnLCBmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChudW1iZXJBcnIsIGZ1bmN0aW9uKGJhbGwsIGluZGV4KXtcbiAgICAgICAgICAgICAgICBiYWxsLmFjdGl2ZSA9IGZhbHNlO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICBzY29wZS52YWx1ZS5udW1iZXIgPSBbXTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XSlcbiAgICAgIC8vIOmAieWPt1xuICAgICAgLmRpcmVjdGl2ZSgnc2VsZWN0VmFsJywgW2Z1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHJlc3RyaWN0OiAnQUUnLFxuICAgICAgICAgIHJlcGxhY2U6IHRydWUsXG4gICAgICAgICAgdHJhbnNjbHVkZTogdHJ1ZSxcbiAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgdmFsdWU6ICc9J1xuICAgICAgICAgIH0sXG4gICAgICAgICAgdGVtcGxhdGU6ICc8ZGl2IGNsYXNzPVwic2VsZWN0XCI+PHNwYW4+e3t2YWx1ZS5pc3N1ZX19PC9zcGFuPiA8ZGF0YWxpc3Q+PG9wdGlvbiBvbi10YXA9XCJzZWxlY3RIYW5kbGUoaS5pc3N1ZSlcIiBuZy1yZXBlYXQ9XCJpIGluIHZhbHVlXCI+e3tpLmlzc3VlfX08L29wdGlvbj48L2RhdGFsaXN0PjwvZGl2PicsXG4gICAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGUsIGF0dHJzKSB7XG4gICAgICAgICAgICBzY29wZTtcbiAgICAgICAgICAgIHNjb3BlLnNlbGVjdEhhbmRsZSA9IGZ1bmN0aW9uKHZhbCl7XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1dKVxufSgpKVxuXG5cblxucmVxdWlyZSgnLi4vY29tcG9uZW50cy90b2dnbGUvVG9nZ2xlUGFuZWxEaXJlY3RpdmUuanMnKTtcbnJlcXVpcmUoJy4uL2NvbXBvbmVudHMvdG9nZ2xlL1NlbGVjdFBpY2tEaXJlY3RpdmUuanMnKTtcbnJlcXVpcmUoJy4uL2NvbnRhaW5lcnMvYm9udXN0cmVuZC9ib251c0RpcmVjdGl2ZS5qcycpO1xucmVxdWlyZSgnLi4vY29tcG9uZW50cy9zY3JvbGwvVG91Y2hTY3JvbGxEaXJlY3RpdmUuanMnKTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9kaXJlY3RpdmVNb2R1bGUuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG5cbnJlcXVpcmUoJy4vc2VydmljZU1vZHVsZS5qcycpO1xucmVxdWlyZSgnLi9jb250cm9sbGVyTW9kdWxlLmpzJyk7XG5yZXF1aXJlKCcuL2RpcmVjdGl2ZU1vZHVsZS5qcycpO1xucmVxdWlyZSgnLi9maWx0ZXJNb2R1bGUuanMnKTtcblxucmVxdWlyZSgnLi4vY29udGFpbmVycy9lbnRyeS9lbnRyeVNlcnZpY2VzLmpzJyk7XG5yZXF1aXJlKCcuLi9jb250YWluZXJzL2VudHJ5L0xvZ2luQ29udHJvbGxlci5qcycpO1xuXG5yZXF1aXJlKCcuLi9jb250YWluZXJzL3VzZXJmdW5jL1VzZXJGdW5jQ3RybC5qcycpO1xuXG5yZXF1aXJlKCcuLi9jb250YWluZXJzL2luZGV4L2luZGV4U2VydmljZXMuanMnKTtcbnJlcXVpcmUoJy4uL2NvbnRhaW5lcnMvaW5kZXgvSW5kZXhDb250cm9sbGVyLmpzJyk7XG5cbnJlcXVpcmUoJy4uL2NvbnRhaW5lcnMvY2FwaXRhbC9jYXBpdGFsU2VydmljZXMuanMnKTtcbnJlcXVpcmUoJy4uL2NvbnRhaW5lcnMvY2FwaXRhbC9DYXBpdGFsQ29udHJvbGxlci5qcycpO1xuXG5yZXF1aXJlKCcuLi9jb250YWluZXJzL2VudHJ5L1NlbmRDb2RlRGlyZWN0aXZlLmpzJyk7XG5yZXF1aXJlKCcuLi9jb250YWluZXJzL2VudHJ5L1Bhc3N3b3JkSW5wdXREaXJlY3RpdmUuanMnKTtcbnJlcXVpcmUoJy4uL2NvbnRhaW5lcnMvZW50cnkvSW5wdXREaXJlY3RpdmUuanMnKTtcbnJlcXVpcmUoJy4uL2NvbXBvbmVudHMvc2xpZGVUYWIvU2xpZGVUYWJzRGlyZWN0aXZlLmpzJyk7XG5yZXF1aXJlKCcuLi9jb21wb25lbnRzL2RvcnBkb3duL0RvcnBEb3duLmpzJyk7XG5cbnJlcXVpcmUoJy4uL2NvbnRhaW5lcnMvbG90dGVyeS9Mb3R0ZXJ5Q3RybC5qcycpO1xucmVxdWlyZSgnLi4vY29udGFpbmVycy9sb3R0ZXJ5L2xvdHRlcnlTZXJ2aWNlcy5qcycpO1xuXG5yZXF1aXJlKCcuLi9jb250YWluZXJzL2FjdGl2aXR5L0FjdGl2aXR5Q3RybC5qcycpO1xucmVxdWlyZSgnLi4vY29udGFpbmVycy9hY3Rpdml0eS9hY3Rpdml0eVNlcnZpY2VzLmpzJyk7XG5cbnJlcXVpcmUoJy4uL2NvbnRhaW5lcnMvYm9udXN0cmVuZC9ib251c1RyZW5kU2VydmljZXMuanMnKTtcbnJlcXVpcmUoJy4uL2NvbnRhaW5lcnMvYm9udXN0cmVuZC9Cb251c1RyZW5kQ3RybC5qcycpO1xuXG5yZXF1aXJlKCcuLi9jb250YWluZXJzL3Byb2dyYW1tZS9wcm9ncmFtbWVTZXJ2aWNlcy5qcycpO1xucmVxdWlyZSgnLi4vY29udGFpbmVycy9wcm9ncmFtbWUvUHJvZ3JhbW1lQ3RybC5qcycpO1xuXG5yZXF1aXJlKCcuLi9jb250YWluZXJzL2ZvdW5kL2ZvdW5kU2VydmljZXMuanMnKTtcbnJlcXVpcmUoJy4uL2NvbnRhaW5lcnMvZm91bmQvRm91bmRDdHJsLmpzJyk7XG5cbnJlcXVpcmUoJy4uL2NvbnRhaW5lcnMvdXNlcmNlbnRlci9hY2NvdW50U2VydmljZXMuanMnKTtcbnJlcXVpcmUoJy4uL2NvbnRhaW5lcnMvdXNlcmNlbnRlci9Vc2VyQWNjb3VudENvbnRyb2xsZXIuanMnKTtcblxuXG5yZXF1aXJlKCcuLi9jb250YWluZXJzL2NhbGN1bGF0ZS9DYWxjdWxhdGVDdHJsLmpzJyk7XG5yZXF1aXJlKCcuLi9jb250YWluZXJzL2NhbGN1bGF0ZS9jYWxjdWxhdGVTZXJ2aWNlcy5qcycpO1xuXG5cbmFuZ3VsYXIubW9kdWxlKCdzdGFydGVyJywgWydpb25pYycsICduZ0NvcmRvdmEnLCAnc3RhcnRlci5jb250cm9sbGVycycsICdzdGFydGVyLnNlcnZpY2VzJywgJ3N0YXJ0ZXIuZGlyZWN0aXZlcycsICdzdGFydGVyLmZpbHRlcnMnXSlcblxuLnJ1bihbJyRpb25pY1BsYXRmb3JtJywgJyRyb290U2NvcGUnLCAnJGlvbmljTG9hZGluZycsICdnbG9iYWxTZXJ2aWNlcycsICckaW9uaWNWaWV3U3dpdGNoZXInLCAnJGlvbmljSGlzdG9yeScsICckbG9jYXRpb24nLCAnJGlvbmljUG9wdXAnLCAnJHN0YXRlJyxcbiAgICBmdW5jdGlvbigkaW9uaWNQbGF0Zm9ybSwgJHJvb3RTY29wZSwgJGlvbmljTG9hZGluZywgZ2xvYmFsU2VydmljZXMsICRpb25pY1ZpZXdTd2l0Y2hlciwgJGlvbmljSGlzdG9yeSwgJGxvY2F0aW9uLCAkaW9uaWNQb3B1cCwgJHN0YXRlKSB7XG4gICAgdmFyIGFjY291bnQgPSBnbG9iYWxTZXJ2aWNlcy5sb2NhbFN0b3JhZ2VIYW5kbGUoJ2FjY291bnQnKSxcbiAgICAgICAgdG9rZW4gPSBnbG9iYWxTZXJ2aWNlcy51c2VyQmFzZU1zZy50b2tlbjtcblxuICAgICRpb25pY1BsYXRmb3JtLnJlYWR5KGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGlmICh3aW5kb3cuY29yZG92YSAmJiB3aW5kb3cuY29yZG92YS5wbHVnaW5zICYmIHdpbmRvdy5jb3Jkb3ZhLnBsdWdpbnMuS2V5Ym9hcmQpIHtcbiAgICAgICAgICAgIGNvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5oaWRlS2V5Ym9hcmRBY2Nlc3NvcnlCYXIodHJ1ZSk7XG4gICAgICAgICAgICAvL2NvcmRvdmEucGx1Z2lucy5LZXlib2FyZC5kaXNhYmxlU2Nyb2xsKHRydWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHdpbmRvdy5TdGF0dXNCYXIpIHtcbiAgICAgICAgICAgIC8vIG9yZy5hcGFjaGUuY29yZG92YS5zdGF0dXNiYXIgcmVxdWlyZWRcbiAgICAgICAgICAgIFN0YXR1c0Jhci5zdHlsZUxpZ2h0Q29udGVudCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy/lkK/liqjmnoHlhYnmjqjpgIHmnI3liqFcbiAgICAgICAgaWYgKHdpbmRvdy5wbHVnaW5zICYmIHdpbmRvdy5wbHVnaW5zLmpQdXNoUGx1Z2luKSB7XG4gICAgICAgICAgICB3aW5kb3cucGx1Z2lucy5qUHVzaFBsdWdpbi5pbml0KCk7XG5cbiAgICAgICAgICAgIC8vIOiOt+WPluaegeWFieeahOazqOWGjOeUqOaIt2lkXG4gICAgICAgICAgICB2YXIgb25HZXRSZWdpc3RyYWRpb25JRCA9IGZ1bmN0aW9uKGRhdGEpIHtcblxuICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgIGdsb2JhbFNlcnZpY2VzLmxvY2FsU3RvcmFnZUhhbmRsZSgncmVnaXN0cmF0aW9uSWQnLCBkYXRhKTtcblxuICAgICAgICAgICAgICAgIH0gY2F0Y2goZXhjZXB0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0KGV4Y2VwdGlvbik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgd2luZG93LnBsdWdpbnMualB1c2hQbHVnaW4uZ2V0UmVnaXN0cmF0aW9uSUQob25HZXRSZWdpc3RyYWRpb25JRCk7XG4gICAgICAgICAgICB2YXIgb25PcGVuTm90aWZpY2F0aW9uID0gZnVuY3Rpb24oZXZlbnQpe1xuXG5cblxuICAgICAgICAgICAgICAgIHZhciBhbGVydENvbnRlbnQgPSB7fTtcbiAgICAgICAgICAgICAgICBhbGVydENvbnRlbnQuY3JlYXRlVGltZSA9IG5ldyBEYXRlKCkgLSAxO1xuXG4gICAgICAgICAgICAgICAgaWYoZGV2aWNlLnBsYXRmb3JtID09IFwiQW5kcm9pZFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIGFsZXJ0Q29udGVudC5wdXNoTm90aWNlQ29kZSA9IGV2ZW50LmV4dHJhc1snY24uanB1c2guYW5kcm9pZC5NU0dfSUQnXTtcbiAgICAgICAgICAgICAgICAgICAgYWxlcnRDb250ZW50LmNvbnRlbnQgPSBldmVudC5hbGVydDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBhbGVydENvbnRlbnQucHVzaE5vdGljZUNvZGUgPSBldmVudFsnX2pfbXNnaWQnXTtcbiAgICAgICAgICAgICAgICAgICAgYWxlcnRDb250ZW50LmNvbnRlbnQgPSBldmVudC5hcHMuYWxlcnQ7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgZ2xvYmFsU2VydmljZXMubG9jYWxTdG9yYWdlSGFuZGxlKCdub3RpY2VzJywgW2FsZXJ0Q29udGVudF0sIHRydWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiBhbGVydENvbnRlbnQ7XG5cblxuICAgICAgICAgICAgfVxuICAgICAgICAgIC8vdmFyIG9uUmVjZWl2ZU1lc3NhZ2UgPSBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgIC8vICB0cnkge1xuICAgICAgICAgIC8vICAgIHZhciBtZXNzYWdlXG4gICAgICAgICAgLy8gICAgaWYoZGV2aWNlLnBsYXRmb3JtID09IFwiQW5kcm9pZFwiKSB7XG4gICAgICAgICAgLy8gICAgICBtZXNzYWdlID0gd2luZG93LnBsdXMuUHVzaC5yZWNlaXZlTWVzc2FnZS5tZXNzYWdlO1xuICAgICAgICAgIC8vICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gICAgICBtZXNzYWdlID0gZXZlbnQuY29udGVudDtcbiAgICAgICAgICAvLyAgICB9XG4gICAgICAgICAgLy8gICAgYWxlcnQoSlNPTi5zdHJpbmdpZnkobWVzc2FnZSkpXG4gICAgICAgICAgLy8gIH0gY2F0Y2goZXhjZXB0aW9uKSB7XG4gICAgICAgICAgLy8gICAgYWxlcnQoXCJKUHVzaFBsdWdpbjpvblJlY2VpdmVNZXNzYWdlLS0+XCIgKyBleGNlcHRpb24pO1xuICAgICAgICAgIC8vICB9XG4gICAgICAgICAgLy99XG4gICAgICAgICAgLy9cbiAgICAgICAgICAvL2RvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJqcHVzaC5yZWNlaXZlTWVzc2FnZVwiLCBvblJlY2VpdmVNZXNzYWdlLCBmYWxzZSk7XG4gICAgICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwianB1c2gucmVjZWl2ZU5vdGlmaWNhdGlvblwiLCBvbk9wZW5Ob3RpZmljYXRpb24sIGZhbHNlKTtcbiAgICAgICAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJqcHVzaC5vcGVuTm90aWZpY2F0aW9uXCIsIGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAgICAgICAgICAgICB2YXIgcHVzaE5vdGljZUNvZGUgPSBvbk9wZW5Ob3RpZmljYXRpb24oZXZlbnQpLnB1c2hOb3RpY2VDb2RlO1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygndGFiLmluZGV4cHVzaG5vdGljZWRldGFpbCcsIHtpZDogcHVzaE5vdGljZUNvZGV9KVxuXG4gICAgICAgICAgICB9LCBmYWxzZSk7XG5cblxuICAgICAgICB9XG4gICAgfSk7XG5cblxuXG4gICAgJGlvbmljUGxhdGZvcm0ucmVnaXN0ZXJCYWNrQnV0dG9uQWN0aW9uKGZ1bmN0aW9uIChlKSB7XG5cbiAgICAgICAgLy/liKTmlq3lpITkuo7lk6rkuKrpobXpnaLml7blj4zlh7vpgIDlh7pcbiAgICAgICAgaWYgKCRsb2NhdGlvbi5wYXRoKCkgPT0gJy90YWIvaW5kZXgnIHx8ICRsb2NhdGlvbi5wYXRoKCkgPT0gJy90YWIvcHJvZ3JhbW1lJyB8fCAkbG9jYXRpb24ucGF0aCgpID09ICcvdGFiL2ZvdW5kJyB8fCAkbG9jYXRpb24ucGF0aCgpID09ICcvdGFiL2FjY291bnQnKSB7XG5cbiAgICAgICAgICAgICRpb25pY1BvcHVwLnNob3coe1xuICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPHAgY2xhc3M9XCJjLTMzMyBmcy0xNVwiIHN0eWxlPVwibWFyZ2luOiAyMHB4IDVweCAyM3B4O1wiPuaCqOehruWumuimgemAgOWHuuW9qeexs+aZuuaKle+8nzwvcD4nLFxuICAgICAgICAgICAgICAgIHRpdGxlOiAn6YCA5Ye65o+Q56S6JyxcbiAgICAgICAgICAgICAgICBidXR0b25zOiBbXG4gICAgICAgICAgICAgICAgICAgIHt0ZXh0OiAn5Y+W5raIJ30sXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICfnoa7lrponLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2MtcmVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9uVGFwOiBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlvbmljLlBsYXRmb3JtLmV4aXRBcHAoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0gZWxzZSBpZiAoJGlvbmljSGlzdG9yeS5iYWNrVmlldygpKSB7XG5cbiAgICAgICAgICAgICRpb25pY0hpc3RvcnkuZ29CYWNrKCk7XG4gICAgICAgICAgICAvLyRpb25pY1ZpZXdTd2l0Y2hlci5uZXh0RGlyZWN0aW9uKFwiYmFja1wiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygndGFiLmluZGV4Jyk7XG4gICAgICAgIH1cblxuICAgICAgICBlLiBwcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSwgMTAxKTtcblxuXG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zLCBmcm9tU3RhdGUsIGZyb21QYXJhbXMpe1xuXG4gICAgICAgIHRva2VuID0gZ2xvYmFsU2VydmljZXMudXNlckJhc2VNc2cudG9rZW47XG4gICAgICAgICRyb290U2NvcGUuY2hhcnQgPSAnJztcblxuICAgICAgICBzd2l0Y2ggKHRvU3RhdGUubmFtZSkge1xuICAgICAgICAgICAgY2FzZSAndGFiLnN0YXJ0dXAnOlxuXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS5pc0hpZGVUYWIgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndGFiLmxvZ2luJzpcblxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuaXNIaWRlVGFiID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3RhYi5pbmRleCc6XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS5pc0hpZGVUYWIgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgICRpb25pY0hpc3RvcnkubmV4dFZpZXdPcHRpb25zKHtcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZUJhY2s6IHRydWVcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3RhYi5wcm9ncmFtbWUnOlxuXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS5pc0hpZGVUYWIgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3RhYi5mb3VuZCc6XG5cbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmlzSGlkZVRhYiA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAndGFiLmFjY291bnQnOlxuICAgICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS5pc0hpZGVUYWIgPSBmYWxzZTtcblxuXG4gICAgICAgICAgICAgICAgLy/lpoLmnpznlKjmiLfmsqHmnInnmbvlvZUg5bm25LiUIOS5n+S4jeaYr+esrOS4gOasoeeZu+W9lVxuICAgICAgICAgICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCd0YWIubG9naW4nKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgJ3RhYi5zaWduJzpcblxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuaXNIaWRlVGFiID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygndGFiLmxvZ2luJywge2JhY2tVUkw6ICd0YWIuaW5kZXgnfSk7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlICd0YWIucHJvZ3JhbW1lZGV0YWlsJzpcblxuICAgICAgICAgICAgICAgICRyb290U2NvcGUuaXNIaWRlVGFiID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBpZiAoIXRva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygndGFiLmxvZ2luJywge2JhY2tVUkw6ICd0YWIucHJvZ3JhbW1lJ30pO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGRlZmF1bHQ6XG5cbiAgICAgICAgICAgICAgJHJvb3RTY29wZS5pc0hpZGVUYWIgPSB0cnVlO1xuXG4gICAgICAgIH1cblxuICAgICAgICAvLyDotK3kubDlkI7lkI7pgIDliLDmlrnmoYjliJfooahcbiAgICAgICAgaWYgKGZyb21TdGF0ZS5uYW1lID09ICd0YWIucHJvZ3JhbW1lb3JkZXInICYmIHRvU3RhdGUubmFtZSA9PSAndGFiLnByb2dyYW1tZWRldGFpbCcpIHtcblxuICAgICAgICAgICRzdGF0ZS5nbygndGFiLnByb2dyYW1tZScpO1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDpgIDlh7rnmbvlvZXlkI5cbiAgICAgICAgaWYgKHRvU3RhdGUubmFtZSA9PSAndGFiLnVzZXJtc2cnKSB7XG5cbiAgICAgICAgICAgIGlmICghdG9rZW4pIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ3RhYi5pbmRleCcpO1xuICAgICAgICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgLy8g55m75b2V5oiW5rOo5YaM5oiQ5Yqf5ZCOXG4gICAgICBpZiAoKHRvU3RhdGUubmFtZSA9PSAndGFiLmxvZ2luJyB8fCB0b1N0YXRlLm5hbWUgPT0gJ3RhYi5yZWdpc3RlcicpICYmIGZyb21TdGF0ZS5uYW1lID09ICd0YWIuYWNjb3VudCcpIHtcbiAgICAgICAgICAkc3RhdGUuZ28oJ3RhYi5pbmRleCcpO1xuICAgICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIH1cblxuXG4gICAgfSlcbn1dKVxuLmNvbmZpZyhmdW5jdGlvbigkaHR0cFByb3ZpZGVyKXtcblxuICAgICRodHRwUHJvdmlkZXIuZGVmYXVsdHMuaGVhZGVycy5wb3N0WydDb250ZW50LVR5cGUnXSA9ICdhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWQ7Y2hhcnNldD11dGYtOCc7XG5cbiAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLnRyYW5zZm9ybVJlcXVlc3QgPSBmdW5jdGlvbihkYXRhKXtcbiAgICAgICAgdmFyIGFyciA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpIGluIGRhdGEpIHtcbiAgICAgICAgICAgIGFyci5wdXNoKGVuY29kZVVSSUNvbXBvbmVudChpKSArICc9JyArIEpTT04uc3RyaW5naWZ5KGRhdGFbaV0pKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhcnIuam9pbignJicpO1xuICAgIH1cblxufSlcblxuXG4uY29uZmlnKFsnJHN0YXRlUHJvdmlkZXInLCAnJHVybFJvdXRlclByb3ZpZGVyJywgJyRpb25pY0NvbmZpZ1Byb3ZpZGVyJywgJyRodHRwUHJvdmlkZXInLCBmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJHVybFJvdXRlclByb3ZpZGVyLCAkaW9uaWNDb25maWdQcm92aWRlciwgJGh0dHBQcm92aWRlcikge1xuICAgICAgICAkaHR0cFByb3ZpZGVyLmRlZmF1bHRzLndpdGhDcmVkZW50aWFscyA9IHRydWU7XG5cbiAgICAgICAgJGlvbmljQ29uZmlnUHJvdmlkZXIucGxhdGZvcm0uaW9zLnRhYnMuc3R5bGUoJ3N0YW5kYXJkJyk7XG4gICAgICAgICRpb25pY0NvbmZpZ1Byb3ZpZGVyLnBsYXRmb3JtLmlvcy50YWJzLnBvc2l0aW9uKCdib3R0b20nKTtcbiAgICAgICAgJGlvbmljQ29uZmlnUHJvdmlkZXIucGxhdGZvcm0uYW5kcm9pZC50YWJzLnN0eWxlKCdzdGFuZGFyZCcpO1xuICAgICAgICAkaW9uaWNDb25maWdQcm92aWRlci5wbGF0Zm9ybS5hbmRyb2lkLnRhYnMucG9zaXRpb24oJ3N0YW5kYXJkJyk7XG5cbiAgICAgICAgJGlvbmljQ29uZmlnUHJvdmlkZXIucGxhdGZvcm0uaW9zLm5hdkJhci5hbGlnblRpdGxlKCdjZW50ZXInKTtcbiAgICAgICAgJGlvbmljQ29uZmlnUHJvdmlkZXIucGxhdGZvcm0uYW5kcm9pZC5uYXZCYXIuYWxpZ25UaXRsZSgnY2VudGVyJyk7XG5cbiAgICAgICAgJGlvbmljQ29uZmlnUHJvdmlkZXIucGxhdGZvcm0uaW9zLmJhY2tCdXR0b24ucHJldmlvdXNUaXRsZVRleHQoJycpLmljb24oJ2lvbi1pb3MtYXJyb3ctdGhpbi1sZWZ0Jyk7XG4gICAgICAgICRpb25pY0NvbmZpZ1Byb3ZpZGVyLnBsYXRmb3JtLmFuZHJvaWQuYmFja0J1dHRvbi5wcmV2aW91c1RpdGxlVGV4dCgnJykuaWNvbignaW9uLWFuZHJvaWQtYXJyb3ctYmFjaycpO1xuXG4gICAgICAgICRpb25pY0NvbmZpZ1Byb3ZpZGVyLnBsYXRmb3JtLmlvcy52aWV3cy50cmFuc2l0aW9uKCdpb3MnKTtcbiAgICAgICAgJGlvbmljQ29uZmlnUHJvdmlkZXIucGxhdGZvcm0uYW5kcm9pZC52aWV3cy50cmFuc2l0aW9uKCdhbmRyb2lkJyk7XG5cbiAgICAgICAgJGlvbmljQ29uZmlnUHJvdmlkZXIuYmFja0J1dHRvbi50ZXh0KFwiXCIpO1xuICAgICAgICAkaW9uaWNDb25maWdQcm92aWRlci5iYWNrQnV0dG9uLnByZXZpb3VzVGl0bGVUZXh0KGZhbHNlKTtcbiAgICAgICAgJGlvbmljQ29uZmlnUHJvdmlkZXIuc2Nyb2xsaW5nLmpzU2Nyb2xsaW5nKHRydWUpO1xuICAgICAgICAvLyDnpoHmraJpb3Pmu5HliqjlkI7pgIBcbiAgICAgICAgJGlvbmljQ29uZmlnUHJvdmlkZXIudmlld3Muc3dpcGVCYWNrRW5hYmxlZChmYWxzZSk7XG5cblxuICAkc3RhdGVQcm92aWRlclxuICAgLnN0YXRlKCd0YWInLCB7XG4gICAgICAgIHVybDogJy90YWInLFxuICAgICAgICBhYnN0cmFjdDogdHJ1ZSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdGFicy5odG1sJ1xuICB9KVxuICAvLyBzdGFydHVwXG4gIC5zdGF0ZSgndGFiLnN0YXJ0dXAnLCB7XG4gICAgICB1cmw6ICcvc3RhcnR1cCcsXG4gICAgICB2aWV3czoge1xuICAgICAgICAgICd0YWItaW5kZXgnOiB7XG4gICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2luZGV4L3N0YXJ0dXAuaHRtbCcsXG4gICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTdGFydFVwQ3RybCdcbiAgICAgICAgICB9XG4gICAgICB9XG4gIH0pXG4gIC8vIOmmlumhtSBiZWdpblxuICAuc3RhdGUoJ3RhYi5pbmRleCcsIHtcbiAgICAgIHVybDogJy9pbmRleCcsXG4gICAgICB2aWV3czoge1xuICAgICAgICAgICd0YWItaW5kZXgnOiB7XG4gICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2luZGV4L2luZGV4Lmh0bWwnLFxuICAgICAgICAgICAgICBjb250cm9sbGVyOiAnSW5kZXhDdHJsJ1xuICAgICAgICAgIH1cbiAgICAgIH1cbiAgfSlcbiAgLy8g5b2p56eN5a6a5Yi2XG4gIC5zdGF0ZSgndGFiLmxvdHRlcmN1c3RvbWl6ZScsIHtcbiAgICAgIHVybDogJy9sb3R0ZXJ5Y3VzdG9taXplJyxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJ3RhYi1pbmRleCc6IHtcbiAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvaW5kZXgvbG90dGVyeWN1c3RvbWl6ZS5odG1sJyxcbiAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0N1c3RvbWl6ZUN0cmwnXG4gICAgICAgICAgfVxuICAgICAgfVxuICB9KVxuICAuc3RhdGUoJ3RhYi5pbmRleHB1c2hub3RpY2VkZXRhaWwnLCB7XG4gICAgICB1cmw6ICcvaW5kZXhwdXNobm90aWNlZGV0YWlsLzppZCcsXG4gICAgICBwYXJhbXM6IHtwdXNoOiAncHVzaCd9LFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgICAndGFiLWluZGV4Jzoge1xuICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9mb3VuZC9ub3RpY2VkZXRhaWwuaHRtbCcsXG4gICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdOb3RpY2VEZXRhaWxDdHJsJ1xuICAgICAgICAgIH1cbiAgICAgIH1cbiAgfSlcblxuICAvLyDpppbpobUgZW5kXG4gIC8vIOmmlumhteeZu+W9leebuOWFsyBiZWdpblxuICAuc3RhdGUoJ3RhYi5sb2dpbicsIHtcbiAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICBwYXJhbXM6IHtiYWNrVVJMOiBudWxsfSxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOntcbiAgICAgICAgICAndGFiLWxvZ2luJzoge1xuICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9lbnRyeS9sb2dpbi5odG1sJyxcbiAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0xvZ2luQ3RybCdcbiAgICAgICAgICB9XG4gICAgICB9XG4gIH0pXG5cblxuICAvLyDlv5jorrDlr4bnoIFcbiAgLnN0YXRlKCd0YWIuZm9yZ2V0cGFzc3dvcmQnLCB7XG4gICAgICB1cmw6ICcvZm9yZ2V0cGFzc3dvcmQnLFxuICAgICAgY2FjaGU6IGZhbHNlLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgICAndGFiLWxvZ2luJzoge1xuICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9lbnRyeS9mb3JnZXRwYXNzd29yZC5odG1sJyxcbiAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0ZvcmdldFBhc3N3b3JkQ3RybCdcbiAgICAgICAgICB9XG4gICAgICB9XG4gIH0pXG4gIC8vIOmHjeiuvuWvhueggVxuICAuc3RhdGUoJ3RhYi5yZXNldHBhc3N3b3JkJywge1xuICAgICAgdXJsOiAnL3Jlc2V0cGFzc3dvcmQnLFxuICAgICAgcGFyYW1zOiB7bW9iaWxlOiBudWxsfSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJ3RhYi1sb2dpbic6IHtcbiAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZW50cnkvcmVzZXRwYXNzd29yZC5odG1sJyxcbiAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1Jlc2V0UGFzc3dvcmRDdHJsJ1xuICAgICAgICAgIH1cbiAgICAgIH1cbiAgfSlcbiAgLy8g5rOo5YaMXG4gIC5zdGF0ZSgndGFiLnJlZ2lzdGVyJywge1xuICAgICAgdXJsOiAnL3JlZ2lzdGVyJyxcbiAgICAgIGNhY2hlOiBmYWxzZSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJ3RhYi1sb2dpbic6IHtcbiAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZW50cnkvcmVnaXN0ZXIuaHRtbCcsXG4gICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdSZWdpc3RlckN0cmwnXG4gICAgICAgICAgfVxuICAgICAgfVxuICB9KVxuICAvLyDms6jlhozljY/orq5cbiAgLnN0YXRlKCd0YWIucmVnaXN0ZXJhZ3JlZW1lbnQnLCB7XG4gICAgICB1cmw6ICcvcmVnaXN0ZXJhZ3JlZW1lbnQnLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgICAndGFiLWxvZ2luJzoge1xuICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9lbnRyeS9yZWdpc3RlcmFncmVlbWVudC5odG1sJ1xuICAgICAgICAgIH1cbiAgICAgIH1cbiAgfSlcbiAgLy8g55m75b2V55u45YWzIGVuZFxuXG5cbiAgLy8g5Liq5Lq65Lit5b+DIGJlaWdpblxuICAuc3RhdGUoJ3RhYi5hY2NvdW50Jywge1xuICAgIHVybDogJy9hY2NvdW50JyxcbiAgICB2aWV3czoge1xuICAgICAgJ3RhYi1hY2NvdW50Jzoge1xuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy91c2VyY2VudGVyL3VzZXJhY2NvdW50Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnVXNlckFjY291bnRDdHJsJ1xuICAgICAgfVxuICAgIH1cbiAgfSlcbiAgLy8g5L2Z6aKdXG4gIC5zdGF0ZSgndGFiLnNldHRpbmcnLCB7XG4gICAgICB1cmw6ICcvc2V0dGluZycsXG4gICAgICB2aWV3czoge1xuICAgICAgICAgICd0YWItYWNjb3VudCc6IHtcbiAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdXNlcmZ1bmMvc2V0dGluZy5odG1sJyxcbiAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1NldHRpbmdDdHJsJ1xuICAgICAgICAgIH1cbiAgICAgIH1cbiAgfSlcbiAgLy8g5L2Z6aKdXG4gIC5zdGF0ZSgndGFiLmJhbGFuY2UnLCB7XG4gICAgICB1cmw6ICcvYmFsYW5jZScsXG4gICAgICB2aWV3czoge1xuICAgICAgICAgICd0YWItYWNjb3VudCc6IHtcbiAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvY2FwaXRhbC9iYWxhbmNlLmh0bWwnLFxuICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQmFsYW5jZUN0cmwnXG4gICAgICAgICAgfVxuICAgICAgfVxuICB9KVxuICAvLyDlhYXlgLxcbiAgLnN0YXRlKCd0YWIucmVjaGFyZ2UnLCB7XG4gICAgICB1cmw6ICcvcmVjaGFyZ2UnLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgICAndGFiLWFjY291bnQnOiB7XG4gICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2NhcGl0YWwvcmVjaGFyZ2UuaHRtbCcsXG4gICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdSZWNoYXJnZUN0cmwnXG4gICAgICAgICAgfVxuICAgICAgfVxuICB9KVxuICAvLyDlhYXlgLzor6bmg4VcbiAgLnN0YXRlKCd0YWIucmVjaGFyZ2VkZXRhaWwnLCB7XG4gICAgICB1cmw6ICcvcmVjaGFyZ2VkZXRhaWwvOmlkJyxcbiAgICAgIHBhcmFtczoge2lkOiBudWxsfSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJ3RhYi1hY2NvdW50Jzoge1xuICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9jYXBpdGFsL3JlY2hhcmdlZGV0YWlsLmh0bWwnLFxuICAgICAgICAgICAgICBjb250cm9sbGVyOiAnUmVjaGFyZ2VEZXRhaWxDdHJsJ1xuICAgICAgICAgIH1cbiAgICAgIH1cbiAgfSlcblxuXG4gIC8vIOS8mOaDoOWIuFxuICAuc3RhdGUoJ3RhYi5jb3Vwb24nLCB7XG4gICAgICB1cmw6ICcvY291cG9uJyxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJ3RhYi1hY2NvdW50Jzoge1xuICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9jYXBpdGFsL2NvdXBvbi5odG1sJyxcbiAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0NvdXBvbkN0cmwnXG4gICAgICAgICAgfVxuICAgICAgfVxuICB9KVxuICAvLyDkvJjmg6DliLhcbiAgLnN0YXRlKCd0YWIuaW5kZXhjb3Vwb24nLCB7XG4gICAgICB1cmw6ICcvaW5kZXhjb3Vwb24nLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgICAndGFiLWluZGV4Jzoge1xuICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9jYXBpdGFsL2NvdXBvbi5odG1sJyxcbiAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0NvdXBvbkN0cmwnXG4gICAgICAgICAgfVxuICAgICAgfVxuICB9KVxuXG4gIC8vIOS4quS6uui1hOaWmVxuICAuc3RhdGUoJ3RhYi51c2VybXNnJywge1xuICAgICAgICB1cmw6ICcvdXNlcm1zZycsXG4gICAgICAgIGNhY2hlOidmYWxzZScsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAndGFiLWFjY291bnQnOiB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdXNlcmNlbnRlci91c2VybXNnLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdVc2VyTXNnQ3RybCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pXG4gIC8vIOWktOWDj1xuICAuc3RhdGUoJ3RhYi51c2VycGhvdG8nLCB7XG4gICAgICB1cmw6ICcvdXNlcnBob3RvJyxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJ3RhYi1hY2NvdW50Jzoge1xuICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy91c2VyY2VudGVyL3VzZXJwaG90by5odG1sJyxcbiAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1VzZXJQaG90b0N0cmwnXG4gICAgICAgICAgfVxuICAgICAgfVxuICB9KVxuXG4gICAgICAvLyDnlKjmiLflkI1cbiAgLnN0YXRlKCd0YWIudXNlcm5hbWUnLCB7XG4gICAgICB1cmw6ICcvdXNlcm5hbWUnLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgICAndGFiLWFjY291bnQnOiB7XG4gICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3VzZXJjZW50ZXIvdXNlcm5hbWUuaHRtbCcsXG4gICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdVc2VyTmFtZUN0cmwnXG4gICAgICAgICAgfVxuICAgICAgfVxuICB9KVxuICAgICAgLy8g5a+G56CB566h55CGKOS/ruaUueWvhueggSlcbiAgLnN0YXRlKCd0YWIubW9kaWZ5cGFzc3dvcmQnLCB7XG4gICAgICB1cmw6ICcvbW9kaWZ5cGFzc3dvcmQnLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgICAndGFiLWFjY291bnQnOiB7XG4gICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3VzZXJjZW50ZXIvbW9kaXR5cGFzc3dvcmQuaHRtbCcsXG4gICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdNb2RpdHlQYXNzd29yZEN0cmwnXG4gICAgICAgICAgfVxuICAgICAgfVxuICB9KVxuICAvLyDlr4bnoIHnrqHnkIYo6K6+572u5a+G56CBKVxuICAuc3RhdGUoJ3RhYi5zZXRwYXNzd29yZCcsIHtcbiAgICAgIHVybDogJy9zZXRwYXNzd29yZCcsXG4gICAgICB2aWV3czoge1xuICAgICAgICAgICd0YWItYWNjb3VudCc6IHtcbiAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvdXNlcmNlbnRlci9zZXRwYXNzd29yZC5odG1sJyxcbiAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1NldFBhc3N3b3JkQ3RybCdcbiAgICAgICAgICB9XG4gICAgICB9XG4gIH0pXG4gIC8vIOW/mOiusOWvhueggVxuICAuc3RhdGUoJ3RhYi5hY2NvdW50Zm9yZ2V0cGFzc3dvcmQnLCB7XG4gICAgICB1cmw6ICcvYWNjb3VudGZvcmdldHBhc3N3b3JkLzpzY29wZVVSTCcsXG4gICAgICBjYWNoZTogZmFsc2UsXG4gICAgICB2aWV3czoge1xuICAgICAgICAgICd0YWItYWNjb3VudCc6IHtcbiAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZW50cnkvZm9yZ2V0cGFzc3dvcmQuaHRtbCcsXG4gICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdGb3JnZXRQYXNzd29yZEN0cmwnXG4gICAgICAgICAgfVxuICAgICAgfVxuICB9KVxuICAvLyDph43orr7lr4bnoIFcbiAgLnN0YXRlKCd0YWIuYWNjb3VudHJlc2V0cGFzc3dvcmQnLCB7XG4gICAgICB1cmw6ICcvYWNjb3VudHJlc2V0cGFzc3dvcmQnLFxuICAgICAgcGFyYW1zOiB7bW9iaWxlOiBudWxsfSxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJ3RhYi1hY2NvdW50Jzoge1xuICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9lbnRyeS9yZXNldHBhc3N3b3JkLmh0bWwnLFxuICAgICAgICAgICAgICBjb250cm9sbGVyOiAnUmVzZXRQYXNzd29yZEN0cmwnXG4gICAgICAgICAgfVxuICAgICAgfVxuICB9KVxuXG4gIC8vIOaJi+acuuWPt+e7keWumlxuICAuc3RhdGUoJ3RhYi51c2VybW9iaWxlJywge1xuICAgICAgdXJsOiAnL3VzZXJtb2JpbGUnLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgICAndGFiLWFjY291bnQnOiB7XG4gICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3VzZXJjZW50ZXIvdXNlcm1vYmlsZS5odG1sJyxcbiAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1VzZXJNb2JpbGVDdHJsJ1xuICAgICAgICAgIH1cbiAgICAgIH1cbiAgfSlcbiAgLy8g6IGU5ZCI6LSm5oi3XG4gIC5zdGF0ZSgndGFiLnVzZXJ1bmlvbicsIHtcbiAgICAgIHVybDogJy91c2VydW5pb24nLFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgICAndGFiLWFjY291bnQnOiB7XG4gICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3VzZXJjZW50ZXIvdXNlcnVuaW9uLmh0bWwnLFxuICAgICAgICAgICAgICBjb250cm9sbGVyOiAnVXNlclVuaW9uQ3RybCdcbiAgICAgICAgICB9XG4gICAgICB9XG5cbiAgfSlcbiAgLy8g5oqV5rOo6K6i5Y2VXG4gIC5zdGF0ZSgndGFiLm9yZGVyJywge1xuICAgICAgdXJsOiAnL29yZGVyJyxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJ3RhYi1hY2NvdW50Jzoge1xuICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy91c2VyY2VudGVyL29yZGVyLmh0bWwnLFxuICAgICAgICAgICAgICBjb250cm9sbGVyOiAnT3JkZXJDdHJsJ1xuICAgICAgICAgIH1cbiAgICAgIH1cblxuICB9KVxuICAgIC8vIOS4quS6uuiuouWNleivpuaDhVxuICAgIC5zdGF0ZSgndGFiLm9yZGVyZGV0YWlsJywge1xuICAgICAgICB1cmw6ICcvb3JkZXJkZXRhaWwvOm9yZGVyQ29kZScsXG4gICAgICAgIHBhcmFtczoge29yZGVyQ29kZTogbnVsbH0sXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAndGFiLWFjY291bnQnOiB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvcHJvZ3JhbW1lL3Byb2dyYW1tZW9yZGVyLmh0bWwnLFxuICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQcm9ncmFtbWVPcmRlckN0cmwnXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0pXG4gICAgICAvLyDkvb/nlKjluK7liqlcbiAgICAgIC5zdGF0ZSgndGFiLmhlbHAnLCB7XG4gICAgICAgICAgdXJsOiAnL2hlbHAnLFxuICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICd0YWItYWNjb3VudCc6IHtcbiAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3VzZXJmdW5jL2hlbHAuaHRtbCcsXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgIH0pXG4gICAgICAvLyDlhbPkuo7miJHku6xcbiAgICAgIC5zdGF0ZSgndGFiLmFib3V0dXMnLCB7XG4gICAgICAgICAgdXJsOiAnL2Fib3V0dXMnLFxuICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICd0YWItYWNjb3VudCc6IHtcbiAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3VzZXJmdW5jL2Fib3V0dXMuaHRtbCcsXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgIH0pXG4gICAgICAvLyDkuKrkurrkuK3lv4MgZW5kXG4gICAgICAvLyDlvIDlpZYgYmVnaW5cbiAgICAgIC5zdGF0ZSgndGFiLmxvdHRlcnknLCB7XG4gICAgICAgICAgdXJsOiAnL2xvdHRlcnknLFxuICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICd0YWItaW5kZXgnOiB7XG4gICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sb3R0ZXJ5L2xvdHRlcnkuaHRtbCcsXG4gICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnTG90dGVyeUN0cmwnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgIH0pXG4gICAgICAvLyDlvIDlpZbliJfooahcbiAgICAgIC5zdGF0ZSgndGFiLmxvdHRlcnlsaXN0Jywge1xuICAgICAgICAgIHVybDogJy9sb3R0ZXJ5bGlzdC86aWQnLFxuICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICd0YWItaW5kZXgnOiB7XG4gICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sb3R0ZXJ5L2xvdHRlcnlsaXN0Lmh0bWwnLFxuICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0xvdHRlcnlMaXN0Q3RybCdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgfSlcbiAgICAgIC8vIOW9qeenjei1sOWKv+mmlumhtVxuICAgICAgLnN0YXRlKCd0YWIuYm9udXNlbnRyeScsIHtcbiAgICAgICAgICB1cmw6ICcvYm9udXNlbnRyeScsXG4gICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgJ3RhYi1pbmRleCc6IHtcbiAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2JvbnVzdHJlbmQvYm9udXNlbnRyeS5odG1sJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC8vIOWPjOiJsueQg+OAgeWkp+S5kOmAj+i1sOWKv1xuICAgICAgLnN0YXRlKCd0YWIuYm9udWN5Y2xlJywge1xuICAgICAgICAgIHVybDogJy9ib251c2N5Y2xlLzppZCcsXG4gICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgJ3RhYi1pbmRleCc6IHtcbiAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2JvbnVzdHJlbmQvYm9udXNjeWNsZS5odG1sJyxcbiAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdCb251c1RyZW5kQ3RybCdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgfSlcbiAgICAgIC8vIOaOkuWIl+S6lFxuICAgICAgLnN0YXRlKCd0YWIuYm9udXNQNScsIHtcbiAgICAgICAgICB1cmw6ICcvYm9udXNQQUlMSUVXVS86aWQnLFxuICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICd0YWItaW5kZXgnOiB7XG4gICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9ib251c3RyZW5kL2JvbnVzUEFJTElFV1UuaHRtbCcsXG4gICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQm9udXNUcmVuZEN0cmwnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgIH0pXG5cbiAgICAgIC8vIOaOkuWIl+S4ieOAgTNkXG4gICAgICAuc3RhdGUoJ3RhYi5ib251czNkJywge1xuICAgICAgICAgIHVybDogJy9ib251czNkLzppZCcsXG4gICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgJ3RhYi1pbmRleCc6IHtcbiAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2JvbnVzdHJlbmQvYm9udXMzZC5odG1sJyxcbiAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdCb251c1RyZW5kQ3RybCdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgfSlcblxuICAgICAgLy8g5LiD5LmQ5b2pXG4gICAgICAuc3RhdGUoJ3RhYi5ib251c1FJTEVDQUknLCB7XG4gICAgICAgICAgdXJsOiAnL2JvbnVzUUlMRUNBSS86aWQnLFxuICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICd0YWItaW5kZXgnOiB7XG4gICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9ib251c3RyZW5kL2JvbnVzUUlMRUNBSS5odG1sJyxcbiAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdCb251c1RyZW5kQ3RybCdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgfSlcbiAgICAgIC8vIOW/q+S4iVxuICAgICAgLnN0YXRlKCd0YWIuYm9udXNLQVVJU0FOJywge1xuICAgICAgICB1cmw6ICcvYm9udXNLVUFJU0FOLzppZCcsXG4gICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgJ3RhYi1pbmRleCc6IHtcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2JvbnVzdHJlbmQvYm9udXNLVUFJU0FOLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0JvbnVzSzNDdHJsJ1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICB9KVxuICAgIC8vIOW/q+S4iVxuICAgIC5zdGF0ZSgndGFiLmJvbnVzMTE1Jywge1xuICAgICAgdXJsOiAnL2JvbnVzMTE1LzppZCcsXG4gICAgICB2aWV3czoge1xuICAgICAgICAndGFiLWluZGV4Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2JvbnVzdHJlbmQvYm9udXMxMTUuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0JvbnVzVHJlbmRDdHJsJ1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9KVxuICAgICAgLy8g5byA5aWWIGVuZFxuICAgICAgLy8g5pa55qGIIGJlZ2luXG4gICAgICAuc3RhdGUoJ3RhYi5wcm9ncmFtbWUnLCB7XG4gICAgICAgICAgdXJsOiAnL3Byb2dyYW1tZScsXG4gICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgJ3RhYi1wcm9ncmFtbWUnOiB7XG4gICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9wcm9ncmFtbWUvcHJvZ3JhbW1lLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1Byb2dyYW1tZUN0cmwnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgIH0pXG4gICAgICAvLyDmlrnmoYjor6bmg4VcbiAgICAgIC5zdGF0ZSgndGFiLnByb2dyYW1tZWRldGFpbCcsIHtcbiAgICAgICAgICB1cmw6ICcvcHJvZ3JhbW1lZGV0YWlsLzpwcm9ncmFtbWVDb2RlJyxcbiAgICAgICAgICBwYXJhbXM6IHtjb3Vwb25Db2RlOiBudWxsLCBjb3Vwb25BbW91bnQ6IG51bGwsIHByb2dyYW1tZUNvZGU6IG51bGx9LFxuICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICd0YWItcHJvZ3JhbW1lJzoge1xuICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvcHJvZ3JhbW1lL3Byb2dyYW1tZWRldGFpbC5odG1sJyxcbiAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQcm9ncmFtbWVEZXRhaWxDdHJsJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICB9KVxuICAgICAgLy8g5pa55qGI6K6i5Y2V6K+m5oOFXG4gICAgICAuc3RhdGUoJ3RhYi5wcm9ncmFtbWVvcmRlcicsIHtcbiAgICAgICAgICB1cmw6ICcvcHJvZ3JhbW1lb3JkZXIvOm9yZGVyQ29kZScsXG4gICAgICAgICAgcGFyYW1zOiB7b3JkZXJDb2RlOiBudWxsfSxcbiAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAndGFiLXByb2dyYW1tZSc6IHtcbiAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL3Byb2dyYW1tZS9wcm9ncmFtbWVvcmRlci5odG1sJyxcbiAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdQcm9ncmFtbWVPcmRlckN0cmwnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgIH0pXG4gICAgICAgIC8vIOWFheWAvFxuICAgICAgICAuc3RhdGUoJ3RhYi5wcm9ncmFtbWVyZWNoYXJnZScsIHtcbiAgICAgICAgICAgIHVybDogJy9wcm9ncmFtbWVyZWNoYXJnZScsXG4gICAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAgICd0YWItcHJvZ3JhbW1lJzoge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9jYXBpdGFsL3JlY2hhcmdlLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnUmVjaGFyZ2VDdHJsJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIC8vIOS9v+eUqOS8mOaDoOWIuFxuICAgICAgLnN0YXRlKCd0YWIudXNlY291cG9uJywge1xuXG4gICAgICAgICAgdXJsOiAnL3VzZWNvdXBvbi86bG90dGVyeUNvZGUvOnJld2FyZEFtb3VudC86cHJvZ3JhbW1lQ29kZScsXG4gICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgJ3RhYi1wcm9ncmFtbWUnOiB7XG4gICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9wcm9ncmFtbWUvdXNlY291cG9uLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ1VzZUNvdXBvbkN0cmwnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgIH0pXG5cbiAgICAgIC8vIOWPkeeOsCBiZWdpblxuICAgICAgLnN0YXRlKCd0YWIuZm91bmQnLCB7XG4gICAgICAgICAgdXJsOiAnL2ZvdW5kJyxcbiAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAndGFiLWZvdW5kJzoge1xuICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZm91bmQvZm91bmQuaHRtbCcsXG4gICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnRm91bmRDdHJsJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5zdGF0ZSgndGFiLmNvbnN1bHQnLCB7XG4gICAgICAgICAgdXJsOiAnL2NvbnN1bHQnLFxuICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICd0YWItZm91bmQnOiB7XG4gICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9mb3VuZC9jb25zdWx0Lmh0bWwnLFxuICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0NvbnN1bHRDdHJsJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5zdGF0ZSgndGFiLmNvbnN1bHRkZXRhaWwnLCB7XG4gICAgICAgICAgdXJsOiAnL2NvbnN1bHRkZXRhaWwvOmlkJyxcbiAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAndGFiLWZvdW5kJzoge1xuICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvZm91bmQvY29uc3VsdGRldGFpbC5odG1sJyxcbiAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdDb25zdWx0RGV0YWlsQ3RybCdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAuc3RhdGUoJ3RhYi5ub3RpY2UnLCB7XG4gICAgICAgICAgdXJsOiAnL25vdGljZScsXG4gICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgJ3RhYi1mb3VuZCc6IHtcbiAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2ZvdW5kL25vdGljZS5odG1sJyxcbiAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdOb3RpY2VDdHJsJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5zdGF0ZSgndGFiLm5vdGljZWRldGFpbCcsIHtcbiAgICAgICAgICB1cmw6ICcvbm90aWNlZGV0YWlsLzppZCcsXG4gICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgJ3RhYi1mb3VuZCc6IHtcbiAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2ZvdW5kL25vdGljZWRldGFpbC5odG1sJyxcbiAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdOb3RpY2VEZXRhaWxDdHJsJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC5zdGF0ZSgndGFiLnB1c2hub3RpY2VkZXRhaWwnLCB7XG4gICAgICAgICAgdXJsOiAnL3B1c2hub3RpY2VkZXRhaWwvOmlkJyxcbiAgICAgICAgICBwYXJhbXM6IHtwdXNoOiAncHVzaCd9LFxuICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICd0YWItZm91bmQnOiB7XG4gICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9mb3VuZC9ub3RpY2VkZXRhaWwuaHRtbCcsXG4gICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnTm90aWNlRGV0YWlsQ3RybCdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAvLyDlj5HnjrAg5LitIOW8gOWlliBiZWdpblxuICAgICAgLnN0YXRlKCd0YWIuZm91bmRsb3R0ZXJ5Jywge1xuICAgICAgICAgIHVybDogJy9mb3VuZGxvdHRlcnknLFxuICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICd0YWItZm91bmQnOiB7XG4gICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9mb3VuZGxvdHRlcnkvbG90dGVyeS5odG1sJyxcbiAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdMb3R0ZXJ5Q3RybCdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgfSlcbiAgICAgIC8vIOW8gOWlluWIl+ihqFxuICAgICAgLnN0YXRlKCd0YWIuZm91bmRsb3R0ZXJ5bGlzdCcsIHtcbiAgICAgICAgICB1cmw6ICcvZm91bmRsb3R0ZXJ5bGlzdC86aWQnLFxuICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICd0YWItZm91bmQnOiB7XG4gICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9sb3R0ZXJ5L2xvdHRlcnlsaXN0Lmh0bWwnLFxuICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0xvdHRlcnlMaXN0Q3RybCdcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgfSlcbiAgICAgIC8vIOW9qeenjei1sOWKv+mmlumhtVxuICAgICAgLnN0YXRlKCd0YWIuZm91bmRib251c2VudHJ5Jywge1xuICAgICAgICAgIHVybDogJy9mb3VuZGJvbnVzZW50cnknLFxuICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICd0YWItZm91bmQnOiB7XG4gICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9mb3VuZC9ib251c2VudHJ5Lmh0bWwnXG5cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgIH0pXG4gICAgICAvLyDlj4zoibLnkIPjgIHlpKfkuZDpgI/otbDlir9cbiAgICAgIC5zdGF0ZSgndGFiLmZvdW5kYm9udWN5Y2xlJywge1xuICAgICAgICAgIHVybDogJy9mb3VuZGJvbnVzY3ljbGUvOmlkJyxcbiAgICAgICAgICB2aWV3czoge1xuICAgICAgICAgICAgICAndGFiLWZvdW5kJzoge1xuICAgICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvYm9udXN0cmVuZC9ib251c2N5Y2xlLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0JvbnVzVHJlbmRDdHJsJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICB9KVxuICAgICAgLy8g5o6S5YiX5LqUXG4gICAgICAuc3RhdGUoJ3RhYi5mb3VuZGJvbnVzUDUnLCB7XG4gICAgICAgICAgdXJsOiAnL2ZvdW5kYm9udXNQQUlMSUVXVS86aWQnLFxuICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICd0YWItZm91bmQnOiB7XG4gICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9ib251c3RyZW5kL2JvbnVzUEFJTElFV1UuaHRtbCcsXG4gICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQm9udXNUcmVuZEN0cmwnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgIH0pXG5cbiAgICAgIC8vIOaOkuWIl+S4ieOAgTNkXG4gICAgICAuc3RhdGUoJ3RhYi5mb3VuZGJvbnVzM2QnLCB7XG4gICAgICAgICAgdXJsOiAnL2ZvdW5kYm9udXMzZC86aWQnLFxuICAgICAgICAgIHZpZXdzOiB7XG4gICAgICAgICAgICAgICd0YWItZm91bmQnOiB7XG4gICAgICAgICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RlbXBsYXRlcy9ib251c3RyZW5kL2JvbnVzM2QuaHRtbCcsXG4gICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnQm9udXNUcmVuZEN0cmwnXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgIH0pXG5cbiAgICAgIC8vIOS4g+S5kOW9qVxuICAgICAgLnN0YXRlKCd0YWIuZm91bmRib251c1FJTEVDQUknLCB7XG4gICAgICAgICAgdXJsOiAnL2ZvdW5kYm9udXNRSUxFQ0FJLzppZCcsXG4gICAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICAgJ3RhYi1mb3VuZCc6IHtcbiAgICAgICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2JvbnVzdHJlbmQvYm9udXNRSUxFQ0FJLmh0bWwnLFxuICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0JvbnVzVHJlbmRDdHJsJ1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgfVxuXG4gICAgICB9KVxuICAgIC8vIOW/q+S4iVxuICAgIC5zdGF0ZSgndGFiLmZvdW5kYm9udXNLQVVJU0FOJywge1xuICAgICAgdXJsOiAnL2ZvdW5kYm9udXNLVUFJU0FOLzppZCcsXG4gICAgICB2aWV3czoge1xuICAgICAgICAndGFiLWZvdW5kJzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAndGVtcGxhdGVzL2JvbnVzdHJlbmQvYm9udXNLVUFJU0FOLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdCb251c0szQ3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgfSlcbiAgICAgIC8vIOWPkeeOsCBlbmRcbiAgICAgICAgLy8g5rS75YqoIO+8iOetvuWIsO+8iVxuICAgIC5zdGF0ZSgndGFiLnNpZ24nLCB7XG4gICAgICAgIHVybDogJy9zaWduJyxcbiAgICAgICAgdmlld3M6IHtcbiAgICAgICAgICAgICd0YWItaW5kZXgnOiB7XG4gICAgICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvYWN0aXZpdHkvc2lnbi5odG1sJyxcbiAgICAgICAgICAgICAgICBjb250cm9sbGVyOiAnU2lnbkN0cmwnXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgndGFiLmNhbGN1bGF0ZScsIHtcbiAgICAgIHVybDogJy9jYWxjdWxhdGUvOmxvdHRlcnlDb2RlJyxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICd0YWItaW5kZXgnOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0ZW1wbGF0ZXMvY2FsY3VsYXRlL2NhbGN1bGF0ZS5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnQ2FsY3VsYXRlQ3RybCdcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG5cbiAgdmFyIGRlZmF1bHRVUkwgPSAobG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3N0YXJ0JykgPT0gJ2ZhbHNlJyB8fCBsb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnc3RhcnQnKSA9PSBudWxsKSAgPyAnL3RhYi9zdGFydHVwJyA6ICcvdGFiL2luZGV4JztcblxuICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKGRlZmF1bHRVUkwpO1xuXG5cbn1dKTtcblxuXG5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLWRwcicsIHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvKTtcbmRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZS5mb250U2l6ZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRXaWR0aCAvIDEwICogMiArICdweCc7XG5cblxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL2Zha2VfNzhhNWE1N2MuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vL1xubW9kdWxlLmV4cG9ydHMgPSAoZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gYW5ndWxhci5tb2R1bGUoJ3N0YXJ0ZXIuZmlsdGVycycsIFtdKS5cbiAgICAgICAgZmlsdGVyKCdyZWR1Y2UnLCBmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24odmFsKXtcblxuICAgICAgICAgICAgICAgIHJldHVybiB2YWwucmVkdWNlKGZ1bmN0aW9uKGEsIGIpe1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBOdW1iZXIoYSkgKyBOdW1iZXIoYik7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KVxuICAgICAgICAvLyDml6XmnJ/moLzlvI/ljJYgMjAxNC0xMC0xMSDovazmjaLkuLogMjAxNC4xMC4xMVxuICAgICAgICAuZmlsdGVyKCdkYXRldHJhbnNmZXInLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWwucmVwbGFjZSgvLS9nLCAnLicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAvLyDml6XmnJ/moLzlvI/ljJYgMjAxNC0xMC0xMSAyMDoyMDoyMCDovazmjaLkuLogMjAxNC0xMC0xMVxuICAgICAgICAuZmlsdGVyKCdkYXRlc2hvcnQnLCBmdW5jdGlvbigpe1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB2YWwuc3BsaXQoJyAnKVswXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLy8gIOacn+asoeeugOWMliDkuLrlha3kvY1cbiAgICAgICAgLmZpbHRlcignaXNzdWVmaXhlZCcsIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHZhbCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbC5zbGljZSgtNSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAvLyDlj5bmlbRcbiAgICAgICAgLmZpbHRlcigncGFyc2VJbnQnLCBmdW5jdGlvbigpe1xuICAgICAgICAgIHJldHVybiBmdW5jdGlvbih2YWwpIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludCh2YWwpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbn0oKSlcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoXCJySDFKUEdcIiksdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9LHJlcXVpcmUoXCJidWZmZXJcIikuQnVmZmVyLGFyZ3VtZW50c1szXSxhcmd1bWVudHNbNF0sYXJndW1lbnRzWzVdLGFyZ3VtZW50c1s2XSxcIi9maWx0ZXJNb2R1bGUuanNcIixcIi9cIikiLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsLEJ1ZmZlcixfX2FyZ3VtZW50MCxfX2FyZ3VtZW50MSxfX2FyZ3VtZW50MixfX2FyZ3VtZW50MyxfX2ZpbGVuYW1lLF9fZGlybmFtZSl7XG4vKipcbiAqIEBkYXRlIDIwMTYtMDktMjlcbiAqIEBhdXRoIHpoYW5nXG4gKiBAdGVsIDE1MjEwMDA3MTg1XG4gKi9cblxuLy/mnI3liqHkuLvmqKHlnZdcbm1vZHVsZS5leHBvcnRzID0gKGZ1bmN0aW9uKCl7XG5cbiAgICB2YXIgaXNMb2FjbCA9IChsb2NhdGlvbi5ob3N0bmFtZSA9PSAnbG9jYWxob3N0Jyk7XG5cbiAgICByZXR1cm4gYW5ndWxhci5tb2R1bGUoJ3N0YXJ0ZXIuc2VydmljZXMnLCBbXSlcbiAgICAgICAgLmZhY3RvcnkoJ2dsb2JhbFNlcnZpY2VzJywgWyckaHR0cCcsICckcScsICckaW9uaWNTY3JvbGxEZWxlZ2F0ZScsICckcm9vdFNjb3BlJywgJyR0aW1lb3V0JyxcbiAgICAgICAgICAgICckaW9uaWNMb2FkaW5nJywgJyRkb2N1bWVudCcsICckaW9uaWNQbGF0Zm9ybScsICckY29tcGlsZScsICckaW9uaWNNb2RhbCcsICckaW9uaWNQb3B1cCcsICckY29yZG92YUZpbGVUcmFuc2ZlcicsICckc3RhdGUnLCAnJGNvcmRvdmFGaWxlJywgJyRjb3Jkb3ZhRmlsZU9wZW5lcjInLFxuICAgICAgICAgICAgZnVuY3Rpb24oJGh0dHAsICRxLCAkaW9uaWNTY3JvbGxEZWxlZ2F0ZSwgJHJvb3RTY29wZSwgJHRpbWVvdXQsICRpb25pY0xvYWRpbmcsICRkb2N1bWVudCwgJGlvbmljUGxhdGZvcm0sICRjb21waWxlLCAkaW9uaWNNb2RhbCwgJGlvbmljUG9wdXAsICRjb3Jkb3ZhRmlsZVRyYW5zZmVyLCAkc3RhdGUsICRjb3Jkb3ZhRmlsZSwgJGNvcmRvdmFGaWxlT3BlbmVyMil7XG5cbiAgICAgICAgICAgIHJldHVybntcbiAgICAgICAgICAgICAgICBwb3N0OiAoZnVuY3Rpb24oKXtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgYkJ0biA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGNtZCwgZnVuYywgZGF0YSwgaGlkZUVycm9yLCBpc1NlcmlhbCl7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGRhdGEsIGZ1bmN0aW9uKHZhbCwga2V5KXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtrZXldID0gdmFsICsgJyc7XG4gICAgICAgICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICAgICAgICAgdmFyIFRoaXMgPSB0aGlzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcERhdGEgPSBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVnaXN0cmF0aW9uSWQgPSBUaGlzLmxvY2FsU3RvcmFnZUhhbmRsZSgncmVnaXN0cmF0aW9uSWQnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkID0gJHEuZGVmZXIoKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGFjY291bnREYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV0d29ya1N0YXR1cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb24gPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY21kOiBjbWQgKyAnJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmdW5jOiBmdW5jLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hY2hJZDogcmVnaXN0cmF0aW9uSWQgfHwgKHdpbmRvdy5kZXZpY2UgJiYgZGV2aWNlLnV1aWQpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRva2VuOiB0aGlzLnVzZXJCYXNlTXNnLnRva2VuIHx8ICcnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1zZzogZGF0YSB8fCB7fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAvLyDlpoLmnpxjbWTmmK/lr7nosaFcbiAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNtZC5jbWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGpzb24gPSBjbWQ7XG4gICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgICAgICAgICog5qOA5rWL5b2T5YmN572R57ucXG4gICAgICAgICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiBjaGVja0Nvbm5lY3Rpb24oKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghanNvbi5tYWNoSWQgfHwgIW5hdmlnYXRvci5jb25uZWN0aW9uKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG5ldHdvcmtTdGF0ZSA9IG5hdmlnYXRvci5jb25uZWN0aW9uLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVzID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZXNbQ29ubmVjdGlvbi5VTktOT1dOXSAgPSAnVW5rbm93biBjb25uZWN0aW9uJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlc1tDb25uZWN0aW9uLkVUSEVSTkVUXSA9ICdFdGhlcm5ldCBjb25uZWN0aW9uJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlc1tDb25uZWN0aW9uLldJRkldICAgICA9ICdXaUZpIGNvbm5lY3Rpb24nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVzW0Nvbm5lY3Rpb24uQ0VMTF8yR10gID0gJ0NlbGwgMkcgY29ubmVjdGlvbic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICBzdGF0ZXNbQ29ubmVjdGlvbi5DRUxMXzNHXSAgPSAnQ2VsbCAzRyBjb25uZWN0aW9uJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlc1tDb25uZWN0aW9uLkNFTExfNEddICA9ICdDZWxsIDRHIGNvbm5lY3Rpb24nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgc3RhdGVzW0Nvbm5lY3Rpb24uQ0VMTF0gICAgID0gJ0NlbGwgZ2VuZXJpYyBjb25uZWN0aW9uJztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0YXRlc1tDb25uZWN0aW9uLk5PTkVdICAgICA9ICdObyBuZXR3b3JrIGNvbm5lY3Rpb24nO1xuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzdGF0ZXNbbmV0d29ya1N0YXRlXVxuICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgbmV0d29ya1N0YXR1cyA9IGNoZWNrQ29ubmVjdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmlzT2ZmTGluZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAvLyDmsqHmnInov57mjqXkupLogZTnvZFcbiAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ldHdvcmtTdGF0dXMgPT0gJ05vIG5ldHdvcmsgY29ubmVjdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoe2lzT2ZmTGluZTogdHJ1ZX0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5pc09mZkxpbmUgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBUaGlzLmVycm9yUHJvbXB0KCfnvZHnu5zov57mjqXlpLHotKUhJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgIGlmIChqc29uLm1hY2hJZCkge1xuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpc1NlcmlhbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJCdG4gPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIGh0dHAuaHR0cHNQb3N0KCdodHRwczovL2ludGVyZmFjZS5pY2FpbWkuY29tL2ludGVyZmFjZScsIGpzb24sIGZ1bmN0aW9uKHJlKXtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlID0gSlNPTi5wYXJzZShyZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZUhhbmRsZShkZWZlcnJlZCwgcmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJCdG4gPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihyZSl7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QocmUucmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBiQnRuID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDmj5DnpLrplJnor69cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAhaGlkZUVycm9yICYmIFRoaXMuZXJyb3JQcm9tcHQocmUubXNnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG5cbiAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGJCdG4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNTZXJpYWwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYkJ0biA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkaHR0cCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVybDogaXNMb2FjbCA/ICcvJyA6ICcvaDUvaW50ZXJmYWNlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiBpc0xvYWNsID8gJ2dldCcgOiAncG9zdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHttc2c6IGpzb259LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL3gtd3d3LWZvcm0tdXJsZW5jb2RlZCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pLnN1Y2Nlc3MoZnVuY3Rpb24oZGF0YSwgc3RhdHVzKXtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyRpb25pY0xvYWRpbmcuaGlkZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJCdG4gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXNwb25zZUhhbmRsZShkZWZlcnJlZCwgZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gcmVzcG9uc2VIYW5kbGUoZGVmZXJyZWQsIGRhdGEpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZGF0YSA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5jb2RlID0gJzAwMDAnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5pyq55m75b2VXG4gICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YS5jb2RlID09ICcwMDA4Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBEYXRhID0ganNvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2NvdW50RGF0YSA9IFRoaXMubG9jYWxTdG9yYWdlSGFuZGxlKCdhY2NvdW50Jyk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYWNjb3VudERhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGhpcy5zaWduSW4oYWNjb3VudERhdGEsIGZ1bmN0aW9uKHJlKXtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlLnRva2VuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcERhdGEudG9rZW4gPSByZS50b2tlbjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBUaGlzLnBvc3QodGVtcERhdGEpLnRoZW4oZnVuY3Rpb24ocmUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZShyZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCd0YWIubG9naW4nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygndGFiLmxvZ2luJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGF0YS5jb2RlID09PSAnMDAwMCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKGRhdGEucmVzdWx0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoZGF0YS5tc2cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIOaPkOekuumUmeivr1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICFoaWRlRXJyb3IgJiYgIFRoaXMuZXJyb3JQcm9tcHQoZGF0YS5tc2cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0oKSksXG4gICAgICAgICAgICAgICAgc2VyaWFsUG9zdDogZnVuY3Rpb24oY21kLCBmdW5jLCBkYXRhLCBoaWRlRXJyb3Ipe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5wb3N0KGNtZCwgZnVuYywgZGF0YSwgaGlkZUVycm9yLCB0cnVlKTtcblxuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAvLyDlpITnkIbpobbpg6jlr7zoiKrmnaFcbiAgICAgICAgICAgICAgICBoYW5kbGVIZWFkZXI6IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkaW9uaWNTY3JvbGxEZWxlZ2F0ZS5nZXRTY3JvbGxQb3NpdGlvbigpLnRvcCA8IDAgKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KCdoZWFkZXIuaGlkZScpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoJ2hlYWRlci5zaG93Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRkaWdlc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgMTAwKVxuXG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIC8vIOeUqOaIt+S/oeaBr1xuICAgICAgICAgICAgICAgIHVzZXJCYXNlTXNnOiB7fSxcblxuICAgICAgICAgICAgICAgIC8vIOiuvue9rueUqOaIt+S/oeaBr1xuICAgICAgICAgICAgICAgIHNldFVzZXJCYXNlTXNnOiBmdW5jdGlvbihtc2cpe1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnVzZXJCYXNlTXNnID0gbXNnO1xuICAgICAgICAgICAgICAgIH0sXG5cbiAgICAgICAgICAgICAgICAvLyDmmK/kuI3mmK/nqbrlr7nosaFcbiAgICAgICAgICAgICAgICBpc0VtcHR5T2JqZWN0OiBmdW5jdGlvbihvYmope1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgaW4gb2JqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjYWNoZURhdGE6IHt9LFxuICAgICAgICAgICAgICAgIGNhY2hlOiBmdW5jdGlvbihzaWduLCBkYXRhKXtcblxuICAgICAgICAgICAgICAgICAgICBpZiAoZGF0YSAhPSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzQXJyYXkodGhpcy5jYWNoZURhdGFbc2lnbl0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jYWNoZURhdGFbc2lnbl0gPSB0aGlzLmNhY2hlRGF0YVtzaWduXS5jb25jYXQoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuY2FjaGVEYXRhW3NpZ25dID0gZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmNhY2hlRGF0YVtzaWduXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIC8vIOmUmeivr+aPkOekulxuICAgICAgICAgICAgICAgIGVycm9yUHJvbXB0OiBmdW5jdGlvbihtc2cpe1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBodG1sID0gJzxkaXYgY2xhc3M9XCJlcnJvci1wcm9tcHRcIj4nICsgbXNnICsgJzwvZGl2Pic7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHByb21wdERvbSA9IGFuZ3VsYXIuZWxlbWVudChodG1sKTtcblxuICAgICAgICAgICAgICAgICAgICAkZG9jdW1lbnQuZmluZCgnYm9keScpLmFwcGVuZChwcm9tcHREb20pO1xuXG4gICAgICAgICAgICAgICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9tcHREb20ucmVtb3ZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH0sIDIwMDApXG4gICAgICAgICAgICAgICAgfSxcblxuICAgICAgICAgICAgICAgIC8vIOmAieaLqVxuICAgICAgICAgICAgICAgc2VsZWN0UHJvbXB0OiBmdW5jdGlvbihvYmope1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBodG1sID0gd2luZG93LmRldmljZSA/ICc8ZGl2IGNsYXNzPVwicHJvbXB0LWJvdHRvbVwiPjxkaXYgY2xhc3M9XCJsaXN0XCI+PGRpdiBuZy1yZXBlYXQ9XCJpIGluIGRhdGFcIiBjbGFzcz1cIml0ZW1cIiBuZy1jbGljaz1cImFwcGVjdChpLnNpZ24pXCI+e3tpLnRleHR9fTwvZGl2PjwvZGl2PjxkaXYgY2xhc3M9XCJsaXN0XCI+PGRpdiBjbGFzcz1cIml0ZW1cIiAgbmctY2xpY2s9XCJjYW5jZWwoKVwiPuWPlua2iDwvZGl2PjwvZGl2PjwvZGl2PicgOlxuICAgICAgICAgICAgICAgICAgICAgICc8ZGl2IGNsYXNzPVwicHJvbXB0LWJvdHRvbVwiPjxkaXYgY2xhc3M9XCJsaXN0XCI+PGRpdiBjbGFzcz1cIml0ZW1cIj7kuIrkvKDlm77lg488Zm9ybT48aW5wdXQgdHlwZT1cImZpbGVcIiBuYW1lPVwiZmlsZVwiIG9uY2hhbmdlPVwiYXBwZWN0KHRoaXMpXCIvPjwvZm9ybT48L2Rpdj48L2Rpdj48ZGl2IGNsYXNzPVwibGlzdFwiPjxkaXYgY2xhc3M9XCJpdGVtXCIgIG5nLWNsaWNrPVwiY2FuY2VsKClcIj7lj5bmtog8L2Rpdj48L2Rpdj48L2Rpdj4nO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBwcm9tcHREb20gPSBhbmd1bGFyLmVsZW1lbnQoaHRtbCksXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZSA9ICRyb290U2NvcGUuJG5ldygpO1xuXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmRhdGEgPSAgb2JqLmZ1bmM7XG5cbiAgICAgICAgICAgICAgICAgICAgYXBwZWN0ID0gc2NvcGUuYXBwZWN0ID0gZnVuY3Rpb24oc2lnbil7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmouYWNjZXB0KHNpZ24pO1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUuY2FuY2VsKCk7XG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuY2FuY2VsPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvbXB0RG9tLnJlbW92ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG9iai5jYW5jZWwpIG9iai5jYW5jZWwoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgICAgICAgICAgICAgJGRvY3VtZW50LmZpbmQoJ2JvZHknKS5hcHBlbmQocHJvbXB0RG9tKTtcbiAgICAgICAgICAgICAgICAgICAgJGNvbXBpbGUocHJvbXB0RG9tKShzY29wZSk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNjb3BlLmNhbmNlbDtcbiAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICog5aSE55CG57yT5a2YXG4gICAgICAgICAgICAgICAgICogQHBhcmFtIHNpZ24ge1N0cmluZyBvciBPYmplY3R9IOe8k+WtmOeahGtleSDms6jvvJrlj5bmlbDmja7ml7bmoLzlvI/lj6/ku6Xku6V7a2V5OiAnc2lnbicsIHBhZ2U6IDEsIHBhZ2VTaXplOiAxMH0g5qC85byP5Y+W5oyH5a6a55qE5pWw5o2uXG4gICAgICAgICAgICAgICAgICogQHBhcmFtIGRhdGEge09iamVjdH0g57yT5a2Y55qE5pWw5o2uXG4gICAgICAgICAgICAgICAgICogQHBhcmFtIGlzUHVzaCB7Qm9vbGVhbn0g5piv5LiN5piv6L+95Yqg5pWw5o2uXG4gICAgICAgICAgICAgICAgICogQHJldHVybnMgeyp9IHtPYmplY3R9IOi/lOWbnueahOaVsOaNrlxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGxvY2FsU3RvcmFnZUhhbmRsZTogZnVuY3Rpb24oc2lnbiwgZGF0YSwgaXNQdXNoKXtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgcmVzdWx0LFxuICAgICAgICAgICAgICAgICAgICAgICAga2V5ID0gc2lnbi5rZXkgfHwgc2lnbixcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gc2lnbi5wYWdlIHx8IDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBlbmQgPSBzaWduLnBhZ2VTaXplIHx8IDEwO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhICE9IHVuZGVmaW5lZCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNQdXNoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0ID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShrZXkpKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhbmd1bGFyLmlzQXJyYXkocmVzdWx0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhID0gcmVzdWx0LmNvbmNhdChkYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCF0aGlzLmlzRW1wdHlPYmplY3QocmVzdWx0KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbmd1bGFyLmV4dGVuZChkYXRhLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oc2lnbiwgSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdCA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoYW5ndWxhci5pc0FycmF5KHJlc3VsdCkpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuc2xpY2Uoc3RhcnQgKiBlbmQsIHN0YXJ0ICogZW5kICsgZW5kKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2goZSl7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZmluYWxseXtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICog5piv5ZCm55m75b2VXG4gICAgICAgICAgICAgICAgICogQHJldHVybnMgeyp8b3B0aW9ucy50b2tlbnx7dHlwZSwgc2hvcnRoYW5kfXxudWxsfVxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGlzU2lnbkluOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy51c2VyQmFzZU1zZy50b2tlbjtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIOeZu+W9lVxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSBkYXRhIHtPYmplY3R9IOeUqOaIt+WQjeWvhueggVxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSBmbiB7RnVuY3Rpb259IOWbnuiwg+WHveaVsFxuICAgICAgICAgICAgICAgICAqIEBwYXJhbSBoaWRlRXJyb3Ige0Jvb2xlYW59IOaYr+WQpumakOiXj+mUmeivr+aPkOekulxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIHNpZ25JbjogZnVuY3Rpb24oZGF0YSwgZm4sIGhpZGVFcnJvcil7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIFRoaXMgPSB0aGlzO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXRhICYmIGRhdGEubW9iaWxlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBvc3QoJzMxMDEnLCAncGFzc3dvcmQnLCBkYXRhLCBoaWRlRXJyb3IpLnRoZW4oZnVuY3Rpb24ocmUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRoaXMuc2V0VXNlckJhc2VNc2cocmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmbikgZm4ocmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24ocmUpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmbikgZm4ocmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiDoh6rliqjnmbvlvZVcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0gYWNjb3VudCB7T2JqZWN0fSDnlKjmiLfkv6Hmga9cbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0gZm4ge0Z1bmN0aW9ufSDlm57osIPlh73mlbBcbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBhdXRvU2lnbmluOiBmdW5jdGlvbihhY2NvdW50LCBmbil7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCF0aGlzLmlzU2lnbkluKCkpe1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zaWduSW4oYWNjb3VudCwgZm4sIHRydWUpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm4gJiYgZm4oKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICog57O757uf5pu05pawXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgdXBkYXRlQVBQOiBmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBzaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBUaGlzID0gdGhpcztcblxuICAgICAgICAgICAgICAgICAgICAvL2lmICh0eXBlb2YgaHR0cCAhPSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyAgICBodHRwLmdldFNpZChmdW5jdGlvbihzaWQpe1xuICAgICAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgc2lkID0gc2lkO1xuICAgICAgICAgICAgICAgICAgICAvLyAgICAgICAgY2hlY2tVcGRhdGUoc2lkKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gICAgfSlcbiAgICAgICAgICAgICAgICAgICAgLy99XG4gICAgICAgICAgICAgICAgICBjaGVja1VwZGF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAvLyDmo4Dmn6Xmm7TmlrBcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gY2hlY2tVcGRhdGUoc2lkKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIFRoaXMucG9zdCgnMTAwMCcsICd2ZXJzaW9uJykudGhlbihmdW5jdGlvbihyZSl7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDmm7TmlrBcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmUuc3RhdHVzID09IDIpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkaW9uaWNQb3B1cC5zaG93KHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRlbXBsYXRlOiAnPHAgY2xhc3M9XCJjLTMzMyBmcy0xNVwiIHN0eWxlPVwibWFyZ2luOiAyMHB4IDVweCAyM3B4O1wiPicgKyByZS51cGRhdGVJbmZvICsgJzwvcD4nLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGl0bGU6ICfniYjmnKzmm7TmlrDmj5DnpLonLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYnV0dG9uczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHt0ZXh0OiAn5Y+W5raIJ30sXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZXh0OiAn56Gu5a6aJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2MtcmVkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25UYXA6IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1cGRhdGVIYW5kbGUocmUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5by65Yi25pu05pawXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAocmUuc3RhdHVzID09IDMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGlvbmljUG9wdXAuc2hvdyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJzxwIGNsYXNzPVwiYy0zMzMgZnMtMTVcIiBzdHlsZT1cIm1hcmdpbjogMjBweCA1cHggMjNweDtcIj4nICsgcmUudXBkYXRlSW5mbyArICc8L3A+JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRpdGxlOiAn54mI5pys5pu05paw5o+Q56S6JyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGJ1dHRvbnM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRleHQ6ICfnoa7lrponLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnYy1yZWQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvblRhcDogZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUhhbmRsZShyZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiB1cGRhdGVIYW5kbGUocmVzdWx0KSB7XG5cblxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHVybCA9IHJlc3VsdC5kb3duVXJsIHx8ICdodHRwOi8vbmV3YXBwLmljYWltaS5jb20vYXBrL2FuZHJvaWQtODAwMC5hcGsnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9wdGlvbnMgPSB7fSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0YXJnZXRQYXRoID0gY29yZG92YS5maWxlLmV4dGVybmFsUm9vdERpcmVjdG9yeSArICcvY2FpbWl6aGl0b3UvY29tLmljYWltaS5sb3R0ZXJ5LmFwaycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ1c3RIb3N0cyA9IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NlZDtcblxuICAgICAgICAgICAgICAgICAgICAgICAgJGNvcmRvdmFGaWxlLmNoZWNrRGlyKGNvcmRvdmEuZmlsZS5leHRlcm5hbFJvb3REaXJlY3RvcnksICdjYWltaXpoaXRvdScpLnRoZW4oZnVuY3Rpb24ocmUpe1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGNvcmRvdmFGaWxlVHJhbnNmZXIuZG93bmxvYWQodXJsLCB0YXJnZXRQYXRoLCBvcHRpb25zLCB0cnVzdEhvc3RzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgVGhpcy5sb2NhbFN0b3JhZ2VIYW5kbGUoJ3N0YXJ0JywgZmFsc2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGNvcmRvdmFGaWxlT3BlbmVyMi5vcGVuKHRhcmdldFBhdGgsICdhcHBsaWNhdGlvbi92bmQuYW5kcm9pZC5wYWNrYWdlLWFyY2hpdmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcblxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGlvbmljTG9hZGluZy5zaG93KHt0ZW1wbGF0ZTogJ+S4i+i9veWksei0pe+8gScsIG5vQmFja2Ryb3A6IHRydWUsIGR1cmF0aW9uOiAyMDAwfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChwcm9ncmVzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NlZCA9IChwcm9ncmVzcy5sb2FkZWQgLyBwcm9ncmVzcy50b3RhbCkgKiAxMDA7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkaW9uaWNMb2FkaW5nLnNob3coe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0ZW1wbGF0ZTogJ+W3sue7j+S4i+i9vScgKyBNYXRoLmZsb29yKHByb2dyZXNzZWQpICsgJyUnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHByb2dyZXNzZWQgPiA5OSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkaW9uaWNMb2FkaW5nLmhpZGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCAxMDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24ocmUpe1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJGNvcmRvdmFGaWxlLmNyZWF0ZURpcihjb3Jkb3ZhLmZpbGUuZXh0ZXJuYWxSb290RGlyZWN0b3J5LCBcImNhaW1pemhpdG91XCIsIGZhbHNlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGNvcmRvdmFGaWxlVHJhbnNmZXIuZG93bmxvYWQodXJsLCB0YXJnZXRQYXRoLCBvcHRpb25zLCB0cnVzdEhvc3RzKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFRoaXMubG9jYWxTdG9yYWdlSGFuZGxlKCdzdGFydCcsIGZhbHNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGNvcmRvdmFGaWxlT3BlbmVyMi5vcGVuKHRhcmdldFBhdGgsICdhcHBsaWNhdGlvbi92bmQuYW5kcm9pZC5wYWNrYWdlLWFyY2hpdmUnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuXG5cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGlvbmljTG9hZGluZy5zaG93KHt0ZW1wbGF0ZTogJ+S4i+i9veWksei0pe+8gScsIG5vQmFja2Ryb3A6IHRydWUsIGR1cmF0aW9uOiAyMDAwfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKHByb2dyZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJvZ3Jlc3NlZCA9IChwcm9ncmVzcy5sb2FkZWQgLyBwcm9ncmVzcy50b3RhbCkgKiAxMDA7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRpb25pY0xvYWRpbmcuc2hvdyh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGVtcGxhdGU6ICflt7Lnu4/kuIvovb0nICsgTWF0aC5mbG9vcihwcm9ncmVzc2VkKSArICclJ1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocHJvZ3Jlc3NlZCA+IDk5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJGlvbmljTG9hZGluZy5oaWRlKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIDEwMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhbGVydCgnc2TljaHor7vlhpnplJnor68nKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiDlrZjlgqjmnKzlnLDmlofku7ZcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0gc2lnbiB7U3RyaW5nfSDnvJPlrZjnmoRrZXlcbiAgICAgICAgICAgICAgICAgKiBAcGFyYW0gbXNnIHtTdHJpbmd9IOe8k+WtmOeahOWGheWuuVxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGNhY2hlU0Q6IGZ1bmN0aW9uKHNpZ24sIG1zZyl7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyDliKTmlq3mmK/kuI3mmK/mlofku7ZcbiAgICAgICAgICAgICAgICAgICAgJGNvcmRvdmFGaWxlLmNoZWNrRmlsZShjb3Jkb3ZhLmZpbGUuZGF0YURpcmVjdG9yeSwgc2lnbilcbiAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChzdWNjZXNzKSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIW1zZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWFkRmlsZShzdWNjZXNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3cml0ZUZpbGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdyaXRlRmlsZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuXG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHdyaXRlRmlsZSgpe1xuICAgICAgICAgICAgICAgICAgICAgICAgJGNvcmRvdmFGaWxlLndyaXRlRmlsZShjb3Jkb3ZhLmZpbGUuZGF0YURpcmVjdG9yeSwgc2lnbiwgbXNnLCB0cnVlKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uIChzdWNjZXNzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoc3VjY2Vzcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSwgZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdChzdWNjZXNzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHJlYWRGaWxlKHN1Y2Nlc3Mpe1xuICAgICAgICAgICAgICAgICAgICAgICAgJGNvcmRvdmFGaWxlLnJlYWRBc1RleHQoY29yZG92YS5maWxlLmRhdGFEaXJlY3RvcnksIHN1Y2Nlc3MubmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKHN1Y2Nlc3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0sIGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWZlcnJlZC5yZWplY3Qoc3VjY2Vzcyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcHJlSW1hZ2U6IGZ1bmN0aW9uKGltZ0Fycil7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvSW1nID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKGltZ0FyciwgZnVuY3Rpb24oaW1nKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwidXNlIHN0cmljdFwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgb0ltZyA9IG5ldyBJbWFnZSgpO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBvSW1nLnNyYyA9IGltZztcbiAgICAgICAgICAgICAgICAgICAgfSlcblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XSlcbn0oKSlcblxuXG59KS5jYWxsKHRoaXMscmVxdWlyZShcInJIMUpQR1wiKSx0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30scmVxdWlyZShcImJ1ZmZlclwiKS5CdWZmZXIsYXJndW1lbnRzWzNdLGFyZ3VtZW50c1s0XSxhcmd1bWVudHNbNV0sYXJndW1lbnRzWzZdLFwiL3NlcnZpY2VNb2R1bGUuanNcIixcIi9cIikiXX0=
