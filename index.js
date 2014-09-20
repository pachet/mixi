function toArray(args) {
	return Array.prototype.slice.call(args);
}

function mixiBreak() {
	this.mixi_broken = true;
}

function dispatch(key, args) {
	var methods = this.mixi_methods[key],
		index = methods.length,
		result,
		self = this;

	this.mixi_broken = false;

	function advance() {
		index--;

		if (index < 0 || self.mixi_broken) {
			return;
		}

		var advanced = false;

		self.continue = function mixiContinue() {
			if (!advanced) {
				advanced = true;
				advance();
			}
		};

		result = methods[index].apply(self, args);

		self.continue();
	}

	advance();

	return result || this;
}

function isPrimitive(value) {
	if (!value) {
		return true;
	}

	var type = typeof value;

	if (type === 'string' || type === 'number' || type === 'boolean') {
		return true;
	}

	return false;
}

function isArray(value) {
	return Object.prototype.toString.call(value) === '[object Array]';
}

function flatten(target, source) {
	return [ ].concat(target, source);
}

function clone(object) {
	var result = { },
		key;

	for (key in object) {
		result[key] = object[key];
	}

	return result;
}

function combine(target, source) {
	var result = clone(target),
		key;

	for (key in source) {
		result[key] = source[key];
	}

	return result;
}

function merge(prototype, methods, source, constructor) {
	var key,
		value,
		target;

	for (key in source) {
		value = source[key];
		target = prototype[key];

		if (typeof value !== 'function') {
			if (target === undefined || isPrimitive(value) || isPrimitive(target)) {
				prototype[key] = value;
			} else if (isArray(value) && isArray(target)) {
				prototype[key] = flatten(target, value);
			} else {
				prototype[key] = combine(target, value);
			}

			continue;
		}

		if (typeof prototype[key] === 'function') {
			if (!methods[key]) {
				methods[key] = [prototype[key]];
				prototype[key] = (function closure(key) {
					return function abstracted() {
						dispatch.call(this, key, arguments);
					};
				})(key);
			}

			methods[key].push(value);
		} else {
			prototype[key] = value;
		}
	}

	if (constructor) {
		methods.construct.push(constructor);
	}
}

function mixi() {
	var args = toArray(arguments),
		prototype = { },
		methods = { construct: [ ] },
		index = 0,
		arg;

	while (index < args.length) {
		arg = args[index];

		if (typeof arg === 'function') {
			merge(prototype, methods, arg.prototype, arg);
		} else {
			merge(prototype, methods, arg);
		}

		index++;
	}

	prototype.mixi = dispatch;
	prototype.break = mixiBreak;
	prototype.mixi_methods = methods;

	function MixiConstructor() {
		return this.mixi('construct', toArray(arguments));
	}

	MixiConstructor.prototype = prototype;

	return MixiConstructor;
}

module.exports = mixi;
