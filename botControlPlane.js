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

// Global cache
var lock = new Lock(); //Lock
var refreshDelay = 0; // in seconds
var userMap;
var guildID = botconfig.serverId;

client.on("ready", async() => {
	client.user.setActivity(client.guilds.cache.get(guildID).name, { type: 'WATCHING'});
	
	console.log("\n============= Bot Setup Start ===========");
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
				console.log(kudoMemberData.createUser(member.user.id, member.user.username)); 
			});
		}

		// Populate admin list here.
		if (role.name === botconfig.adminRole) {
			if (debugMode) console.log(`	Admin under ${role.name}:`);
			role.members.forEach(member => {
				if (debugMode) console.log(`	${member.user.id}: ${member.user.username}`);
				console.log(kudoAdminData.assignAdmin(member.user.id)); 
			});
		}
	});
	
	// Initialize userMap
	userMap = kudoMemberData.getUserMap();

	console.log("============= Bot Setup End ===========\n");

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

	refreshThread.postMessage({action: "Reset delay"});

	if (debugMode) console.log(
		"Sender: \033[1;31m" + message.author.username + "\033[0m" +
		"\nSenderID: " + message.author.id +
		"\nAuthor Permission: " + (kudoAdminData.isAdmin(message.author.id)? "Admin":"User") +
		"\nContent: \"" + message.content + "\""
	)

	// If content is null and no attachment with the msg, a new user has come in to the channel.
	// TODO: handle existing user cases
	if(!message.content && !message.attachments.size) {
		kudoMemberData.refresh(message.author.id, message.author.username);
		userMap = kudoMemberData.getUserMap();
		return message.channel.send(`New user ${message.author.username}: (${message.author.id}) has successfully been added to member databse.`);
	}

	let messageArray = message.content.split(/\s+/); // split by multiple spaces
	let cmd = messageArray[0];

	if (message.channel.type === "dm") {
		if (lock.acquire(message.author.id, 0))
			if (cmd === `${prefix}kudo`){
				if (debugMode) console.log("DM interface: Has been triggered! Now message are passing to dm interface.");
				lock.releaseAndIncr(message.author.id);
			}
			else {
				if (debugMode) console.log(`DM interface: Has not been triggered. Ignore current msg.`);
				return message.channel.send(`Invalid command or action timed out. Type ${prefix}kudo to get started`);;
			}
			
		return DMinterface(messageArray, message.author.id, message.channel);
	}
	else if(cmd[0] !== prefix) {
		console.log("Msg Handler: Not a vaild command. Ignore.");
		return;
	}

	if (debugMode) console.log(`Public interface: received command ${cmd}`);

	// cmd swich panel
	switch (cmd) {
		case `${prefix}kudoPt`:
			if (!mentionCheck(message,1)) return; 
			else return message.channel.send(handleKudoPtReturn(messageArray, message.author.id));
			break;

		case `${prefix}kudoAdmin`:
			if (kudoAdminData.isAdmin(message.author.id))
				if (!mentionCheck(message,1)) return; 
				else return message.channel.send(handleKudoAdminReturn(messageArray, message.author.id));
			else return message.channel.send(msg.permissionDeniedMsg("kudoAdmin"));
			break;

		case `${prefix}refresh`:
			if (kudoAdminData.isAdmin(message.author.id)){
				if (!mentionCheck(message,1)) return; 
				else if(!messageArray[1]) 
					return message.channel.send(msg.invalidArgsMsg("refresh"));
				else if (!validUserMention(messageArray[1]))
					return message.channel.send(msg.invalidUserIptMsg("refresh"));
				
				let targetID = retrieveUserID(messageArray[1]);

				kudoMemberData.refresh(targetID, userMap[targetID]);
				return message.channel.send(`User ${userMap[targetID]} has been refreshed.`);
			}
			else return message.channel.send(msg.permissionDeniedMsg("refresh"));
			break;
		
		// TODO: implement this method to success cases.
		case `${prefix}thumbupTest`:
			return message.react('👍');	
			break;

		case `${prefix}prize`:
			if (!mentionCheck(message,0)) return; 
			else return message.channel.send(handlePrizeReturn(messageArray, message.author.id));
			break;

		case `${prefix}kudoDesc`:
			if (!mentionCheck(message,1)) return; 
			else return message.channel.send(handleKudoDescReturn(messageArray, message.author.id));
			break;

		case `${prefix}kudoUser`:
			if (!mentionCheck(message,1)) return; 
			else return message.channel.send(handleKudoUserReturn(messageArray, message.author.id));
			break;
		
		case `${prefix}displayInfo`:
			if (kudoAdminData.isAdmin(message.author.id)) 
				if (messageArray[1] === "all") {
					return message.author.send(printMemberList());
				}
				else if (message.mentions.users.size){
					if (!mentionCheck(message,1)) return; 
					else if (!validUserMention(messageArray[1]))
						return message.channel.send(msg.invalidUserIptMsg("displayInfo"));
					let targetID = retrieveUserID(messageArray[1]);
					if (!userMap[targetID]) return message.channel.send(msg.userNotExistMsg(targetID));

					return message.channel.send(
						`${userMap[targetID]}(${targetID}):
    	permission: ${kudoAdminData.isAdmin(targetID) ? "Admin" : "User"},	kudo: ${kudoMemberData.getUserKudo(targetID)},	pt: ${kudoMemberData.getUserPt(targetID)}\n`);
				}
				else return message.channel.send(`Not a valid command, do you mean: \n${prefix}displayInfo <all/@User>`);
			else return message.channel.send(msg.permissionDeniedMsg("displayInfo"));
			break;

		case `${prefix}kudo`:
			if (messageArray.length == 1)
				// Help menu. Check premission
				if (kudoAdminData.isAdmin(message.author.id))
					return message.channel.send(help.helpMenu_admin);
				else return message.channel.send(help.helpMenu_public);
			else {
				// Get list for mentioned users. This is used for the multi-mention cases, might redesign someday.
				let mentionList = messageArray.slice(1, message.mentions.users.size+1);
				if (!mentionList.length) mentionList.push(messageArray[1]); // for `kudo remain` case. D*mn this line is too ugly

				// Remove other mentions. `handleEndorseReturn` only handles one mention at a time. 
				if (message.mentions.users.size > 1) {
					if (message.mentions.users.size > kudoMemberData.getUserKudo(message.author.id)) 
						return message.channel.send(`Sorry, you cannot give out these kudos because you are running out of available kudo tokens. You have ${kudoMemberData.getUserKudo(message.author.id)} tokens now.`);
					else messageArray.splice(2,message.mentions.users.size-1);
				}

				// Build up the description sentence. ** Redundant spaces will be removed. **
				for (let i = 3; i < messageArray.length; i++) messageArray[2] += " " + messageArray[i];

				// Go through mention list.
				let printCount = 0;
				for (let i = 0; i < mentionList.length; i++) {
					messageArray[1] = mentionList[i];
					if (debugMode) message.channel.send(handleEndorseReturn(messageArray, message.author.id));
					else {
						let ret = handleEndorseReturn(messageArray, message.author.id);
						if (ret !== msg.confirmed) {
							printCount++; 
							message.channel.send(ret);
						}
					}
				}

				if (debugMode) return;
				else if (!printCount) return message.react('👍');
				else if (message.mentions.users.size > 1) 
					return message.channel.send(`You have mentioned ${message.mentions.users.size} targets in this command. ${message.mentions.users.size - printCount} succeeded. ${printCount} issue(s) found.`);
				else return;
			}
				
			break;

		default:
			// return message.channel.send(`Undefined action. Try ${prefix}kudo for more available options.`);
			break;
	}
});

