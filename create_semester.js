function createSemeter(aslastelement=true, courseList=[], curriculum, course_data, grade_list=[], date_custom="")
{
    const board = document.querySelector(".board");

    let container = document.createElement("div");
    container.classList.add("container_semester");
    if(aslastelement) 
    {
        curriculum.container_id++;
        container.id = 'con' + curriculum.container_id;
    }
    else 
    {
        let containers = document.querySelectorAll(".container_semester");
        containers.forEach((element)=>{
            element.id = 'con' + (extractNumericValue(element.id) + 1);
            curriculum.container_id = extractNumericValue(element.id);
        })
        container.id = 'con' + 1;
    }

    let total_credit = document.createElement("div");
    total_credit.classList.add("total_credit");
    let total_credit_line_l = document.createElement("div");
    total_credit_line_l.classList.add("total_credit_line");
    let total_credit_line_r = document.createElement("div");
    total_credit_line_r.classList.add("total_credit_line");
    let total_credit_text = document.createElement("div");
    total_credit_text.classList.add("total_credit_text");
    total_credit_text.innerHTML = "<span> Total: 0 credits </span>"
    total_credit.appendChild(total_credit_line_l);
    total_credit.appendChild(total_credit_text);
    total_credit.appendChild(total_credit_line_r);

    container.appendChild(total_credit);

    let subcontainer = document.createElement("div");
    subcontainer.classList.add("subcontainer_semester");
    
    let date = document.createElement("div");
    date.classList.add("date");

    //DATE DEFAULT:
    if(!date_custom) {date.innerHTML = '<p>' + terms[(16 + parseInt(curriculum.container_id))] + '</p>';}
    //DATE CUSTOM:
    else 
    {
        date.innerHTML = '<p>' + date_custom + '</p>';
    }

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

    subcontainer.appendChild(date);

    let semester = document.createElement("div");
    semester.classList.add("semester");
    curriculum.semester_id++;
    semester.id = 's' + curriculum.semester_id;
    let newsem = new s_semester(semester.id, course_data);
    if(aslastelement){curriculum.semesters.push(newsem);}
    else{curriculum.semesters.unshift(newsem);}

    const btn = document.querySelector(".addSemester");
    let addCourse = document.createElement("button");
    addCourse.classList.add("addCourse");
    addCourse.innerHTML = "+ Add another course";


    subcontainer.appendChild(semester);
    subcontainer.appendChild(addCourse);
    container.appendChild(subcontainer);
    
    if(aslastelement) 
    {
        board.insertBefore(container, btn.parentNode.parentNode);
    }
    else 
    {
        board.insertBefore(container, board.firstChild);
    }

    //adding courses:
    for(let i = 0; i < courseList.length; i++)
    {
        curriculum.course_id++;
        let myCourse = new s_course(courseList[i], 'c' + curriculum.course_id);
        let courseCode = myCourse.code;
        try
        {
            getInfo(courseCode, course_data)['EL_Type'].toUpperCase();
        }
        catch
        {
            continue
        }
        if(!curriculum.hasCourse(myCourse.code)) 
        {
            let courseCredit = parseInt(getInfo(courseCode, course_data)['SU_credit']);
            curriculum.getSemester(semester.id).addCourse(myCourse);
            let dom_course = document.createElement('div');
            dom_course.classList.add('course');
            dom_course.id = 'c' + curriculum.course_id;
            //dom_course.setAttribute('draggable','true');


            //dom_course.innerHTML = '<button class="delete_course"></button>';
            //creating course container in course dom:
            let c_container = document.createElement("div")
            c_container.classList.add("course_container");
            let c_label = document.createElement("div");
            c_label.classList.add("course_label");
            c_label.innerHTML = '<div>'+courseList[i]+'</div>' + '<button class="delete_course"></button>';
            let c_info = document.createElement("div");
            c_info.classList.add("course_info");
            c_info.innerHTML = '<div class="course_name">'+ getInfo(courseCode, course_data)['Course_Name'] +'</div>';
            //console.log(getInfo(courseCode, course_data)['EL_Type']);
            c_info.innerHTML += '<div class="course_type">'+getInfo(courseCode, course_data)['EL_Type'].toUpperCase() + '</div>';

            //let gr_container = document.createElement('div');
            //gr_container.classList.add('grade_container');

            c_info.innerHTML += '<div class="course_credit">' +courseCredit+ '.0 credits </div>';
            //gr_container.innerHTML += '<div class="grade">Add grade</div>';
            //c_info.appendChild(gr_container);
            var grade = document.createElement('div');
            grade.classList.add('grade');
            if(!grade_list.length || !grade_list[i].length)
            {
                grade.innerHTML = 'Add grade';
            }
            else
            {
                grade.innerHTML = grade_list[i];
                grade.style.fontSize = '20px'
                grade.style.paddingRight = '7px';
                grade.style.paddingBottom = '7px';
                if(grade_list[i] != 'T')
                {
                    curriculum.getSemester(semester.id).totalGPA += (courseCredit * letter_grades_global_dic[grade_list[i]]);
                    curriculum.getSemester(semester.id).totalGPACredits += courseCredit;
                }
            }
            c_container.appendChild(c_label)
            c_container.appendChild(c_info);
            c_container.appendChild(grade);
            
            dom_course.appendChild(c_container);


            let dom_semester = document.querySelector('#' + semester.id)
            dom_semester.insertBefore(dom_course, dom_semester.querySelector(".addCourse"));

            let dom_tc = dom_course.parentNode.parentNode.parentNode.querySelector('span');
            dom_tc.innerHTML = 'Total: ' + curriculum.getSemester(semester.id).totalCredit + ' credits';
        }
    }
}