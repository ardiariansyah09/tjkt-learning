from pathlib import Path
import sys, shutil
root=Path(__file__).resolve().parent
html=root/'modules/dasar-jaringan/pengenalan-jaringan/index.html'
js=root/'assets/js/client-server-simulator.js'
source=root/'assets/js/client-server-simulator-stage9.js'
if not html.exists() or not js.exists():
    sys.exit('ERROR: Jalankan dari folder utama proyek tjkt-learning; HTML atau JS simulator belum ditemukan.')
s=html.read_text(encoding='utf-8')
old="function passed(i){return !!state.passed[lessons[i].id]}"
new="function passed(i){return !!state.passed[lessons[i].id] && (i!==4 || clientServerPassed())}"
anchor="function unlocked(i){return i===0||passed(i-1)}"
helper="function clientServerPassed(){try{const d=JSON.parse(localStorage.getItem('tjkt:client-server-sim:v1')||'{}');return Number(d.best||0)>=75}catch{return false}}"
if new not in s:
    if old not in s or anchor not in s:sys.exit('ERROR: Struktur fungsi passed/unlocked berubah. Tidak ada file yang ditimpa. Periksa manual.')
    s=s.replace(old,helper+new,1)
old2="save();drawNav();$('next').disabled=!passed(current)||current===lessons.length-1;"
new2="save();drawNav();$('next').disabled=!passed(current)||current===lessons.length-1;"
if old2 not in s:sys.exit('ERROR: Fungsi complete berubah. Tidak ada file yang ditimpa.')
# Keep original lesson-5 theory score in state.passed. Add a clear waiting status after grading.
if 'function clientServerNotice()' not in s:
    needle='function drawNav(){'
    if needle not in s:sys.exit('ERROR: Fungsi drawNav tidak ditemukan.')
    s=s.replace(needle,"function clientServerNotice(){if(current!==4)return;const theory=!!state.passed[lessons[4].id];const practical=clientServerPassed();$('status').textContent=theory?(practical?'✓ Evaluasi teori dan praktik Client–Server lulus. Materi berikutnya terbuka.':'✓ Teori lulus. Selesaikan praktik Client–Server dengan nilai minimal 75 untuk membuka materi berikutnya.'):'Kerjakan evaluasi teori dan praktik Client–Server (masing-masing minimal 75).';$('status').className='feedback '+(theory&&practical?'success':'');}\n"+needle,1)
    # Apply after existing status setting on render and complete; notice function is declared before drawNav
    s=s.replace("save();drawNav();$('next').disabled=!passed(current)||current===lessons.length-1;","save();drawNav();clientServerNotice();$('next').disabled=!passed(current)||current===lessons.length-1;",1)
    s=s.replace("$('next').disabled=!passed(current)||current===lessons.length-1;selection=null;","$('next').disabled=!passed(current)||current===lessons.length-1;clientServerNotice();selection=null;",1)
    needle="$('next').onclick=()=>"
    if needle not in s:sys.exit('ERROR: Tombol navigasi tidak ditemukan.')
    s=s.replace(needle,"window.addEventListener('tjkt:client-server-graded',()=>{drawNav();clientServerNotice();$('next').disabled=!passed(current)||current===lessons.length-1;});"+needle,1)
if "localStorage.removeItem('tjkt:client-server-sim:v1')" not in s:
    s=s.replace("localStorage.removeItem(KEY);location.reload()","localStorage.removeItem(KEY);localStorage.removeItem('tjkt:client-server-sim:v1');location.reload()",1)
if "tjkt:client-server-graded" not in source.read_text(encoding='utf-8'):
    sys.exit('ERROR: File simulator Tahap 9 tidak valid.')
shutil.copy2(html,html.with_suffix('.html.bak-stage9'))
shutil.copy2(js,js.with_suffix('.js.bak-stage9'))
html.write_text(s,encoding='utf-8')
shutil.copy2(source,js)
print('BERHASIL: Progres pembahasan 5 memerlukan nilai teori dan praktik >=75. Backup .bak-stage9 tersedia.')
