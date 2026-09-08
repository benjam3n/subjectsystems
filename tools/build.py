"""Render current descriptions and compare generated files without writing them."""
import argparse
from contextlib import redirect_stdout
import io
import json
from pathlib import Path
import re
import runpy

import descriptions

ROOT = Path(__file__).resolve().parents[1]


def slug(value):
    return re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-')


def outputs():
    out = {}

    def capture(path, sections):
        name = path.relative_to(ROOT).as_posix()
        if name in out:
            raise ValueError('Competing generators for ' + name)
        out[name] = '\n\n'.join(s.strip() for s in sections if s.strip()) + '\n'

    original = descriptions.write
    descriptions.write = capture
    try:
        with redirect_stdout(io.StringIO()):
            for name in ['subject_names', 'subject_integration', 'perspective_investigation',
                         'perspective_process', 'study_systems']:
                runpy.run_path(str(ROOT / 'tools' / ('build_' + name + '.py')))
    finally:
        descriptions.write = original

    catalog = json.loads((ROOT / 'subjects/catalog.json').read_text())
    names = {s['name']: s for s in catalog['subjects']}
    by_id = {s['id']: s for s in catalog['subjects']}
    changes = json.loads((ROOT / 'changes/catalog.json').read_text())
    entries = {c['id']: c for c in changes['changes']}
    for change in changes['changes']:
        page = ROOT / 'changes' / (change['id'] + '.md')
        example = change['example']
        capture(page, [change['when'], change['operation'],
                      'Example: ' + example['situation'],
                      '> ' + example['contribution'].replace('\n', '\n> '),
                      change['boundary'], ' · '.join(
                          f"[{by_id[s]['name']}](../subjects/{slug(by_id[s]['root'])}.md#{slug(by_id[s]['name'])})"
                          for s in change['subject_ids'])])
    capture(ROOT / 'changes/README.md', [changes['scope'], descriptions.table(
        ['When', 'Contribution'], [(c['when'], f"[{c['name']}]({c['id']}.md)")
                                   for c in changes['changes']]), changes['standing'],
        '[Select a change](../systems/mind-change-selection.md) · '
        '[Produce the contribution](../systems/mind-change-realization.md)'])
    capture(ROOT / 'README.md', [changes['objective'], descriptions.table(
        ['When', 'Use'], [(entries[k]['when'], f"[{entries[k]['name']}](changes/{k}.md)")
                         for k in changes['entry_ids']]),
        '[Further changes](changes/README.md) · [Subjects](subjects/README.md) · '
        '[Systems](systems/README.md) · [Studies](studies/README.md)',
        '[Select the needed change](systems/mind-change-selection.md) · '
        '[Produce the contribution](systems/mind-change-realization.md) · '
        '[Perspective Optimizer](https://github.com/benjam3n/perspectiveoptimizer)'])
    systems = json.loads((ROOT / 'systems/catalog.json').read_text())['systems']
    capture(ROOT / 'systems/README.md', [descriptions.table(['System', 'Description'], [
        (f"[{s['name']}]({s['id']}.md)", s['description']) for s in systems])])
    for system in systems:
        page = ROOT / system['path']
        sections = [system['description']]
        if system.get('scope'):
            sections.append(system['scope'])
        if system.get('standards'):
            sections.append(descriptions.table(['Standard', 'Requirement'], [
                (row['name'], row['requirement']) for row in system['standards']]))
        sections.append('\n'.join(
            f'{i}. {step}' for i, step in enumerate(system['steps'], 1)))
        sections.append(' · '.join(
            f"[{name}](../subjects/{slug(names[name]['root'])}.md#{slug(name)})"
            for name in system['subject_names']))
        if system['id'].startswith('mind-change-'):
            sections.append('[Conditional contributions](../changes/README.md)')
        for evidence in system.get('evidence', []):
            label = 'Repository construction' if evidence.startswith('cases/repository') else 'Case results'
            sections.append(descriptions.link(page, ROOT / evidence, label))
        if system.get('implementation'):
            target, _, symbol = system['implementation'].partition('#')
            sections.append(descriptions.link(page, ROOT / target, symbol))
        capture(page, sections)

    cases = json.loads((ROOT / 'cases/repository-construction.json').read_text())['cases']
    page = ROOT / 'cases/repository-construction.md'
    capture(page, [descriptions.table(['Subject', 'Operation', 'Result'], [
        (r['matter'], r['operation'], descriptions.link(page, ROOT / r['evidence'], r['result']))
        for r in cases]), '[Comparison record](repository-construction.json)'])
    return out


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    generated = outputs()
    stale = []
    for name, text in generated.items():
        path = ROOT / name
        if args.check:
            if not path.is_file() or path.read_text() != text:
                stale.append(name)
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(text)
    if stale:
        raise SystemExit('Outdated descriptions:\n' + '\n'.join(stale))
    print(('Verified' if args.check else 'Rendered') + f' {len(generated)} current files.')


if __name__ == '__main__':
    main()
