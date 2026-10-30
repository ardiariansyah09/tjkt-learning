const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=path.resolve(__dirname,'..'),target=path.join(root,'lms/storage/app/learning-pack');
const digest=crypto.createHash('sha256');
const walk=(dir)=>fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name)).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);
for(const dir of ['assets','data','modules']){
 for(const source of walk(path.join(root,dir))){
  if(!/\.(js|css|json|html|svg|png|jpg|webp|woff2)$/.test(source))continue;
  const relative=path.relative(root,source),dest=path.join(target,'site',relative),bytes=fs.readFileSync(source);
  fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,bytes);
  digest.update(relative.replaceAll('\\','/'));digest.update(bytes);
 }
}
const manifest=JSON.parse(fs.readFileSync(path.join(target,'manifest.json'),'utf8').replace(/^\uFEFF/,''));
const contentVersion=digest.digest('hex');for(const entry of manifest)entry.contentVersion=contentVersion;
fs.writeFileSync(path.join(target,'manifest.json'),JSON.stringify(manifest,null,2));
fs.copyFileSync(path.join(root,'lms/resources/js/lms-bridge.js'),path.join(target,'site/assets/lms-bridge.js'));
const release=path.join(target,'releases',contentVersion,'site');
if(fs.existsSync(release)){
 for(const source of walk(path.join(target,'site'))){
  const dest=path.join(release,path.relative(path.join(target,'site'),source));
  if(!fs.existsSync(dest)||!fs.readFileSync(dest).equals(fs.readFileSync(source)))throw Error('Existing release differs. Build a new content version instead of overwriting it.');
 }
}else fs.cpSync(path.join(target,'site'),release,{recursive:true});
console.log(`Prepared ${manifest.length} modules; ${manifest.reduce((n,m)=>n+m.stages.length,0)} stages; content ${contentVersion.slice(0,12)}.`);
