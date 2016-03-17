/**
 * This library calculates the current phase of the moon
 * as well as finds the dates of the recent moon phases.
 *
 * Ported from python version found here:
 * https://bazaar.launchpad.net/~keturn/py-moon-phase/trunk/annotate/head:/moon.py
 *
 * Author: Ryan Seys (https://github.com/ryanseys)
 */

'use strict'

const julian = require('./julian')

// Phases of the moon & precision
const NEW = 0
const FIRST = 1
const FULL = 2
const LAST = 3
const PHASE_MASK = 3

// Astronomical Constants
// JDN stands for Julian Day Number
// Angles here are in degrees
// 1980 January 0.0 in JDN
// XXX: DateTime(1980).jdn yields 2444239.5 -- which one is right?
// XXX: even though 2444239.5 is correct for the 1 Jan 1980, 2444238.5 gives
// better accuracy results... possibly somebody chose all of the below
// constants based on the wrong epoch?
const EPOCH = 2444238.5

// Ecliptic longitude of the Sun at epoch 1980.0
const ECLIPTIC_LONGITUDE_EPOCH = 278.833540

// Ecliptic longitude of the Sun at perigee
const ECLIPTIC_LONGITUDE_PERIGEE = 282.596403

// Eccentricity of Earth's orbit
const ECCENTRICITY = 0.016718

// Semi-major axis of Earth's orbit, in kilometers
const SUN_SMAXIS = 1.49585e8

// Sun's angular size, in degrees, at semi-major axis distance
const SUN_ANGULAR_SIZE_SMAXIS = 0.533128

// Elements of the Moon's orbit, epoch 1980.0
// Moon's mean longitude at the epoch
const MOON_MEAN_LONGITUDE_EPOCH = 64.975464

// Mean longitude of the perigee at the epoch
const MOON_MEAN_PERIGEE_EPOCH = 349.383063

// Eccentricity of the Moon's orbit
const MOON_ECCENTRICITY = 0.054900

// Semi-major axis of the Moon's orbit, in kilometers
const MOON_SMAXIS = 384401.0

// MOON_SMAXIS premultiplied by the angular size of the Moon from the Earth
const MOON_ANGULAR_SIZE_SMAXIS = MOON_SMAXIS * 0.5181

// Synodic month (new Moon to new Moon), in days
const SYNODIC_MONTH = 29.53058868

function fixangle (a) {
  return a - 360.0 * Math.floor(a / 360.0)
}

/**
 * Convert degrees to radians
 * @param  {Number} d Angle in degrees
 * @return {Number}   Angle in radians
 */
function torad (d) {
  return (Math.PI / 180.0) * d
}

/**
 * Convert radians to degrees
 * @param  {Number} r Angle in radians
 * @return {Number}   Angle in degrees
 */
function todeg (r) {
  return (180.0 / Math.PI) * r
}

function dsin (d) {
  return Math.sin(torad(d))
}

function dcos (d) {
  return Math.cos(torad(d))
}

/**
 * Solve the equation of Kepler.
 */
function kepler (m, ecc) {
  const epsilon = 1e-6

  m = torad(m)
  let e = m
  while (1) {
    const delta = e - ecc * Math.sin(e) - m
    e -= delta / (1.0 - ecc * Math.cos(e))

    if (Math.abs(delta) <= epsilon) {
      break
    }
  }

  return e
}

/**
 * Finds the phase information for specific date.
 * @param  {Date} phase_date Date to get phase information of.
 * @return {Object}          Phase data
 */
