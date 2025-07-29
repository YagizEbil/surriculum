import { buildFlagMessages } from './flagMessages.js';
import { requirements } from './requirements.js';

// Display graduation check results in a modal
function displayGraduationResults(curriculum) {
    if(!document.querySelector('.graduation_modal')) {
        const board_dom = document.querySelector(".board");
        let graduation_modal = document.createElement("div");
        graduation_modal.classList.add('graduation_modal');
        let graduation_modal_overlay = document.createElement("div");
        graduation_modal_overlay.classList.add('graduation_modal_overlay');
        board_dom.appendChild(graduation_modal_overlay);
        board_dom.appendChild(graduation_modal);

        const leftPosition = ((board_dom.offsetWidth) / 2) + board_dom.scrollLeft;
        graduation_modal.style.left = leftPosition + 'px';

        const flag = curriculum.canGraduate();
        const messages = buildFlagMessages(curriculum.major);
        const messageText = flag === 0
            ? 'Congrats! You can graduate!!!'
            : 'You cannot graduate: ' + (messages[flag] ? messages[flag]() : `Error code ${flag}`);
        graduation_modal.innerHTML = '<div>' + messageText + '</div>';
    }
}

// Function to display summary of credits
function displaySummary(curriculum, major_chosen_by_user) {
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

    for(let i = 0; i < curriculum.semesters.length; i++) {
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
    // Use requirements definitions for limits
    const req = requirements[major_chosen_by_user] || {};
    const limits = [
        "4.0",
        String(req.total),
        String(req.ects),
        String(req.university),
        String(req.required),
        String(req.core),
        String(req.area),
        String(req.free),
        String(req.science),
        String(req.engineering)
    ];

    for (let i = 0; i < 10; i++) {
        let child_summary = document.createElement("div");
        child_summary.classList.add('summary_modal_child');
        if(i==0) child_summary.innerHTML = '<p>GPA: ' + total_values[i]  + '</p>';
        else child_summary.innerHTML = '<p>' + labels[i] + total_values[i] + ' / ' + limits[i] + '</p>';
        summary_modal.appendChild(child_summary);
    }
}

if (typeof window !== 'undefined') {
    // Expose the displayGraduationResults and displaySummary functions on the window object
    window.displayGraduationResults = displayGraduationResults;
    window.displaySummary = displaySummary;
}