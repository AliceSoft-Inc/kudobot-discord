const express = require('express');			//npm install express

const app = express();

var stream = require('stream');
const kudoDescData = require("./KudoDescDataInstance.js");
const kudoMemberData = require("./KudoMemberDataInstance.js");
//const kudoAdminData = require("./KudoAdminDataInstance.js");
//const Lock = require("./StageLock.js");

//let lock = new Lock();

/*app.get('/api', async (req, res) =>{
    res.json({
        message: 'Welcome to the kuroyukibot-<discord ver.> api, this is an AWS EC2 hosted intance'
    });
});

app.post('/api/posts', async (req, res) => {
    res.json({
        message: 'Post created...'
    });
});

app.get('/getkudo', async (req, res) => {
    let UserID = req.query.UserID;
	res.json({
		message: kudoMemberData.getUserKudo(UserID)
	});
});

app.get('/setkudo', async (req, res) => {
	let UserID = req.query.UserID;
	let amount = req.query.amount;
	res.json({
		message: kudoMemberData.setUserKudo(UserID, amount)
	});
});

app.get('/deductkudo', async (req, res) => {
	let UserID = req.query.UserID;
	let amount = req.query.amount;
	res.json({
		message: kudoMemberData.deductUserKudo(UserID, amount)
	});
});

app.get('/getpt', async (req, res) => {
    let UserID = req.query.UserID;
	res.json({
		message: kudoMemberData.getUserPt(UserID)
	});
});

app.get('/setpt', async (req, res) => {
	let UserID = req.query.UserID;
	let amount = req.query.amount;
	res.json({
		message: kudoMemberData.setUserPt(UserID, amount)
	});
});

app.get('/addpt', async (req, res) => {
	let UserID = req.query.UserID;
	let amount = req.query.amount;
	res.json({
		message: kudoMemberData.addUserPt(UserID, amount)
	});
});

app.get('/deductpt', async (req, res) => {
	let UserID = req.query.UserID;
	let amount = req.query.amount;
	res.json({
		message: kudoMemberData.deductUserPt(UserID, amount)
	});
});

app.get('/getUserMap', async (req, res) => {
	res.json({
		message: kudoMemberData.getUserMap()
	});
});

app.get('/tryAddDesc', async (req, res) => {
	let sender = req.query.sender;
	let receiver = req.query.receiver;
	let desc = req.query.desc;
	res.json({
		message: kudoDescData.addDesc(sender, receiver, desc)
	});
});

app.get('/tryCheckRev', async (req, res) => {
	let UserID = req.query.UserID;
	let myMap = kudoMemberData.getUserMap();
	res.json({
		message: kudoDescData.checkRev(UserID, myMap)
	});
});

app.get('/tryCheckSend', async (req, res) => {
	let UserID = req.query.UserID;
	let myMap = kudoMemberData.getUserMap();
	res.json({
		message: kudoDescData.checkSend(UserID, myMap)
	});
});

app.get('/getAdminList', async (req, res) => {
	res.json({
		message: kudoAdminData.getAdminList()
	});
});

app.get('/lockTestAcquire', async (req, res) => {
	let owner = req.query.owner;
	let stage = req.query.stage;
	
	res.json({
		message: lock.acquire(owner, stage)
	});
});

app.get('/lockTestReleaseIncr', async (req, res) => {
	let owner = req.query.owner;
	
	res.json({
		message: lock.releaseAndIncr(owner)
	});
});

app.get('/lockTestRelease', async (req, res) => {
	let owner = req.query.owner;
	
	res.json({
		message: lock.release(owner)
	});
});

app.get('/lockcheck', async (req, res) => {	
	res.json({
		message: lock.getLocks
	});
});*/

app.get('/checkKudoHistory', async(req, res)=> {
	let map = kudoMemberData.getUserMap();
	res.set('Access-Control-Allow-Origin', '*');
	res.send(kudoDescData.getPrettyFormatData(map));
});

app.get('/downloadKudoHistory', function(req, res){
  let map = kudoMemberData.getUserMap();
  var fileContents = Buffer.from(
	  JSON.stringify(kudoDescData.getPrettyFormatData(map)), 'utf-8');
  
  var readStream = new stream.PassThrough();
  readStream.end(fileContents);

  res.set('Access-Control-Allow-Origin', '*');
  res.set('Content-disposition', 'attachment; filename=History.txt');
  res.set('Content-Type', 'text/plain');

  readStream.pipe(res);
});


app.listen(5180, () => console.log('Node discord bot testing server instance started on port 80'));
