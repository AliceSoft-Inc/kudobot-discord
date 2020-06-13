var fs=require('fs'); //npm install fs

class DataUtil {
	constructor(fileName, fileEncoding) {
		this.fileName = fileName;
		this.fileEncoding = fileEncoding;
	}
  
	read(){
		return JSON.parse(fs.readFileSync(this.fileName, this.fileEncoding));  
	}
	
	readOrInit(defaultVal){
		try{
		var tmp = this.read();
			if(tmp === undefined){
				this.write(defaultVal);
				return defaultVal;
			}
		}catch(Exception){
				this.write(defaultVal);
				return defaultVal;
		}
		
		return tmp;
	}
  
	write(data){
		fs.writeFileSync(this.fileName, JSON.stringify(data), function (err) {
			if (err) 
				return console.log(err);
		});
	} 
	
	remove(key) {	// TODO: handle exceptions
		var json = JSON.parse(fs.readFileSync(this.fileName, this.fileEncoding));
		delete json[key];
		fs.writeFileSync(this.fileName, JSON.stringify(json, null, 2));
		return;
	}
}

module.exports = DataUtil