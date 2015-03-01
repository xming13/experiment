$(document).ready(function () {
    var mainTimeline = new TimelineMax({paused: true});
    var timeline1 = new TimelineMax();
    var duckTimeline = new TimelineMax();
    var caterpillarTimeline = new TimelineMax();

    timeline1.addLabel("start")
        .to(".sun", 2, {rotation: 90, transformOrigin: window.innerWidth / 2 + "px 50%"}, "start")
        .to(".base", 3, { backgroundColor: "#B0F0FF" }, "start")

    timeline1.addLabel("end", "+=3")
        .to(".sun", 2, { rotation: 180, transformOrigin: window.innerWidth / 2 + "px 50%" }, "end")
        .to(".base", 3, { backgroundColor: "#000" }, "end");

    var durationDuckling = 10;
    var delayDuckling = .5;
    var repeatDuckling = durationDuckling / delayDuckling / 2 - 1;

    duckTimeline.addLabel("duck")
        .to(".duckling", durationDuckling, { xPercent: "-100%", left: "100%", ease: Linear.easeNone }, "duck")
        .to(".duckling .head", delayDuckling, { x: "+=5", repeat: durationDuckling / delayDuckling - 1, yoyo: true }, "duck")
        .to(".duckling .foot-left-wrapper", delayDuckling, { rotation: 360, transformOrigin: "15px -10px", repeat: repeatDuckling, repeatDelay: delayDuckling }, "duck")
        .to(".duckling .foot-right-wrapper", delayDuckling, { rotation: 360, transformOrigin: "15px -10px", repeat: repeatDuckling, repeatDelay: delayDuckling, delay: delayDuckling }, "duck")
        .to(".duckling .foot.left", delayDuckling, { rotation: "-=360", repeat: repeatDuckling, repeatDelay: delayDuckling }, "duck")
        .to(".duckling .foot.right", delayDuckling, { rotation: "-=360", repeat: repeatDuckling, repeatDelay: delayDuckling, delay: delayDuckling }, "duck");

    var durationCaterpillar = 10;
    var delayCaterpillar = .5;
    var repeatCaterpillar = durationCaterpillar / delayCaterpillar / 2 - 1;

    caterpillarTimeline.addLabel("caterpillar")
        .to(".caterpillar", durationCaterpillar, { xPercent: "-100%", left: "100%", ease: Linear.easeNone }, "caterpillar")
        .to(".caterpillar .foot-left-wrapper", delayCaterpillar, { rotation: 360, transformOrigin: "5px -5px", repeat: repeatCaterpillar, repeatDelay: delayCaterpillar }, "caterpillar")
        .to(".caterpillar .foot-right-wrapper", delayCaterpillar, { rotation: 360, transformOrigin: "5px -5px", repeat: repeatCaterpillar, repeatDelay: delayCaterpillar, delay: delayCaterpillar }, "caterpillar")
        .to(".caterpillar .foot.left", delayCaterpillar, { rotation: "-=360", repeat: repeatCaterpillar, repeatDelay: delayCaterpillar }, "caterpillar")
        .to(".caterpillar .foot.right", delayCaterpillar, { rotation: "-=360", repeat: repeatCaterpillar, repeatDelay: delayCaterpillar, delay: delayCaterpillar }, "caterpillar");    ;

    mainTimeline.add(timeline1, 1);
    mainTimeline.add(duckTimeline, 1);
    mainTimeline.add(caterpillarTimeline, 5);

    mainTimeline.play();
});