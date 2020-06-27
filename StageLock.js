class StageLock {
  constructor() {
	  this.locks = [];
  }
  // Getter
  get getLocks(){
	return this.locks;
  }
  
  acquire(owner, stage) {
	  stage = parseInt(stage);
	  return this.getLock(owner).stage == stage;
  }
  
  releaseAndIncr(owner){
	  var cur = this.findLock(owner);
	  if(!cur)
		  return;
	  
	  this.removeLock(owner);
	  cur.stage++;
	  this.locks.push(cur);
  }
  
  release(owner){
	  this.removeLock(owner);
  }
  
  //helper
  getLock(owner) {
	  return this.findLock(owner) || this.addLock(owner);
  }
  
  addLock(owner) {
	this.locks.push({"owner": owner, "stage": 0});
	return {"owner": owner, "stage": 0};
  }
  
  findLock(owner) {
	  return this.locks.find(x => (x.owner === owner));
  }
  
  removeLock(owner) {
	  this.locks = this.locks.filter(x => (x.owner !== owner));
  }
}

module.exports = StageLock