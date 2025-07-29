# Surriculum v2.0 (beta)

Surriculum is an interactive graduation planner for Sabanci University undergraduate programs. The entire application runs in the browser using plain HTML, CSS and JavaScript. It lets you build a semester-by-semester plan, track program requirements and check whether you are on course to graduate.

A live instance is available at [beficent.github.io/surriculum](https://beficent.github.io/surriculum/).

## Using the tool

Clone this repository or download the source and open `index.html` in a modern web browser. No build step or server is required.

The interface allows you to:

- Select your major and an optional double major
- Add semesters and drag courses from the catalog
- Import your Academic Records Summary (HTML) to prefill taken courses
- Add custom courses manually
- Check graduation status and view a summary of remaining requirements

Always verify graduation requirements yourself. For issues or suggestions, contact [bilal.gebenoglu@sabanciuniv.edu](mailto:bilal.gebenoglu@sabanciuniv.edu).

## Updating course data

Course catalogs for each program are stored as JSON files under `courses/`. To refresh them or add new programs:

1. Edit `fetch_courses.py` if the university site changes and run `python fetch_courses.py` to regenerate the JSON files.
2. Use `update_credits.py` when Basic Science and Engineering credit values need to be extracted from official CSV/HTML sources.
3. Modify `requirements.js` for new or changed graduation rules and update matching messages in `main.js`.

After updating data, manually test with various course combinations to ensure the graduation checker behaves correctly.

## Credits

This repository continues the original Surriculum project and is maintained by **BEFICENT (Bilal M. G.)**. Major additions include double major support, Data Science and Analytics and several FASS programs, updated course lists and improved requirement checks.


