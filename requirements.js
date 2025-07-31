// requirements.js
// Degree requirements are stored as JSON files under `requirements/<TERM>.json`.
// This module loads the file matching the user's selected entry term. If no
// term-specific file is found, it falls back to `requirements/default.json`.

let requirements = {};

function loadRequirements(termCode) {
  const path = `./requirements/${termCode}.json`;
  const defPath = './requirements/default.json';
  const tryLoad = (p) => {
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', p, false);
      xhr.overrideMimeType('application/json');
      xhr.send(null);
      if (xhr.status === 200 || xhr.status === 0) return JSON.parse(xhr.responseText);
    } catch (_) {}
    return null;
  };
  let data = tryLoad(path) || tryLoad(defPath) || null;
  if (data) {
    for (const maj of Object.keys(data)) {
      if (data[maj].science === undefined) data[maj].science = 0;
      if (data[maj].engineering === undefined) data[maj].engineering = 0;
    }
  }
  return data;
}

let termName = '';
try {
  termName = localStorage.getItem('entryTerm') || '';
} catch (_) {}
let termCode = '';
try {
  if (typeof termNameToCode === 'function') termCode = termNameToCode(termName);
} catch (_) {}
const loadedReq = loadRequirements(termCode || 'default') || {};
requirements = loadedReq;
export { requirements, loadRequirements };

// Expose the requirements object on the window in browser environments. This
// allows other scripts to access `requirements` when modules are not
// available (e.g., when loading files directly via the file:// scheme).
if (typeof window !== 'undefined') {
  window.requirements = requirements;
  window.loadRequirements = loadRequirements;
}
