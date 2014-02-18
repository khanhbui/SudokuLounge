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
	}
});

var Utils = new _Utils();