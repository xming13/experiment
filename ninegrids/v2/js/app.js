var XMing = XMing || {};

XMing.GameManager = new function () {
    var m = this;

    _.templateSettings = {
        interpolate: /\{\{(.+?)\}\}/g,
        escape: /\{\-(.+?)\}\}/g,
        evaluate: /\{#(.+?)\}\}/g
    };

    // constants
    this.MAX_HP = 100;
    this.DAMAGE = 20;

    var DATA = {
        MESSAGE: "message",
        ROUND_START: "roundStart",
        ACTION_DONE: "actionDone",
        ACTION_BOTH_DONE: "actionBothDone",
        ACTION_RESULT: "actionResult",
        GAME_RESTART: "gameRestart"
    };

    var TEMPLATE = {
        newGame: _.template('<div>New Game!</div>'),
        actionPhase: _.template('<div>Round {{roundNumber}}: Action Phase</div>'),
        battlePhase: _.template('<div>Round {{roundNumber}}: Battle Phase</div>'),
        myAttackSuccess: _.template('<div><span class="you">You</span> target {{ myTarget }} and deal {{ damage }} to {{ peer }}!</div>'),
        myAttackFail: _.template('<div><span class="you">You</span> target {{ myTarget }} but {{ peer }} move to {{ oppPos }}!</div>'),
        oppAttackSuccess: _.template('<div><span class="peer">{{ peer }}</span> target {{ oppTarget }} and deal {{ damage }} to you!</div>'),
        oppAttackFail: _.template('<div><span class="peer">{{ peer }}</span> target {{ oppTarget }} but you move to {{ myPos }}!</div>'),

        myMessage: _.template('<div><span class="you">You :</span> {- message }}</div>'),
        oppMessage: _.template('<div><span class="peer">{{ peer }} :</span> {- message }}</div>'),
    };

    this.peer = null;
    this.connectedPeers = {};
    this.isGameHost = false;
    this.roundNumber = 0;
    this.isGameOver = false;
    this.myPos = 5;
    this.myTarget = 5;
    this.oppPos = 5;
    this.myHp = this.oppHp = this.MAX_HP;
    this.oppActionDone = false;
    this.myActionDone = false;

    this.connect = function (c) {
        console.log('connect', c);

        if (c.label === 'game') {
            // Setup chat messaging
            var chatbox = $('<div></div>').addClass('connection')
                .addClass('active')
                .attr('id', c.peer);

            var messagesGame = $('<div><em>Peer connected.</em></div>').addClass('messages messages-game');
            chatbox.append(messagesGame);

            var messagesChat = $('<div></div>').addClass('messages messages-chat');
            chatbox.append(messagesChat);

            var messagesInput = $('<div></div>').addClass('messages-input');

            var input = $('<input/>').addClass('input-chat');
            messagesInput.append(input);

            var imgChat = $('<img/>', {
                src: 'images/icon-chat.png'
            }).addClass('icon-chat');
            messagesInput.append(imgChat);

            chatbox.append(messagesInput);

            $('#connections').append(chatbox);

            var sendMessage = function () {
                c.send({
                    type: DATA.MESSAGE,
                    message: $(".input-chat").val()
                });
                appendChatMessage(TEMPLATE.myMessage({
                    message: $(".input-chat").val()
                }));
                $(".input-chat").val('');
            };

            $(".input-chat").keydown(function (e) {
                // enter key
                if (e.keyCode == 13 && $(this).val() != '') {
                    sendMessage();
                }
            });
            $('.icon-chat').click(sendMessage);

            // grid click events
            $('.btn-done').click(function () {
                m.myActionDone = true;

                $('#gameboard').removeClass('ok').addClass('done');

                m.myPos = $('.my-grid div.selected').data('value');
                m.myTarget = $('.opp-grid div.selected').data('value');

                // check if opponent has already done his action
                // if yes, send current player's action and request for opponent's action
                // else, notify opponent that we have done our action and wait for opponent to finish his action
                if (m.oppActionDone) {
                    m.oppActionDone = false;
                    c.send({
                        type: DATA.ACTION_BOTH_DONE,
                        position: m.myPos,
                        target: m.myTarget
                    });
                }
                else {
                    c.send({
                        type: DATA.ACTION_DONE
                    });
                }
            });

            $('body').on('click', '#gameboard.todo .game-grid div.available, #gameboard.ok .game-grid div.available', function () {
                $(this).siblings().removeClass('selected');
                $(this).addClass('selected');

                if ($('.my-grid .selected').length > 0 && $('.opp-grid .selected').length > 0) {
                    $('#gameboard').removeClass('todo').addClass('ok');
                }
                else {
                    $('#gameboard').removeClass('ok').addClass('todo');
                }
            });

            // bind connection events
            c.on('data', function (data) {
                console.log(c.peer);
                console.log(data);

                var checkGameOver = function () {
                    // both are alive so dont do anything
                    if (m.myHp > 0 && m.oppHp > 0) {
                        return;
                    }

                    m.isGameOver = true;
                    $('.select').hide();
                    $('.restart').show();
                    $('body').on('click', '.restart', function () {
                        restartGame();

                        appendGameMessage(TEMPLATE.newGame());
                        appendGameMessage(TEMPLATE.actionPhase({
                            roundNumber: m.roundNumber
                        }));

                        c.send({
                            type: DATA.GAME_RESTART
                        });
                    });

                    if (m.myHp <= 0 && m.oppHp <= 0) {
                        swal('Both of you die!', '', 'warning');
                    }
                    else if (m.myHp <= 0) {
                        swal('You lost!', '', 'error');
                    }
                    else if (m.oppHp <= 0) {
                        swal('You won!', '', 'success');
                    }
                }

                var resolveBattle = function (data) {
                    var myPos = m.myPos;
                    var myTarget = m.myTarget;
                    var oppPos = data.position;
                    var oppTarget = data.target;

                    // update global variable
                    m.oppPos = oppPos;

                    appendGameMessage(TEMPLATE.battlePhase({
                        roundNumber: m.roundNumber
                    }));

                    if (myPos === oppTarget) {
                        m.myHp -= m.DAMAGE;
                        progress(m.myHp, $('#my-hp-bar'));

                        appendGameMessage(TEMPLATE.oppAttackSuccess({
                            peer: c.peer,
                            damage: m.DAMAGE,
                            oppTarget: oppTarget
                        }));
                    }
                    else {
                        appendGameMessage(TEMPLATE.oppAttackFail({
                            peer: c.peer,
                            myPos: myPos,
                            oppTarget: oppTarget
                        }));
                    }

                    if (oppPos === myTarget) {
                        m.oppHp -= m.DAMAGE;
                        progress(m.oppHp, $('#opp-hp-bar'));

                        appendGameMessage(TEMPLATE.myAttackSuccess({
                            peer: c.peer,
                            damage: m.DAMAGE,
                            myTarget: myTarget
                        }));
                    }
                    else {
                        appendGameMessage(TEMPLATE.myAttackFail({
                            peer: c.peer,
                            myTarget: myTarget,
                            oppPos: oppPos
                        }));
                    }

                    $(".game-grid div").removeClass('current available selected');
                    $('.my-grid div[data-value="' + m.myPos + '"]').addClass("current");
                    $('.opp-grid div[data-value="' + m.oppPos + '"]').addClass("current");

                    var myAvailMoves = getAvailableMoves(m.myPos);
                    var oppAvailMoves = getAvailableMoves(m.oppPos);

                    _.each(myAvailMoves, function (move) {
                        $('.my-grid div[data-value="' + move + '"]').addClass("available");
                    });
                    _.each(oppAvailMoves, function (move) {
                        $('.opp-grid div[data-value="' + move + '"]').addClass("available");
                    });

                    checkGameOver();


                    // reset myPos and myTarget for next round
                    //m.myPos = m.myTarget = -1;

                    // remove class
                    $('#gameboard').removeClass('done').addClass('todo');
                };

                if (data.type == DATA.MESSAGE) {
                    appendChatMessage(TEMPLATE.oppMessage({
                        peer: c.peer,
                        message: data.message
                    }));
                } else if (data.type == DATA.ROUND_START) {
                    m.myActionDone = m.oppActionDone = false;
                    m.roundNumber++;
                    appendGameMessage(TEMPLATE.actionPhase({
                        roundNumber: m.roundNumber
                    }));
                } else if (data.type == DATA.ACTION_DONE) {
                    m.oppActionDone = true;

                    // in the case that both players send DATA.ACTION_DONE at the same time
                    // and result in both players waiting for each other,
                    // this check against the case and attempt to resolve the issue
                    if (m.isGameHost && m.myActionDone) {
                        console.log("Both players waiting for each other");
                        m.oppActionDone = false;
                        c.send({
                            type: DATA.ACTION_BOTH_DONE,
                            position: m.myPos,
                            target: m.myTarget
                        });
                    }
                } else if (data.type == DATA.ACTION_BOTH_DONE) {
                    // receive message that both players have finished their turn
                    // send our data to the opponent
                    // and resolve battle on our side
                    c.send({
                        type: DATA.ACTION_RESULT,
                        position: m.myPos,
                        target: m.myTarget
                    });

                    resolveBattle(data);
                } else if (data.type == DATA.ACTION_RESULT) {
                    // receive data from our opponent and they have resolved battle on their side
                    // proceed to resolve battle on our side
                    // and issue starting a new round
                    resolveBattle(data);

                    if (!m.isGameOver) {
                        // new round start!
                        m.roundNumber++;
                        appendGameMessage(TEMPLATE.actionPhase({
                            roundNumber: m.roundNumber
                        }));
                        c.send({
                            type: DATA.ROUND_START
                        });
                        m.myActionDone = m.oppActionDone = false;
                    }
                } else if (data.type === DATA.GAME_RESTART) {
                    restartGame();

                    appendGameMessage(TEMPLATE.newGame());
                    appendGameMessage(TEMPLATE.actionPhase({
                        roundNumber: m.roundNumber
                    }));
                } else {
                    console.log('unknown data');
                }
            });

            c.on('close', function () {
                swal(
                    'Oops.. :(',
                    c.peer + ' has left the game!',
                    'error'
                );

                delete m.connectedPeers[c.peer];
            });
        }

        m.connectedPeers[c.peer] = 1;
    };

    this.init = function () {
        // navigate to create connection screen
        $("#create").click(function () {
            $(".panel, #instruction").fadeOut('fast');
            $("#panel-host, #back").fadeIn('fast');
        });

        // navigate to join connection screen
        $("#join").click(function () {
            $(".panel").fadeOut('fast');
            $("#panel-join, #back").fadeIn('fast');
        });

        // navigate back to main menu screen
        $("#back").click(function () {
            $(".panel, #back").fadeOut('fast');
            $("#panel-main").fadeIn('fast');
            m.destroy();
        });

        // create new connection
        $("#host").click(function () {
            var usernameHost = $("#username-host").val();

            if (usernameHost === '') {
                swal('Oops..', 'Please enter a username!', 'error');
            } else {
                m.peer = new Peer(usernameHost, {
                    key: 'j4a6ijvcn8z1tt9'
                });

                m.peer.on('open', function (id) {
                    $('#pid').text(id);
                    $("#instruction").fadeIn('fast');
                });

                m.peer.on('connection', function (c) {
                    console.log('on connection');
                    m.isGameHost = true;
                    m.connect(c);

                    $('#opp-name').html(c.peer);
                    $("#gameboard").fadeIn('fast');
                    $("#content").fadeOut('fast');
                });

                m.peer.on('error', function (err) {
                    swal('Oops..', err, 'error');
                });
            }
        });

        // Connect to a peer
        $('#connect').click(function () {
            if ($("#username-join").val() == '') {
                swal('Oops..', 'Please enter a username!', 'error');
            } else if ($('#rid').val() == '') {
                swal('Oops..', 'Please enter your friend\'s ID!', 'error');
            } else {
                var requestedPeer = $('#rid').val();
                if (!m.connectedPeers[requestedPeer]) {
                    m.peer = new Peer($("#username-join").val(), {
                        key: 'j4a6ijvcn8z1tt9',
                        debug: 3,
                        logFunction: function () {
                            var copy = Array.prototype.slice.call(arguments).join(' ');
                            console.log(copy);
                        }
                    });

                    // pending peerjs team to enable this feature for me!
                    // console.log(self.peer.listAllPeers());

                    var c = m.peer.connect(requestedPeer, {
                        label: 'game',
                        serialization: 'json',
                        metadata: {
                            message: 'Hi let\'s start a game!'
                        }
                    });

                    c.on('open', function () {
                        console.log('connect open - start');
                        m.connect(c);
                        m.isGameHost = false;
                        $('#opp-name').html(requestedPeer);
                        $("#gameboard").fadeIn('fast');
                        $("#content").fadeOut('fast');

                        // new round start!
                        m.roundNumber++;
                        appendGameMessage(TEMPLATE.actionPhase({
                            roundNumber: m.roundNumber
                        }));
                        c.send({
                            type: DATA.ROUND_START
                        });

                        console.log('connect open - end');
                    });

                    c.on('error', function (err) {
                        console.log('onError: ' + err);
                        swal('Oops..', err, 'error');
                    });

                    m.connectedPeers[requestedPeer] = 1;
                } else {
                    console.log('self.connectedPeers[requestedPeer] exists!');
                }
            }
        });

        // Close a connection
        $('#close').click(function () {
            m.eachActiveConnection(function (c) {
                c.close();
            });
        });
    };

    this.destroy = function () {
        if (!!this.peer && !this.peer.destroyed) {
            this.peer.destroy();
        }
    };

    // Goes through each active peer and calls FN on its connections.
    this.eachActiveConnection = function (fn) {
        var self = this;

        var actives = $('.active');
        var checkedIds = {};
        actives.each(function () {
            var peerId = $(this).attr('id');

            if (!checkedIds[peerId]) {
                var conns = self.peer.connections[peerId];
                for (var i = 0, ii = conns.length; i < ii; i += 1) {
                    var conn = conns[i];
                    fn(conn, $(this));
                }
            }

            checkedIds[peerId] = 1;
        });
    };

    function appendGameMessage(message) {
        $('.messages-game')
            .append(message)
            .animate({
                scrollTop: this.scrollHeight
            }, 500);
    };

    function appendChatMessage(message) {
        $('.messages-chat')
            .append(message)
            .animate({
                scrollTop: this.scrollHeight
            }, 500);
    }

    function progress(percent, $elem) {
        percent = parseInt(percent);
        var $div = $elem.find('div');
        var originalPercent = parseInt($div.html());

        $div.animate({width: percent * $elem.width() / 100}, 500);
        $({
            counter: originalPercent
        }).animate({
                counter: percent
            }, {
                duration: 500,
                easing: 'swing',
                step: function () {
                    $div.text(Math.ceil(this.counter));
                }
            });
    }

    function getAvailableMoves(current) {
        switch (current) {
            case 1:
                return [1, 2, 4, 5];
            case 2:
                return [1, 2, 3, 4, 5, 6];
            case 3:
                return [2, 3, 5, 6];
            case 4:
                return [1, 2, 4, 5, 7, 8];
            case 5:
                return [1, 2, 3, 4, 5, 6, 7, 8, 9];
            case 6:
                return [2, 3, 5, 6, 8, 9];
            case 7:
                return [4, 5, 7, 8];
            case 8:
                return [4, 5, 6, 7, 8, 9];
            case 9:
                return [5, 6, 8, 9];
            default:
                return [];
        }
    }

    function restartGame() {
        m.roundNumber = 0;
        m.isGameOver = false;
        m.myPos = m.myTarget = -1;
        m.myHp = m.oppHp = m.MAX_HP;
        m.myActionDone = m.oppActionDone = false;

        $('.select').show();
        $('.restart').hide();
        progress(100, $('#my-hp-bar'));
        progress(100, $('#opp-hp-bar'));
        $(".my-grid div, .opp-grid div").removeClass("selected current").addClass("available");
        $('.my-grid div[data-value="5"], .opp-grid div[data-value="5"]').addClass("current");

        m.roundNumber++;
    }
};