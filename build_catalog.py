#!/usr/bin/env python3
from pathlib import Path
from html.parser import HTMLParser
import json

ROOT = Path(__file__).resolve().parent
EXTERNAL = ROOT / 'data' / 'external-resources.json'
OUT = ROOT / 'data' / 'resources.json'
OUT_JS = ROOT / 'assets' / 'js' / 'resources-data.js'

class MetaParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.meta = {}
        self.in_title = False
        self.title_parts = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag.lower() == 'meta':
            name = attrs.get('name','')
            if name.startswith('materialbank:'):
                self.meta[name.split(':',1)[1]] = attrs.get('content','').strip()
        elif tag.lower() == 'title':
            self.in_title = True
    def handle_endtag(self, tag):
        if tag.lower() == 'title': self.in_title = False
    def handle_data(self, data):
        if self.in_title: self.title_parts.append(data)

def split(v):
    return [x.strip() for x in (v or '').split(',') if x.strip()]

def boolv(v):
    return str(v).strip().lower() in {'1','true','yes','ja'}

def scan_page(path):
    parser = MetaParser()
    parser.feed(path.read_text(encoding='utf-8'))
    m = parser.meta
    if not m.get('id'): return None
    rel = path.relative_to(ROOT).as_posix()
    title = ''.join(parser.title_parts).strip().split('·')[0].strip()
    return {
        'id': m['id'],
        'type': m.get('type','guide'),
        'title': title,
        'summary': m.get('summary',''),
        'url': rel,
        'topics': split(m.get('topics')),
        'platforms': split(m.get('platforms')),
        'level': m.get('level','kom-igang'),
        'intents': split(m.get('intents')),
        'duration': int(m.get('duration','5') or 5),
        'keywords': split(m.get('keywords')),
        'featured': boolv(m.get('featured')),
        'status': m.get('status','published'),
        'recommendedBefore': split(m.get('recommended-before')),
        'source': 'github-pages',
        'format': 'webbguide' if m.get('type','guide') != 'case' else 'case'
    }

resources=[]
for p in ROOT.rglob('*.html'):
    rel=p.relative_to(ROOT).as_posix()
    if rel.startswith('.git/') or rel == 'hitta.html': continue
    item=scan_page(p)
    if item: resources.append(item)

if EXTERNAL.exists():
    ext=json.loads(EXTERNAL.read_text(encoding='utf-8'))
    if not isinstance(ext,list): raise SystemExit('data/external-resources.json must contain a JSON array')
    resources.extend(ext)

resources.sort(key=lambda x:(0 if x.get('featured') else 1, x.get('type',''), x.get('title','').lower()))
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(json.dumps(resources, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
OUT_JS.parent.mkdir(parents=True, exist_ok=True)
OUT_JS.write_text('window.MATERIALBANK_RESOURCES = ' + json.dumps(resources, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
print(f'Wrote {len(resources)} resources to {OUT.relative_to(ROOT)} and {OUT_JS.relative_to(ROOT)}')
