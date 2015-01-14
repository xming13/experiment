window.addEventListener("load", function () {

    var pop = Popcorn("#audio");

    var request = new XMLHttpRequest();
    request.open('GET', 'audio/Antsy_Pants_-_Tree_Hugger.txt', true);

    request.onload = function() {
        if (request.status >= 200 && request.status < 400) {
            var lrcArr = parseLrc(request.responseText);

            var lrc, lrcNext;
            for (var i = 0; i < lrcArr.length; i++) {
                lrc = lrcArr[i];
                lrcNext = lrcArr[i+1];

                if (lrcNext) {
                    pop.footnote({
                        start: lrc.starttime,
                        end: lrcNext.starttime,
                        text: lrc.line,
                        target: 'lyrics'
                    });
                }
            }
            console.log(lrcArr);

            // hide #loading
            var loading = document.getElementById('loading');
            loading.style.display = 'none';

            // show #btn-start
            var btnStart = document.getElementById('btn-start');
            btnStart.style.display = '';

            btnStart.addEventListener("click", function() {
                // hide #btn-start
                btnStart.style.display = 'none';

                // Add class 'loaded' to container
                var container = document.getElementsByClassName('container')[0];
                if (container.classList) {
                    container.classList.add('loaded');
                }
                else {
                    container.className += ' loaded';
                }

                // start
                pop.play();
            });

        } else {
            console.log('request reached server but error is returned.');
        }
    };

    request.onerror = function() {
        console.log('request.onerror');
    };

    request.send();

    function parseLrc(rawLrc) {
        var lrcArr = [];

        var lrcAllRegex = /(\[[0-9.:\[\]]*\])+(.*)/;
        var timeRegex = /\[([0-9]+):([0-9.]+)\]/;
        var rawLrcArray = rawLrc.split(/[\r\n]/);

        for (var i = 0; i < rawLrcArray.length; i++) {
            // handle lrc
            var lrc = lrcAllRegex.exec(rawLrcArray[i]);

            if ( lrc && lrc[0] ) {
                var times = lrc[1].replace(/\]\[/g,"],[").split(",");

                for (var j = 0; j < times.length; j++) {
                    var time = timeRegex.exec(times[j]);
                    if ( time && time[0] ) {
                        lrcArr.push( { "starttime": parseInt(time[1],10) * 60 + parseFloat(time[2]), "line": lrc[2] } );
                    };
                };
            };
        };

        //sort lrcArr
        lrcArr.sort(function (a,b) {
            return a.starttime - b.starttime;
        });

        return lrcArr;
    }

}, false);