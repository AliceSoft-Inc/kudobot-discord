// TODO: setTimeout has max INT32 limit. 
// For now we expect active user will trigger the reset within 24 days, 
// or the refreshRoutine will time out every 24 days.
const kudoMemberData = require("./KudoMemberDataInstance.js"); //kudo member
const {Worker, parentPort} = require('worker_threads');
const botconfig = require("./botconfig.json");

var current, nextEvent, delay;
resetTimestamp(); // initialize

console.log(`Refresh Timer set on ${current}. Next routine ${nextEvent}. First timeout delay: ${delay}`);
var timer = setTimeout(refreshRoutine, (delay < 0x7FFFFFFF) ? delay : 0x7FFFFFFF);

function refreshRoutine() {
    var userMap = kudoMemberData.getUserMap();
    Object.keys(userMap).forEach(id => kudoMemberData.refresh(id, userMap[id]));
    clearTimeout(timer);
    resetTimestamp();
    timer = setTimeout(refreshRoutine, (delay < 0x7FFFFFFF) ? delay : 0x7FFFFFFF);
    if (botconfig.debug) console.log(`Worker: Refresh routine has just completed.`);
}

function resetTimestamp () {
    current = new Date();
    switch (botconfig.refreshTimeUnit) {
        case "MINUTE":
            nextEvent = new Date(current.getFullYear(), current.getMonth(), current.getDate(), current.getHours(), current.getMinutes() + botconfig.refreshTime, 0);
            break;

        case "HOUR":
            nextEvent = new Date(current.getFullYear(), current.getMonth(), current.getDate(), current.getHours() + botconfig.refreshTime, 0, 0);
            break;

        case "WEEK":
            nextEvent = new Date(current.getFullYear(), current.getMonth(), current.getDate() + botconfig.refreshTime*7, 0, 0, 0);
            break;

        case "MONTH":
            nextEvent = new Date(current.getFullYear(), current.getMonth() + botconfig.refreshTime, 1, 0, 0, 0);
            break;

        case "DAY":
        default: // DAY
            nextEvent = new Date(current.getFullYear(), current.getMonth(), current.getDate() + botconfig.refreshTime, 0, 0, 0);
            break;
    }
    delay = nextEvent - current;
    parentPort.postMessage(delay);
}

function resetDelay () {
    current = new Date();
    delay = nextEvent - current;
    parentPort.postMessage(delay);
}

parentPort.on('message', (message) => {
    if (botconfig.debug) console.log(`Worker: msg received from parent. Action: ${message.action}`);
    switch (message.action) {
        case "Reset timer":
            clearTimeout(timer);
            resetTimestamp();
            timer = setTimeout(refreshRoutine, (delay < 0x7FFFFFFF) ? delay : 0x7FFFFFFF);
            if (botconfig.debug) console.log(`Worker: Timer reset. New delay: ${delay}`);
            break;
        
        case "Reset delay":
        default:
            clearTimeout(timer);
            resetDelay();
            timer = setTimeout(refreshRoutine, (delay < 0x7FFFFFFF) ? delay : 0x7FFFFFFF);
            if (botconfig.debug) console.log(`Worker: Delay reset. New delay: ${delay}`);
            break;
    }
});