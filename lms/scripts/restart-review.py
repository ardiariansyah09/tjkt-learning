import os,signal,subprocess,time
from pathlib import Path
root=Path('/home/adminnazh/tjkt-lms-review-20261028')
pidfile=root/'review.pid'
if pidfile.exists():
    pid=int(pidfile.read_text())
    try:
        cmd=Path(f'/proc/{pid}/cmdline').read_bytes()
        if b'127.0.0.1:18087' not in cmd: raise RuntimeError('Unexpected review process')
        os.kill(pid,signal.SIGTERM)
        time.sleep(1)
    except FileNotFoundError: pass
subprocess.run(['sh','scripts/start-review.sh'],cwd=root,check=True)
