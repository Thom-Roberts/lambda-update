import * as request from "request";
import { Member, Stats, Character, PveCompetitive } from "./Interfaces";

/**
 * Gets stats for one member
 * @param member 
 */
export function GetHistoricalStats(member: Member): Promise<Stats> {
	return new Promise((resolve, reject) => {
		const options = {
			url: `https://www.bungie.net/Platform/Destiny2/${member.membershipType}/Account/${member.membershipId}/Stats/`,
			headers: {
				"x-api-key": process.env.bungieApiKey,
			},
		};

		request.get(options, (err, res, body) => {
			if(err) {
				reject(err);
			}
			if(res.statusCode !== 200) {
				let temp: any = JSON.parse(body);
				if(temp.hasOwnProperty('ErrorCode') && temp['ErrorCode'] === 1652) { // Failed because of delay, resend
					resolve(GetHistoricalStats(member));
				}
				else {
					reject(`Stats request failed: ${res.statusCode} ${body}`);
				}
			}
			else {
				let temp = JSON.parse(body);
			
				let values = temp.Response.mergedAllCharacters.results;
				
				let returnStats: Stats = {membershipId: member.membershipId};
				// Test if response has PvE/PvP stats
				if(Object.keys(values.allPvE).length !== 0) {
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
				if(Object.keys(values.allPvP).length !== 0) {
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

export async function GetGambitStats(member: Member, character: Character): Promise<PveCompetitive> {
	const INITIALEMPTYVALUE: PveCompetitive = {
		activitesPlayed: 0,
		activitesWon: 0,
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

	
	if(character.characters !== null) {
		let temp = character.characters.map((characterId) => {
			return GetGambitForCharacter(member, characterId);
		});

		const INITIALEMPTYVALUE: PveCompetitive = {
			activitesPlayed: 0,
			activitesWon: 0,
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

		let allCharacterStats = await Promise.all(temp);
		let returnVal =  allCharacterStats.reduce((prev, curr) => {
			const PREV_KPG = parseFloat(prev.killsPerGame);
			const CURR_KPG = parseFloat(curr.killsPerGame);
			const PREV_WLR = parseFloat(prev.winLossRatio);
			const CURR_WLR = parseFloat(curr.winLossRatio);
			// TODO: Convert the timePlayedNumber addition to get a string for timePlayed
			return {
				activitesPlayed: prev.activitesPlayed + curr.activitesPlayed,
				activitesWon: prev.activitesWon + curr.activitesWon,
				assists: prev.assists + curr.assists,
				kills: prev.kills + curr.kills,
				killsPerGame: (PREV_KPG + CURR_KPG).toString(),
				timePlayed: '', // Updated later
				timePlayedNumber: prev.timePlayedNumber + curr.timePlayedNumber,
				deaths: prev.deaths + curr.deaths,
				bestSingleGameKills: prev.bestSingleGameKills + curr.bestSingleGameKills,
				kdRatio: '', // Updated later
				winLossRatio: (PREV_WLR + CURR_WLR).toString(), // Updated later
				longestKillSpree: prev.longestKillSpree + curr.longestKillSpree,
				invasionKills: prev.invasionKills + curr.invasionKills,
				invaderKills: prev.invaderKills + curr.invaderKills,
				motesDeposited: prev.motesDeposited + curr.motesDeposited,
				motesLost: prev.motesLost + curr.motesLost,
			};
		}, INITIALEMPTYVALUE);

		returnVal.timePlayed = GetStringForTimePlayed(returnVal.timePlayedNumber); // TODO: Update
		returnVal.kdRatio = (returnVal.kills / returnVal.deaths).toFixed(2);
		returnVal.winLossRatio = (parseFloat(returnVal.winLossRatio) / allCharacterStats.length).toString();
	
		return returnVal;
	}
	else {
		return INITIALEMPTYVALUE;
	}
}

function GetGambitForCharacter(member: Member, characterId: string): Promise<PveCompetitive> {
	return new Promise<PveCompetitive>((resolve, reject) => {
		const PVE_AGGREGATE_TYPE = '64';
		const BASE_URL = `http://www.bungie.net/Platform/Destiny2/${member.membershipType}/Account/${member.membershipId}/Character/${characterId}/Stats?modes=${PVE_AGGREGATE_TYPE}`;

		const OPTIONS = {
			url: BASE_URL,
			headers: {
				"x-api-key": process.env.bungieApiKey,
			},
		};

		request.get(OPTIONS, (err, res, body) => {
			if(err) {
				reject(err);
			}
			if(res.statusCode !== 200) {
				reject(`Gambit stats request failed: ${res.body}`);
			}
			else {
				let temp = JSON.parse(body);
				let easierTemp = temp.Response.allPvECompetitive.allTime;

				resolve({
					activitesPlayed: easierTemp.activitiesEntered.basic.value,
					activitesWon: easierTemp.activitesWon.basic.value,
					assists: easierTemp.assists.basic.value,
					kills: easierTemp.kills.basic.value,
					killsPerGame: easierTemp.kills.pga.displayValue,
					timePlayed: easierTemp.secondsPlayed.basic.displayValue,
					timePlayedNumber: easierTemp.secondsPlayed.basic.value,
					deaths: easierTemp.deaths.basic.value,
					bestSingleGameKills: easierTemp.bestSingleGameKills.basic.value,
					kdRatio: easierTemp.killsDeathsRatio.basic.displayValue,
					winLossRatio: easierTemp.winLossRatio.basic.displayValue,
					longestKillSpree: easierTemp.longestKillSpree.basic.value,
					invasionKills: easierTemp.invasionKills.basic.value,
					invaderKills: easierTemp.invaderKills.basic.value,
					motesDeposited: easierTemp.motesDeposited.basic.value,
					motesLost: easierTemp.motesLost.basic.value,
				});
			}
		});
	});
}

// Calculate the days and hours for displaying
function GetStringForTimePlayed(minutesPlayed: number): string {
	let hoursPlayed = minutesPlayed / 60;
	let numDays = Math.floor(hoursPlayed / 24);
	let numHours = Math.floor(hoursPlayed - (numDays * 24));

	if(numDays === 0 && numHours === 0) {
		return `${minutesPlayed} minutes`;
	}

	return `${numDays}d ${numHours}h`;
}