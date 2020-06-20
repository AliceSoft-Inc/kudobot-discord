// TODO: Enhance security & exception handling

const DataUtil = require("./DataUtil.js");
const fileName = './database/kudoAdmin.json';
const fileEncoding = 'utf8';
const msg = require("./resource/botReturnMessageResource.js");
const defaultVal = {};

var instance = (function() {
	let dataUtil = new DataUtil(fileName, fileEncoding);
	var data = dataUtil.readOrInit(defaultVal);
  
	function getData() { //test use
		return data;
	}

	function getAdminList(){
		data = dataUtil.read();
		return Object.keys(data).filter(id => data[id] === true);
	}
	
	function assignAdmin(userID) { 
		data = dataUtil.read();
		if (verifyuserID(userID))
			return msg.adminExistMsg(userID);

		data[userID] = true;
		dataUtil.write(data);
		return msg.adminAsignSuccessMsg(userID); //TODO: exception handle
	}

	function isAdmin(userID) { 
		data = dataUtil.read();
		return verifyuserID(userID); //TODO: exception handle
	}

	function rmAdmin(userID) {
		data = dataUtil.read();
		if (!verifyuserID(userID))
			return msg.userNotAdminMsg(userID);

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
	isAdmin: isAdmin,
	getAdminList: getAdminList
  };
})();

module.exports = instance