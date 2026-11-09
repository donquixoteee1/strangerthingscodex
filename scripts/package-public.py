"""Allowlisted source release: no original reference, local logs, profiles or parent workspace."""
from pathlib import Path
import json, zipfile, shutil, hashlib
root=Path(__file__).resolve().parents[1]
release=root/'release'; release.mkdir(exist_ok=True)
files=[]
for folder in ['src','public','.github','tests']:
 files.extend(p for p in (root/folder).rglob('*') if p.is_file() and p.name!='.DS_Store')
for name in ['README.md','.gitignore','package.json','package-lock.json','tsconfig.json','vite.config.ts','vitest.config.ts','playwright.config.ts','docs/INSTALL.md','scripts/build-native.mjs','scripts/doctor.mjs','scripts/prepare-assets.py','scripts/reference-alphabet.py','scripts/requirements.txt','scripts/package-public.py']:
 files.append(root/name)
# Keep optional performance tooling reproducible without distributing local measurements.
for p in (root/'scripts').glob('*.mjs'):
 if p not in files:files.append(p)
manifest=[]
with zipfile.ZipFile(release/'strangerthingscodex-source.zip','w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(files):
  rel=p.relative_to(root).as_posix();b=p.read_bytes()
  if str(Path.home()).encode() in b:raise ValueError('Personal path in '+rel)
  z.writestr('strangerthingscodex/'+rel,b)
  manifest.append({'path':rel,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()})
(release/'source-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
with zipfile.ZipFile(release/'strangerthingscodex-preview-and-bridge.zip','w',zipfile.ZIP_DEFLATED) as z:
 for folder in ['dist','native-dist']:
  for p in (root/folder).rglob('*'):
   if p.is_file():z.write(p,p.relative_to(root))
 z.write(root/'docs/INSTALL.md','INSTALL.md')
print(f'Packaged {len(files)} reviewed source files; original reference and local artifacts excluded.')
