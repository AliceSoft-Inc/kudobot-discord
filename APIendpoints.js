const express = require('express');			//npm install express

const app = express();
//const root = 'D:/dev';

//const kudoDescData = require("./KudoDescDataInstance.js");
const kudoPtData = require("./KudoPtDataInstance.js");
// const fileUtilSingleton = require("./FileUtilSingleton.js");

app.get('/api', async (req, res) =>{
    res.json({
        message: 'Welcome to the api'
    });
});

app.post('/api/posts', async (req, res) => {
    res.json({
        message: 'Post created...'
    });
});

app.get('/getPlayerToken', async (req, res) => {
    let playerID = req.query.playerID;
	res.json({
		message: kudoDescData.getPlayerToken(playerID)
	});
});

app.get('/setPlayerToken', async (req, res) => {
	let playerID = req.query.playerID;
	let amount = req.query.amount;
	res.json({
		message: kudoDescData.setPlayerToken(playerID, amount)
	});
});

app.get('/getpt', async (req, res) => {
    let playerID = req.query.playerID;
	res.json({
		message: kudoPtData.getPlayerPt(playerID)
	});
});

app.get('/setpt', async (req, res) => {
	let playerID = req.query.playerID;
	let amount = req.query.amount;
	res.json({
		message: kudoPtData.setPlayerPt(playerID, amount)
	});
});

app.get('/addpt', async (req, res) => {
	let playerID = req.query.playerID;
	let amount = req.query.amount;
	res.json({
		message: kudoPtData.addPlayerPt(playerID, amount)
	});
});

app.get('/deductpt', async (req, res) => {
	let playerID = req.query.playerID;
	let amount = req.query.amount;
	res.json({
		message: kudoPtData.deductPlayerPt(playerID, amount)
	});
});

/*app.get('/sftsfa', (req, res) => {
   res.sendFile('./sftsfa/sftsfa.github.io/index.html', {root}); 
});*/ // local test only

app.listen(5180, () => console.log('Node testing server instance started on port 5180'));
