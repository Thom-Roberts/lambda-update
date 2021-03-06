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
                'x-api-key': process.env.bungieApiKey,
            }
        };
        request.get(options, async (err, res, body) => {
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
                let character = {
                    characterId: '0',
                    class: 'Titan',
                    minutesPlayed: 0,
                    emblemLocation: '',
                    currentLightLevel: 0,
                    currentLevel: 0,
                    characters: null,
                };
                let responseObj = temp.Response.characters.data;
                for (let charId in responseObj) {
                    // If the next character has more time played, then set them up as larger
                    if (parseInt(responseObj[charId].minutesPlayedTotal) > character.minutesPlayed) {
                        let charClass = '';
                        switch (responseObj[charId].classHash) {
                            case 2271682572:
                                charClass = 'Warlock';
                                break;
                            case 3655393761:
                                charClass = 'Titan';
                                break;
                            case 671679327:
                                charClass = 'Hunter';
                                break;
                            default:
                                reject(`Character class hash could not be resolved. Hash given: ${responseObj[charId].classHash}`);
                        }
                        character = {
                            characterId: responseObj[charId].characterId,
                            class: charClass,
                            minutesPlayed: parseInt(responseObj[charId].minutesPlayedTotal),
                            emblemLocation: `https://www.bungie.net${responseObj[charId].emblemBackgroundPath}`,
                            currentLightLevel: responseObj[charId].light,
                            currentLevel: responseObj[charId].levelProgression.level,
                            characters: null,
                        };
                    }
                }
                let temp2 = await GetCharacterTime(member, character.characterId);
                character.minutesPlayed = temp2 / 60;
                character.characters = temp.Response.profile.data.characterIds; // Set all the character ids once we've decided on the best character
                resolve(character);
            }
        });
    });
}
exports.GetProfile = GetProfile;
function GetCharacterTime(member, characterId) {
    return new Promise((resolve, reject) => {
        const OPTIONS = {
            url: `https://www.bungie.net/Platform/Destiny2/${member.membershipType}/Account/${member.membershipId}/Stats/`,
            headers: {
                'x-api-key': process.env.bungieApiKey,
            },
        };
        request.get(OPTIONS, (err, res, body) => {
            if (err) {
                reject(err);
            }
            if (res.statusCode !== 200) {
                reject(`Failed to resolve status code: ${res.body}`);
            }
            else {
                let temp = JSON.parse(body);
                let characters = temp.Response.characters;
                characters.forEach(character => {
                    if (character.characterId === characterId) {
                        resolve(character.merged.allTime.secondsPlayed.basic.value);
                    }
                });
            }
        });
    });
}
//# sourceMappingURL=profile.js.map