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
const CLANID = '407685';
const MEMBERTYPELOOKUP = {
    '0': 'None',
    '1': 'Beginner',
    '2': 'Member',
    '3': 'Admin',
    '4': 'Acting Founder',
    '5': 'Founder',
};
function GetClanMembers() {
    return new Promise((resolve, reject) => {
        const options = {
            'url': `https://www.bungie.net/Platform/GroupV2/${CLANID}/Members/`,
            'headers': {
                'x-api-key': process.env.bungieApiKey,
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
            let clanResponse = JSON.parse(body);
            clanResponse['Response']['results'].forEach((clanMember) => {
                if (clanMember.hasOwnProperty('destinyUserInfo')) {
                    // Lookup the string value for the clanMemberType
                    const memberType = clanMember['memberType'];
                    const memberTypeValue = MEMBERTYPELOOKUP[memberType.toString()];
                    let isPrimary;
                    let bungieMembershipId = `Not available for account: ${clanMember['destinyUserInfo']['displayName']}`;
                    // Not a cross save account
                    if (clanMember['destinyUserInfo']['crossSaveOverride'] === 0) {
                        isPrimary = true;
                    }
                    else if (clanMember['destinyUserInfo']['crossSaveOverride'] === clanMember['destinyUserInfo']['membershipType']) {
                        isPrimary = true;
                    }
                    else {
                        isPrimary = false;
                    }
                    // I swear this is only required for some people (namely, Mdawg12319)
                    if (Object.prototype.hasOwnProperty.call(clanMember, 'bungieNetUserInfo')) {
                        bungieMembershipId = clanMember['bungieNetUserInfo']['membershipId'];
                    }
                    members.push({
                        'bungieMembershipId': bungieMembershipId,
                        'membershipId': clanMember['destinyUserInfo']['membershipId'],
                        'membershipType': clanMember['destinyUserInfo']['membershipType'],
                        'displayName': clanMember['destinyUserInfo']['displayName'],
                        'clanMemberType': memberTypeValue,
                        'onlineStatus': clanMember['isOnline'],
                        'isPrimary': isPrimary,
                        'dateLastOn': new Date(parseInt(clanMember['lastOnlineStatusChange']) * 1000),
                    });
                }
            });
            resolve(members);
        });
    });
}
exports.GetClanMembers = GetClanMembers;
//# sourceMappingURL=ClanRequests.js.map