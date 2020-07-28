// error
const invalidAmountMsg = "error: Please enter a valid number for amount.";
const negativePtMsg = "You have insufficient points, you can earn more kudo points by receiving kudos from others. Keep up the good work!";
const userNotExistMsg = (id) => {return `error: User ${id} does not exist.`;};
const adminExistMsg = (id) => {return `Warning: Admin ${id} already existed.`;};
const userNotAdminMsg = (id) => {return `error: User ${id} is not under admin permission.`;};
// const negativeKudoMsg = "You can no longer give out more kudos today, please try again tomorrow!";

// errors with src
const invalidArgsMsg = (src) => {return `${src}: Please enter valid arguments.`};
const invalidUserIptMsg = (src) => {return `${src}: Please enter a valid username.`};
const permissionDeniedMsg = (src) => {return `${src}: Permission Denied - Please contact admin.`};

//warning
const userAlreadyExistsMsg = (id) =>{return `Warning: User ${id} already exists.`;};

//info
const successful = "successful";
const confirmed = "Action confirmed!";
const cancelled = "Operation cancelled!";
const adminAsignSuccessMsg = (id) => {return `Successfully assigned userID: ${id} as admin.`;};
const adminRemovalSuccessMsg = (id) => {return `Successfully removed userID: ${id} from admin.`;};
const userCreationSuccessMsg = (id, name) => {return `Successfully created user ${id}: ${name}.`;};
const userDeletionSuccessMsg = (id, name) => { return `Successfully deleted user ${id}: ${name}.`; };
const userNameChangedSuccessMsg = (id, oldname, newname) => { return `Successfully renamed ${oldname}(${id}) to ${newname}(${id}).`; };
const kudoRevHeadlineMsg = (receiver) => {return `Kudos received by ${receiver}:\n`;};
const kudoRevBodyMsg = (sender, desc,timestamp) => { return `Received from: ${sender}, Description: ${desc}, Time: ${timestamp.slice(0,-5)}\n`;};
const kudoSendHeadlineMsg = (sender) => {return `Kudos sent by ${sender}:\n`;};
const kudoSendBodyMsg = (receiver, desc, timestamp) => { return `Sent to: ${receiver}, Description: ${desc}, Time: ${timestamp.slice(0,-5)}\n`;};
const totalCountMsg = (count) => {return `Total: ${count}\n`;};

module.exports = {
	successful,
	confirmed,
	cancelled,
	invalidAmountMsg,
	negativePtMsg,
	// negativeKudoMsg,
	userNotExistMsg,
	adminExistMsg,
	userNotAdminMsg,
	invalidArgsMsg,
	invalidUserIptMsg,
	permissionDeniedMsg,
	userAlreadyExistsMsg,
	adminAsignSuccessMsg,
	adminRemovalSuccessMsg,
	userCreationSuccessMsg,
	userDeletionSuccessMsg,
	userNameChangedSuccessMsg,
	kudoRevHeadlineMsg,
	kudoRevBodyMsg,
	kudoSendHeadlineMsg,
	kudoSendBodyMsg,
	totalCountMsg
};