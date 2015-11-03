/**
 * packet.js
 * @author Vivian
 * @version 1.0.0
 * copyright 2014-2015, gandxiaowei@gmail.com all rights reserved.
 */

/**Packet解析*/
function Packet(operateCode, seq) {
    this.operateCode = operateCode;
    this.seq = seq;
}

Packet.prototype._intBitsToFloat = function (i) {
    var int8 = new Int8Array(4); //[0,0,0,0]
    var int32 = new Int32Array(int8.buffer, 0, 1); //0
    var float32 = new Float32Array(int8.buffer, 0, 1); //0
    int32[0] = i;
    return float32[0];
};

Packet.prototype._getStringFromByteArray = function (arr) {
    var i, str = '';
    for (i = 0; i < arr.length; i++) {
        str += '%' + ('0' + arr[i].toString(16)).slice(-2);
    }
    return decodeURIComponent(str);
};

/**Packet输入解析流*/
Packet.prototype.input = function (buff) {
    this.buff = buff;
};

/**Packet解析方法*/
Packet.prototype.decode = function (buffer) {
    var data = new Uint8Array(buffer);

    var buff = [], i;
    for (i = 0; i < data.length; i++) {
        buff.push(data[i]);
    }

    this.input(buff);

    var len = this.getInt(buff);
    this.seq = this.getInt(buff);
    this.operateCode = this.getInt(buff);

    var count = this.getInt();

    var tables = [];
    for (i = 0; i < count; i++) {
        tables.push(this.decodeTable());
    }

    var info = {};
    if (!tables) {
        return info;
    }
    for (i = 0; i < tables.length; i++) {
        var table = tables[i];
        info[table.name] = table.rows;
    }
    return info;
};

/**解析表*/
Packet.prototype.decodeTable = function () {
    var table = {};
    var nameLen = this.getInt();
    if (nameLen > this.buff.length) {
        throw new Error('数据异常');
    }
    table.name = this._getStringFromByteArray(this.get(nameLen)).toLocaleLowerCase();
    table.field = [];
    var names = [];
    table.rows = [];
    var fieldCount = this.getInt();
    var i;
    for (i = 0; i < fieldCount; i++) {
        var field = this.decodeField();
        table.field.push(field);
        names.push(field.name);
    }

    var rowCount = this.getInt();
    for (i = 0; i < rowCount; i++) {
        table.rows.push(this.decodeRow(table.field));
    }
    return table;

};

/**解析列名*/
Packet.prototype.decodeField = function () {
    var dataField = {};
    var flag = this.buff.shift();
    dataField.type = String.fromCharCode(this.buff.shift());
    dataField.precise = this.getShort();
    dataField.length = this.getInt();
    var size = this.getInt();
    if (size > this.buff.length) {
        throw new Error('数据异常');
    }
    dataField.name = this._getStringFromByteArray(this.get(size)).toLocaleLowerCase();
    if (flag > 0 && this.buff.length > 4) {
        size = Math.min(this.getInt(), this.buff.length);
        dataField.caption = this._getStringFromByteArray(this.get(size));
    }
    return dataField;
};

/**解析数据列*/
Packet.prototype.decodeRow = function (fields) {
    var row = {};
    for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        var name = field.name;
        switch (field.type) {
            case 'B':
                var len = this.getInt();
                if (len > this.buff.length) {
                    throw new Error('数据异常');
                }
                row[name] = this.get(len);
                break;
            case 'S':
                len = this.getInt();
                if (len > this.buff.length) {
                    throw new Error('数据异常');
                }
                row[name] = this._getStringFromByteArray(this.get(len));
                break;
            case 'C':
                row[name] = this.getChar();
                break;
            case 'T':
                row[name] = this.getShort();
                break;
            case 'N':
                row[name] = this.getInt();
                break;
            case 'L':
                row[name] = this.getLong();
                break;
            case '1':
                row[name] = this.getCompressLong();
                break;
            case '2':
                row[name] = this.getCompressInt();
                break;
            case '3':
                row[name] = this.getCompressDateTime();
                break;
            case 'F':
                row[name] = this.getFloat();
                break;
            case 'D':
                row[name] = this.getDouble();
                break;
            case 'Y':
                row[name] = this.getByte();
                break;
            default:
                console.log('未知类型:' + field.type);
                break;
        }
    }
    return row;
};

Packet.prototype.get = function (count) {
    var temp = [];
    for (var i = 0; i < count; i++) {
        temp.push(this.buff.shift());
    }
    return temp;
};

Packet.prototype.getByte = function () {
    return this.buff.shift();
};


