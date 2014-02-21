require("src/component/Cell.js");

var Table = cc.Node.extend({
    ctor:function(sudoku) {
        this._super();
        this.setAnchorPoint(cc.p(0, 0));

        this._sudoku = sudoku;

        var bg = cc.Sprite.create("res/bg.png");
        bg.setAnchorPoint(cc.p(0, 0));
        this.addChild(bg);

        this._createCells();
        this._createCandidates();

        this._wrongSprite = cc.Sprite.create("res/wrong.png");
        this._wrongSprite.setPosition(Utils.p(320 / 2, 480 / 2));
        this._wrongSprite.setVisible(false);
        this.addChild(this._wrongSprite);

        this._completedSprite = cc.Sprite.create("res/completed.png");
        this._completedSprite.setPosition(Utils.p(320 / 2, 480 / 2));
        this._completedSprite.setVisible(false);
        this.addChild(this._completedSprite);

        return true;
    },

    _createCells: function() {
        this._cells = [];

    	var x = 34;
        var y = 480 - 116;
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

                var cell = new Cell(0, this._onSelectCell.bind(this, i, j));
                cell.setAnchorPoint(cc.p(0, 0));
                cell.setPosition(Utils.p(x + j * 29 + dx, y - i * 28));
                this.addChild(cell);
                this._cells[i][j] = cell;
            }
        }
    },

    _createCandidates: function() {
        this._candidates = [];

        var x = 33;
        var y = 480 - 393;
        for (var i = 0; i < TABLE_SIZE; ++i) {
            var candidate = new Cell(i + 1, this._onSelectCandidate.bind(this, i + 1));
            candidate.setAnchorPoint(cc.p(0, 0));
            candidate.setPosition(Utils.p(x + i * 32, y));
            candidate.setScale(1.15);
            this.addChild(candidate, 100);
            this._candidates[i] = candidate;
        }
    },

    reset: function() {
        this._completedSprite.setVisible(false);

        this._clearHighlight();

        this._sudoku.reset();
        this._sudoku.solve();
        this._sudoku.print();
        data = this._sudoku.getUnsolvedTable(3);
        this._setData(data);

        this._checkCandidates();
        this.setEnabled(false);
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
                    var number = this._sudoku.get(i, j);
                    if (number == this._prevNumber) {
                        this._cells[i][j].setHighlight(0);
                    }
                }
            }
        }
    },

    _setData: function(data) {
        for (var i = 0; i < TABLE_SIZE; ++i) {
            for (var j = 0; j < TABLE_SIZE; ++j) {
                this._cells[i][j].setNumber(data[i][j]);
            }
        }
    },

    _checkCandidates: function() {
        for (var number = 1; number <= TABLE_SIZE; ++number) {
            this._candidates[number - 1].setVisible(this._sudoku.countNumber(number) < 9);
        }
    },

    setEnabled: function(flag) {
        if (this._cells) {
            for (var i = 0; i < TABLE_SIZE; ++i) {
                for (var j = 0; j < TABLE_SIZE; ++j) {
                    this._cells[i][j].setEnabled(flag);
                }
                this._candidates[i].setEnabled(flag);
            }
        }
    },

    _onSelectCell: function(i, j) {
        this._clearHighlight();

        if (this._sudoku.isEmpty(i, j)) {
            for (var k = 0; k < TABLE_SIZE; ++k) {
                if (k != j && !this._sudoku.isEmpty(i, k)) {
                    this._cells[i][k].setHighlight(1);
                }
                if (k != i && !this._sudoku.isEmpty(k, j)) {
                    this._cells[k][j].setHighlight(1);
                }
            }
            this._cells[i][j].setHighlight(3);
            
            this._emptyCell = this._cells[i][j];
            this._prevI = i;
            this._prevJ = j;
        }
        else {
            this._emptyCell = null;
            this._prevI = -1;
            this._prevJ = -1;
            this._onSelectCandidate(this._sudoku.get(i, j));
        }
    },

    _onSelectCandidate: function(number) {
        if (this._emptyCell) {
            var i = this._prevI;
            var j = this._prevJ;

            if (this._sudoku.canSet(number, i, j)) {
                this._emptyCell.setNumber(number);
                this._sudoku.set(number, i, j);

                var index = number - 1;
                var p = this._candidates[index].getPosition();
                this._candidates[index].setZOrder(1000);
                this._candidates[index].runAction(cc.Sequence.create(
                    cc.CallFunc.create(this.setEnabled.bind(this, false)),
                    cc.MoveTo.create(0.3, this._emptyCell.getPosition()),
                    cc.Hide.create(),
                    cc.CallFunc.create(function() {
                        this._candidates[index].setPosition(p);
                        this._candidates[index].setZOrder(100);
                    }.bind(this)),
                    cc.Show.create(),
                    cc.CallFunc.create(function() {
                        this._checkCandidates();
                        this._sudoku.setScore(20);

                        this._checkCompleted();
                        this.setEnabled(true);
                    }.bind(this))
                ));

                this._emptyCell = null;
            }
            else {
                this._candidates[number - 1].runAction(cc.Sequence.create(
                    cc.CallFunc.create(this.setEnabled.bind(this, false)),
                    cc.RotateTo.create(0.05, 20),
                    cc.RotateTo.create(0.1, -20),
                    cc.RotateTo.create(0.05, 0),
                    cc.CallFunc.create(function() {
                        this._sudoku.setScore(-10);

                        this._wrongSprite.runAction(cc.Sequence.create(
                            cc.FadeOut.create(0),
                            cc.Show.create(),
                            cc.FadeIn.create(0.2),
                            cc.FadeOut.create(0.5),
                            cc.Hide.create(),
                            cc.CallFunc.create(this.setEnabled.bind(this, true))
                        ));
                    }.bind(this))
                ));
                return;
            }
        }

        this._clearHighlight();
        for (var i = 0; i < TABLE_SIZE; ++i) {
            for (var j = 0; j < TABLE_SIZE; ++j) {
                if (this._sudoku.get(i, j) == number) {
                    this._cells[i][j].setHighlight(2);
                }
            }
        }
        this._prevNumber = number;
    },

    _checkCompleted: function() {
        if (this._sudoku.isCompleted()) {
            this._completedSprite.runAction(cc.Sequence.create(
                cc.FadeOut.create(0),
                cc.Show.create(),
                cc.FadeIn.create(0.5)
            ));
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