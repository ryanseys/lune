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

      var lunedata = lune.phase(new Date(2014, 1, 17));

      assert.equal(JSON.stringify(feb17), JSON.stringify(lunedata));
    });
  });

    describe('#phase_hunt', function() {
        it('should handle timezones correctly', function() {
            process.env.TZ = 'America/New_York';
            var d = new Date(2014, 10, 1, 16, 56, 00);
            var t = d.getTime();
            assert.equal(1414837560000, t, 'Unable to run timezone test because process.env.TZ quirk. See https://github.com/joyent/node/issues/3286');
            var hunt = lune.phase_hunt(d);
            // 1415292777000 incorrect EST time
            // 1415312577000 correct UTC time
            assert(1415312577000, hunt.full_date.getTime());
        });
    });
});
