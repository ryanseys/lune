// This library calculates the current phase of the moon
// as well as finds the dates of the recent moon phases.
// Ported from python version found here:
// https://bazaar.launchpad.net/~keturn/py-moon-phase/trunk/annotate/head:/moon.py
//
// Author: Ryan Seys


// Phases of the moon & precision
var PRECISION = 0.05;
var NEW = 0 / 4.0;
var FIRST = 1 / 4.0;
var FULL = 2 / 4.0;
var LAST = 3 / 4.0;
var NEXTNEW = 4 / 4.0;

// Source: http://javascript.about.com/library/bljulday.htm
Date.prototype.getJulian = function() {
  return (this / 86400000) -
  (this.getTimezoneOffset()/1440) + 2440587.5;
};

// Source: http://blog.bahrenburgs.com/2011/01/javascript-julian-day-conversions.html
Number.prototype.Julian2Date = function() {
  var X = parseFloat(this)+0.5;
  var Z = Math.floor(X); //Get day without time
  var F = X - Z; //Get time
  var Y = Math.floor((Z-1867216.25)/36524.25);
  var A = Z+1+Y-Math.floor(Y/4);
  var B = A+1524;
  var C = Math.floor((B-122.1)/365.25);
  var D = Math.floor(365.25*C);
  var G = Math.floor((B-D)/30.6001);
  //must get number less than or equal to 12)
  var month = (G<13.5) ? (G-1) : (G-13);
  //if Month is January or February, or the rest of year
  var year = (month<2.5) ? (C-4715) : (C-4716);
  month -= 1; //Handle JavaScript month format
  var UT = B-D-Math.floor(30.6001*G)+F;
  var day = Math.floor(UT);
  //Determine time
  UT -= Math.floor(UT);
  UT *= 24;
  var hour = Math.floor(UT);
  UT -= Math.floor(UT);
  UT *= 60;
  var minute = Math.floor(UT);
  UT -= Math.floor(UT);
  UT *= 60;
  var second = Math.round(UT);

  return new Date(Date.UTC(year, month, day, hour, minute, second));
};

const c = {
  // JDN stands for Julian Day Number
  // Angles here are in degrees

  // 1980 January 0.0 in JDN
  // XXX: DateTime(1980).jdn yields 2444239.5 -- which one is right?
  epoch: 2444238.5,

  // Ecliptic longitude of the Sun at epoch 1980.0
  ecliptic_longitude_epoch: 278.833540,

  // Ecliptic longitude of the Sun at perigee
  ecliptic_longitude_perigee: 282.596403,

  // Eccentricity of Earth's orbit
  eccentricity: 0.016718,

  // Semi-major axis of Earth's orbit, in kilometers
  sun_smaxis: 1.49585e8,

  // Sun's angular size, in degrees, at semi-major axis distance
  sun_angular_size_smaxis: 0.533128,

  // Elements of the Moon's orbit, epoch 1980.0

  // Moon's mean longitude at the epoch
  moon_mean_longitude_epoch: 64.975464,
  // Mean longitude of the perigee at the epoch
  moon_mean_perigee_epoch: 349.383063,

  // Mean longitude of the node at the epoch
  node_mean_longitude_epoch: 151.950429,

  // Inclination of the Moon's orbit
  moon_inclination: 5.145396,

  // Eccentricity of the Moon's orbit
  moon_eccentricity: 0.054900,

  // Moon's angular size at distance a from Earth
  moon_angular_size: 0.5181,

  // Semi-mojor axis of the Moon's orbit, in kilometers
  moon_smaxis: 384401.0,
  // Parallax at a distance a from Earth
  moon_parallax: 0.9507,

  // Synodic month (new Moon to new Moon), in days
  synodic_month: 29.53058868,

  // Base date for E. W. Brown's numbered series of lunations (1923 January 16)
  lunations_base: 2423436.0,

  // #Properties of the Earth
  earth_radius: 6378.16
};

function fixangle(a) {
  return a - 360.0 * Math.floor(a/360.0);
}

function torad(d) {
  return d * Math.PI / 180.0;
}

function todeg(r) {
  return r * 180.0 / Math.PI;
}

