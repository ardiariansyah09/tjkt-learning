const root=document.getElementById('pdf-reader');
const status=document.getElementById('pdf-status');
try {
 const lib=await import(new URL('build/pdf.mjs',root.dataset.assets).href);
 lib.GlobalWorkerOptions.workerSrc=new URL('build/pdf.worker.mjs',root.dataset.assets).href;
 const response=await fetch(root.dataset.url,{credentials:'same-origin',headers:{Accept:'application/pdf'}});
 if(!response.ok)throw new Error(response.status===403?'Anda tidak berhak melihat bukti ini.':'Berkas tidak dapat dimuat. Periksa sesi login dan coba kembali.');
 const loading=lib.getDocument({data:new Uint8Array(await response.arrayBuffer()),cMapUrl:new URL('cmaps/',root.dataset.assets).href,cMapPacked:true,standardFontDataUrl:new URL('standard_fonts/',root.dataset.assets).href,wasmUrl:new URL('wasm/',root.dataset.assets).href,isEvalSupported:false,enableXfa:false});
 const pdf=await loading.promise;
 let current=1,tail=Promise.resolve();
 const pageInput=document.getElementById('pdf-page'),zoom=document.getElementById('pdf-zoom');
 const canvas=document.getElementById('pdf-canvas'),surface=document.getElementById('pdf-surface');
 document.getElementById('pdf-total').textContent=`/ ${pdf.numPages}`;pageInput.max=pdf.numPages;
 async function render(){
  root.dataset.rendered='false';const page=await pdf.getPage(current);const natural=page.getViewport({scale:1});
  const scale=zoom.value==='fit'?Math.max(.2,(surface.clientWidth-28)/natural.width):Number(zoom.value);
  const viewport=page.getViewport({scale});const density=Math.min(window.devicePixelRatio||1,2);
  canvas.width=Math.ceil(viewport.width*density);canvas.height=Math.ceil(viewport.height*density);canvas.style.width=`${viewport.width}px`;canvas.style.height=`${viewport.height}px`;
  await page.render({canvasContext:canvas.getContext('2d'),viewport,transform:density===1?null:[density,0,0,density,0,0]}).promise;
  const text=await page.getTextContent();document.getElementById('pdf-text').textContent=text.items.map(i=>i.str).join(' ');
  pageInput.value=current;document.getElementById('pdf-prev').disabled=current===1;document.getElementById('pdf-next').disabled=current===pdf.numPages;pageInput.disabled=false;zoom.disabled=false;
  canvas.setAttribute('aria-label',`Halaman ${current} dari ${pdf.numPages}`);status.textContent=`Halaman ${current} dari ${pdf.numPages}`;root.dataset.rendered='true';
 }
 function queue(fn){tail=tail.then(()=>{fn();return render();}).catch(e=>{status.textContent='PDF tidak dapat ditampilkan: '+e.message;});}
 document.getElementById('pdf-prev').addEventListener('click',()=>queue(()=>{current=Math.max(1,current-1);}));
 document.getElementById('pdf-next').addEventListener('click',()=>queue(()=>{current=Math.min(pdf.numPages,current+1);}));
 pageInput.addEventListener('change',()=>queue(()=>{current=Math.min(pdf.numPages,Math.max(1,Number(pageInput.value)||1));}));zoom.addEventListener('change',()=>queue(()=>{}));
 let resize;window.addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(()=>{if(zoom.value==='fit')queue(()=>{});},150);});
 await render();
}catch(e){status.textContent='Pratinjau belum dapat dibuka: '+(e.message||'PDF tidak valid atau dilindungi password.');root.dataset.error='true';}
