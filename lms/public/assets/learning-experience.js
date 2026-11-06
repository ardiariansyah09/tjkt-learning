(() => {
 document.querySelectorAll('[data-evidence-check]').forEach(box => {
  box.querySelector('[data-evidence-submit]').addEventListener('click',()=>{
   const choice=box.querySelector('input:checked');
   box.querySelector('[data-evidence-feedback]').textContent=!choice?'Pilih jawaban terlebih dahulu.':choice.value==='fact'?'Tepat. Keberhasilan LAB-08 adalah hasil pengamatan. Penyebab gangguan LAB-07 masih perlu diperiksa.':'Coba lagi. Hasil pengamatan tidak membuktikan router rusak. Pisahkan bukti dari dugaan penyebab.';
  });
 });
})();
