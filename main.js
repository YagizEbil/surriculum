let course_data;
//can only be CS, BIO, MAT, EE, ME, IE, ECON:
let initial_major_chosen = 'CS'

function SUrriculum(major_chosen_by_user)
{
    fetch('./' + major_chosen_by_user + '.json')
    .then(response => response.json())
    .then(json => {
    //START OF PROGRAM
    change_major_element = document.querySelector('.change_major');
    change_major_element.innerHTML = '<p>Major: ' + major_chosen_by_user + '</p>';

    course_data = json;
    let curriculum = new s_curriculum();
    curriculum.major = major_chosen_by_user;

    //************************************************

    //Targetting dynamically created elements:
    document.addEventListener('click', function(e){
        dynamic_click(e, curriculum, course_data)
        //CLICKED outside of summary_modal:
        if(!(e.target.parentNode.classList.contains('summary_modal_child')) && !e.target.classList.contains('summary_modal_child') && !e.target.classList.contains('summary_modal') && !e.target.classList.contains('summary') && !e.target.classList.contains('summary_p'))
        {
            try{document.querySelector('.summary_modal').remove();} catch{}
            try{document.querySelector('.summary_modal_overlay').remove();} catch{}
        }
        if(!(e.target.parentNode.classList.contains('graduation_modal'))  && !e.target.classList.contains('graduation_modal') && !e.target.classList.contains('check') && !e.target.parentNode.classList.contains('check'))
        {
            try{document.querySelector('.graduation_modal').remove();} catch{}
            try{document.querySelector('.graduation_modal_overlay').remove();} catch{}
        }
        //NON-dynamic Click:
        let major_change_element = document.querySelector('.change_major');
        try
        {
            if(!(e.target.classList.contains('change_major') || e.target.parentNode.classList.contains('change_major')))
            {
                major_change_element.innerHTML = '<p>Major: ' + major_chosen_by_user + '</p>';
            }
        }
        catch
        {
                major_change_element.innerHTML = '<p>Major: ' + major_chosen_by_user + '</p>';
        }
        let element = e.target;
        try
        {
            if(element.parentNode.classList.contains('change_major'))
            {
                element = element.parentNode;
            }
        } catch{}
        //Targetting major change:
        if(element.classList.contains('change_major'))
        {
            if(!change_major_element.querySelector('input'))
            {
                change_major_element.innerHTML = '';
                let input_major = document.createElement('input');
                input_major.placeholder = 'choose a major';
                input_major.setAttribute("list", 'datalist_majors');
                let datalist = document.createElement("datalist");
                datalist.innerHTML +=  "<option value='" + 'BIO' + "'>";
                datalist.innerHTML +=  "<option value='" + 'CS' + "'>";
                datalist.innerHTML +=  "<option value='" + 'EE' + "'>";
                datalist.innerHTML +=  "<option value='" + 'IE' + "'>";
                datalist.innerHTML +=  "<option value='" + 'MAT' + "'>";
                datalist.innerHTML +=  "<option value='" + 'ME' + "'>";
                datalist.innerHTML +=  "<option value='" + 'ECON' + "'>";
                datalist.id = 'datalist_majors';
                change_major_element.appendChild(input_major);
                change_major_element.appendChild(datalist);

                input_major.addEventListener('input', function(e) {
                    let datalist_options = document.getElementById('datalist_majors').children;
                    let major_chosen_new = (e.target.value).toUpperCase();

                    let majorIsValid = false;
                    for(let i = 0; i < datalist_options.length; i++)
                    {
                        if(datalist_options[i].value == major_chosen_new) majorIsValid = true;
                    }
                    if(majorIsValid)
                    {
                        change_major_element.innerHTML = '<p>Major: ' + major_chosen_new + '</p>';
                        localStorage.removeItem("major");
                        localStorage.setItem("major", major_chosen_new);
                        location.reload();
                    }
                    else
                    {
                        e.target.parentNode.innerHTML = '<p>Major: ' + major_chosen_by_user + '</p>';
                    }
                });
            }
        }
    })
    document.addEventListener('mouseover', function(e){
        mouseover(e);
        if (e.target.classList.contains('btn'))
        {e.target.style.backgroundColor = '#7a9dc9';}
        else if(e.target.parentNode.classList.contains('btn'))
        {e.target.parentNode.style.backgroundColor = '#7a9dc9';}
        else
        {
            document.querySelectorAll('.btn').forEach( element => {element.style.backgroundColor = '#526e8f'});
            if(!e.target.classList.contains('semester_drag'))
            {document.querySelectorAll('.semester_drag').forEach( element => {element.style.backgroundImage = 'url("./assets/dragw.png")'});}
        }
    })
    document.addEventListener('mouseout', function(e){
        mouseout(e);
        if (e.target.classList.contains('btn'))
        {e.target.style.backgroundColor = '#526e8f';}
    })

    let dragged_item = null;
    document.addEventListener('dragstart', function(e){
        if(e.target.classList.contains("container_semester"))
        {dragged_item = e.target;}
    })
    document.addEventListener('dragover', function(e){
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    })

    document.addEventListener('drop', function(e){
        drop(e, curriculum, dragged_item);
    })
    /*
    document.addEventListener("input", function(e){
        if(e.target.classList.contains())
    })*/

    //************************************************************** 

    //NON-DYNAMIC BUTTONS:
    const addSemester = document.querySelector(".addSemester");
    addSemester.addEventListener('click', function(){
        createSemeter(true, [], curriculum, course_data)
    });

    const auto_add = document.querySelector('.autoAdd');
    auto_add.addEventListener('click', function(){
        let fs_courses = ["MATH101","NS101","SPS101","IF100","TLL101","HIST191","CIP101N"];
        let ss_courses = ["MATH102","NS102","SPS102","AL102","TLL102","HIST192","PROJ201"];
        createSemeter(false, ss_courses, curriculum, course_data);
        createSemeter(false, fs_courses, curriculum, course_data);
    })

    document.querySelector('.check>p').addEventListener('click', function(){document.querySelector('.check').click();})
    const check_graduation = document.querySelector('.check');
    check_graduation.addEventListener('click', function(){
        if(!document.querySelector('.graduation_modal')){
        const board_dom = document.querySelector(".board");
        let graduation_modal = document.createElement("div");
        graduation_modal.classList.add('graduation_modal');
        let graduation_modal_overlay = document.createElement("div");
        graduation_modal_overlay.classList.add('graduation_modal_overlay');
        board_dom.appendChild(graduation_modal_overlay);
        board_dom.appendChild(graduation_modal);

        const leftPosition = ((board_dom.offsetWidth) / 2) + board_dom.scrollLeft;
        graduation_modal.style.left = leftPosition + 'px';
        
        let flag = curriculum.canGraduate();
        let message;
        if(flag == 0){message = ("Congrats! You can graduate!!!");}
        else if (flag == 1){message = ("You cannot graduate: Your total credit is less than 125!");}
        else if (flag == 2){message = ("You cannot graduate: Your university courses credit is less than 41!");}
        else if (flag == 3){message = ("You cannot graduate: Your required courses credit is less than 29!");}
        else if (flag == 4){message = ("You cannot graduate: You have not taken CIP101!");}
        else if (flag == 5){message = ("You cannot graduate: You have not taken CS395!");}
        else if (flag == 6){message = ("You cannot graduate: Your core electives credit is less than 31!");}
        else if (flag == 7){message = ("You cannot graduate: Your area electives credit is less than 9!");}
        else if (flag == 8){message = ("You cannot graduate: Your free electives credit is less than 15!");}
        else if (flag == 9){message = ("You cannot graduate: You have not taken SPS303!");}
        else if (flag == 10){message = ("You cannot graduate: You have not taken a HUM2XX class!");}
        else if (flag == 11){message = ("You cannot graduate: Your total Basic Science ECTS is less than 60!");}
        else if (flag == 12){message = ("You cannot graduate: Your total Engineering ECTS is less than 90!");}
        else if (flag == 13){message = ("You cannot graduate: Your total ECTS credit is less than 240!");}
        else if (flag == 14){message = ("You cannot graduate: Your required courses credit is less than 31!");}
        else if (flag == 15){message = ("You cannot graduate: You have not taken IE395!");}
        else if (flag == 16){message = ("You cannot graduate: Your core electives credit is less than 29!");}
        else if (flag == 17){message = ("You cannot graduate: Your required courses credit is less than 35!");}
        else if (flag == 18){message = ("You cannot graduate: You have not taken EE395!");}
        else if (flag == 19){message = ("You cannot graduate: Your core electives credit is less than 25!");}
        else if (flag == 20){message = ("You cannot graduate: Your required courses credit is less than 26!");}
        else if (flag == 21){message = ("You cannot graduate: You have not taken EE395!");}
        else if (flag == 22){message = ("You cannot graduate: Your core electives credit is less than 34!");}
        else if (flag == 23){message = ("You cannot graduate: You have not taken BIO395!");}
        else if (flag == 24){message = ("You cannot graduate: Your required courses credit is less than 39!");}
        else if (flag == 25){message = ("You cannot graduate: You have not taken ME395!");}
        else if (flag == 26){message = ("You cannot graduate: Your core electives credit is less than 21!");}
        else if (flag == 27){message = ("You cannot graduate: Your required courses credit is less than 18!");}
        else if (flag == 28){message = ("You cannot graduate: You have not taken ECON300!");}
        else if (flag == 29){message = ("You cannot graduate: Your core electives credit is less than 12!");}
        else if (flag == 30){message = ("You cannot graduate: Your area electives credit is less than 18!");}
        else if (flag == 31){message = ("You cannot graduate: Your free electives credit is less than 30!");}
        else if (flag == 32){message = ("You cannot graduate: You have not taken a HUM3XX class!");}

        graduation_modal.innerHTML = '<div>'+ message +'</div>'
        
    }})

    const summary = document.querySelector('.summary');
    summary.addEventListener('click', function(){
        if(document.querySelector('.summary_modal')) return;
        let area = 0;
        let core = 0;
        let free = 0;
        let university = 0;
        let required = 0;
        let total = 0;
        let science = 0;
        let engineering = 0;
        let ects = 0;
        let gpa_credits = 0;
        let gpa_value = 0.0;
        
        for(let i = 0; i < curriculum.semesters.length; i++)
        {
            total = total + curriculum.semesters[i].totalCredit;
            area = area + curriculum.semesters[i].totalArea;
            core = core + curriculum.semesters[i].totalCore;
            free = free + curriculum.semesters[i].totalFree;
            university = university + curriculum.semesters[i].totalUniversity;
            required = required + curriculum.semesters[i].totalRequired;
            science += curriculum.semesters[i].totalScience;
            engineering += curriculum.semesters[i].totalEngineering;
            ects += curriculum.semesters[i].totalECTS;
            gpa_credits += curriculum.semesters[i].totalGPACredits;
            gpa_value += curriculum.semesters[i].totalGPA;
        }
        //alert(['GPA: ' + ((gpa_value/gpa_credits).toFixed(5)) + '\n' +'SU Credits: ' + total + '/125' + '\n' + 'ECTS: ' + ects + '/240'+ '\n' + 'Core: ' + core + '/31' + '\n' + 'Area: ' + area + '/9' + '\n' + 'Free: ' + free+ '/9' + '\n' + 'University: ' + university+ '/41' + '\n'  +  'Required: ' + required + '/29'+ '\n' + 'Basic Science: ' + science+ '/60' + '\n' + 'Engineering: ' + engineering+ '/90']);
        const board_dom = document.querySelector(".board");
        let summary_modal = document.createElement("div");
        summary_modal.classList.add('summary_modal');
        let summary_modal_overlay = document.createElement("div");
        summary_modal_overlay.classList.add('summary_modal_overlay');
        board_dom.appendChild(summary_modal_overlay);
        board_dom.appendChild(summary_modal);

        const leftPosition = ((board_dom.offsetWidth) / 2) + board_dom.scrollLeft;
        summary_modal.style.left = leftPosition + 'px';

        let labels = ['GPA: ', 'SU Credits: ', 'ECTS: ', 'University: ',  'Required: ', 'Core: ', 'Area: ', 'Free: ',  'Basic Science: ', 'Engineering: '];
        let total_values = [(gpa_value/gpa_credits).toFixed(3), total, ects, university, required, core, area, free, science, engineering]
        let limits = [];
        if(major_chosen_by_user == 'CS')
        {limits = ["4.0", "125", "240","41","29", "31", "9","15","60","90"]}
        else if(major_chosen_by_user == 'IE')
        {limits = ["4.0", "125", "240","41","31", "29", "9","15","60","90"]}
        else if(major_chosen_by_user == 'ECON')
        {limits = ["4.0", "125", "240","41","18", "12", "18","30","0","0"]}
        else if(major_chosen_by_user == 'EE')
        {limits = ["4.0", "125", "240","41","35", "25", "9","15","60","90"]}
        else if(major_chosen_by_user == 'MAT')
        {limits = ["4.0", "125", "240","41","26", "34", "9","15","60","90"]}
        else if(major_chosen_by_user == 'BIO')
        {limits = ["4.0", "125", "240","41","31", "29", "9","15","0","0"]}
        else if(major_chosen_by_user == 'ME')
        {limits = ["4.0", "125", "240","41","39", "21", "9","15","60","90"]}
        

        for (let i = 0; i < 10; i++)
        {
            let child_summary = document.createElement("div");
            child_summary.classList.add('summary_modal_child');
            if(i==0) child_summary.innerHTML = '<p>GPA: ' + total_values[i]  + '</p>'
            else child_summary.innerHTML = '<p>' + labels[i] + total_values[i] + ' / ' + limits[i] + '</p>'
            summary_modal.appendChild(child_summary);
        }
    })

    //************************************************************** 

    //Reload items from local storage:
    reload(curriculum, course_data);
    //Save:
    setInterval(function() {
        localStorage.removeItem("curriculum");
        localStorage.setItem("curriculum", serializator(curriculum));
        localStorage.removeItem("grades");
        localStorage.setItem("grades", grades_serializator());
        localStorage.removeItem("dates");
        localStorage.setItem("dates", dates_serializator());
    }, 2000);

    //createSemeter(false, ["MATH101","MATH102","MATH201","MATH203","IF100","TLL101"], curriculum, course_data)
    //createSemeter(false, ["NS101","SPS101","SPS102","AL102","TLL102","HIST192","PROJ201", "NS102", "HIST191", "CIP101N", "CS210", "MATH306", "CS201", "CS204", "MATH204"], curriculum, course_data)


    //END OF PROGRAM
    })
    .catch(error => {
        console.error(error);
    });
}

let major_existing = localStorage.getItem("major");
if (major_existing) {SUrriculum(major_existing);}
else {SUrriculum(initial_major_chosen);}