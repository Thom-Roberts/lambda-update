import * as request from 'request';
import { Member } from "./interfaces";
const CLANID = '407685';
const MEMBERTYPELOOKUP : any = {
	'0': 'None',
	'1': 'Beginner',
	'2': 'Member',
	'3': 'Admin',
	'4': 'Acting Founder',
	'5': 'Founder',
};

export function GetClanMembers() : Promise<Member[]> {
	return new Promise((resolve, reject) => {
		const options = {
         'url': `https://www.bungie.net/Platform/GroupV2/${CLANID}/Members/`,
         'headers': {
            'x-api-key': process.env.bungieApiKey,
         },
      };

		request.get(options, (err, res, body) => {
			let members: Member[] = [];
			if(err) {
				reject(err);
			}
			if(res.statusCode !== 200) {
				reject(`Could not resolve status code: ${res.statusCode}`);
			}

			let temp = JSON.parse(body);

			temp['Response']['results'].forEach((val : any) => {
				if(val.hasOwnProperty('destinyUserInfo')) {
					// Lookup the string value for the clanMemberType
					const memberType: number = val['memberType'];
					const memberTypeValue: string = MEMBERTYPELOOKUP[memberType.toString()];

					members.push({
						'membershipId': val['destinyUserInfo']['membershipId'],
						'membershipType': val['destinyUserInfo']['membershipType'],
						'displayName': val['destinyUserInfo']['displayName'],
						'clanMemberType': memberTypeValue,
					});
				}
			});
			
			resolve(members);
		});
	});
}
