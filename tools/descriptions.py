import os
from pathlib import Path

def cell(value):
    return str(value).replace('|', '\\|').replace('\n', ' ')

def table(headers, rows):
    return '\n'.join(['| ' + ' | '.join(headers) + ' |', '|' + '|'.join('---' for _ in headers) + '|'] + ['| ' + ' | '.join(cell(value) for value in row) + ' |' for row in rows]) + '\n'

def write(path, sections):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text('\n\n'.join(s.strip() for s in sections if s.strip()) + '\n')

def link(source, target, label):
    return '[' + label + '](' + os.path.relpath(target, source.parent) + ')'
