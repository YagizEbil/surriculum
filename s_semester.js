//semester struct:
function s_semester(id, course_data)
{
    this.courses = [];
    this.id = id;
    this.totalCredit = 0;
    this.totalArea = 0;
    this.totalCore = 0;
    this.totalFree = 0;
    this.totalUniversity = 0;
    this.totalRequired = 0;
    this.totalScience = 0.0;
    this.totalEngineering = 0.0;
    this.totalECTS = 0.0;
    // Track the chronological order of this semester in the academic calendar. This index
    // corresponds to the position of the semester's term string within the global
    // `terms` array defined in helper_functions.js. The array lists the most
    // recent term first, so a larger index represents an earlier semester.
    // `termIndex` is set when the semester is created and whenever the user edits
    // the term via the UI.
    this.termIndex = null;

    this.totalGPA = 0.0;
    this.totalGPACredits = 0;
    this.addCourse = function(course)
    {
        for(let i = 0; i < course_data.length; i++)
        {
            if (( (course_data[i]['Major'] + course_data[i]['Code']) == course.code ))
            {
                let credit = parseInt(course_data[i]['SU_credit']);
                this.totalCredit += credit;
                this.totalEngineering += parseFloat(course_data[i]['Engineering']);
                this.totalScience += parseFloat(course_data[i]['Basic_Science']);
                this.totalECTS += parseFloat(course_data[i]['ECTS']);
                if (course_data[i]['EL_Type'] == "free") {this.totalFree = this.totalFree + credit;}
                else if (course_data[i]['EL_Type'] == "area") {this.totalArea = this.totalArea + credit;}
                else if (course_data[i]['EL_Type'] == "core") {this.totalCore = this.totalCore + credit;}
                else if (course_data[i]['EL_Type'] == "university") {this.totalUniversity = this.totalUniversity + credit;}
                else if (course_data[i]['EL_Type'] == "required") {this.totalRequired = this.totalRequired + credit;}
            }
        }
        this.courses.push(course);
    }
    this.deleteCourse = function(id_c)
    {
        for(let a = 0; a < this.courses.length; a++)
        {
            if(this.courses[a].id == id_c)
            {
                for(let i = 0; i < course_data.length; i++)
                {
                    if ( (course_data[i]['Major'] + course_data[i]['Code']) == (this.courses[a].code) )
                    {
                        this.totalScience -= parseFloat(course_data[i]['Basic_Science']);
                        this.totalEngineering -= parseFloat(course_data[i]['Engineering']);
                        this.totalECTS -= parseFloat(course_data[i]['ECTS']);
                        let credit = parseInt(course_data[i]['SU_credit']);
                        this.totalCredit = this.totalCredit - credit;
                        if (course_data[i]['EL_Type'] == "free") {this.totalFree = this.totalFree - credit;}
                        else if (course_data[i]['EL_Type'] == "area") {this.totalArea = this.totalArea - credit;}
                        else if (course_data[i]['EL_Type'] == "core") {this.totalCore = this.totalCore - credit;}
                        else if (course_data[i]['EL_Type'] == "university") {this.totalUniversity = this.totalUniversity - credit;}
                        else if (course_data[i]['EL_Type'] == "required") {this.totalRequired = this.totalRequired - credit;}
                        this.courses.splice(a,1);
                        return;
                    }
                }
            }
        }
        
    }
}

//struct representing course:
function s_course(code, id = 0)
{
    this.code = code.toUpperCase().trim();
    this.id = id
    // Effective type of the course after category reallocation. Initially null and
    // will be set by curriculum.recalcEffectiveTypes().
    this.effective_type = null;
}