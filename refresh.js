// TODO: further test
const kudoMemberData = require("./KudoMemberDataInstance.js"); //kudo member
const {Worker, parentPort} = require('worker_threads');
const botconfig = require("./botconfig.json");

var current, nextEvent, delay;
resetTimestamp(); // initialize

console.log(`Refresh Timer set on ${current}. First timeout delay: ${delay}`);
var timer = setTimeout(refreshRoutine, delay);

function refreshRoutine() {
    var userMap = kudoMemberData.getUserMap();
    Object.keys(userMap).forEach(id => kudoMemberData.refresh(id, userMap[id]));
    clearTimeout(timer);
    resetTimestamp();
    timer = setTimeout(refreshRoutine, delay);
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

        case "MONTH":
            nextEvent = new Date(current.getFullYear(), current.getMonth() + botconfig.refreshTime, 1, 0, 0, 0);
            break;

        default: // DAY
            nextEvent = new Date(current.getFullYear(), current.getMonth(), current.getDate() + botconfig.refreshTime, 0, 0, 0);
            break;
    }
    delay = nextEvent - current;
}

// TODO: add lock?
parentPort.on('message', () => {
    if (botconfig.debug) console.log("Worker: msg received from parent.");
    clearTimeout(timer);
    resetTimestamp();
    timer = setTimeout(refreshRoutine, delay);
    if (botconfig.debug) console.log(`Worker: Timer reset. New delay: ${delay}`);
});