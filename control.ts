import * as AWS from 'aws-sdk';
import { GetClanMembers } from "./ClanRequests";
import { GetHistoricalStats } from "./Stats";
import { Member, Stats } from "./interfaces";

AWS.config.update({
	accessKeyId: process.env.accessKeyId,
	secretAccessKey: process.env.secretAccessKey,
	region: process.env.region
});

var dynamoDb = new AWS.DynamoDB;
var docClient = new AWS.DynamoDB.DocumentClient();

export async function main(): Promise<void> {
	// Collect users
	let members = await GetClanMembers();

	await UpdateMembersInDb(members);
	// Start updating users table
	// Start collecting stats for each user

	// Start updating stats table

	// Finish once both updates are finished

	// If there are any errors, throw them

	return;
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
		}).catch(() => {
			reject()
		});
	});
}

// Selecting the stats table, and updating each entry / adding it if it isn't there
function UpdateStatsInDb() {
	return new Promise<void>((resolve, reject) => {
		
	});
}

function SendDbUpdateRequest(tableName: string, items: unknown[]): Promise<void> {
	return new Promise((resolve, reject) => {
		const params: any = {
			'RequestItems': {
				[tableName]: [
					items.map(item => {
						return {
							'Item': item
						};
					})
				],
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