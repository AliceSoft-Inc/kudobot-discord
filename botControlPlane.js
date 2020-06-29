const discord = require("discord.js");		//npm install discord.js
const { Worker, isMainThread, MessageChannel } = require('worker_threads');
const msg = require("./resource/botReturnMessageResource.js");
const kudoDescData = require("./KudoDescDataInstance.js"); //kudo desc
const kudoAdminData = require("./KudoAdminDataInstance.js"); //kudo admin
const kudoMemberData = require("./KudoMemberDataInstance.js"); //kudo member
const prizeData = require('./database/kudoPrize.json'); 
const botconfig = require("./botconfig.json");
const help = require("./resource/botHelp.js"); // /help text

const client = new discord.Client({disableEveryone: true});
const refreshThread = new Worker("./refresh.js");

const debugMode = botconfig.debug;  // Debug flag
const prefix = botconfig.prefix;

const Lock = require("./StageLock.js");
let lock = new Lock(); //Lock

// Global cache (TODO: find a better solution)
var userMap;
var guildID = botconfig.serverId; // TODO: currently hard coded for test server. When release, replace all guildID to guildID.

client.on("ready", async() => {
	client.user.setActivity(client.guilds.cache.get(guildID).name, { type: 'WATCHING'});
	
	if (debugMode) console.log("\nFirst guild ID in cache: " + client.guilds.cache.keys().next().value); // Get guild ID here. For current usage, we only handle first guild.
	// guildID = client.guilds.cache.keys().next().value;
	
	if (debugMode) console.log("\nCurrent guild role list:");

	client.guilds.cache.get(guildID).roles.cache.forEach( role => {
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
		if (role.name === botconfig.adminRole) {
			if (debugMode) console.log(`	Admin under ${role.name}:`);
			role.members.forEach(member => {
				if (debugMode) console.log(`	${member.user.id}: ${member.user.username}`);
				kudoAdminData.assignAdmin(member.user.id); 
			});
		}
	});
	
	// Initialize userMap
	userMap = kudoMemberData.getUserMap();

});

client.on("message", async message => {
	// console.log(message);

	if(message.author.bot) {
		console.log("\nNew msg handler: Bot message. Ignore.");
		return;
	}

	if (message.channel.type === "dm") 
		console.log("\nNew msg handler: \033[1;34mDM message\033[0m. From " + message.author.username);
	else if(!message.guild.available || message.guild.id !== guildID) {
		console.log("\nNew msg handler: Not from target guild. Ignore.");
		return;
	}
	else console.log("\nNew msg handler: Message received from server: \033[1;34m" + message.guild.name + "\033[0m");

	if (debugMode) console.log(
		"Sender: \033[1;31m" + message.author.username + "\033[0m" +
		"\nSenderID: " + message.author.id +
		"\nPermission: " + (kudoAdminData.isAdmin(message.author.id)? "Admin":"User") +
		"\nContent: \"" + message.content + "\""
	)

	// If content is null, a new user has come in to the channel.
	// TODO: handle existing user cases
	if(!message.content && !message.attachments.size) {
		kudoMemberData.refresh(message.author.id, message.author.username);
		userMap = kudoMemberData.getUserMap();
		return message.channel.send(`New user ${message.author.username}: (${message.author.id}) has successfully been added to member databse.`);
	}

	let messageArray = message.content.split(/\s+/); // split by multiple spaces
	let cmd = messageArray[0];

	if (!kudoAdminData.isAdmin(message.author.id) && message.channel.type === "dm") {
		if (lock.acquire(message.author.id, 0))
			if (cmd === `${prefix}kudo`){
				if (debugMode) console.log("DM interface: Has been triggered! Now message are passing to dm interface.");
				lock.releaseAndIncr(message.author.id);
			}
			else {
				if (debugMode) console.log(`DM interface: Has not been triggered. Ignore current msg.`);
				return message.channel.send(`Invalid command or action timed out. Type ${prefix}kudo to get started`);;
			}
			
		return nonAdminDMinterface(messageArray, message.author.id, message.channel);
	}
	else if(cmd[0] !== prefix) {
		console.log("Msg Handler: Not a vaild command. Ignore.");
		return;
	}

	if (message.mentions.users.size > 1) {
		return message.channel.send(`Please mention at most one target per command.`);
	}

	if (debugMode) console.log(`Public interface: received command ${cmd}`);
	refreshThread.postMessage("reset timer");

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

		case `${prefix}prize`:
			return message.channel.send(handlePrizeReturn(messageArray, message.author.id));
			break;

		case `${prefix}kudoDesc`:
			return message.channel.send(handleKudoDescReturn(messageArray, message.author.id));
			break;
		
		case `${prefix}displayInfo`:
			if (kudoAdminData.isAdmin(message.author.id)) 
				if (messageArray[1] === "all") {
					return message.author.send(printMemberList());
				}
				else return message.channel.send(`Not a valid command, do you mean: \n${prefix}displayInfo all`);
			else return message.channel.send(msg.permissionDeniedMsg);
			break;

		case `${prefix}kudo`:
			if (messageArray.length == 1)
				// Help menu. Check premission
				if (kudoAdminData.isAdmin(message.author.id))
					return message.channel.send(help.helpMenu_admin);
				else return message.channel.send(help.helpMenu_public);
			else 
				if (debugMode) return message.channel.send(handleEndorseReturn(messageArray, message.author.id));
				else {
					let ret = handleEndorseReturn(messageArray, message.author.id);
					if (ret === msg.confirmed) return message.react('👍');
					else message.channel.send(ret);
				}
			break;

		default:
			// return message.channel.send(`Undefined action. Try ${prefix}kudo for more available options.`);
			break;
	}
});

