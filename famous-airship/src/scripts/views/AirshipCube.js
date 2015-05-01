var View = require('famous/core/View');
var ContainerSurface = require('famous/surfaces/ContainerSurface');
var Transform = require('famous/core/Transform');
var Modifier = require('famous/core/Modifier');
var GenericSync = require('famous/inputs/GenericSync');
var MouseSync = require('famous/inputs/MouseSync');
var ScrollSync = require('famous/inputs/ScrollSync');
var TouchSync = require('famous/inputs/TouchSync');
var EventHandler = require('famous/core/EventHandler');
var Easing = require('famous/transitions/Easing');
var Timer = require('famous/utilities/Timer');
var TransitionableTransform = require('famous/transitions/TransitionableTransform');
var Cube = require('./Cube');
var __ = require('underscore');

function FamousCube() {
	View.apply(this, arguments);

	var initialTime = Date.now();
	var _root = new View();
	var _child;
	var i;
	var mod;
	var cube;
	var trans;
	var dimensions = [50, 50, 50];
	var DURATION_PLACE_BLOCK = 1;
	/**
	 * F
	 */
	var famousMod = [];

	var createCube = function (x, y, z) {
		trans = new TransitionableTransform();
		mod = new Modifier({
			transform: trans
		});
		cube = new Cube({ dimensions: dimensions });
		_child = new View();
		_child.add(mod).add(cube);
		_root.add(_child);

		famousMod.push({
			cube: cube,
			mod: mod,
			trans: trans,
			singleAnimate: true,
			final: Transform.translate(x, y, z)
		});
	}

	for (i = 0; i < 9; i++) {
		var z = i <= 3 ? i : 8 - i;
		createCube(50 * i, -100, 50 * z);
		createCube(50 * i, -100, 50 * -z);
		createCube(50 * i, -50, 50 * z);
		createCube(50 * i, -50, 50 * -z);
		createCube(50 * i, 0, 50 * z);
		createCube(50 * i, 0, 50 * -z);
		createCube(50 * i, 50, 50 * z);
		createCube(50 * i, 50, 50 * -z);
		createCube(50 * i, 100, 50 * z);
		createCube(50 * i, 100, 50 * -z);

		for (var j = 1; j < 4; j++) {
			if (i >= j && i <= 8 - j) {
				createCube(50 * i, 100 + j * 50, 50 * (z - j));
				createCube(50 * i, 100 + j * 50, 50 * -(z - j));
			}
		}

		if (i == 4) {
			createCube(50 * i, 100 + i * 50, 50 * (z - i));
		}
	}

	famousMod.sort(function (a, b) {
		return Math.round(Math.random()) - 0.5;
	});

	var singleAnimate = function (target, sfinal, duration, direction) {
		sfinal = sfinal === undefined ? Transform.translate(1500 * Math.random(), 1500 * Math.random(), 500 * Math.random()) : sfinal;
		duration = duration === undefined ? 1000 : duration;
		direction = direction === undefined ? true : direction;
		target.trans.set(sfinal, {
			duration: duration,
			curve: Easing.inOutExpo
		}, function () {
				var sfinal = target.trans.getFinal();
				var scale = .25 * Math.random();
				var rotate = Math.random();
				var key = Math.ceil(Math.random() * 3);
				if (direction) {
					sfinal[(11 + key)] -= 100 * Math.random();
					sfinal[0] -= scale;
					sfinal[5] -= scale;
					sfinal[10] -= scale;
					sfinal = Transform.multiply(sfinal, Transform.rotate(rotate * -1, rotate * -1, rotate * -1));
				} else {
					sfinal[(11 + key)] += 100 * Math.random();
					sfinal[0] += scale;
					sfinal[5] += scale;
					sfinal[10] += scale;
					sfinal = Transform.multiply(sfinal, Transform.rotate(rotate, rotate, rotate));
				}
				direction = !direction;

				if (target.singleAnimate === true) {
					singleAnimate(target, sfinal, Math.random() * 1000 + 3500, direction);
				}
			});
	};

	__.each(famousMod, function (mod, i) {
		famousMod[i].cube.root.on('click', function () {
			var nodes = this.context._node._child;
			__.each(nodes, function (node) {
				node = node.get();
				var mod = node.get();
				var surf = node._child.get();
				surf.setProperties({
					backgroundColor: 'rgba(255, 100, 100, .5)'
				});
			});
		});
		singleAnimate(mod);
	});

	var finalTrans = new TransitionableTransform();
	var key = 0;
	var animate = function (key) {
		if (key >= famousMod.length) {
			Timer.setTimeout(function () {
				__.each(famousMod, function (mod, i) {
					famousMod[i].singleAnimate = true;
					singleAnimate(famousMod[i]);
				});
				Timer.setTimeout(function () {
					animate(0);
				}, 3000);
			}, 3000);
			return false;
		}
		var mod = famousMod[key];
		famousMod[key].singleAnimate = false;
		famousMod[key].trans.halt();
		var final = Transform.multiply(mod.final, Transform.rotate(Math.random() * Date.now() * .002, Math.random() * Date.now() * -.001, Math.random() * Date.now() * -.002));
		mod.trans.set(final, {
			duration: Math.round(Math.random() * DURATION_PLACE_BLOCK) + 0,
			curve: Easing.inOutExpo
		}, function () {
				mod.trans.set(mod.final, {
					duration: 100,
					curve: Easing.inOutCirc
				}, function () {
					});

				key++;
				animate(key);
			});
	};

	Timer.setTimeout(function () {
		animate(0);
	}, 3000);

	var surf = new ContainerSurface({
		properties: {
			backfaceVisibility: 'visible',
			'-webkit-backface-visibility': 'visible'
		}
	});
	var surfcube = new ContainerSurface({
		properties: {
			backfaceVisibility: 'visible',
			'-webkit-backface-visibility': 'visible'
		}
	});

	var modFinal = Transform.multiply(Transform.translate(0, 0, 0), Transform.rotate(.5, -.005, 0));
	modFinal = Transform.multiply(modFinal, Transform.scale(.6, .6, .6));
	finalTrans.set(modFinal);

	mod = new Modifier({
		origin: [.5, .5],
		align: [.5, .5],
		transform: finalTrans
	});

	surfcube.add(_root);
	surf.add(mod).add(surfcube);

	GenericSync.register({
		'mouse': MouseSync,
		'touch': TouchSync,
		'scroll': ScrollSync
	});

	var sync = new GenericSync(['mouse', 'scroll', 'touch'], {
		direction: [GenericSync.DIRECTION_X, GenericSync.DIRECTION_Y]
	});
	surf.pipe(sync).pipe(this);
	sync.on('update', function (data) {
		var modFinal = finalTrans.getFinal();
		var rotate = [
			data.delta[1] * .001,
			data.delta[0] * -.002
		];
		modFinal = Transform.multiply(modFinal, Transform.rotate(rotate[0], rotate[1], 0));
		finalTrans.set(modFinal);
	});

	mod = new Modifier({
		origin: [.5, .5],
		// transform: Transform.scale(.5, .5, .5)
		transform: function () {
			return Transform.rotate(0, .0001 * (Date.now() - initialTime), 0);
		}
	});

	this.add(mod).add(surf);

	return this;
}

FamousCube.prototype = Object.create(View.prototype);
FamousCube.prototype.constructor = FamousCube;

FamousCube.DEFAULT_OPTIONS = {
};

module.exports = FamousCube;
