# kudobot-discord
Prerequiste:
1. Set up a discord bot following <a href="https://discordpy.readthedocs.io/en/latest/discord.html">instruction</a> in the first part, save your token.
2. Inivite your bot to your discord server, take note of the server id.
3. Create a Role for the server named KudoBotAdmin, server members added to this role will become bot admin. (This should be done before booting up the bot.)

Setup Instructions (AWS EC2):
1. Prepare an AWS EC2 instance, clone this repo to your instance.
2. Navigate to the root directory of repo, add your token to botconfig.json : token; set serverId to your server's id.
3. Get node at lease ver. 12.x, to check your node ver., run:
```
sudo node -v
```
If your node ver. is less than 12.x, clean up old node, run the following:
```
sudo apt update
sudo apt -y upgrade
sudo apt -y install curl dirmngr apt-transport-https lsb-release ca-certificates
curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
sudo apt -y install nodejs
sudo apt -y  install gcc g++ make
```
4. Install npm and required node packages:
```
sudo apt-get install npm
sudo npm init
sudo npm install discord.js
sudo npm install express
sudo npm install fs
sudo npm install -g pm2
```
5. Start bot:
```
sudo pm2 start index.js
```
Your bot should now start successfully, you can test it by typing /help inside text channel in your server. <br />
<br />
Notes:
1. Configure prize list in database/kudoPrize.json, sample format:
```
{"1":{
    "name": "PS4 Pro",
    "value": 300
},
"2":{
    "name": "Logitech G815 RGB Mechanical Keyboard",
    "value": 150
}}
```
2. The following are configurable in botconfig.json:
```
kudoAmount: number of times that each person can give out kudo per refresh time unit
prefix: bot trigger prefix
kudoSendPt: amount of points that one can get from sending a kudo
kudoRevPt: amount of points that one can get from receiving a kudo
kudoDescMinimal: minimum length of kudo description
refreshTime: how many time units(see below) before refreshing available kudo times
refreshTimeUnit: available units {MINUTE, HOUR, DAY, WEEK, MONTH}
```
To report a problem, file tickets at <a href="http://ec2-54-162-48-11.compute-1.amazonaws.com/">our ticket portal</a>.