// TODO: Enhance security & exception handling

const DataUtil = require("./DataUtil.js");
const fileName = './database/kudoAdmin.json';
const fileEncoding = 'utf8';
const msg = require("./resource/botReturnMessageResource.js");

var instance = (function() {
	let dataUtil = new DataUtil(fileName, fileEncoding);
	var data = dataUtil.read();
  
	function getData() { //test use
		return data;
	}
	
	function assignAdmin(userID) { 
		if (verifyuserID(userID))
			return msg.adminExistMsg(userID);

		data[userID] = true;
		dataUtil.write(data);
		return msg.adminAsignSuccessMsg(userID); //TODO: exception handle
	}

	function isAdmin(userID) { 
		return msg.verifyuserID(userID); //TODO: exception handle
	}

	function rmAdmin(userID) {
		if (!verifyuserID(userID))
			return msg.useNotAdminMsg(userID);

		data[userID] = false;
		dataUtil.write(data);
		return msg.adminRemovalSuccessMsg(userID); //TODO: exception handle
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