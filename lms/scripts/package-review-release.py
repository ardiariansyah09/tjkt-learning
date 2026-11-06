"""Prepare a production patch for review, without deploying or reading secrets."""
import hashlib,json,tarfile
from pathlib import Path
ROOT=Path('/home/adminnazh/tjkt-lms-review-20261028')
ARCHIVE=Path('/home/adminnazh/tjkt-lms-source-review.tar.gz')
def sha(data):return hashlib.sha256(data).hexdigest()
with tarfile.open(ARCHIVE) as archive:
    baseline={member.name:sha(archive.extractfile(member).read()) for member in archive.getmembers() if member.isfile()}
changes=[]
for dirname in ['app','routes','resources','database/migrations','storage/app/learning-pack/releases','storage/app/learning-pack/definitions']:
    for file in sorted((ROOT/dirname).rglob('*')):
        if not file.is_file():continue
        name=file.relative_to(ROOT).as_posix();digest=sha(file.read_bytes())
        if baseline.get(name)!=digest:changes.append({'path':name,'before':baseline.get(name),'after':digest})
manifest=ROOT/'storage/app/learning-pack/manifest.json'
changes.append({'path':manifest.relative_to(ROOT).as_posix(),'before':None,'after':sha(manifest.read_bytes())})
conflicts=[]
production=Path('/var/www/tjkt-learning')
for change in changes:
    target=production/change['path']
    actual=sha(target.read_bytes()) if target.is_file() else None
    if actual!=change['before']:conflicts.append(change['path'])
out=ROOT/'storage/app/review-artifacts';out.mkdir(parents=True,exist_ok=True)
(out/'release-manifest.json').write_text(json.dumps({'changes':changes,'notDeployed':True,'productionConflicts':conflicts},indent=2))
with tarfile.open(out/'lms-production-patch.tar.gz','w:gz') as archive:
    for change in changes:archive.add(ROOT/change['path'],arcname=change['path'])
print('Prepared review patch:',len(changes),'files. No production changes made.')
if conflicts:raise RuntimeError('Production files changed; review conflicts before activation: '+', '.join(conflicts))
