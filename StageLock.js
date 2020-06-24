class StageLock {
  constructor() {
	  this.locks = [];
  }
  // Getter
  get getLocks(){
	return this.locks;
  }
  
  acquire(owner, writer, stage) {
	  stage = parseInt(stage);
	  return this.getLock(owner, writer).stage == stage;
  }
  
  releaseAndIncr(owner, writer){
	  var cur = this.findLock(owner, writer);
	  if(!cur)
		  return;
	  
	  this.removeLock(owner, writer);
	  cur.stage++;
	  this.locks.push(cur);
  }
  
  release(owner, writer){
	  this.removeLock(owner, writer);
  }
  
  //helper
  getLock(owner, writer) {
	  return this.findLock(owner, writer) || this.addLock(owner, writer);
  }
  
  addLock(owner, writer) {
	this.locks.push({"owner": owner, "writer": writer, "stage": 1});
	return {"owner": owner, "writer": writer, "stage": 1};
  }
  
  findLock(owner, writer) {
	  return this.locks.find(x => (x.owner === owner && x.writer === writer));
  }
  
  removeLock(owner, writer) {
	  this.locks = this.locks.filter(x => (x.owner !== owner && x.writer !== writer));
  }
}

module.exports = StageLock