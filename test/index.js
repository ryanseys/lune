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
});
