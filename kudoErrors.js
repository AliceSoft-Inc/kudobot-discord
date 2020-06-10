
class ValueError extends Error {
    constructor(message) {
        super(message)
        this.name = this.constructor.name;
    }
}

class ObjectError extends Error {
    constructor(message) {
        super(message)
        this.name = this.constructor.name;
    }
}

module.exports = {
    ValueError: ValueError,
    ObjectError: ObjectError
}  