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

require("src/component/Table.js");

var MyLayer = cc.Layer.extend({
    ctor:function() {
        this._super();
        cc.associateWithNative(this, cc.Layer);
    },

    init:function () {
        this._super();

        this.setKeypadEnabled(true);

        this._sudoku = new Sudoku();

        this._table = new Table(this._sudoku);
        this._table.setPosition(Utils.p(0, 50));
        this.addChild(this._table);

        this._createScorePanels();
        this._createButtons();

        return true;
    },

    update: function(elapsed) {
        if (!this._isPlaying || this._sudoku.isCompleted()) {
            return;
        }

        this._scoreLabel.setString("Score: " + this._sudoku.getScore());
        this._timeLabel.setString("Time: " + Utils.formatTime(this._sudoku.getTime()));
        this._sudoku.setTime(elapsed);
    },

    backClicked: function() {
        cc.Director.getInstance().end();
    },

    _createButtons: function() {
        var x = 50;
        var y = 82;
        var reset = new Button(["res/reset.png", "res/reset_disable.png", "res/reset_disable.png"], [x, y], function() {
            cc.log("reset");
            this._table.reset();
            play.setEnabled(true);
            pause.setEnabled(false);
        }.bind(this));
        this.addChild(reset);

        var play = new Button(["res/play.png", "res/play_disable.png", "res/play_disable.png"], [x + 55, y], function() {
            cc.log("play");
            play.setEnabled(false);
            pause.setEnabled(true);
            this._table.setEnabled(true);
            this._isPlaying = true;
        }.bind(this));
        play.setEnabled(true);
        this.addChild(play);

        var pause = new Button(["res/pause.png", "res/pause_disable.png", "res/pause_disable.png"], [x + 55 * 2, y], function() {
            cc.log("pause");
            play.setEnabled(true);
            pause.setEnabled(false);
            this._table.setEnabled(false);
            this._isPlaying = false;
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
        var y = 395 + 50;
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
