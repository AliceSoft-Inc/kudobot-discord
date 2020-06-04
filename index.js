const express = require('express');			//npm install express
const discord = require("discord.js");		//npm install discord.js
const botconfig = require("./botconfig.json");


const bot = new discord.Client({disableEveryone: true});

const app = express();
const root = 'D:/dev';

app.get('/api', (req, res) =>{
    res.json({
        message: 'Welcome to the api'
    });
});

app.post('/api/posts', (req, res) => {
    res.json({
        message: 'Post created...'
    });
});

/*app.get('/sftsfa', (req, res) => {
   res.sendFile('./sftsfa/sftsfa.github.io/index.html', {root}); 
});*/ // local test only

app.listen(5180, () => console.log('node testing server instance started on port 5180'));

bot.on("ready", async() => {
	console.log(`${bot.user.username} 是真的傻屌`);
	bot.user.setGame("劫，剑姬，刀妹");
});

bot.on("message", async message => {
	console.log(message);
	if(message.author.bot) return;
	if(message.channel.type === "dm") return;
	
	let prefix = botconfig.prefix;
	let messageArray = message.content.split(" ");
	let cmd = messageArray[0];
	let args = messageArray.slice(1);
	let helpcommand = botconfig.helptext;
	
	
	if(cmd === `${prefix}shadiao`){
		return message.channel.send("你可真傻屌。");
	}else if(cmd === `${prefix}help`){
		return message.channel.send(helpcommand);
	}else if(cmd === "-play"){
		return message.channel.send("咋地，能放音乐了不起啊");
	}
});

bot.login(botconfig.token);