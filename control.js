"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = __importStar(require("aws-sdk"));
const ClanRequests_1 = require("./ClanRequests");
const Stats_1 = require("./Stats");
const profile_1 = require("./profile");
AWS.config.update({
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    region: process.env.region
});
var dynamoDb = new AWS.DynamoDB;
var docClient = new AWS.DynamoDB.DocumentClient();
async function main() {
    try {
        // Collect users
        let members = await ClanRequests_1.GetClanMembers();
        await UpdateMembersInDb(members);
        // Start updating users table
        // Start collecting stats for each user
        let statsProms = members.map(member => {
            return Stats_1.GetHistoricalStats(member);
        });
        let mpCharacterProms = members.map(member => {
            return profile_1.GetProfile(member);
        });
        // TODO: Combine these two promise.all statements
        let stats = await Promise.all(statsProms);
        let mpCharacters = await Promise.all(mpCharacterProms);
        // Get the gambit stats as well
        let temp = members.map((member, index) => {
            return Stats_1.GetGambitStats(member, mpCharacters[index]);
        });
        let temp2 = await Promise.all(temp);
        // TODO: Pass temp2 with other stats
        await UpdateStatsInDb(stats, mpCharacters);
        // Finish once both updates are finished
        // If there are any errors, throw them
        return;
    }
    catch (e) {
        throw e;
    }
}
exports.main = main;
function RunSelect() {
    return new Promise((resolve, reject) => {
        dynamoDb.scan({
            TableName: "Music",
        }, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data.Items);
        });
    });
}
exports.RunSelect = RunSelect;
async function GetMembersAndStats() {
    // TODO: Get the clan members into their Update members function ASAP
    let clanMembers = await ClanRequests_1.GetClanMembers();
    let stats = await Promise.all(clanMembers.map(member => {
        return Stats_1.GetHistoricalStats(member);
    }));
}
exports.GetMembersAndStats = GetMembersAndStats;
// Selecting the members table, and for each entry that doesn't have someone, add them to the list
function UpdateMembersInDb(members) {
    return new Promise((resolve, reject) => {
        const maxChunkSize = 25;
        let proms = [];
        for (let i = 0; i < members.length; i += maxChunkSize) {
            let tempArray = members.slice(i, i + maxChunkSize);
            proms.push(SendDbUpdateRequest('Member', tempArray));
        }
        Promise.all(proms).then(() => {
            resolve();
        }).catch((e) => {
            reject(e);
        });
    });
}
function UpdateStatsInDb(stats, mpCharacters) {
    return new Promise((resolve, reject) => {
        const maxChunkSize = 25;
        let proms = [];
        for (let i = 0; i < stats.length; i += maxChunkSize) {
            let tempArray = stats.slice(i, i + maxChunkSize);
            let tempArray2 = mpCharacters.slice(i, i + maxChunkSize);
            proms.push(SendUpdateStatsInDb('MemberStats', tempArray, tempArray2));
        }
        Promise.all(proms).then(() => {
            resolve();
        }).catch((e) => {
            reject(e);
        });
    });
}
// Selecting the stats table, and updating each entry / adding it if it isn't there
function SendUpdateStatsInDb(tableName, stats, mpCharacter) {
    return new Promise((resolve, reject) => {
        const params = {
            'RequestItems': {
                [tableName]: stats.map((stat, index) => {
                    let temp = {};
                    delete mpCharacter[index].characters; // Removed the characters array from the most played character stats
                    temp.membershipId = {
                        S: stat.membershipId.toString()
                    };
                    if (Object.prototype.hasOwnProperty.call(stat, 'pve')) {
                        temp.pve = {
                            S: JSON.stringify(stat.pve)
                        };
                    }
                    if (Object.prototype.hasOwnProperty.call(stat, 'pvp')) {
                        temp.pvp = {
                            S: JSON.stringify(stat.pvp)
                        };
                    }
                    temp.mostPlayedCharacter = {
                        S: JSON.stringify(mpCharacter[index]),
                    };
                    return {
                        'PutRequest': {
                            'Item': temp
                        }
                    };
                }),
            }
        };
        dynamoDb.batchWriteItem(params, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
// See format for batch update request here: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#batchWriteItem-property
function SendDbUpdateRequest(tableName, items) {
    return new Promise((resolve, reject) => {
        const params = {
            'RequestItems': {
                [tableName]: items.map(item => {
                    let temp = {};
                    Object.keys(item).forEach(key => {
                        temp[key] = {
                            S: item[key].toString()
                        };
                    });
                    return {
                        'PutRequest': {
                            'Item': temp
                        }
                    };
                }),
            },
        };
        dynamoDb.batchWriteItem(params, (err, data) => {
            if (err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
}
async function AddMember() {
    docClient.put({
        TableName: 'Member',
        Item: {
            'membershipId': 'from lambda',
            'displayName': 'from lambda with cake',
            'membershipType': 3
        }
    }, (err, data) => {
        if (err) {
            throw err;
        }
        else {
            return;
        }
    });
}
exports.AddMember = AddMember;
//# sourceMappingURL=control.js.map