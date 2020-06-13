//error
const invalidAmountMsg = "error: please enter a valid number for amount.";
const negativeBalanceMsg = "error: will result in a negative balance, rejected."
const userNotExistMsg = (id) => {return `error: User ${id} does not exist.`;};
const adminExistMsg = (id) => {return `error: Admin ${id} already existed.`;};
const userNotAdminMsg = (id) => {return `error: User ${id} is not under admin premission.`;};


//warning
const userAlreadyExistsMsg = (id) =>{return `Warning: User ${id} already exists.`;};

//info
const successful = "successful";
const adminAsignSuccessMsg = (id) => {return `Successfully assigned userID: ${id} as admin.`;};
const adminRemovalSuccessMsg = (id) => {return `Successfully removed userID: ${id} from admin.`;};
const userCreationSuccessMsg = (id, name) => {return `Successfully created user ${id}: ${name}.`;};
const kudoRevHeadlineMsg = (receiver) => {return `Kudos received by ${receiver}:\n`;};
const kudoRevBodyMsg = (sender, desc) => {return `Received from: ${sender}, Description: ${desc}\n`;};
const kudoSendHeadlineMsg = (sender) => {return `Kudos sent by ${sender}:\n`;};
const kudoSendBodyMsg = (receiver, desc) => {return `Sent to: ${receiver}, Description: ${desc}\n`;};
const totalCountMsg = (count) => {return `Total: ${count}\n`;};

module.exports = {
	successful,
	invalidAmountMsg,
	negativeBalanceMsg,
	userNotExistMsg,
	adminExistMsg,
	userNotAdminMsg,
	userAlreadyExistsMsg,
	adminAsignSuccessMsg,
	adminRemovalSuccessMsg,
	userCreationSuccessMsg,
	kudoRevHeadlineMsg,
	kudoRevBodyMsg,
	kudoSendHeadlineMsg,
	kudoSendBodyMsg,
	totalCountMsg
};