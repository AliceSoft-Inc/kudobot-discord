const DataUtil = require("./DataUtil.js");
const fileName = './database/kudoMember.json';
const fileEncoding = 'utf8';
const error = require('./kudoErrors');
const msg = require("./resource/botReturnMessageResource.js");
const defaultVal = {};

const kudo_init = 10;


var instance = (function() {
  let dataUtil = new DataUtil(fileName, fileEncoding);
  var data = dataUtil.readOrInit(defaultVal);
  
	function getData() { //test use
		return data;
	}

	function createUser(userID,userName) {
		data = dataUtil.read();
		if (verifyUserID(userID))
			return console.log(msg.userAlreadyExistsMsg(userID));

		data[userID] = {
			userName: userName,
			kudo: kudo_init,
			pt: 0
		};
		dataUtil.write(data);

		return msg.userCreationSuccessMsg(userID, userName);
	}
	
	function refresh(userID,userName) {
		data = dataUtil.read();
		var pt = 0;
		if(verifyUserID(userID))
			pt = data[userID].pt;
		
		data[userID] = {
			userName: userName,
			kudo: kudo_init,
			pt: pt
		};

		dataUtil.write(data);

		return msg.userCreationSuccessMsg(userID, userName);
	}
	
	function getUserPt(userID) {
		data = dataUtil.read();
		if(!verifyUserID(userID))
			return msg.userNotExistMsg(userID);
		
		return data[userID].pt; //TODO: exception handle
    }
	
	function setUserPt(userID, amount) {
		data = dataUtil.read();
		if(!verifyUserID(userID))
			return msg.userNotExistMsg(userID);
		
		if(!verifyPtAmount(amount))
			return msg.invalidAmountMsg;
		
		data[userID].pt = parseInt(amount); //TODO: exception handle
		dataUtil.write(data);
		return data[userID].pt;
	}
	
	function addUserPt(userID, amount) {
		data = dataUtil.read();
		if(!verifyUserID(userID))
			return msg.userNotExistMsg(userID);
		
		if(!verifyPtAmount(amount))
			return msg.invalidAmountMsg;
		
		data[userID].pt += parseInt(amount); //TODO: exception handle
		dataUtil.write(data);
		return data[userID].pt;
	}
	
	function deductUserPt(userID, amount) {
		data = dataUtil.read();
		if(!verifyUserID(userID))
			return msg.userNotExistMsg(userID);
		
		if(!verifyPtAmount(amount))
			return msg.invalidAmountMsg;
		
		var amountInt = parseInt(amount);
		
		if(data[userID].pt - amountInt < 0)
			return msg.negativeBalanceMsg;
		
		data[userID].pt -= amountInt; //TODO: exception handle
		dataUtil.write(data);
		return data[userID].pt;
	}
	
	function getUserKudo(userID) {
		data = dataUtil.read();
		if(!verifyUserID(userID))
			return msg.userNotExistMsg(userID);
		
		return data[userID].kudo; //TODO: exception handle
    }
	
	function setUserKudo(userID, amount) {
		data = dataUtil.read();
		if(!verifyUserID(userID))
			return msg.userNotExistMsg(userID);
		
		if(!verifyPtAmount(amount))
			return msg.invalidAmountMsg;
		
		data[userID].kudo = parseInt(amount); //TODO: exception handle
			
		dataUtil.write(data);
		return data[userID].kudo;
	}
	
	function deductUserKudo(userID) {
		data = dataUtil.read();
		if(!verifyUserID(userID))
			return msg.userNotExistMsg(userID);
		
		if(data[userID].kudo === 0)
			return msg.negativeBalanceMsg;
		
		data[userID].kudo--; //TODO: exception handle
		dataUtil.write(data);
		return data[userID].kudo;
	}
	
	function getUserMap(){
		data = dataUtil.read();
		var myMap = new Map();
		for(var key in data){
			myMap.set(key, data[key].userName);
		}
		return myMap;
	}
	
	function verifyUserID(userID){
		if(data[userID] === undefined)
			return false;
		
		if(data[userID].pt === undefined)
			data[userID].pt = 0;
		
		if(data[userID].kudo === undefined)
			data[userID].kudo = 0;
		
		return true;
	}
	
	function verifyPtAmount(amount){
		if(isNaN(amount))
			return false;
		
		if(amount < 0)
			return false;
		
		return true;
	}
	
  return { // public interface
    getUserPt: getUserPt,
	setUserPt: setUserPt,
	addUserPt: addUserPt,
	deductUserPt: deductUserPt,
    getData: getData,
	getUserKudo: getUserKudo,
	setUserKudo: setUserKudo,
	deductUserKudo: deductUserKudo,
	createUser: createUser,
	getUserMap: getUserMap,
	refresh: refresh
  };
})();

module.exports = instance