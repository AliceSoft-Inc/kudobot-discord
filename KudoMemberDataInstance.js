const DataUtil = require("./DataUtil.js");
const fileName = './database/kudoMember.json';
const fileEncoding = 'utf8';

var instance = (function() {
  let dataUtil = new DataUtil(fileName, fileEncoding);
  var data = dataUtil.read();
  
	function getData() { //test use
		return data;
	}
	
	function getUserPt(userID) {
		data = dataUtil.read();
		if(!verifyUserID(userID))
			return "error: User " + userID + " does not exist.";
		
		return data[userID].pt; //TODO: exception handle
    }
	
	function setUserPt(userID, amount) {
		data = dataUtil.read();
		if(!verifyUserID(userID))
			return "error: User " + userID + " does not exist.";
		
		if(!verifyPtAmount(amount))
			return "error: please enter a valid number for amount.";
		
		data[userID].pt = parseInt(amount); //TODO: exception handle
		dataUtil.write(data);
		return data[userID].pt;
	}
	
	function addUserPt(userID, amount) {
		data = dataUtil.read();
		if(!verifyUserID(userID))
			return "error: User " + userID + " does not exist.";
		
		if(!verifyPtAmount(amount))
			return "error: please enter a valid number for amount.";
		
		data[userID].pt += parseInt(amount); //TODO: exception handle
		dataUtil.write(data);
		return data[userID].pt;
	}
	
	function deductUserPt(userID, amount) {
		data = dataUtil.read();
		if(!verifyUserID(userID))
			return "error: User " + userID + " does not exist.";
		
		if(!verifyPtAmount(amount))
			return "error: please enter a valid number for amount.";
		
		var amountInt = parseInt(amount);
		
		if(data[userID].pt - amountInt < 0)
			return "will result in a negative balance, rejected."
		
		data[userID].pt -= amountInt; //TODO: exception handle
		dataUtil.write(data);
		return data[userID].pt;
	}
	
	function getUserKudo(userID) {
		data = dataUtil.read();
		if(!verifyUserID(userID))
			return "error: User " + userID + " does not exist.";
		
		return data[userID].kudo; //TODO: exception handle
    }
	
	function setUserKudo(userID, amount) {
		data = dataUtil.read();
		if(!verifyUserID(userID))
			return "error: User " + userID + " does not exist.";
		
		if(!verifyPtAmount(amount))
			return "error: please enter a valid number for amount.";
		
		data[userID].kudo = parseInt(amount); //TODO: exception handle
		dataUtil.write(data);
		return data[userID].kudo;
	}
	
	function deductUserKudo(userID) {
		data = dataUtil.read();
		if(!verifyUserID(userID))
			return "error: User " + userID + " does not exist.";
		
		if(data[userID].kudo === 0)
			return "will result in a negative balance, rejected."
		
		data[userID].kudo--; //TODO: exception handle
		dataUtil.write(data);
		return data[userID].kudo;
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
	deductUserKudo: deductUserKudo
  };
})();

module.exports = instance