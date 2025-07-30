// requirements.js
// Degree requirements are stored as JSON files under `requirements/<TERM>.json`.
// This module loads the file matching the user's selected entry term. If no
// term-specific file is found, it falls back to `requirements/default.json` and
// finally the hard-coded values below.

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
  return tryLoad(path) || tryLoad(defPath) || null;
}

const fallbackRequirements = {
  // ----- Engineering majors -----
  CS: {
    total: 125,
    ects: 240,
    university: 41,
    required: 29,
    core: 31,
    area: 9,
    free: 15,
    science: 60,
    engineering: 90,
    internshipCourse: 'CS395'
  },
  IE: {
    total: 125,
    ects: 240,
    university: 41,
    required: 34,
    core: 26,
    area: 9,
    free: 15,
    science: 60,
    engineering: 90,
    internshipCourse: 'IE395'
  },
  EE: {
    total: 125,
    ects: 240,
    university: 41,
    required: 35,
    core: 25,
    area: 9,
    free: 15,
    science: 60,
    engineering: 90,
    internshipCourse: 'EE395'
  },
  BIO: {
    total: 127,
    ects: 240,
    university: 41,
    required: 33,
    core: 29,
    area: 9,
    free: 15,
    science: 60,
    engineering: 90,
    internshipCourse: 'BIO395'
  },
  ME: {
    total: 125,
    ects: 240,
    university: 41,
    required: 34,
    core: 26,
    area: 9,
    free: 15,
    science: 60,
    engineering: 90,
    internshipCourse: 'ME395'
  },
  MAT: {
    total: 125,
    ects: 240,
    university: 41,
    required: 34,
    core: 26,
    area: 9,
    free: 15,
    science: 60,
    engineering: 90,
    internshipCourse: 'MAT395'
  },
  DSA: {
    total: 125,
    ects: 240,
    university: 41,
    required: 30,
    core: 27,
    area: 12,
    free: 15,
    science: 0,
    engineering: 0,
    internshipCourse: 'DSA395'
  },

  // ----- FASS majors with the 44 SU university rule -----
  ECON: {
    total: 125,
    ects: 240,
    university: 44,
    required: 21,
    core: 12,
    area: 18,
    free: 30,
    science: 0,
    engineering: 0
  },
  MAN: {
    total: 127,
    ects: 240,
    university: 44,
    required: 15,
    core: 18,
    area: 24,
    free: 26,
    science: 0,
    engineering: 0
  },
  PSIR: {
    total: 125,
    ects: 240,
    university: 44,
    required: 24,
    core: 24,
    area: 15,
    free: 18,
    science: 0,
    engineering: 0
  },
  PSY: {
    total: 125,
    ects: 240,
    university: 44,
    required: 21,
    core: 21,
    area: 18,
    free: 21,
    science: 0,
    engineering: 0,
    internshipCourse: 'PSY300'
  },
  VACD: {
    total: 125,
    ects: 240,
    university: 44,
    required: 15,
    core: 21,
    area: 24,
    free: 21,
    science: 0,
    engineering: 0
  }
};

let termName = '';
try {
  termName = localStorage.getItem('entryTerm') || '';
} catch (_) {}
let termCode = '';
try {
  if (typeof termNameToCode === 'function') termCode = termNameToCode(termName);
} catch (_) {}
const loadedReq = termCode ? loadRequirements(termCode) : null;
export const requirements = loadedReq || fallbackRequirements;

// Expose the requirements object on the window in browser environments. This
// allows other scripts to access `requirements` when modules are not
// available (e.g., when loading files directly via the file:// scheme).
if (typeof window !== 'undefined') {
  window.requirements = requirements;
  window.loadRequirements = loadRequirements;
}
