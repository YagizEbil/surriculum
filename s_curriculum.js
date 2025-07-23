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
        if(this.major == 'CS')
        {
            if(total < 125) return 1;
            else if (university < 41) return 2;
            else if (required < 29) return 3;
            else if (science < 60) return 11;
            else if (engineering < 90) return 12;
            else if ( !this.hasCourse("CIP101N")) return 4;
            else if (!this.hasCourse("CS395"))  return 5;
            else if (!this.hasCourse("SPS303")) return 9;
            else if (!(this.hasCourse("HUM201") || this.hasCourse("HUM202") || this.hasCourse("HUM207"))) return 10;
            else if (ects < 240) return 13;
            else
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

                if(facultyCoursesCount < 5) return 44; // Not enough faculty courses
                if(mathCoursesCount < 2) return 45; // Not enough MATH courses
                if(fensCoursesCount < 3) return 46; // Not enough FENS courses

                if (core < 31) return 6;
                else
                {
                    area = area + (core - 31);
                    if (area < 9) return 7;
                    else
                    {
                        free = free + (area - 9);
                        if(free<15) return 8;
                        else return 0;
                    }
                }
            }
        }
        else if(this.major == 'IE')
        {
            if(total < 125) return 1;
            else if (university < 41) return 2;
            else if (required < 34) return 14; // Updated to 34 SU credits
            else if (science < 60) return 11;
            else if (engineering < 90) return 12;
            else if ( !this.hasCourse("CIP101N")) return 4;
            else if (!this.hasCourse("IE395"))  return 15;
            else if (!this.hasCourse("SPS303")) return 9;
            else if (!(this.hasCourse("HUM201") || this.hasCourse("HUM202") || this.hasCourse("HUM207"))) return 10;
            else if (ects < 240) return 13;
            else
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

                if(facultyCoursesCount < 5) return 44; // Not enough faculty courses
                if(mathCoursesCount < 2) return 45; // Not enough MATH courses
                if(fensCoursesCount < 3) return 46; // Not enough FENS courses

                if (core < 26) return 16; // Updated to 26 SU credits
                else
                {
                    area = area + (core - 26);
                    if (area < 9) return 7;
                    else
                    {
                        free = free + (area - 9);
                        if(free<15) return 8;
                        else return 0;
                    }
                }
            }
        }
        else if(this.major == 'EE')
        {
            if(total < 125) return 1;
            else if (university < 41) return 2;
            else if (required < 35) return 17; //CHANGE
            else if (science < 60) return 11;
            else if (engineering < 90) return 12;
            else if ( !this.hasCourse("CIP101N")) return 4;
            else if (!this.hasCourse("EE395"))  return 18; //CHANGE
            else if (!this.hasCourse("SPS303")) return 9;
            else if (!(this.hasCourse("HUM201") || this.hasCourse("HUM202") || this.hasCourse("HUM207"))) return 10;
            else if (ects < 240) return 13;
            else
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

                if (ee400LevelCredits < 9) return 38; // Not enough 400-level EE courses

                if (core < 25) return 19; // Minimum core electives requirement
                else
                {
                    area = area + (core - 25);

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

                    if(!hasSpecificAreaCourse) return 39; // Missing specific area course requirement

                    if (area < 9) return 7;
                    else
                    {
                        free = free + (area - 9);
                        if(free<15) return 8;
                        else return 0;
                    }
                }
            }
        }
        else if(this.major == 'MAT')
        {
            if(total < 125) return 1;
            else if (university < 41) return 2;
            else if (required < 26) return 20;
            else if (science < 60) return 11;
            else if (engineering < 90) return 12;
            else if ( !this.hasCourse("CIP101N")) return 4;
            else if (!this.hasCourse("MAT395"))  return 21;
            else if (!this.hasCourse("SPS303")) return 9;
            else if (!(this.hasCourse("HUM201") || this.hasCourse("HUM202") || this.hasCourse("HUM207"))) return 10;
            else if (ects < 240) return 13;
            else
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

                if(facultyCoursesCount < 5) return 44; // Not enough faculty courses
                if(mathCoursesCount < 2) return 45; // Not enough MATH courses
                if(fensCoursesCount < 3) return 46; // Not enough FENS courses

                if (core < 34) return 22;
                else
                {
                    area = area + (core - 34);
                    if (area < 9) return 7;
                    else
                    {
                        free = free + (area - 9);
                        if(free<15) return 8;
                        else return 0;
                    }
                }
            }
        }
        else if(this.major == 'BIO')
        {
            if(total < 127) return 1; // Updated total credits to 127
            else if (university < 41) return 2;
            else if (required < 33) return 14; // Updated required credits to 33
            else if ( !this.hasCourse("CIP101N")) return 4;
            else if (!this.hasCourse("BIO395"))  return 23;
            else if (!this.hasCourse("SPS303")) return 9;
            else if (!(this.hasCourse("HUM201") || this.hasCourse("HUM202") || this.hasCourse("HUM207"))) return 10;
            else if (ects < 240) return 13;
            else
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

                if(facultyCoursesCount < 5) return 44; // Not enough faculty courses
                if(mathCoursesCount < 2) return 45; // Not enough MATH courses
                if(fensCoursesCount < 3) return 46; // Not enough FENS courses

                if (core < 29) return 16;
                else
                {
                    area = area + (core - 29);
                    if (area < 9) return 7;
                    else
                    {
                        free = free + (area - 9);
                        if(free < 15) return 8;
                        else return 0;
                    }
                }
            }
        }
        else if(this.major == 'ME')
        {
            if(total < 125) return 1;
            else if (university < 41) return 2;
            else if (required < 34) return 24; // Updated to 34 SU credits
            else if (science < 60) return 11;
            else if (engineering < 90) return 12;
            else if ( !this.hasCourse("CIP101N")) return 4;
            else if (!this.hasCourse("ME395"))  return 25;
            else if (!this.hasCourse("SPS303")) return 9;
            else if (!(this.hasCourse("HUM201") || this.hasCourse("HUM202") || this.hasCourse("HUM207"))) return 10;
            else if (ects < 240) return 13;
            else
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

                if(facultyCoursesCount < 5) return 44; // Not enough faculty courses
                if(mathCoursesCount < 2) return 45; // Not enough MATH courses
                if(fensCoursesCount < 3) return 46; // Not enough FENS courses

                if (core < 26) return 26; // Updated to 26 SU credits
                else
                {
                    area = area + (core - 26);
                    if (area < 9) return 7;
                    else
                    {
                        free = free + (area - 9);
                        if(free<15) return 8;
                        else return 0;
                    }
                }
            }
        }
        else if(this.major == 'ECON')
        {
            if(total < 125) return 1;
            else if (university < 44) return 2; // Updated to 44 SU credits
            else if (required < 18) return 27; // Updated to 18 SU credits for required courses
            else if ( !this.hasCourse("CIP101N")) return 4;
            else if (!this.hasCourse("ECON300"))  return 28;
            else if (!this.hasCourse("SPS303")) return 9;
            else if (!(this.hasCourse("HUM201") || this.hasCourse("HUM202") || this.hasCourse("HUM207"))) return 10;
            else if (ects < 240) return 13;
            else if (!(this.hasCourse("HUM311") || this.hasCourse("HUM312") || this.hasCourse("HUM317") || this.hasCourse("HUM321") || this.hasCourse("HUM322") || this.hasCourse("HUM371"))) return 32; // Updated HUM courses list
            else
            {
                // Check if Math requirement (3 credits) is fulfilled
                let hasMathRequirement = this.hasCourse("MATH201") || this.hasCourse("MATH202") || this.hasCourse("MATH204");
                if (!hasMathRequirement) return 40; // New error code for Math requirement

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

                if(facultyCoursesCount < 5) return 41; // Not enough faculty courses
                if(fassCount < 3) return 42; // Not enough FASS courses
                if(areasCount.size < 3) return 43; // Not enough diverse areas

                if (core < 12) return 29; // Updated to 12 SU credits for core electives
                else
                {
                    area = area + (core - 12);
                    if (area < 18) return 30; // Updated to 18 SU credits for area electives
                    else
                    {
                        free = free + (area - 18);
                        if(free < 30) return 31; // Updated to 30 SU credits for free electives
                        else return 0;
                    }
                }
            }
        }
        else if(this.major == 'MAN')
        {
            if(total < 127) return 1; // Updated to 127 SU credits
            else if (university < 44) return 2;
            else if (required < 15) return 54; // MAN required courses - 15 SU credits
            else if ( !this.hasCourse("CIP101N")) return 4;
            else if (!this.hasCourse("MGMT300")) return 55; // Summer Internship requirement
            else if (!this.hasCourse("SPS303")) return 9;
            else if (!(this.hasCourse("HUM201") || this.hasCourse("HUM202") || this.hasCourse("HUM207"))) return 10;
            else if (ects < 240) return 13;
            else
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

                if(facultyCoursesCount < 5) return 56; // Not enough faculty courses
                if(sbsCoursesCount < 2) return 57; // Not enough SBS courses

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

                if (core < 18) return 60; // MAN core electives - 18 SU credits
                else
                {
                    area = area + (core - 18);
                    if (area < 24) return 61; // MAN area electives - 24 SU credits
                    else
                    {
                        free = free + (area - 24);
                        if(free < 26) return 62; // MAN free electives - 26 SU credits
                        else return 0;
                    }
                }
            }
        }
        else if(this.major == 'PSIR')
        {
            if(total < 125) return 1;
            else if (university < 44) return 2;
            else if (required < 24) return 63; // PSIR required courses - 24 SU credits
            else if ( !this.hasCourse("CIP101N")) return 4;
            else if (!this.hasCourse("PSIR300")) return 64; // Project and Internship requirement
            else if (!this.hasCourse("SPS303")) return 9;
            else if (!(this.hasCourse("HUM201") || this.hasCourse("HUM202") || this.hasCourse("HUM207"))) return 10;
            else if (ects < 240) return 13;
            else
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

                if(facultyCoursesCount < 5) return 65; // Not enough faculty courses
                if(fassCoursesCount < 3) return 66; // Not enough FASS courses
                if(areasCount.size < 3) return 67; // Not enough diverse areas

                if (core < 24) return 68; // PSIR core electives - 24 SU credits (12+12)
                else
                {
                    area = area + (core - 24);
                    if (area < 15) return 69; // PSIR area electives - 15 SU credits
                    else
                    {
                        free = free + (area - 15);
                        if(free < 18) return 70; // PSIR free electives - 18 SU credits
                        else return 0;
                    }
                }
            }
        }
        else if(this.major == 'PSY')
        {
            if(total < 125) return 1;
            else if (university < 44) return 2;
            else if (required < 18) return 71; // PSY required courses - 18 SU credits
            else if ( !this.hasCourse("CIP101N")) return 4;
            else if (!this.hasCourse("PSY300")) return 72; // Project and Internship requirement
            else if (!this.hasCourse("SPS303")) return 9;
            else if (!(this.hasCourse("HUM201") || this.hasCourse("HUM202") || this.hasCourse("HUM207"))) return 10;
            else if (ects < 240) return 13;
            else
            {
                // Check Philosophy requirement
                let hasPhilosophy = this.hasCourse("PHIL300") || this.hasCourse("PHIL301");
                if (!hasPhilosophy) return 73; // Philosophy requirement not met

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

                if(facultyCoursesCount < 5) return 74; // Not enough faculty courses
                if(fassCoursesCount < 3) return 75; // Not enough FASS courses
                if(areasCount.size < 3) return 76; // Not enough diverse areas

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

                if (core < 21) return 78; // PSY core electives - 21 SU credits
                else
                {
                    area = area + (core - 21);
                    if (area < 18) return 79; // PSY area electives - 18 SU credits
                    else
                    {
                        free = free + (area - 18);
                        if(free < 21) return 80; // PSY free electives - 21 SU credits
                        else return 0;
                    }
                }
            }
        }
        else if(this.major == 'VACD')
        {
            if(total < 125) return 1;
            else if (university < 44) return 2;
            else if (required < 15) return 81; // VACD required courses - 15 SU credits
            else if ( !this.hasCourse("CIP101N")) return 4;
            else if (!(this.hasCourse("VA300") || this.hasCourse("PROJ300"))) return 82; // Project/Internship requirement
            else if (!this.hasCourse("SPS303")) return 9;
            else if (!(this.hasCourse("HUM201") || this.hasCourse("HUM202") || this.hasCourse("HUM207"))) return 10;
            else if (ects < 240) return 13;
            else
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

                if(facultyCoursesCount < 5) return 83; // Not enough faculty courses
                if(fassCoursesCount < 3) return 84; // Not enough FASS courses
                if(areasCount.size < 3) return 85; // Not enough diverse areas

                if (core < 21) return 86; // VACD core electives - 21 SU credits (9+12)
                else
                {
                    area = area + (core - 21);
                    if (area < 24) return 87; // VACD area electives - 24 SU credits
                    else
                    {
                        free = free + (area - 24);
                        if(free < 21) return 88; // VACD free electives - 21 SU credits
                        else return 0;
                    }
                }
            }
        }
        else if(this.major == 'DSA')
        {
            if(total < 125) return 1;
            else if (university < 41) return 2;
            else if (required < 30) return 33; // DSA required courses - 30 SU credits
            else if ( !this.hasCourse("CIP101N")) return 4;
            else if (!this.hasCourse("DSA395")) return 47; // Internship requirement
            else if (!this.hasCourse("SPS303")) return 9;
            else if (!(this.hasCourse("HUM201") || this.hasCourse("HUM202") || this.hasCourse("HUM207"))) return 10;
            else if (ects < 240) return 13;
            else
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

                if(facultyCoursesCount < 5) return 37; // Not enough faculty courses
                if(fensCoursesCount < 1) return 48; // Not enough FENS courses
                if(fassCoursesCount < 1) return 49; // Not enough FASS courses
                if(sbsCoursesCount < 1) return 50; // Not enough SBS courses

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

                if(fensCoreCount < 3) return 51; // Not enough FENS core courses
                if(fassCoreCount < 3) return 52; // Not enough FASS core courses
                if(sbsCoreCount < 3) return 53; // Not enough SBS core courses

                if (core < 27) return 34; // DSA core electives - 27 SU credits
                else
                {
                    area = area + (core - 27);
                    if (area < 12) return 35; // DSA area electives - 12 SU credits
                    else
                    {
                        free = free + (area - 12);
                        if(free < 15) return 36; // DSA free electives - 15 SU credits
                        else return 0;
                    }
                }
            }
        }
        else if(this.major == 'MAN' || this.major == 'PSIR' || this.major == 'PSY' || this.major == 'VACD')
        {
            // Detailed graduation requirements are not yet defined for these majors
            // For now, assume the student meets requirements if basic credit thresholds are satisfied
            if(total < 125) return 1;
            else if (university < 41) return 2;
            else if (ects < 240) return 13;
            else if ( !this.hasCourse("CIP101N")) return 4;
            else if (!this.hasCourse("SPS303")) return 9;
            else if (!(this.hasCourse("HUM201") || this.hasCourse("HUM202") || this.hasCourse("HUM207"))) return 10;
            else return 0;
        }
    }
}