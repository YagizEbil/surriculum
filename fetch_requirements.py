import json
import requests
from bs4 import BeautifulSoup
import os
import datetime

REQUIREMENTS_DIR = 'requirements'
BASE = 'https://suis.sabanciuniv.edu/prod/'

PROGRAM_CODES = {
    'BSBIO': 'BIO',
    'BSCS': 'CS',
    'BAECON': 'ECON',
    'BSEE': 'EE',
    'BSMS': 'IE',
    'BSMAT': 'MAT',
    'BSME': 'ME',
    'BSDSA': 'DSA',
    'BAMAN': 'MAN',
    'BAPSIR': 'PSIR',
    'BAPSY': 'PSY',
    'BAVACD': 'VACD',
}

def fetch_requirements(program, term):
    url = (BASE + 'SU_DEGREE.p_degree_detail?P_PROGRAM={p}&P_LANG=EN&P_LEVEL=UG&P_TERM={t}&P_SUBMIT=Select').format(p=program, t=term)
    resp = requests.get(url)
    resp.raise_for_status()
    soup = BeautifulSoup(resp.text, 'lxml')
    table = soup.find('table')
    req = {}
    if not table:
        return req
    rows = table.find_all('tr')
    for r in rows:
        cols = [c.get_text(strip=True) for c in r.find_all('td')]
        if len(cols) >= 2:
            key = cols[0].lower()
            val = cols[1]
            if 'ects' in key:
                req['ects'] = int(val)
            elif 'su credit' in key and 'total' in key:
                req['total'] = int(val)
    return req

def main():
    os.makedirs(REQUIREMENTS_DIR, exist_ok=True)
    cur_year = datetime.datetime.now().year
    terms = []
    for year in range(2019, cur_year + 3):
        for suf in ('01','02','03'):
            terms.append(f"{year}{suf}")

    for term in terms:
        out = {}
        for prog, major in PROGRAM_CODES.items():
            try:
                data = fetch_requirements(prog, term)
            except Exception:
                data = {}
            if data:
                out[major] = data
        if out:
            with open(os.path.join(REQUIREMENTS_DIR, f'{term}.json'), 'w') as f:
                json.dump(out, f, indent=2)

if __name__ == '__main__':
    main()
