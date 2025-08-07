// Academic Records Parser
// This module parses Academic Records Summary HTML files to extract course information

/**
 * Parses an Academic Records Summary HTML file and extracts course information
 * @param {string} htmlContent - The HTML content of the Academic Records file
 * @returns {Object} An object containing parsed course data and any issues found
 */
function parseAcademicRecords(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Get all course tables (each semester has its own table)
    const courseTables = doc.querySelectorAll('.courseTable');

    // Store parsed courses and issues
    const result = {
        courses: [],
        notFoundCourses: []
    };

    // Track the most recent entry for each course code. As we parse the tables
    // in the order they appear in the transcript, later occurrences will
    // overwrite earlier ones so that repeated attempts keep only the latest
    // grade.
    const latestMap = {};

    // Extract courses from each table (semester)
    courseTables.forEach(table => {
        // Get semester information from the header
        const semesterHeader = table.querySelector('thead tr th:first-child b');
        let semester = semesterHeader ? semesterHeader.textContent.trim() : "Unknown Semester";


        // Get all course rows (skip header rows and special rows)
        const courseRows = Array.from(table.querySelectorAll('tbody tr')).filter(row => {
            // Skip header rows and special rows like "Transfer Courses"
            const firstCell = row.querySelector('td:first-child');
            if (!firstCell) return false;

            // Skip rows that are course type headers or course code headers
            if (firstCell.classList.contains('course_type') ||
                firstCell.textContent.includes("COURSE CODE") ||
                row.classList.contains('course_type')) {
                return false;
            }

            const courseCode = firstCell.textContent.trim();
            // More flexible regex to match course codes
            return courseCode.match(/^[A-Z]+\s*\d{3,}[A-Z0-9]*$/) !== null;
        });

        // Extract course information from each row
        courseRows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 4) {
                let courseCode = cells[0].textContent.trim().replace(/\s/g, '');
                const courseTitle = cells[1].textContent.trim();
                const grade = cells[3].textContent.trim();

                // Determine status if available by scanning remaining cells. If
                // the row marks the course as "Repeated" or "Excluded", we skip
                // it as it should not affect credits or categories.
                const statusText = Array.from(cells)
                    .slice(4)
                    .map(c => c.textContent.trim().toLowerCase())
                    .join(' ');
                if (statusText.includes('repeated') || statusText.includes('excluded')) {
                    return;
                }
                // Extract SU credit and ECTS values if available. The transcript
                // table uses the fourth and fifth columns (zero-indexed) for
                // credit and ECTS, respectively. Parse them as floats and
                // default to 0 when not present. Leading/trailing whitespace
                // and zero-padding are stripped.
                let suCredits = 0;
                let ects = 0;
                try {
                    if (cells.length > 4) {
                        const creditText = cells[4].textContent.trim();
                        suCredits = creditText ? parseFloat(creditText) : 0;
                    }
                    if (cells.length > 5) {
                        const ectsText = cells[5].textContent.trim();
                        ects = ectsText ? parseFloat(ectsText) : 0;
                    }
                } catch (_) {
                    suCredits = 0;
                    ects = 0;
                }

                // Replace CS210 with DSA210
                if (courseCode === 'CS210') {
                    courseCode = 'DSA210';
                }

                // Correct the condition to skip courses with ELAE code
                if (courseCode.includes('ELAE')) {
                    return; // Skip this iteration
                }

                // Skip withdrawn or not attended courses
                if (['W', 'NA'].includes(grade)) {
                    return;
                }

                // Include the course, using blank grade for "Registered"
                latestMap[courseCode] = {
                    code: courseCode,
                    title: courseTitle,
                    grade: grade === 'Registered' ? '' : grade,
                    semester: semester,
                    suCredits: suCredits,
                    ects: ects
                };
            }
        });
    });

    // Finalize the result courses from the latestMap values
    result.courses = Object.values(latestMap);
    return result;
}
/**
 * Parses text extracted from an Academic Records Summary PDF and extracts course information
 * @param {string} pdfText - Text content extracted from the PDF
 * @returns {Object} An object containing parsed course data
 */