Packet.prototype.getChar = function () {
    String.fromCharCode(this.buff.shift());
};

Packet.prototype.getShort = function () {
    var b0 = this.buff.shift();
    var b1 = this.buff.shift();
    return (b0 << 8) | (b1 & 0xff);
};

Packet.prototype.getInt = function () {
    var b0 = this.buff.shift();
    var b1 = this.buff.shift();
    var b2 = this.buff.shift();
    var b3 = this.buff.shift();
    var addr = b3 & 0xFF;
    addr |= ((b2 << 8) & 0xFF00);
    addr |= ((b1 << 16) & 0xFF0000);
    addr |= ((b0 << 24) & 0xFF000000);
    return addr;
};

Packet.prototype.getLong = function () {
    var b0 = ((this.buff.shift() & 0xff) << 56) >>> 0;
    var b1 = ((this.buff.shift() & 0xff) << 48) >>> 0;
    var b2 = ((this.buff.shift() & 0xff) << 40) >>> 0;
    var b3 = ((this.buff.shift() & 0xff) << 32) >>> 0;
    var b4 = ((this.buff.shift() & 0xff) << 24) >>> 0;
    var b5 = ((this.buff.shift() & 0xff) << 16) >>> 0;
    var b6 = ((this.buff.shift() & 0xff) << 8) >>> 0;
    var b7 = (this.buff.shift() & 0xff) >>> 0;

    var value_high = (b0 | b1 | b2 | b3),
        value_low = (b4 | b5 | b6 | b7),
        value = value_high * Math.pow(1 << 16, 2) + (value_low < 0 ? Math.pow(1 << 16, 2) : 0) + value_low;
    return value;
};

Packet.prototype.getCompressDateTime = function () {
    var intDateTime = this.getInt();
    var minute = intDateTime & 0x3F;
    var hour = (intDateTime >>> 6) & 0x1F;
    var day = (intDateTime >>> 11) & 0x1F;
    var month = (intDateTime >>> 16) & 0x0F;
    var year = (intDateTime >>> 20) & 0x0FFF;
    var longDateTime = year * 10000000000 + month * 100000000 + day * 1000000 + hour * 10000 + minute * 100;
    return longDateTime;
};

Packet.prototype.getCompressInt = function () {
    var val = 0;
    var b;
    var ind = 0;
    do {
        b = this.buff.shift();
        if (ind === 0 && (b & 0x40) !== 0) {
            val = 0xffffffff;
        }
        ind++;
        val = (val << 7) | (b & 0x7f);
    } while ((b & 0x80) === 0);
    return val;
};

Packet.prototype.getCompressLong = function () {
    var val_low = 0;
    var val_high = 0;
    var b;
    var ind = 0;
    do {
        b = this.buff.shift();
        if (ind === 0 && (b & 0x40) !== 0) {
            val_low = 0xffffffff;
            val_high = 0xffffffff;
        }
        ind++;
        val_high = (val_high << 7) | (val_low >>> (32 - 7));
        val_low = (val_low << 7) | (b & 0x7f);
    }
    while ((b & 0x80) === 0);
    return val_high * Math.pow(1 << 16, 2) + (val_low < 0 ? Math.pow(1 << 16, 2) : 0) + val_low;
};

Packet.prototype.getFloat = function () {
    return this._intBitsToFloat(this.getInt());
};

Packet.prototype.getDouble = function () {
    var b0 = this.buff.shift() & 0xff;
    var b1 = this.buff.shift() & 0xff;
    var b2 = this.buff.shift() & 0xff;
    var b3 = this.buff.shift() & 0xff;
    var b4 = this.buff.shift() & 0xff;
    var b5 = this.buff.shift() & 0xff;
    var b6 = this.buff.shift() & 0xff;
    var b7 = this.buff.shift() & 0xff;

    var signed = b0 & 0x80;
    var e = (b1 & 0xF0) >> 4;
    e += (b0 & 0x7F) << 4;

    var m = b7;
    m += b6 << 8;
    m += b5 << 16;
    m += b4 * Math.pow(2, 24);
    m += b3 * Math.pow(2, 32);
    m += b2 * Math.pow(2, 40);
    m += (b1 & 0x0F) * Math.pow(2, 48);

    switch (e) {
        case 0:
            e = -1022;
            break;
        case 2047:
            return m ? NaN : (signed ? -Infinity : Infinity);
        default:
            m += Math.pow(2, 52);
            e -= 1023;
    }
    if (signed) {
        m *= -1;
    }
    return m * Math.pow(2, e - 52);
};
