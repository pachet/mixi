### Overview

**mixi** is a library that enables the easy composition of constructors from other constructors/objects, like so:

`````js
function Foo() { }
Foo.prototype.a = 'venusaur';

function Bar() { }
Bar.prototype.b = 'blastoise';

var baz = {
	c: 'charizard'
};

var Constructor = mixi(Foo, Bar, baz);

var instance = new Constructor();

console.log(instance.venusaur, instance.blastoise, instance.charizard);

// prints:
// "venusaur", "blastoise", "charizard"
`````

**mixi** creates a new constructor, merging the prototypes of the constructors you pass in to create the new constructor's consolidated prototype.
If you pass in objects, those objects are merged into the result, as well.

However, interesting things happen if you pass in objects that share the same key:

### Functions
If two or more supplied arguments share a function property, **mixi** will create a new wrapper function that calls each shared property sequentially, in the opposite order from how they were passed in.
`````js
var foo = {
	fn: function fn() {
		console.log('last');
	}
};

var bar = {
	fn: function fn() {
		console.log('first');
	}
};

var instance = new (mixi(foo, bar));

instance.fn();

// prints:
// "first"
// "last"
`````

### Objects
If two or more supplied arguments share an object property, **mixi** will merge these objects into a new object and assign it as the value of the shared key.
`````js
var foo = {
	object: {
		x: 1,
		y: 2
	}
};

var bar = {
	object: {
		x: 3,
		z: 4
	}
};

var instance = new (mixi(foo, bar));

console.log(instance.object);

// prints:
// "{ x: 3, y: 2, z: 4 }"
`````

### Arrays
If two or more supplied arguments share an array property, **mixi** will flatten these arrays and store the flattened array as the value of the shared key.
`````js
var foo = {
	array: [ 1, 2 ]
};

var bar = {
	array: [ 3, 4 ]
};

var instance = new (mixi(foo, bar));

console.log(instance.array);

// prints:
// "[ 1, 2, 3, 4]"
`````

**mixi** has a couple more tricks for dealing with invocation order of merged functions:

### .break()
When a merged function is being executed, a `.break` function property exists on the execution context. Calling `.break()` will stop any remaining sibling functions for the current key from being executed:
`````js
var foo = {
	baz: function baz() {
		// this will never be called
		console.log('last');
	}
};

var bar = {
	baz: function baz() {
		console.log('first');
		this.break();
	}
};

var instance = new (mixi(foo, bar));

instance.baz();

// prints:
// "first"
`````

### .continue()
When a merged function is being executed, a `.continue` function property exists on the execution context. Calling `.continue()` will immediately advance to the next wrapped sibling function for the current key:
`````js
var foo = {
	baz: function baz() {
		console.log('last');
	}
};

var bar = {
	baz: function baz() {
		this.continue();
		console.log('first');
	}
};

var instance = new (mixi(foo, bar));

instance.baz();

// prints:
// "last"
// "first"
`````
