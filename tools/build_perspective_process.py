#!/usr/bin/env python3
"""Validate perspective study references and render their authored definitions."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'research/perspectives'
records=json.loads((DATA/'development.json').read_text())['records']
catalog=json.loads((ROOT/'research/type-relations/subject-names.json').read_text())
by_id={s['id']:s for s in catalog['subjects']};names={s['name'] for s in catalog['subjects']}
assert len({r['subject_id'] for r in records})==len(records)
for row in records:
 subject=by_id[row['subject_id']]
 assert row['name']==subject['name'] and row['target']==subject['settles'] and row['excludes']==subject['excludes']
 assert row['neighbor'] in names
 for key in ['start','operation','end','case','finding','standing']:assert isinstance(row[key],str) and row[key].strip()
doc=['# Perspective subject development','',f'{len(records)} precise subject proposals extend the catalog. Operations below are authored study designs. Separating cases establish conceptual distinctions under stated assumptions; they are not participant observations or general effectiveness results.','',
'The earlier proposal for activation suitability uses Perspective scope applicability. Transition cost can be studied through resource-use cost for the specified transition. A perspective change contribution to problem formulation fits Perspective change contribution when target and standard are fixed. Composition compatibility still requires the actual interface or incompatibility question; an unspecified umbrella has not been admitted.','',
'Named neighbors are existing subjects. A shared episode can contain both determinations. The boundary concerns the requested result, not an exclusive classification of the whole episode. The [process findings](PROCESS-FINDINGS.md) develop the most consequential deductions and a correction to the relevance operation.','']
for r in records:
 doc+=['**'+r['name']+'**','',r['target'],'','- Starting condition: '+r['start'],'- Operation: '+r['operation'],'- End condition: '+r['end'],'- Neighbor: '+r['neighbor']+'. Boundary: '+r['excludes'],'- Constructed case: '+r['case'],'- Finding: '+r['finding'],'- Standing: '+r['standing'],'']
doc+=['[Foundation](FOUNDATION.md) · [Construction program](CONSTRUCTION.md) · [Current subject catalog](../../subjects/scopes/NAMES.md)','']
(DATA/'SUBJECT-DEVELOPMENT.md').write_text('\n'.join(doc))
print(json.dumps({'perspective_subjects_developed':len(records),'catalog_subjects':len(catalog['subjects']),'standing':'Recorded definitions and source references; no empirical completeness certification.'}))
