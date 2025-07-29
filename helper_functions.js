//checks wheter the course exists:
function isCourseValid(course, course_data)
{
    for(let i = 0; i < course_data.length; i++){
        if (((course_data[i]['Major'] + course_data[i]['Code']) == course.code)) return true;
    }
    return false;
}

//returns info's of the course:
function getInfo(course, course_data)
{
    for(let i = 0; i < course_data.length; i++){
        if ((course_data[i]['Major'] + course_data[i]['Code'] == course)) return course_data[i];
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
    date_list_InnerHTML += "<option value='" + yearRange + " Spring'>";
    date_list_InnerHTML += "<option value='" + yearRange + " Fall'>";
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
    let allCourses = [];
    for(let i = 0; i < course_data.length; i++)
    {
        allCourses.push(course_data[i]['Major'] + course_data[i]['Code'] + ' ' + course_data[i]['Course_Name']);
    }
    let datalistInnerHTML = '';
    for(let i = 0; i < allCourses.length; i++)
    {
        datalistInnerHTML = datalistInnerHTML + "<option value='" + allCourses[i] + "'>";
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

function reload(curriculum, course_data) {
    let data, grades, dates;
    try { data = JSON.parse(localStorage.getItem("curriculum")); } catch {}
    try { grades = JSON.parse(localStorage.getItem("grades")); } catch {}
    try { dates = JSON.parse(localStorage.getItem("dates")); } catch {}

    if (data) {
        for (let i = 0; i < data.length; i++) {
            if (grades && dates)
                createSemeter(true, data[i], curriculum, course_data, grades[i], dates[i]);
            else
                createSemeter(true, data[i], curriculum, course_data);
        }
    }

    // Ensure assets and styles are properly restored
    const head = document.querySelector('head');

    // Restore styles
    if (!document.querySelector('link[href="styles.css"]')) {
        const styleLink = document.createElement('link');
        styleLink.rel = 'stylesheet';
        styleLink.href = 'styles.css';
        head.appendChild(styleLink);
    }

    // Restore assets
    const assetPaths = [
        './assets/drag.png',
        './assets/closed.png',
        './assets/open.png',
        './assets/tick.png'
    ];

    assetPaths.forEach(path => {
        const img = new Image();
        img.src = path;
    });
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