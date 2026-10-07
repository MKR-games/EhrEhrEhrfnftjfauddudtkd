import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const require=createRequire(import.meta.url);
const canvasModule=process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES?path.join(process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES,'@napi-rs/canvas'):'@napi-rs/canvas';
const {createCanvas,GlobalFonts}=require(canvasModule);
GlobalFonts.registerFromPath(path.join(here,'fonts/Pretendard-Regular.ttf'),'Pretendard');
GlobalFonts.registerFromPath(path.join(here,'fonts/Pretendard-Bold.ttf'),'Pretendard');
await import('./src/storyboard.js');await import('./src/engine.js');
const D=globalThis.TTOK_RULES, R=globalThis.TTOK_RENDER;
const mode=process.argv[2]||'preview';
if(mode==='preview'){
 const canvas=createCanvas(1280,720),ctx=canvas.getContext('2d');
 fs.mkdirSync(path.join(here,'preview'),{recursive:true});
 for(let i=0;i<30;i++){R.render(ctx,i*10+6.75);fs.writeFileSync(path.join(here,`preview/shot_${String(i+1).padStart(2,'0')}.png`),canvas.toBuffer('image/png'));}
 for(const at of [111,113,115,131,132.5,133.5,171,174,177,181,184,187]){R.render(ctx,at);fs.writeFileSync(path.join(here,`preview/motion_${at}.png`),canvas.toBuffer('image/png'));}
 console.log('Rendered 30 storyboard frames and 12 motion samples.');
}else if(mode==='render'){
 const start=Number(process.argv[3]||0),length=Number(process.argv[4]||30),dest=process.argv[5]||path.join(here,`part_${start}.mp4`);
 const width=Number(process.env.RENDER_WIDTH||1920),height=width*9/16;
 const canvas=createCanvas(width,height),ctx=canvas.getContext('2d');
 const frames=Math.round(length*D.fps);
 const ff=spawn('ffmpeg',['-v','error','-y','-f','rawvideo','-pixel_format','rgba','-video_size',`${width}x${height}`,'-framerate',String(D.fps),'-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-threads','2','-movflags','+faststart',dest],{stdio:['pipe','inherit','inherit']});
 let pipeError=null;ff.stdin.on('error',e=>{pipeError=e;});
 const closed=once(ff,'close');
 for(let i=0;i<frames;i++){
  if(pipeError)throw pipeError;R.render(ctx,start+i/D.fps);const raw=canvas.data();
  if(!ff.stdin.write(raw))await once(ff.stdin,'drain');
 }
 ff.stdin.end();const [code,signal]=await closed;if(code!==0||signal)throw new Error(`FFmpeg failed: code=${code} signal=${signal}`);
 console.log(JSON.stringify({dest,start,duration:length,frames,width,height}));
}else throw new Error('Usage: node render.mjs preview | render START LENGTH OUTPUT');
