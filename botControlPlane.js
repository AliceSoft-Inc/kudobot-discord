const discord = require("discord.js");		//npm install discord.js
const botconfig = require("./botconfig.json");
const help = require("./resource/botHelp.js"); // /help text
const msg = require("./resource/botReturnMessageResource.js");
const kudoDescData = require("./KudoDescDataInstance.js"); //kudo desc
const kudoAdminData = require("./KudoAdminDataInstance.js"); //kudo admin
const kudoMemberData = require("./KudoMemberDataInstance.js"); //kudo member

const prizeData = require('./database/KudoPrize.json'); 

const guildID_test = '719042359651729418'; // TODO: currently hard coded for test server. 

const client = new discord.Client({disableEveryone: true});

const debugMode = true;  // Debug flag

// Global cache (TODO: find a better solution)
var userMap;

client.on("ready", async() => {
	client.user.setActivity(client.guilds.cache.get(guildID_test).name, { type: 'WATCHING'});
	
	if (debugMode) console.log("\nFirst guild ID in cache: " + client.guilds.cache.keys().next().value); // Get guild ID here. For current usage, we only handle first guild.

	if (debugMode) console.log("\nCurrent guild role list:");

	client.guilds.cache.get(guildID_test).roles.cache.forEach( role => {
		if (debugMode) console.log(`	Role ID: ${role.id}, Role: ${role.name}\n`);

		// Initiate members kudo & info here. To specify further, revise logic here.

		if (role.name === "@everyone") {
			if (debugMode) console.log(`Initiate members info: \n`);
			role.members.forEach(member => {
				if (debugMode) console.log(`	${member.user.id}: ${member.user.username}`);
				kudoMemberData.createUser(member.user.id, member.user.username);
			});
		}

		// Populate admin list here.
		// TODO: revised role name here. 
		if (role.name === "testRole1") {
			if (debugMode) console.log(`	Admin under ${role.name}:`);
			role.members.forEach(member => {
				if (debugMode) console.log(`	${member.user.id}: ${member.user.username}`);
				kudoAdminData.assignAdmin(member.user.id); 
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

	if (message.channel.type === "dm") {
		console.log("\nNew msg handler: \033[1;34mDM message\033[0m. From " + message.author.username);
		if (kudoAdminData.isAdmin(message.author.id)) 
			return message.channel.send("Sorry, currently dm message will be ignored for all non-admin users.");
	}
	else if(!message.guild.available) {
		console.log("\nNew msg handler: Source server unavailable. Ignore.");
		return;
	}
	else console.log("\nNew msg handler: Message received from server: \033[1;34m" + message.guild.name + "\033[0m");

	if (debugMode) console.log(
		"Sender: \033[1;31m" + message.author.username + "\033[0m" +
		"\nSenderID: " + message.author.id +
		"\nContent: \"" + message.content + "\""
	)

	// If content is null, a new user has come in to the channel.
	// TODO: handle existing user cases
	if(!message.content) {
		kudoMemberData.refresh(message.author.id, message.author.username);
		userMap = kudoMemberData.getUserMap();
		return message.channel.send(`New user ${message.author.username}: (${message.author.id}) has successfully been added to member databse.`);
	}
	
	let prefix = botconfig.prefix;
	let messageArray = message.content.split(/\s+/); // split by multiple spaces
	let cmd = messageArray[0];

	if(cmd[0] !== prefix) {
		console.log("Handler: Not a vaild command. Ignore.");
		return;
	}

	// cmd swich panel
	switch (cmd) {
		case `${prefix}kudoPt`:
			return message.channel.send(handleKudoPtReturn(messageArray, message.author.id));
			break;

		case `${prefix}kudoAdmin`:
			if (kudoAdminData.isAdmin(message.author.id))
				return message.channel.send(handleKudoAdminReturn(messageArray, message.author.id));
			else return message.channel.send(msg.permissionDeniedMsg);
			break;

		case `${prefix}refresh`:
			if(!messageArray[1]) 
				return message.channel.send(msg.invalidArgsMsg);
			else if (!validUserID(messageArray[1]))
				return message.channel.send(msg.invalidUserIptMsg);
			
			var targetID = messageArray[1].slice(2, -1);

			if (kudoAdminData.isAdmin(message.author.id)){
				kudoMemberData.refresh(targetID, userMap[targetID]);
				return message.channel.send(`User ${userMap[targetID]} has been refreshed.`);
			}
			else return message.channel.send(msg.permissionDeniedMsg);
			break;
		
		// TODO: implement this method to success cases.
		case `${prefix}thumbupTest`:
			return message.react('👍');	
			break;
		
		case `${prefix}kudos`:
			return message.channel.send(handleEndorseReturn(messageArray, message.author.id));
			break;

		case `${prefix}prize`:
			return message.channel.send(handlePrizeReturn(messageArray, message.author.id));
			break;

		case `${prefix}kudoDesc`:
			return message.channel.send(handleKudoDescReturn(messageArray, message.author.id));
			break;

		case `${prefix}displayInfo`:
			if (kudoAdminData.isAdmin(message.author.id)) 
				if (messageArray[1] === "all") {
					// TODO: print more formatted list and replace getData method.
					return message.author.send(JSON.stringify(kudoMemberData.getData()));
				}
				else return message.channel.send("Not a valid command, do you mean: \n/displayInfo all");
			else return message.channel.send(msg.permissionDeniedMsg);
			break;

		case `${prefix}help`:
			// Check premission
			if (kudoAdminData.isAdmin(message.author.id))
				return message.channel.send(help.helpMenu_admin);
			else return message.channel.send(help.helpMenu);
			break;

		default:
			return message.channel.send("Undefined action. Try /help for more available options.");
			break;
	}
});

function handleKudoDescReturn(inputMessage, authorID){

	// TODO: debug
	if (!inputMessage[1] || !inputMessage[2])
		return msg.invalidArgsMsg;

	switch (inputMessage[1]) {
		case "check":
			if (inputMessage[2] === "mine")
				return kudoDescData.checkRev(authorID, userMap) + '\n' + kudoDescData.checkSend(authorID, userMap);
			else if (!validUserID(inputMessage[2])) return msg.invalidUserIptMsg;
			else return kudoDescData.checkRev(inputMessage[2].slice(2, -1), userMap) + "\n" 
				+ kudoDescData.checkSend(inputMessage[2].slice(2, -1), userMap);

		case "checkRev":
			if (!inputMessage[2])
				return msg.invalidArgsMsg;
			return kudoDescData.checkRev(inputMessage[2].slice(2, -1), userMap);

		case "checkSend":
			if (!inputMessage[2])
				return msg.invalidArgsMsg;
			return kudoDescData.checkSend(inputMessage[2].slice(2, -1), userMap);

		default:
			return "Not a valid command, do you mean: \n/kudoAdmin assignAdmin <@User>\n" +
				"/kudoAdmin rmAdmin <@User>\n";
	}
}

function handleKudoAdminReturn(inputMessage, authorID) {
	if (debugMode) console.log("\n\033[1;34mAdmin Command: \033[0m" + inputMessage[1] + " by user " + authorID+".");
	
	if (!inputMessage[1] || !inputMessage[2])
		return msg.invalidArgsMsg;

	if (!validUserID(inputMessage[2]))
		return msg.invalidUserIptMsg;

	var targetID = inputMessage[2].slice(2, -1);

	switch (inputMessage[1]) {
		case "assignAdmin":
			return kudoAdminData.assignAdmin(targetID);
			break;

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

	// TODO: ugly code
	if (inputMessage[1] === "num") return kudoMemberData.getUserKudo(authorID);

	if(!inputMessage[1] || !inputMessage[2])
	return msg.invalidArgsMsg;

	console.log(inputMessage[1].slice(0, 2));
	
	if (!validUserID(inputMessage[1]))
		return msg.invalidUserIptMsg;

	var targetID = inputMessage[1].slice(2, -1);
	if (targetID === authorID) return "Sorry, you cannot endorse yourself.";
	
	// TODO: Error handling
	let ret1 = kudoMemberData.addUserPt(targetID, 1);
	if (typeof (ret1) === "string") return ret1;

	let ret2 = kudoMemberData.deductUserKudo(authorID);
	if (typeof (ret2) === "string") return ret2;

	return targetID + " " + kudoDescData.addDesc(authorID, targetID, inputMessage[2]);
}

function handlePrizeReturn(inputMessage, authorID) {
	// Important: primary key for user database is currently based on user id.

	if (!inputMessage[1])
		return msg.invalidArgsMsg;

	switch (inputMessage[1]) {
		case "checklist":
			// TODO: show formatted string
			return JSON.stringify(prizeData);
	
		case "claim":
			if (!inputMessage[2])
				return msg.invalidArgsMsg;
			else if(!prizeData[inputMessage[2]])
				return `error: Item not in prize list. Please recheck.`;
			else {
				let ret = kudoMemberData.deductUserPt(authorID, prizeData[inputMessage[2]].value);
				if (typeof(ret) === "string") return ret;
				kudoAdminData.getAdminList().forEach(id => client.users.resolve(id).send(`User ID: ${authorID}, User Name: ${userMap[authorID]}, Claimed prize: "${prizeData[inputMessage[2]].name}" at ${Date().toString()}`));
				return `Claim msg prize "${prizeData[inputMessage[2]].name}" has been sent to admin. Remaining Pts: ${ret}.`;
			}

		default:
			return `Not a valid command, do you mean: \n/prize checklist\n/prize claim <PrizeEnum>`;
	}
}

function handleKudoPtReturn(inputMessage, authorID) {
	if (!inputMessage[2])
		inputMessage[2] = "<@"+authorID+">";
	else if (!kudoAdminData.isAdmin(authorID)) 
		return msg.permissionDeniedMsg;
	else if (!validUserID(inputMessage[2]))
		return msg.invalidUserIptMsg;

	var targetID = inputMessage[2].slice(2, -1);

	switch (inputMessage[1]) {
		case "get":
			return kudoMemberData.getUserPt(targetID);
		
		case "add":
			if (!inputMessage[3])
				return msg.invalidArgsMsg;

			if (kudoAdminData.isAdmin(authorID))
				return kudoMemberData.addUserPt(targetID, inputMessage[3]);
				
			return msg.permissionDeniedMsg;

		case "set":
			if (!inputMessage[3])
				return msg.invalidArgsMsg;
	
			if (kudoAdminData.isAdmin(authorID)) 
				return kudoMemberData.setUserPt(targetID, inputMessage[3]);
				 
			return msg.permissionDeniedMsg;

		case "reset":
			if (kudoAdminData.isAdmin(authorID)) 
				return kudoMemberData.setUserPt(targetID, 0);  // TODO: return a notification instead of fixed 0 number

			return msg.permissionDeniedMsg;
	
		default:
			if (kudoAdminData.isAdmin(authorID))
				return "Not a valid command, do you mean: \n/kudoPt get <@User>\n" +
					"/kudoPt reset <@User>\n" + // Admin
					"/kudoPt add <@User> <Add Pt>\n" + // Admin
					"/kudoPt set <@User> <Set Pt>"; // Admin
			else return "Not a valid command, do you mean: \n/kudoPt get";
	}
}

function validUserID(inputMessage) {
	return (inputMessage.slice(0, 2) === "<@") && (inputMessage.slice(-1) === ">");
}

client.login(botconfig.token);