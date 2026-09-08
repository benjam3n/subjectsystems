#!/usr/bin/env python3
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
DATA=ROOT/'studies/perspective'
records=json.loads((DATA/'development.json').read_text())['records']
catalog=json.loads((ROOT/'subjects/catalog.json').read_text())
by_id={s['id']:s for s in catalog['subjects']};names={s['name'] for s in catalog['subjects']}
assert len({r['subject_id'] for r in records})==len(records)
for row in records:
 subject=by_id[row['subject_id']]
 assert row['name']==subject['name'] and row['target']==subject['settles'] and row['excludes']==subject['excludes']
 assert row['neighbor'] in names
 for key in ['start','operation','end','case','finding','standing']:assert isinstance(row[key],str) and row[key].strip()
from descriptions import table, write
out=[]
for r in records:
    out += ['## '+r['name'], table(['Condition','Operation','Result'],[(r['start'],r['operation'],r['end'])]),
            table(['Case','Finding','Neighbor','Boundary'],[(r['case'],r['finding'],r['neighbor'],r['excludes'])])]
write(DATA/'operation.md',out)
print(f'{len(records)} perspective study operations')
