const discord = require("discord.js");		//npm install discord.js
const botconfig = require("./botconfig.json");


const client = new discord.Client({disableEveryone: true});

client.on("ready", async() => {
	client.user.setActivity("劫，剑姬，刀妹");
});

client.on("message", async message => {
	console.log(message);
	if(message.author.bot) return;
	if(message.channel.type === "dm") return;
	
	let messageArray = message.content.split(" ");
	let cmd = messageArray[0];
	let args = messageArray.slice(1);
	
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

client.login(botconfig.token);