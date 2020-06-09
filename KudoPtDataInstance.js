const DataUtil = require("./DataUtil.js");
const fileName = './database/kudoPt.json';
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
		
		return data[userID]; //TODO: exception handle
    }
	
	function setUserPt(userID, amount) {
		data = dataUtil.read();
		if(!verifyUserID(userID))
			return "error: User " + userID + " does not exist.";
		
		if(!verifyPtAmount(amount))
			return "error: please enter a valid number for amount.";
		
		data[userID] = parseInt(amount); //TODO: exception handle
		dataUtil.write(data);
		return data[userID];
	}
	
	function addUserPt(userID, amount) {
		data = dataUtil.read();
		if(!verifyUserID(userID))
			return "error: User " + userID + " does not exist.";
		
		if(!verifyPtAmount(amount))
			return "error: please enter a valid number for amount.";
		
		data[userID] += parseInt(amount); //TODO: exception handle
		dataUtil.write(data);
		return data[userID]
	}
	
	function deductUserPt(userID, amount) {
		data = dataUtil.read();
		if(!verifyUserID(userID))
			return "error: User " + userID + " does not exist.";
		
		if(!verifyPtAmount(amount))
			return "error: please enter a valid number for amount.";
		
		var amountInt = parseInt(amount);
		
		if(data[userID] - amountInt < 0)
			return "will result in a negative balance, rejected."
		
		data[userID] -= amountInt; //TODO: exception handle
		dataUtil.write(data);
		return data[userID];
	}
	
	function verifyUserID(userID){
		if(data[userID] === undefined)
			return false;
		
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
    getData: getData
  };
})();

module.exports = instance