function handleKudoDescReturn(inputMessage, authorID){
	if (!inputMessage[1])
		return msg.invalidArgsMsg;

	switch (inputMessage[1]) {
		case "check":
			if (inputMessage[2] === "mine" || !inputMessage[2])
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
			if (kudoAdminData.isAdmin(authorID))
				return `Not a valid command, do you mean: 
${prefix}kudoDesc check [mine/@User]
${prefix}kudoDesc checkRev <@User>
${prefix}kudoDesc checkRev <@User>`;
			else return `Not a valid command, do you mean: \n${prefix}kudoDesc check`;
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
			console.log(kudoAdminData.getAdminList().length);
			if (kudoAdminData.getAdminList().length == 1)
				return "Operation Rejected: Currently you are the last admin on list. Removal operation will be dismissed unless there is other admin available."
			else return kudoAdminData.rmAdmin(targetID);
			break;


		default:
			return `Not a valid command, do you mean: 
${prefix}kudoAdmin assignAdmin <@User>
${prefix}kudoAdmin rmAdmin <@User>`;
			break;
	}
}

function handleEndorseReturn(inputMessage, authorID) {
	// Important: primary key for user database is currently based on user id.
	if (debugMode) console.log(inputMessage);

	// TODO: ugly code
	if (inputMessage[1] === "num") return kudoMemberData.getUserKudo(authorID);

	if(!inputMessage[1] || !inputMessage[2])
	return msg.invalidArgsMsg;
	
	if (!validUserID(inputMessage[1]))
		return msg.invalidUserIptMsg;

	var targetID = inputMessage[1].slice(2, -1);
	if (targetID === authorID) return "Sorry, you cannot endorse yourself.";

	if (inputMessage[2].length < botconfig.kudoDescMinimal) 
		return `Minimal length for a comment is ${botconfig.kudoDescMinimal} characters. You now have ${inputMessage[2].length} characters. Try to write a bit more to your friend!`;
	
	// Both sender and receiver can get pts.
	// TODO: better error handling here.
	let ret1 = kudoMemberData.addUserPt(targetID, botconfig.kudoRevPt);
	if (typeof (ret1) === "string") return ret1;

	ret1 = kudoMemberData.addUserPt(authorID, botconfig.kudoSendPt);
	if (typeof (ret1) === "string") return ret1;

	let ret2 = kudoMemberData.deductUserKudo(authorID);
	if (typeof (ret2) === "string") return ret2;

	if (debugMode) 
		return `targetID: ${targetID}, status: ${kudoDescData.addDesc(authorID, targetID, inputMessage[2])}, author pt: ${ret1}, author kudo: ${ret2}.`;
	
	let ret3 = kudoDescData.addDesc(authorID, targetID, inputMessage[2]);

	return ret3 === msg.successful ? msg.confirmed : ret3;
}

