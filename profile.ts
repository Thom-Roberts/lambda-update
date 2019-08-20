import * as request from 'request';
import { Member, Character } from './interfaces';

export function GetProfile(member: Member): Promise<Character> {
	return new Promise((resolve, reject) => {
		const options = {
			url: `https://www.bungie.net/Platform/Destiny2/${member.membershipType}/Profile/${member.membershipId}/?components=100,200`,
			headers: {
				'x-api-key': process.env.bungieApiKey,
			}
		};

		request.get(options, async (err, res, body) => {
			if(err) {
				reject(err);
			}
			let temp: any = JSON.parse(body);

			if(res.statusCode !== 200) {
				if(temp.hasOwnProperty('ErrorCode') && temp['ErrorCode'] === 1652) { // Failed because of delay, resend
					resolve(GetProfile(member));
				}
				else {
					reject(`Stats request failed: ${res.statusCode} ${body}`);
				}
			}
			else {
				// TODO: Should I be returning an array of characters? No, probably just an array of the character ids, and some 'max' stats across them
				let character: Character = {
					characterId: '0',
					class: 'Titan',
					minutesPlayed: 0,
					emblemLocation: '',
					currentLightLevel: 0,
					currentLevel: 0,
					characters: null,
				};
				let responseObj = temp.Response.characters.data;
				for(let charId in responseObj) {
					// If the next character has more time played, then set them up as larger
					if(parseInt(responseObj[charId].minutesPlayedTotal) > character.minutesPlayed) {
						let charClass: string = '';
						switch(responseObj[charId].classHash) {
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
							characters: null, // Will be set at the end
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

function GetCharacterTime(member: Member, characterId: string): Promise<number> {
	return new Promise((resolve, reject) => {
		const OPTIONS = {
			url: `https://www.bungie.net/Platform/Destiny2/${member.membershipType}/Account/${member.membershipId}/Stats/`,
			headers: {
				'x-api-key': process.env.bungieApiKey,
			},
		};

		request.get(OPTIONS, (err, res, body) => {
			if(err) {
				reject(err);
			}
			if(res.statusCode !== 200) {
				reject(`Failed to resolve status code: ${res.body}`);
			}
			else {
				let temp = JSON.parse(body);
				let characters: any[] = temp.Response.characters;
				characters.forEach(character => {
					if(character.characterId === characterId) {
						resolve(character.merged.allTime.secondsPlayed.basic.value);
					}
				});
			}
		});
	});
}