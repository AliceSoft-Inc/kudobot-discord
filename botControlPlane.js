const discord = require("discord.js");		//npm install discord.js
const botconfig = require("./botconfig.json");
const kudoDescData = require("./KudoDescDataInstance.js"); //kudo desc
//const kudoAdminData = require("./FileUtilSingleton.js"); //kudo admin
const kudoPtData = require("./KudoPtDataInstance.js"); //kudo pt

const guildID_test = '719042359651729418'; // TODO: currently hard coded for test server. 
const guildID_baixue = '493946649014566943';

const client = new discord.Client({disableEveryone: true});

const debugMode = true;  // Debug flag

client.on("ready", async() => {
	client.user.setActivity("劫，剑姬，刀妹");
	// console.log(client.guilds);
	if (debugMode) console.log("\nFirst guild ID in cache: " + client.guilds.cache.keys().next().value); // Get guild ID here. For current usage, we only handle first guild.
	
	console.log(client.guilds.cache.get(guildID_test).roles);
	// console.log(client.guilds.cache.get(guildID_test).roles.cache);
	// console.log(client.guilds.cache.get(guildID_test).members.cache);

	// Populate admin list here.
	if (debugMode) console.log("\nCurrent guild role list:");
	client.guilds.cache.get(guildID_test).roles.cache.forEach( member => {
		if (debugMode) console.log("	ID: " + member.id +", Role: " + member.name);

		// TODO: revised role name here. Need further kudoAdminData support.
		// if (member.name === "testRole1") 
		// 	kudoAdminData.assignAdmin(member.id);
	});

	
	// TODO: transfer guild data to kudoAdmin?

	// kudoAdminData.setGuildID(client.guilds.cache.keys().next().value); // id => kudoAdminData
	// kudoAdminData.setGuildData(client.guilds.cache.get(guildID));  // guild => kudoAdminData 
	

});

client.on("message", async message => {
	//console.log(message);

	if(message.author.bot) {
		console.log("\nNew msg handler: Bot message. Ignore.");
		return;
	}

	if(!message.guild.available) {
		console.log("\nNew msg handler: Source server unavailable. Ignore.");
		return;
	}

	if (debugMode) console.log(
		"\nMessage received from server: \033[1;34m" + message.guild.name + "\033[0m" +
		"\nSender: \033[1;31m" + message.author.username + "\033[0m" +
		"\nSenderID: " + message.author.id +
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
		
		case `${prefix}endorse`:
			return message.channel.send(handleEndorseReturn(messageArray, message.author.id));

		case `${prefix}help`:
			return message.channel.send(
				`
Current Available:
/kudoPt 
	--get <Player Name> 
	--add <Player Name> <Add Pt>
	--set <Player Name> <Set Pt>
	--reset <Player Name>
/thumbupTest
/endorse <@Player Name> <Description>
				`);
		
		default:
			return message.channel.send("Undefined action. Try /help for more available options.");
	}
});

function handleKudoDescReturn(inputMessage){

}

function handleEndorseReturn(inputMessage, authorID) {
	// Important: primary key for user database is currently based on user id.
	if (debugMode) console.log(inputMessage);

	if(!inputMessage[1] || !inputMessage[2])
	return "error: please enter valild arguments";

	var target_id = inputMessage[1].slice(2, -1);
	if (target_id === authorID) return "Sorry, you cannot endorse yourself.";
	
	// TODO: next case need kudoDesc methods.
	// return kudoPtData.addPlayerPt(target_id, 1) + kudoDescData.addDesc(target_id, inputMessage[2]);

	return kudoPtData.addPlayerPt(target_id, 1);

}

function handleKudoPtReturn(inputMessage, authorID) {
	// Urgent TODO: replace all user name to user id

	switch (inputMessage[1]) {
		case "get":
			if(!inputMessage[2])
				return "error: please enter a valid player name";
			return kudoPtData.getPlayerPt(inputMessage[2]);

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