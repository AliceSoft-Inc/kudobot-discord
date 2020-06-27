// TODO: further test
const kudoMemberData = require("./KudoMemberDataInstance.js"); //kudo member
const {Worker, parentPort} = require('worker_threads');
const botconfig = require("./botconfig.json");

var current = new Date();
var nextEvent, delay;

switch (botconfig.refreshTimeUnit) {
    case "DAY":
        nextEvent = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1, 0, 0, 0);
        break;

    default: // DAY
        nextEvent = new Date(current.getFullYear(), current.getMonth(), current.getDate() + 1, 0, 0, 0);
        break;
}

console.log(`Refresh Timer set on ${current}. First timeout delay: ${nextEvent-current}`);
var timer = setTimeout(refreshRoutine, nextEvent - current);

function refreshRoutine() {
    var userMap = kudoMemberData.getUserMap();
    Object.keys(userMap).forEach(id => kudoMemberData.refresh(id, userMap[id]));
    clearTimeout(timer);
    timer = setTimeout(refreshRoutine, botconfig.refreshTime);
    resetTimestamp();
}

function resetTimestamp () {
    current = new Date();
    nextEvent = new Date(current.getFullYear(),current.getMonth(),current.getDate()+1,0,0,0);
}

// TODO: add lock?
onmessage = function(message) {
    resetTimestamp();
    
}