from pathlib import Path
from urllib.parse import unquote, urlsplit
import hashlib, json, re

ROOT = Path(__file__).resolve().parents[1]
errors = []
def require(condition, message):
    if not condition: errors.append(message)
def read(path): return json.loads((ROOT/path).read_text())
def digest(path): return hashlib.sha256(path.read_bytes()).hexdigest()

links = 0
for path in ROOT.rglob('*.md'):
    text = re.sub(r'```.*?```', '', path.read_text(), flags=re.S)
    for label, destination in re.findall(r'\[([^\]\n]+)\]\(([^)\n]+)\)', text):
        parsed = urlsplit(destination)
        if parsed.scheme or parsed.netloc: continue
        target = (path.parent/unquote(parsed.path)).resolve() if parsed.path else path.resolve()
        require(target == ROOT or ROOT in target.parents, f'Link outside repository: {path.relative_to(ROOT)}: {destination}')
        require(target.exists(), f'Missing link: {path.relative_to(ROOT)}: {destination}')
        links += 1
    for block in re.findall(r'(?:^\|[^\n]*\n?)+', text, re.M):
        rows = [re.split(r'(?<!\\)\|', line.strip().strip('|')) for line in block.strip().splitlines()]
        require(len(rows)>1 and all(re.fullmatch(r'\s*:?-+:?\s*',c) for c in rows[1]), f'Missing table separator: {path.relative_to(ROOT)}')
        require(all(len(r)==len(rows[0]) for r in rows), f'Table columns differ: {path.relative_to(ROOT)}')

catalog = read('subjects/catalog.json')
records = catalog['subjects']
ids = {r['id'] for r in records}
require(len(ids)==len(records), 'Duplicate subject identity')
for root in catalog['roots']:
    page=ROOT/'subjects'/(root['name'].lower().replace(' ','-')+'.md')
    require(page.is_file(), 'Missing subject type: '+root['name'])
    if page.is_file():
        for row in records:
            if row['root']==root['name']:
                require(all(row[k].replace('|','\\|') in page.read_text() for k in ['name','settles','excludes']), 'Definition differs from catalog: '+row['id'])
for row in read('systems/catalog.json')['systems']:
    page=ROOT/row['path']
    require(page.is_file(), 'Missing system: '+row['name'])
    require(row['root'] in {r['name'] for r in catalog['roots']}, 'Unknown system subject: '+row['name'])
    subject=ROOT/'subjects'/(row['root'].lower().replace(' ','-')+'.md')
    require(page.name in subject.read_text(), 'System missing from subject: '+row['name'])
manifest = json.loads((ROOT/'sources/manifest.json').read_text())
seen = set()
for artifact in manifest['artifacts']:
    require(artifact['original_path'] not in seen,
            f'Duplicate source identity: {artifact["original_path"]}')
    seen.add(artifact['original_path'])
    require(bool(re.fullmatch(r'[0-9a-f]{64}', artifact['sha256'])),
            f'Invalid source hash: {artifact["original_path"]}')
    expected = f'https://github.com/{manifest["recovery_repository"]}/blob/{manifest["recovery_commit"]}/{artifact["snapshot_path"]}'
    require(artifact['snapshot_url'] == expected, f'Unpinned source URL: {artifact["original_path"]}')
for snapshot in manifest['local_snapshots']:
    path = (ROOT/snapshot['local_path']).resolve()
    require(ROOT in path.parents, f'Snapshot outside repository: {snapshot["local_path"]}')
    require(path.is_file(), f'Missing snapshot: {snapshot["local_path"]}')
    if path.is_file():
        data = path.read_bytes()
        require(hashlib.sha256(data).hexdigest() == snapshot['sha256'],
                f'Changed preserved snapshot: {snapshot["local_path"]}')
        if 'blob_sha' in snapshot:
            blob = hashlib.sha1(b'blob '+str(len(data)).encode()+b'\0'+data).hexdigest()
            require(blob == snapshot['blob_sha'], f'Blob mismatch: {snapshot["local_path"]}')

if errors: raise SystemExit('\n'.join(errors))
print(f'PASS: {len(records)} subjects; {links} local links; {len(manifest["artifacts"])} source records; {len(manifest["local_snapshots"])} source snapshots')
