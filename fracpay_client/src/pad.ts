
const BigNumber = require("bignumber.js");

/**
 * main
 **/

const InitPIECE = async () => {
	
	try {
	
	var test = "162e";
	test = new BigNumber(test);
	console.log(test);
	console.log(test);

	} catch {
		console.log(Error);
		console.log(Error.prototype.stack);
	}
};

InitPIECE();
