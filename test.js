var mixi = require('./index');

function twoConstructors(test) {
	function Foo(x, y, z) {
		test.equals(x, 5);
		test.equals(y, 6);
		test.equals(z, 7);
	}

	Foo.prototype.baz = function baz(object) {
		test.equals(object.count, 1);
	};

	function Bar(x, y, z) {
		test.equals(x, 5);
		test.equals(y, 6);
		test.equals(z, 7);
	}

	Bar.prototype.baz = function baz(object) {
		test.equals(object.count, 0);
		object.count++;
	};

	var Constructor = mixi(Foo, Bar);

	var instance = new Constructor(5, 6, 7);

	instance.baz({
		count: 0
	});

	test.done();
}

function threeConstructors(test) {
	function Foo(object, string) {
		test.equals(object.count, 2);
		test.equals(string, 'good');
	}

	function Bar(object, string) {
		test.equals(object.count, 1);
		test.equals(string, 'good');
		object.count++;
	}

	function Baz(object, string) {
		test.equals(object.count, 0);
		test.equals(string, 'good');
		object.count++;
	}

	var Constructor = mixi(Foo, Bar, Baz);

	var instance = new Constructor({ count: 0 }, 'good');

	test.done();
}

function constructorAndObject(test) {
	function Foo(pokemon) {
		test.equals(pokemon, 'pikachu');
	}

	Foo.prototype.baz = function baz(object) {
		test.equals(object.count, 1);
	};

	var bar = {
		baz: function baz(object) {
			test.equals(object.count, 0);
			object.count++;
		}
	};

	var Constructor = mixi(Foo, bar);

	var instance = new Constructor('pikachu');

	instance.baz({
		count: 0
	});

	test.done();
}

function onlyObjects(test) {
	var foo = {
		wat: function wat(object) {
			test.equals(object.count, 2);
			test.equals(this.venusaur, 'venusaur');
			test.equals(this.name, 'baz');
		},
		venusaur: 'venusaur',
		name: 'foo'
	};

	var bar = {
		wat: function wat(object) {
			test.equals(object.count, 1);
			test.equals(this.charizard, 'charizard');
			test.equals(this.name, 'baz');
			object.count++;
		},
		charizard: 'charizard',
		name: 'bar'
	};

	var baz = {
		wat: function wat(object) {
			test.equals(object.count, 0);
			test.equals(this.blastoise, 'blastoise');
			test.equals(this.name, 'baz');
			object.count++;
		},
		blastoise: 'blastoise',
		name: 'baz'
	};

	var Constructor = mixi(foo, bar, baz);

	var instance = new Constructor();

	instance.wat({
		count: 0
	});

	test.done();
}

function breaking(test) {
	var count = 0;

	var foo = {
		baz: function baz() {
			count++;
		}
	};

	var bar = {
		baz: function baz() {
			count++;
			this.break();
		}
	};

	var Constructor = mixi(foo, bar);

	var instance = new Constructor();

	instance.baz();
	test.equals(count, 1);
	test.done();
}

function continuing(test) {
	var count = 0;

	var foo = {
		baz: function baz() {
			count++;
		}
	};

	var bar = {
		baz: function baz() {
			count++;
			this.continue();
			test.equals(count, 2);
			test.done();
		}
	};

	var Constructor = mixi(foo, bar);

	var instance = new Constructor();

	instance.baz();
}

module.exports = {
	twoConstructors: twoConstructors,
	threeConstructors: threeConstructors,
	constructorAndObject: constructorAndObject,
	onlyObjects: onlyObjects,
	breaking: breaking,
	continuing: continuing
};
