const DataUtil = require("./DataUtil.js");
const fileName = './database/kudoDesc.json';
const fileEncoding = 'utf8';

var instance = (function() {
  let dataUtil = new DataUtil(fileName, fileEncoding);
  var data = dataUtil.read();
  
	function getData() { //test use
		return data;
	}
	
	function getUserToken(userID) {
		data = dataUtil.read();
		if(!data[userID])
			return "error: user " + userID + " does not exist.";
		
		return data[userID]; //TODO: exception handle
    }
	
	function setUserToken(userID, amount) {
		data = dataUtil.read();
		if(!data[userID])
			return "error: user " + userID + " does not exist.";
		
		if(isNaN(amount))
			return "error: please enter a valid number for amount.";
		
		data[userID] = parseInt(amount); //TODO: exception handle
		dataUtil.write(data);
		return amount;
	}
	
  return { // public interface
    getUserToken: getUserToken,
	setUserToken: setUserToken,
    getData: getData
  };
})();

module.exports = instance