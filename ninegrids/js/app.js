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
    this.myPos = -1;
    this.myTarget = -1;
    this.myHp = this.oppHp = this.MAX_HP;
    this.oppActionDone = false;

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
                messagesChat.append(TEMPLATE.myMessage({
                    message: $(".input-chat").val()
                }));
                $(".input-chat").val('');
                m.scrollChatMessagesToBottom();
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

            $('body').on('click', '#gameboard.todo .game-grid div, #gameboard.ok .game-grid div', function () {
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
                    $('body').on('click', '.restart', function() {
                        m.roundNumber = 0;
                        m.isGameOver = false;
                        m.myPos = m.myTarget = -1;
                        m.myHp = m.oppHp = m.MAX_HP;
                        m.oppActionDone = false;

                        $('.restart').hide();
                        $('.select').show();

                        progress(100, $('#my-hp-bar'));
                        progress(100, $('#opp-hp-bar'));

                        m.roundNumber++;
                        messagesGame.append(TEMPLATE.newGame());
                        messagesGame.append(TEMPLATE.actionPhase({
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

                    messagesGame.append(TEMPLATE.battlePhase({
                        roundNumber: m.roundNumber
                    }));

                    if (myPos === oppTarget) {
                        m.myHp -= m.DAMAGE;
                        progress(m.myHp, $('#my-hp-bar'));

                        messagesGame.append(TEMPLATE.oppAttackSuccess({
                            peer: c.peer,
                            damage: m.DAMAGE,
                            oppTarget: oppTarget
                        }));
                    }
                    else {
                        messagesGame.append(TEMPLATE.oppAttackFail({
                            peer: c.peer,
                            myPos: myPos,
                            oppTarget: oppTarget
                        }));
                    }

                    if (oppPos === myTarget) {
                        m.oppHp -= m.DAMAGE;
                        progress(m.oppHp, $('#opp-hp-bar'));

                        messagesGame.append(TEMPLATE.myAttackSuccess({
                            peer: c.peer,
                            damage: m.DAMAGE,
                            myTarget: myTarget
                        }));
                    }
                    else {
                        messagesGame.append(TEMPLATE.myAttackFail({
                            peer: c.peer,
                            myTarget: myTarget,
                            oppPos: oppPos
                        }));
                    }

                    checkGameOver();
                    m.scrollGameMessagesToBottom();

                    // reset myPos and myTarget for next round
                    m.myPos = m.myTarget = -1;

                    // remove class
                    $('#gameboard').removeClass('done').addClass('todo');
                };

                if (data.type == DATA.MESSAGE) {
                    messagesChat.append(TEMPLATE.oppMessage({
                        peer: c.peer,
                        message: data.message
                    }));
                    m.scrollChatMessagesToBottom();
                } else if (data.type == DATA.ROUND_START) {
                    m.roundNumber++;
                    messagesGame.append(TEMPLATE.actionPhase({
                        roundNumber: m.roundNumber
                    }));
                } else if (data.type == DATA.ACTION_DONE) {
                    m.oppActionDone = true;
                } else if (data.type == DATA.ACTION_BOTH_DONE) {
                    c.send({
                        type: DATA.ACTION_RESULT,
                        position: m.myPos,
                        target: m.myTarget
                    });

                    resolveBattle(data);
                } else if (data.type == DATA.ACTION_RESULT) {
                    resolveBattle(data);

                    if (!m.isGameOver) {
                        // new round start!
                        m.roundNumber++;
                        $(".messages-game").append(TEMPLATE.actionPhase({
                            roundNumber: m.roundNumber
                        }));
                        m.scrollGameMessagesToBottom();
                        c.send({
                            type: DATA.ROUND_START
                        });
                    }
                } else if (data.type === DATA.GAME_RESTART) {
                    m.roundNumber = 0;
                    m.isGameOver = false;
                    m.myPos = m.myTarget = -1;
                    m.myHp = m.oppHp = m.MAX_HP;
                    m.oppActionDone = false;

                    $('.select').show();
                    $('.restart').hide();
                    progress(100, $('#my-hp-bar'));
                    progress(100, $('#opp-hp-bar'));

                    m.roundNumber++;
                    messagesGame.append(TEMPLATE.newGame());
                    messagesGame.append(TEMPLATE.actionPhase({
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

    this.scrollGameMessagesToBottom = function () {
        $(".messages-game").animate({
            scrollTop: $(".messages-game")[0].scrollHeight
        }, 500);
    };
    this.scrollChatMessagesToBottom = function () {
        $(".messages-chat").animate({
            scrollTop: $(".messages-chat")[0].scrollHeight
        }, 500);
    };

    this.init = function () {
        var self = this;

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
            self.destroy();
        });

        // create new connection
        $("#host").click(function () {
            var usernameHost = $("#username-host").val();

            if (usernameHost === '') {
                swal('Oops..', 'Please enter a username!', 'error');
            } else {
                self.peer = new Peer(usernameHost, {
                    key: 'j4a6ijvcn8z1tt9'
                });

                self.peer.on('open', function (id) {
                    $('#pid').text(id);
                    $("#instruction").fadeIn('fast');
                });

                self.peer.on('connection', function (c) {
                    console.log('on connection');
                    self.isGameHost = true;
                    self.connect(c);

                    $('#opp-name').html(c.peer);
                    $("#gameboard").fadeIn('fast');
                    $("#content").fadeOut('fast');
                });

                self.peer.on('error', function (err) {
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
                if (!self.connectedPeers[requestedPeer]) {
                    self.peer = new Peer($("#username-join").val(), {
                        key: 'j4a6ijvcn8z1tt9',
                        debug: 3,
                        logFunction: function () {
                            var copy = Array.prototype.slice.call(arguments).join(' ');
                            console.log(copy);
                        }
                    });

                    // pending peerjs team to enable this feature for me!
                    // console.log(self.peer.listAllPeers());

                    var c = self.peer.connect(requestedPeer, {
                        label: 'game',
                        serialization: 'json',
                        metadata: {
                            message: 'Hi let\'s start a game!'
                        }
                    });

                    c.on('open', function () {
                        console.log('connect open - start');
                        self.connect(c);
                        self.isGameHost = false;
                        $('#opp-name').html(requestedPeer);
                        $("#gameboard").fadeIn('fast');
                        $("#content").fadeOut('fast');

                        // new round start!
                        m.roundNumber++;
                        $(".messages-game").append(TEMPLATE.actionPhase({
                            roundNumber: m.roundNumber
                        }));
                        m.scrollGameMessagesToBottom();
                        c.send({
                            type: DATA.ROUND_START
                        });

                        console.log('connect open - end');
                    });

                    c.on('error', function (err) {
                        console.log('onError: ' + err);
                        swal('Oops..', err, 'error');
                    });

                    self.connectedPeers[requestedPeer] = 1;
                } else {
                    console.log('self.connectedPeers[requestedPeer] exists!');
                }
            }
        });

        // Close a connection
        $('#close').click(function () {
            self.eachActiveConnection(function (c) {
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

    function progress(percent, $elem) {
        var progressBarWidth = percent * $elem.width() / 100;
        $elem.find('div').animate({width: progressBarWidth}, 500).html(percent);
    }
};