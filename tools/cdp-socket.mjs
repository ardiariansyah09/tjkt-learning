// Minimal local CDP WebSocket transport for Windows Node environments.
import net from 'node:net';
import crypto from 'node:crypto';
import {EventEmitter} from 'node:events';
export async function openCDPSocket(address){
 const u=new URL(address),events=new EventEmitter();let buffer=Buffer.alloc(0),handshaken=false,fragments=[];
 const socket=net.createConnection({host:u.hostname,port:Number(u.port)});
 const send=(payload,opcode=1)=>{const body=Buffer.from(payload),mask=crypto.randomBytes(4);let header;
  if(body.length<126)header=Buffer.from([0x80|opcode,0x80|body.length]);
  else if(body.length<65536){header=Buffer.alloc(4);header[0]=0x80|opcode;header[1]=0xfe;header.writeUInt16BE(body.length,2);}
  else{header=Buffer.alloc(10);header[0]=0x80|opcode;header[1]=0xff;header.writeBigUInt64BE(BigInt(body.length),2);}
  const encoded=Buffer.alloc(body.length);for(let i=0;i<body.length;i++)encoded[i]=body[i]^mask[i%4];socket.write(Buffer.concat([header,mask,encoded]));
 };
 await new Promise((resolve,reject)=>{
  socket.on('error',reject);socket.on('connect',()=>socket.write(`GET ${u.pathname} HTTP/1.1\r\nHost: ${u.host}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: ${crypto.randomBytes(16).toString('base64')}\r\nSec-WebSocket-Version: 13\r\n\r\n`));
  socket.on('data',data=>{
   buffer=Buffer.concat([buffer,data]);
   if(!handshaken){const end=buffer.indexOf('\r\n\r\n');if(end<0)return;const head=buffer.subarray(0,end).toString();if(!head.includes('101'))return reject(Error(head));buffer=buffer.subarray(end+4);handshaken=true;resolve();}
   while(buffer.length>=2){const first=buffer[0],second=buffer[1];let size=second&127,offset=2;if(size===126){if(buffer.length<4)return;size=buffer.readUInt16BE(2);offset=4;}else if(size===127){if(buffer.length<10)return;size=Number(buffer.readBigUInt64BE(2));offset=10;}if(second&128)offset+=4;if(buffer.length<offset+size)return;const body=buffer.subarray(offset,offset+size);buffer=buffer.subarray(offset+size);const opcode=first&15;if(opcode===9){send(body,10);continue;}if(opcode===8){socket.end();return;}if(opcode===1||opcode===0){fragments.push(body);if(first&128){events.emit('message',{data:Buffer.concat(fragments).toString()});fragments=[];}}}
  });
 });
 return {send,close:()=>socket.destroy(),addEventListener:(name,callback)=>events.on(name,callback)};
}
