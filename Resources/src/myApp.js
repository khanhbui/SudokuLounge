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

        //////////////////////////////
        // 1. super init first
        this._super();

        /////////////////////////////
        // 2. add a menu item with "X" image, which is clicked to quit the program
        //    you may modify it.
        // ask director the window size
        var size = cc.Director.getInstance().getWinSize();

        /////////////////////////////
        // 3. add your codes below...
        // add a label shows "Hello World"
        // create and initialize a label
        this.helloLabel = cc.LabelTTF.create("SUDOKU", "Arial", 30);
        this.helloLabel.setPosition(cc.p(size.width / 2 - 40, size.height - 20));
        this.addChild(this.helloLabel, 5);
        this.helloLabel = cc.LabelTTF.create("LOUNGE", "Arial", 30);
        this.helloLabel.setPosition(cc.p(size.width / 2 + 40, size.height - 50));
        this.addChild(this.helloLabel, 5);

        // add "Helloworld" splash screen"
        this.sprite = cc.Sprite.create("res/bg.png");
        this.sprite.setAnchorPoint(cc.p(0.5, 0.5));
        this.sprite.setPosition(cc.p(size.width / 2, size.height / 2));

        this.addChild(this.sprite, 0);

        this._sudoku = new Sudoku();
        this.createTable(this.sprite);

        return true;
    },

    createTable: function(container) {
        this._sudoku.reset();
        this._sudoku.solve();
        this._sudoku.print();
        var data = this._sudoku.getUnsolvedTable();

        var p = container.getPosition();
        var x = p.x - 125;
        var y = p.y + 148;
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
                var cell = new Cell("" + (data[i][j] == 0 ? "" : data[i][j]), this._onSelectCell.bind(this, i, j));
                cell.setAnchorPoint(cc.p(0.5, 0.5));
                cell.setPosition(cc.p(x + j * 29 + dx, y - i * 28));
                cell.setScale(0.22);
                container.addChild(cell);
                this._cells[i][j] = cell;
            }

            var candidate = new Cell("" + (i + 1), this._onSelectCandidate.bind(this, i + 1));
            candidate.setPosition(x + i * 32, p.y - 130);
            candidate.setScale(0.25);
            container.addChild(candidate);
            candidate.runAction(cc.RepeatForever.create(
                cc.Sequence.create(
                    cc.RotateTo.create(0.2, 5),
                    cc.RotateTo.create(0.2, -5)
                )
            ));
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
                    var cell = this._cells[i][j];
                    if (parseInt(cell.getText()) == this._prevNumber) {
                        cell.setHighlight(0);
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
                this._cells[i][k].setHighlight(1);
                this._cells[k][j].setHighlight(1);
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
                this._emptyCell.setText("" + number);
            }
            else {
                return;
            }
        }
        this._clearHighlight();
        var count = 0;
        for (var i = 0; i < TABLE_SIZE; ++i) {
            for (var j = 0; j < TABLE_SIZE; ++j) {
                var cell = this._cells[i][j];
                if (parseInt(cell.getText()) == number) {
                    cell.setHighlight(2);
                    count++;
                }
            }
        }
        if (count >= 9) {
            this._candidates[number - 1].setVisible(false);
        }
        this._prevNumber = number;
    },

    update: function(elapsed) {
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

        this._number = cc.LabelTTF.create(text, "Arial", 70);
        this._number.setPosition(cc.p(128 / 2, 126 / 2));
        this._image.addChild(this._number);

        var menu = cc.Menu.create(this._image);
        menu.setPosition(cc.p(0, 0));
        this.addChild(menu);
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
