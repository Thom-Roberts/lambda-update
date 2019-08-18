export interface Member {
	membershipId: string;
	membershipType: number;
	displayName: string;
	clanMemberType: string;
	onlineStatus: boolean;
	dateLastOn: Date;
}

export interface Profile {
	Stats: Stats;
	MostPlayedCharacter: Character;
}

// Just the most played character
export interface Character { // Get profile
	characterId: string; // Most played id
	class: string; // Should be Titan, Hunter, or Warlock
	minutesPlayed: number;
	emblemLocation: string; // Append the https://www.bungie.net before pushing it up
	currentLightLevel: number;
	currentLevel: number;
	characters: string[] | null; // Should not be included in this interface when uploading to dynamoDb
}

export interface Stats {
	membershipId: string;
	// Response.mergedAllCharacters.results
	pve?: pve;
	pvp?: pvp;
	pveCompetitive?: PveCompetitive;
}

export interface pve {
	activitiesCleared: number; //activitiesCleared.basic.value
	assists: number; //assists.basic.value
	kills: number; //kills.basic.value
	timePlayed: string; //secondsPlayed.basic.displayValue
	timePlayedNumber: number; // secondsPlayed.basic.value
	deaths: number; //deaths.basic.value
	kdRatio: string; //killsDeathsRatio.basic.displayValue
	publicEventsCompleted: number; //publicEventsCompleted.basic.value
}

export interface pvp {
	activitiesPlayed: number; //activitesEntered.basic.value
	activitiesWon: number; //activitesWon.basic.value
	assists: number; //assists.basic.value
	kills: number; //kills.basic.value
	timePlayed: string; //secondsPlayed.basic.displayValue
	timePlayedNumber: number; //secondsPlayed.basic.value
	deaths: number; //deaths.basic.value
	bestSingleGameKills: number; //bestSingleGameKills.basic.value
	opponentsDefeated: number; //opponentsDefeated.basic.value
	efficiency: string; //efficiency.basic.displayValue
	kdRatio: string; //killsDeathsRatio.basic.displayValue
	winLossRatio: string; //winLossRatio.basic.displayValue
	longestKillSpree: number; //longestKillSpree.basic.value
}

export interface PveCompetitive {
	activitesPlayed: number; // activitesEntered.basic.value
	activitiesWon: number; // activitiesWon.basic.value
	assists: number; // assists.basic.value
	kills: number; // kills.basic.value
	killsPerGame: string; // kills.pga.displayValue
	timePlayed: string; // secondsPlayed.basic.displayValue
	timePlayedNumber: number; // secondsPlayed.basic.value
	deaths: number; // deaths.basic.value
	bestSingleGameKills: number; // bestSingleGameKills.basic.value
	kdRatio: string; // killsDeathsRatio.basic.displayValue
	winLossRatio: string; // winLossRatio.basic.displayValue
	longestKillSpree: number; // longestKillSpree.basic.value
	invasionKills: number; // invasionKills.basic.value
	invaderKills: number; // invaderKills.basic.value
	motesDeposited: number; // motesDeposited.basic.value
	motesLost: number; // motesLost.basic.value
}

/*
	Maybe we should add some extra stuff to the profile stats, rather than just the historical stats
	Stuff like:
		Date last online: GetProfileRequest (component 100)
		Most played character: GetProfileRequest (component 200)
			Would need to compare the 'minutesPlayedTotal' between their characters
			Most played character's emblem: https://www.bungie.net{emblemBackgroundPath} (part of component 200)
			Most played character's class (component 200) - classHash
			Most played character's light level (component 200) - light
		Missing exotics: GetProfileRequest (component 800)
*/