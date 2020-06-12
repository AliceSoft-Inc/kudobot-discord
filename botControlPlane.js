const discord = require("discord.js");		//npm install discord.js
const botconfig = require("./botconfig.json");
const kudoDescData = require("./KudoDescDataInstance.js"); //kudo desc
const kudoAdminData = require("./KudoAdminDataInstance.js"); //kudo admin
const kudoMemberData = require("./KudoMemberDataInstance.js"); //kudo pt

const prizeData = require('./database/KudoPrize.json'); 

const guildID_test = '719042359651729418'; // TODO: currently hard coded for test server. 
// const guildID_baixue = '493946649014566943';

const client = new discord.Client({disableEveryone: true});

const debugMode = true;  // Debug flag

var userMap;

client.on("ready", async() => {
	client.user.setActivity("劫，剑姬，刀妹");
	// console.log(client.guilds);
	if (debugMode) console.log("\nFirst guild ID in cache: " + client.guilds.cache.keys().next().value); // Get guild ID here. For current usage, we only handle first guild.
	
	// console.log(client.guilds.cache.get(guildID_test).roles);
	// console.log(client.guilds.cache.get(guildID_test).roles.cache);
	// console.log(client.guilds.cache.get(guildID_test).members.cache);

	if (debugMode) console.log("\nCurrent guild role list:");
	client.guilds.cache.get(guildID_test).roles.cache.forEach( role => {
		if (debugMode) console.log("Role ID: " + role.id + ", Role: " + role.name);

		// Initiate members kudo & info here. To specify further, revise logic here.

		if (role.name === "@everyone") {
			if (debugMode) console.log(`	Initiate members info: \n`);
			role.members.forEach(member => {
				if (debugMode) console.log(`	${member.user.id}: ${member.user.username}`);
				try {
					kudoMemberData.createUser(member.user.id, member.user.username);
				} catch (err) {
					console.log(err);
				}

			});
		}

		// Populate admin list here.
		// TODO: revised role name here. 
		if (role.name === "testRole1") {
			if (debugMode) console.log(`	Admin under ${role.name} :`);
			role.members.forEach(member => {
				if (debugMode) console.log(`	${member.user.id}: ${member.user.username}`);
				kudoAdminData.assignAdmin(member.user.id); member.user.id
			});
		}
	});
	
	// TODO: transfer guild data to kudoAdmin?

	// kudoAdminData.setGuildID(client.guilds.cache.keys().next().value); // id => kudoAdminData
	// kudoAdminData.setGuildData(client.guilds.cache.get(guildID));  // guild => kudoAdminData 
	
	// Initialize userMap
	userMap = kudoMemberData.getUserMap();

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

		case `${prefix}kudoAdmin`:
			if (kudoAdminData.isAdmin(message.author.id))
				return message.channel.send(handleKudoAdminReturn(messageArray, message.author.id));
			else return message.channel.send("Permission Denied: Please contact admin.");
		
		case `${prefix}thumbupTest`:
			return message.react('👍');	
		
		case `${prefix}kudos`:
			return message.channel.send(handleEndorseReturn(messageArray, message.author.id));

		case `${prefix}prize`:
			return message.channel.send(handlePrizeReturn(messageArray, message.author.id));

		case `${prefix}kudoDesc`:
			return message.channel.send(handleKudoDescReturn(messageArray, message.author.id));

		case `${prefix}displayInfo`:
			if (kudoAdminData.isAdmin(message.author.id)) 
				if (messageArray[1] === "all") {
					// TODO: print more formatted list and replace getData method.
					return message.author.send(JSON.stringify(kudoMemberData.getData()));
				}
				else return message.channel.send("Not a valid command, do you mean: \n/displayInfo all");
			else return message.channel.send("Permission Denied: Please contact admin.");

		case `${prefix}help`:
			// Check premission
			if (kudoAdminData.isAdmin(message.author.id))
				return message.channel.send(
					`
Current Available:
/kudoAdmin 
	--assignAdmin <@User>
	--rmAdmin <@User>
/kudoPt 
	--get <@User> 
	--add <@User> <Add Pt>
	--set <@User> <Set Pt>
	--reset <@User>
/thumbupTest
/kudos <@User> <Description>
/kudoDesc
	--checkRev <mine/@User>
	--checkSend <mine/@User>
	--check
/displayInfo <all>
/prize
	--checklist
	--claim <PrizeEnum>
				`);
			else return message.channel.send(
				`
Current Available:
/kudoPt 
	--get <@User> 
/thumbupTest
/kudos <@User> <Description>
/kudoDesc
	--check
/prize
	--checklist
	--claim <PrizeEnum>
				`);
		default:
			return message.channel.send("Undefined action. Try /help for more available options.");
	}
});

