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

    // Extract courses from each table (semester)
    courseTables.forEach(table => {
        // Get semester information from the header
        const semesterHeader = table.querySelector('thead tr th:first-child b');
        let semester = semesterHeader ? semesterHeader.textContent.trim() : "Unknown Semester";

        // Skip if the semester is a future or current semester with registered courses
        if (semester.includes("Registered") || table.textContent.includes("Registered")) {
            const hasRegisteredOnly = Array.from(table.querySelectorAll('tbody tr'))
                .filter(row => {
                    const cells = row.querySelectorAll('td');
                    return cells.length >= 4 && cells[3].textContent.trim() !== "Registered";
                }).length === 0;

            if (hasRegisteredOnly) return;
        }

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
                const courseCode = cells[0].textContent.trim().replace(/\s/g, '');
                const courseTitle = cells[1].textContent.trim();
                const grade = cells[3].textContent.trim();

                // Only include courses with passing grades (not F, W, NA, or currently registered)
                if (!['F', 'W', 'NA', 'Registered'].includes(grade)) {
                    result.courses.push({
                        code: courseCode,
                        title: courseTitle,
                        grade: grade,
                        semester: semester
                    });
                }
            }
        });
    });

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
    const stats = {
        totalCourses: parsedCourses.length,
        importedCourses: 0,
        notFoundCourses: []
    };

    // Group courses by semester
    const courseBySemester = {};

    // Format semesters to be more user-friendly
    const formatSemester = (semester) => {
        // Extract the semester pattern like "Fall 2022-2023" from the header
        let match = semester.match(/(Fall|Spring|Summer)\s+(\d{4}-\d{4})/);
        if (match) {
            // Reformat it to the expected format: "2022-2023 Fall"
            const term = match[1];
            const yearRange = match[2];
            return yearRange + " " + term;
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

        // Check if course exists in course data using both combined and split formats
        const courseExists = courseData.some(c => {
            // Try direct match first
            if (c.code === course.code) return true;

            // Try matching based on prefix and code parts
            if (c.Major === codePrefix && c.Code === codeNumber) return true;

            // Try matching with combined code
            if ((c.Major + c.Code) === course.code) return true;

            return false;
        });

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

    // Process in reverse order so oldest appears on left
    // When each semester is inserted at the beginning, the oldest needs to be inserted last
    for (let i = sortedSemesters.length - 1; i >= 0; i--) {
        const semesterData = sortedSemesters[i];

        // Make sure we have valid courses before creating a semester
        if (semesterData.courses && semesterData.courses.length > 0) {
            // Prepare the grade list in the same order as the courses
            const gradeList = semesterData.courses.map(courseCode => {
                return semesterData.grades[courseCode] || '';
            });

            // Create the semester with a proper name and grades
            if (typeof createSemeter === 'function') {
                // Pass false for isCreate, the courses array, curriculum object, course data, grades, and properly formatted semester name
                createSemeter(false, semesterData.courses, curriculum, courseData, gradeList, semesterData.name);
            } else if (typeof window.createSemeter === 'function') {
                window.createSemeter(false, semesterData.courses, curriculum, courseData, gradeList, semesterData.name);
            } else {
                console.error('createSemeter function not found');
            }
        }
    }

    return stats;
}

// Export functions for use in main.js
window.academicRecordsParser = {
    parseAcademicRecords,
    importParsedCourses
};
