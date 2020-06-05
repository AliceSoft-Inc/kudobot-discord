const discord = require("discord.js");		//npm install discord.js
const botconfig = require("./botconfig.json");
const fileUtilSingleton = require("./FileUtilSingleton.js");

const client = new discord.Client({disableEveryone: true});

client.on("ready", async() => {
	client.user.setActivity("劫，剑姬，刀妹");
});

client.on("message", async message => {
	//console.log(message);
	if(message.author.bot) return;
	//if(message.channel.type === "dm") return;
	
	let prefix = botconfig.prefix;
	let messageArray = message.content.split(" ");
	let cmd = messageArray[0];
	//let args = messageArray.slice(1);
	if(cmd === `${prefix}kudoToken`)
		return message.channel.send(handleKudoTokenReturn(messageArray));
	
	return message.channel.send(handleShadiaoReturn(cmd));
});

function handleShadiaoReturn(inputMessage){
	let prefix = botconfig.prefix;
	let helpcommand = botconfig.helptext;
	
	if(inputMessage === `${prefix}shadiao`){
		return "你可真傻屌。";
	}else if(inputMessage === `${prefix}help`){
		return helpcommand;
	}else if(inputMessage === "-play"){
		return "咋地，能放音乐了不起啊";
	}
}

function handleKudoTokenReturn(inputMessage) {
	if(!inputMessage[1])
		return "Not valid command, do you mean: \n/kudoToken get <Player Name>\n" +
		"/kudoToken endorse <Player Name>";
	
	if(inputMessage[1] === "get"){
		if(!inputMessage[2])
			return "error: please enter a valid player name";
		return fileUtilSingleton.getPlayerToken(inputMessage[2]);
	}else if(inputMessage[1] === "endorse"){
		if(!inputMessage[2])
			return "error: please enter a valid player name";
		
		var a = fileUtilSingleton.getPlayerToken(inputMessage[2]) + 1;
		return fileUtilSingleton.setPlayerToken(inputMessage[2], a);
	}else{
		return "Not valid command, do you mean: \n/kudoToken get <Player Name>\n" +
		"/kudoToken endorse <Player Name>";
	}
}


client.login(botconfig.token);