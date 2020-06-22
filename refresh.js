// TODO: further test
const kudoMemberData = require("./KudoMemberDataInstance.js"); //kudo member
const {Worker, parentPort} = require('worker_threads');

var current = new Date();
var nextDay = new Date(current.getFullYear(),current.getMonth(),current.getDate()+1,0,0,0);

var timer = setTimeout(refreshRoutine, Date(nextDay - current));

function refreshRoutine() {
    var userMap = kudoMemberData.getUserMap();
    userMap.forEach((value,key) => kudoMemberData.refresh(key,value));
    clearTimeout(timer);
    timer = setTimeout(refreshRoutine, 1000*60*60*24);
    resetTimestamp();
}

function resetTimestamp () {
    current = new Date();
    nextDay = new Date(current.getFullYear(),current.getMonth(),current.getDate()+1,0,0,0);
}

onmessage = function(message) {
    resetTimestamp();
    
}