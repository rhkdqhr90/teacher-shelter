"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashIp = hashIp;
const crypto_1 = require("crypto");
function hashIp(ip) {
    const salt = process.env.IP_HASH_SALT;
    if (!salt) {
        throw new Error('IP_HASH_SALT environment variable is required');
    }
    return (0, crypto_1.createHash)('sha256').update(`${salt}:${ip}`).digest('hex');
}
//# sourceMappingURL=ip.util.js.map