function parseAcademicRecordsPdf(pdfText) {
    const lines = pdfText.replace(/\r/g, '').split('\n').map(l => l.trim()).filter(Boolean);
    const courseCodeRegex = /^[A-Z]+\s*\d{3,}[A-Z0-9]*$/;
    const semesterRegex = /^(Fall|Spring|Summer)\s+\d{4}-\d{4}$/;
    // PDF transcripts include a "level" column such as UG/GR which we ignore.
    const levelTokens = new Set(['UG', 'GR', 'FDY', 'PG', 'PR', 'SA', 'SR', 'MS', 'MD', 'DR']);
    // Grades mirror the options used elsewhere in the app (helper_functions.js)
    // and include special entries for transfer and in-progress courses.
    const gradeRegex = /^(S|A|A-|B\+|B|B-|C\+|C|C-|D\+|D|F|T|P|I|W|NA|U|Registered)$/;

    const result = { courses: [], notFoundCourses: [] };
    let currentSemester = 'Unknown Semester';

    for (let i = 0; i < lines.length;) {
        const line = lines[i];

        if (semesterRegex.test(line)) {
            currentSemester = line;
            i++;
            continue;
        }

        if (courseCodeRegex.test(line)) {
            let code = line.replace(/\s+/g, '');
            i++;

            const titleTokens = [];
            while (i < lines.length &&
                   !levelTokens.has(lines[i]) &&
                   !courseCodeRegex.test(lines[i]) &&
                   !semesterRegex.test(lines[i])) {
                titleTokens.push(lines[i]);
                i++;
            }
            const courseTitle = titleTokens.join(' ').trim();

            if (i >= lines.length) break;

            if (levelTokens.has(lines[i])) {
                i++;
            }

            let grade = '';
            if (i < lines.length && gradeRegex.test(lines[i])) {
                grade = lines[i];
                i++;
            }

            let suCredits = 0;
            if (i < lines.length && !isNaN(parseFloat(lines[i]))) {
                suCredits = parseFloat(lines[i]);
                i++;
            }

            let ects = 0;
            if (i < lines.length && !isNaN(parseFloat(lines[i]))) {
                ects = parseFloat(lines[i]);
                i++;
            }

            const statusTokens = [];
            while (i < lines.length &&
                   !courseCodeRegex.test(lines[i]) &&
                   !semesterRegex.test(lines[i])) {
                statusTokens.push(lines[i]);
                i++;
            }
            const statusText = statusTokens.join(' ').toLowerCase();
            if (statusText.includes('repeated') || statusText.includes('excluded')) {
                continue;
            }
            if (['W', 'NA'].includes(grade)) {
                continue;
            }

            result.courses.push({
                code: code,
                title: courseTitle,
                grade: grade === 'Registered' ? '' : grade,
                semester: currentSemester,
                suCredits: suCredits,
                ects: ects
            });
            continue;
        }

        i++;
    }

    return result;
}

/**
 * Checks if parsed courses exist in the course data and creates semesters with valid courses
 * @param {Array} parsedCourses - Array of course objects parsed from the HTML
 * @param {Object} courseData - Course data from the program JSON
 * @param {Object} curriculum - The curriculum object to add courses to
 * @returns {Object} Statistics about the import process
 */
