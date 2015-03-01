$(document).ready(function () {
    var mainTimeline = new TimelineMax({paused: true});
    var backgroundTimeline = new TimelineMax();
    var duckTimeline = new TimelineMax();
    var caterpillarTimeline = new TimelineMax();

    backgroundTimeline.addLabel("start")
        .to(".sun", 2, {rotation: 90, transformOrigin: window.innerWidth / 2 + "px 50%"}, "start")
        .to(".base", 3, { backgroundColor: "#B0F0FF" }, "start")

    backgroundTimeline.addLabel("end", "+=3")
        .to(".sun", 2, { rotation: 180, transformOrigin: window.innerWidth / 2 + "px 50%" }, "end")
        .to(".base", 3, { backgroundColor: "#000" }, "end");

    var durationDuckling = 10;
    var delayDuckling = .25;
    var repeatDuckling = durationDuckling / delayDuckling / 2 - 1;

    duckTimeline.addLabel("duck")
        .to(".duckling", durationDuckling, { xPercent: "-100%", left: "100%", ease: Linear.easeNone }, "duck")
        .to(".duckling .head", delayDuckling, { x: "+=5", repeat: durationDuckling / delayDuckling - 1, yoyo: true }, "duck")
        .to(".duckling .foot-left-wrapper", delayDuckling, { rotation: 360, transformOrigin: "15px -10px", repeat: repeatDuckling, repeatDelay: delayDuckling }, "duck")
        .to(".duckling .foot-right-wrapper", delayDuckling, { rotation: 360, transformOrigin: "15px -10px", repeat: repeatDuckling, repeatDelay: delayDuckling, delay: delayDuckling }, "duck")
        .to(".duckling .foot.left", delayDuckling, { rotation: "-=360", repeat: repeatDuckling, repeatDelay: delayDuckling }, "duck")
        .to(".duckling .foot.right", delayDuckling, { rotation: "-=360", repeat: repeatDuckling, repeatDelay: delayDuckling, delay: delayDuckling }, "duck");

    var durationCaterpillar = 15;
    var delayCaterpillar = .5;
    var repeatCaterpillar = durationCaterpillar / delayCaterpillar - 1;

    var countCaterpillar = 0;
    function tweenCaterpillar() {

        // caterpillar is pushing forward
        if (countCaterpillar % 2 == 0) {
            TweenMax.to(".caterpillar", delayCaterpillar * 2, { left: "+=" + 100 * 2 / (repeatCaterpillar + 1) + "%" });
        }
        countCaterpillar++;
    }

    caterpillarTimeline
        .to(".caterpillar .body1", delayCaterpillar, { x: "-=4", repeat: repeatCaterpillar, yoyo: true }, "caterpillar")
        .to(".caterpillar .body2", delayCaterpillar, { x: "-=2", y: "-=4", repeat: repeatCaterpillar, yoyo: true }, "caterpillar")
        .to(".caterpillar .body3", delayCaterpillar, { y: "-=10", repeat: repeatCaterpillar, yoyo: true, onRepeat: tweenCaterpillar }, "caterpillar")
        .to(".caterpillar .body4", delayCaterpillar, { x: "+=2", y: "-=4", repeat: repeatCaterpillar, yoyo: true }, "caterpillar")
        .to(".caterpillar .body5", delayCaterpillar, { x: "+=4", repeat: repeatCaterpillar, yoyo: true }, "caterpillar")

    mainTimeline.add(backgroundTimeline, 1);
    mainTimeline.add(duckTimeline, 1);
    mainTimeline.add(caterpillarTimeline, 1);

    mainTimeline.play();
});