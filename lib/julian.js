(function() {
  "use strict";

  function from_date(date) {
    return date.getTime() / 86400000 + 2440587.5;
  }

  function to_date(julian) {
    return new Date((julian - 2440587.5) * 86400000);
  }

  exports.from_date = from_date;
  exports.to_date = to_date;
})();
