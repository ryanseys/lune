<div align="center">
  <img height="150" width="150"  src="http://ryanseys.com/img/moon.png"/>
</div>

# Lune [![Build Status](https://travis-ci.org/ryanseys/lune.svg?branch=0.2.0)](https://travis-ci.org/ryanseys/lune)

Lune.js — calculate the phases of the moon.

## Installation

```sh   
npm install lune
```

## Usage

### To calculate *current* phase information:

```javascript
var lune = require('lune')
var current_phase = lune.phase()
console.log(current_phase)
```

#### Output:

```javascript
{ phase: 0.3435664924086369,
  illuminated: 0.7773055846628978,
  age: 10.1457207715498,
  distance: 386679.7626047325,
  angular_diameter: 0.5150467579643708,
  sun_distance: 148929846.0148686,
  sun_angular_diameter: 0.5354732715700135 }
```

### To calculate phase information for a *specific* date:

```javascript
var lune = require('lune')
var some_date = new Date('2014-02-17T00:00-0500')
var some_date_phase = lune.phase(some_date)
console.log(some_date_phase)
```

#### Output:

```javascript
{ phase: 0.568204641580006,
  illuminated: 0.9547862069882863,
  age: 16.779417556565985,
  distance: 396084.54752883443,
  angular_diameter: 0.5028172882344054,
  sun_distance: 147822484.14817196,
  sun_angular_diameter: 0.5394845874736046 }
```

### To search for recent phases around the *current* date:

```javascript
var lune = require('lune')
var recent_phases = lune.phase_hunt()
console.log(recent_phases)
```

#### Output:

```javascript
{ new_date: Tue Mar 08 2016 20:55:59 GMT-0500 (EST),
  q1_date: Tue Mar 15 2016 13:04:23 GMT-0400 (EDT),
  full_date: Wed Mar 23 2016 08:01:38 GMT-0400 (EDT),
  q3_date: Thu Mar 31 2016 11:18:41 GMT-0400 (EDT),
  nextnew_date: Thu Apr 07 2016 07:25:20 GMT-0400 (EDT) }
```

### To search for recent phases around a *specific* date:

```javascript
var lune = require('lune')
var some_date = new Date('2014-02-17T00:00-0500')
var some_date_phase = lune.phase_hunt(some_date)
console.log(some_date_phase)
```

#### Output:

```javascript
{ new_date: Thu Jan 30 2014 16:40:35 GMT-0500 (EST),
  q1_date: Thu Feb 06 2014 14:22:33 GMT-0500 (EST),
  full_date: Fri Feb 14 2014 18:54:46 GMT-0500 (EST),
  q3_date: Sat Feb 22 2014 12:16:56 GMT-0500 (EST),
  nextnew_date: Sat Mar 01 2014 03:02:41 GMT-0500 (EST) }
```

### To search for phases between two dates:

```javascript
// print all full moons in the first quarter of 2014
var lune = require('lune')
var phase_list = lune.phase_range(
  new Date('2014-01-01T00:00:00.000Z'),
  new Date('2014-03-31T23:59:59.999Z'),
  lune.PHASE_FULL
)
console.log(phase_list)
```

Possible values for the third argument of the function are:

*   `lune.PHASE_NEW` (new moon)
*   `lune.PHASE_FIRST` (first quarter moon)
*   `lune.PHASE_FULL` (full moon)
*   `lune.PHASE_LAST` (third or last quarter moon)

#### Output:

```javascript
[ Wed Jan 01 2014 06:15:02 GMT-0500 (EST),
  Thu Jan 30 2014 16:40:35 GMT-0500 (EST),
  Sat Mar 01 2014 03:02:41 GMT-0500 (EST),
  Sun Mar 30 2014 14:48:06 GMT-0400 (EDT) ]
```

## Image

Moon image graciously provided by [Mike DiLuigi.](https://www.behance.net/mikediluigi)

## Contributing

Please feel free to contribute to this project! :) Pull requests and feature requests welcome!

## License

See LICENSE file in this repo