function phase (phase_date) {
  if (!phase_date) {
    phase_date = new Date()
  }
  phase_date = julian.fromDate(phase_date)

  const day = phase_date - EPOCH

  // calculate sun position
  const sun_mean_anomaly =
    (360.0 / 365.2422) * day +
    (ECLIPTIC_LONGITUDE_EPOCH - ECLIPTIC_LONGITUDE_PERIGEE)
  const sun_true_anomaly =
    2 * todeg(Math.atan(
      Math.sqrt((1.0 + ECCENTRICITY) / (1.0 - ECCENTRICITY)) *
      Math.tan(0.5 * kepler(sun_mean_anomaly, ECCENTRICITY))
    ))
  const sun_ecliptic_longitude =
    ECLIPTIC_LONGITUDE_PERIGEE + sun_true_anomaly
  const sun_orbital_distance_factor =
    (1 + ECCENTRICITY * dcos(sun_true_anomaly)) /
    (1 - ECCENTRICITY * ECCENTRICITY)

  // calculate moon position
  const moon_mean_longitude =
    MOON_MEAN_LONGITUDE_EPOCH + 13.1763966 * day
  const moon_mean_anomaly =
    moon_mean_longitude - 0.1114041 * day - MOON_MEAN_PERIGEE_EPOCH
  const moon_evection =
    1.2739 * dsin(
      2 * (moon_mean_longitude - sun_ecliptic_longitude) - moon_mean_anomaly
    )
  const moon_annual_equation =
    0.1858 * dsin(sun_mean_anomaly)
  // XXX: what is the proper name for this value?
  const moon_mp =
    moon_mean_anomaly +
    moon_evection -
    moon_annual_equation -
    0.37 * dsin(sun_mean_anomaly)
  const moon_equation_center_correction =
    6.2886 * dsin(moon_mp)
  const moon_corrected_longitude =
    moon_mean_longitude +
    moon_evection +
    moon_equation_center_correction -
    moon_annual_equation +
    0.214 * dsin(2.0 * moon_mp)
  const moon_age =
    fixangle(
      moon_corrected_longitude -
      sun_ecliptic_longitude +
      0.6583 * dsin(
        2 * (moon_corrected_longitude - sun_ecliptic_longitude)
      )
    )
  const moon_distance =
    (MOON_SMAXIS * (1.0 - MOON_ECCENTRICITY * MOON_ECCENTRICITY)) /
    (1.0 + MOON_ECCENTRICITY * dcos(moon_mp + moon_equation_center_correction))

  return {
    phase: (1.0 / 360.0) * moon_age,
    illuminated: 0.5 * (1.0 - dcos(moon_age)),
    age: (SYNODIC_MONTH / 360.0) * moon_age,
    distance: moon_distance,
    angular_diameter: MOON_ANGULAR_SIZE_SMAXIS / moon_distance,
    sun_distance: SUN_SMAXIS / sun_orbital_distance_factor,
    sun_angular_diameter: SUN_ANGULAR_SIZE_SMAXIS * sun_orbital_distance_factor
  }
}

/**
 * Calculates time of the mean new Moon for a given base date.
 * This argument K to this function is the precomputed synodic month
 * index, given by:
 *   K = (year - 1900) * 12.3685
 * where year is expressed as a year and fractional year.
 * @param  {Date} sdate   Start date
 * @param  {[type]} k     [description]
 * @return {[type]}       [description]
 */
function meanphase (sdate, k) {
  // Time in Julian centuries from 1900 January 12 noon UTC
  const delta_t = (sdate - -2208945600000.0) / 86400000.0
  const t = delta_t / 36525
  return 2415020.75933 +
    SYNODIC_MONTH * k +
    (0.0001178 - 0.000000155 * t) * t * t +
    0.00033 * dsin(166.56 + (132.87 - 0.009173 * t) * t)
}

/**
 * Given a K value used to determine the mean phase of the new moon, and a
 * phase selector (0, 1, 2, 3), obtain the true, corrected phase time.
 * @param  {[type]} k      [description]
 * @param  {[type]} tphase [description]
 * @return {[type]}        [description]
 */
