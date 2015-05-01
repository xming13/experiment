// load css
require('./styles');

// Load polyfills
require('famous-polyfills');

// import dependencies
var Engine = require('famous/core/Engine');
var Modifier = require('famous/core/Modifier');
var Transform = require('famous/core/Transform');
var ImageSurface = require('famous/surfaces/ImageSurface');
var Surface = require("famous/core/Surface");
var GridLayout = require("famous/views/GridLayout");
var StateModifier = require("famous/modifiers/StateModifier");
var RenderNode = require("famous/core/RenderNode");
var ContainerSurface = require("famous/surfaces/ContainerSurface");
var Lightbox = require('famous/views/Lightbox');
var Easing = require('famous/transitions/Easing');
var Cube = require('./scripts/views/Cube');
var AirshipCube = require('./scripts/views/AirshipCube');

// create the main context
var mainContext = Engine.createContext();
mainContext.setPerspective(1000);

var airshipCube = new AirshipCube();
mainContext.add(new Modifier({
	origin: [.5,.5],
	align: [.5,.5]
})).add(airshipCube);  

//var cube = new Cube({ dimensions: [50, 50, 50] });
//mainContext.add(cube);

// your app here
//var logo = new ImageSurface({
//  size: [200, 200],
//  content: 'images/famous_logo.png',
//  classes: ['backfaceVisibility']
//});
//
//var initialTime = Date.now();
//var centerSpinModifier = new Modifier({
//  align: [0.5, 0.5],
//  origin: [0.5, 0.5],
//  transform: function () {
//    return Transform.rotateY(.002 * (Date.now() - initialTime));
//  }
//});

//mainContext.add(centerSpinModifier).add(logo);

//var container = new ContainerSurface();
//
//var grid = new GridLayout({
//  dimensions: [4, 4],
//  transition: {
//    curve: 'easeInOut',
//    duration: 2000
//  }
//});
//
//var surfaces = [];
//grid.sequenceFrom(surfaces);
//
//for (var i = 0; i < 15; i++) {
//  surfaces.push(new Surface({
//    content: "I am panel " + (i + 1),
//    size: [undefined, undefined],
//    properties: {
//      //      backgroundColor: "hsl(" + (i * 360 / 16) + ", 100%, 50%)",
//      backgroundColor: "#000",
//      color: "#000",
//      lineHeight: window.innerHeight / 4 + 'px',
//      textAlign: 'center',
//      border: '5px solid #FFF'
//    }
//  }));
//}
//
//var stateModifier = new StateModifier({
//  size: [400, 400],
//  align: [.5, .5],
//  origin: [.5, .5]
//});
//
//container.add(grid);
//
//mainContext.add(stateModifier).add(container);
//
//var monsters = [];
//var monsterView = new RenderNode();
//
//var monsterWrapperSurface = new ContainerSurface({
//  content: 'monsterWrapper',
//  size: [undefined, undefined],
//  properties: {
//    backgroundColor: '#333',
//    color: '#FFF',
//    overflow: 'hidden'
//  }
//});
//
//monsterView.add(monsterWrapperSurface);
//
//var lightbox = new Lightbox({
//  inOpacity: 0,
//  outOpacity: 0,
//  inOrigin: [.5, .5],
//  inAlign: [.5, .5],
//  showOrigin: [.5, 0],
//  inTransform: Transform.translate(0, 100, 0.0001),
//  outTransform: Transform.translate(0, 100, 0.0002),
//  outOrigin: [.5, .5],
//  outAlign: [.5, .5],
//  inTransition: { duration: 1000, curve: Easing.inCirc },
//  outTransition: { duration: 600, curve: Easing.outCirc },
//  overlap: true
//});
//
//var monsterSurface = new ContainerSurface({
//  content: 'Monster',
//  size: [undefined, undefined],
//  properties: {
//    backgroundColor: '#FFF',
//    borderRadius: '50%'
//  }
//});
//
//monsterWrapperSurface.add(
//  new Modifier({
//    size: [100, 100],
//    align: [.5, .5],
//    origin: [.5, .5]
//  }))
//  .add(lightbox);
//
//container.add(
//  new Modifier({
//    size: [100, 100],
//    align: [.25, .25]
//  }))
//  .add(monsterView);
//
//var isShow = false;
//Engine.on('click', function () {
//  console.log('clicked');
//  if (isShow) {
//    lightbox.hide(monsterSurface);
//  }
//  else {
//    lightbox.show(monsterSurface);
//  }
//  isShow = !isShow;
//});