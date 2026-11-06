import json,subprocess,os
from pathlib import Path
ROOT=Path('/home/adminnazh/tjkt-lms-review-20261028');runtime=ROOT/'runtime/bird-config-check';runtime.mkdir(exist_ok=True)
binary=runtime/'extracted/usr/sbin/bird'
if not binary.exists():
 subprocess.run(['apt-get','download','bird2'],cwd=runtime,check=True)
 package=next(runtime.glob('bird2_*.deb'));subprocess.run(['dpkg-deb','-x',str(package),str(runtime/'extracted')],check=True)
if not (runtime/'extracted/usr/lib/x86_64-linux-gnu/libssh-gcrypt.so.4').exists():
 subprocess.run(['apt-get','download','libssh-gcrypt-4'],cwd=runtime,check=True)
 for package in runtime.glob('libssh-gcrypt-4_*.deb'):subprocess.run(['dpkg-deb','-x',str(package),str(runtime/'extracted')],check=True)
env=dict(os.environ,LD_LIBRARY_PATH=str(runtime/'extracted/usr/lib/x86_64-linux-gnu'))
version=subprocess.run([str(binary),'--version'],capture_output=True,text=True,check=True,env=env)
records=[]
for name in ['bird-r1.conf','bird-r2.conf']:
 result=subprocess.run([str(binary),'-p','-c',str(ROOT/'scripts/fixtures'/name)],capture_output=True,text=True,env=env)
 if result.returncode:raise RuntimeError(name+': '+result.stdout+result.stderr)
 records.append({'file':name,'syntaxValid':True})
report={'result':'PASS','version':(version.stdout+version.stderr).strip(),'configs':records,'scope':'Configuration parser only; no daemon started, no system package installed, no routes changed.'}
(ROOT/'storage/app/review-artifacts/bird-config-validation.json').write_text(json.dumps(report,indent=2));print(json.dumps(report))
