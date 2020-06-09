var fs=require('fs');

class FileUtil {
	constructor(){
		this.data = JSON.parse(fs.readFileSync('kudosToken.json', 'utf8'));
	}

	updateData(){
		return JSON.parse(fs.readFileSync('kudosToken.json', 'utf8'));
	}

	getUserToken(userID){
		updateData();
		return data[userID];
	}
}

module.exports = FileUtil
