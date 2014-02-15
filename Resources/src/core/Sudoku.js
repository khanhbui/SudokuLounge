require("src/core/Random.js");

var TABLE_SIZE = 9;

var Sudoku = cc.Class.extend({
	_rows: null,
	_cols: null,
	_cells: null,

	reset: function() {
		this._rows = [];
		this._cols = [];
		this._cells = [];
		this._result = [];
		this._problem = [];

		for (var i = 0; i < TABLE_SIZE; ++i) {
			this._rows[i] = [];
			this._cols[i] = [];
			this._cells[i] = [];
			this._result[i] = [];
			this._problem[i] = [];
			for (var j = 1; j <= TABLE_SIZE; ++j) {
				this._rows[i][j] = true;
				this._cols[i][j] = true;
				this._cells[i][j] = true;
				this._result[i][j - 1] = 0;
				this._problem[i][j - 1] = 0;
			}
		}
	},

	solve: function() {
		this._try(0);
	},

	print: function() {
		cc.log('****************************************');
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
				cc.log('----------------------------------------');
			}
		}
		cc.log('***************************************************');
	},

	isValid: function (number, row, col) {
		return this._result[row][col] == number;
	},

	_try: function(index) {
		if (index >= TABLE_SIZE * TABLE_SIZE) {
			return true;
		}

		var candidates = this._getRandomValues();

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
				this._problem[row][col] = (i + number + index) % 3 == 0 ? 0 : number;

				if (this._try(index + 1)) {
					return true;
				}

				this._rows[row][number] = true;
				this._cols[col][number] = true;
				this._cells[cell][number] = true;
				this._result[row][col] = 0;
				this._problem[row][col] = 0;
			}
		}

		return false;
	},

	_getRandomValues: function() {
		var values = [];
		for (var i = 0; i < TABLE_SIZE; ++i) {
			values[i] = i + 1;
		}

		for (var i = 0; i < TABLE_SIZE; ++i) {
			var j = Random.getInstance().getInt(TABLE_SIZE);
			var k = Random.getInstance().getInt(TABLE_SIZE);
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

	getUnsolvedTable: function() {
		return this._problem;
	}
});