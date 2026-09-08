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
    systems = json.loads((ROOT / 'systems/catalog.json').read_text())['systems']
    capture(ROOT / 'systems/README.md', [descriptions.table(['System', 'Description'], [
        (f"[{s['name']}]({s['id']}.md)", s['description']) for s in systems])])
    for system in systems:
        page = ROOT / system['path']
        sections = [system['description'], '\n'.join(
            f'{i}. {step}' for i, step in enumerate(system['steps'], 1))]
        sections.append(' · '.join(
            f"[{name}](../subjects/{slug(names[name]['root'])}.md#{slug(name)})"
            for name in system['subject_names']))
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
