/****************************************************************************
 Copyright (c) 2010-2012 cocos2d-x.org
 Copyright (c) 2008-2010 Ricardo Quesada
 Copyright (c) 2011      Zynga Inc.

 http://www.cocos2d-x.org

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

require("src/core/Sudoku.js");
require("src/core/Utils.js");

var MyLayer = cc.Layer.extend({
    ctor:function() {
        this._super();
        cc.associateWithNative(this, cc.Layer);
    },

    init:function () {
        this._super();

        this.setKeypadEnabled(true);


        this._tableSprite = cc.Sprite.create("res/bg.png");
        this._tableSprite.setAnchorPoint(cc.p(0, 0));
        this.addChild(this._tableSprite);

        this._createScorePanels();
        this._createButtons();

        this._sudoku = new Sudoku();
        this._level = 30;
        this.start(0);

        return true;
    },

    start: function(levelStep) {
        cc.log("starting... " + cc.PlatformConfig);

        this._isPlaying = false;
        this._score = 0;
        this._time = 0;

        if (this._cells) {
            for (var i = 0; i < TABLE_SIZE; ++i) {
                if (this._cells[i]) {
                    for (var j = 0; j < TABLE_SIZE; ++j) {
                        if (this._cells[i][j]) {
                            this._tableSprite.removeChild(this._cells[i][j], true);
                        }
                    }
                }
                if (this._candidates[i]) {
                    this._tableSprite.removeChild(this._candidates[i], true);
                }
            }
        }
        this.createTable(this._tableSprite, levelStep);
        this._checkForCandidates();
        this._level += levelStep;
    },

    isResolved: function() {
        for (var i = 0; i < TABLE_SIZE; ++i) {
            if (this._candidates[i] && this._candidates[i].isVisible()) {
                return false;
            }
        }
        return true;
    },

    createTable: function(container) {
        this._sudoku.reset();
        this._sudoku.solve();
        this._sudoku.print();
        this._data = this._sudoku.getUnsolvedTable(this._level);

        var x = 34;
        var y = 480 - 116;
        this._cells = [];
        this._candidates = [];
        for (var i = 0; i < TABLE_SIZE; ++i) {
            this._cells[i] = [];
            if (i == 3 || i == 6) {
                y -= 8;
            }
            var dx = 0;
            for (var j = 0; j < TABLE_SIZE; ++j) {
                if (j == 3 || j == 6) {
                    dx += 10;
                }

                var cell = new Cell(this._data[i][j], this._onSelectCell.bind(this, i, j));
                cell.setAnchorPoint(cc.p(0, 0));
                cell.setPosition(Utils.p(x + j * 29 + dx, y - i * 28));
                container.addChild(cell);
                this._cells[i][j] = cell;
            }

            var candidate = new Cell(i + 1, this._onSelectCandidate.bind(this, i + 1));
            candidate.setAnchorPoint(cc.p(0, 0));
            candidate.setPosition(Utils.p(x + i * 32, 480 - 393));
            candidate.setScale(1.15);
            container.addChild(candidate, 100);
            this._candidates[i] = candidate;
        }

        this._blockTable(false);
    },

    _clearHighlight: function() {
        if (this._prevI >= 0) {
            for (var k = 0; k < TABLE_SIZE; ++k) {
                this._cells[this._prevI][k].setHighlight(0);
            }
        }
        if (this._prevJ >= 0) {
            for (var k = 0; k < TABLE_SIZE; ++k) {
                this._cells[k][this._prevJ].setHighlight(0);
            }
        }
        if (this._prevNumber > 0) {
            for (var i = 0; i < TABLE_SIZE; ++i) {
                for (var j = 0; j < TABLE_SIZE; ++j) {
                    var number = this._data[i][j];
                    if (number == this._prevNumber) {
                        this._cells[i][j].setHighlight(0);
                    }
                }
            }
        }
    },

    _onSelectCell: function(i, j) {
        this._clearHighlight();
        if (this._cells[i][j].getText()) {
            this._emptyCell = null;
            this._onSelectCandidate(parseInt(this._cells[i][j].getText()));
        }
        else {
            for (var k = 0; k < TABLE_SIZE; ++k) {
                if (this._data[i][k] != 0) {
                    this._cells[i][k].setHighlight(1);
                }
                if (this._data[k][j] != 0) {
                    this._cells[k][j].setHighlight(1);
                }
            }
            this._cells[i][j].setHighlight(3);
            this._emptyCell = this._cells[i][j];
        }
        this._prevI = i;
        this._prevJ = j;
    },

    _onSelectCandidate: function(number) {
        if (this._emptyCell) {
            if (this._sudoku.isValid(number, this._prevI, this._prevJ)) {
                this._emptyCell.setText(number);
                this._data[this._prevI][this._prevJ] = number;

                var p = this._candidates[number - 1].getPosition();
                this._candidates[number - 1].setZOrder(1000);
                this._candidates[number - 1].runAction(cc.Sequence.create(
                    cc.MoveTo.create(0.3, this._emptyCell.getPosition()),
                    cc.Hide.create(),
                    cc.CallFunc.create(function() {
                        this._candidates[number - 1].setPosition(p);
                        this._candidates[number - 1].setZOrder(100);
                    }.bind(this)),
                    cc.Show.create(),
                    cc.CallFunc.create(this._checkForCandidates.bind(this))
                ));
                this._score += 20;

                this._emptyCell = null;
            }
            else {
                this._candidates[number - 1].runAction(cc.Sequence.create(
                    cc.RotateTo.create(0.05, 20),
                    cc.RotateTo.create(0.1, -20),
                    cc.RotateTo.create(0.05, 0)
                ));
                this._score -= 10;
                this._checkForCandidates();
                return;
            }
        }
        this._clearHighlight();
        for (var i = 0; i < TABLE_SIZE; ++i) {
            for (var j = 0; j < TABLE_SIZE; ++j) {
                var cell = this._cells[i][j];
                if (this._data[i][j] == number) {
                    cell.setHighlight(2);
                }
            }
        }
        if (this.isResolved()) {
            this.start(1);
        }
        this._prevNumber = number;
    },

    _checkForCandidates: function() {
        for (var number = 1; number <= TABLE_SIZE; ++number) {
            var count = 0;
            for (var i = 0; i < TABLE_SIZE; ++i) {
                for (var j = 0; j < TABLE_SIZE; ++j) {
                    var value = this._data[i][j];
                    if (value == number) {
                        count++;
                    }
                }
            }
            this._candidates[number - 1].setVisible(count < 9);
        }
    },

    update: function(elapsed) {
        if (!this._isPlaying) {
            return;
        }

        this._scoreLabel.setString("Score: " + this._score);
        this._timeLabel.setString("Time: " + Utils.formatTime(this._time));
        this._time += elapsed;
    },

    backClicked: function() {
        cc.Director.getInstance().end();
    },

    _createButtons: function() {
        var x = 50;
        var y = 32;
        var reset = new Button(["res/reset.png", "res/reset_disable.png", "res/reset_disable.png"], [x, y], function() {
            cc.log("reset");
            this.start(0);
            play.setEnabled(true);
            pause.setEnabled(false);
        }.bind(this));
        this.addChild(reset);

        var play = new Button(["res/play.png", "res/play_disable.png", "res/play_disable.png"], [x + 55, y], function() {
            cc.log("play");
            play.setEnabled(false);
            pause.setEnabled(true);
            this._isPlaying = true;
            this._blockTable(true);
        }.bind(this));
        play.setEnabled(true);
        this.addChild(play);

        var pause = new Button(["res/pause.png", "res/pause_disable.png", "res/pause_disable.png"], [x + 55 * 2, y], function() {
            cc.log("pause");
            play.setEnabled(true);
            pause.setEnabled(false);
            this._isPlaying = false;
            this._blockTable(false);
        }.bind(this));
        pause.setEnabled(false);
        this.addChild(pause);

        var hint = new Button(["res/hint.png", "res/hint_disable.png", "res/hint_disable.png"], [x + 55 * 3, y], function() {
            cc.log("hint");
        }.bind(this));
        hint.setEnabled(false);
        this.addChild(hint);

        var stop = new Button(["res/stop.png", "res/stop_disable.png", "res/stop_disable.png"], [x + 55 * 4, y], function() {
            cc.log("stop");
            this.backClicked();
        }.bind(this));
        this.addChild(stop);
    },

    _createScorePanels: function() {
        var x = 35;
        var y = 395;
        var scorePanel = cc.Sprite.create("res/panel1.png");
        scorePanel.setAnchorPoint(cc.p(0, 0));
        scorePanel.setPosition(Utils.p(x, y));
        this.addChild(scorePanel, 0);

        this._scoreLabel = cc.LabelTTF.create("Score: 0", "Arial", Utils.s(14));
        this._scoreLabel.setPosition(Utils.p(120 / 2, 28 / 2));
        scorePanel.addChild(this._scoreLabel);

        var timePanel = cc.Sprite.create("res/panel1.png");
        timePanel.setAnchorPoint(cc.p(0, 0));
        timePanel.setPosition(Utils.p(x + 130, y));
        this.addChild(timePanel, 0);

        this._timeLabel = cc.LabelTTF.create("Time: 00:00:00", "Arial", Utils.s(14));
        this._timeLabel.setPosition(Utils.p(120 / 2, 28 / 2));
        timePanel.addChild(this._timeLabel);
    },

    _blockTable: function(value) {
        if (this._cells) {
            for (var i = 0; i < TABLE_SIZE; ++i) {
                if (this._cells[i]) {
                    for (var j = 0; j < TABLE_SIZE; ++j) {
                        if (this._cells[i][j]) {
                            this._cells[i][j].setEnabled(value);
                        }
                    }
                }
                if (this._candidates[i]) {
                    this._candidates[i].setEnabled(value);
                }
            }
        }
    }
});

var Button = cc.Node.extend({
    ctor: function(images, pos, onClick) {
        this._super();

        this.setAnchorPoint(cc.p(0, 0));
        this.setPosition(Utils.p(pos[0], pos[1]));

        this._image = cc.MenuItemImage.create(
            images[0],
            images[1],
            images[2],
            function () {
                if (onClick) {
                    onClick();
                };
            }.bind(this),this);
        this._image.setAnchorPoint(cc.p(0.5, 0.5));

        this._menu = cc.Menu.create(this._image);
        this._menu.setPosition(cc.p(0, 0));
        this.addChild(this._menu);
    },

    setEnabled: function(value) {
        this._image.setEnabled(value);
    }
});

var Cell = cc.Node.extend({
    ctor: function(text, onSelect) {
        this._super();

        this._image = cc.MenuItemImage.create(
            "res/cell.png",
            "res/cell.png",
            function () {
                if (onSelect) {
                    onSelect();
                };
            }.bind(this),this);
        this._image.setAnchorPoint(cc.p(0.5, 0.5));

        this._number = cc.LabelTTF.create("", "Arial", Utils.s(18));
        this._number.setPosition(Utils.p(28 / 2, 28 / 2));
        this._image.addChild(this._number);

        var menu = cc.Menu.create(this._image);
        menu.setPosition(cc.p(0, 0));
        this.addChild(menu);

        this.setText(text == 0 ? "" : text);
    },

    setText: function(text) {
        this._number.setString(text);
    },

    getText: function() {
        return this._number.getString();
    },

    setHighlight: function(value) {
        var colors = [
            cc.c4(255, 255, 255, 255),
            cc.c4(255, 0, 0, 64),
            cc.c4(0, 255, 0, 64),
            cc.c4(0, 0, 255, 64)
        ];
        this._image.setColor(colors[value]);
    },

    setEnabled: function(value) {
        this._image.setEnabled(value);
    }
});

var MyScene = cc.Scene.extend({
    ctor:function() {
        this._super();
        this.scheduleUpdate();
        cc.associateWithNative(this, cc.Scene);
    },

    onEnter:function () {
        this._super();
        this._layer = new MyLayer();
        this.addChild(this._layer);
        this._layer.init();
    },

    update: function(elapsed) {
        this._layer.update(elapsed);
    }
});
