const botconfig = require("../botconfig.json");

const helpMenu_admin = 
`
Current Available:
${botconfig.prefix}kudoAdmin 
	--assignAdmin <@User>
	--rmAdmin <@User>
${botconfig.prefix}kudoPt 
	--get [@User] 
	--add <@User> <Add Pt>
	--set <@User> <Set Pt>
	--reset <@User>
${botconfig.prefix}kudo <@User> <Comment>
${botconfig.prefix}kudo num
${botconfig.prefix}kudoDesc
	--checkRev <@User>
	--checkSend <@User>
	--check [mine/@User]
${botconfig.prefix}displayInfo <all>
${botconfig.prefix}prize
	--checklist
	--claim <PrizeEnum>
${botconfig.prefix}refresh <@User>
`;

const helpMenu_public =
`
Current Available:
${botconfig.prefix}kudoPt get
${botconfig.prefix}kudo <@User> <Comment>
${botconfig.prefix}kudo num
${botconfig.prefix}kudoDesc check
${botconfig.prefix}prize
	--checklist
	--claim <PrizeEnum>
`;

const helpMenu_DM = 
`
Hi😆! This is kudo bot. You can choose following options here:
1. Check my current kudo points.
2. Give kudo to others.
3. Check my current available kudo times.
4. Check my received kudos.
5. Check my sent kudos.
6. I want to claim a prize.

To terminate, just type "${botconfig.prefix}cancel" at any time!
`;

module.exports = {
	helpMenu_public,
	helpMenu_DM,
    helpMenu_admin
}