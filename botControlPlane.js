const discord = require("discord.js");		//npm install discord.js
const botconfig = require("./botconfig.json");
const kudoDescData = require("./KudoDescDataInstance.js"); //kudo desc
//const kudoAdminData = require("./FileUtilSingleton.js"); //kudo desc
//const kudoPtData = require("./FileUtilSingleton.js"); //kudo desc
const guildID = '719042359651729418'; // TODO: currently hard coded for test server. 

const client = new discord.Client({disableEveryone: true});

client.on("ready", async() => {
	client.user.setActivity("劫，剑姬，刀妹");
	// console.log(client.guilds);
	console.log(client.guilds.cache.keys().next().value); // Get guild ID here
	// kudoAdminData.setGuild(client.guilds.cache.get(guildID));
	

});

client.on("message", async message => {
	//console.log(message);
	console.log(
		"\nMessage received from server: \033[1;34m" + message.guild.name + "\033[0m" +
		"\nSender: \033[1;31m" + message.author.username + "\033[0m" +
		"\nContent: \"" + message.content + "\""
	)

	if(!message.guild.available) {
		console.log("Handler: Server unavailable. Ignore.");
		return;
	}

	if(message.author.bot) {
		console.log("Handler: Bot message received. Ignore.");
		return;
	}

	//if(message.channel.type === "dm") return;
	
	let prefix = botconfig.prefix;
	let messageArray = message.content.split(" ");
	let cmd = messageArray[0];
	//let args = messageArray.slice(1);

	if(cmd[0]!==prefix) {
		console.log("Handler: Not a vaild command. Ignore.");
		return;
	}

	switch (cmd) {
		case `${prefix}kudoPt`:
			return message.channel.send(handleKudoPtReturn(messageArray));
			break;
		
		case `${prefix}thumbupTest`:
			return message.react('👍');
			break;

		case `${prefix}help`:
			return message.channel.send(
				`
Current Available:
/kudoPt --get <Player Name> --endorse <Player Name>
/thumbupTest
				`);
			break;
		
		default:
			return message.channel.send("Undefinded action. Try /help for more available options.");
	}
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

function handleKudoPtReturn(inputMessage) {
	if(!inputMessage[1])
		return "Not valid command, do you mean: \n/kudoPt get <Player Name>\n" +
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
		return "Not valid command, do you mean: \n/kudoPt get <Player Name>\n" +
		"/kudoPt endorse <Player Name>";
	}
}


client.login(botconfig.token);