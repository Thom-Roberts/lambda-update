import * as request from 'request';
import { Member, Character } from './interfaces';

export function GetProfile(member: Member): Promise<Character> {
	return new Promise((resolve, reject) => {
		const options = {
			url: `https://www.bungie.net/Platform/Destiny2/${member.membershipType}/Profile/${member.membershipId}/?components=100,200`,
			headers: {
				'x-api-key': process.env.bungieApiKey
			}
		};

		request.get(options, (err, res, body) => {
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
				resolve()
			}
		});
	});
} 