import * as AWS from 'aws-sdk';
import { GetClanMembers } from "./ClanRequests";
import { GetHistoricalStats } from "./Stats";
import { GetProfile } from "./profile";
import { Member, Stats, Character } from "./interfaces";

AWS.config.update({
	accessKeyId: process.env.accessKeyId,
	secretAccessKey: process.env.secretAccessKey,
	region: process.env.region
});

var dynamoDb = new AWS.DynamoDB;
var docClient = new AWS.DynamoDB.DocumentClient();

export async function main(): Promise<void> {
	try {
		// Collect users
		let members = await GetClanMembers();

		await UpdateMembersInDb(members);
		// Start updating users table
		// Start collecting stats for each user
		let statsProms = members.map(member => {
			return GetHistoricalStats(member);
		});

		let mpCharacterProms = members.map(member => {
			return GetProfile(member);
		});

		// TODO: Combine these two promise.all statements
		let stats = await Promise.all(statsProms);
		let mpCharacters = await Promise.all(mpCharacterProms);	

		await UpdateStatsInDb(stats, mpCharacters);

		// Finish once both updates are finished

		// If there are any errors, throw them

		return;
	}
	catch(e) {
		throw e;
	}
	
}

export function RunSelect() {
	return new Promise((resolve, reject) => {
		dynamoDb.scan({
			TableName: "Music",
		}, (err, data) => {
			if(err) {
				reject(err);
			}
			resolve(data.Items);
		});
	});
}



export async function GetMembersAndStats() {
	// TODO: Get the clan members into their Update members function ASAP
	let clanMembers = await GetClanMembers();
	let stats = await Promise.all(clanMembers.map(member => {
		return GetHistoricalStats(member);
	}));
}

// Selecting the members table, and for each entry that doesn't have someone, add them to the list
function UpdateMembersInDb(members: Member[]): Promise<void> {
	return new Promise((resolve, reject) => {
		const maxChunkSize = 25;
		let proms :Promise<void>[] = [];
		for(let i = 0; i < members.length; i += maxChunkSize) {
			let tempArray = members.slice(i, i + maxChunkSize);

			proms.push(SendDbUpdateRequest('Member', tempArray));
		}

		Promise.all(proms).then(() => {
			resolve();
		}).catch((e) => {
			reject(e);
		});
	});
}

function UpdateStatsInDb(stats: Stats[], mpCharacters: Character[]) {
	return new Promise((resolve, reject) => {
		const maxChunkSize = 25;
		let proms :Promise<void>[] = [];
		for(let i = 0; i < stats.length; i += maxChunkSize) {
			let tempArray = stats.slice(i, i + maxChunkSize);
			let tempArray2 = mpCharacters.slice(i, i + maxChunkSize);
			proms.push(SendUpdateStatsInDb('MemberStats', tempArray, tempArray2));
		}

		Promise.all(proms).then(() => {
			resolve();
		}).catch((e) => {
			reject(e);
		});
	});
}

// Selecting the stats table, and updating each entry / adding it if it isn't there
function SendUpdateStatsInDb(tableName: string, stats: Stats[], mpCharacter: Character[]) : Promise<void> {
	return new Promise((resolve, reject) => {
		const params: any = {
			'RequestItems': {
				[tableName]: 
					stats.map((stat, index) => {
						let temp: any = {};
						temp.membershipId = {
							S: stat.membershipId.toString()
						};
						if(Object.prototype.hasOwnProperty.call(stat, 'pve')) {
							temp.pve = {
								S: JSON.stringify(stat.pve)
							};
						}
						if(Object.prototype.hasOwnProperty.call(stat, 'pvp')) {
							temp.pvp = {
								S: JSON.stringify(stat.pvp)
							};
						}
						temp.mostPlayedCharacter = {
							S: JSON.stringify(mpCharacter[index])
						}

						return {
							'PutRequest': {
								'Item': temp
							}
						};
					})
				,
			}
		}

		dynamoDb.batchWriteItem(params, (err, data) => {
			if(err) {
				reject(err);
			}
			else {
				resolve();
			}
		});
	});
}

// See format for batch update request here: https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html#batchWriteItem-property
function SendDbUpdateRequest(tableName: string, items: any[]): Promise<void> {
	return new Promise((resolve, reject) => {
		const params: any = {
			'RequestItems': {
				[tableName]: 
					items.map(item => {
						let temp: any = {};
						Object.keys(item).forEach(key => {
							temp[key] = {
								S: item[key].toString()
							};
						});
						return {
							'PutRequest': {
								'Item': temp
							}
						};
					})
				,
			},
		};

		dynamoDb.batchWriteItem(params, (err, data) => {
			if(err) {
				reject(err);
			}
			else {
				resolve();
			}
		});
	});
}

export async function AddMember() {
	docClient.put({
		TableName: 'Member',
		Item: {
			'membershipId': 'from lambda',
			'displayName': 'from lambda with cake',
			'membershipType': 3
		}
	}, (err, data) => {
		if(err) {
			throw err;
		}
		else {
			return;
		}
	});
}