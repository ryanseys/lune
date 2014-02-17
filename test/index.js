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

  describe('#phase_hunt()', function() {
    it('should return expected values for feb 17th data', function() {

      var feb17phasehunt = {
        new_date: '2014-01-31T02:40:35.000Z',
        q1_date: '2014-02-07T00:22:34.000Z',
        full_date: '2014-02-15T04:54:47.000Z',
        q3_date: '2014-02-22T22:16:56.000Z',
        nextnew_date: '2014-03-01T13:02:42.000Z'
      };

      var lunedata = lune.phase_hunt(new Date("2014-02-17"));

      assert.equal(JSON.stringify(feb17phasehunt), JSON.stringify(lunedata));
    });
  });
});
