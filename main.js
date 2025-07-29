// Import statements removed. `s_curriculum` is expected to be defined
// globally by s_curriculum.js when loaded as a non-module script.

// Remove ES module imports for graduation_check. The functions
// displayGraduationResults and displaySummary will be attached to the
// global window object by graduation_check.js when loaded as a
// non-module script.

let course_data;
//can only be CS, BIO, MAT, EE, ME, IE, ECON, DSA, MAN, PSIR, PSY, VACD:
let initial_major_chosen = 'CS'


function SUrriculum(major_chosen_by_user) {
    /**
     * Attempt to fetch course data for the given major. By default the data
     * is expected to live under `./courses/${major}.json`, but in some
     * deployments the JSON files are present at the root (e.g., `./CS.json`).
     * This helper first tries the canonical location and falls back to the
     * root if the first fetch fails. It always returns a resolved Promise
     * with the parsed JSON or rejects if neither location is found.
     *
     * @param {string} major
     * @returns {Promise<Object[]>}
     */
    // Clear stored curriculum data on each load to avoid interference from
    // stale localStorage when working under the file:// scheme. In a
    // production environment you might remove this line to preserve
    // user sessions across refreshes.
    // try {
    //     localStorage.clear();
    // } catch (_) {}

    function fetchCourseData(major) {
        const primaryPath = `./courses/${major}.json`;
        const fallbackPath = `./${major}.json`;

        // Helper to synchronously read JSON via XMLHttpRequest. This
        // approach works for file:// origins where fetch() may be blocked.
        const tryRead = (path) => {
            try {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', path, false);
                xhr.overrideMimeType('application/json');
                xhr.send(null);
                // status 0 indicates success for file:// scheme in many browsers
                if (xhr.status === 200 || xhr.status === 0) {
                    return JSON.parse(xhr.responseText);
                }
            } catch (_) {
                // ignore
            }
            return null;
        };

        // First: attempt to read via synchronous XHR from primary and fallback.
        const dataPrimary = tryRead(primaryPath);
        if (dataPrimary) {
            return Promise.resolve(dataPrimary);
        }
        const dataFallback = tryRead(fallbackPath);
        if (dataFallback) {
            return Promise.resolve(dataFallback);
        }

        // If synchronous reads failed, fall back to fetch API. This path
        // supports http(s) origins where fetch is permitted. We'll try
        // primary then fallback.
        return fetch(primaryPath)
            .then(res => {
                if (!res.ok) throw new Error('Primary course JSON not found');
                return res.json();
            })
            .catch(async () => {
                try {
                    const res = await fetch(fallbackPath);
                    if (res.ok) return res.json();
                } catch (_) {
                    /* ignored */
                }
                // All attempts failed; return empty array
                return [];
            });
    }
    fetchCourseData(major_chosen_by_user)
    .then(json => {
    //START OF PROGRAM
        let change_major_element = document.querySelector('.change_major');
    change_major_element.innerHTML = '<p>Major: ' + major_chosen_by_user + '</p>';

    course_data = json;

    // ----------------------------------------------------------------------
    // Load any previously defined custom courses for this major from
    // localStorage. Custom courses are stored as an array of course
    // objects keyed by `customCourses_<major>`. These custom courses are
    // appended to the fetched course_data. This allows users to define
    // additional courses specific to a major without modifying the
    // underlying JSON files. On first use, the key may not exist so
    // JSON.parse on an empty string would throw; guard accordingly.
    try {
        const customKey = 'customCourses_' + major_chosen_by_user;
        const stored = localStorage.getItem(customKey);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
                course_data = course_data.concat(parsed);
            }
        }
    } catch (err) {
        console.error('Failed to load custom courses:', err);
    }
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
                datalist.innerHTML +=  "<option value='" + 'DSA' + "'>";
                datalist.innerHTML +=  "<option value='" + 'MAN' + "'>";
                datalist.innerHTML +=  "<option value='" + 'PSIR' + "'>";
                datalist.innerHTML +=  "<option value='" + 'PSY' + "'>";
                datalist.innerHTML +=  "<option value='" + 'VACD' + "'>";
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
        // Pass course_data to the drop handler so that it can invoke
        // curriculum.recalcEffectiveTypes() when semesters are reordered.
        drop(e, curriculum, dragged_item, course_data);
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
        // Check if there are existing semesters
        const semesters = document.querySelectorAll('.semester');
        if (semesters.length > 0) {
            alert('Error: Add First Year Courses only works when no semesters are present.');
            return;
        }

        // Automatically insert the typical first year courses into two semesters.
        // Fall semester courses: FS semester (first semester) and spring semester courses defined below.
        let fs_courses = ["MATH101","NS101","SPS101","IF100","TLL101","HIST191","CIP101N"];
        let ss_courses = ["MATH102","NS102","SPS102","AL102","TLL102","HIST192","PROJ201"];
        // Insert spring courses first so that the subsequent fall courses appear earlier chronologically.
        createSemeter(false, ss_courses, curriculum, course_data);
        createSemeter(false, fs_courses, curriculum, course_data);
    })

    document.querySelector('.check>p').addEventListener('click', function(){document.querySelector('.check').click();})
    const check_graduation = document.querySelector('.check');
    check_graduation.addEventListener('click', function(){
        displayGraduationResults(curriculum);
    })

    const summary = document.querySelector('.summary');
    summary.addEventListener('click', function(){
        displaySummary(curriculum, major_chosen_by_user);
    })

    // ----------------------------------------------------------------------
    // Custom Course: create a modal form to let the user define a new
    // course. The new course is stored in localStorage under a key
    // specific to the current major (customCourses_<major>) and added to
    // course_data. Existing datalists are updated so the new course can
    // be selected immediately. Only one custom course modal can be open
    // at a time.
        function showCustomCourseForm(prefill = null, courseObj = null, onSaveCallback = null) {
            // Prevent multiple modals
            if (document.querySelector('.custom_course_modal')) return;

        // Append the overlay to the document body rather than the board
        // container so that it always covers the full viewport and is not
        // clipped by the board's scroll container.  This also ensures the
        // modal remains visible even if the board is scrolled horizontally.
        const boardDom = document.body;

        // Create overlay with click-to-dismiss behaviour
        const overlay = document.createElement('div');
        overlay.classList.add('custom_course_overlay');
        // Inline styling for overlay: darken background and capture clicks
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
        overlay.style.zIndex = '200';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';

        // Create modal container
        const modal = document.createElement('div');
        modal.classList.add('custom_course_modal');
        // Inline styling for modal: centre box with padding
        modal.style.backgroundColor = '#f5f7fa';
        modal.style.borderRadius = '6px';
        modal.style.padding = '20px';
        modal.style.minWidth = '300px';
        modal.style.maxWidth = '500px';
        modal.style.color = '#333';
        modal.style.boxShadow = '0 3px 6px rgba(0,0,0,0.2)';
        modal.style.zIndex = '201';

        // Title
        const title = document.createElement('h3');
        title.innerText = 'Add Custom Course';
        title.style.marginTop = '0';
        title.style.marginBottom = '15px';
        modal.appendChild(title);

        // Helper to create input row
        function createInputRow(labelText, inputType = 'text', placeholder = '', defaultValue = '') {
            const row = document.createElement('div');
            row.style.display = 'flex';
            row.style.flexDirection = 'column';
            row.style.marginBottom = '10px';

            const label = document.createElement('label');
            label.innerText = labelText;
            label.style.marginBottom = '3px';
            row.appendChild(label);

            const input = document.createElement('input');
            input.type = inputType;
            input.placeholder = placeholder;
            input.value = defaultValue;
            input.style.padding = '6px';
            input.style.border = '1px solid #ccc';
            input.style.borderRadius = '3px';
            row.appendChild(input);

            return { row, input };
        }

            // Course Code input (e.g., CS101)
            const { row: codeRow, input: codeInput } = createInputRow('Course Code:', 'text', 'e.g. CS300');
            modal.appendChild(codeRow);

            // Course Name input
            const { row: nameRow, input: nameInput } = createInputRow('Course Name:', 'text', 'Course name');
            modal.appendChild(nameRow);

            // SU Credits input
            const { row: suRow, input: suInput } = createInputRow('SU Credits:', 'number', 'e.g. 3');
            modal.appendChild(suRow);

            // ECTS input
            const { row: ectsRow, input: ectsInput } = createInputRow('ECTS:', 'number', 'e.g. 6');
            modal.appendChild(ectsRow);

            // Basic Science credits input
            const { row: bsRow, input: bsInput } = createInputRow('Basic Science credits:', 'number', 'e.g. 0');
            bsInput.value = '0';
            modal.appendChild(bsRow);

            // Engineering credits input
            const { row: engRow, input: engInput } = createInputRow('Engineering credits:', 'number', 'e.g. 0');
            engInput.value = '0';
            modal.appendChild(engRow);

            // EL Type dropdown
            const typeRow = document.createElement('div');
            typeRow.style.display = 'flex';
            typeRow.style.flexDirection = 'column';
            typeRow.style.marginBottom = '10px';
            const typeLabel = document.createElement('label');
            typeLabel.innerText = 'Category (EL_Type):';
            typeLabel.style.marginBottom = '3px';
            typeRow.appendChild(typeLabel);
            const typeSelect = document.createElement('select');
            ['core', 'area', 'university', 'free', 'required'].forEach(function(opt) {
                const option = document.createElement('option');
                option.value = opt;
                option.innerText = opt.charAt(0).toUpperCase() + opt.slice(1);
                typeSelect.appendChild(option);
            });
            typeSelect.style.padding = '6px';
            typeSelect.style.border = '1px solid #ccc';
            typeSelect.style.borderRadius = '3px';
            typeRow.appendChild(typeSelect);
            modal.appendChild(typeRow);

            // If prefill data is provided, populate the inputs and select accordingly.
            if (prefill) {
                // Code may be provided as combined string or separate parts; if we
                // have courseObj (the actual course object), we can use its
                // Major and Code fields to reconstruct the code. Otherwise use
                // prefill.code.
                if (courseObj && courseObj.Major && courseObj.Code) {
                    codeInput.value = courseObj.Major + courseObj.Code;
                } else if (prefill.code) {
                    codeInput.value = prefill.code;
                }
                if (courseObj && courseObj.Course_Name) {
                    nameInput.value = courseObj.Course_Name;
                } else if (prefill.name) {
                    nameInput.value = prefill.name;
                }
                if (courseObj && courseObj.SU_credit) {
                    suInput.value = courseObj.SU_credit;
                } else if (prefill.suCredits !== undefined) {
                    suInput.value = prefill.suCredits;
                }
                if (courseObj && courseObj.ECTS) {
                    ectsInput.value = courseObj.ECTS;
                } else if (prefill.ects !== undefined) {
                    ectsInput.value = prefill.ects;
                }
                if (courseObj && courseObj.Basic_Science !== undefined) {
                    bsInput.value = courseObj.Basic_Science;
                } else if (prefill.basicScience !== undefined) {
                    bsInput.value = prefill.basicScience;
                }
                if (courseObj && courseObj.Engineering !== undefined) {
                    engInput.value = courseObj.Engineering;
                } else if (prefill.engineering !== undefined) {
                    engInput.value = prefill.engineering;
                }
                // Set EL type dropdown
                if (courseObj && courseObj.EL_Type) {
                    typeSelect.value = courseObj.EL_Type;
                } else if (prefill.elType) {
                    typeSelect.value = prefill.elType;
                }
            }

        // Buttons container
        const buttonsRow = document.createElement('div');
        buttonsRow.style.display = 'flex';
        buttonsRow.style.justifyContent = 'flex-end';
        buttonsRow.style.marginTop = '15px';

        const cancelBtn = document.createElement('button');
        cancelBtn.innerText = 'Cancel';
        cancelBtn.style.marginRight = '10px';
        cancelBtn.style.padding = '6px 12px';
        cancelBtn.style.border = 'none';
        cancelBtn.style.borderRadius = '3px';
        cancelBtn.style.backgroundColor = '#ccc';
        cancelBtn.style.cursor = 'pointer';
            cancelBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                overlay.remove();
                // On cancel, advance pending custom course processing if provided
                if (typeof onSaveCallback === 'function') {
                    onSaveCallback();
                }
            });
        buttonsRow.appendChild(cancelBtn);

        const saveBtn = document.createElement('button');
        saveBtn.innerText = 'Save';
        saveBtn.style.padding = '6px 12px';
        saveBtn.style.border = 'none';
        saveBtn.style.borderRadius = '3px';
        saveBtn.style.backgroundColor = '#4caf50';
        saveBtn.style.color = 'white';
        saveBtn.style.cursor = 'pointer';
            saveBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                // Read input values
                const rawCode = codeInput.value.trim().toUpperCase();
                if (!rawCode) {
                    alert('Course code is required.');
                    return;
                }
                // Parse major and numeric code from input (letters+digits)
                const match = rawCode.match(/^([A-Z]+)(\d+)$/);
                if (!match) {
                    alert('Invalid course code format. Use e.g. CS300 or MATH101.');
                    return;
                }
                const parsedMajor = match[1];
                const parsedCode = match[2];
                // Determine if we're updating an existing course or creating a new one
                if (courseObj) {
                    // Update fields on the existing course object
                    courseObj.Major = parsedMajor;
                    courseObj.Code = parsedCode;
                    courseObj.Course_Name = nameInput.value.trim() || rawCode;
                    courseObj.ECTS = ectsInput.value.toString() || '0';
                    courseObj.Engineering = parseInt(engInput.value || '0') || 0;
                    courseObj.Basic_Science = parseInt(bsInput.value || '0') || 0;
                    courseObj.SU_credit = suInput.value.toString() || '0';
                    courseObj.EL_Type = typeSelect.value;
                    // Persist update to localStorage
                    try {
                        const key = 'customCourses_' + major_chosen_by_user;
                        const existing = JSON.parse(localStorage.getItem(key) || '[]');
                        // Find and update the matching course in storage
                        for (let i = 0; i < existing.length; i++) {
                            if (existing[i].Major === courseObj.Major && existing[i].Code === courseObj.Code) {
                                existing[i] = courseObj;
                                break;
                            }
                        }
                        localStorage.setItem(key, JSON.stringify(existing));
                    } catch (ex) {
                        console.error('Failed to update custom course:', ex);
                    }
                } else {
                    // Build course object
                    const newCourse = {
                        Major: parsedMajor,
                        Code: parsedCode,
                        Course_Name: nameInput.value.trim() || rawCode,
                        ECTS: ectsInput.value.toString() || '0',
                        Engineering: parseInt(engInput.value || '0') || 0,
                        Basic_Science: parseInt(bsInput.value || '0') || 0,
                        SU_credit: suInput.value.toString() || '0',
                        Faculty: 'FENS',
                        EL_Type: typeSelect.value,
                        Faculty_Course: 'No'
                    };
                    // Append to in-memory course_data
                    course_data.push(newCourse);
                    // Persist to localStorage under current major
                    try {
                        const key = 'customCourses_' + major_chosen_by_user;
                        const existing = JSON.parse(localStorage.getItem(key) || '[]');
                        existing.push(newCourse);
                        localStorage.setItem(key, JSON.stringify(existing));
                    } catch (ex) {
                        console.error('Failed to save custom course:', ex);
                    }
                }
                // Update any open datalists so the new or updated course appears as an option
                try {
                    const optionsHTML = getCoursesDataList(course_data);
                    document.querySelectorAll('datalist').forEach(function(dl) {
                        if (dl.id === 'datalist') {
                            dl.innerHTML = optionsHTML;
                        }
                    });
                } catch (ex) {
                    // ignore if datalists not present
                }
                // Recalculate effective types since new course attributes may affect totals
                try {
                    if (typeof curriculum.recalcEffectiveTypes === 'function') {
                        curriculum.recalcEffectiveTypes(course_data);
                    }
                } catch (err) {
                    // ignore
                }
                // Remove modal
                overlay.remove();
                // Invoke callback to process next pending custom course
                if (typeof onSaveCallback === 'function') {
                    onSaveCallback();
                }
            });
        buttonsRow.appendChild(saveBtn);

        modal.appendChild(buttonsRow);

        // Prevent overlay clicks from triggering underlying events
        modal.addEventListener('click', function(e) {
            e.stopPropagation();
        });

        // Append modal to overlay and overlay to board
        overlay.appendChild(modal);
        overlay.addEventListener('click', function(e) {
            // If clicking directly on the overlay (not the modal), close
            if (e.target === overlay) {
                overlay.remove();
            }
        });
        boardDom.appendChild(overlay);
    }

    // Bind custom course button click
    const customCourseBtn = document.querySelector('.customCourse');
    if (customCourseBtn) {
        customCourseBtn.addEventListener('click', function() {
            showCustomCourseForm();
        });
    }

    // Bind delete custom courses button click
    const deleteCustomBtn = document.querySelector('.deleteCustom');
    if (deleteCustomBtn) {
        deleteCustomBtn.addEventListener('click', function() {
            handleDeleteCustomCourses();
        });
    }
    // Bind reset local data button click
    const resetLocalBtn = document.querySelector('.resetLocal');
    if (resetLocalBtn) {
        resetLocalBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to reset all local data? This will remove all saved semesters, custom courses, and grades.')) {
                try {
                    localStorage.clear();
                } catch (ex) {
                    console.error('Failed to clear localStorage:', ex);
                }
                // Reload the page to reflect the cleared state
                location.reload();
            }
        });
    }

    //************************************************************** 

    //Reload items from local storage:
    reload(curriculum, course_data);
    // After reloading existing semesters, recalculate effective categories
    // so that the allocation respects chronological order. Guard against
    // missing recalc function.
    try {
        if (typeof curriculum.recalcEffectiveTypes === 'function') {
            curriculum.recalcEffectiveTypes(course_data);
        }
    } catch(err) {
        // ignore
    }
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

    // No debug alerts in production; remove for clean UI

        // Helper to sequentially process a list of pending custom courses.
        // Each entry should contain a `course` (reference to the course object
        // already added to course_data) and optionally a `parsedInfo` object
        // containing raw code/title/credits extracted from the transcript. The
        // function will show the custom course modal prefilled with the known
        // information and allow the user to complete any missing fields. Once
        // the user saves or cancels, the next pending course is processed.
        function processPendingCustomCourses(list) {
            if (!Array.isArray(list) || list.length === 0) return;
            const next = list.shift();
            const prefill = {};
            if (next.parsedInfo && next.parsedInfo.code) {
                prefill.code = next.parsedInfo.code;
            } else if (next.course && next.course.Major && next.course.Code) {
                prefill.code = next.course.Major + next.course.Code;
            }
            if (next.parsedInfo && next.parsedInfo.title) {
                prefill.name = next.parsedInfo.title;
            } else if (next.course && next.course.Course_Name) {
                prefill.name = next.course.Course_Name;
            }
            if (next.course) {
                prefill.suCredits = next.course.SU_credit;
                prefill.ects = next.course.ECTS;
                prefill.basicScience = next.course.Basic_Science;
                prefill.engineering = next.course.Engineering;
                prefill.elType = next.course.EL_Type;
            }
            // Show the custom course form. Pass the existing course object so
            // that the save handler updates it instead of creating a new one.
            showCustomCourseForm(prefill, next.course, function() {
                processPendingCustomCourses(list);
            });
        }

        /**
         * Deletes all custom courses defined for the current major. Custom
         * courses are stored under the localStorage key `customCourses_<major>`.
         * This function removes those entries from both localStorage and the
         * in-memory `course_data` array. It also removes any instances of
         * those courses from the current curriculum's semesters. Finally it
         * updates the stored curriculum in localStorage and reloads the page
         * so that the UI reflects the changes. A confirmation prompt guards
         * against accidental deletion.
         */
        function handleDeleteCustomCourses() {
            const key = 'customCourses_' + major_chosen_by_user;
            let customList = [];
            try {
                customList = JSON.parse(localStorage.getItem(key) || '[]');
            } catch (e) {
                customList = [];
            }
            if (!customList || customList.length === 0) {
                alert('There are no custom courses to delete for this major.');
                return;
            }
            if (!confirm('Are you sure you want to delete all custom courses for ' + major_chosen_by_user + '?')) {
                return;
            }
            // Build a set of combined codes (Major+Code) for quick lookup
            const codeSet = new Set(customList.map(c => (c.Major + c.Code)));
            // Remove these courses from in-memory course_data
            course_data = course_data.filter(c => !codeSet.has(c.Major + c.Code));
            // Remove from semesters in curriculum
            if (curriculum && Array.isArray(curriculum.semesters)) {
                curriculum.semesters.forEach(function(sem) {
                    if (Array.isArray(sem.courses)) {
                        sem.courses = sem.courses.filter(function(code) {
                            return !codeSet.has(code);
                        });
                    }
                });
            }
            // Remove the custom courses entry from localStorage
            try {
                localStorage.removeItem(key);
            } catch (ex) {
                // ignore
            }
            // Persist the updated curriculum to localStorage
            try {
                if (typeof serializator === 'function') {
                    localStorage.removeItem('curriculum');
                    localStorage.setItem('curriculum', serializator(curriculum));
                }
            } catch (ex) {
                // ignore
            }
            // Recalculate effective types and update datalist
            try {
                if (typeof curriculum.recalcEffectiveTypes === 'function') {
                    curriculum.recalcEffectiveTypes(course_data);
                }
                const optionsHTML = getCoursesDataList(course_data);
                document.querySelectorAll('datalist').forEach(function(dl) {
                    if (dl.id === 'datalist') {
                        dl.innerHTML = optionsHTML;
                    }
                });
            } catch (err) {
                // ignore
            }
            // Reload the page to ensure UI reflects removed courses
            location.reload();
        }

        // Get from transcript:
        function handleAcademicRecordsImport() {
        const fileInput = document.getElementById('academicRecordsInput');

        if (fileInput.files.length > 0) {
            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onload = function(e) {
                const htmlContent = e.target.result;

                // Parse the HTML content
                const parsedData = window.academicRecordsParser.parseAcademicRecords(htmlContent);

                // Import courses to curriculum. The parser returns an object
                // containing both statistics and a list of pending custom
                // courses that need additional user input.
                const importResult = window.academicRecordsParser.importParsedCourses(
                    parsedData.courses,
                    course_data,
                    curriculum
                );

                const importStats = importResult.stats;
                const pendingList = importResult.pendingCustomCourses || [];

                // Show import results to user
                let message = `Successfully imported ${importStats.importedCourses} of ${importStats.totalCourses} courses.`;

                if (importStats.notFoundCourses.length > 0) {
                    message += `\n\nThe following ${importStats.notFoundCourses.length} courses were not found in the current program and were not imported:\n${importStats.notFoundCourses.join(', ')}`;
                }

                alert(message);

                // If there are pending custom courses, process them
                if (pendingList.length > 0) {
                    const queue = pendingList.slice();
                    processPendingCustomCourses(queue);
                }
            };

            reader.readAsText(file);
        } else {
            alert('Please select an Academic Records HTML file.');
        }
    }
    document.getElementById('importAcademicRecords').onclick = handleAcademicRecordsImport;

    // Add event listener for the import toggle button
    document.querySelector('.import-toggle').addEventListener('click', function() {
        const importSection = document.querySelector('.import-section');
        if (importSection.style.display === 'none' || !importSection.style.display) {
            importSection.style.display = 'block';
        } else {
            importSection.style.display = 'none';
        }
    });

    // Close import panel when clicking outside
    document.addEventListener('click', function(e) {
        const importSection = document.querySelector('.import-section');
        const importToggle = document.querySelector('.import-toggle');

        if (importSection && importSection.style.display === 'block' &&
            !importSection.contains(e.target) &&
            !importToggle.contains(e.target)) {
            importSection.style.display = 'none';
        }
    });


    //END OF PROGRAM
    })
    .catch(error => {
        console.error(error);
    });
}

let major_existing = localStorage.getItem("major");
if (major_existing) {SUrriculum(major_existing);}
else {SUrriculum(initial_major_chosen);}