function handlePrizeReturn(inputMessage, authorID) {
	// Important: primary key for user database is currently based on user id.

	if (!inputMessage[1])
		return msg.invalidArgsMsg;

	switch (inputMessage[1]) {
		case "checklist":
			return printPrizeList();
	
		case "claim":
			if (!inputMessage[2])
				return msg.invalidArgsMsg;
			else if(!prizeData[inputMessage[2]])
				return `error: Item not in prize list. Please recheck.`;
			else {
				let ret = kudoMemberData.deductUserPt(authorID, prizeData[inputMessage[2]].value);
				if (typeof(ret) === "string") return ret;
				kudoAdminData.getAdminList().forEach(id => client.users.resolve(id).send(`User ID: ${authorID}, User Name: ${userMap[authorID]}, Claimed prize: "${prizeData[inputMessage[2]].name}" at ${Date().toString()}`));
				return `Claim msg for prize "${prizeData[inputMessage[2]].name}" has been sent to admin. Remaining Pts: ${ret}.`;
			}

		default:
			return `Not a valid command, do you mean: \n${prefix}prize checklist\n${prefix}prize claim <PrizeEnum>`;
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
			return `User ${userMap[authorID]} currently has ${kudoMemberData.getUserPt(targetID)} points.`;
		
		case "add":
			if (!inputMessage[3])
				return msg.invalidArgsMsg;

			if (kudoAdminData.isAdmin(authorID))
				return `User ${userMap[authorID]} currently has ${kudoMemberData.addUserPt(targetID, inputMessage[3])} points.`;
				
			return msg.permissionDeniedMsg;

		case "set":
			if (!inputMessage[3])
				return msg.invalidArgsMsg;
	
			if (kudoAdminData.isAdmin(authorID)) 
				return `User ${userMap[authorID]} currently has ${kudoMemberData.setUserPt(targetID, inputMessage[3])} points.`;
				 
			return msg.permissionDeniedMsg;

		case "reset":
			if (kudoAdminData.isAdmin(authorID)) 
				return `User ${userMap[authorID]} has been reset to ${kudoMemberData.setUserPt(targetID, 0)} points.`;

			return msg.permissionDeniedMsg;
	
		default:
			if (kudoAdminData.isAdmin(authorID))
				return `Not a valid command, do you mean: 
${prefix}kudoPt get [@User]
${prefix}kudoPt reset <@User>
${prefix}kudoPt add <@User> <Add Pt>
${prefix}kudoPt set <@User> <Set Pt>` ;
			else return `Not a valid command, do you mean: \n${prefix}kudoPt get`;
	}
}


