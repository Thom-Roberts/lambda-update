export interface Member {
	membershipId: string;
	membershipType: number;
	displayName: string;
}

export interface Stats {
	membershipId: string;
	// Response.mergedAllCharacters.results
	pve?: { //allPvE.allTime
		activitiesCleared: number; //activitiesCleared.basic.value
		assists: number; //assists.basic.value
		kills: number; //kills.basic.value
		timePlayed: string; //secondsPlayed.basic.displayValue
		timePlayedNumber: number; // secondsPlayed.basic.value
		deaths: number; //deaths.basic.value
		kdRatio: string; //killsDeathsRatio.basic.displayValue
		publicEventsCompleted: number; //publicEventsCompleted.basic.value
	};
	pvp?: { //allPvP.allTime
		activitiesPlayed: number; //activitesEntered.basic.value
		activitiesWon: number; //activitesWon.basic.value
		assists: number; //assists.basic.value
		kills: number; //kills.basic.value
		timePlayed: string; //secondsPlayed.basic.displayValue
		deaths: number; //deaths.basic.value
		bestSingleGameKils: number; //bestSingleGameKills.basic.value
		opponentsDefeated: number; //opponentsDefeated.basic.value
		efficiency: string; //efficiency.basic.displayValue
		kdRatio: string; //killsDeathsRatio.basic.displayValue
		winLossRatio: string; //winLossRatio.basic.displayValue
		longestKillSpree: number; //longestKillSpree.basic.value
	};
}