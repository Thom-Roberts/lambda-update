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
const ClanId = '407685';
const BUNGIEAPIKEY = 'fc470e42da39445380152053f1a86267';
function GetClanMembers() {
    return new Promise((resolve, reject) => {
        const options = {
            'url': `https://www.bungie.net/Platform/GroupV2/${ClanId}/Members/`,
            'headers': {
                'x-api-key': BUNGIEAPIKEY,
            },
        };
        request.get(options, (err, res, body) => {
            let members = [];
            if (err) {
                reject(err);
            }
            if (res.statusCode !== 200) {
                reject(`Could not resolve status code: ${res.statusCode}`);
            }
            let temp = JSON.parse(body);
            temp['Response']['results'].forEach((val) => {
                if (val.hasOwnProperty('destinyUserInfo')) {
                    members.push({
                        'membershipId': val['destinyUserInfo']['membershipId'],
                        'membershipType': val['destinyUserInfo']['membershipType'],
                        'displayName': val['destinyUserInfo']['displayName'],
                    });
                }
            });
            resolve(members);
        });
    });
}
exports.GetClanMembers = GetClanMembers;