function nonAdminDMinterface(inputMessage, authorID, channel) {
	if(!lock.acquire(authorID, 1))
		return;

	if (debugMode) console.log(`DM interface: received message "${inputMessage}".`);

	refreshThread.postMessage("reset timer");

	switch (inputMessage[0]) {
		case `${prefix}kudo`:
			// This is for "/kudo X" shortcut. When add cases, revise these lines.
			if(inputMessage[1] > 0 && inputMessage[1] < 7) {
				return nonAdminDMinterface(inputMessage[1], authorID, channel);
			}

			return channel.send(help.helpMenu_DM);
			break;

		case `${prefix}cancel`:
			return sendAndResolveStage(channel, authorID, msg.cancelled);
	
		case "1":
			return sendAndResolveStage(channel, authorID, `Your current kudo points: ${kudoMemberData.getUserPt(authorID)}`);
			break;

		case "2":
			if (!kudoMemberData.getUserKudo(authorID))
				return sendAndResolveStage(channel, authorID, msg.negativeKudoMsg);

			let userList = 'Select your kudo target:\n';
			let userNameList = Object.values(userMap);
			let userIDList = Object.keys(userMap);
			
			for (let i = 0; i < userNameList.length; i++) {
				if(userNameList[i] === userMap[authorID]) {
					userNameList.splice(i, 1);
					userIDList.splice(i, 1);
					i--;
					continue;
				}
				userList += `${i+1}.   ${userNameList[i]}\n`;
			};
			lock.releaseAndIncr(authorID);
			
			return channel.send(userList)
				.then(() => {
					if(!lock.acquire(authorID, 2))
						return;

					let msgFilter = msg => (((msg.content[0] < userNameList.length + 1) && (msg.content[0] > 0) && (msg.content.length <= 2)) || msg.content === `${prefix}cancel`) && msg.author.id === authorID;
					channel.awaitMessages(msgFilter, { maxProcessed: 3, max: 1, time: 60000, errors: ['processedLimit', 'time'] }).then((collected) => {
						if (collected.first().content === `${prefix}cancel`) return sendAndResolveStage(channel, authorID, msg.cancelled);
						let option = collected.first().content - 1;
						lock.releaseAndIncr(authorID);
						channel.send(`Please leave your comments here. To cancel, reply \"${prefix}cancel\".`)
						.then(() => {
							if(!lock.acquire(authorID, 3)) return;

							channel.awaitMessages(msg => msg.content !== `${prefix}cancel`, { maxProcessed: 1, max: 1, time: 60000, errors: ['processedLimit', 'time'] })
							.then((collected) => {
								sendAndResolveStage(channel, authorID, handleEndorseReturn(['/kudo', `<@${userIDList[option]}>`, collected.first().content] ,authorID));
							})
							.catch((err) => {
								sendAndResolveStage(channel, authorID, `This kudo is canceled.`);
							});
						});
					})
						.catch((err) => {
							sendAndResolveStage(channel, authorID, `Sorry, either wrong input or time has reach limit. Please try again.`)
						});
				});
			break;

		case "3":
			return sendAndResolveStage(channel, authorID, `You can still give ${kudoMemberData.getUserKudo(authorID)} kudos to others today!`);
			break;

		case "4":
			return sendAndResolveStage(channel, authorID, `These are your received kudos: \n${kudoDescData.checkRev(authorID, userMap)}`);
			break;

		case "5":
			return sendAndResolveStage(channel, authorID, `These are your sent kudos: \n${kudoDescData.checkSend(authorID, userMap)}`);
			break;

		// TODO: further test
		case "6":
			lock.releaseAndIncr(authorID);
			return channel.send(`${printPrizeList()}\nYou current available kudo points: ${kudoMemberData.getUserPt(authorID)}\nReply an option index to claim!`)
				.then(() => {
					if(!lock.acquire(authorID, 2))
						return;

					let msgFilter = msg => (((msg.content[0] in prizeData) && (msg.content.length <= 2)) || msg.content === `${prefix}cancel`) && msg.author.id === authorID;
					channel.awaitMessages(msgFilter, { maxProcessed: 3, max: 1, time: 60000, errors: ['processedLimit', 'time']}).then((collected)=>{
						if (debugMode) console.log('DM interface: awaitMessages resolved!');
						if (collected.first().content === `${prefix}cancel`) return sendAndResolveStage(channel, authorID, msg.cancelled);
						let option = collected.first().content;
						lock.releaseAndIncr(authorID);

						channel.send(`Are you sure to claim ${prizeData[option].name}? \n    1. Yes\n    2. No`)
						.then((message) => {
							if (!lock.acquire(authorID, 3))
								return;

							let filter = msg => (msg.content === `${prefix}cancel`) || (msg.content.length === 1 && msg.content < 3 && msg.content > 0);
							channel.awaitMessages(filter, { maxProcessed: 3, max: 1, time: 60000, errors: ['processedLimit', 'time'] })
							.then((collected) => {
								if (debugMode) console.log('DM interface: awaitReactions resolved!');
								if (collected.first().content === `${prefix}cancel` || collected.first().content === "2") return sendAndResolveStage(channel, authorID, msg.cancelled);

								let ret = kudoMemberData.deductUserPt(authorID, prizeData[option].value);
								if (typeof (ret) === "string") return sendAndResolveStage(channel, authorID, ret);
								kudoAdminData.getAdminList().forEach(id => client.users.resolve(id).send(`User ID: ${authorID}, User Name: ${userMap[authorID]}, Claimed prize: "${prizeData[option].name}" at ${Date().toString()}`));
								sendAndResolveStage(channel, authorID, `Successfully claimed prize "${prizeData[option].name}"! Message has been sent to admin. Remaining Pts: ${ret}.`);
							})
							.catch((err) => {
								sendAndResolveStage(channel, authorID, `Confirmation Failed: Claim cancelled.`);
							});
						});
						
						// channel.send(`Are you sure to claim ${prizeData[option].name}? Just react a 😄 to confirm!`)
						// .then((message)=>{
						// 	if(!lock.acquire(authorID, 3))
						// 		return;

						// 	let rctFilter = (reaction, user) => reaction.emoji.name === '😄' && user.id === authorID;
						// 	message.awaitReactions(rctFilter, { max: 1, maxEmojis: 1, time: 15000, errors: ['time','emojiLimit']})
						// 	.then(() => {
						// 		if (debugMode) console.log('DM interface: awaitReactions resolved!');
						// 		let ret = kudoMemberData.deductUserPt(authorID, prizeData[option].value);
						// 		if (typeof (ret) === "string") return sendAndResolveStage(channel, authorID, ret);
						// 		kudoAdminData.getAdminList().forEach(id => client.users.resolve(id).send(`User ID: ${authorID}, User Name: ${userMap[authorID]}, Claimed prize: "${prizeData[option].name}" at ${Date().toString()}`));
						// 		sendAndResolveStage(channel, authorID, `Successfully claimed prize "${prizeData[option].name}"! Message has been sent to admin. Remaining Pts: ${ret}.`);
						// 	})
						// 	.catch((err) => {
						// 		sendAndResolveStage(channel, authorID, `Reaction Failed: Claim cancelled.`);
						// 	});
						// });
					})
					.catch((err) => {
						sendAndResolveStage(channel, authorID, `Sorry, either wrong input or time has reached limit. Please try again.`)
					});
				});
			break;

		default:
			break;
	}
}

function validUserID(inputMessage) {
	return (inputMessage.slice(0, 2) === "<@") && (inputMessage.slice(-1) === ">");
}

function printPrizeList() {
	let retString = 'Prize List:\n';
	Object.keys(prizeData).forEach(e => retString += `    ${e}.	${prizeData[e].name} 	= 	${prizeData[e].value} pts\n`);
	return retString;
}

function printMemberList() {
	let retString = 'Member List: \n';
	let members = kudoMemberData.getUserMap();
	Object.keys(members).forEach(e => retString += `${members[e]}(${e}): \n    	permission: ${kudoAdminData.isAdmin(e)?"Admin":"User"},	kudo: ${kudoMemberData.getUserKudo(e)},	pt: ${kudoMemberData.getUserPt(e)}\n`);
	return retString;
}

function sendAndResolveStage(channel, authorID, message){
	lock.release(authorID); 
	channel.send(message);
}

client.login(botconfig.token);
