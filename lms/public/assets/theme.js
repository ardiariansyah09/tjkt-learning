(() => {
 const key='tjkt-theme';const media=window.matchMedia('(prefers-color-scheme: dark)');
 let choice='system';try{const saved=localStorage.getItem(key);if(['light','dark','system'].includes(saved))choice=saved;}catch{}
 function apply(){const theme=choice==='system'?(media.matches?'dark':'light'):choice;document.documentElement.dataset.bsTheme=theme;document.documentElement.style.colorScheme=theme;
  document.querySelectorAll('[data-theme-toggle]').forEach(button=>{const dark=theme==='dark';const title=dark?'Aktifkan mode terang':'Aktifkan mode gelap';button.setAttribute('aria-label',title);button.setAttribute('title',title);button.setAttribute('aria-pressed',String(dark));const icon=button.querySelector('i');if(icon)icon.className='bi '+(dark?'bi-sun':'bi-moon-stars');const label=button.querySelector('[data-theme-label]');if(label)label.textContent=dark?'Mode terang':'Mode gelap';});
  window.dispatchEvent(new CustomEvent('tjkt:theme',{detail:theme}));
 }
 window.TJKTTheme={set(value){if(!['light','dark','system'].includes(value))return;choice=value;try{localStorage.setItem(key,value);}catch{}apply();},get(){return document.documentElement.dataset.bsTheme;}};
 apply();document.addEventListener('DOMContentLoaded',apply);document.addEventListener('click',e=>{if(e.target.closest('[data-theme-toggle]'))window.TJKTTheme.set(window.TJKTTheme.get()==='dark'?'light':'dark');});
 media.addEventListener('change',()=>{if(choice==='system')apply();});window.addEventListener('storage',e=>{if(e.key===key){choice=['light','dark','system'].includes(e.newValue)?e.newValue:'system';apply();}});
})();
