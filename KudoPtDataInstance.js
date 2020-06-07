const DataUtil = require("./DataUtil.js");
const fileName = './database/kudoPt.json';
const fileEncoding = 'utf8';

var instance = (function() {
  let dataUtil = new DataUtil(fileName, fileEncoding);
  var data = dataUtil.read();
  
	function getData() { //test use
		return data;
	}
	
	function getPlayerPt(playerName) {
		data = dataUtil.read();
		if(!verifyPlayerName(playerName))
			return "error: player " + playerName + " does not exist.";
		
		return data[playerName]; //TODO: exception handle
    }
	
	function setPlayerPt(playerName, amount) {
		data = dataUtil.read();
		if(!verifyPlayerName(playerName))
			return "error: player " + playerName + " does not exist.";
		
		if(!verifyPtAmount(amount))
			return "error: please enter a valid number for amount.";
		
		data[playerName] = parseInt(amount); //TODO: exception handle
		dataUtil.write(data);
		return data[playerName];
	}
	
	function addPlayerPt(playerName, amount) {
		data = dataUtil.read();
		if(!verifyPlayerName(playerName))
			return "error: player " + playerName + " does not exist.";
		
		if(!verifyPtAmount(amount))
			return "error: please enter a valid number for amount.";
		
		data[playerName] += parseInt(amount); //TODO: exception handle
		dataUtil.write(data);
		return data[playerName]
	}
	
	function deductPlayerPt(playerName, amount) {
		data = dataUtil.read();
		if(!verifyPlayerName(playerName))
			return "error: player " + playerName + " does not exist.";
		
		if(!verifyPtAmount(amount))
			return "error: please enter a valid number for amount.";
		
		var amountInt = parseInt(amount);
		
		if(data[playerName] - amountInt < 0)
			return "will result in a negative balance, rejected."
		
		data[playerName] -= amountInt; //TODO: exception handle
		dataUtil.write(data);
		return data[playerName];
	}
	
	function verifyPlayerName(playerName){
		if(data[playerName] === undefined)
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
    getPlayerPt: getPlayerPt,
	setPlayerPt: setPlayerPt,
	addPlayerPt: addPlayerPt,
	deductPlayerPt: deductPlayerPt,
    getData: getData
  };
})();

module.exports = instance