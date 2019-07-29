"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const request = __importStar(require("request"));
function GetProfile(member) {
    return new Promise((resolve, reject) => {
        const options = {
            url: `https://www.bungie.net/Platform/Destiny2/${member.membershipType}/Profile/${member.membershipId}/?components=100,200`,
            headers: {
                'x-api-key': process.env.bungieApiKey
            }
        };
        request.get(options, (err, res, body) => {
            if (err) {
                reject(err);
            }
            let temp = JSON.parse(body);
            if (res.statusCode !== 200) {
                if (temp.hasOwnProperty('ErrorCode') && temp['ErrorCode'] === 1652) { // Failed because of delay, resend
                    resolve(GetProfile(member));
                }
                else {
                    reject(`Stats request failed: ${res.statusCode} ${body}`);
                }
            }
            else {
                // TODO: Should I be returning an array of characters? No, probably just an array of the character ids, and some 'max' stats across them
                resolve();
            }
        });
    });
}
exports.GetProfile = GetProfile;
