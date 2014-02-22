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

	countNumber: function(number) {
		return this._counts[number];
	},

	canSet: function (number, row, col) {
		return this._result[row][col] == number;
	},

	_try: function(index) {
		if (index >= TABLE_SIZE * TABLE_SIZE) {
			return true;
		}

		var candidates = this._getRandomValues(TABLE_SIZE);

		var row = ~~(index / TABLE_SIZE);
		var col = index % TABLE_SIZE;

		for (var i = 0; i < TABLE_SIZE; ++i) {
			var number = candidates[i];
			var cell = ~~(row / 3) * 3 + ~~(col / 3);

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

	getSolvedTable: function() {
		return this._result;
	},

	getUnsolvedTable: function(level) {
		if (!this._problem) {
			level = level || this._level;
			var samples = this._getRandomValues(TABLE_SIZE * TABLE_SIZE);
			samples = samples.splice(level, TABLE_SIZE * TABLE_SIZE - level);
			cc.log("level: " + level + ", s: " + samples);
			this._problem = [];
			for (var i = 0; i < TABLE_SIZE; ++i) {
				this._problem[i] = [];
				for (var j = 0; j < TABLE_SIZE; ++j) {
					if (samples.indexOf(i * TABLE_SIZE + j + 1) == -1) {
						this._problem[i][j] = 0;
					}
					else {
						var number = this._result[i][j];
						this._problem[i][j] = number;
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