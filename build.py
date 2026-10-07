from pathlib import Path
import base64,json,subprocess,sys
ROOT=Path(__file__).resolve().parent
OUT=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else ROOT/'dist';OUT.mkdir(parents=True,exist_ok=True)
html=(ROOT/'player.template.html').read_text()
for marker,file in [('__FONT__','fonts/PretendardVariable.woff2'),('__AUDIO__','audio/soundtrack.m4a')]:
    html=html.replace(marker,base64.b64encode((ROOT/file).read_bytes()).decode())
for marker,file in [('__STORYBOARD__','src/storyboard.js'),('__ENGINE__','src/engine.js')]:
    html=html.replace(marker,(ROOT/file).read_text())
dest=OUT/'똑똑똑_룰영상_JS재생.html';dest.write_text(html)
print(dest)
