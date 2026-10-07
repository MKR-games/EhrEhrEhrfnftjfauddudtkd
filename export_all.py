"""Sequential resumable export; invalidate cached segments when sources change."""
from pathlib import Path
import hashlib,json,subprocess,sys,os
ROOT=Path(__file__).resolve().parent
OUT=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else ROOT/'dist'
OUT.mkdir(parents=True,exist_ok=True)
PARTS=ROOT/'parts';PARTS.mkdir(exist_ok=True)
fingerprint=hashlib.sha256(b''.join((ROOT/p).read_bytes() for p in ['src/engine.js','src/storyboard.js','render.mjs'])+os.environ.get('RENDER_WIDTH','1920').encode()).hexdigest()
manifest_path=PARTS/'state.json'
state=json.loads(manifest_path.read_text()) if manifest_path.exists() else {}
if state.get('fingerprint')!=fingerprint:state={'fingerprint':fingerprint,'segments':{}}
parts=[]
for start in range(0,300,30):
    dest=PARTS/f'part_{start:03d}.mp4'
    valid=False
    if dest.exists() and state['segments'].get(str(start)):
        result=subprocess.run(['ffprobe','-v','error','-select_streams','v:0','-show_entries','stream=nb_frames,duration,r_frame_rate','-of','json',str(dest)],capture_output=True,text=True)
        if result.returncode==0:
            st=json.loads(result.stdout).get('streams',[{}])[0]
            valid=st.get('nb_frames')=='900' and st.get('r_frame_rate')=='30/1' and abs(float(st.get('duration',0))-30)<.01
    if not valid:
        subprocess.run(['node',str(ROOT/'render.mjs'),'render',str(start),'30',str(dest)],check=True)
        state['segments'][str(start)]=True;manifest_path.write_text(json.dumps(state,indent=2))
    parts.append(dest);print(f'Completed {start+30}/300 seconds',flush=True)
concat=PARTS/'concat.txt';concat.write_text('\n'.join("file '"+str(p)+"'" for p in parts))
dest=OUT/'똑똑똑_룰영상_5분.mp4'
subprocess.run(['ffmpeg','-v','error','-xerror','-y','-f','concat','-safe','0','-i',str(concat),'-i',str(ROOT/'audio/soundtrack.m4a'),'-map','0:v:0','-map','1:a:0','-c','copy','-t','300','-movflags','+faststart',str(dest)],check=True)
print(dest,flush=True)
