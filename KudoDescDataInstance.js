var fs=require('fs'); //npm install fs

var instance = (function() {
  var data = JSON.parse(fs.readFileSync('kudosToken.json', 'utf8'));

	function readData(){ //private
		this.data = JSON.parse(fs.readFileSync('kudosToken.json', 'utf8'));
	}
	
	function writeData(){ //private
		return;
	}
	
	function getData() { //test use
		return data;
	}
	
	function getPlayerToken(playerName) {
		readData();
		if(!data[playerName])
			return "error: player " + playerName + " does not exist.";
		
		return data[playerName]; //TODO: exception handle
    }
	
	function setPlayerToken(playerName, amount) {
		readData();
		if(!data[playerName])
			return "error: player " + playerName + " does not exist.";
		
		if(isNaN(amount))
			return "error: please enter a valid number for amount.";
		
		data[playerName] = parseInt(amount); //TODO: exception handle
		writeData();
		return amount;
	}
	
  return { // public interface
    getPlayerToken: getPlayerToken,
	setPlayerToken: setPlayerToken,
    getData: getData
  };
})();

module.exports = instance