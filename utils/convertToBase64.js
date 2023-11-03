const convertToBase64 = (file) => {
  if (file) {
    return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
  }
  return null;
};
module.exports = convertToBase64;
