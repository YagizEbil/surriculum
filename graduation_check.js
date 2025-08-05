// Remove ES module imports. Instead, rely on global functions and objects
// that are attached to the `window` (e.g., buildFlagMessages and
// requirements). This is necessary when running under the file:// scheme
// where ES module imports may not be available.

// Display graduation check results in a modal
function displayGraduationResults(curriculum) {
    if(!document.querySelector('.graduation_modal')) {
        const overlay = document.createElement("div");
        overlay.classList.add('graduation_modal_overlay');
        const modal = document.createElement("div");
        modal.classList.add('graduation_modal');
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
        // Compose results for primary major
        let html = '';
        const flagMain = curriculum.canGraduate();
        const msgMain = buildFlagMessages(curriculum.major) || {};
        html += '<div><strong>' + curriculum.major + ':</strong> ';
        if (flagMain === 0) {
            html += 'Congrats! You can graduate!!!';
        } else {
            const fcn = msgMain[flagMain];
            html += 'You cannot graduate: ' + (fcn ? fcn() : `Error code ${flagMain}`);
        }
        html += '</div>';
        // If double major selected, compute second major result
        if (curriculum.doubleMajor) {
            // Compose results for double major
            const flagMain = curriculum.canGraduateDouble();
            const msgMain = buildFlagMessages(curriculum.doubleMajor) || {};
            html += '<div><strong>' + curriculum.doubleMajor + ':</strong> ';
            if (flagMain === 0) {
                html += 'Congrats! You can graduate!!!';
            } else {
                const fcn = msgMain[flagMain];
                html += 'You cannot graduate: ' + (fcn ? fcn() : `Error code ${flagMain}`);
            }
        }
        modal.innerHTML = html;
    }
}

