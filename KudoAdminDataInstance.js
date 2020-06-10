// TODO: Enhance security & exception handling

const DataUtil = require("./DataUtil.js");
const fileName = './database/kudoAdmin.json';
const fileEncoding = 'utf8';

var instance = (function() {
	let dataUtil = new DataUtil(fileName, fileEncoding);
	var data = dataUtil.read();
  
	function getData() { //test use
		return data;
	}
	
	function assignAdmin(userID) { 
		if (verifyuserID(userID))
			return "error: Admin " + userID + " already existed.";

		data[userID] = true;
		dataUtil.write(data);
		return `Successfully assigned userID: ${userID} as admin.`; //TODO: exception handle
	}

	function isAdmin(userID) { 
		return verifyuserID(userID); //TODO: exception handle
	}

	function rmAdmin(userID) {
		if (!verifyuserID(userID))
			return "error: User" + userID + " is not under admin premission.";

		data[userID] = false;
		dataUtil.write(data);
		return `Successfully removed userID: ${userID} from admin.`; //TODO: exception handle
	}

	function verifyuserID(userID) {
		if (!data[userID])
			return false;

		return true;
	}
	
	
  return { // public interface
	getData: getData,
	assignAdmin: assignAdmin,
	rmAdmin: rmAdmin,
	isAdmin: isAdmin
  };
})();

module.exports = instance