const helpMenu_admin = 
`
Current Available:
/kudoAdmin 
	--assignAdmin <@User>
	--rmAdmin <@User>
/kudoPt 
	--get [@User] 
	--add <@User> <Add Pt>
	--set <@User> <Set Pt>
	--reset <@User>
/kudos <@User> <Description>
/kudos num
/kudoDesc
	--checkRev <@User>
	--checkSend <@User>
	--check <mine/@User>
/displayInfo <all>
/prize
	--checklist
	--claim <PrizeEnum>
/refresh <@User>
`;

const helpMenu_public =
`
Current Available:
/kudoPt get
/kudos <@User> <Description>
/kudos num
/kudoDesc check <mine>
/prize
	--checklist
	--claim <PrizeEnum>
`;

const helpMenu_DM = 
`
Hi! This is kudo bot. You can choose following options here:
1. Check my current kudo points.
2. Give kudo to others.
3. Check my current available kudo times.
4. Check my received kudos.
5. Check my sent kudos.
6. I want to claim a prize.
`;

module.exports = {
	helpMenu_public,
	helpMenu_DM,
    helpMenu_admin
}