function handleKudoDescReturn(inputMessage, authorID){

	// TODO: debug
	return "只今工事中"

	if (!inputMessage[1])
		return "error: please enter valild arguments";

	switch (inputMessage[1]) {
		case "check":
			return kudoDescData.checkRev(authorID, userMap) + '\n' + kudoDescData.checkSend(authorID, userMap);

		case "checkRev":
			if (!inputMessage[2])
				return "error: please enter valild arguments";
			return kudoDescData.checkRev(inputMessage[2].slice(2, -1), userMap);

		case "checkSend":
			if (!inputMessage[2])
				return "error: please enter valild arguments";
			return kudoDescData.checkSend(inputMessage[2].slice(2, -1), userMap);

		default:
			return "Not a valid command, do you mean: \n/kudoAdmin assignAdmin <@User>\n" +
				"/kudoAdmin rmAdmin <@User>\n";
	}
}

function handleKudoAdminReturn(inputMessage, authorID) {
	if (debugMode) console.log("\n\033[1;34mAdmin Command: \033[0m" + inputMessage[1] + " by user " + authorID+".");
	
	if (!inputMessage[1] || !inputMessage[2])
		return "error: please enter valild arguments";

	var targetID = inputMessage[2].slice(2, -1);

	switch (inputMessage[1]) {
		case "assignAdmin":
			return kudoAdminData.assignAdmin(targetID);

		case "rmAdmin":
			return kudoAdminData.rmAdmin(targetID);

		default:
			return "Not a valid command, do you mean: \n/kudoAdmin assignAdmin <@User>\n" +
				"/kudoAdmin rmAdmin <@User>\n";
	}
}

function handleEndorseReturn(inputMessage, authorID) {
	// Important: primary key for user database is currently based on user id.
	if (debugMode) console.log(inputMessage);

	if(!inputMessage[1] || !inputMessage[2])
	return "error: please enter valild arguments";

	var targetID = inputMessage[1].slice(2, -1);
	if (targetID === authorID) return "Sorry, you cannot endorse yourself.";
	
	// TODO: next case need kudoDesc methods.
	return kudoMemberData.addUserPt(targetID, 1) + kudoDescData.addDesc(authorID, targetID, inputMessage[2]);
}

function handlePrizeReturn(inputMessage, authorID) {
	// Important: primary key for user database is currently based on user id.
	if (debugMode) console.log(inputMessage);

	if (!inputMessage[1])
		return "error: please enter valild arguments";

	switch (inputMessage[1]) {
		case "checklist":
			// TODO: show formatted string
			return JSON.stringify(prizeData);
	
		case "claim":
			if (!inputMessage[2])
				return "error: please enter valild arguments";
			else if(!prizeData[inputMessage[2]])
				return `error: Item not in prize list. Please recheck.`;
			else {
				let ret = kudoMemberData.deductUserPt(authorID, prizeData[inputMessage[2]].value);
				if (typeof(ret) === "string") return ret;
				return `Claim msg prize "${prizeData[inputMessage[2]].name}" has been sent to admin. Remaining Pts: ${ret}.`;
			}

		default:
			return `Not a valid command, do you mean: \n/prize checklist\n/prize claim <PrizeEnum>`;
	}
}

function handleKudoPtReturn(inputMessage, authorID) {
	if (!inputMessage[2])
		return "error: please enter a valid user name";

	var targetID = inputMessage[2].slice(2, -1);
	//console.log(targetID);

	switch (inputMessage[1]) {
		case "get":
			return kudoMemberData.getUserPt(targetID);
		
		case "add":
			if (kudoAdminData.isAdmin(authorID))
				return kudoMemberData.addUserPt(targetID, inputMessage[3]);
				
			if(!inputMessage[3])
				return "error: please enter desired Pt number.";
				 
			return "Permission Denied: Please contact admin.";

		case "set":
			if (kudoAdminData.isAdmin(authorID)) 
				return kudoMemberData.setUserPt(targetID, inputMessage[3]);

			if (!inputMessage[3])
				return "error: please enter desired Pt number.";
				 
			return "Permission Denied: Please contact admin.";

		case "reset":
			//console.log(kudoAdminData.getData());
			console.log(kudoAdminData.isAdmin(authorID));
			if (kudoAdminData.isAdmin(authorID)) 
				return kudoMemberData.setUserPt(targetID, 0);  // TODO: return a notification instead of fixed 0 number

			return "Permission Denied: Please contact admin.";
	
		default:
			if (kudoAdminData.isAdmin(authorID))
				return "Not a valid command, do you mean: \n/kudoPt get <@User>\n" +
					"/kudoPt reset <@User>\n" + // Admin
					"/kudoPt add <@User> <Add Pt>\n" + // Admin
					"/kudoPt set <@User> <Set Pt>"; // Admin
			else return "Not a valid command, do you mean: \n/kudoPt get <@User>";
	}
}

client.login(botconfig.token);