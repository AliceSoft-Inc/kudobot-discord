const express = require('express');			//npm install express

const app = express();
//const root = 'D:/dev';

const kudoDescData = require("./KudoDescDataInstance.js");
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
    let playerName = req.query.playerName;
	res.json({
		message: kudoDescData.getPlayerToken(playerName)
	});
});

app.get('/setPlayerToken', async (req, res) => {
	let playerName = req.query.playerName;
	let amount = req.query.amount;
	res.json({
		message: kudoDescData.setPlayerToken(playerName, amount)
	});
});

/*app.get('/sftsfa', (req, res) => {
   res.sendFile('./sftsfa/sftsfa.github.io/index.html', {root}); 
});*/ // local test only

app.listen(5180, () => console.log('Node testing server instance started on port 5180'));