function handleKudoUserReturn(inputMessage, authorID) {
	if (!inputMessage[1] || !inputMessage[2])
		return msg.invalidArgsMsg("kudoUser");

	let targetID = retrieveUserID(inputMessage[2]);

	switch (inputMessage[1]) {
		case "rmUser":
			if (!validUserMention(inputMessage[2]))
				return msg.invalidUserIptMsg("kudoUser");

			if (!kudoAdminData.isAdmin(authorID)) return msg.permissionDeniedMsg("kudoUser");
			if (kudoAdminData.isAdmin(targetID)) return "Sorry, admin user cannot be removed.";
			return kudoMemberData.removeUser(targetID);
			break;
		
		case "rename":
			if (!inputMessage[3]) {
				// kudoUser rename <New Name>
				if (!validUserMention(inputMessage[2])) {
					targetID = authorID;
					inputMessage[3] = inputMessage[2];
				} 
				// kudoUser rename <@User> 
				else return "Please enter your new username."; // TODO: ->msgRes
			}

			// non-admin can only rename himself
			if (!kudoAdminData.isAdmin(authorID)) targetID = authorID;
			
			let ret =  kudoMemberData.editUsername(targetID,inputMessage[3]);

			// reset map
			userMap = kudoMemberData.getUserMap();

			return ret;
			break;

		default:
			if (kudoAdminData.isAdmin(authorID))
				return `Not a valid command, do you mean: 
${prefix}kudoUser rmUser [@User]
${prefix}kudoUser rename [@User] <New Name>`;
			else return `Not a valid command, do you mean: \n${prefix}kudoUser rename <New Name>`;
			break;
	}
}