function importParsedCourses(parsedCourses, courseData, curriculum) {
    // Build statistics object up front.  The `notFoundCourses` array will
    // accumulate codes that are neither present in the program nor match
    // the special prefixes.  These will be reported back to the user.
    const stats = {
        totalCourses: parsedCourses.length,
        importedCourses: 0,
        notFoundCourses: []
    };
    // When we encounter courses that need to be created as custom courses
    // (based on their prefix), we'll push them into this array.  The
    // consuming code in main.js can then prompt the user to fill in
    // additional fields (e.g. engineering/basic science credits) for each
    // pending course.  Each entry will hold a reference to the newCourse
    // object that was inserted into courseData so it can be updated later.
    const pendingCustomCourses = [];

    // Group courses by semester
    const courseBySemester = {};

    // Format semesters to be more user-friendly
    const formatSemester = (semester) => {
        // Extract the semester pattern like "Fall 2022-2023" from the header
        let match = semester.match(/(Fall|Spring|Summer)\s+(\d{4}-\d{4})/);
        if (match) {
            // Reformat it to the expected format: "Fall 2022-2023"
            const term = match[1];
            const yearRange = match[2];
            return term + " " + yearRange;
        }
        return semester;
    };

    // Parse the semester order to allow for correct sorting
    const getSemesterOrder = (semester) => {
        const formattedSemester = formatSemester(semester);
        const parts = formattedSemester.split(' ');
        if (parts.length < 2) return 0;

        const term = parts[0];
        const yearRange = parts[1];

        let order = 0;
        if (yearRange) {
            const yearParts = yearRange.split('-');
            if (yearParts.length === 2) {
                const year = parseInt(yearParts[0]);
                order = year * 10; // Base score from year

                // Add term-specific values (Fall=0, Spring=1, Summer=2)
                if (term === 'Spring') order += 1;
                else if (term === 'Summer') order += 2;
            }
        }
        return order;
    };

    parsedCourses.forEach(course => {
        // Extract course code prefix and number for better matching
        const codePrefix = course.code.match(/^[A-Z]+/)[0];
        const codeNumber = course.code.match(/\d+[A-Z0-9]*/)[0];

        // Check if course exists in course data using both combined and split formats.
        // Also check the selected double major's course list if available.
        const existsInList = (list) => list.some(c => {
            // Try direct match first
            if (c.code === course.code) return true;

            // Try matching based on prefix and code parts
            if (c.Major === codePrefix && c.Code === codeNumber) return true;

            // Try matching with combined code
            if ((c.Major + c.Code) === course.code) return true;

            return false;
        });

        let courseExists = existsInList(courseData);
        if (!courseExists) {
            try {
                if (curriculum && curriculum.doubleMajor &&
                    Array.isArray(curriculum.doubleMajorCourseData)) {
                    courseExists = existsInList(curriculum.doubleMajorCourseData);
                }
            } catch (_) {
                /* ignore */
            }
        }

        // If course does not exist, attempt to automatically add it as a
        // custom course for certain special prefixes.  For non-engineering
        // majors we also consider LANG* courses as free electives.  We use
        // both short and full prefixes (e.g., COR/CORE, ARE/AREA) to match
        // variations in the transcript.  If a match is found we create a
        // placeholder course using the known credit information and queue it
        // for user confirmation via the custom course modal.
        if (!courseExists) {
            const code = course.code || '';
            const engineeringMajors = ['CS','EE','IE','ME','BIO','MAT','DSA'];
            const nonEngineering = engineeringMajors.indexOf(curriculum.major) === -1;
            let prefix = '';
            let elType = '';
            // Determine elective type based on prefix.  Accept both the
            // minimal three-letter form (COR, ARE, FEL, LANG) and their
            // longer forms (CORE, AREA, etc.).
            if (/^COR(E)?/.test(code)) {
                prefix = code.match(/^([A-Z]+)/)[0];
                elType = 'core';
            } else if (/^ARE(A)?/.test(code)) {
                prefix = code.match(/^([A-Z]+)/)[0];
                elType = 'area';
            } else if (/^FEL/.test(code)) {
                prefix = code.match(/^([A-Z]+)/)[0];
                elType = 'free';
            } else if (/^LANG/.test(code) && nonEngineering) {
                prefix = code.match(/^([A-Z]+)/)[0];
                elType = 'free';
            }
            if (elType) {
                const numMatch = code.match(/\d+[A-Z0-9]*/);
                const num = numMatch ? numMatch[0] : '';
                // Use the credit information from the parsed course when
                // available. Default to zero if missing.
                const su = (typeof course.suCredits === 'number' && !isNaN(course.suCredits)) ? course.suCredits : 0;
                const ectsVal = (typeof course.ects === 'number' && !isNaN(course.ects)) ? course.ects : 0;
                const newCourse = {
                    Major: prefix,
                    Code: num,
                    Course_Name: course.title || code,
                    ECTS: ectsVal.toString(),
                    Engineering: 0,
                    Basic_Science: 0,
                    SU_credit: su.toString(),
                    Faculty: '',
                    EL_Type: elType,
                    Faculty_Course: 'No'
                };
                // Append to course data so future imports recognize it
                courseData.push(newCourse);
                // Persist to localStorage under the current major
                try {
                    const key = 'customCourses_' + curriculum.major;
                    const existingList = JSON.parse(localStorage.getItem(key) || '[]');
                    existingList.push(newCourse);
                    localStorage.setItem(key, JSON.stringify(existingList));
                } catch (e) {
                    // ignore storage errors
                }
                // Queue this course for user confirmation.  We capture the
                // reference to the inserted course object and the parsed
                // information to prefill the form later.
                pendingCustomCourses.push({
                    course: newCourse,
                    parsedInfo: {
                        code: course.code,
                        title: course.title,
                        suCredits: su,
                        ects: ectsVal,
                        elType: elType
                    }
                });
                courseExists = true;
            }
        }

        if (courseExists) {
            // Get formatted semester name
            const formattedSemester = formatSemester(course.semester);

            // Group by semester
            if (!courseBySemester[formattedSemester]) {
                courseBySemester[formattedSemester] = {
                    name: formattedSemester,
                    order: getSemesterOrder(course.semester),
                    courses: [],
                    grades: {} // Store grades for each course
                };
            }
            // Store course and its grade
            courseBySemester[formattedSemester].courses.push(course.code);
            courseBySemester[formattedSemester].grades[course.code] = course.grade;
            stats.importedCourses++;
        } else {
            stats.notFoundCourses.push(course.code);
        }
    });

    // Sort semesters by their order (chronologically)
    const sortedSemesters = Object.values(courseBySemester)
        .sort((a, b) => a.order - b.order);  // Ascending order (oldest first)

    // Process in reverse order so oldest appears on the left.  When each
    // semester is inserted at the beginning, the oldest needs to be
    // inserted last.  We collect any courses with grades in the same
    // order as they appear in `sortedSemesters`.
    for (let i = sortedSemesters.length - 1; i >= 0; i--) {
        const semesterData = sortedSemesters[i];
        // Only create a semester if there is at least one course to add.
        if (semesterData.courses && semesterData.courses.length > 0) {
            const gradeList = semesterData.courses.map(courseCode => {
                return semesterData.grades[courseCode] || '';
            });
            // Create the semester using whichever global function is available.
            if (typeof createSemeter === 'function') {
                createSemeter(false, semesterData.courses, curriculum, courseData, gradeList, semesterData.name);
            } else if (typeof window.createSemeter === 'function') {
                window.createSemeter(false, semesterData.courses, curriculum, courseData, gradeList, semesterData.name);
            } else {
                console.error('createSemeter function not found');
            }
        }
    }

    // After creating all semesters from the transcript import, update the
    // effective categories so that courses are allocated correctly.  We
    // specifically pass the provided courseData so the recalc function can
    // look up static course types.  Guard against missing recalc.
    try {
        if (typeof curriculum.recalcEffectiveTypes === 'function') {
            curriculum.recalcEffectiveTypes(courseData);
        }
    } catch (err) {
        // ignore
    }

    // Finally, return both the import statistics and any pending custom
    // courses.  Do not return prematurely inside loops; returning here
    // ensures we process all semesters and recalc credits before
    // prompting the user for missing information.
    return {
        stats: stats,
        pendingCustomCourses: pendingCustomCourses
    };
}

// Export functions for use in main.js
window.academicRecordsParser = {
    parseAcademicRecords,
    parseAcademicRecordsPdf,
    importParsedCourses
};
