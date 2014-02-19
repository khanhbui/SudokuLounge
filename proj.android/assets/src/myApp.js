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
    isMouseDown:false,
    helloImg:null,
    helloLabel:null,
    circle:null,
    sprite:null,

    ctor:function() {
        this._super();
        cc.associateWithNative( this, cc.Layer );
    },

    init:function () {
        this._super();

        this.setKeypadEnabled(true);

        var sudokuLabel = cc.LabelTTF.create("SUDOKU", "Arial", Utils.s(30));
        sudokuLabel.setAnchorPoint(cc.p(0, 0));
        sudokuLabel.setPosition(Utils.p(70, 440));
        this.addChild(sudokuLabel, 1);

        var loungeLabel = cc.LabelTTF.create("LOUNGE", "Arial", Utils.s(30));
        loungeLabel.setAnchorPoint(cc.p(0, 0));
        loungeLabel.setPosition(Utils.p(120, 410));
        this.addChild(loungeLabel, 2);

        this.sprite = cc.Sprite.create("res/bg.png");
        this.sprite.setAnchorPoint(cc.p(0, 0));
        this.sprite.setPosition(Utils.p(0, 0));
        this.addChild(this.sprite, 0);

        this._createNextButton();

        this._sudoku = new Sudoku();
        this._level = 30;
        this.start(0);

        return true;
    },

    start: function(levelStep) {
        cc.log("starting...");
        if (this._cells) {
            for (var i = 0; i < TABLE_SIZE; ++i) {
                if (this._cells[i]) {
                    for (var j = 0; j < TABLE_SIZE; ++j) {
                        if (this._cells[i][j]) {
                            this.sprite.removeChild(this._cells[i][j], true);
                        }
                    }
                }
                if (this._candidates[i]) {
                    this.sprite.removeChild(this._candidates[i], true);
                }
            }
        }
        this.createTable(this.sprite, levelStep);
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
        var y = 480 - 93;
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
                cell.setScale(0.22);
                container.addChild(cell);
                this._cells[i][j] = cell;
            }

            var candidate = new Cell(i + 1, this._onSelectCandidate.bind(this, i + 1));
            candidate.setAnchorPoint(cc.p(0, 0));
            candidate.setPosition(Utils.p(x + i * 32, 480 - 370));
            candidate.setScale(0.25);
            container.addChild(candidate, 100);
            this._candidates[i] = candidate;
        }
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
                    cc.CallFunc(this._checkForCandidates.bind(this))
                ));

                this._emptyCell = null;
            }
            else {
                this._candidates[number - 1].runAction(cc.Sequence.create(
                    cc.RotateTo.create(0.05, 20),
                    cc.RotateTo.create(0.1, -20),
                    cc.RotateTo.create(0.05, 0)
                ));
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
    },

    backClicked: function() {
        cc.Director.getInstance().end();
    },

    _createNextButton: function() {
        var next = new Cell("Next", function() {
            this.start(0);
        }.bind(this));
        next.setAnchorPoint(cc.p(0, 0));
        next.setPosition(Utils.p(20, 30));
        this.addChild(next);
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

        this._number = cc.LabelTTF.create("", "Arial", Utils.s(70));
        this._number.setPosition(Utils.p(128 / 2, 126 / 2));
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
    }
});

var MyScene = cc.Scene.extend({
    ctor:function() {
        this._super();
        cc.associateWithNative( this, cc.Scene );
        // this.scheduleUpdate();
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
