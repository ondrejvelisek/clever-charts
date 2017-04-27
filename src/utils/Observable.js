/**
 * @class
 * Observable class, handles binding and firing events
 * @param {Array} events list of events for this observable
 */
class Observable {
    /**
     * @param {Array} events
     */
    constructor(events = []) {
        // create a map of handlers where each event has an array of bound handlers
        this._handlers = events.reduce((acc, cur)=>{
            acc[cur] = [];
            return acc;
        },{});
    }

	/**
	 * Bind event
	 * @param {String} event event name
	 * @param {Function} handler event handler
	 */
    on(event, handler) {
        if (!(event in this._handlers)) throw "No such event: " + event;
		this._handlers[event].push(handler);
		return this;
    }

	/**
	 * @private
	 * Fire widget event
	 * @param {String} event event name
	 * @param {Function} handler event handler
	 */
	fire(event, ctx, scope) {
		if (!(event in this._handlers)) throw "No such event: " + event;
		var handlers = this._handlers[event];
		for (var i = 0; i < handlers.length; i++) {
			handlers[i].call(this, ctx);
		}
		return this;
    }
}
export {Observable}