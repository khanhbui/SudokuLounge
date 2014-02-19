var _Utils = cc.Class.extend({
	ctor: function() {
		var size = cc.Director.getInstance().getWinSize();

		this._screenWidth = size.width;
		this._screenHeight = size.height;

		var scaleW = 320 / size.width;
		var scaleH = 480 / size.height;
		this._scaleFactor = scaleW > scaleH ? scaleW : scaleH;
	},

	p: function(x, y) {
		return cc.p(x / this._scaleFactor, y / this._scaleFactor);
	},

	s: function(s) {
		return s / this._scaleFactor;
	},

	getFormattedNumber : function(value) {
        if (value < 10) {
            return "0" + value;
        }

        return value;
    },

	formatTime: function(value) {
		var h = Math.floor(value / 3600);
        value -= h * 3600;
        h = h > 0 ? h : 0;

        var m = Math.floor(value / 60);
        value -= m * 60;
        m = m > 0 ? m : 0;

        var s = Math.floor(value);
        s = s > 0 ? s : 0;

        return this.getFormattedNumber(h) + ":" + this.getFormattedNumber(m) + ":" + this.getFormattedNumber(s);
	}
});

var Utils = new _Utils();