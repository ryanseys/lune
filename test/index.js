var assert = require("assert");
var lune = require("../lib/lune");
var julian = require("../lib/julian");

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
      assert.equal(1415312577000, hunt.full_date.getTime());
    });
  });
});

describe("julian", function() {
  describe("#from_date", function() {
    /* http://aa.usno.navy.mil/data/docs/JulianDate.php */
    it("should convert 2000-01-01T00:00Z to 2451544.5", function() {
      assert.equal(julian.from_date(new Date("2000-01-01T00:00Z")), 2451544.5);
    });
  });

  describe("#to_date", function() {
    /* http://aa.usno.navy.mil/data/docs/JulianDate.php */
    it("should convert 2457464.179862 to 2016-03-16T16:19Z", function() {
      // input was only to second resolution, so lets not be too picky :)
      var date = julian.to_date(2457464.179862);
      date.setUTCMilliseconds(0);

      assert.equal(date.getTime(), new Date("2016-03-16T16:19Z").getTime());
    });
  });
});
