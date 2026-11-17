# Merge a folder of PDFs into one file per app, splitting by whole articles under a size limit (default 2.8MB, the Drive connector limit).
# Usage: python3 -I pack.py inDir outDir "NN app name"
import glob, os, subprocess, sys
inDir, outDir, name = sys.argv[1:4]
LIM = 2.8 * 1024 * 1024
os.makedirs(outDir, exist_ok=True)
tmp = os.path.join(outDir, '.t.pdf')
def size(g):
    subprocess.run(['pdfunite', *g, tmp], check=True); return os.path.getsize(tmp)
groups = [[]]
for f in sorted(glob.glob(inDir + '/*.pdf')):
    if groups[-1] and size(groups[-1] + [f]) > LIM: groups.append([])
    groups[-1].append(f)
for i, g in enumerate(groups, 1):
    out = f'{outDir}/{name}.pdf' if len(groups) == 1 else f'{outDir}/{name} חלק {i} מתוך {len(groups)}.pdf'
    subprocess.run(['pdfunite', *g, out], check=True)
    print(out, len(g), 'articles', os.path.getsize(out) // 1024, 'KB')
os.remove(tmp)
