const DataUtil = require("./DataUtil.js");
const fileName = './database/kudoDesc.json';
const fileEncoding = 'utf8';
const msg = require("./resource/botReturnMessageResource.js");
const defaultVal = [];

var instance = (function() {
  let dataUtil = new DataUtil(fileName, fileEncoding);
  var data = dataUtil.readOrInit(defaultVal);
  
	function getData() { //test use
		return data;
	}

	function getStringData() {
		return JSON.stringify(data);
	}
		
	function addDesc(sender, receiver, desc){
		data = dataUtil.read();
		var newDesc = {};
		newDesc.sender = sender;
		newDesc.receiver = receiver;
		newDesc.desc = desc;
		newDesc.timestamp = new Date();
		data.push(newDesc);	
		dataUtil.write(data);
		return msg.successful;
	}
	
	function checkRev(receiver, myMap){
		data = dataUtil.read();
		var result = msg.kudoRevHeadlineMsg(myMap[receiver]); var count = 0;
		data
		.filter((x) => {return x.receiver === receiver;})
		.map((x) => {
			count++;
			result += msg.kudoRevBodyMsg(myMap[x.sender], x.desc, x.timestamp);
		});
		result += msg.totalCountMsg(count);
		return result;
	}
	
	function checkSend(sender, myMap){
		data = dataUtil.read();
		var result = msg.kudoSendHeadlineMsg(myMap[sender]); var count = 0;
		data
		.filter((x) => {return x.sender === sender;})
		.map((x) => {
			count++;
			result += msg.kudoSendBodyMsg(myMap[x.receiver], x.desc, x.timestamp);
		});
		result += msg.totalCountMsg(count);
		return result;
	}
	
  return { // public interface
    getData: getData,
	addDesc: addDesc,
	checkRev: checkRev,
	checkSend: checkSend,
	getStringData: getStringData
  };
})();

module.exports = instance
