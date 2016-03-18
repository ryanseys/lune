/* global describe, it */
'use strict'
const assert = require('chai').assert
const julian = require('../lib/julian')
const lune = require('../lib/lune')

describe('lune', function () {
  const observations = [
    ['1989-01-07T19:22Z', 0.00, lune.PHASE_NEW],
    ['1989-01-14T13:58Z', 0.25, lune.PHASE_FIRST],
    ['1989-01-21T21:33Z', 0.50, lune.PHASE_FULL],
    ['1989-01-30T02:02Z', 0.75, lune.PHASE_LAST],
    ['1989-02-06T07:37Z', 0.00, lune.PHASE_NEW],
    ['1989-02-12T23:15Z', 0.25, lune.PHASE_FIRST],
    ['1989-02-20T15:32Z', 0.50, lune.PHASE_FULL],
    ['1989-02-28T20:08Z', 0.75, lune.PHASE_LAST],
    ['1989-03-07T18:19Z', 0.00, lune.PHASE_NEW],
    ['1989-03-14T10:11Z', 0.25, lune.PHASE_FIRST],
    ['1989-03-22T09:58Z', 0.50, lune.PHASE_FULL],
    ['1989-03-30T10:21Z', 0.75, lune.PHASE_LAST],
    ['1989-04-06T03:33Z', 0.00, lune.PHASE_NEW],
    ['1989-04-12T23:13Z', 0.25, lune.PHASE_FIRST],
    ['1989-04-21T03:13Z', 0.50, lune.PHASE_FULL],
    ['1989-04-28T20:46Z', 0.75, lune.PHASE_LAST],
    ['1989-05-05T11:46Z', 0.00, lune.PHASE_NEW],
    ['1989-05-12T14:19Z', 0.25, lune.PHASE_FIRST],
    ['1989-05-20T18:16Z', 0.50, lune.PHASE_FULL],
    ['1989-05-28T04:01Z', 0.75, lune.PHASE_LAST],
    ['1989-06-03T19:53Z', 0.00, lune.PHASE_NEW],
    ['1989-06-11T06:59Z', 0.25, lune.PHASE_FIRST],
    ['1989-06-19T06:57Z', 0.50, lune.PHASE_FULL],
    ['1989-06-26T09:09Z', 0.75, lune.PHASE_LAST],
    ['1989-07-03T04:59Z', 0.00, lune.PHASE_NEW],
    ['1989-07-11T00:19Z', 0.25, lune.PHASE_FIRST],
    ['1989-07-18T17:42Z', 0.50, lune.PHASE_FULL],
    ['1989-07-25T13:31Z', 0.75, lune.PHASE_LAST],
    ['1989-08-01T16:06Z', 0.00, lune.PHASE_NEW],
    ['1989-08-09T17:28Z', 0.25, lune.PHASE_FIRST],
    ['1989-08-17T03:07Z', 0.50, lune.PHASE_FULL],
    ['1989-08-23T18:40Z', 0.75, lune.PHASE_LAST],
    ['1989-08-31T05:44Z', 0.00, lune.PHASE_NEW],
    ['1989-09-08T09:49Z', 0.25, lune.PHASE_FIRST],
    ['1989-09-15T11:51Z', 0.50, lune.PHASE_FULL],
    ['1989-09-22T02:10Z', 0.75, lune.PHASE_LAST],
    ['1989-09-29T21:47Z', 0.00, lune.PHASE_NEW]
  ]

  describe('#phase()', function () {
    it('should return expected values for Feb 17th data', function () {
      const phase = lune.phase(new Date('2014-02-17T00:00-0500'))

      assert.closeTo(phase.phase, 0.568, 0.001)
      assert.closeTo(phase.illuminated, 0.955, 0.001)
      assert.closeTo(phase.age, 16.779, 0.030)
      assert.closeTo(phase.distance, 396084.5, 384.4)
      assert.closeTo(phase.angular_diameter, 0.5028, 0.0005)
      assert.closeTo(phase.sun_distance, 147822500, 149600)
      assert.closeTo(phase.sun_angular_diameter, 0.5395, 0.0005)
    })

    // http://bazaar.launchpad.net/~keturn/py-moon-phase/trunk/view/head:/moontest.py
    it('should be accurate to astronomical observations', function () {
      let error = 0
      for (let obs of observations) {
        let e = Math.abs(lune.phase(new Date(obs[0])).phase - obs[1])
        if (e > 0.5) {
          // phase is circular
          e = 1 - e
        }

        error += e
      }

      // tolerate an average error of up to a tenth of a percent
      assert.isAtMost(error / observations.length, 0.001)
    })
  })

  describe('#phase_hunt', function () {
    it('should handle timezones correctly', function () {
      // 1415292777000 incorrect EST time
      // 1415312577000 correct UTC time
      // date conversion is now accurate to the millisecond, but these tests
      // were written when they were only accurate to the second
      assert.closeTo(
        lune.phase_hunt(new Date('2014-11-01T06:26-0400')).full_date.getTime(),
        1415312577000,
        500
      )
    })
  })

  describe('#phase_range', function () {
    const PHASES = [
      lune.PHASE_NEW,
      lune.PHASE_FIRST,
      lune.PHASE_FULL,
      lune.PHASE_LAST
    ]

    /* http://aa.usno.navy.mil/data/docs/JulianDate.php */
    it('should return all moon phases within a time range', function () {
      let error = 0

      for (let phase of PHASES) {
        const actual = lune.phase_range(
          new Date('1989-01-01T00:00Z'),
          new Date('1989-10-01T00:00Z'),
          phase
        )
        const expected = observations.filter(function (obs) {
          return obs[2] === phase
        })
        assert.strictEqual(actual.length, expected.length)

        for (let i = 0; i < actual.length; i++) {
          const date = actual[i]
          const obs = new Date(expected[i][0])

          error += Math.abs(date.getTime() - obs.getTime())
        }
      }

      // tolerate an average error of up to five minutes
      assert.isAtMost(error / observations.length, 300000)
    })
  })
})

describe('julian', function () {
  describe('#fromDate', function () {
    /* http://aa.usno.navy.mil/data/docs/JulianDate.php */
    it('should convert 2000-01-01T00:00Z to 2451544.5', function () {
      assert.closeTo(
        julian.fromDate(new Date('2000-01-01T00:00Z')),
        2451544.5,
        0.5 / 86400
      )
    })
  })

  describe('#toDate', function () {
    /* http://aa.usno.navy.mil/data/docs/JulianDate.php */
    it('should convert 2457464.179862 to 2016-03-16T16:19Z', function () {
      assert.closeTo(
        julian.toDate(2457464.179862).getTime(),
        (new Date('2016-03-16T16:19Z')).getTime(),
        500
      )
    })
  })
})
