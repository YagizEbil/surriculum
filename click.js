function dynamic_click(e, curriculum, course_data)
{
    //CLICKED "+ Add Course":
    if(e.target.classList.contains("addCourse"))
    {
        let input_container =  document.createElement("div");
        input_container.classList.add("input_container")

        let input1 = document.createElement("input");
        input1.placeholder = "choose a course";
        input1.setAttribute("list", 'datalist');
        
        let datalist = document.createElement("datalist");
        datalist.innerHTML = getCoursesDataList(course_data);
        datalist.id = 'datalist';
        let enter = document.createElement("div");
        enter.classList.add("enter");
        let delete_ac = document.createElement("div");
        delete_ac.classList.add("delete_add_course");


        input_container.appendChild(input1);
        input_container.appendChild(datalist);
        input_container.appendChild(enter);
        input_container.appendChild(delete_ac);
        // Allow pressing Enter in the input to trigger the same action as
        // clicking the tick icon. Without this, users must click the
        // enter button manually. We listen for the keydown event and
        // simulate a click on the `.enter` element when Enter is pressed.
        input1.addEventListener('keydown', function(evt) {
            if (evt.key === 'Enter') {
                evt.preventDefault();
                // If the enter button exists in this input container, click it
                const btn = this.parentNode.querySelector('.enter');
                if (btn) btn.click();
            }
        });

        e.target.parentNode.insertBefore(input_container, e.target.parentNode.querySelector(".addCourse"));
    }
    //CLICKED "OK" (for entering course input):
    else if(e.target.classList.contains("enter"))
    {
        // Retrieve the user's input and attempt to determine the course code.
        // Users may type either the full code+name (e.g., "CS101 Intro"), just
        // the course code, or the course name. We first take the first
        // token as the tentative code. If the resulting course is not
        // valid, we attempt to match the entire input against course names
        // in both the primary major and the double major. If a match is
        // found, we derive the code accordingly.
        let inputValue = e.target.parentNode.querySelector("input").value.trim();
        let tentativeCode = inputValue.split(' ')[0].toUpperCase();
        let courseCode = tentativeCode;
        let courseObj = new s_course(courseCode, '');
        // Helper to search course by name in course_data and DM data
        function findCourseByName(name) {
            name = name.trim().toUpperCase();
            // search primary course_data
            for (let i = 0; i < course_data.length; i++) {
                if (course_data[i]['Course_Name'].toUpperCase() === name) {
                    return course_data[i];
                }
            }
            // search double major data if available
            try {
                const cur = (typeof window !== 'undefined') ? window.curriculum : null;
                if (cur && cur.doubleMajor && Array.isArray(cur.doubleMajorCourseData)) {
                    for (let i = 0; i < cur.doubleMajorCourseData.length; i++) {
                        if (cur.doubleMajorCourseData[i]['Course_Name'].toUpperCase() === name) {
                            return cur.doubleMajorCourseData[i];
                        }
                    }
                }
            } catch (_) {}
            return null;
        }
        // If tentative code is not valid, try matching by full input as name
        if (!isCourseValid(courseObj, course_data)) {
            // Attempt to find by full value (case-insensitive)
            const found = findCourseByName(inputValue);
            if (found) {
                // Derive code from found course
                courseCode = found.Major + found.Code;
                courseObj = new s_course(courseCode, '');
            }
        }
        // If still invalid after name search, show error
        if (!isCourseValid(courseObj, course_data)) {
            alert("ERROR: Course Not Found!");
            e.target.parentNode.querySelector("input").value = '';
            return;
        }
        // Now we have a valid courseCode. Generate a unique id for the new
        // course and proceed with addition.
        curriculum.course_id = curriculum.course_id + 1;
        let course_id = 'c' + curriculum.course_id;
        let myCourse = new s_course(courseCode, course_id);
        if(!curriculum.hasCourse(courseCode)) {
            let sem = curriculum.getSemester(e.target.parentNode.parentNode.querySelector('.semester').id);
            // Attach additional metadata from the course info to the s_course
            // instance.  This ensures that double-major courses retain
            // attributes like credit, category, faculty course, science and
            // engineering credits. These fields are required for proper
            // graduation logic and summary calculations, and they are
            // normally available via the info object returned by getInfo().
            const infoAdd = getInfo(courseCode, course_data);
            if (infoAdd) {
                // Course credit values
                myCourse.credit = parseInt(infoAdd['SU_credit'] || '0');
                myCourse.Basic_Science = parseFloat(infoAdd['Basic_Science'] || '0');
                myCourse.Engineering = parseFloat(infoAdd['Engineering'] || '0');
                myCourse.ECTS = parseFloat(infoAdd['ECTS'] || '0');
                // Category and faculty course information.  Normalize the
                // category string so that the first letter is uppercase
                // (e.g., "Core", "Area", "Free", "Required", "University").
                const elType = (infoAdd['EL_Type'] || '').toString();
                if (elType) {
                    myCourse.category = elType.charAt(0).toUpperCase() + elType.slice(1).toLowerCase();
                }
                myCourse.Faculty_Course = infoAdd['Faculty_Course'] || 'No';
            }
            sem.addCourse(myCourse);
            let c_container = document.createElement("div");
            c_container.classList.add("course_container");
            let c_label = document.createElement("div");
            c_label.classList.add("course_label");
            c_label.innerHTML = '<div>'+myCourse.code+'</div>' + '<button class="delete_course"></button>';
            let c_info = document.createElement("div");
            c_info.classList.add("course_info");
            // Use getInfo to fetch course details (works for DM-only courses)
            const info = getInfo(courseCode, course_data);
            c_info.innerHTML = '<div class="course_name">'+ info['Course_Name'] +'</div>';
            c_info.innerHTML += '<div class="course_type">'+ info['EL_Type'].toUpperCase() + '</div>';
            c_info.innerHTML += '<div class="course_credit">' + info['SU_credit']+ '.0 credits </div>';
            let grade = document.createElement('div');
            grade.classList.add('grade');
            grade.innerHTML = 'Add grade';
            c_container.appendChild(c_label);
            c_container.appendChild(c_info);
            c_container.appendChild(grade);
            let course = document.createElement("div");
            course.classList.add("course");
            course.id = course_id;
            course.appendChild(c_container);
            e.target.parentNode.parentNode.querySelector('.semester').appendChild(course);
            // changing total credits element in DOM:
            let dom_tc = e.target.parentNode.parentNode.parentNode.querySelector('span');
            dom_tc.innerHTML = 'Total: ' + sem.totalCredit + ' credits';
            // Remove input and container after adding course
            e.target.parentNode.querySelector("input").remove();
            e.target.parentNode.remove();
            // Recalculate categories for main (and DM via recalc) after adding
            try {
                if (typeof curriculum.recalcEffectiveTypes === 'function') {
                    curriculum.recalcEffectiveTypes(course_data);
                }
            } catch(err) {}
        } else {
            alert("You have already added " + myCourse.code);
            e.target.parentNode.querySelector("input").value = '';
        }
    }
    //CLICKED "<semester delete>"
    else if(e.target.classList.contains("delete_semester"))
    {
        let id = extractNumericValue(e.target.parentNode.parentNode.parentNode.parentNode.id);


        curriculum.deleteSemester(e.target.parentNode.parentNode.parentNode.querySelector('.semester').id);
        e.target.parentNode.parentNode.parentNode.parentNode.remove();

        let containers = document.querySelectorAll(".container_semester");
        containers.forEach((element)=>{
            if(extractNumericValue(element.id) > id)
            {
                element.id = 'con' + (extractNumericValue(element.id) - 1);
                curriculum.container_id = extractNumericValue(element.id);
            }
        })

        // After deleting a semester, recalculate effective types in case
        // category allocation changes due to the removal. Guard for
        // recalcExisting undefined.
        try {
            if (typeof curriculum.recalcEffectiveTypes === 'function') {
                curriculum.recalcEffectiveTypes(course_data);
            }
        } catch(err) {
            // ignore
        }
    }
    //CLICKED "<course delete>"

    else if(e.target.classList.contains("delete_course"))
    {
        let sem = e.target.parentNode.parentNode.parentNode.parentNode;
        let semObj = curriculum.getSemester(sem.id);
        let courseName = e.target.parentNode.firstChild.innerHTML;
        let credit = parseInt(getInfo(courseName, course_data)['SU_credit']);
        let grade = e.target.parentNode.parentNode.querySelector('.grade').innerHTML;

        // If this course had grade F we previously removed its credits. Add them back before deletion
        if(grade == 'F'){
            let info = getInfo(courseName, course_data);
            if(info){
                adjustSemesterTotals(semObj, info, 1);
            }
        }

        semObj.deleteCourse(e.target.parentNode.parentNode.parentNode.id);
        //changing total credits element in dom:
        let dom_tc = e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.querySelector('span');
        dom_tc.innerHTML = 'Total: ' + semObj.totalCredit + ' credits';

        semObj.totalGPA -= (letter_grades_global_dic[grade] * credit);
        if(grade != 'T'){semObj.totalGPACredits -= credit;}


        e.target.parentNode.parentNode.parentNode.remove();

        // Re-run allocation after a course deletion to update effective types
        try {
            if (typeof curriculum.recalcEffectiveTypes === 'function') {
                curriculum.recalcEffectiveTypes(course_data);
            }
        } catch(err) {
            // ignore
        }
    }
    //CLICKED "<semester_date_edit>"
    else if(e.target.classList.contains("semester_date_edit"))
    {
        let date = e.target.parentNode.parentNode;
        date.innerHTML = ''
        let input_date = document.createElement("input");
        input_date.placeholder = 'choose term...'
        input_date.setAttribute("list", 'date_list');
        let date_list = document.createElement("datalist");
        date_list.innerHTML = date_list_InnerHTML;
        date_list.id = 'date_list';
        let tick = document.createElement("div");
        tick.classList.add("tick");
        tick.style.backgroundImage = "url('./assets/tickw.png')";
        date.appendChild(input_date);
        date.appendChild(date_list);
        date.appendChild(tick);
    }
    //CLICKED tick in date
    else if(e.target.classList.contains("tick"))
    {
        let date = e.target.parentNode;
        date.innerHTML = '<p>' + date.querySelector("input").value + '</p>';
        let closebtn = document.createElement("button");
        closebtn.classList.add("delete_semester");
        let drag = document.createElement("div");
        drag.classList.add("semester_drag");
        let edit = document.createElement("div");
        edit.classList.add("semester_date_edit");
        let icons = document.createElement("div");
        icons.classList.add("icons");
        icons.appendChild(edit);
        icons.appendChild(drag);
        icons.appendChild(closebtn);
        date.appendChild(icons)    

        // Update the semester's term index to reflect the new date and
        // recalculate effective categories. The date element sits inside
        // the subcontainer, which also contains the semester div.
        try {
            const newDateTextElem = date.querySelector('p');
            const newDateText = newDateTextElem ? newDateTextElem.innerHTML : '';
            // Locate the semester corresponding to this date element
            const semElem = date.parentNode.querySelector('.semester');
            if (semElem) {
                const semObj = curriculum.getSemester(semElem.id);
                if (semObj) {
                    semObj.termIndex = terms.indexOf(newDateText);
                }
            }
            if (typeof curriculum.recalcEffectiveTypes === 'function') {
                curriculum.recalcEffectiveTypes(course_data);
            }
        } catch(err) {
            // ignore
        }
    }
    //CLICKED trash in input:
    else if(e.target.classList.contains("delete_add_course"))
    {
        e.target.parentNode.remove();
    }
    //CLICKED ADD GRADE:
    else if(e.target.classList.contains("grade"))
    {
        var prevGrade;
        if(e.target.innerHTML.length <= 2)
        {
            prevGrade = e.target.innerHTML;

            let sem = e.target.parentNode.parentNode.parentNode;
            let courseName = e.target.parentNode.querySelector('.course_label').firstChild.innerHTML;
            let credit = parseInt(getInfo(courseName, course_data)['SU_credit']);

            curriculum.getSemester(sem.id).totalGPA -= (letter_grades_global_dic[prevGrade] * credit);
            if(prevGrade != 'T'){curriculum.getSemester(sem.id).totalGPACredits -= credit;}
        }

        let input = document.createElement('input');
        input.classList.add('grade_input')
        input.placeholder = 'choose'
        input.setAttribute("list", 'grade_data_list');
        let list = document.createElement("datalist");
        list.innerHTML = grade_list_InnerHTML;
        list.id = 'grade_data_list';
        e.target.innerHTML = ''
        e.target.style.paddingRight = '20px';

        e.target.appendChild(input);
        e.target.appendChild(list);

        input.addEventListener("input", function(e){
            let grade = input.value;
            e.target.parentNode.style.fontSize = '20px'
            e.target.parentNode.style.paddingRight = '7px';
            e.target.parentNode.style.paddingBottom = '7px';
            let sem = e.target.parentNode.parentNode.parentNode.parentNode;
            let courseName = e.target.parentNode.parentNode.querySelector('.course_label').firstChild.innerHTML;
            let credit = parseInt(getInfo(courseName, course_data)['SU_credit']);
            let semObj = curriculum.getSemester(sem.id);
            semObj.totalGPA += (letter_grades_global_dic[grade] * credit);
            if(grade != 'T'){semObj.totalGPACredits += credit;}
            // Adjust earned credits based on grade change
            let info = getInfo(courseName, course_data);
            if(prevGrade === 'F' && grade !== 'F'){
                adjustSemesterTotals(semObj, info, 1);
            } else if(prevGrade !== 'F' && grade === 'F'){
                adjustSemesterTotals(semObj, info, -1);
            }
            prevGrade = grade;
            e.target.parentNode.innerHTML = grade;

            // Recalculate effective categories when the grade changes so
            // that courses that were previously failed (F) or newly
            // passed are allocated correctly.
            try {
                if (typeof curriculum.recalcEffectiveTypes === 'function') {
                    curriculum.recalcEffectiveTypes(course_data);
                }
                if (typeof curriculum.recalcEffectiveTypesDouble === 'function' && curriculum.doubleMajor) {
                    curriculum.recalcEffectiveTypesDouble(curriculum.doubleMajorCourseData);
                }
            } catch (_) {}

            //alert(curriculum.getSemester(sem.id).totalGPA / curriculum.getSemester(sem.id).totalGPACredits)
        });

        // Allow leaving the grade empty by blurring the input
        input.addEventListener('blur', function(e){
            const val = input.value.trim();
            if(!val){
                let sem = input.parentNode.parentNode.parentNode.parentNode;
                let courseName = input.parentNode.parentNode.querySelector('.course_label').firstChild.innerHTML;
                let semObj = curriculum.getSemester(sem.id);
                // If there was a previous grade remove its effects already subtracted above
                if(prevGrade === 'F'){
                    let info = getInfo(courseName, course_data);
                    adjustSemesterTotals(semObj, info, 1);
                }
                input.parentNode.style.fontSize = '';
                input.parentNode.style.paddingRight = '7px';
                input.parentNode.style.paddingBottom = '';
                input.parentNode.innerHTML = 'Add grade';
                try{
                    if (typeof curriculum.recalcEffectiveTypes === 'function') {
                        curriculum.recalcEffectiveTypes(course_data);
                    }
                    if (typeof curriculum.recalcEffectiveTypesDouble === 'function' && curriculum.doubleMajor) {
                        curriculum.recalcEffectiveTypesDouble(curriculum.doubleMajorCourseData);
                    }
                }catch(_){}
            }
        });
    }
}