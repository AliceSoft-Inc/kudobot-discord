const discord = require("discord.js");		//npm install discord.js
const botconfig = require("./botconfig.json");
const kudoDescData = require("./KudoDescDataInstance.js"); //kudo desc
//const kudoAdminData = require("./FileUtilSingleton.js"); //kudo admin
const kudoPtData = require("./KudoPtDataInstance.js"); //kudo pt
const guildID = '719042359651729418'; // TODO: currently hard coded for test server. 

const client = new discord.Client({disableEveryone: true});

const debugMode = true;  // Debug flag

client.on("ready", async() => {
	client.user.setActivity("劫，剑姬，刀妹");
	// console.log(client.guilds);
	if (debugMode) console.log("First guild ID in cache: " + client.guilds.cache.keys().next().value); // Get guild ID here. For current usage, we only handle first guild.

	// TODO: transfer guild data to kudoAdmin.

	// kudoAdminData.setGuildID(client.guilds.cache.keys().next().value); // id => kudoAdminData
	// kudoAdminData.setGuildData(client.guilds.cache.get(guildID));  // guild => kudoAdminData 
	

});

client.on("message", async message => {
	//console.log(message);

	if(message.author.bot) {
		console.log("Handler: Bot message. Ignore.");
		return;
	}

	if(!message.guild.available) {
		console.log("Handler: Source server unavailable. Ignore.");
		return;
	}


	if (debugMode) console.log(
		"\nMessage received from server: \033[1;34m" + message.guild.name + "\033[0m" +
		"\nSender: \033[1;31m" + message.author.username + "\033[0m" +
		"\nContent: \"" + message.content + "\""
	)

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
			return message.channel.send(handleKudoPtReturn(messageArray, message.author.id));
		
		case `${prefix}thumbupTest`:
			return message.react('👍');	

		case `${prefix}help`:
			return message.channel.send(
				`
Current Available:
/kudoPt 
	--get <Player Name> 
	--endorse <Player Name> <Description>
	--add <Player Name> <Add Pt>
	--set <Player Name> <Set Pt>
	--reset <Player Name>
/thumbupTest
				`);
		
		default:
			return message.channel.send("Undefined action. Try /help for more available options.");
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

function handleKudoPtReturn(inputMessage, authorID) {
	switch (inputMessage[1]) {
		case "get":
			if(!inputMessage[2])
				return "error: please enter a valid player name";
			return kudoPtData.getPlayerPt(inputMessage[2]);

		// TODO: next case need kudoDesc methods.

		case "endorse":
			if(!inputMessage[2] || !inputMessage[3])
				return "error: please enter valild arguments";
			
			// return kudoPtData.addPlayerPt(inputMessage[2], 1) + kudoDescData.addDesc(inputMessage[2], inputMessage[3]);
			return kudoPtData.addPlayerPt(inputMessage[2], 1);	

		// TODO: next 3 cases need kudoAdmin methods.
		
		case "add":
			if(!inputMessage[2] || !inputMessage[3])
				return "error: please enter valild arguments";
			// if (kudoAdminData.isAdmin(authorID)) 
			//  	return kudoPtData.addPlayerPt(inputMessage[2], inputMessage[3]);
			return "Permission Denied: Please contact admin.";

		case "set":
			if(!inputMessage[2] || !inputMessage[3])
				return "error: please enter valild arguments";
			// if (kudoAdminData.isAdmin(authorID)) 
			//  	return kudoPtData.setPlayerPt(inputMessage[2], inputMessage[3]);
			return "Permission Denied: Please contact admin.";

		case "reset":
			if(!inputMessage[2])
				return "error: please enter a valid player name";
			// if (kudoAdminData.isAdmin(authorID)) 
			// 	return kudoPtData.setPlayerPt(inputMessage[2], 0);  // TODO: return a notification instead of fixed 0 number
			return "Permission Denied: Please contact admin.";

	
		default:
			return "Not valid command, do you mean: \n/kudoPt get <Player Name>\n" +
			"/kudoPt endorse <Player Name> <Description>\n" + 
			"/kudoPt add <Player Name> <Add Pt> (Admin)\n" +
			"/kudoPt set <Player Name> <Set Pt> (Admin)";
	}
}


client.login(botconfig.token);