// Function to display summary of credits
function displaySummary(curriculum, major_chosen_by_user) {
    // Do not create more than one set of summary modals. If any exist, abort.
    if (document.querySelector('.summary_modal')) return;
    // Helper to build a summary modal for a given set of totals and limits.
    function buildSummaryModal(totals, limits, gpa, labelPrefix) {
        // Overlay is shared by all summary modals. Create it on demand and
        // append to the body so it covers the full viewport. The overlay uses
        // flexbox centering so modals appear in the middle of the screen.
        let overlay = document.querySelector('.summary_modal_overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.classList.add('summary_modal_overlay');
            document.body.appendChild(overlay);
        }
        const modal = document.createElement('div');
        modal.classList.add('summary_modal');
        overlay.appendChild(modal);
        // Build content
        const labels = ['GPA: ', 'SU Credits: ', 'ECTS: ', 'University: ',  'Required: ', 'Core: ', 'Area: ', 'Free: ',  'Basic Science: ', 'Engineering: '];
        const total_values = [gpa, totals.total, totals.ects, totals.university, totals.required, totals.core, totals.area, totals.free, totals.science, totals.engineering];
        for (let i = 0; i < 10; i++) {
            const child = document.createElement('div');
            child.classList.add('summary_modal_child');
            if (i === 0) {
                child.innerHTML = '<p>GPA: ' + gpa + ' / 4.00</p>';
            } else {
                child.innerHTML = '<p>' + labels[i] + total_values[i] + ' / ' + limits[i] + '</p>';
            }
            modal.appendChild(child);
        }
        return modal;
    }
    // Compute overall GPA and totals for primary major
    let totalsMain = {
        area: 0, core: 0, free: 0, university: 0, required: 0,
        total: 0, science: 0, engineering: 0, ects: 0
    };
    let gpaCredits = 0;
    let gpaValue = 0.0;
    for (let i = 0; i < curriculum.semesters.length; i++) {
        const sem = curriculum.semesters[i];
        totalsMain.total += sem.totalCredit;
        totalsMain.area += sem.totalArea;
        totalsMain.core += sem.totalCore;
        totalsMain.free += sem.totalFree;
        totalsMain.university += sem.totalUniversity;
        totalsMain.required += sem.totalRequired;
        totalsMain.science += sem.totalScience;
        totalsMain.engineering += sem.totalEngineering;
        totalsMain.ects += sem.totalECTS;
        gpaCredits += sem.totalGPACredits;
        gpaValue += sem.totalGPA;
    }
    const gpaMain = gpaCredits ? (gpaValue / gpaCredits).toFixed(3) : '0.000';
    // Determine limits from requirements for primary major
    // Access the requirements object via the global scope to avoid reference
    // errors when this script runs in environments without an imported
    // variable.
    const allReq = (typeof globalThis !== 'undefined' && globalThis.requirements)
        ? globalThis.requirements
        : {};

    function lookupReq(major, term) {
        if (allReq[major]) return allReq[major];
        if (term && allReq[term] && allReq[term][major]) return allReq[term][major];
        for (const t of Object.keys(allReq)) {
            if (allReq[t] && allReq[t][major]) return allReq[t][major];
        }
        return {};
    }

    const reqMain = lookupReq(major_chosen_by_user, curriculum.entryTerm);
    const limitsMain = [
        '4.0',
        String(reqMain.total || 0),
        String(reqMain.ects || 0),
        String(reqMain.university || 0),
        String(reqMain.required || 0),
        String(reqMain.core || 0),
        String(reqMain.area || 0),
        String(reqMain.free || 0),
        String(reqMain.science || 0),
        String(reqMain.engineering || 0)
    ];
    // Build primary summary modal
    buildSummaryModal(totalsMain, limitsMain, gpaMain);
    // If a double major exists, compute totals for DM and show a second modal
    if (curriculum.doubleMajor) {
        let totalsDM = {
            area: 0, core: 0, free: 0, university: 0, required: 0,
            total: 0, science: 0, engineering: 0, ects: 0
        };
        let gpaCreditsDM = 0;
        let gpaValueDM = 0.0;
        for (let i = 0; i < curriculum.semesters.length; i++) {
            const sem = curriculum.semesters[i];
            // Total credits always sum all courses
            totalsDM.total += sem.totalCredit;
            // Use DM allocations for core/area/free
            totalsDM.core += sem.totalCoreDM || 0;
            totalsDM.area += sem.totalAreaDM || 0;
            totalsDM.free += sem.totalFreeDM || 0;
            // For required and university, use DM-specific totals if present.
            // Fall back to the primary totals if DM totals are undefined,
            // ensuring backward compatibility.
            totalsDM.university += (sem.totalUniversityDM !== undefined ? sem.totalUniversityDM : sem.totalUniversity);
            totalsDM.required += (sem.totalRequiredDM !== undefined ? sem.totalRequiredDM : sem.totalRequired);
            // Science, engineering and ECTS are inherent to the course and
            // counted the same for both majors.  They remain unchanged.
            totalsDM.science += sem.totalScience;
            totalsDM.engineering += sem.totalEngineering;
            totalsDM.ects += sem.totalECTS;
            gpaCreditsDM += sem.totalGPACredits;
            gpaValueDM += sem.totalGPA;
        }
        const gpaDM = gpaCreditsDM ? (gpaValueDM / gpaCreditsDM).toFixed(3) : '0.000';
        // Determine limits for DM (SU +30, ECTS +60)
        const dmReq = lookupReq(curriculum.doubleMajor, curriculum.entryTermDM);
        const limitsDM = [
            '4.0',
            String((dmReq.total || 0) + 30),
            String((dmReq.ects || 0) + 60),
            String(dmReq.university || 0),
            String(dmReq.required || 0),
            String(dmReq.core || 0),
            String(dmReq.area || 0),
            String(dmReq.free || 0),
            String(dmReq.science || 0),
            String(dmReq.engineering || 0)
        ];
        buildSummaryModal(totalsDM, limitsDM, gpaDM);
    }
}

// Attach the functions to the global window so that other scripts can
// call them without using ES module syntax. This is important when
// running under file:// where module imports may fail.
if (typeof window !== 'undefined') {
    window.displayGraduationResults = displayGraduationResults;
    window.displaySummary = displaySummary;
}
