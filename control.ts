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

export async function GetMembers() {
	return await GetClanMembers();
}

export async function GetMembersAndStats() {
	// TODO: Get the clan members into their Update members function ASAP
	let clanMembers = await GetClanMembers();
	let stats = await Promise.all(clanMembers.map(member => {
		return GetHistoricalStats(member);
	}));
}

// Selecting the members table, and for each entry that doesn't have someone, add them to the list
function UpdateMembersInDb(members: Member[]) {
	return new Promise<void>((resolve, reject) => {

	});
}

// Selecting the stats table, and updating each entry / adding it if it isn't there
function UpdateStatsInDb() {
	return new Promise<void>((resolve, reject) => {

	});
}