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

        e.target.parentNode.insertBefore(input_container, e.target.parentNode.querySelector(".addCourse"));
    }
    //CLICKED "OK" (for entering course input):
    else if(e.target.classList.contains("enter"))
    {
        let courseCode = e.target.parentNode.querySelector("input").value.split(' ')[0];
        courseCode = courseCode.trim().toUpperCase()
        curriculum.course_id = curriculum.course_id + 1;
        let course_id = 'c' + curriculum.course_id;
        let myCourse = new s_course(courseCode, course_id);

        if(isCourseValid(myCourse, course_data))
        {
            if(!curriculum.hasCourse(courseCode))
            {
                let sem = curriculum.getSemester(e.target.parentNode.parentNode.querySelector('.semester').id)
                
                sem.addCourse(myCourse);
                let c_container = document.createElement("div")
                c_container.classList.add("course_container");
                let c_label = document.createElement("div");
                c_label.classList.add("course_label");
                c_label.innerHTML = '<div>'+myCourse.code+'</div>' + '<button class="delete_course"></button>';
                let c_info = document.createElement("div");
                c_info.classList.add("course_info");
                c_info.innerHTML = '<div class="course_name">'+ getInfo(courseCode, course_data)['Course_Name'] +'</div>';
                c_info.innerHTML += '<div class="course_type">'+getInfo(courseCode, course_data)['EL_Type'].toUpperCase() + '</div>';
                
                c_info.innerHTML += '<div class="course_credit">' +getInfo(courseCode, course_data)['SU_credit']+ '.0 credits </div>';
                
                let grade = document.createElement('div');
                grade.classList.add('grade');
                grade.innerHTML = 'Add grade';
                c_container.appendChild(c_label)
                c_container.appendChild(c_info);
                c_container.appendChild(grade);


                let course = document.createElement("div");
                course.classList.add("course");
                course.id = course_id;
                course.appendChild(c_container)
                e.target.parentNode.parentNode.querySelector('.semester').appendChild(course);



                //changing total credits element in dom:
                let dom_tc = e.target.parentNode.parentNode.parentNode.querySelector('span');
                dom_tc.innerHTML = 'Total: ' + sem.totalCredit + ' credits';

                e.target.parentNode.querySelector("input").remove();
                /*
                if (e.target.parentNode.parentNode.querySelector('.date>p').innerHTML.substring(0, 6) == 'SUMMER')
                {
                    if ((parseInt(sem.totalCredit) > 8))
                    {
                        alert("Warning: Only 8 credits can be taken in a summer semester!!" + '\nYou have taken ' + parseInt(sem.totalCredit));
                    }
                }
                else if ((parseInt(sem.totalCredit) > 20))
                {
                    alert("Warning: Only 20 credits can be taken per semester!!" + '\nYou have taken ' + parseInt(sem.totalCredit));
                }*/
                e.target.parentNode.remove()
            }
            else{
                alert("You have already added " + myCourse.code);
                e.target.parentNode.querySelector("input").value = '';
            }
        }
        else
        {
            alert("ERROR: Course Not Found!");
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
    }
    //CLICKED "<course delete>"
    else if(e.target.classList.contains("delete_course"))
    {
        curriculum.getSemester(e.target.parentNode.parentNode.parentNode.parentNode.id).deleteCourse(e.target.parentNode.parentNode.parentNode.id);
        //changing total credits element in dom:
        let dom_tc = e.target.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.querySelector('span');
        dom_tc.innerHTML = 'Total: ' + curriculum.getSemester(e.target.parentNode.parentNode.parentNode.parentNode.id).totalCredit + ' credits';


        let grade = e.target.parentNode.parentNode.querySelector('.grade').innerHTML;

        let sem = e.target.parentNode.parentNode.parentNode.parentNode;
        let courseName = e.target.parentNode.firstChild.innerHTML;
        let credit = parseInt(getInfo(courseName, course_data)['SU_credit']);

        curriculum.getSemester(sem.id).totalGPA -= (letter_grades_global_dic[grade] * credit);
        if(grade != 'T'){curriculum.getSemester(sem.id).totalGPACredits -= credit;}


        e.target.parentNode.parentNode.parentNode.remove();
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
    }
    //CLICKED trash in input:
    else if(e.target.classList.contains("delete_add_course"))
    {
        e.target.parentNode.remove();
    }
    //CLICKED ADD GRADE:
    else if(e.target.classList.contains("grade"))
    {
        if(e.target.innerHTML.length <= 2)
        {
            let grade = e.target.innerHTML;

            let sem = e.target.parentNode.parentNode.parentNode;
            let courseName = e.target.parentNode.querySelector('.course_label').firstChild.innerHTML;
            let credit = parseInt(getInfo(courseName, course_data)['SU_credit']);

            curriculum.getSemester(sem.id).totalGPA -= (letter_grades_global_dic[grade] * credit);
            if(grade != 'T'){curriculum.getSemester(sem.id).totalGPACredits -= credit;}
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
            curriculum.getSemester(sem.id).totalGPA += (letter_grades_global_dic[grade] * credit);
            if(grade != 'T'){curriculum.getSemester(sem.id).totalGPACredits += credit;}
            e.target.parentNode.innerHTML = grade;
            
            //alert(curriculum.getSemester(sem.id).totalGPA / curriculum.getSemester(sem.id).totalGPACredits)
        })
    }
}