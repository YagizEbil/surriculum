// requirements.js
// Define the degree requirements for each major. When this script is loaded
// via a normal <script> tag (non-module) the requirements object will be
// attached to the global window so other scripts can reference it without
// importing.

export const requirements = {
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

// Expose the requirements object on the window in browser environments. This
// allows other scripts to access `requirements` when modules are not
// available (e.g., when loading files directly via the file:// scheme).
if (typeof window !== 'undefined') {
  window.requirements = requirements;
}
