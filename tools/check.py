#!/usr/bin/env python3
"""Check local navigation and immutable snapshot identity; no semantic verdicts."""
from pathlib import Path
from urllib.parse import unquote, urlsplit
import hashlib
import json
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
errors = []

def require(condition, message):
    if not condition:
        errors.append(message)

def relative_links(path):
    text = path.read_text()
    # Code examples can contain paths without constituting navigation.
    text = re.sub(r'```.*?```', '', text, flags=re.S)
    for label, destination in re.findall(r'\[([^\]\n]+)\]\(([^)\n]+)\)', text):
        destination = destination.strip()
        if destination.startswith('<') and destination.endswith('>'):
            destination = destination[1:-1]
        parsed = urlsplit(destination)
        if parsed.scheme or parsed.netloc or not parsed.path:
            continue
        yield destination, (path.parent / unquote(parsed.path)).resolve()

for name in ['README.md','AGENTS.md','CURRENT.md','PURPOSE.md','ARCHITECTURE.md','PERFECTION.md','GOAL-JOURNEY.md','NEXT.md','sources/manifest.json']:
    require((ROOT/name).is_file(), f'Missing entry point: {name}')

markdown = list(ROOT.rglob('*.md'))
links_checked = 0
for path in markdown:
    for destination, target in relative_links(path):
        require(target == ROOT or ROOT in target.parents,
                f'{path.relative_to(ROOT)}: link escapes repository: {destination}')
        require(target.exists(), f'{path.relative_to(ROOT)}: missing link target: {destination}')
        links_checked += 1

subject_pages = sorted((ROOT/'subjects').glob('*/README.md'))
subject_index = (ROOT/'subjects/README.md').read_text()
system_pages = sorted(p for p in (ROOT/'systems').glob('*.md') if p.name != 'README.md')
system_index = (ROOT/'systems/README.md').read_text()
for path in subject_pages:
    require(f']({path.parent.name}/README.md)' in subject_index,
            f'Subject absent from index: {path.parent.name}')
    text = path.read_text()
    for system in re.findall(r'\]\(../../systems/([^/)]+)\.md\)', text):
        counterpart = ROOT/'systems'/f'{system}.md'
        if counterpart.exists():
            require(f'](../subjects/{path.parent.name}/README.md)' in counterpart.read_text(),
                    f'Missing reverse placement: {system} -> {path.parent.name}')
for path in system_pages:
    require(f']({path.name})' in system_index, f'System absent from index: {path.name}')
    for subject in re.findall(r'\]\(../subjects/([^/)]+)/README\.md\)', path.read_text()):
        counterpart = ROOT/'subjects'/subject/'README.md'
        if counterpart.exists():
            require(f'](../../systems/{path.name})' in counterpart.read_text(),
                    f'Missing subject placement: {subject} -> {path.stem}')

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

if errors:
    print('\n'.join(errors))
    sys.exit(1)
print(f'PASS: {len(subject_pages)} subjects, {len(system_pages)} system profiles, '
      f'{links_checked} local links, {len(manifest["artifacts"])} pinned source records, '
      f'{len(manifest["local_snapshots"])} unchanged local snapshots.')
print('This checks structure and recorded identity, not intellectual completeness or method effectiveness.')