function dsin(d) {
  return Math.sin(torad(d));
}

function dcos(d) {
  return Math.cos(torad(d));
}

function kepler(m, ecc) {
  //Solve the equation of Kepler.

  var epsilon = 1e-6;

  m = torad(m);
  var e = m;
  while(1) {
    var delta = e - ecc * Math.sin(e) - m;
    e = e - delta / (1.0 - ecc * Math.cos(e));

    if (Math.abs(delta) <= epsilon) {
      break;
    }
  }

  return e;
}

function phase(phase_date) {
  if(!phase_date) {
    phase_date = (new Date()).getJulian();
  }

  var day = phase_date - c.epoch;

  // Mean anomaly of the Sun
  var N = fixangle((360/365.2422) * day);
  //Convert from perigee coordinates to epoch 1980
  var M = fixangle(N + c.ecliptic_longitude_epoch - c.ecliptic_longitude_perigee);

  // Solve Kepler's equation
  var Ec = kepler(M, c.eccentricity);
  Ec = Math.sqrt((1 + c.eccentricity) / (1 - c.eccentricity)) * Math.tan(Ec/2.0);
  // True anomaly
  Ec = 2 * todeg(Math.atan(Ec));
  // Suns's geometric ecliptic longuitude
  var lambda_sun = fixangle(Ec + c.ecliptic_longitude_perigee);

  // Orbital distance factor
  var F = ((1 + c.eccentricity * Math.cos(torad(Ec))) / (1 - Math.pow(c.eccentricity, 2)));

  // Distance to Sun in km
  var sun_dist = c.sun_smaxis / F;
  var sun_angular_diameter = F * c.sun_angular_size_smaxis;

  // Calculation of the Moon's position

  // Moon's mean longitude
  var moon_longitude = fixangle(13.1763966 * day + c.moon_mean_longitude_epoch);

  // Moon's mean anomaly
  var MM = fixangle(moon_longitude - 0.1114041 * day - c.moon_mean_perigee_epoch);

  // Moon's ascending node mean longitude
  // MN = fixangle(c.node_mean_longitude_epoch - 0.0529539 * day)

  var evection = 1.2739 * Math.sin(torad(2*(moon_longitude - lambda_sun) - MM));

  // Annual equation
  var annual_eq = 0.1858 * Math.sin(torad(M));

  // Correction term
  var A3 = 0.37 * Math.sin(torad(M));

  var MmP = MM + evection - annual_eq - A3;

  // Correction for the equation of the centre
  var mEc = 6.2886 * Math.sin(torad(MmP));

  // Another correction term
  var A4 = 0.214 * Math.sin(torad(2 * MmP));

  // Corrected longitude
  var lP = moon_longitude + evection + mEc - annual_eq + A4;

  // Variation
  var variation = 0.6583 * Math.sin(torad(2*(lP - lambda_sun)));

  // True longitude
  var lPP = lP + variation;

  // Calculation of the phase of the Moon

  // Age of the Moon, in degrees
  var moon_age = lPP - lambda_sun;

  // Phase of the Moon
  var moon_phase = (1 - Math.cos(torad(moon_age))) / 2.0;

  // Calculate distance of Moon from the centre of the Earth
  var moon_dist = (c.moon_smaxis * (1 - Math.pow(c.moon_eccentricity,2))) / (1 + c.moon_eccentricity * Math.cos(torad(MmP + mEc)));

  // Calculate Moon's angular diameter
  var moon_diam_frac = moon_dist / c.moon_smaxis;
  var moon_angular_diameter = c.moon_angular_size / moon_diam_frac;

  // Calculate Moon's parallax (unused?)
  // moon_parallax = c.moon_parallax / moon_diam_frac

  var res = {
    'phase': fixangle(moon_age) / 360.0,
    'illuminated': moon_phase,
    'age': c.synodic_month * fixangle(moon_age) / 360.0,
    'distance': moon_dist,
    'angular_diameter': moon_angular_diameter,
    'sun_distance': sun_dist,
    'sun_angular_diameter': sun_angular_diameter
  };

  return res;
}

