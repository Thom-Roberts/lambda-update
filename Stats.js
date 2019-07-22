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
/**
 * Gets stats for one member
 * @param member
 */
function GetHistoricalStats(member) {
    return new Promise((resolve, reject) => {
        const options = {
            url: `https://www.bungie.net/Platform/Destiny2/${member.membershipType}/Account/${member.membershipId}/Stats/`,
            headers: {
                "x-api-key": process.env.bungieApiKey,
            },
        };
        request.get(options, (err, res, body) => {
            if (err) {
                reject(err);
            }
            if (res.statusCode !== 200) {
                let temp = JSON.parse(body);
                if (temp.hasOwnProperty('ErrorCode') && temp['ErrorCode'] === 1652) { // Failed because of delay, resend
                    resolve(GetHistoricalStats(member));
                }
                else {
                    reject(`Stats request failed: ${res.statusCode} ${body}`);
                }
            }
            else {
                let temp = JSON.parse(body);
                let values = temp.Response.mergedAllCharacters.results;
                let returnStats = { membershipId: member.membershipId };
                // Test if response has PvE/PvP stats
                if (Object.keys(values.allPvE).length !== 0) {
                    //append the PvE stuff
                    returnStats.pve = {
                        activitiesCleared: values.allPvE.allTime.activitiesCleared.basic.value,
                        assists: values.allPvE.allTime.assists.basic.value,
                        kills: values.allPvE.allTime.kills.basic.value,
                        timePlayed: values.allPvE.allTime.secondsPlayed.basic.displayValue,
                        timePlayedNumber: values.allPvE.allTime.secondsPlayed.basic.value,
                        deaths: values.allPvE.allTime.deaths.basic.value,
                        kdRatio: values.allPvE.allTime.killsDeathsRatio.basic.displayValue,
                        publicEventsCompleted: values.allPvE.allTime.publicEventsCompleted.basic.value,
                    };
                }
                if (Object.keys(values.allPvP).length !== 0) {
                    //append the PvP stuff
                    returnStats.pvp = {
                        activitiesPlayed: values.allPvP.allTime.activitiesEntered.basic.value,
                        activitiesWon: values.allPvP.allTime.activitiesWon.basic.value,
                        assists: values.allPvP.allTime.assists.basic.value,
                        kills: values.allPvP.allTime.kills.basic.value,
                        timePlayed: values.allPvP.allTime.secondsPlayed.basic.displayValue,
                        deaths: values.allPvP.allTime.deaths.basic.value,
                        bestSingleGameKils: values.allPvP.allTime.bestSingleGameKills.basic.value,
                        opponentsDefeated: values.allPvP.allTime.opponentsDefeated.basic.value,
                        efficiency: values.allPvP.allTime.efficiency.basic.displayValue,
                        kdRatio: values.allPvP.allTime.killsDeathsRatio.basic.displayValue,
                        winLossRatio: values.allPvP.allTime.winLossRatio.basic.displayValue,
                        longestKillSpree: values.allPvP.allTime.longestKillSpree.basic.value,
                    };
                }
                // Creating a stats interface 'inline'
                resolve(returnStats);
            }
        });
    });
}
exports.GetHistoricalStats = GetHistoricalStats;
