const control = require('./control');

exports.handler = async (event) => {
	let string = control.main();

	const response = {
		statusCode: 200,
		body: JSON.stringify(string),
	};
	return response;
}