function truephase (k, tphase) {
  // restrict tphase to (0, 1, 2, 3)
  tphase = tphase & PHASE_MASK

  // add phase to new moon time
  k = k + 0.25 * tphase

  // Time in Julian centuries from 1900 January 0.5
  const t = (1.0 / 1236.85) * k

  // Mean time of phase
  let pt = 2415020.75933 +
    SYNODIC_MONTH * k +
    (0.0001178 - 0.000000155 * t) * t * t +
    0.00033 * dsin(166.56 + (132.87 - 0.009173 * t) * t)

  // Sun's mean anomaly
  const m = 359.2242 + 29.10535608 * k - (0.0000333 - 0.00000347 * t) * t * t

  // Moon's mean anomaly
  const mprime = 306.0253 + 385.81691806 * k + (0.0107306 + 0.00001236 * t) * t * t

  // Moon's argument of latitude
  const f = 21.2964 + 390.67050646 * k - (0.0016528 - 0.00000239 * t) * t * t

  // use different correction equations depending on the phase being sought
  switch (tphase) {
    // new and full moon use one correction
    case NEW:
    case FULL:
      pt += (0.1734 - 0.000393 * t) * dsin(m) +
        0.0021 * dsin(2 * m) -
        0.4068 * dsin(mprime) +
        0.0161 * dsin(2 * mprime) -
        0.0004 * dsin(3 * mprime) +
        0.0104 * dsin(2 * f) -
        0.0051 * dsin(m + mprime) -
        0.0074 * dsin(m - mprime) +
        0.0004 * dsin(2 * f + m) -
        0.0004 * dsin(2 * f - m) -
        0.0006 * dsin(2 * f + mprime) +
        0.0010 * dsin(2 * f - mprime) +
        0.0005 * dsin(m + 2 * mprime)
      break

    // first and last quarter moon use a different correction
    case FIRST:
    case LAST:
      pt += (0.1721 - 0.0004 * t) * dsin(m) +
        0.0021 * dsin(2 * m) -
        0.6280 * dsin(mprime) +
        0.0089 * dsin(2 * mprime) -
        0.0004 * dsin(3 * mprime) +
        0.0079 * dsin(2 * f) -
        0.0119 * dsin(m + mprime) -
        0.0047 * dsin(m - mprime) +
        0.0003 * dsin(2 * f + m) -
        0.0004 * dsin(2 * f - m) -
        0.0006 * dsin(2 * f + mprime) +
        0.0021 * dsin(2 * f - mprime) +
        0.0003 * dsin(m + 2 * mprime) +
        0.0004 * dsin(m - 2 * mprime) -
        0.0003 * dsin(2 * m + mprime)

      // the sign of the last term depends on whether we're looking for a first
      // or last quarter moon!
      const sign = (tphase < FULL) ? +1 : -1
      pt += sign * (0.0028 - 0.0004 * dcos(m) + 0.0003 * dcos(mprime))

      break
  }

  return julian.toDate(pt)
}

/**
 * Find time of phases of the moon which surround the current date.
 * Five phases are found, starting and ending with the new moons
 * which bound the current lunation.
 * @param  {Date} sdate Date to start hunting from (defaults to current date)
 * @return {Object}     Object containing recent past and future phases
 */
function phase_hunt (sdate) {
  if (!sdate) {
    sdate = new Date()
  }

  let adate = new Date(sdate.getTime() - (45 * 86400000)) // 45 days prior
  let k1 = Math.floor(12.3685 * (adate.getFullYear() + (1.0 / 12.0) * adate.getMonth() - 1900))
  let nt1 = meanphase(adate.getTime(), k1)

  sdate = julian.fromDate(sdate)
  adate = nt1 + SYNODIC_MONTH
  let k2 = k1 + 1
  let nt2 = meanphase(adate, k2)
  while (nt1 > sdate || sdate >= nt2) {
    adate += SYNODIC_MONTH
    k1++
    k2++
    nt1 = nt2
    nt2 = meanphase(adate, k2)
  }

  return {
    new_date: truephase(k1, NEW),
    q1_date: truephase(k1, FIRST),
    full_date: truephase(k1, FULL),
    q3_date: truephase(k1, LAST),
    nextnew_date: truephase(k2, NEW)
  }
}

function phase_range (start, end, phase) {
  start = start.getTime()
  end = end.getTime()

  let t = start - 45 * 86400000

  let k
  {
    const d = new Date(t)
    k = Math.floor(12.3685 * (d.getFullYear() + (1.0 / 12.0) * d.getMonth() - 1900))
  }

  let date = truephase(k, phase)
  // skip every phase before starting date
  while (date.getTime() < start) {
    k++
    date = truephase(k, phase)
  }
  // add every phase before (or on!) ending date to a list, and return it
  const list = []
  while (date.getTime() <= end) {
    list.push(date)
    k++
    date = truephase(k, phase)
  }
  return list
}

exports.PHASE_NEW = NEW
exports.PHASE_FIRST = FIRST
exports.PHASE_FULL = FULL
exports.PHASE_LAST = LAST
exports.phase = phase
exports.phase_hunt = phase_hunt
exports.phase_range = phase_range
