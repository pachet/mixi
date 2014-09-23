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

		function mixiContinue() {
			if (!advanced) {
				advanced = true;
				advance();
			}
		}

		self.continue = mixiContinue;

		result = methods[index].apply(self, args);

		mixiContinue();
	}

	advance();

	this.continue = null;

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

function cleanConstructors(set) {
	var index = set.length;

	while (index--) {
		if (set[index].is_mixi_constructor) {
			set.splice(index, 1);
			continue;
		}
	}
}

function mergeMethods(prototype, target, source) {
	var key,
		source_set,
		target_set,
		index,
		result,
		subindex;

	for (key in source) {
		source_set = source[key];
		target_set = target[key];

		if (!target_set) {
			target[key] = source_set.slice(0);
			prototype[key] = createAlias(key);
			continue;
		}

		index = source_set.length;
		result = [ ];

		while (index--) {
			if (target_set.indexOf(source_set[index]) !== -1) {
				continue;
			}

			result.unshift(source_set[index]);
		}

		target[key] = result.concat(target_set);
	}
}

function createAlias(key) {
	return function abstracted() {
		return this.mixi(key, arguments);
	};
}

function merge(prototype, methods, source, constructor) {
	var key,
		value,
		target;

	if (source.mixi_methods) {
		mergeMethods(prototype, methods, source.mixi_methods);
	}

	for (key in source) {

		if (key === 'mixi_methods') {
			continue;
		}

		if (source.mixi_methods && source.mixi_methods[key]) {
			continue;
		}

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

		if (typeof prototype[key] === 'function' && prototype[key] !== value) {
			if (!methods[key]) {
				methods[key] = [prototype[key]];
				prototype[key] = createAlias(key);
			}

			if (methods[key].indexOf(value) === -1) {
				methods[key].push(value);
			}
		} else {
			prototype[key] = value;
		}
	}

	if (constructor && methods.construct.indexOf(constructor) === -1) {
		methods.construct.push(constructor);
	}
}

function mixiExtend() {
	var args = Array.prototype.slice.call(arguments);
	args.unshift(this);

	return mixi.apply(this, args);
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

	if (methods.construct) {
		cleanConstructors(methods.construct);
	}

	prototype.mixi_methods = methods;

	function MixiConstructor() {
		return this.mixi('construct', toArray(arguments));
	}

	MixiConstructor.mixi = MixiConstructor.extend = mixiExtend;

	MixiConstructor.is_mixi_constructor = true;
	MixiConstructor.prototype = prototype;

	return MixiConstructor;
}

module.exports = mixi;
