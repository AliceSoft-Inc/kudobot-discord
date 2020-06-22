// TODO: further test
const kudoMemberData = require("./KudoMemberDataInstance.js"); //kudo member
const {Worker, parentPort} = require('worker_threads');

var current = new Date();
var nextDay = new Date(current.getFullYear(),current.getMonth(),current.getDate()+1,0,0,0);

console.log(`Refresh Timer set on ${current}. First timeout delay: ${nextDay-current}`);
var timer = setTimeout(refreshRoutine, nextDay - current);

function refreshRoutine() {
    var userMap = kudoMemberData.getUserMap();
    Object.keys(userMap).forEach(id => kudoMemberData.refresh(id, userMap[id]));
    clearTimeout(timer);
    timer = setTimeout(refreshRoutine, 1000*60*60*24);
    resetTimestamp();
}

function resetTimestamp () {
    current = new Date();
    nextDay = new Date(current.getFullYear(),current.getMonth(),current.getDate()+1,0,0,0);
}

// TODO: add lock?
onmessage = function(message) {
    resetTimestamp();
    
}