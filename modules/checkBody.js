function checkBody(body, keys) {
  let isValid = true;

  for (const field of keys) {
    if (
      !body[field] &&
      (field !== "avatar" || (field === "avatar" && !body[field]))
    ) {
      isValid = false;
    }
  }

  return isValid;
}
