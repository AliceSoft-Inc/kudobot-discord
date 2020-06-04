

const botconfig = require("./botconfig.json");
const Discord = require("discord.js");

const bot = new Discord.Client({disableEveryone: true});

bot.on("ready", async() => {
	console.log(`${bot.user.username} 是真的傻屌`);
	bot.user.setGame("快乐风男");
});

bot.on("message", async message => {
	console.log(message);
	if(message.author.bot) return;
	if(message.channel.type === "dm") return;
	
	let prefix = botconfig.prefix;
	let messageArray = message.content.split(" ");
	let cmd = messageArray[0];
	let args = messageArray.slice(1);
	let helpcommand = botconfig.helptext;
	
	
	if(cmd === `${prefix}shadiao`){
		return message.channel.send("你可真傻屌。");
	}else if(cmd === `${prefix}help`){
		return message.channel.send(helpcommand);
	}else if(cmd === "-play"){
		return message.channel.send("咋地，能放音乐了不起啊");
	}
});

bot.login(botconfig.token);