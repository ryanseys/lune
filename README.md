Lune
====

Lune.js — calculate the phase of the moon

## Installation

`npm install lune`

## Usage

To calculate current phase information:

```javascript
var lune = require('lune');
var current_phase = lune.phase();
console.log(current_phase);
```

To search for recent phases around the current date:

```javascript
var lune = require('lune');
var recent_phases = lune.phase_hunt();
console.log(recent_phases);
```

## Contributing

Please feel free to contribute to this project! :) Pull requests and feature requests welcome!

## License

See LICENSE file in this repo
