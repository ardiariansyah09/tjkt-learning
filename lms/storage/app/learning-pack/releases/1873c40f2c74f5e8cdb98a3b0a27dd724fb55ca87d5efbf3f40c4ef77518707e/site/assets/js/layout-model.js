export const floorObstacles=[{x1:9,y1:5,x2:13,y2:10}];
export const equalPoint=(a,b)=>a[0]===b[0]&&a[1]===b[1];
export function blockedPoint([x,y],obstacles){return obstacles.some(r=>x>=r.x1&&x<=r.x2&&y>=r.y1&&y<=r.y2);}
export function inspectRoute(points,{width=24,height=16,obstacles=floorObstacles}={}){
  let length=0;
  for(let i=0;i<points.length;i++){
    const p=points[i];if(!p.every(Number.isInteger)||p[0]<0||p[1]<0||p[0]>width||p[1]>height)return {valid:false,length,reason:'Titik di luar grid.'};
    if(blockedPoint(p,obstacles))return {valid:false,length,reason:'Jalur melewati area terlarang.'};
    if(!i)continue;const a=points[i-1],dx=p[0]-a[0],dy=p[1]-a[1];
    if(dx&&dy)return {valid:false,length,reason:'Gunakan segmen horizontal atau vertikal.'};
    const distance=Math.abs(dx)+Math.abs(dy);for(let step=1;step<=distance;step++)if(blockedPoint([a[0]+Math.sign(dx)*step,a[1]+Math.sign(dy)*step],obstacles))return {valid:false,length,reason:'Segmen memotong area terlarang.'};length+=distance;
  }
  return {valid:true,length,reason:''};
}
export function layoutEstimate(points,scale,reserve,rise=0){
  const route=inspectRoute(points);return {...route,paperCm:route.length*100/scale,cable:route.length*(1+reserve/100)+rise};
}
export const cableLevels=[
  {name:'Hindari ruang tertutup',start:[1,3],goal:[9,3],obstacles:[{x1:4,y1:2,x2:6,y2:4}],spool:14},
  {name:'Jalur melalui koridor',start:[1,1],goal:[9,5],obstacles:[{x1:4,y1:0,x2:4,y2:4}],spool:14},
  {name:'Dua area terlarang',start:[1,3],goal:[9,3],obstacles:[{x1:3,y1:2,x2:4,y2:4},{x1:6,y1:1,x2:7,y2:3}],spool:14}
];
