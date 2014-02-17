var Random = cc.Class.extend({
	ctor: function() {
		this.init();
	},

	init: function(){
        this.setSeeds([
            123456789,
            362436069,
            521288629,
            88675123
        ]);
        cc.log("keke");
    },

    /**
     * Set seeds to xorshift
     * @param Array seeds an array of seeds
     */
    setSeeds: function (seeds)
    {
        this.x = (!seeds[0]) ? 123456789 : seeds[0];
        this.y = (!seeds[1]) ? 362436069 : seeds[1];
        this.z = (!seeds[2]) ? 521288629 : seeds[2];
        this.w = (!seeds[3]) ? 88675123 : seeds[3];

        if ((this.x | this.y | this.z | this.w) == 0)
        {
            throw new Error("set at least 1 value");
        }
    },

    /*
     * return Number a number not less than 0 and less than 1
     */
    get: function ()
    {
        return this.getUInt32() / 4294967296;
    },

    /*
     * return Number a number not less than 0 less than 4294967296。
     */
    getUInt32: function ()
    {
        var t = this.x ^ this.x << 11;
        this.x = this.y;
        this.y = this.z;
        this.z = this.w;
        this.w = (this.w ^ this.w >>> 19) ^ (t ^ t >>> 8);
        
        return this.w >>> 0;
    },

    getInt: function(max) {
    	return this.getUInt32() % max;
    }
});

Random.getInstance = function() {
	if (!this.__instance) {
		this.__instance = new Random();
	}
	return this.__instance;
};