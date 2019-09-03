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

			let clanResponse = JSON.parse(body);

			clanResponse['Response']['results'].forEach((clanMember : any) => {
				if(clanMember.hasOwnProperty('destinyUserInfo')) {
					// Lookup the string value for the clanMemberType
					const memberType: number = clanMember['memberType'];
					const memberTypeValue: string = MEMBERTYPELOOKUP[memberType.toString()];

					let isPrimary: boolean; 
					let bungieMembershipId = `Not available for account: ${clanMember['destinyUserInfo']['displayName']}`;

					// Not a cross save account
					if(clanMember['destinyUserInfo']['crossSaveOverride'] === 0) {
						isPrimary = true;
					}
					else if(clanMember['destinyUserInfo']['crossSaveOverride'] === clanMember['destinyUserInfo']['membershipType']) {
						isPrimary = true;
					}
					else {
						isPrimary = false;
					}
					
					// I swear this is only required for some people (namely, Mdawg12319)
					if(Object.prototype.hasOwnProperty.call(clanMember, 'bungieNetUserInfo')) { 
						bungieMembershipId = clanMember['bungieNetUserInfo']['membershipId'];
					}

					members.push({
						'bungieMembershipId': bungieMembershipId, // TODO: Update
						'membershipId': clanMember['destinyUserInfo']['membershipId'],
						'membershipType': clanMember['destinyUserInfo']['membershipType'],
						'displayName': clanMember['destinyUserInfo']['displayName'],
						'clanMemberType': memberTypeValue,
						'onlineStatus': clanMember['isOnline'],
						'isPrimary': isPrimary,
						'dateLastOn': new Date(parseInt(clanMember['lastOnlineStatusChange']) * 1000),
					});
				}
			});
			
			resolve(members);
		});
	});
}
