"""Fetch and verify the pinned, redistributable desktop dependencies."""
from pathlib import Path
from urllib.request import urlopen
from concurrent.futures import ThreadPoolExecutor
import hashlib

CACHE=Path(__file__).resolve().parent.parent/'.desktop-cache'
CACHE.mkdir(exist_ok=True)
ARTIFACTS=[
 ('electron.zip','https://github.com/electron/electron/releases/download/v45.2.1/electron-v45.2.1-linux-x64.zip','616efc1ae4784af1a4f3f0e8774e73e7030e7bd1708da9d09bcf543dfa499beb'),
 ('llama.tar.gz','https://github.com/ggml-org/llama.cpp/releases/download/b12061/llama-b12061-bin-ubuntu-x64.tar.gz','8a968cd14e2546d0762db37c1d8b83bbd38fa62eeb63f99a01ad197f3d0c9c23'),
 ('orbit-qwen-coder.gguf','https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct-GGUF/resolve/main/qwen2.5-coder-1.5b-instruct-q4_k_m.gguf?download=true','cc324af070c2ecbfd324a30884d2f951a7ff756aba85cb811a6ec436933bb046'),
]
def download(item):
 name,url,expected=item
 target=CACHE/name
 if target.exists():
  with target.open('rb') as f:
   if hashlib.file_digest(f,'sha256').hexdigest()==expected:
    print(name,'already verified',flush=True);return
 temporary=CACHE/(name+'.partial');digest=hashlib.sha256();total=0;last=0
 with urlopen(url,timeout=60) as response,temporary.open('wb') as output:
  while chunk:=response.read(1024*1024):
   output.write(chunk);digest.update(chunk);total+=len(chunk)
   if total-last>64*1024*1024:print(name,total//1048576,'MiB',flush=True);last=total
 if digest.hexdigest()!=expected:
  temporary.unlink();raise RuntimeError('Checksum mismatch: '+name)
 temporary.replace(target);print(name,'verified',total,'bytes',flush=True)
with ThreadPoolExecutor(max_workers=3) as pool:
 list(pool.map(download,ARTIFACTS))
for name,url in [
 ('QWEN-LICENSE','https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct/raw/main/LICENSE'),
 ('LLAMA-LICENSE','https://raw.githubusercontent.com/ggml-org/llama.cpp/b12061/LICENSE'),
]:
 with urlopen(url,timeout=30) as response:(CACHE/name).write_bytes(response.read())
print('Desktop dependencies are ready.',flush=True)
