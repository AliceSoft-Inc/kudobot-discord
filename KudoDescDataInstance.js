const DataUtil = require("./DataUtil.js");
const fileName = './database/kudoDesc.json';
const fileEncoding = 'utf8';

var instance = (function() {
  let dataUtil = new DataUtil(fileName, fileEncoding);
  var data = dataUtil.read();
  
	function getData() { //test use
		return data;
	}
	
	function getPlayerToken(playerName) {
		data = dataUtil.read();
		if(!data[playerName])
			return "error: player " + playerName + " does not exist.";
		
		return data[playerName]; //TODO: exception handle
    }
	
	function setPlayerToken(playerName, amount) {
		data = dataUtil.read();
		if(!data[playerName])
			return "error: player " + playerName + " does not exist.";
		
		if(isNaN(amount))
			return "error: please enter a valid number for amount.";
		
		data[playerName] = parseInt(amount); //TODO: exception handle
		dataUtil.write(data);
		return amount;
	}
	
  return { // public interface
    getPlayerToken: getPlayerToken,
	setPlayerToken: setPlayerToken,
    getData: getData
  };
})();

module.exports = instance