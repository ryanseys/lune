var assert = require("assert");
var lune = require('../lib/lune');

describe('lune', function() {
  describe('#phase()', function() {
    it('should return expected values for feb 17th data', function() {

      var feb17 = {
        phase: 0.5616632223402672,
        illuminated: 0.9629393807872504,
        age: 16.586245595613818,
        distance: 396868.3763643785,
        angular_diameter: 0.5018242066159135,
        sun_distance: 147816061.66410872,
        sun_angular_diameter: 0.5395080276270386
      };

      // this is 17 Feb 2014 00:00 EST
      var lunedata = lune.phase(new Date(1392613200000));

      assert.equal(JSON.stringify(feb17), JSON.stringify(lunedata));
    });
  });

    describe('#phase_hunt', function() {
        it('should handle timezones correctly', function() {
            var d = new Date(1414837560000);
            var hunt = lune.phase_hunt(d);
            // 1415292777000 incorrect EST time
            // 1415312577000 correct UTC time
            assert(1415312577000, hunt.full_date.getTime());
        });
    });
});
