function loadJsonFromScript(scriptTagId) {
  const container = document.getElementById(scriptTagId);
  let data = {};

  // Attempt to parse the JSON
  try {
    data = JSON.parse(container.innerHTML || "{}");
  } catch (e) {
    // do nothing
  }
  return data;
}

module.exports = {
  loadJsonFromScript
};
