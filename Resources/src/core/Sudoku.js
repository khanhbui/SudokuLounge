require("src/core/Random.js");

var TABLE_SIZE = 9;
var LEVEL_STEPS = 3;

var Sudoku = cc.Class.extend({
	_rows: null,
	_cols: null,
	_cells: null,
	_level: 30,

	reset: function() {
		this._rows = [];
		this._cols = [];
		this._cells = [];
		this._result = [];
		this._problem = null;
		this._counts = [];
		this._score = 0;
		this._time = 0;

		for (var i = 0; i < TABLE_SIZE; ++i) {
			this._rows[i] = [];
			this._cols[i] = [];
			this._cells[i] = [];
			this._result[i] = [];
			this._counts[i + 1] = 0;
			for (var j = 1; j <= TABLE_SIZE; ++j) {
				this._rows[i][j] = true;
				this._cols[i][j] = true;
				this._cells[i][j] = true;
				this._result[i][j - 1] = 0;
			}
		}
	},

	solve: function() {
		this._try(0);
	},

	print: function() {
		cc.log('*****************************');
		for (var i = 0; i < TABLE_SIZE; ++i) {
			var s = '';
			for (var j = 0; j < TABLE_SIZE; ++j) {
				s += this._result[i][j] + ' ';
				if (j == 2 || j == 5) {
					s += '| ';
				}
			}
			cc.log(s);
			if (i == 2 || i == 5) {
				cc.log('-------------------------------');
			}
		}
		cc.log('*****************************');
	},

	printT: function() {
		cc.log('*****************************');
		for (var i = 0; i < TABLE_SIZE; ++i) {
			var s = '';
			for (var j = 0; j < TABLE_SIZE; ++j) {
				s += this._tResult[i][j] + ' ';
				if (j == 2 || j == 5) {
					s += '| ';
				}
			}
			cc.log(s);
			if (i == 2 || i == 5) {
				cc.log('-------------------------------');
			}
		}
		cc.log('*****************************');
	},

	countNumber: function(number) {
		return this._counts[number];
	},

	canSet: function (number, row, col) {
		var value = false;
		var cell = ~~(row / 3) * 3 + ~~(col / 3);
		if (this.isSatisfied(number, row, col, cell)) {
			this._problem[row][col] = number;

			this._tRows = [];
			this._tCols = [];
			this._tCells = [];
			this._tResult = [];
			for (var i = 0; i < TABLE_SIZE; ++i) {
				this._tRows[i] = [];
				this._tCols[i] = [];
				this._tCells[i] = [];
				this._tResult[i] = [];
				for (var j = 1; j <= TABLE_SIZE; ++j) {
					this._tRows[i][j] = true;
					this._tCols[i][j] = true;
					this._tCells[i][j] = true;
					this._tResult[i][j - 1] = 0;
				}
			}

			for (var i = 0; i < TABLE_SIZE; ++i) {
				for (var j = 0; j < TABLE_SIZE; ++j) {
					if (this._problem[i][j] > 0) {
						this._tRows[i][this._problem[i][j]] = false;
						this._tCols[j][this._problem[i][j]] = false;
						this._tCells[~~(i / 3) * 3 + ~~(j / 3)][this._problem[i][j]] = false;
					}
				}
			}

			value = this._canSet(0);
			this._problem[row][col] = 0;

			cc.log("canSet: here");
		}

		return value;
	},

	_canSet: function(index) {
		if (index >= TABLE_SIZE * TABLE_SIZE) {
			this.printT();
			return true;
		}

		var row = ~~(index / TABLE_SIZE);
		var col = index % TABLE_SIZE;
		var cell = ~~(row / 3) * 3 + ~~(col / 3);

		var number = this._problem[row][col];
		if (number != 0) {
			this._tRows[row][number] = false;
			this._tCols[col][number] = false;
			this._tCells[cell][number] = false;
			this._tResult[row][col] = number;
			return this._canSet(index + 1);
		}
		else {
			for (var number = 1; number <= TABLE_SIZE; ++number) {
				if (this.isSatisfiedT(number, row, col, cell)) {
					this._tRows[row][number] = false;
					this._tCols[col][number] = false;
					this._tCells[cell][number] = false;
					this._tResult[row][col] = number;

					if (this._canSet(index + 1)) {
						return true;
					}

					this._tRows[row][number] = true;
					this._tCols[col][number] = true;
					this._tCells[cell][number] = true;
					this._tResult[row][col] = 0;
				}
			}

			return false;
		}
	},

	_try: function(index) {
		if (index >= TABLE_SIZE * TABLE_SIZE) {
			return true;
		}

		var candidates = this._getRandomValues(TABLE_SIZE);

		var row = ~~(index / TABLE_SIZE);
		var col = index % TABLE_SIZE;
		var cell = ~~(row / 3) * 3 + ~~(col / 3);

		for (var i = 0; i < TABLE_SIZE; ++i) {
			var number = candidates[i];

			if (this.isSatisfied(number, row, col, cell)) {
				this._rows[row][number] = false;
				this._cols[col][number] = false;
				this._cells[cell][number] = false;
				this._result[row][col] = number;

				if (this._try(index + 1)) {
					return true;
				}

				this._rows[row][number] = true;
				this._cols[col][number] = true;
				this._cells[cell][number] = true;
				this._result[row][col] = 0;
			}
		}

		return false;
	},

	_getRandomValues: function(size) {
		var values = [];
		for (var i = 0; i < size; ++i) {
			values[i] = i + 1;
		}

		for (var i = 0; i < size; ++i) {
			var j = Random.getInstance().getInt(size);
			var k = Random.getInstance().getInt(size);
			if (j != k) {
				var temp = values[j];
				values[j] = values[k];
				values[k] = temp;
			}
		}
		return values;
	},

	isSatisfied: function(number, row, col, cell) {
		return (this._rows[row][number] && this._cols[col][number] && this._cells[cell][number]);
	},

	isSatisfiedT: function(number, row, col, cell) {
		return (this._tRows[row][number] && this._tCols[col][number] && this._tCells[cell][number]);
	},

	getSolvedTable: function() {
		return this._result;
	},

	getUnsolvedTable: function(level) {
		if (!this._problem) {
			level = level || this._level;
			var samples = this._getRandomValues(TABLE_SIZE * TABLE_SIZE);
			samples = samples.splice(level, TABLE_SIZE * TABLE_SIZE - level);
			cc.log("level: " + level + ", s: " + samples);

			/*
			//For testing
			this._result = [
				[8, 5, 9, 3, 2, 4, 6, 1, 7],
				[1, 3, 7, 5, 8, 6, 9, 2, 4],
				[2, 4, 6, 1, 9, 7, 8, 3, 5],
				[7, 9, 2, 4, 8, 3, 1, 5, 6],
				[4, 6, 5, 9, 7, 1, 2, 8, 3],
				[3, 1, 8, 2, 6, 5, 4, 7, 9],
				[5, 7, 1, 8, 4, 9, 3, 6, 2],
				[6, 2, 4, 7, 1, 3, 5, 9, 8],
				[9, 8, 3, 6, 5, 2, 7, 4, 1]
			];
			samples = [
				6 * TABLE_SIZE + 2 + 1,
				6 * TABLE_SIZE + 4 + 1,
				7 * TABLE_SIZE + 2 + 1,
				7 * TABLE_SIZE + 4 + 1
			];
			*/

			this._problem = [];
			for (var i = 0; i < TABLE_SIZE; ++i) {
				this._problem[i] = [];
				for (var j = 0; j < TABLE_SIZE; ++j) {
					var number = this._result[i][j];
					if (samples.indexOf(i * TABLE_SIZE + j + 1) == -1) {
						this._problem[i][j] = 0;
						this._rows[i][number] = true;
						this._cols[j][number] = true;
						this._cells[~~(i / 3) * 3 + ~~(j / 3)][number] = true;
					}
					else {
						this._problem[i][j] = number;
						this._rows[i][number] = false;
						this._cols[j][number] = false;
						this._cells[~~(i / 3) * 3 + ~~(j / 3)][number] = false;
						this._counts[number]++;
					}
				}
			}
		}
		cc.log("counts: " + this._counts);
		return this._problem;
	},

	get: function(i, j) {
		return this._problem ? this._problem[i][j] : undefined;
	},

	set: function(number, i, j) {
		if (!this._problem) {
			this._problem = [];
		}
		if (!this._problem[i]) {
			this._problem[i] = [];
		}
		this._problem[i][j] = number;
		this._rows[i][number] = false;
		this._cols[j][number] = false;
		this._cells[~~(i / 3) * 3 + ~~(j / 3)][number] = false;
		this._counts[number]++;

		return number;
	},

	isEmpty: function(i, j) {
		return this._problem ? this._problem[i][j] == 0 : false;
	},

	isCompleted: function() {
		if (this._counts) {
			for (var i = 1; i <= TABLE_SIZE; ++i) {
				if (this._counts[i] < 9) {
					return false;
				}
			}
			return true;
		}
		return false;
	},

	setScore: function(score) {
		this._score += score;
		return this._score;
	},

	getScore: function() {
		return this._score;
	},

	getTime: function() {
		return this._time;
	},

	setTime: function(time) {
		this._time += time;
		return this._time;
	},

	increaseLevel: function() {
		this._level = Math.min(this._level + LEVEL_STEPS, 60);
	}
});