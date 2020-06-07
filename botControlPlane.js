const discord = require("discord.js");		//npm install discord.js
const botconfig = require("./botconfig.json");
const kudoDescData = require("./KudoDescDataInstance.js"); //kudo desc
//const kudoAdminData = require("./FileUtilSingleton.js"); //kudo desc
//const kudoPtData = require("./FileUtilSingleton.js"); //kudo desc


const client = new discord.Client({disableEveryone: true});

client.on("ready", async() => {
	client.user.setActivity("劫，剑姬，刀妹");
});

client.on("message", async message => {
	//console.log(message);
	console.log(
		"\nMessage received from server: " + message.guild.name +
		"\nSender: " + message.author.username +
		"\nContent: \"" + message.content + "\""
	)

	if(message.author.bot) {
		console.log("Handler: Bot message received. Ignore.");
		return;
	}

	//if(message.channel.type === "dm") return;
	
	let prefix = botconfig.prefix;
	let messageArray = message.content.split(" ");
	let cmd = messageArray[0];
	//let args = messageArray.slice(1);
	if(cmd === `${prefix}kudoToken`)
		return message.channel.send(handleKudoTokenReturn(messageArray));
	//else if (cmd === `${prefix}thumbupTest`)
		//console.log(discord.MessageReaction(client, null, message));
	
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
	}else return "Undefined Action.";
}

function handleKudoTokenReturn(inputMessage) {
	if(!inputMessage[1])
		return "Not valid command, do you mean: \n/kudoToken get <Player Name>\n" +
		"/kudoToken endorse <Player Name>";
	
	if(inputMessage[1] === "get"){
		if(!inputMessage[2])
			return "error: please enter a valid player name";
		return kudoDescData.getPlayerToken(inputMessage[2]);
	}else if(inputMessage[1] === "endorse"){
		if(!inputMessage[2])
			return "error: please enter a valid player name";
		
		var a = kudoDescData.getPlayerToken(inputMessage[2]) + 1;
		return kudoDescData.setPlayerToken(inputMessage[2], a);
	}else{
		return "Not valid command, do you mean: \n/kudoToken get <Player Name>\n" +
		"/kudoToken endorse <Player Name>";
	}
}


client.login(botconfig.token);