const control = require('./control');

exports.handler = async (event) => {
	let string = await control.RunSelect();

	const response = {
		statusCode: 200,
		body: JSON.stringify(string),
	};
	return response;
}