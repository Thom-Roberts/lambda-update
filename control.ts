import * as AWS from 'aws-sdk';
import { GetClanMembers } from "./ClanRequests";
import { GetHistoricalStats } from "./Stats";

AWS.config.update({
	accessKeyId: process.env.accessKeyId,
	secretAccessKey: process.env.secretAccessKey,
	region: process.env.region
});
var dynamoDb = new AWS.DynamoDB;

export function main() {
	return "Hello";
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
	let clanMembers = await GetClanMembers();
	let stats = await Promise.all(clanMembers.map(member => {
		return GetHistoricalStats(member);
	}));
}