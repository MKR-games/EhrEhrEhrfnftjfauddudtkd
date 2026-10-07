"""Original procedural score and Foley. No speech, samples or reference audio.
96 BPM, 120 bars, exactly 300 seconds. numpy + scipy + FFmpeg.
"""
from pathlib import Path
import numpy as np
from scipy.signal import lfilter
import wave,subprocess,json

ROOT=Path(__file__).resolve().parent
SR=48000; DURATION=300; BEAT=60/96
rng=np.random.default_rng(2000)
music=np.zeros((SR*DURATION,2),np.float32)
fx=np.zeros_like(music)
events=[]

def hz(midi): return 440*2**((midi-69)/12)
def add(dest,sig,at,pan=0):
    start=round(at*SR);n=min(len(sig),len(dest)-start)
    if start<0 or n<=0:return
    left=np.cos((pan+1)*np.pi/4);right=np.sin((pan+1)*np.pi/4)
    dest[start:start+n,0]+=sig[:n]*left;dest[start:start+n,1]+=sig[:n]*right

def pluck(midi,dur=1.6,vel=.1):
    t=np.arange(int(dur*SR))/SR;f=hz(midi)
    sig=np.sin(2*np.pi*f*t)*np.exp(-t*3.9)
    sig+=.26*np.sin(2*np.pi*f*2.004*t)*np.exp(-t*7.4)
    sig+=.13*np.sin(2*np.pi*f*3.97*t)*np.exp(-t*13)
    sig*=np.minimum(1,t/.003)*vel
    return sig.astype(np.float32)

def bass(midi):
    t=np.arange(int(1.1*SR))/SR;f=hz(midi)
    env=(1-np.exp(-t*100))*np.exp(-t*3.5)
    return ((np.sin(2*np.pi*f*t)+.18*np.sin(2*np.pi*f*2*t))*env*.12).astype(np.float32)

def brushed():
    n=int(.07*SR);t=np.arange(n)/SR
    nse=rng.normal(0,1,n);nse=np.r_[0,np.diff(nse)]
    return (nse*np.exp(-t*85)*.01).astype(np.float32)

def pad(notes,dur=5.6):
    t=np.arange(int(dur*SR))/SR;sig=np.zeros(len(t),np.float64)
    env=np.minimum(t/.8,1)*np.minimum((dur-t)/1.3,1)
    for m in notes:
        f=hz(m)
        sig+=(np.sin(2*np.pi*f*t)+.37*np.sin(2*np.pi*f*.998*t)+.15*np.sin(2*np.pi*f*2*t))*.008
    return (sig*env).astype(np.float32)

