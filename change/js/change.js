$(document).ready(function () {
    var mainTimeline = new TimelineMax({paused: true});
    var timeline1 = new TimelineMax();
    var duckTimeline = new TimelineMax();

    timeline1.addLabel("start")
        .to(".sun", 2, {rotation: 90, transformOrigin: window.innerWidth / 2 + "px 50%"}, "start")
        .to(".base", 3, { backgroundColor: "#B0F0FF" }, "start")

    timeline1.addLabel("end", "+=3")
        .to(".sun", 2, { rotation: 180, transformOrigin: window.innerWidth / 2 + "px 50%" }, "end")
        .to(".base", 3, { backgroundColor: "#000" }, "end");

    var timeDuckling = 10;
    var stepDuckling = .5;
    var repeatDuckling = timeDuckling / stepDuckling / 2 - 1;
    duckTimeline.addLabel("duck")
        .to(".duckling", timeDuckling, { xPercent: "-50%", left: "50%", ease: Linear.easeNone }, "duck")
        .to(".duckling .head", stepDuckling, { x: "+=5", repeat: timeDuckling / stepDuckling - 1, yoyo: true }, "duck")
        .to(".duckling .foot-left-wrapper", stepDuckling, { rotation: 360, transformOrigin: "15px -10px", repeat: repeatDuckling, repeatDelay: stepDuckling }, "duck")
        .to(".duckling .foot-right-wrapper", stepDuckling, { rotation: 360, transformOrigin: "15px -10px", repeat: repeatDuckling, repeatDelay: stepDuckling, delay: stepDuckling }, "duck")
        .to(".duckling .foot.left", stepDuckling, { rotation: "-=360", repeat: repeatDuckling, repeatDelay: stepDuckling }, "duck")
        .to(".duckling .foot.right", stepDuckling, { rotation: "-=360", repeat: repeatDuckling, repeatDelay: stepDuckling, delay: stepDuckling }, "duck");

    mainTimeline.add(timeline1, 1);
    mainTimeline.add(duckTimeline, 1);

    mainTimeline.play();
});