function handleKudoDescReturn(inputMessage, authorID){
	if (!inputMessage[1])
		return msg.invalidArgsMsg("kudoDesc");

	let targetID = retrieveUserID(inputMessage[2]);

	switch (inputMessage[1]) {
		case "check":
			if (inputMessage[2] === "mine" || !inputMessage[2])
				return kudoDescData.checkRev(authorID, userMap) + '\n' + kudoDescData.checkSend(authorID, userMap);
			else if (!validUserMention(inputMessage[2])) return msg.invalidUserIptMsg("kudoDesc");
			else return kudoDescData.checkRev(targetID, userMap) + "\n" 
				+ kudoDescData.checkSend(targetID, userMap);

		case "checkRev":
			if (!inputMessage[2])
				return msg.invalidArgsMsg("kudoDesc");
			return kudoDescData.checkRev(targetID, userMap);

		case "checkSend":
			if (!inputMessage[2])
				return msg.invalidArgsMsg("kudoDesc");
			return kudoDescData.checkSend(targetID, userMap);

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
		return msg.invalidArgsMsg("kudoAdmin");

	if (!validUserMention(inputMessage[2]))
		return msg.invalidUserIptMsg("kudoAdmin");

	let targetID = retrieveUserID(inputMessage[2]);

	switch (inputMessage[1]) {
		case "assignAdmin":
			return kudoAdminData.assignAdmin(targetID);
			break;

		case "rmAdmin":
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
	// Important: primary key for user database is currently user id.
	if (debugMode) console.log(inputMessage);

	// TODO: ugly code
	if (inputMessage[1] === "remain") return printAvailableKudo(authorID);

	if(!inputMessage[1] || !inputMessage[2])
	return msg.invalidArgsMsg("kudo");
	
	if (!validUserMention(inputMessage[1]))
		return msg.invalidUserIptMsg("kudo");

	let targetID = retrieveUserID(inputMessage[1]);
	if (targetID === authorID) return "Sorry, you cannot endorse yourself.";

	if (inputMessage[2].length < botconfig.kudoDescMinimal) 
		return `Minimal length for a comment is ${botconfig.kudoDescMinimal} characters. You now have ${inputMessage[2].length} characters. Try to write a bit more to your friend!`;
	
	// Both sender and receiver can get pts.
	// TODO: better error handling here.
	let ret1 = kudoMemberData.addUserPt(targetID, botconfig.kudoRevPt);
	if (typeof (ret1) === "string") return ret1;

	ret1 = kudoMemberData.addUserPt(authorID, botconfig.kudoSendPt);
	if (typeof (ret1) === "string") {
		kudoMemberData.deductUserPt(targetID, botconfig.kudoRevPt);
		return ret1;
	}

	let ret2 = kudoMemberData.deductUserKudo(authorID);
	if (typeof (ret2) === "string") {
		kudoMemberData.deductUserPt(targetID, botconfig.kudoRevPt);
		kudoMemberData.deductUserPt(authorID, botconfig.kudoSendPt);
		return ret2;
	}

	if (debugMode) 
		return `targetID: ${targetID}, status: ${kudoDescData.addDesc(authorID, targetID, inputMessage[2])}, author pt: ${ret1}, author kudo: ${ret2}.`;
	
	// At this time, `kudoDescData.addDesc` should only return success.
	let ret3 = kudoDescData.addDesc(authorID, targetID, inputMessage[2]);

	if (ret3 === msg.successful) {
		client.users.resolve(targetID).send(`${userMap[authorID]} has just given you a kudo!
Kudo message: ${inputMessage[2]}
You've received ${botconfig.kudoRevPt} kudo points.
You now have ${kudoMemberData.getUserPt(targetID)} kudo points in total!`
		)
		.catch((e) => {
			console.log("\033[1;31mWarning:\033[0m Endorse Handler: Failed to DM target. But this action still got passed.");
			console.log(e);
		});

		return msg.confirmed;
	}

	return ret3;
}

function handlePrizeReturn(inputMessage, authorID) {
	// Important: primary key for user database is currently based on user id.

	if (!inputMessage[1])
		return msg.invalidArgsMsg("prize");

	switch (inputMessage[1]) {
		case "checklist":
			return printPrizeList();
	
		case "claim":
			if (!inputMessage[2])
				return msg.invalidArgsMsg("prize");
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
	// else if (!kudoAdminData.isAdmin(authorID)) 
	// 	return msg.permissionDeniedMsg("kudoPt");
	else if (!validUserMention(inputMessage[2]))
		return msg.invalidUserIptMsg("kudoPt");

	let targetID = retrieveUserID(inputMessage[2]);

	switch (inputMessage[1]) {
		case "get":
			let ret = kudoMemberData.getUserPt(targetID);
			if (typeof (ret) === "string") return ret;
			return `User ${userMap[targetID]} currently has ${ret} points.`;
		
		case "add":
			if (!inputMessage[3])
				return msg.invalidArgsMsg("kudoPt");

			if (kudoAdminData.isAdmin(authorID)) {
				let ret = kudoMemberData.addUserPt(targetID, inputMessage[3]);
				if (typeof (ret) === "string") return ret;
				return `Success: User ${userMap[targetID]} currently has ${ret} points.`;
			}
				
			return msg.permissionDeniedMsg("kudoPt");

		case "set":
			if (!inputMessage[3])
				return msg.invalidArgsMsg("kudoPt");
	
			if (kudoAdminData.isAdmin(authorID)) {
				let ret = kudoMemberData.setUserPt(targetID, inputMessage[3]);
				if (typeof (ret) === "string") return ret;
				return `Success: User ${userMap[targetID]} currently has ${ret} points.`;
			}
				 
			return msg.permissionDeniedMsg("kudoPt");

		case "reset":
			if (kudoAdminData.isAdmin(authorID)) {
				let ret = kudoMemberData.setUserPt(targetID, 0);
				if (typeof (ret) === "string") return ret;
				return `Success: User ${userMap[targetID]} has been reset to ${ret} points.`;
			}

			return msg.permissionDeniedMsg("kudoPt");
	
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

function DMinterface(inputMessage, authorID, channel) {
	if(!lock.acquire(authorID, 1))
		return;

	if (debugMode) console.log(`DM interface: received message "${inputMessage}".`);

	switch (inputMessage[0]) {
		case `${prefix}kudo`:
			// This is for "/kudo X" shortcut. When add cases, revise these lines.
			if(inputMessage[1] > 0 && inputMessage[1] < 9) {
				return DMinterface(inputMessage[1], authorID, channel);
			}

			if (kudoAdminData.isAdmin(authorID)) 
				channel.send(`For admin: This is non-admin interface. To access command line mode, go to public channel.`);

			return channel.send(help.helpMenu_DM);
			break;

		case `${prefix}cancel`:
			return sendAndResolveStage(channel, authorID, msg.cancelled);
		
		// Check my current kudo points.
		case "1":
			return sendAndResolveStage(channel, authorID, `Your current kudo points: ${kudoMemberData.getUserPt(authorID)}`);
			break;

		// Give kudo to others.
		case "2":
			if (!kudoMemberData.getUserKudo(authorID))
				return sendAndResolveStage(channel, authorID, printAvailableKudo(authorID));

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

		// Check my current available kudo times.
		case "3":
			return sendAndResolveStage(channel, authorID, printAvailableKudo(authorID));
			break;

		// Check my received kudos.
		case "4":
			return sendAndResolveStage(channel, authorID, `These are your received kudos: \n${kudoDescData.checkRev(authorID, userMap)}`);
			break;

		// Check my sent kudos.
		case "5":
			return sendAndResolveStage(channel, authorID, `These are your sent kudos: \n${kudoDescData.checkSend(authorID, userMap)}`);
			break;

		// I want to claim a prize.
		case "6":
			lock.releaseAndIncr(authorID);
			return channel.send(`${printPrizeList()}\nYou current available kudo points: ${kudoMemberData.getUserPt(authorID)}\nReply an option index to claim!`)
				.then(() => {
					if(!lock.acquire(authorID, 2)) return;

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
						
						// Reaction Trigger. Aborted design, may reuse in future
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

		// Show admin list.
		case "7":
			return sendAndResolveStage(channel, authorID, printAdminList());
			break;

		// I want to rename my username.
		case "8":
			lock.releaseAndIncr(authorID);
			return channel.send(`Please enter your new username: `)
				.then(() => {
					if (!lock.acquire(authorID, 2)) return;

					channel.awaitMessages(msg => msg.content !== `${prefix}cancel`, { maxProcessed: 1, max: 1, time: 60000, errors: ['processedLimit', 'time'] })
						.then((collected) => {
							sendAndResolveStage(channel, authorID, handleKudoUserReturn(['/kudoUser', `rename`, collected.first().content], authorID));
						})
						.catch((err) => {
							sendAndResolveStage(channel, authorID, `Sorry, time has reached limit. Please try again.`);
						});
				});
			break;

		default:
			break;
	}
}

/**
* Returns userID from a user mention format string. 
*/
function retrieveUserID(inputMessage) {
	let userID = inputMessage.slice(2, -1);
	// Users with nickname
	if (userID.startsWith('!')) userID = userID.slice(1);
	return userID;
}

/**
* Returns a boolean whether `inputMessage` is in a valid user mention format. 
*/
function validUserMention(inputMessage) {
	return (inputMessage.startsWith('<@') && inputMessage.endsWith('>'));
}

/**
* An info printer to print prize data in a list. 
*/
function printPrizeList() {
	let retString = 'Prize List:\n';
	if (!Object.keys(prizeData).length) return retString += `Currently no prize available.\n`;
	Object.keys(prizeData).forEach(e => retString += `    ${e}.	${prizeData[e].name} 	= 	${prizeData[e].value} pts\n`);
	return retString;
}

/**
* An info printer to print all members in a list. 
*/
function printMemberList() {
	let retString = 'Member List: \n';
	let members = kudoMemberData.getUserMap();
	Object.keys(members).forEach(e => retString += `${members[e]}(${e}): \n    	permission: ${kudoAdminData.isAdmin(e)?"Admin":"User"},	kudo: ${kudoMemberData.getUserKudo(e)},	pt: ${kudoMemberData.getUserPt(e)}\n`);
	return retString;
}

/**
* An info printer to print all admins in a list. 
*/
function printAdminList(){
	let retString = 'Admin List: \n';
	let admins = kudoAdminData.getAdminList();
	admins.forEach(e => retString += `${userMap[e]} (${e})\n`);
	return retString;
}

/**
* An info printer to print available kudo and next refresh schedule with given userID. 
*/
function printAvailableKudo(authorID) {
	let period, ret;
	switch (botconfig.refreshTimeUnit) {
		case "MINUTE":
			period = Math.ceil(refreshDelay/(60));
			ret = `${period} ${(period > 1) ? "minutes" : "minute"}`;
			break;
		case "HOUR":
			period = Math.ceil(refreshDelay/(60*60));
			ret = `${period} ${(period > 1) ? "hours" : "hour"}`;
			break;
		case "WEEK":
			period = Math.ceil(refreshDelay/(60*60*7));
			ret = `${period} ${(period > 1) ? "weeks" : "week"}`;
			break;
		case "MONTH":
			ret = `${botconfig.refreshTime} ${(botconfig.refreshTime > 1) ? "months" : "next month"}`;
			break;
		case "DAY":
		default:
			period = Math.ceil(refreshDelay/(60*60*24));
			ret = `${period} ${(period > 1) ? "days" : "day"}`;
			break;
	}
	
	return `You currently can give ${kudoMemberData.getUserKudo(authorID)} kudos to others. Limit will be reset in ${ret}.`;
}

/**
* Release current stage lock and send the message to the channel.
*/
function sendAndResolveStage(channel, authorID, message){
	lock.release(authorID); 
	channel.send(message);
}

/**
* Returns a boolean whether the mentions list is within `limit` or not for the input `message`. 
* If false, an error message will be sent to the message channel.
*/
function mentionCheck(message, limit) {
	if (message.mentions.users.size > limit) {
		message.channel.send(`Please mention at most ${limit} target(s) for this command.`);
		return false;
	}

	return true;
}

refreshThread.on('message', (delay) => {
	if (debugMode) console.log(`BCP Thread: New Delay received from refreshThread: ${delay}.`);
    refreshDelay = delay / 1000;  
});

client.login(botconfig.token);
