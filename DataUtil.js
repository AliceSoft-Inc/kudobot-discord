var fs=require('fs'); //npm install fs

class DataUtil {
  constructor(fileName, fileEncoding) {
	  this.fileName = fileName;
	  this.fileEncoding = fileEncoding;
  }
  
  read(){
	  return JSON.parse(fs.readFileSync(this.fileName, this.fileEncoding));  
  }
  
  write(data){
	  fs.writeFile(this.fileName, JSON.stringify(data), function (err) {
		  if (err) 
			return console.log(err);
	  });
  }	
}

module.exports = DataUtil