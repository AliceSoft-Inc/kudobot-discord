# kudobot-discord
Prerequiste:
1. Set up a discord bot following <a href="https://discordpy.readthedocs.io/en/latest/discord.html">instruction</a> in the first part, save your token.
2. Inivite your bot to your discord server, take note of the server id

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
Your bot should now start successfully, you can test it by typing /help inside text channel in your server.
If anything went wrong, file a ticket to <a href="http://ec2-54-162-48-11.compute-1.amazonaws.com/">our ticket portal</a>