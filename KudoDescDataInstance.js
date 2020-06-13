const DataUtil = require("./DataUtil.js");
const fileName = './database/kudoDesc.json';
const fileEncoding = 'utf8';

var instance = (function() {
  let dataUtil = new DataUtil(fileName, fileEncoding);
  var data = dataUtil.read();
  
	function getData() { //test use
		return data;
	}
		
	function addDesc(sender, receiver, desc){
		data = dataUtil.read();
		var newDesc = {};
		newDesc.sender = sender;
		newDesc.receiver = receiver;
		newDesc.desc = desc;
		data.push(newDesc);		
		dataUtil.write(data);
		return "Successful";
	}
	
	function checkRev(receiver, myMap){
		data = dataUtil.read();
		var result = `Here are to tokens received by ${myMap[receiver]}:\n`; var count = 0;
		data
		.filter((x) => {return x.receiver === receiver;})
		.map((x) => {
			count++;
			result += `Received from: ${myMap[x.sender]}, Description: ${x.desc}\n`;
		});
		result += `Total: ${count}`
			return result;
	}
	
	function checkSend(sender, myMap){
		data = dataUtil.read();
		var result = `Here are to tokens received by ${myMap[sender]}:\n`; var count = 0;
		data
		.filter((x) => {return x.sender === sender;})
		.map((x) => {
			count++;
			result += `Sent to: ${myMap[x.receiver]}, Description: ${x.desc}\n`;
		});
		result += `Total: ${count}`
			return result;
	}
	
  return { // public interface
    getData: getData,
	addDesc: addDesc,
	checkRev: checkRev,
	checkSend: checkSend
  };
})();

module.exports = instance