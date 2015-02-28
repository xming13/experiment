$(document).ready(function () {
    var mainTimeline = new TimelineMax();
    var timeline1 = new TimelineMax();
    var duckTimeline = new TimelineMax();

    timeline1.addLabel("start")
        .to(".sun", 2, {rotation: 90, transformOrigin: window.innerWidth / 2 + "px 50%"}, "start")
        .to(".base", 3, { backgroundColor: "#00FFFF" }, "start")

    timeline1.addLabel("end", "+=3")
        .to(".sun", 2, { rotation: 180, transformOrigin: window.innerWidth / 2 + "px 50%" }, "end")
        .to(".base", 3, { backgroundColor: "#000" }, "end");

    duckTimeline.addLabel("duck")
        .to(".duckling", 10, { xPercent: "50%", right: "50%", ease: Linear.easeNone }, "duck")
        .to(".duckling .head", .2, { x: "-=5", repeat: 49, yoyo: true }, "duck")
        .to(".duckling .foot", .2, { rotation: 360, transformOrigin: "50% 50%", repeat: 49, yoyo: true }, "duck");

    mainTimeline.add(timeline1, 1);
    mainTimeline.add(duckTimeline, 1);

    mainTimeline.play();
});