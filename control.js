const AWS = require('aws-sdk');

AWS.config.update({
	accessKeyId: process.env.accessKeyId,
	secretAccessKey: process.env.secretAccessKey,
	region: process.env.region
});
var dynamoDb = new AWS.DynamoDB;

function main() {
	return "Hello";
}

function RunSelect() {
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

module.exports = {
	main,
	RunSelect
};