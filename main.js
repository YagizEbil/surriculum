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
    // Storage for the double major's course data.  It will be populated
    // when the user selects a double major via setDoubleMajor().
    let doubleMajorCourseData = [];

    fetchCourseData(major_chosen_by_user)
    .then(json => {
    //START OF PROGRAM
        let change_major_element = document.querySelector('.change_major');
    change_major_element.innerHTML = '<p>Major: ' + major_chosen_by_user + '</p>';

    // ------------------------------------------------------------------
    // Build a double major selector below the primary major display.  This
    // select allows the user to choose a second major or select "None" to
    // disable the double major.  We insert it on first load and persist
    // the selection in localStorage.  When the selection changes we
    // activate or clear the double major accordingly.  The dropdown is
    // populated with all majors and a default "None" option.
    (function initDoubleMajorSelector() {
        // Skip creation if a custom doubleMajor button exists.  This
        // allows the HTML to define its own DM selector that mimics the
        // primary major control.  If the page already contains an
        // element with class 'doubleMajor', we leave DM selection to
        // custom event handlers.
        if (document.querySelector('.doubleMajor')) return;
        // Otherwise fallback to the select-based implementation (not
        // executed for current UI)
        if (document.querySelector('.doubleMajorSelect')) return;
        const container = document.createElement('div');
        container.style.marginTop = '6px';
        container.style.display = 'flex';
        container.style.alignItems = 'center';
        const label = document.createElement('span');
        label.innerText = 'Double Major: ';
        label.style.marginRight = '4px';
        container.appendChild(label);
        const select = document.createElement('select');
        select.classList.add('doubleMajorSelect');
        const opts = ['None','BIO','CS','EE','IE','MAT','ME','ECON','DSA','MAN','PSIR','PSY','VACD'];
        opts.forEach(function(opt) {
            const optionEl = document.createElement('option');
            optionEl.value = (opt === 'None') ? '' : opt;
            optionEl.textContent = opt;
            select.appendChild(optionEl);
        });
        let savedDM = '';
        try {
            savedDM = localStorage.getItem('doubleMajor') || '';
        } catch (_) {}
        select.value = savedDM || '';
        select.addEventListener('change', function(e) {
            const val = e.target.value.toUpperCase();
            try {
                if (val) {
                    localStorage.setItem('doubleMajor', val);
                } else {
                    localStorage.removeItem('doubleMajor');
                }
            } catch (_) {}
            if (!val) {
                curriculum.doubleMajor = '';
                try {
                    for (let i = 0; i < curriculum.semesters.length; i++) {
                        for (let j = 0; j < curriculum.semesters[i].courses.length; j++) {
                            const c = curriculum.semesters[i].courses[j];
                            c.effective_type_dm = '';
                        }
                    }
                    curriculum.recalcEffectiveTypes(course_data);
                    curriculum.recalcEffectiveTypesDouble([]);
                    curriculum.doubleMajorCourseData = [];
                    const optionsHTML = getCoursesDataList(course_data);
                    document.querySelectorAll('datalist').forEach(function(dl) {
                        if (dl.id === 'datalist') {
                            dl.innerHTML = optionsHTML;
                        }
                    });
                } catch (_) {}
            } else {
                setDoubleMajor(val);
            }
        });
        container.appendChild(select);
        change_major_element.parentNode.insertBefore(container, change_major_element.nextSibling);
    })();

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

    // Expose the curriculum object globally so that helper functions
    // (e.g., isCourseValid and getInfo) can access the double major
    // configuration. This is especially useful for validating courses
    // that belong solely to the double major. Without this, helper
    // functions cannot see doubleMajorCourseData and would reject
    // double-major-specific courses.
    if (typeof window !== 'undefined') {
        window.curriculum = curriculum;
    }

    //************************************************

    //Targetting dynamically created elements:
    document.addEventListener('click', function(e){
        dynamic_click(e, curriculum, course_data)
        // CLICKED outside of any summary modal:
        // If the click target is not inside a summary modal (child or container) and
        // is not the summary button itself, remove all summary modals and their
        // overlays. Previously this removed only the first modal, which broke
        // double major summaries that display two modals. Now iterate all
        // summary modals and overlays for cleanup.
        if (!(e.target.parentNode.classList.contains('summary_modal_child')) &&
            !e.target.classList.contains('summary_modal_child') &&
            !e.target.classList.contains('summary_modal') &&
            !e.target.classList.contains('summary') &&
            !e.target.classList.contains('summary_p')) {
            try {
                document.querySelectorAll('.summary_modal').forEach(function(mod) { mod.remove(); });
            } catch {}
            try {
                document.querySelectorAll('.summary_modal_overlay').forEach(function(ov) { ov.remove(); });
            } catch {}
        }
        if(!(e.target.parentNode.classList.contains('graduation_modal'))  && !e.target.classList.contains('graduation_modal') && !e.target.classList.contains('check') && !e.target.parentNode.classList.contains('check'))
        {
            try{document.querySelector('.graduation_modal').remove();} catch{}
            try{document.querySelector('.graduation_modal_overlay').remove();} catch{}
        }
        //NON-dynamic Click:
        let major_change_element = document.querySelector('.change_major');
        let double_major_element = document.querySelector('.doubleMajor');
        try {
            // If click is outside change_major, restore its label
            if (!(e.target.classList.contains('change_major') || (e.target.parentNode && e.target.parentNode.classList.contains('change_major')))) {
                major_change_element.innerHTML = '<p>Major: ' + major_chosen_by_user + '</p>';
            }
        } catch {
            major_change_element.innerHTML = '<p>Major: ' + major_chosen_by_user + '</p>';
        }
        // If click is outside doubleMajor element, restore its label to saved DM or None
        try {
            if (double_major_element) {
                const dmSaved = localStorage.getItem('doubleMajor') || '';
                const dmDisplay = dmSaved ? dmSaved : 'None';
                if (!(e.target.classList.contains('doubleMajor') || (e.target.parentNode && e.target.parentNode.classList.contains('doubleMajor')))) {
                    // Only reset when no input present to avoid clearing user typing
                    if (!double_major_element.querySelector('input')) {
                        double_major_element.innerHTML = '<p>Double Major: ' + dmDisplay + '</p>';
                    }
                }
            }
        } catch (_) {}
        let element = e.target;
        try {
            if (element.parentNode.classList.contains('change_major')) {
                element = element.parentNode;
            }
        } catch {}
        // Targeting primary major change
        if (element.classList.contains('change_major')) {
            if (!change_major_element.querySelector('input')) {
                change_major_element.innerHTML = '';
                let input_major = document.createElement('input');
                input_major.placeholder = 'choose a major';
                input_major.setAttribute('list', 'datalist_majors');
                let datalist = document.createElement('datalist');
                const majorsList = ['BIO','CS','EE','IE','MAT','ME','ECON','DSA','MAN','PSIR','PSY','VACD'];
                majorsList.forEach(function(m) {
                    datalist.innerHTML += "<option value='" + m + "'>";
                });
                datalist.id = 'datalist_majors';
                change_major_element.appendChild(input_major);
                change_major_element.appendChild(datalist);
                input_major.addEventListener('input', function(e2) {
                    const major_chosen_new = (e2.target.value).toUpperCase();
                    let majorIsValid = false;
                    const options = document.getElementById('datalist_majors').children;
                    for (let i = 0; i < options.length; i++) {
                        if (options[i].value === major_chosen_new) majorIsValid = true;
                    }
                    if (majorIsValid) {
                        change_major_element.innerHTML = '<p>Major: ' + major_chosen_new + '</p>';
                        localStorage.removeItem('major');
                        localStorage.setItem('major', major_chosen_new);
                        location.reload();
                    } else {
                        e2.target.parentNode.innerHTML = '<p>Major: ' + major_chosen_by_user + '</p>';
                    }
                });
            }
        }
        // Targeting double major change
        // Mirror the primary major input behaviour for the doubleMajor button.
        // When the user clicks the doubleMajor button, replace its text
        // with an input field that allows selecting a second major or
        // clearing it (None).
        if (double_major_element) {
            let targetDM = e.target;
            try {
                if (targetDM.parentNode.classList.contains('doubleMajor')) {
                    targetDM = targetDM.parentNode;
                }
            } catch {}
            if (targetDM.classList.contains('doubleMajor')) {
                // Avoid adding another input if one already exists
                if (!double_major_element.querySelector('input')) {
                    double_major_element.innerHTML = '';
                    const dmInput = document.createElement('input');
                    dmInput.placeholder = 'choose double major';
                    dmInput.setAttribute('list', 'datalist_dm');
                    const dmDatalist = document.createElement('datalist');
                    dmDatalist.id = 'datalist_dm';
                    // Add None option (empty value) and majors
                    dmDatalist.innerHTML += "<option value='None'>";
                    const majors = ['BIO','CS','EE','IE','MAT','ME','ECON','DSA','MAN','PSIR','PSY','VACD'];
                    majors.forEach(function(m) {
                        dmDatalist.innerHTML += "<option value='" + m + "'>";
                    });
                    double_major_element.appendChild(dmInput);
                    double_major_element.appendChild(dmDatalist);
                    dmInput.addEventListener('input', function(e2) {
                        let newVal = (e2.target.value || '').toUpperCase();
                        if (newVal === 'NONE' || newVal === '') {
                            // Clear double major
                            double_major_element.innerHTML = '<p>Double Major: None</p>';
                            // Remove DM from localStorage
                            try {
                                localStorage.removeItem('doubleMajor');
                            } catch (_) {}
                            curriculum.doubleMajor = '';
                            // Clear DM types and datalist
                            try {
                                for (let i = 0; i < curriculum.semesters.length; i++) {
                                    const sem = curriculum.semesters[i];
                                    for (let j = 0; j < sem.courses.length; j++) {
                                        sem.courses[j].effective_type_dm = '';
                                    }
                                }
                                curriculum.recalcEffectiveTypes(course_data);
                                curriculum.recalcEffectiveTypesDouble([]);
                                curriculum.doubleMajorCourseData = [];
                                const html = getCoursesDataList(course_data);
                                document.querySelectorAll('datalist').forEach(function(dl) {
                                    if (dl.id === 'datalist') dl.innerHTML = html;
                                });
                            } catch (_) {}
                        } else {
                            // Validate against majors list
                            let valid = false;
                            const opts2 = dmDatalist.children;
                            for (let i = 0; i < opts2.length; i++) {
                                if (opts2[i].value.toUpperCase() === newVal) {
                                    valid = true; break;
                                }
                            }
                            if (valid) {
                                double_major_element.innerHTML = '<p>Double Major: ' + newVal + '</p>';
                                try {
                                    localStorage.setItem('doubleMajor', newVal);
                                } catch (_) {}
                                setDoubleMajor(newVal);
                            } else {
                                // Invalid selection resets display
                                double_major_element.innerHTML = '<p>Double Major: ' + ((localStorage.getItem('doubleMajor') || '') || 'None') + '</p>';
                            }
                        }
                    });
                }
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
                // If a double major is selected, check if this course exists
                // in the double major course data.  If not, prompt the
                // user to assign a category for the double major.
                try {
                    if (curriculum.doubleMajor) {
                        // Determine combined code for the saved course
                        const combo = (courseObj ? (courseObj.Major + courseObj.Code) : (parsedMajor + parsedCode));
                        // Build a set of DM codes
                        const dmSet = new Set(doubleMajorCourseData.map(c => c.Major + c.Code));
                        if (!dmSet.has(combo)) {
                            // Determine course name for prompt
                            const nameForPrompt = courseObj ? (courseObj.Course_Name || combo) : (nameInput.value.trim() || combo);
                            showCourseTypeFormDM(combo, nameForPrompt, function(selectedType) {
                                if (selectedType) {
                                    // Create new DM course object with default zeros
                                    const matchDM = combo.match(/^([A-Z]+)(\d+)/);
                                    const mDM = matchDM ? matchDM[1] : combo.replace(/\d+.*/, '');
                                    const nDM = matchDM ? matchDM[2] : combo.replace(/[A-Z]+/, '');
                                    const newCourseDM = {
                                        Major: mDM,
                                        Code: nDM,
                                        Course_Name: nameForPrompt,
                                        ECTS: '0',
                                        Engineering: 0,
                                        Basic_Science: 0,
                                        SU_credit: '0',
                                        Faculty: '',
                                        EL_Type: selectedType,
                                        Faculty_Course: 'No'
                                    };
                                    doubleMajorCourseData.push(newCourseDM);
                                    // Persist DM custom course
                                    try {
                                        const keyDM = 'customCourses_' + curriculum.doubleMajor;
                                        const existingDM = JSON.parse(localStorage.getItem(keyDM) || '[]');
                                        existingDM.push(newCourseDM);
                                        localStorage.setItem(keyDM, JSON.stringify(existingDM));
                                    } catch (_) {}
                                    // Recalculate effective types for DM
                                    try {
                                        curriculum.recalcEffectiveTypesDouble(doubleMajorCourseData);
                                    } catch (_) {}
                                }
                            });
                        }
                    }
                } catch (ex) {
                    // ignore classification errors
                }
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
                    // Explicitly remove all relevant keys from localStorage
                    localStorage.removeItem('curriculum');
                    localStorage.removeItem('grades');
                    localStorage.removeItem('dates');
                    const customKey = 'customCourses_' + major_chosen_by_user;
                    localStorage.removeItem(customKey);
                    localStorage.clear()
                } catch (ex) {
                    console.error('Failed to clear localStorage:', ex);
                }
                // Reload the page to reflect the cleared state
                location.reload();
            }
        });
    }

    // The old 'Add Double Major' button functionality has been replaced
    // by a persistent dropdown created near the major display.  Any
    // unused event handlers referencing '.addDoubleMajor' are removed.

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
         * Process a queue of courses that are missing a double major category.
         * For each course code in the list, we prompt the user to select
         * a category (core/area/free/university/required).  Once the user
         * selects a type, we create a new course object for the double
         * major and append it to the double major course data and
         * localStorage.  After all items have been processed, we
         * recalculate effective types for the double major.
         * @param {Array} list - Array of objects { code, title }
         */
        function processPendingDoubleMajor(list) {
            if (!Array.isArray(list) || list.length === 0) {
                // After processing all, recalc double major categories and
                // update the datalist to include any courses defined via
                // DM classification.  This ensures newly added DM
                // custom courses appear in the selection dropdown.
                try {
                    curriculum.recalcEffectiveTypesDouble(doubleMajorCourseData);
                } catch (ex) {}
                // Refresh datalist with DM uniques
                updateDatalistForDoubleMajor();
                return;
            }
            const item = list.shift();
            showCourseTypeFormDM(item.code, item.title, function(selectedType) {
                if (selectedType) {
                    // Parse major prefix and code number
                    const match = item.code.match(/^([A-Z]+)(\d+)/);
                    const maj = match ? match[1] : item.code.replace(/\d+.*/, '');
                    const num = match ? match[2] : item.code.replace(/[A-Z]+/, '');
                    const newCourseDM = {
                        Major: maj,
                        Code: num,
                        Course_Name: item.title || item.code,
                        ECTS: '0',
                        Engineering: 0,
                        Basic_Science: 0,
                        SU_credit: '0',
                        Faculty: '',
                        EL_Type: selectedType,
                        Faculty_Course: 'No'
                    };
                    // Append to DM course data
                    doubleMajorCourseData.push(newCourseDM);
                    // Persist to custom courses storage for DM
                    try {
                        const keyDM = 'customCourses_' + curriculum.doubleMajor;
                        const existingDM = JSON.parse(localStorage.getItem(keyDM) || '[]');
                        existingDM.push(newCourseDM);
                        localStorage.setItem(keyDM, JSON.stringify(existingDM));
                    } catch (_) {}
                }
                // Process next
                processPendingDoubleMajor(list);
            });
        }

        /**
         * Show a modal to choose a category for a course under the double
         * major.  Only the category selector is presented; credits are
         * assumed to be zero by default.  On save, the callback is
         * invoked with the selected category; on cancel, callback is
         * invoked with null.
         * @param {string} code - The course code (e.g., CS101)
         * @param {string} title - The course name
         * @param {function} callback - Called with selected category or null
         */
        function showCourseTypeFormDM(code, title, callback) {
            // Avoid multiple modals
            if (document.querySelector('.double_major_modal')) return;
            const overlay = document.createElement('div');
            overlay.classList.add('double_major_overlay');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0,0,0,0.6)';
            overlay.style.zIndex = '300';
            overlay.style.display = 'flex';
            overlay.style.justifyContent = 'center';
            overlay.style.alignItems = 'center';
            const modal = document.createElement('div');
            modal.classList.add('double_major_modal');
            modal.style.backgroundColor = '#f5f7fa';
            modal.style.borderRadius = '6px';
            modal.style.padding = '20px';
            modal.style.minWidth = '250px';
            modal.style.color = '#333';
            modal.style.boxShadow = '0 3px 6px rgba(0,0,0,0.2)';
            // Title
            const h = document.createElement('h3');
            h.innerText = 'Set Category for Double Major';
            h.style.marginTop = '0';
            modal.appendChild(h);
            // Info text
            const info = document.createElement('p');
            info.innerText = code + ' - ' + title;
            info.style.marginBottom = '10px';
            modal.appendChild(info);
            // Select
            const select = document.createElement('select');
            ['core','area','required','university','free'].forEach(function(opt) {
                const o = document.createElement('option');
                o.value = opt;
                o.innerText = opt.charAt(0).toUpperCase() + opt.slice(1);
                select.appendChild(o);
            });
            select.style.padding = '6px';
            select.style.border = '1px solid #ccc';
            select.style.borderRadius = '3px';
            select.style.marginBottom = '10px';
            modal.appendChild(select);
            // Buttons
            const buttons = document.createElement('div');
            buttons.style.display = 'flex';
            buttons.style.justifyContent = 'flex-end';
            const cancel = document.createElement('button');
            cancel.innerText = 'Cancel';
            cancel.style.marginRight = '10px';
            cancel.onclick = function(e) {
                e.stopPropagation();
                overlay.remove();
                if (callback) callback(null);
            };
            const save = document.createElement('button');
            save.innerText = 'Save';
            save.style.backgroundColor = '#4caf50';
            save.style.color = '#fff';
            save.style.border = 'none';
            save.style.padding = '6px 12px';
            save.style.borderRadius = '3px';
            save.onclick = function(e) {
                e.stopPropagation();
                const chosen = select.value;
                overlay.remove();
                if (callback) callback(chosen);
            };
            buttons.appendChild(cancel);
            buttons.appendChild(save);
            modal.appendChild(buttons);
            overlay.appendChild(modal);
            overlay.addEventListener('click', function(e) {
                if (e.target === overlay) {
                    overlay.remove();
                    if (callback) callback(null);
                }
            });
            document.body.appendChild(overlay);
        }

        /**
         * Load and activate a double major.  This function fetches the course
         * data for the selected second major, loads any custom courses for
         * that major, and then recalculates effective types for the double
         * major.  It also scans existing courses in the curriculum to
         * identify any that do not yet exist in the double major course data
         * and prompts the user to classify them for the double major.
         * @param {string} dm - The double major code (e.g., EE)
         */
        function setDoubleMajor(dm) {
            curriculum.doubleMajor = dm;
            // Attach the loaded DM course data to the curriculum so
            // recalcEffectiveTypes() can trigger DM recalculation automatically.
            // Fetch course data for second major
            fetchCourseData(dm).then(function(jsonDM) {
                doubleMajorCourseData = jsonDM || [];
                // Save DM course data on the curriculum instance so
                // recalcEffectiveTypes() can trigger DM recalculation.
                curriculum.doubleMajorCourseData = doubleMajorCourseData;
                // Load custom courses for second major
                try {
                    const keyDM = 'customCourses_' + dm;
                    const storedDM = localStorage.getItem(keyDM);
                    if (storedDM) {
                        const parsedDM = JSON.parse(storedDM);
                        if (Array.isArray(parsedDM)) {
                            doubleMajorCourseData = doubleMajorCourseData.concat(parsedDM);
                        }
                    }
                } catch (ex) {}
                // Recalc categories for DM
                curriculum.recalcEffectiveTypesDouble(doubleMajorCourseData);
                // Determine pending courses that need classification for DM
                const pending = [];
                // Build a set of existing DM course codes for quick lookup
                const dmSet = new Set(doubleMajorCourseData.map(c => c.Major + c.Code));
                // Iterate all courses currently known (main + custom)
                course_data.forEach(function(c) {
                    const combined = (c.Major + c.Code);
                    if (!dmSet.has(combined)) {
                        // If this course is present in the curriculum (i.e., exists in any semester) we need classification
                        // Only prompt if the course appears in the user's semesters
                        let appears = false;
                        for (let si = 0; si < curriculum.semesters.length && !appears; si++) {
                            const sem = curriculum.semesters[si];
                            for (let ci = 0; ci < sem.courses.length; ci++) {
                                const sc = sem.courses[ci];
                                if ((sc.major + sc.code) === combined) {
                                    appears = true;
                                    break;
                                }
                            }
                        }
                        if (appears) {
                            pending.push({ code: combined, title: c.Course_Name });
                        }
                    }
                });
                if (pending.length > 0) {
                    processPendingDoubleMajor(pending);
                }

                // After loading the double major data, update the course
                // selection datalist to include courses unique to the
                // double major.  We combine the primary major's
                // course_data with any DM course whose Major+Code
                // combination is not present in the primary data.  This
                // ensures the user can add DM-only courses while
                // maintaining separate credit calculations for the main
                // major.  Updating the datalist at this point allows
                // immediate selection of DM courses before any
                // pending classifications complete.  We will update
                // again after pending courses are classified (see below).
                updateDatalistForDoubleMajor();
            });
        }

        /**
         * Update the datalist for course selection when a double major is
         * active.  This helper builds a combined course list consisting
         * of the main major's courses plus any courses unique to the
         * double major (i.e., those not present in the main major's
         * course_data).  It then rebuilds the datalist options so that
         * users can select courses from either major.  Courses unique
         * to the double major will still be ignored for the main
         * major's category allocations (handled in recalcEffectiveTypes).
         */
        function updateDatalistForDoubleMajor() {
            try {
                // If no double major is selected, reset to primary data
                if (!curriculum.doubleMajor) {
                    const optionsHTML = getCoursesDataList(course_data);
                    document.querySelectorAll('datalist').forEach(function(dl) {
                        if (dl.id === 'datalist') dl.innerHTML = optionsHTML;
                    });
                    return;
                }
                // Build a set of main course codes for quick lookup
                const mainSet = new Set(course_data.map(function(c) {
                    return (c.Major + c.Code);
                }));
                // Collect unique double major courses
                const dmUnique = [];
                doubleMajorCourseData.forEach(function(dm) {
                    const key = dm.Major + dm.Code;
                    if (!mainSet.has(key)) dmUnique.push(dm);
                });
                // Combine arrays
                const combined = course_data.concat(dmUnique);
                const html = getCoursesDataList(combined);
                document.querySelectorAll('datalist').forEach(function(dl) {
                    if (dl.id === 'datalist') dl.innerHTML = html;
                });
            } catch (ex) {
                // ignore errors
            }
        }
        // Expose the helper globally so that other modules (e.g., the
        // curriculum code) can trigger datalist updates after reallocations.
        if (typeof window !== 'undefined') {
            window.updateDatalistForDoubleMajor = updateDatalistForDoubleMajor;
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


    // At the end of initialization, if there is a saved double major in
    // localStorage, activate it.  This ensures the double major's
    // course categories are recalculated and displayed after the page
    // reloads.  We also update the select element's value to reflect
    // the stored double major choice.
    try {
        const savedDMInit = localStorage.getItem('doubleMajor') || '';
        if (savedDMInit) {
            // If using the select-based fallback, update its value
            const sel = document.querySelector('.doubleMajorSelect');
            if (sel) sel.value = savedDMInit;
            // Update the button display for the custom DM control
            const dmBtn = document.querySelector('.doubleMajor');
            if (dmBtn) {
                dmBtn.innerHTML = '<p>Double Major: ' + savedDMInit + '</p>';
            }
            // setDoubleMajor expects uppercase codes
            setDoubleMajor(savedDMInit.toUpperCase());
        } else {
            // If none saved, ensure the button displays None
            const dmBtn = document.querySelector('.doubleMajor');
            if (dmBtn) dmBtn.innerHTML = '<p>Double Major: None</p>';
        }
    } catch (e) {
        // ignore
    }

    //END OF PROGRAM
    })
    .catch(error => {
        console.error(error);
    });
}

let major_existing = localStorage.getItem("major");
if (major_existing) {SUrriculum(major_existing);}
else {SUrriculum(initial_major_chosen);}