chords=[(38,[50,57,62,65,69]),(34,[46,53,58,62,65]),(31,[43,50,55,58,62]),(33,[45,52,57,61,64])]
for bar in range(120):
    base=bar*4*BEAT; root,notes=chords[(bar//2)%4]
    section=bar//4
    dynamic=.65 if section in (9,19,20,28) else 1.
    if bar%2==0:
        add(music,pad(notes[:3]),base,-.18)
        add(music,pad([m+12 for m in notes[:2]])*.5,base+.025,.25)
    for b in (0,2):add(music,bass(root)*dynamic,base+b*BEAT,0)
    pattern=[(0,0),(1.5,2),(2.5,3),(3.5,1)] if bar%2==0 else [(0.5,1),(1.5,3),(2.75,2)]
    for beat,i in pattern:
        sig=pluck(notes[i]+12,vel=.095*dynamic)
        add(music,sig,base+beat*BEAT,(-1 if i%2 else 1)*.32)
        add(music,sig*.16,base+beat*BEAT+.21,.35)
        add(music,sig*.07,base+beat*BEAT+.43,-.4)
    if section not in (0,29):
        for b in (.5,1.5,2.5,3.5):add(music,brushed()*dynamic,base+b*BEAT,.2 if b%2 else -.2)

def knock(at,vel=1):
    dur=.6;t=np.arange(int(dur*SR))/SR
    body=(np.sin(2*np.pi*175*t)+.52*np.sin(2*np.pi*397*t)+.25*np.sin(2*np.pi*791*t))*np.exp(-t*34)
    body+=rng.normal(0,.4,len(t))*np.exp(-t*160)
    sig=body*np.minimum(t/.0007,1)*.3*vel
    add(fx,sig,at);add(fx,sig*.16,at+.10,-.2);add(fx,sig*.07,at+.23,.25)
    events.append({'time':at,'type':'knock'})

def tap(at,pan=0):
    t=np.arange(int(.18*SR))/SR
    sig=(rng.normal(0,1,len(t))*.3*np.exp(-t*180)+np.sin(2*np.pi*280*t)*np.exp(-t*75))*.11
    add(fx,sig,at,pan);events.append({'time':at,'type':'card'})

def paper(at,vel=1):
    t=np.arange(int(.34*SR))/SR;nse=rng.normal(0,1,len(t))
    soft=lfilter([.07],[1,-.93],nse)
    env=np.sin(np.pi*np.arange(len(t))/len(t))**2
    sig=soft*env*.31*vel;add(fx,sig,at,-.25);add(fx,sig*.6,at+.045,.4)
    events.append({'time':at,'type':'paper'})

for at in (1.2,2.05,2.9,291.2,292.05,292.9):knock(at)
for i in range(1,30):paper(i*10+.07,.6)
cue_map={
 2:[.6,.9,1.2,1.5,3.4],3:[.7,1.1,1.5,1.9,2.3],4:[1.6,2.5,3.3],
 5:[.9,1.5,2.8],6:[1.8,3.6],7:[.8,1.1,1.4,1.7,2.,2.3,2.6],
 8:[.8,2.4,4.5],9:[.8,4.2],10:[1.3,1.65,2.,2.35,2.7],
 11:[1.,2.45,4.3,6.],12:[1.,2.3,4.2,5.9],13:[2.5,3.45],
 14:[.7,2.25,3.8,5.35,6.9],15:[1.2,1.9,2.6,3.3,4.],
 16:[1.,1.3,1.6,1.9],17:[1.85,2.95,4.05,5.15,6.25],
 18:[3.12,6.02],19:[1.,3.8,5.9],20:[3.2],21:[1.,1.85,2.7,4.4],
 22:[1.,1.55,2.1,2.65],23:[.9,1.3,1.7,3.7,5.6],24:[4.475],
 25:[.8,2.2,4.3],26:[1.8,2.95,4.1],27:[2.6,4.4],28:[2.2,2.85],29:[3.,3.5,4.]
}
for i,times in cue_map.items():
    for j,local in enumerate(times):tap(i*10+local,(j%3-1)*.22)
for i in (10,16,23,26):
    add(fx,pluck(50,2.6,.22),i*10+.12)
    add(fx,pluck(62,2.6,.10),i*10+.2,.3)
for at in (132.40,182.96,185.85,244.30):paper(at,.7)

fade=np.minimum(1,np.arange(len(music))/(SR*2.8))*np.minimum(1,(len(music)-np.arange(len(music)))/(SR*4.5))
music*=fade[:,None];fx*=np.minimum(1,(len(fx)-np.arange(len(fx)))/(SR*.5))[:,None]
mix=music+fx
peak=np.max(np.abs(mix));mix*=min(1,.86/peak)
out=ROOT/'audio';out.mkdir(exist_ok=True)
pcm=(np.clip(mix,-1,1)*32767).astype('<i2')
with wave.open(str(out/'score_raw.wav'),'wb') as f:
    f.setnchannels(2);f.setsampwidth(2);f.setframerate(SR);f.writeframes(pcm.tobytes())
subprocess.run(['ffmpeg','-v','error','-y','-i',str(out/'score_raw.wav'),'-af','loudnorm=I=-19:TP=-1.5:LRA=9','-ar','48000','-c:a','aac','-b:a','160k','-t','300',str(out/'soundtrack.m4a')],check=True)
(out/'events.json').write_text(json.dumps(sorted(events,key=lambda x:x['time']),ensure_ascii=False,indent=2))
print(json.dumps({'duration':300,'bpm':96,'bars':120,'events':len(events),'speech':False,'inputPeak':float(peak)}))
