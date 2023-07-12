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
var date_list_InnerHTML = ''
var terms = []
for(let i = (currentYear-6); i < (currentYear + 6); i++)
{
    date_list_InnerHTML = date_list_InnerHTML + "<option value='" + 'SPRING ' + i + "'>";
    date_list_InnerHTML = date_list_InnerHTML + "<option value='" + 'SUMMER ' + i + "'>";
    date_list_InnerHTML = date_list_InnerHTML + "<option value='" + 'FALL ' + i + "'>";
    terms.push('SPRING ' + i)
    terms.push('SUMMER ' + i)
    terms.push('FALL ' + i)
}

var grade_list_InnerHTML = '';
let letter_grades_global = ['A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'T'];
let letter_grades_global_dic = {'A':4.0, 'A-':3.7, 'B+':3.3, 'B':3.0, 'B-':2.7, 'C+':2.3, 'C':2.0, 'C-':1.7, 'D+':1.3, 'D':1.0, 'T':0.0}
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