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

// Moon's angular size at distance a from Earth
const MOON_ANGULAR_SIZE = 0.5181

// Semi-mojor axis of the Moon's orbit, in kilometers
const MOON_SMAXIS = 384401.0

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

  // Mean anomaly of the Sun
  // XXX: capital vars should only be used for local constants
  const N = fixangle((360 / 365.2422) * day)

  // Convert from perigee coordinates to epoch 1980
  // XXX: capital vars should only be used for local constants
  const M = fixangle(N + ECLIPTIC_LONGITUDE_EPOCH - ECLIPTIC_LONGITUDE_PERIGEE)

  // Solve Kepler's equation
  // True anomaly
  // XXX: capital vars should only be used for local constants
  let Ec = kepler(M, ECCENTRICITY)
  Ec = Math.sqrt((1 + ECCENTRICITY) / (1 - ECCENTRICITY)) * Math.tan(Ec / 2)
  Ec = 2 * todeg(Math.atan(Ec))

  // Suns's geometric ecliptic longuitude
  const lambda_sun = fixangle(Ec + ECLIPTIC_LONGITUDE_PERIGEE)

  // Orbital distance factor
  // XXX: capital vars should only be used for local constants
  const F = ((1 + ECCENTRICITY * dcos(Ec)) / (1 - ECCENTRICITY * ECCENTRICITY))

  // Distance to Sun in km
  const sun_dist = SUN_SMAXIS / F
  const sun_angular_diameter = F * SUN_ANGULAR_SIZE_SMAXIS

  // Calculation of the Moon's position

  // Moon's mean longitude
  const moon_longitude = fixangle(13.1763966 * day + MOON_MEAN_LONGITUDE_EPOCH)

  // Moon's mean anomaly
  // XXX: capital vars should only be used for local constants
  const MM = fixangle(moon_longitude - 0.1114041 * day - MOON_MEAN_PERIGEE_EPOCH)

  const evection = 1.2739 * dsin(2 * (moon_longitude - lambda_sun) - MM)

  // Annual equation
  const annual_eq = 0.1858 * dsin(M)

  // Correction term
  // XXX: capital vars should only be used for local constants
  const A3 = 0.37 * dsin(M)

  // XXX: capital vars should only be used for local constants
  const MmP = MM + evection - annual_eq - A3

  // Correction for the equation of the centre
  const mEc = 6.2886 * dsin(MmP)

  // Another correction term
  // XXX: capital vars should only be used for local constants
  const A4 = 0.214 * dsin(2 * MmP)

  // Corrected longitude
  const lP = moon_longitude + evection + mEc - annual_eq + A4

  // Variation
  const variation = 0.6583 * dsin(2 * (lP - lambda_sun))

  // True longitude
  const lPP = lP + variation

  // Calculation of the phase of the Moon

  // Age of the Moon, in degrees
  const moon_age = lPP - lambda_sun

  // Phase of the Moon
  const moon_phase = (1 - dcos(moon_age)) / 2.0

  // Calculate distance of Moon from the centre of the Earth
  const moon_dist = (MOON_SMAXIS * (1 - MOON_ECCENTRICITY * MOON_ECCENTRICITY)) / (1 + MOON_ECCENTRICITY * dcos(MmP + mEc))

  // Calculate Moon's angular diameter
  const moon_diam_frac = moon_dist / MOON_SMAXIS
  const moon_angular_diameter = MOON_ANGULAR_SIZE / moon_diam_frac

  return {
    phase: fixangle(moon_age) / 360.0,
    illuminated: moon_phase,
    age: SYNODIC_MONTH * fixangle(moon_age) / 360.0,
    distance: moon_dist,
    angular_diameter: moon_angular_diameter,
    sun_distance: sun_dist,
    sun_angular_diameter: sun_angular_diameter
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
 * Given a K value used to determine the mean phase of the new
 * moon, and a phase selector (0.0, 0.25, 0.5, 0.75), obtain the
 * true, corrected phase time.
 * @param  {[type]} k      [description]
 * @param  {[type]} tphase [description]
 * @return {[type]}        [description]
 */
function truephase (k, tphase) {
  // add phase to new moon time
  k = k + 0.25 * tphase

  // Time in Julian centuries from 1900 January 0.5
  const t = k / 1236.85

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

  switch (tphase & 3) {
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

      switch (tphase & 1) {
        case (FIRST & 1):
          pt += 0.0028 - 0.0004 * dcos(m) + 0.0003 * dcos(mprime)
          break

        case (LAST & 1):
          pt += -0.0028 + 0.0004 * dcos(m) - 0.0003 * dcos(mprime)
          break
      }
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
  let k1 = Math.floor(12.3685 * (adate.getFullYear() + ((1.0 / 12.0) * adate.getMonth()) - 1900))
  let nt1 = meanphase(adate.getTime(), k1)

  sdate = julian.fromDate(sdate)
  adate = nt1

  let k2
  let nt2
  while (1) {
    adate = adate + SYNODIC_MONTH
    k2 = k1 + 1
    nt2 = meanphase(adate, k2)
    if (nt1 <= sdate && sdate < nt2) {
      break
    }
    nt1 = nt2
    k1 = k2
  }

  return {
    new_date: truephase(k1, NEW),
    q1_date: truephase(k1, FIRST),
    full_date: truephase(k1, FULL),
    q3_date: truephase(k1, LAST),
    nextnew_date: truephase(k2, NEW)
  }
}

exports.phase = phase
exports.phase_hunt = phase_hunt
