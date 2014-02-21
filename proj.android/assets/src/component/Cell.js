var Cell = cc.Node.extend({
    ctor: function(number, onSelect) {
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

        this.setNumber(number);
    },

    setNumber: function(number) {
        this._number.setString(number < 0 ? '?' : number == 0 ? '' : number);
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