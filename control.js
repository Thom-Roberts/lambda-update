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
    // Collect users
    let members = await ClanRequests_1.GetClanMembers();
    await UpdateMembersInDb(members);
    // Start updating users table
    // Start collecting stats for each user
    let statsProm = [];
    members.forEach(member => {
        statsProm.push(Stats_1.GetHistoricalStats(member));
    });
    let stats = await Promise.all(statsProm);
    await UpdateStatsInDb(stats);
    let profileProms = members.map(member => {
        return profile_1.GetProfile(member);
    });
    let profiles = await Promise.all(profileProms);
    // Finish once both updates are finished
    // If there are any errors, throw them
    return;
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
function UpdateStatsInDb(stats) {
    return new Promise((resolve, reject) => {
        const maxChunkSize = 25;
        let proms = [];
        for (let i = 0; i < stats.length; i += maxChunkSize) {
            let tempArray = stats.slice(i, i + maxChunkSize);
            proms.push(SendUpdateStatsInDb('MemberStats', tempArray));
        }
        Promise.all(proms).then(() => {
            resolve();
        }).catch((e) => {
            reject(e);
        });
    });
}
// Selecting the stats table, and updating each entry / adding it if it isn't there
function SendUpdateStatsInDb(tableName, stats) {
    return new Promise((resolve, reject) => {
        const params = {
            'RequestItems': {
                [tableName]: stats.map(stat => {
                    let temp = {};
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
