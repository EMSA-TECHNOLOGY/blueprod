// THANH LE EMSA TECHNOLOGY

function addYears(addToDate, numToAdd) {
  let dt = (addToDate instanceof Date) ? addToDate : new Date(addToDate);
  dt.setFullYear(dt.getFullYear() + numToAdd);
  return dt;
}

function addMonths(addToDate, numToAdd) {
  let dt = (addToDate instanceof Date) ? addToDate : new Date(addToDate);
  dt.setMonth(dt.getMonth() + numToAdd);
  return dt;
}

function addWeeks(addToDate, numToAdd) {
  return addDays(addToDate, numToAdd*7);
}

function addDays(addToDate, numToAdd) {
  let dt = (addToDate instanceof Date) ? addToDate : new Date(addToDate);
  dt.setDate(dt.getDate() + numToAdd);
  return dt;
}

function addHours(addToDate, numToAdd) {
  let dt = (addToDate instanceof Date) ? addToDate : new Date(addToDate);
  dt.setHours(dt.getHours() + numToAdd);
  return dt;
}

function addMinutes(addToDate, numToAdd) {
  let dt = (addToDate instanceof Date) ? addToDate : new Date(addToDate);
  dt.setMinutes(dt.getMinutes() + numToAdd);
  return dt;
}

function addSeconds(addToDate, numToAdd) {
  let dt = (addToDate instanceof Date) ? addToDate : new Date(addToDate);
  dt.setSeconds(dt.getSeconds() + numToAdd);
  return dt;
}

function addMilliseconds(addToDate, numToAdd) {
  let dt = (addToDate instanceof Date) ? addToDate : new Date(addToDate);
  dt.setMilliseconds(dt.getMilliseconds() + numToAdd);
  return dt;
}

module.exports = {
  addYears:             addYears,
  addMonths:            addMonths,
  addWeeks:             addWeeks,
  addDays:              addDays,
  addHours:             addHours,
  addMinutes:           addMinutes,
  addSeconds:           addSeconds,
  addMilliseconds:      addMilliseconds,
};

function unit_test() {
  console.log('Add 1 years to current date: ' +addYears(Date.now(), 1).toISOString());
  console.log('Add 1 months to current date: ' +addMonths(Date.now(), 1).toISOString());
  console.log('Add 2 weeks to current date: ' +addWeeks(Date.now(), 2).toISOString());
  console.log('Add 15 days to current date: ' +addDays(Date.now(), 15).toISOString());
  console.log('Add 5 hours to current date: ' +addHours(Date.now(), 5).toISOString());
  console.log('Add 5 minutes to current date: ' +addMinutes(Date.now(), 5).toISOString());
  console.log('Add 5 seconds to current date: ' +addSeconds(Date.now(), 5).toISOString());
  console.log('Add 5000 seconds to current date: ' +addMilliseconds(Date.now(), 5000).toISOString());
}

// unit_test();