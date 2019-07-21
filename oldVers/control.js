"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const AWS = __importStar(require("aws-sdk"));
AWS.config.update({
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    region: process.env.region
});
var dynamoDb = new AWS.DynamoDB;
function main() {
    return "Hello";
}
exports.main = main;
function RunSelect() {
    return new Promise((resolve, reject) => {
        dynamoDb.scan({
            TableName: "Music",
        }, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data.Items);
        });
    });
}
exports.RunSelect = RunSelect;
