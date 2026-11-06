// Perspective projection of actual 3D cube meshes, with depth sorting and picking.
// Canvas renderer avoids external dependencies and supports devices without WebGL.
export function createScene(canvas, nodes, edges, onSelect, stacked=false) {
  const ctx=canvas.getContext('2d');
  const positions=stacked ? nodes.map((_,i)=>[0,(i-1.5)*1.25,0]) : [[-2,0,1],[0,0,0],[2,0,1],[0,0,-2]];
  const colors=['#38bdf8','#2dd4bf','#fbbf24','#c084fc'];
  const faces=[[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[0,3,7,4],[1,5,6,2]];
  const corners=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
  let angle=.55,pitch=-.35,distance=8,selected=-1,width=800,height=350,hitFaces=[],drag=null,animation=0;
  const project=([x,y,z])=>{
    const rx=x*Math.cos(angle)+z*Math.sin(angle),rz=-x*Math.sin(angle)+z*Math.cos(angle);
    const ry=y*Math.cos(pitch)-rz*Math.sin(pitch),depth=y*Math.sin(pitch)+rz*Math.cos(pitch)+distance;
    const scale=Math.min(width,height*2)*.8/depth;
    return {x:width/2+rx*scale,y:height/2+ry*scale,z:depth};
  };
  function draw(packet=null){
    const dark=document.body.classList.contains('dark');
    ctx.clearRect(0,0,width,height);
    ctx.fillStyle=dark?'#101e32':'#edf6fc';ctx.fillRect(0,0,width,height);
    ctx.strokeStyle=dark?'#2a4561':'#c9dfed';ctx.lineWidth=1;
    for(let i=-4;i<=4;i++){const a=project([i,1,-4]),b=project([i,1,4]),c=project([-4,1,i]),d=project([4,1,i]);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.moveTo(c.x,c.y);ctx.lineTo(d.x,d.y);ctx.stroke();}
    ctx.strokeStyle='#4296bb';ctx.lineWidth=4;
    edges.forEach(([a,b])=>{const p=project(positions[a]),q=project(positions[b]);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(q.x,q.y);ctx.stroke();});
    const polygons=[];
    nodes.forEach((node,index)=>{
      const origin=positions[index];
      const vertices=corners.map(corner=>project(corner.map((value,axis)=>origin[axis]+value*.42)));
      faces.forEach((face,faceIndex)=>polygons.push({index,faceIndex,points:face.map(i=>vertices[i]),depth:face.reduce((sum,i)=>sum+vertices[i].z,0)/4}));
    });
    polygons.sort((a,b)=>b.depth-a.depth);hitFaces=polygons;
    polygons.forEach(({index,faceIndex,points})=>{ctx.beginPath();points.forEach((point,i)=>i?ctx.lineTo(point.x,point.y):ctx.moveTo(point.x,point.y));ctx.closePath();ctx.fillStyle=colors[index];ctx.globalAlpha=.65+faceIndex*.05;ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=index===selected?'#f97316':dark?'#e0f2fe':'#164e63';ctx.lineWidth=index===selected?3:1;ctx.stroke();});
    nodes.forEach((node,index)=>{const p=project(positions[index]);ctx.font='600 13px Segoe UI';ctx.textAlign='center';const label=`${index+1}. ${node.label}`;const length=ctx.measureText(label).width;ctx.fillStyle=dark?'#142238':'#fff';ctx.fillRect(p.x-length/2-7,p.y+34,length+14,24);ctx.fillStyle=dark?'#e2e8f0':'#102a43';ctx.fillText(label,p.x,p.y+51);});
    if(packet){const p=project(packet);ctx.fillStyle='#f97316';ctx.beginPath();ctx.arc(p.x,p.y,9,0,Math.PI*2);ctx.fill();}
  }
  function resize(){const bounds=canvas.getBoundingClientRect();if(!bounds.width)return;width=bounds.width;height=Math.max(280,Math.min(380,width*.5));const ratio=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);canvas.style.height=`${height}px`;ctx.setTransform(ratio,0,0,ratio,0,0);draw();}
  function inside(x,y,points){let result=false;for(let i=0,j=points.length-1;i<points.length;j=i++){const a=points[i],b=points[j];if((a.y>y)!==(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)result=!result;}return result;}
  canvas.addEventListener('pointerdown',event=>{drag={x:event.clientX,y:event.clientY,lastX:event.clientX,lastY:event.clientY};canvas.setPointerCapture(event.pointerId);});
  canvas.addEventListener('pointermove',event=>{if(!drag)return;angle+=(event.clientX-drag.lastX)*.009;pitch=Math.max(-1.1,Math.min(.7,pitch+(event.clientY-drag.lastY)*.007));drag.lastX=event.clientX;drag.lastY=event.clientY;draw();});
  canvas.addEventListener('pointerup',event=>{if(!drag)return;const moved=Math.hypot(event.clientX-drag.x,event.clientY-drag.y);drag=null;if(moved>6)return;const rect=canvas.getBoundingClientRect();const hit=[...hitFaces].reverse().find(face=>inside(event.clientX-rect.left,event.clientY-rect.top,face.points));if(hit)select(hit.index);});
  canvas.addEventListener('pointercancel',()=>{drag=null;});
  canvas.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();if(event.key==='ArrowLeft')angle-=.15;if(event.key==='ArrowRight')angle+=.15;if(event.key==='ArrowUp')pitch=Math.max(-1.1,pitch-.1);if(event.key==='ArrowDown')pitch=Math.min(.7,pitch+.1);draw();}else if(/^[1-4]$/.test(event.key))select(Number(event.key)-1);});
  function select(index){selected=index;draw();onSelect(index);}
  const observer=new ResizeObserver(resize);observer.observe(canvas);
  const themeObserver=new MutationObserver(()=>draw());themeObserver.observe(document.body,{attributes:true,attributeFilter:['class']});
  resize();
  return {select,rotate(delta){angle+=delta;draw();},zoom(value){distance=Number(value);draw();},reset(){angle=.55;pitch=-.35;distance=8;selected=-1;draw();},
    animate(){cancelAnimationFrame(animation);if(matchMedia('(prefers-reduced-motion: reduce)').matches){draw();return;}const start=performance.now();const frame=now=>{const phase=(now-start)/1800;if(phase>=1){draw();return;}const edge=edges[Math.min(edges.length-1,Math.floor(phase*edges.length))];const t=(phase*edges.length)%1;draw(positions[edge[0]].map((value,axis)=>value+(positions[edge[1]][axis]-value)*t));animation=requestAnimationFrame(frame);};animation=requestAnimationFrame(frame);}
  };
}
