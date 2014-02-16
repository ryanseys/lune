Lune
====

Lune.js — calculate the phase of the moon

## Installation

`npm install lune`

## Usage

#### To calculate current phase information:

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

#### To search for recent phases around the current date:

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

## Contributing

Please feel free to contribute to this project! :) Pull requests and feature requests welcome!

## License

See LICENSE file in this repo
