//checks wheter the course exists:
function isCourseValid(course, course_data)
{
    // First check within the main major's course data
    for (let i = 0; i < course_data.length; i++) {
        if (((course_data[i]['Major'] + course_data[i]['Code']) === course.code)) return true;
    }
    // If not found and a double major is active, check the double major's
    // course catalog for this course code. The global curriculum object
    // exposes doubleMajorCourseData when a second major is selected.
    try {
        const cur = (typeof window !== 'undefined') ? window.curriculum : null;
        if (cur && cur.doubleMajor && Array.isArray(cur.doubleMajorCourseData)) {
            const dmList = cur.doubleMajorCourseData;
            for (let i = 0; i < dmList.length; i++) {
                if (((dmList[i]['Major'] + dmList[i]['Code']) === course.code)) {
                    return true;
                }
            }
        }
    } catch (_) {
        // ignore errors
    }
    return false;
}

//returns info's of the course:
function getInfo(course, course_data)
{
    // First search within the primary course data
    for (let i = 0; i < course_data.length; i++) {
        if ((course_data[i]['Major'] + course_data[i]['Code']) === course) return course_data[i];
    }
    // If not found and a double major is active, search within the double
    // major's catalog so that course details (name, credits) can be
    // retrieved for DM-only courses.  This allows unknown courses to
    // provide their metadata while still being ignored for the main
    // major's allocations.
    try {
        const cur = (typeof window !== 'undefined') ? window.curriculum : null;
        if (cur && cur.doubleMajor && Array.isArray(cur.doubleMajorCourseData)) {
            const dmList = cur.doubleMajorCourseData;
            for (let i = 0; i < dmList.length; i++) {
                if (((dmList[i]['Major'] + dmList[i]['Code']) === course)) {
                    return dmList[i];
                }
            }
        }
    } catch (_) {
        // ignore errors
    }
    return 0;
}

function extractNumericValue(string) {
    const matches = string.match(/\d+/); // Match one or more digits
    if (matches) {
      return parseInt(matches[0], 10); // Parse the matched value as an integer
    }
    return null; // No numeric value found
}

//terms list & date_list_InnerHTML:
let currentDate = new Date();
let currentYear = currentDate.getFullYear();
let currentMonth = currentDate.getMonth(); // 0-11, where 0 is January

var date_list_InnerHTML = '';
var terms = [];

// Determine the current academic year
let academicYear;
// If we're in the second half of the calendar year (after July), we're in the Fall semester of academicYear/academicYear+1
// Otherwise, we're in the Spring semester of academicYear-1/academicYear
if (currentMonth >= 7) { // August or later
    academicYear = currentYear;
} else {
    academicYear = currentYear - 1;
}

// Generate terms for 6 years in the past and 6 years in the future
for (let i = (academicYear - 6); i <= (academicYear + 6); i++) {
    // Create academic year string (e.g., "2022-2023")
    let yearRange = i + "-" + (i + 1);

    // Add Spring, Fall, and optionally Summer to the list
    date_list_InnerHTML += "<option value='" + yearRange + " Fall'>";
    date_list_InnerHTML += "<option value='" + yearRange + " Spring'>";
    date_list_InnerHTML += "<option value='" + yearRange + " Summer'>";

    // Add to terms array in chronological order: Fall, Spring, Summer
    terms.push(yearRange + " Fall");
    terms.push(yearRange + " Spring");
    terms.push(yearRange + " Summer");
}

var grade_list_InnerHTML = '';
let letter_grades_global = ['S', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];
let letter_grades_global_dic = {'S':4.0, 'A':4.0, 'A-':3.7, 'B+':3.3, 'B':3.0, 'B-':2.7, 'C+':2.3, 'C':2.0, 'C-':1.7, 'D+':1.3, 'D':1.0, 'F':0.0}
for(let i = 0; i < letter_grades_global.length; i++)
{
    grade_list_InnerHTML += "<option value='" + letter_grades_global[i] + "'>";
}


function getCoursesDataList(course_data)
{
    // Build a combined list of courses. If a double major is selected,
    // merge courses unique to the double major into the primary list so
    // that users can select DM-only courses from the dropdown.  We
    // construct a copy of course_data and append unique DM courses.
    let combined = Array.isArray(course_data) ? course_data.slice() : [];
    try {
        const cur = (typeof window !== 'undefined') ? window.curriculum : null;
        if (cur && cur.doubleMajor && Array.isArray(cur.doubleMajorCourseData)) {
            // Create a set of primary courses for quick lookup
            const mainSet = new Set(combined.map(function(c) {
                return (c.Major + c.Code);
            }));
            cur.doubleMajorCourseData.forEach(function(dm) {
                const key = dm.Major + dm.Code;
                if (!mainSet.has(key)) {
                    combined.push(dm);
                }
            });
        }
    } catch (ex) {
        // ignore any errors in DM detection
    }
    // Build the datalist HTML using the combined courses. Each option
    // value starts with the course code followed by the course name.
    let datalistInnerHTML = '';
    for (let i = 0; i < combined.length; i++) {
        const item = combined[i];
        datalistInnerHTML += "<option value='" + item['Major'] + item['Code'] + ' ' + item['Course_Name'] + "'>";
    }
    return datalistInnerHTML;
}

function serializator(curriculum)
{
    let result = '[';
    for (let i = 0; i < curriculum.semesters.length; i++)
    {
        result = result + '[';
        for (let n = 0; n < curriculum.semesters[i].courses.length; n++)
        {
            result = result + '"' + curriculum.semesters[i].courses[n].code + '"';
            if((n+1) !=curriculum.semesters[i].courses.length) result = result + ','
        }
        result = result + ']';
        if((i+1) != curriculum.semesters.length) result = result + ",";
    }
    result = result + ']';
    return result;
}

function grades_serializator()
{
    let containers = document.querySelectorAll('.container_semester');


    let result = '[';
    containers.forEach((container)=>{
        result = result + '[';
        container.querySelectorAll(".grade").forEach((grade)=>{
            if(grade.innerHTML.length <= 2){result = result + '"' + grade.innerHTML + '"';}
            else {result = result + '""'}
            result = result + ','
        })
        if(result[result.length-1] == ',') result = result.slice(0,-1)
        result = result + ']';
        result = result + ",";
    })
    if(result[result.length-1] == ',') result = result.slice(0,-1)
    result = result + ']';
    return result;
}

function dates_serializator()
{
    let result = '[';
    let dates = document.querySelectorAll('.date');
    dates.forEach((date)=>{
        try
        {
            let date_val = date.querySelector('p').innerHTML;
            result = result + '"' + date_val + '"' + ',';
        }
        catch
        {
            result = result + '"' + '...' + '"' + ',';
        }
    })
    if(result[result.length-1] == ',') result = result.slice(0,-1)
    result = result + ']';
    return result;
}

function reload(curriculum, course_data)
{
    let data, grades, dates;
    try{data = JSON.parse(localStorage.getItem("curriculum"));} catch{}
    try{grades = JSON.parse(localStorage.getItem("grades"));}   catch{}
    try{dates = JSON.parse(localStorage.getItem("dates"))}      catch{}
    if(data)
    {
        for(let i = 0; i < data.length; i++)
        {
            if(grades && dates)
                createSemeter(true, data[i], curriculum, course_data, grades[i], dates[i]);
            else
                createSemeter(true, data[i], curriculum, course_data);

        }
    }
}

function getAncestor(element, ancestor_class)
{
    let parent = element.parentNode;
    while(parent)
    {
        if(parent.classList.contains(ancestor_class))
        {return parent;}
        else{parent = parent.parentNode;}
    }
    return null;
}