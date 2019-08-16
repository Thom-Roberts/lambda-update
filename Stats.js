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
const INITIALEMPTYVALUE = {
    activitesPlayed: 0,
    activitiesWon: 0,
    assists: 0,
    kills: 0,
    killsPerGame: '0',
    timePlayed: '0',
    timePlayedNumber: 0,
    deaths: 0,
    bestSingleGameKills: 0,
    kdRatio: '0',
    winLossRatio: '0',
    longestKillSpree: 0,
    invasionKills: 0,
    invaderKills: 0,
    motesDeposited: 0,
    motesLost: 0,
};
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
                        timePlayedNumber: values.allPvP.allTime.secondsPlayed.basic.value,
                        deaths: values.allPvP.allTime.deaths.basic.value,
                        bestSingleGameKills: values.allPvP.allTime.bestSingleGameKills.basic.value,
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
async function GetGambitStats(member, character) {
    if (character.characters !== null) {
        let temp = character.characters.map((characterId) => {
            return GetGambitForCharacter(member, characterId);
        });
        let allCharacterStats = await Promise.all(temp);
        let returnVal = allCharacterStats.reduce((prev, curr) => {
            const PREV_KPG = parseFloat(prev.killsPerGame);
            const CURR_KPG = parseFloat(curr.killsPerGame);
            return {
                activitesPlayed: prev.activitesPlayed + curr.activitesPlayed,
                activitiesWon: prev.activitiesWon + curr.activitiesWon,
                assists: prev.assists + curr.assists,
                kills: prev.kills + curr.kills,
                killsPerGame: (PREV_KPG + CURR_KPG).toString(),
                timePlayed: '',
                timePlayedNumber: prev.timePlayedNumber + curr.timePlayedNumber,
                deaths: prev.deaths + curr.deaths,
                bestSingleGameKills: prev.bestSingleGameKills + curr.bestSingleGameKills,
                kdRatio: '',
                winLossRatio: '',
                longestKillSpree: prev.longestKillSpree + curr.longestKillSpree,
                invasionKills: prev.invasionKills + curr.invasionKills,
                invaderKills: prev.invaderKills + curr.invaderKills,
                motesDeposited: prev.motesDeposited + curr.motesDeposited,
                motesLost: prev.motesLost + curr.motesLost,
            };
        }, INITIALEMPTYVALUE);
        // TODO: Divide kills per game by num characters
        // TODO: Divide by characters who actually have stats in gambit (some are equal to INITIALEMPTY VALUE)
        // If the number of non-empty characters is 0, then just return the initial empty value
        // allCharacterStats[1] === INITIALEMPTYVALUE TODO: Use this to calculate that divide by number
        const DIVIDE_BY_NUMBER = GetNumActiveCharacters(allCharacterStats);
        if (DIVIDE_BY_NUMBER === 0) {
            return INITIALEMPTYVALUE;
        }
        else {
            returnVal.timePlayed = GetStringForTimePlayed(returnVal.timePlayedNumber); // TODO: Update
            returnVal.kdRatio = (returnVal.kills / returnVal.deaths).toFixed(2);
            returnVal.winLossRatio = (returnVal.activitiesWon / returnVal.activitesPlayed).toFixed(2).toString(); // Convert the numbers to fixed 2 decimals to string
            returnVal.killsPerGame = (parseFloat(returnVal.killsPerGame) / DIVIDE_BY_NUMBER).toFixed(2).toString();
            return returnVal;
        }
    }
    else {
        return INITIALEMPTYVALUE;
    }
}
exports.GetGambitStats = GetGambitStats;
function GetGambitForCharacter(member, characterId) {
    return new Promise((resolve, reject) => {
        const PVE_AGGREGATE_TYPE = '64';
        const BASE_URL = `http://www.bungie.net/Platform/Destiny2/${member.membershipType}/Account/${member.membershipId}/Character/${characterId}/Stats?modes=${PVE_AGGREGATE_TYPE}`;
        const OPTIONS = {
            url: BASE_URL,
            headers: {
                "x-api-key": '7771c372dbe34060a7bbb10b3016ecfe',
            },
        };
        request.get(OPTIONS, (err, res, body) => {
            if (err) {
                reject(err);
            }
            if (res.statusCode !== 200) {
                reject(`Gambit stats request failed: ${res.body}`);
            }
            else {
                let temp = JSON.parse(body);
                let easierTemp = temp.Response.allPvECompetitive.allTime;
                if (easierTemp === undefined) {
                    resolve(INITIALEMPTYVALUE);
                }
                else {
                    resolve({
                        activitesPlayed: easierTemp.activitiesEntered.basic.value,
                        activitiesWon: easierTemp.activitiesWon.basic.value,
                        assists: easierTemp.assists.basic.value,
                        kills: easierTemp.kills.basic.value,
                        killsPerGame: easierTemp.kills.pga.displayValue,
                        timePlayed: easierTemp.secondsPlayed.basic.displayValue,
                        timePlayedNumber: easierTemp.secondsPlayed.basic.value,
                        deaths: easierTemp.deaths.basic.value,
                        bestSingleGameKills: easierTemp.bestSingleGameKills.basic.value,
                        kdRatio: '',
                        winLossRatio: '',
                        longestKillSpree: easierTemp.longestKillSpree.basic.value,
                        invasionKills: easierTemp.invasionKills.basic.value,
                        invaderKills: easierTemp.invaderKills.basic.value,
                        motesDeposited: easierTemp.motesDeposited.basic.value,
                        motesLost: easierTemp.motesLost.basic.value,
                    });
                }
            }
        });
    });
}
// Calculate the days and hours for displaying
function GetStringForTimePlayed(secondsPlayed) {
    let minutesPlayed = secondsPlayed / 60;
    let hoursPlayed = minutesPlayed / 60;
    let numDays = Math.floor(hoursPlayed / 24);
    let numHours = Math.floor(hoursPlayed - (numDays * 24));
    if (numDays === 0 && numHours === 0) {
        return `${minutesPlayed.toFixed(0)} minutes`;
    }
    return `${numDays}d ${numHours}h`;
}
function GetNumActiveCharacters(allCharacterStats) {
    return allCharacterStats.reduce((prev, curr) => {
        if (curr !== INITIALEMPTYVALUE) {
            prev += 1;
        }
        return prev;
    }, 0);
}
//# sourceMappingURL=Stats.js.map