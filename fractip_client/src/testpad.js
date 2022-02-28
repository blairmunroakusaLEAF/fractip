const {Keypair} = require("@solana/web3.js");


const testpad = async () => {

	try {
	operatorID = "testid";
	var BUFFERAarray = [0, 8, 100, 200, 255, 150];


	//const BUFFER1 = (property = "BUFFER1") => {
  	//	return BufferLayout.blob(, property);
	//};

	var operatorIDencoded = toUTF8Array(operatorID);

	var bigArray = operatorIDencoded.concat(BUFFERAarray);
	console.log(bigArray);


	function toUTF8Array(str) {
    		var utf8 = [];
    		for (var i=0; i < str.length; i++) {
        		var charcode = str.charCodeAt(i);
        		if (charcode < 0x80) utf8.push(charcode);
        		else if (charcode < 0x800) {
            			utf8.push(0xc0 | (charcode >> 6), 
                      			  0x80 | (charcode & 0x3f));
        		}
        		else if (charcode < 0xd800 || charcode >= 0xe000) {
            			utf8.push(0xe0 | (charcode >> 12), 
                      			  0x80 | ((charcode>>6) & 0x3f), 
                      			  0x80 | (charcode & 0x3f));
        		}
        		// surrogate pair
        		else {
            			i++;
            			charcode = ((charcode&0x3ff)<<10)|(str.charCodeAt(i)&0x3ff)
            			utf8.push(0xf0 | (charcode >>18), 
                      			  0x80 | ((charcode>>12) & 0x3f), 
                      			  0x80 | ((charcode>>6) & 0x3f), 
                      			  0x80 | (charcode & 0x3f));
        		}
    		}
    		return utf8;
	}

	var operatorIDencoded = toUTF8Array(operatorID);
	console.log(operatorIDencoded);

let pair = Keypair.generate();

		console.log(pair.publicKey);
		console.log(pair.secretKey);
	} catch{
		console.log("error");
	}

}

testpad();
