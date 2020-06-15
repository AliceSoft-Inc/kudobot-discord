const helpMenu_admin = 
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

const helpMenu =
`
Current Available:
/kudoPt 
	--get <@User> 
/thumbupTest
/kudos <@User> <Description>
/kudos num
/kudoDesc
	--check <mine/@User>
/prize
	--checklist
	--claim <PrizeEnum>
`;

module.exports = {
    helpMenu,
    helpMenu_admin
}