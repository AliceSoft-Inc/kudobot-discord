var fs=require('fs');

class FileUtil {
	constructor(){
		this.data = JSON.parse(fs.readFileSync('kudosToken.json', 'utf8'));
	}

	updateData(){
		return JSON.parse(fs.readFileSync('kudosToken.json', 'utf8'));
	}

	getPlayerToken(playerName){
		updateData();
		return data[playerName];
	}
}

module.exports = FileUtil
