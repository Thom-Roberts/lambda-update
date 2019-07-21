import * as request from 'request';
import { Member } from "./interfaces";
const ClanId = '407685';

export function GetClanMembers() : Promise<Member[]> {
	return new Promise((resolve, reject) => {
		const options = {
         'url': `https://www.bungie.net/Platform/GroupV2/${ClanId}/Members/`,
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
					members.push({
						'membershipId': val['destinyUserInfo']['membershipId'],
						'membershipType': val['destinyUserInfo']['membershipType'],
						'displayName': val['destinyUserInfo']['displayName'],
					});
				}
			});

			resolve(members);
		});
	});
}