function phase_hunt(sdate) {
  // Find time of phases of the moon which surround the current date.

  // Five phases are found, starting and ending with the new moons
  // which bound the current lunation.

  if(!sdate) {
    sdate = new Date();
  }

  var adate = new Date(sdate.valueOf()); // today!
  var x = 45; // go back 45 days!
  adate.setDate(adate.getDate() - x);

  var k1 = Math.floor((adate.getFullYear() + ((adate.getMonth()) * (1.0/12.0)) - 1900) * 12.3685);
  var nt1 = meanphase(adate, k1);
  adate = nt1;

  sdate = sdate.getJulian();
  var k2;
  while(1) {
    adate = adate + c.synodic_month;
    k2 = k1 + 1;
    var nt2 = meanphase(adate, k2);
    if(nt1 <= sdate && sdate < nt2) {
      break;
    }
    nt1 = nt2;
    k1 = k2;
  }
  var ks = [k1, k1, k1, k1, k2];
  var tphases = [NEW, FIRST, FULL, LAST, NEW];
  var phase_names = ['new_date', 'q1_date', 'full_date', 'q3_date', 'nextnew_date'];
  var phases = {};

  for (var i = 0; i < ks.length; i++) {
    phases[phase_names[i]] = truephase(ks[i], tphases[i]);
  }

  return phases;
}

function truephase(k, tphase) {
    // Given a K value used to determine the mean phase of the new
    // moon, and a phase selector (0.0, 0.25, 0.5, 0.75), obtain the
    // true, corrected phase time.

    var apcor = false;

    // add phase to new moon time
    k = k + tphase;
    // Time in Julian centuries from 1900 January 0.5
    var t = k / 1236.85;

    var t2 = t * t;
    var t3 = t2 * t;

    // Mean time of phase
    var pt = (
      2415020.75933 + c.synodic_month * k + 0.0001178 * t2 -
      0.000000155 * t3 + 0.00033 * dsin(166.56 + 132.87 * t -
      0.009173 * t2)
    );

    // Sun's mean anomaly
    var m = 359.2242 + 29.10535608 * k - 0.0000333 * t2 - 0.00000347 * t3;

    // Moon's mean anomaly
    var mprime = 306.0253 + 385.81691806 * k + 0.0107306 * t2 + 0.00001236 * t3;

    // Moon's argument of latitude
    var f = 21.2964 + 390.67050646 * k - 0.0016528 * t2 - 0.00000239 * t3;

    if ((tphase < 0.01) || (Math.abs(tphase - 0.5) < 0.01)) {

      // Corrections for New and Full Moon
      pt = pt + (
        (0.1734 - 0.000393 * t) * dsin(m) +
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
      );

      apcor = true;
    }
    else if ((Math.abs(tphase - 0.25) < 0.01) || (Math.abs(tphase - 0.75) < 0.01)) {
        pt = pt + (
          (0.1721 - 0.0004 * t) * dsin(m) +
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
        );
      if (tphase < 0.5) {
          //  First quarter correction
          pt = pt + 0.0028 - 0.0004 * dcos(m) + 0.0003 * dcos(mprime);
      }
      else {
          //  Last quarter correction
          pt = pt + -0.0028 + 0.0004 * dcos(m) - 0.0003 * dcos(mprime);
      }
      apcor = true;
    }

    if (!apcor) {
      console.log("TRUEPHASE called with invalid phase selector ", tphase);
    }

    return pt.Julian2Date();
}

function meanphase(sdate, k) {
  // Calculates time of the mean new Moon for a given base date.
  // This argument K to this function is the precomputed synodic month
  // index, given by:
  //                     K = (year - 1900) * 12.3685
  // where year is expressed as a year and fractional year.
  //

  // Time in Julian centuries from 1900 January 12 noon
  var delta_t = (sdate - (new Date(1900,0,1,12))) / (1000*60*60*24);
  var t = delta_t / 36525;

  // square for frequent use
  var t2 = t * t;
  // and cube
  var t3 = t2 * t;

  nt1 = (
    2415020.75933 + c.synodic_month * k + 0.0001178 * t2 -
    0.000000155 * t3 + 0.00033 * dsin(166.56 + 132.87 * t -
    0.009173 * t2)
  );

  return nt1;
}

console.log(phase());
console.log(phase_hunt());
