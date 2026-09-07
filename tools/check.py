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

for name in ['README.md','AGENTS.md','CURRENT.md','PURPOSE.md','ARCHITECTURE.md','DISTINCTIONS.md','subjects/README.md','subjects/LEGACY.md','research/SUBJECT-AUDIT.md','PERFECTION.md','GOAL-JOURNEY.md','NEXT.md','sources/manifest.json']:
    require((ROOT/name).is_file(), f'Missing entry point: {name}')

markdown = list(ROOT.rglob('*.md'))
links_checked = 0
for path in markdown:
    for destination, target in relative_links(path):
        require(target == ROOT or ROOT in target.parents,
                f'{path.relative_to(ROOT)}: link escapes repository: {destination}')
        require(target.exists(), f'{path.relative_to(ROOT)}: missing link target: {destination}')
        links_checked += 1

    # Current tables must retain their columns when development state is added.
    # Preserved historical sources keep their original formatting.
    if 'sources/reviews/' not in path.relative_to(ROOT).as_posix():
        text = re.sub(r'```.*?```', '', path.read_text(), flags=re.S)
        blocks = re.findall(r'(?:^\|[^\n]*\n?)+', text, flags=re.M)
        for block in blocks:
            rows = block.strip().splitlines()
            cells = [re.split(r'(?<!\\)\|', row.strip().strip('|')) for row in rows]
            separator = len(cells) > 1 and all(re.fullmatch(r'\s*:?-+:?\s*', c) for c in cells[1])
            require(separator, f'{path.relative_to(ROOT)}: table block lacks its header separator')
            if separator:
                require(all(len(row) == len(cells[0]) for row in cells),
                        f'{path.relative_to(ROOT)}: inconsistent table columns')

subject_index = ROOT/'subjects/LEGACY.md'
targets = {path: {target for _, target in relative_links(path)} for path in markdown}
# The rejected groups are a preserved inventory, not the replacement ontology.
# Derive their paths from the legacy index so new subject work is not forced
# into this superseded physical pattern.
group_pages = sorted(p for p in targets.get(subject_index, set())
                     if p.name == 'README.md' and p.parent.parent == ROOT/'subjects')
subject_pages = sorted(p for group in group_pages
                       for p in group.parent.glob('*/README.md'))
system_pages = sorted(p for p in (ROOT/'systems').glob('*.md') if p.name != 'README.md')
system_index = ROOT/'systems/README.md'

require(subject_index.is_file(), 'Missing legacy topic navigation')
require(subject_index in targets.get(ROOT/'subjects/README.md', set()),
        'Current subject entry point has no route to retained topic material')
require(bool(group_pages), 'No retained group pages found')
require(bool(subject_pages), 'No retained topic pages found')
subject_names = [path.parent.name for path in subject_pages]
require(len(subject_names) == len(set(subject_names)),
        'A subject has duplicate homes; retain one canonical page and cross-link it')
for path in group_pages:
    require(path in targets.get(subject_index, set()),
            f'Group absent from index: {path.parent.name}')
    require(subject_index in targets[path],
            f'Group lacks link to group index: {path.parent.name}')
    members = [p for p in subject_pages if p.parent.parent == path.parent]
    require(bool(members), f'Group has no subject pages: {path.parent.name}')
    for member in members:
        require(member in targets[path],
                f'Subject absent from group: {member.relative_to(ROOT)}')

for path in subject_pages:
    require(path in targets.get(ROOT/'research/SUBJECT-AUDIT.md', set()),
            f'Legacy topic absent from label audit: {path.parent.name}')
    group = path.parent.parent/'README.md'
    require(group in group_pages,
            f'Subject has no group page: {path.relative_to(ROOT)}')
    require(group in targets[path],
            f'Subject lacks link to its group: {path.relative_to(ROOT)}')
    for profile in targets[path].intersection(system_pages):
        require(path in targets[profile],
                f'Missing reverse placement: {profile.stem} -> {path.parent.name}')
for path in system_pages:
    require(path in targets.get(system_index, set()),
            f'System absent from index: {path.name}')
    for subject in targets[path].intersection(subject_pages):
        require(path in targets[subject],
                f'Missing subject placement: {subject.parent.name} -> {path.stem}')

local_systems = sorted(p for subject in subject_pages
                       for p in (subject.parent/'systems').glob('*.md')
                       if p.name != 'README.md')
for path in local_systems:
    subject = path.parent.parent/'README.md'
    text = path.read_text()
    require(path in targets[subject],
            f'Local system missing from its subject: {path.relative_to(ROOT)}')
    require(subject in targets[path],
            f'Local system lacks link to its subject: {path.relative_to(ROOT)}')
    require(bool(re.search(r'^Standing: \S', text, flags=re.M)),
            f'Local system has no declared standing: {path.relative_to(ROOT)}')
    source_families = targets[path].intersection(system_pages)
    require(bool(source_families), f'Local system has no source lineage: {path.relative_to(ROOT)}')
    for profile in source_families:
        require(path in targets[profile],
                f'Source profile lacks descendant: {profile.stem} -> {path.relative_to(ROOT)}')

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
functional_groups = [p for p in group_pages if p.parent.name != 'unplaced']
unplaced = [p for p in subject_pages if p.parent.parent.name == 'unplaced']
print(f'PASS: {len(functional_groups)} legacy group pages, '
      f'{len(subject_pages)} audited legacy topic entries ({len(unplaced)} in the former holding area), '
      f'{len(system_pages)} system profiles, '
      f'{len(local_systems)} local systems, '
      f'{links_checked} local links, {len(manifest["artifacts"])} pinned source records, '
      f'{len(manifest["local_snapshots"])} unchanged local snapshots.')
print('This checks retained navigation and recorded identity, not semantic non-overlap, intellectual completeness, or method effectiveness.')
