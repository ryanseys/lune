'use strict'

/**
 *
 * @param {Date} date
 * @returns {number}
 */
function fromDate (date) {
  return date.getTime() / 86400000 + 2440587.5
}

/**
 *
 * @param {number} julian
 * @returns {Date}
 */
function toDate (julian) {
  return new Date((julian - 2440587.5) * 86400000)
}

exports.fromDate = fromDate
exports.toDate = toDate
