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
            else if (required < 31) return 14; //CHANGE
            else if (science < 60) return 11;
            else if (engineering < 90) return 12;
            else if ( !this.hasCourse("CIP101N")) return 4;
            else if (!this.hasCourse("IE395"))  return 15; //CHANGE
            else if (!this.hasCourse("SPS303")) return 9;
            else if (!(this.hasCourse("HUM201") || this.hasCourse("HUM202") || this.hasCourse("HUM207"))) return 10;
            else if (ects < 240) return 13;
            else
            {
                if (core < 29) return 16; //CHANGE
                else
                {
                    area = area + (core - 29);
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
                if (core < 25) return 19; //CHANGE
                else
                {
                    area = area + (core - 25);
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
            else if (required < 26) return 20; //CHANGE
            else if (science < 60) return 11;
            else if (engineering < 90) return 12;
            else if ( !this.hasCourse("CIP101N")) return 4;
            else if (!this.hasCourse("MAT395"))  return 21; //CHANGE
            else if (!this.hasCourse("SPS303")) return 9;
            else if (!(this.hasCourse("HUM201") || this.hasCourse("HUM202") || this.hasCourse("HUM207"))) return 10;
            else if (ects < 240) return 13;
            else
            {
                if (core < 34) return 22; //CHANGE
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
            if(total < 125) return 1;
            else if (university < 41) return 2;
            else if (required < 31) return 14;
            else if ( !this.hasCourse("CIP101N")) return 4;
            else if (!this.hasCourse("BIO395"))  return 23; //CHANGE
            else if (!this.hasCourse("SPS303")) return 9;
            else if (!(this.hasCourse("HUM201") || this.hasCourse("HUM202") || this.hasCourse("HUM207"))) return 10;
            else if (ects < 240) return 13;
            else
            {
                if (core < 29) return 16; 
                else
                {
                    area = area + (core - 29);
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
        else if(this.major == 'ME')
        {
            if(total < 125) return 1;
            else if (university < 41) return 2;
            else if (required < 39) return 24; //CHANGE
            else if (science < 60) return 11;
            else if (engineering < 90) return 12;
            else if ( !this.hasCourse("CIP101N")) return 4;
            else if (!this.hasCourse("ME395"))  return 25; //CHANGE
            else if (!this.hasCourse("SPS303")) return 9;
            else if (!(this.hasCourse("HUM201") || this.hasCourse("HUM202") || this.hasCourse("HUM207"))) return 10;
            else if (ects < 240) return 13;
            else
            {
                if (core < 21) return 26; //CHANGE
                else
                {
                    area = area + (core - 21);
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
            else if (university < 41) return 2;
            else if (required < 30) return 27; // Updated to 30 SU credits
            else if (science < 60) return 11;
            else if (engineering < 90) return 12;
            else if ( !this.hasCourse("CIP101N")) return 4;
            else if (!this.hasCourse("ECON300"))  return 28;
            else if (!this.hasCourse("SPS303")) return 9;
            else if (!(this.hasCourse("HUM201") || this.hasCourse("HUM202") || this.hasCourse("HUM207"))) return 10;
            else if (ects < 240) return 13;
            else if (!(this.hasCourse("HUM304") || this.hasCourse("HUM311") || this.hasCourse("HUM312") || this.hasCourse("HUM317") || this.hasCourse("HUM321") || this.hasCourse("HUM324") || this.hasCourse("HUM371"))) return 32;
            else
            {
                if (core < 27) return 29; // Updated to 27 SU credits
                else
                {
                    area = area + (core - 27);
                    if (area < 12) return 30; // Updated to 12 SU credits
                    else
                    {
                        free = free + (area - 12);
                        if(free < 15) return 31; // Updated to 15 SU credits
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
            else if (!this.hasCourse("SPS303")) return 9;
            else if (!(this.hasCourse("HUM201") || this.hasCourse("HUM202") || this.hasCourse("HUM207"))) return 10;
            else if (ects < 240) return 13;
            else
            {
                if (core < 27) return 34; // DSA core electives - 27 SU credits
                else
                {
                    area = area + (core - 27);
                    if (area < 12) return 35; // DSA area electives - 12 SU credits
                    else
                    {
                        free = free + (area - 12);
                        if(free < 15) return 36; // DSA free electives - 15 SU credits
                        else {
                            // Check if student has at least 5 faculty courses
                            let facultyCoursesCount = 0;
                            for(let i = 0; i < this.semesters.length; i++) {
                                for(let a = 0; a < this.semesters[i].courses.length; a++) {
                                    if(this.semesters[i].courses[a].faculty && this.semesters[i].courses[a].faculty.trim() !== '') {
                                        facultyCoursesCount++;
                                    }
                                }
                            }
                            if(facultyCoursesCount < 5) return 37; // DSA faculty courses requirement - at least 5 courses
                            else return 0;
                        }
                    }
                }
            }
        }
    }
}