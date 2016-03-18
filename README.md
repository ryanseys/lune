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
var lune = require('lune');
var current_phase = lune.phase();
console.log(current_phase);
```

#### Output:

```javascript
{
  phase: 0.5358014231208499,
  illuminated: 0.9874029678753915,
  age: 15.822531440340462,
  distance: 399704.2447849964,
  angular_diameter: 0.4982638055473454,
  sun_distance: 147790721.2629182,
  sun_angular_diameter: 0.539600532418603
}
```

### To calculate phase information for a *specific* date:

```javascript
var lune = require('lune');
var some_date = new Date(2014, 1, 17);
var some_date_phase = lune.phase(some_date);
console.log(some_date_phase);
```

#### Output:

```javascript
{
  phase: 0.5616632223402672,
  illuminated: 0.9629393807872504,
  age: 16.586245595613818,
  distance: 396868.3763643785,
  angular_diameter: 0.5018242066159135,
  sun_distance: 147816061.66410872,
  sun_angular_diameter: 0.5395080276270386
}
```

### To search for recent phases around the *current* date:

```javascript
var lune = require('lune');
var recent_phases = lune.phase_hunt();
console.log(recent_phases);
```

#### Output:

```javascript
{
  new_date: Thu Jan 30 2014 21:40:35 GMT-0500 (EST),
  q1_date: Thu Feb 06 2014 19:22:34 GMT-0500 (EST),
  full_date: Fri Feb 14 2014 23:54:47 GMT-0500 (EST),
  q3_date: Sat Feb 22 2014 17:16:56 GMT-0500 (EST),
  nextnew_date: Sat Mar 01 2014 08:02:42 GMT-0500 (EST)
}
```

### To search for recent phases around a *specific* date:

```javascript
var lune = require('lune');
var some_date = new Date(2014, 1, 17);
var some_date_phase = lune.phase_hunt(some_date);
console.log(some_date_phase);
```

#### Output:

```javascript
{
  new_date: Thu Jan 30 2014 21:40:35 GMT-0500 (EST),
  q1_date: Thu Feb 06 2014 19:22:34 GMT-0500 (EST),
  full_date: Fri Feb 14 2014 23:54:47 GMT-0500 (EST),
  q3_date: Sat Feb 22 2014 17:16:56 GMT-0500 (EST),
  nextnew_date: Sat Mar 01 2014 08:02:42 GMT-0500 (EST)
}
```

### To search for phases between two dates:

```javascript
// print all full moons in the first quarter of 2014
var lune = require('lune');
var phase_list = lune.phase_range(
  new Date("2014-01-01T00:00:00.000Z"),
  new Date("2014-03-31T23:59:59.999Z"),
  lune.PHASE_FULL
)
console.log(phase_list);
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
