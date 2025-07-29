// Curriculum constructor. In a non-module environment this function will
// be attached to the global window so that other scripts can instantiate
// curricula without using ES module imports.

function s_curriculum()
{
    this.semester_id = 0;
    this.course_id = 0;
    this.container_id = 0;
    this.semesters = [];
    this.major = '';

    this.getTotalCredits = function ()
    {};
    this.getSemester = function(id)
    {
        for(let i = 0; i < this.semesters.length; i++)
        {
            if(this.semesters[i].id == id)
            {
                return this.semesters[i];
            }
        }
        alert("SEMESTER NOT FOUND");
    };
    this.deleteSemester = function(id)
    {
        for(let i = 0; i < this.semesters.length; i++)
        {
            if(this.semesters[i].id == id)
            {
                this.semesters.splice(i,1)
            }
        }
    }
    this.print = function()
    {
        for(let i = 0; i < this.semesters.length; i++)
        {
            for(let a = 0; a < this.semesters[i].courses.length; a++)
            {
                console.log(this.semesters[i].courses[a].code)
            }
        }
    }
    this.hasCourse = function(course)
    {
        for(let i = 0; i < this.semesters.length; i++)
        {
            for(let a = 0; a < this.semesters[i].courses.length; a++)
            {
                if(this.semesters[i].courses[a].code == course)
                {return true;}
            }
        }
        return false;
    }
    this.canGraduate = function()
    {
        let area = 0;
        let core = 0;
        let free = 0;
        let university = 0;
        let required = 0;
        let total = 0;
        let science = 0;
        let engineering = 0;
        let ects = 0;
        
        for(let i = 0; i < this.semesters.length; i++)
        {
            total = total + this.semesters[i].totalCredit;
            area = area + this.semesters[i].totalArea;
            core = core + this.semesters[i].totalCore;
            free = free + this.semesters[i].totalFree;
            university = university + this.semesters[i].totalUniversity;
            required = required + this.semesters[i].totalRequired;
            science += this.semesters[i].totalScience;
            engineering += this.semesters[i].totalEngineering;
            ects += this.semesters[i].totalECTS;
        }
        // Generic requirement checks
        const req = requirements[this.major] || {};
        if (university < req.university) return 1;
        if (req.internshipCourse && !this.hasCourse(req.internshipCourse)) return 4;
        if (total < req.total) return 5;
        if (science < req.science) return 8;
        if (engineering < req.engineering) return 9;
        if (ects < req.ects) return 10;
        if (required < req.required) return 2;
        // Check core, area and free credits against requirements directly.
        // Do not perform dynamic reallocation here because the effective
        // categories have already been computed via recalcEffectiveTypes().
        if (core < req.core) return 6;
        if (area < req.area) return 7;
        if (free < req.free) return 8;
        return 0;

        // Major-specific CS checks (only additional flags beyond generic)
        if(this.major == 'CS')
        {
            // Check CS internship and special courses handled generically, now check SPS303, HUM2XX/HUM3XX
            if (!this.hasCourse("SPS303")) return 11;
            if (!(this.hasCourse("HUM201") || this.hasCourse("HUM202") || this.hasCourse("HUM207"))) return 12;
            if (!this.hasCourse("CS395")) return 13;
            {
                // Check faculty course requirements for CS
                let facultyCoursesCount = 0;
                let fensCoursesCount = 0;
                let mathCoursesCount = 0;

                for(let i = 0; i < this.semesters.length; i++) {
                    for(let a = 0; a < this.semesters[i].courses.length; a++) {
                        let course = this.semesters[i].courses[a];
                        // Count faculty courses using the new Faculty_Course attribute
                        if(course.Faculty_Course && course.Faculty_Course !== 'No') {
                            facultyCoursesCount++;

                            // Count FENS courses
                            if(course.Faculty_Course === "FENS") {
                                fensCoursesCount++;
                            }

                            // Count MATH courses from FENS faculty courses
                            if(course.Faculty_Course === "FENS" && course.code.startsWith("MATH")) {
                                mathCoursesCount++;
                            }
                        }
                    }
                }

                if(facultyCoursesCount < 5) return 14;
                if(mathCoursesCount < 2) return 19;
                if(fensCoursesCount < 3) return 16;


            }
        }
        else if(this.major == 'IE')
        {
            // Generic checks apply
            // Additional IE-specific logic can be added here if needed
            {
                // Check faculty course requirements for IE (same as CS, EE, MAT)
                let facultyCoursesCount = 0;
                let fensCoursesCount = 0;
                let mathCoursesCount = 0;

                for(let i = 0; i < this.semesters.length; i++) {
                    for(let a = 0; a < this.semesters[i].courses.length; a++) {
                        let course = this.semesters[i].courses[a];
                        // Count faculty courses using the new Faculty_Course attribute
                        if(course.Faculty_Course && course.Faculty_Course !== 'No') {
                            facultyCoursesCount++;

                            // Count FENS courses
                            if(course.Faculty_Course === "FENS") {
                                fensCoursesCount++;
                            }

                            // Count MATH courses from FENS faculty courses
                            if(course.Faculty_Course === "FENS" && course.code.startsWith("MATH")) {
                                mathCoursesCount++;
                            }
                        }
                    }
                }

                if(facultyCoursesCount < 5) return 14;
                if(mathCoursesCount < 2) return 19;
                if(fensCoursesCount < 3) return 16;
                return 0;
            }
        }
        else if(this.major == 'EE')
        {
            // Generic checks apply
            {
                // Check for minimum 400-level EE courses requirement (9 credits)
                let ee400LevelCredits = 0;
                for(let i = 0; i < this.semesters.length; i++) {
                    for(let a = 0; a < this.semesters[i].courses.length; a++) {
                        let course = this.semesters[i].courses[a];
                        // Check if it's a 400-level EE course in core electives
                        if(course.code.startsWith("EE4") && course.category === "Core") {
                            ee400LevelCredits += course.credit;
                        }
                    }
                }

                if (ee400LevelCredits < 9) return 23;

                if (core < 25) return 19; // Minimum core electives requirement
                else
                {

                    // Check for minimum one course from specific area electives
                    let hasSpecificAreaCourse = false;
                    const specificAreaCourses = ["CS300", "CS401", "CS412", "ME303", "PHYS302", "PHYS303"];

                    for(let i = 0; i < this.semesters.length; i++) {
                        for(let a = 0; a < this.semesters[i].courses.length; a++) {
                            let course = this.semesters[i].courses[a];
                            // Check for specific area courses
                            if(specificAreaCourses.includes(course.code) ||
                               (course.code.startsWith("EE48") && course.category === "Area")) {
                                hasSpecificAreaCourse = true;
                                break;
                            }
                        }
                        if(hasSpecificAreaCourse) break;
                    }

                    if(!hasSpecificAreaCourse) return 24;

                    return 0;
                }
            }
        }
        else if(this.major == 'MAT')
        {
            // Generic checks apply
            {
                // Check if student has at least 5 faculty courses with special requirements
                let facultyCoursesCount = 0;
                let fensCoursesCount = 0;
                let mathCoursesCount = 0;

                for(let i = 0; i < this.semesters.length; i++) {
                    for(let a = 0; a < this.semesters[i].courses.length; a++) {
                        let course = this.semesters[i].courses[a];
                        // Count faculty courses using the new Faculty_Course attribute
                        if(course.Faculty_Course && course.Faculty_Course !== 'No') {
                            facultyCoursesCount++;

                            // Count FENS courses
                            if(course.Faculty_Course === "FENS") {
                                fensCoursesCount++;
                            }

                            // Count MATH courses from FENS faculty courses
                            if(course.Faculty_Course === "FENS" && course.code.startsWith("MATH")) {
                                mathCoursesCount++;
                            }
                        }
                    }
                }

                if(facultyCoursesCount < 5) return 14;
                if(mathCoursesCount < 2) return 19;
                if(fensCoursesCount < 3) return 16;

                return 0;
            }
        }
        else if(this.major == 'BIO')
        {
            // Generic checks apply
            {
                // Check faculty course requirements for BIO
                let facultyCoursesCount = 0;
                let fensCoursesCount = 0;
                let mathCoursesCount = 0;

                for(let i = 0; i < this.semesters.length; i++) {
                    for(let a = 0; a < this.semesters[i].courses.length; a++) {
                        let course = this.semesters[i].courses[a];
                        // Count faculty courses using the new Faculty_Course attribute
                        if(course.Faculty_Course && course.Faculty_Course !== 'No') {
                            facultyCoursesCount++;

                            // Count FENS courses
                            if(course.Faculty_Course === "FENS") {
                                fensCoursesCount++;
                            }

                            // Count MATH courses from FENS faculty courses
                            if(course.Faculty_Course === "FENS" && course.code.startsWith("MATH")) {
                                mathCoursesCount++;
                            }
                        }
                    }
                }

                if(facultyCoursesCount < 5) return 14;
                if(mathCoursesCount < 2) return 19;
                if(fensCoursesCount < 3) return 16;

                return 0;
            }
        }
        else if(this.major == 'ME')
        {
            // Generic checks apply
            {
                // Check faculty course requirements for ME (same as CS, EE, MAT, IE)
                let facultyCoursesCount = 0;
                let fensCoursesCount = 0;
                let mathCoursesCount = 0;

                for(let i = 0; i < this.semesters.length; i++) {
                    for(let a = 0; a < this.semesters[i].courses.length; a++) {
                        let course = this.semesters[i].courses[a];
                        // Count faculty courses using the new Faculty_Course attribute
                        if(course.Faculty_Course && course.Faculty_Course !== 'No') {
                            facultyCoursesCount++;

                            // Count FENS courses
                            if(course.Faculty_Course === "FENS") {
                                fensCoursesCount++;
                            }

                            // Count MATH courses from FENS faculty courses
                            if(course.Faculty_Course === "FENS" && course.code.startsWith("MATH")) {
                                mathCoursesCount++;
                            }
                        }
                    }
                }

                if(facultyCoursesCount < 5) return 14;
                if(mathCoursesCount < 2) return 19;
                if(fensCoursesCount < 3) return 16;
            }
        }
        else if(this.major == 'ECON')
        {
            // Generic checks apply
            {
                // Check if Math requirement (3 credits) is fulfilled
                let hasMathRequirement = this.hasCourse("MATH201") || this.hasCourse("MATH202") || this.hasCourse("MATH204");
                if (!hasMathRequirement) return 25;

                // Check if at least 5 faculty courses requirement is met
                let facultyCoursesCount = 0;
                let fassCount = 0;
                let areasCount = new Set();

                for(let i = 0; i < this.semesters.length; i++) {
                    for(let a = 0; a < this.semesters[i].courses.length; a++) {
                        let course = this.semesters[i].courses[a];
                        // Count faculty courses using the new Faculty_Course attribute
                        if(course.Faculty_Course && course.Faculty_Course !== 'No') {
                            facultyCoursesCount++;

                            // Count FASS courses
                            if(course.Faculty_Course === "FASS") {
                                fassCount++;
                            }

                            // Track areas (simplified check)
                            if(course.code.startsWith("CULT")) areasCount.add("CULT");
                            else if(course.code.startsWith("ECON")) areasCount.add("ECON");
                            else if(course.code.startsWith("HART")) areasCount.add("HART");
                            else if(course.code.startsWith("PSYCH")) areasCount.add("PSYCH");
                            else if(course.code.startsWith("SPS") || course.code.startsWith("POLS") || course.code.startsWith("IR")) areasCount.add("SPS/POLS/IR");
                            else if(course.code.startsWith("VA")) areasCount.add("VA");
                            else if(course.Faculty_Course === "FENS") areasCount.add("FENS");
                            else if(course.Faculty_Course === "SBS") areasCount.add("SBS");
                        }
                    }
                }

                if(facultyCoursesCount < 5) return 14;
                if(fassCount < 3) return 15;
                if(areasCount.size < 3) return 18;
            }
        }
        else if(this.major == 'MAN')
        {
            // Generic checks apply
            {
                // Check faculty course requirements for MAN
                let facultyCoursesCount = 0;
                let sbsCoursesCount = 0;

                for(let i = 0; i < this.semesters.length; i++) {
                    for(let a = 0; a < this.semesters[i].courses.length; a++) {
                        let course = this.semesters[i].courses[a];
                        // Count faculty courses using the new Faculty_Course attribute
                        if(course.Faculty_Course && course.Faculty_Course !== 'No') {
                            facultyCoursesCount++;

                            // Count SBS courses
                            if(course.Faculty_Course === "SBS") {
                                sbsCoursesCount++;
                            }
                        }
                    }
                }

                if(facultyCoursesCount < 5) return 14;
                if(sbsCoursesCount < 2) return 22;

                // Check core electives requirement (6 courses from 6 different areas)
                let coreAreas = new Set();
                let coreCount = 0;

                for(let i = 0; i < this.semesters.length; i++) {
                    for(let a = 0; a < this.semesters[i].courses.length; a++) {
                        let course = this.semesters[i].courses[a];
                        if(course.category === "Core") {
                            coreCount++;
                            if(course.code.startsWith("ACC")) coreAreas.add("ACC");
                            else if(course.code.startsWith("FIN")) coreAreas.add("FIN");
                            else if(course.code.startsWith("MGMT")) coreAreas.add("MGMT");
                            else if(course.code.startsWith("MKTG")) coreAreas.add("MKTG");
                            else if(course.code.startsWith("OPIM")) coreAreas.add("OPIM");
                            else if(course.code.startsWith("ORG")) coreAreas.add("ORG");
                        }
                    }
                }

                if(coreCount < 6) return 58; // Not enough core courses
                if(coreAreas.size < 6) return 59; // Not enough diverse core areas
            }
        }
        else if(this.major == 'PSIR')
        {
            // Generic checks apply
            {
                // Check faculty course requirements for PSIR
                let facultyCoursesCount = 0;
                let fassCoursesCount = 0;
                let areasCount = new Set();

                for(let i = 0; i < this.semesters.length; i++) {
                    for(let a = 0; a < this.semesters[i].courses.length; a++) {
                        let course = this.semesters[i].courses[a];
                        // Count faculty courses using the new Faculty_Course attribute
                        if(course.Faculty_Course && course.Faculty_Course !== 'No') {
                            facultyCoursesCount++;

                            // Count FASS courses
                            if(course.Faculty_Course === "FASS") {
                                fassCoursesCount++;
                            }

                            // Track areas for PSIR
                            if(course.code.startsWith("CULT")) areasCount.add("CULT");
                            else if(course.code.startsWith("ECON")) areasCount.add("ECON");
                            else if(course.code.startsWith("HART")) areasCount.add("HART");
                            else if(course.code.startsWith("PSY")) areasCount.add("PSYCH");
                            else if(course.code.startsWith("SPS") || course.code.startsWith("POLS") || course.code.startsWith("IR")) areasCount.add("SPS/POLS/IR");
                            else if(course.code.startsWith("VA")) areasCount.add("VA");
                            else if(course.Faculty_Course === "FENS") areasCount.add("FENS");
                            else if(course.Faculty_Course === "SBS") areasCount.add("SBS");
                        }
                    }
                }

                if(facultyCoursesCount < 5) return 14;
                if(fassCoursesCount < 3) return 15;
                if(areasCount.size < 3) return 18;
            }
        }
        else if(this.major == 'PSY')
        {
            // Generic checks apply
            {
                // Check Philosophy requirement
                let hasPhilosophy = this.hasCourse("PHIL300") || this.hasCourse("PHIL301");
                if (!hasPhilosophy) return 26;

                // Check faculty course requirements for PSY
                let facultyCoursesCount = 0;
                let fassCoursesCount = 0;
                let areasCount = new Set();

                for(let i = 0; i < this.semesters.length; i++) {
                    for(let a = 0; a < this.semesters[i].courses.length; a++) {
                        let course = this.semesters[i].courses[a];
                        // Count faculty courses using the new Faculty_Course attribute
                        if(course.Faculty_Course && course.Faculty_Course !== 'No') {
                            facultyCoursesCount++;

                            // Count FASS courses
                            if(course.Faculty_Course === "FASS") {
                                fassCoursesCount++;
                            }

                            // Track areas for PSY
                            if(course.code.startsWith("CULT")) areasCount.add("CULT");
                            else if(course.code.startsWith("ECON")) areasCount.add("ECON");
                            else if(course.code.startsWith("HART")) areasCount.add("HART");
                            else if(course.code.startsWith("PSY")) areasCount.add("PSYCH");
                            else if(course.code.startsWith("SPS") || course.code.startsWith("POLS") || course.code.startsWith("IR")) areasCount.add("SPS/POLS/IR");
                            else if(course.code.startsWith("VA")) areasCount.add("VA");
                            else if(course.Faculty_Course === "FENS") areasCount.add("FENS");
                            else if(course.Faculty_Course === "SBS") areasCount.add("SBS");
                        }
                    }
                }

                if(facultyCoursesCount < 5) return 14;
                if(fassCoursesCount < 3) return 15;
                if(areasCount.size < 3) return 18;

                // Check core electives requirement (7 courses)
                let psyCoreCount = 0;
                for(let i = 0; i < this.semesters.length; i++) {
                    for(let a = 0; a < this.semesters[i].courses.length; a++) {
                        let course = this.semesters[i].courses[a];
                        if(course.category === "Core") {
                            psyCoreCount++;
                        }
                    }
                }

                if(psyCoreCount < 7) return 77; // Not enough PSY core courses
            }
        }
        else if(this.major == 'VACD')
        {
            // Generic checks apply
            {
                // Check faculty course requirements for VACD
                let facultyCoursesCount = 0;
                let fassCoursesCount = 0;
                let areasCount = new Set();

                for(let i = 0; i < this.semesters.length; i++) {
                    for(let a = 0; a < this.semesters[i].courses.length; a++) {
                        let course = this.semesters[i].courses[a];
                        // Count faculty courses using the new Faculty_Course attribute
                        if(course.Faculty_Course && course.Faculty_Course !== 'No') {
                            facultyCoursesCount++;

                            // Count FASS courses
                            if(course.Faculty_Course === "FASS") {
                                fassCoursesCount++;
                            }

                            // Track areas for VACD
                            if(course.code.startsWith("CULT")) areasCount.add("CULT");
                            else if(course.code.startsWith("ECON")) areasCount.add("ECON");
                            else if(course.code.startsWith("HART")) areasCount.add("HART");
                            else if(course.code.startsWith("PSY")) areasCount.add("PSYCH");
                            else if(course.code.startsWith("SPS") || course.code.startsWith("POLS") || course.code.startsWith("IR")) areasCount.add("SPS/POLS/IR");
                            else if(course.code.startsWith("VA")) areasCount.add("VA");
                            else if(course.Faculty_Course === "FENS") areasCount.add("FENS");
                            else if(course.Faculty_Course === "SBS") areasCount.add("SBS");
                        }
                    }
                }

                if(facultyCoursesCount < 5) return 14;
                if(fassCoursesCount < 3) return 15;
                if(areasCount.size < 3) return 18;
            }
        }
        else if(this.major == 'DSA')
        {
            // Generic checks apply
            {
                // Check faculty course requirements for DSA
                let facultyCoursesCount = 0;
                let fensCoursesCount = 0;
                let fassCoursesCount = 0;
                let sbsCoursesCount = 0;

                for(let i = 0; i < this.semesters.length; i++) {
                    for(let a = 0; a < this.semesters[i].courses.length; a++) {
                        let course = this.semesters[i].courses[a];
                        // Count faculty courses using the new Faculty_Course attribute
                        if(course.Faculty_Course && course.Faculty_Course !== 'No') {
                            facultyCoursesCount++;

                            // Count courses by faculty
                            if(course.Faculty_Course === "FENS") {
                                fensCoursesCount++;
                            } else if(course.Faculty_Course === "FASS") {
                                fassCoursesCount++;
                            } else if(course.Faculty_Course === "SBS") {
                                sbsCoursesCount++;
                            }
                        }
                    }
                }

                if(facultyCoursesCount < 5) return 14;
                if(fensCoursesCount < 1) return 20;
                if(fassCoursesCount < 1) return 21;
                if(sbsCoursesCount < 1) return 22;

                // Check core electives requirements
                // At least 27 SU credits with at least 3 courses from each faculty
                let fensCoreCount = 0;
                let fassCoreCount = 0;
                let sbsCoreCount = 0;

                for(let i = 0; i < this.semesters.length; i++) {
                    for(let a = 0; a < this.semesters[i].courses.length; a++) {
                        let course = this.semesters[i].courses[a];
                        if(course.category === "Core") {
                            if(course.Faculty_Course === "FENS") {
                                fensCoreCount++;
                            } else if(course.Faculty_Course === "FASS") {
                                fassCoreCount++;
                            } else if(course.Faculty_Course === "SBS") {
                                sbsCoreCount++;
                            }
                        }
                    }
                }

                if(fensCoreCount < 3) return 27;
                if(fassCoreCount < 3) return 28;
                if(sbsCoreCount < 3) return 29;
            }
        }
    }

    /**
     * Recalculate the effective category (core/area/free) for every course
     * across all semesters based on chronological order. This method sorts
     * semesters by their `termIndex` values (earliest to latest) and then
     * allocates course credits to core, area and free categories according to
     * the major requirements. If the core requirement is filled, additional
     * core courses count toward the area requirement. Once area is filled,
     * additional core or area courses count as free electives. Courses with
     * static types of "university" or "required" are not reallocated. After
     * reallocation, the semester totals for core, area and free are updated
     * accordingly and each course's `.effective_type` field is set. The
     * displayed course type in the DOM (the `.course_type` element) is also
     * updated to reflect the effective category.
     *
     * @param {Array} course_data The full course data array for the current major.
     */
    this.recalcEffectiveTypes = function (course_data) {
        // Determine requirement thresholds for this major. If a requirement is
        // undefined (e.g., for non-engineering majors without a science
        // requirement), default to 0 so no credits are allocated to that
        // category.
        const req = requirements[this.major] || {};
        const reqCore = req.core || 0;
        const reqArea = req.area || 0;

        // Before performing any lookups, attempt to find the `getInfo` helper
        // function. In a browser environment `getInfo` is declared in
        // helper_functions.js and becomes a property of the global `window`.
        // In the unlikely event that it cannot be found, we skip
        // reallocation since course information will be unavailable.
        const getInfoFn = (typeof getInfo === 'function') ? getInfo :
                          ((typeof window !== 'undefined' && typeof window.getInfo === 'function') ? window.getInfo : null);
        if (!getInfoFn) {
            return;
        }


        // First reset totals for each semester. We will accumulate fresh values
        // below. Note: totalCredit is recomputed to avoid stale values.
        for (let i = 0; i < this.semesters.length; i++) {
            const sem = this.semesters[i];
            sem.totalCredit = 0;
            sem.totalArea = 0;
            sem.totalCore = 0;
            sem.totalFree = 0;
            sem.totalUniversity = 0;
            sem.totalRequired = 0;
            sem.totalScience = 0.0;
            sem.totalEngineering = 0.0;
            sem.totalECTS = 0.0;
            // We leave totalGPA and totalGPACredits untouched because they
            // depend on the user's recorded grades rather than the static type.
        }

        // Sort a copy of semesters chronologically based on the stored
        // `termIndex` property. If `termIndex` is null (e.g., a newly created
        // semester without a date), treat it as very large so it will be
        // allocated last.
        const sortedSemesters = this.semesters.slice().sort((a, b) => {
            const idxA = (a.termIndex !== null && a.termIndex !== undefined) ? a.termIndex : Number.MAX_SAFE_INTEGER;
            const idxB = (b.termIndex !== null && b.termIndex !== undefined) ? b.termIndex : Number.MAX_SAFE_INTEGER;
            return idxA - idxB;
        });

        // Running counters for how many credits have been allocated to core and
        // area so far. Once these exceed the requirements, we allocate
        // additional courses to the next category (area or free).
        let currentCoreCredits = 0;
        let currentAreaCredits = 0;

        // Iterate semesters in chronological order
        for (let i = 0; i < sortedSemesters.length; i++) {
            const sem = sortedSemesters[i];
            // Iterate courses in the order they appear within the semester.
            for (let j = 0; j < sem.courses.length; j++) {
                const course = sem.courses[j];
                const info = getInfoFn(course.code, course_data);
                if (!info) continue; // Skip unknown courses
                const staticType = (info['EL_Type'] || '').toLowerCase();
                const credit = parseInt(info['SU_credit'] || '0');

                // Update generic totals (credits, science, engineering, ECTS).
                sem.totalCredit += credit;
                sem.totalScience += parseFloat(info['Basic_Science'] || '0');
                sem.totalEngineering += parseFloat(info['Engineering'] || '0');
                sem.totalECTS += parseFloat(info['ECTS'] || '0');

                let effectiveType = staticType;
                // Only core and area types are reallocated. Free types stay as
                // free. Required and university types remain unchanged.
                if (staticType === 'core') {
                    if (currentCoreCredits < reqCore) {
                        effectiveType = 'core';
                        currentCoreCredits += credit;
                    } else if (currentAreaCredits < reqArea) {
                        effectiveType = 'area';
                        currentAreaCredits += credit;
                    } else {
                        effectiveType = 'free';
                    }
                } else if (staticType === 'area') {
                    if (currentAreaCredits < reqArea) {
                        effectiveType = 'area';
                        currentAreaCredits += credit;
                    } else {
                        effectiveType = 'free';
                    }
                } else if (staticType === 'free') {
                    effectiveType = 'free';
                } else {
                    // Types 'university' and 'required' (and any others)
                    // remain unchanged and are not reallocated.
                    effectiveType = staticType;
                }
                // Persist the effective type on the course object
                course.effective_type = effectiveType;

                // Update semester category totals based on the effective type.
                if (effectiveType === 'core') {
                    sem.totalCore += credit;
                } else if (effectiveType === 'area') {
                    sem.totalArea += credit;
                } else if (effectiveType === 'free') {
                    sem.totalFree += credit;
                } else if (effectiveType === 'university') {
                    sem.totalUniversity += credit;
                } else if (effectiveType === 'required') {
                    sem.totalRequired += credit;
                }

                // Update the course type displayed in the DOM if possible. The
                // course element has id equal to course.id (e.g., 'c3'). It
                // contains a child with class 'course_type' that shows the
                // static type. We update its text content to reflect the
                // effective type. If the element does not exist (e.g., during
                // server-side tests), this call will silently fail.
                try {
                    const courseElem = document.getElementById(course.id);
                    if (courseElem) {
                        const typeElem = courseElem.querySelector('.course_type');
                        if (typeElem) {
                            typeElem.textContent = effectiveType.toUpperCase();
                        }
                    }
                } catch (err) {
                    // Ignore DOM errors in non-browser contexts
                }
            }
        }
        // After reallocation, update the displayed total credits for each
        // semester in the user interface. Each semester element has an id
        // (e.g., 's1') and resides within a container with class
        // 'container_semester' which contains a span showing the total.
        try {
            for (let i = 0; i < this.semesters.length; i++) {
                const sem = this.semesters[i];
                const semElem = document.getElementById(sem.id);
                if (semElem) {
                    // Traverse up to the nearest container_semester
                    let containerElem = semElem.closest && semElem.closest('.container_semester');
                    if (!containerElem) {
                        // Fallback manual traversal if closest isn't available
                        let parent = semElem.parentNode;
                        while (parent && !parent.classList.contains('container_semester')) {
                            parent = parent.parentNode;
                        }
                        containerElem = parent;
                    }
                    if (containerElem) {
                        const span = containerElem.querySelector('.total_credit_text span');
                        if (span) {
                            span.innerHTML = 'Total: ' + sem.totalCredit + ' credits';
                        }
                    }
                }
            }
        } catch (err) {
            // Ignore DOM errors in non-browser contexts
        }
    };

    // end of s_curriculum constructor
}

// Expose s_curriculum constructor globally when running in a browser.
if (typeof window !== 'undefined') {
    window.s_curriculum = s_curriculum;
}