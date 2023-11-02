function getDefault(value, defaultValue = "") {
  return value ? value : defaultValue;
}

function formatDate(date) {
  if (date) {
    const dateParts = date.split("/");
    return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
  }
  return null;
}
function isValidTime(time) {
  const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;
  return timeRegex.test(time);
}
function formatTime(time) {
  if (time) {
    return `${time}`;
  }
  return null;
}
// function formatTime(time, date) {
//   if (time && date) {
//     const dateTime = new Date(`${date}T${time}`);
//     dateTime.setHours(dateTime.getHours() + 1);
//     return dateTime;
//   }
//   return null;
// }
module.exports = {
  formatTime,
  formatDate,
  getDefault,
  isValidTime,
};
