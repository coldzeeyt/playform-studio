"""Create the Linux x64 portable edition, including Orbit's model and runtime."""
from pathlib import Path
import hashlib
import json
import os
import shutil
import tarfile
import zipfile

ROOT=Path(__file__).resolve().parent.parent
CACHE=ROOT/'.desktop-cache'
RELEASES=ROOT/'releases'
TARGET=RELEASES/'Playform-Studio-Linux-x64'
TARGET.mkdir(parents=True,exist_ok=True)
with zipfile.ZipFile(CACHE/'electron.zip') as archive:
 for member in archive.infolist():
  output=(TARGET/member.filename).resolve()
  if not output.is_relative_to(TARGET.resolve()):raise ValueError('Invalid Electron archive path')
  archive.extract(member,TARGET)
  mode=(member.external_attr>>16)&0o777
  if mode:output.chmod(mode)
print('Electron extracted.',flush=True)
runtime=CACHE/'runtime'
runtime.mkdir(exist_ok=True)
with tarfile.open(CACHE/'llama.tar.gz') as archive:archive.extractall(runtime,filter='data')
server=next(runtime.rglob('llama-server'))
orbit=TARGET/'resources'/'orbit'
orbit.mkdir(parents=True,exist_ok=True)
if (orbit/'runtime').exists():shutil.rmtree(orbit/'runtime')
shutil.copytree(server.parent,orbit/'runtime',dirs_exist_ok=True,symlinks=True)
shutil.copy2(CACHE/'orbit-qwen-coder.gguf',orbit/'orbit-qwen-coder.gguf')
for file in ['QWEN-LICENSE','LLAMA-LICENSE']:shutil.copy2(CACHE/file,orbit/file)
app=TARGET/'resources'/'app'
app.mkdir(exist_ok=True)
for directory in ['dist','desktop']:shutil.copytree(ROOT/directory,app/directory,dirs_exist_ok=True)
(app/'scripts').mkdir(exist_ok=True)
for file in ['feedback.mjs','serve.mjs','orbit.mjs','multiplayer.mjs','windows-export.mjs','game-main.cjs','game-server.cjs','game-player-entry.js']:shutil.copy2(ROOT/'scripts'/file,app/'scripts'/file)
(app/'package.json').write_text(json.dumps({'name':'playform-studio','version':'0.2.0','description':'Playform Studio with Orbit','main':'desktop/main.cjs','type':'module'}))
executable=TARGET/'electron'
if executable.exists():executable.replace(TARGET/'playform-studio')
(TARGET/'playform-studio').chmod(0o755)
(TARGET/'Launch-Playform.sh').write_text('#!/bin/sh\nAPP_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)\nexec "$APP_DIR/playform-studio" "$@"\n')
(TARGET/'Launch-Playform.sh').chmod(0o755)
(TARGET/'README.txt').write_text('Playform Studio — Linux x64 portable edition\n\nExtract this entire folder and run Launch-Playform.sh.\nRequires a graphical Linux desktop (Ubuntu 24.04+ or equivalent) and at least 4 GB available RAM; 8 GB RAM recommended.\n\nOrbit is optional. Enable Orbit in Preferences or the Debug panel. The bundled Qwen2.5-Coder-1.5B-Instruct Q4_K_M model starts locally on your first AI question. No Ollama, API key, additional model download, or network connection is required for AI. Replies depend on your CPU speed and model quality.\n\nGame projects save in the desktop app profile. Export backups to move work between computers. Browser and desktop projects use separate storage.\n\nThis is an unsigned development build. Windows and macOS builds are not included.\n\nLicenses: Electron and Chromium licenses are in the root folder; Qwen and llama.cpp licenses are in resources/orbit; Montserrat’s OFL license is in resources/app/dist/fonts.\n')
print('Bundled model and app copied.',flush=True)
archive=RELEASES/'Playform-Studio-Linux-x64-with-Orbit.zip'
with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED,compresslevel=1,allowZip64=True) as output:
 for file in sorted(TARGET.rglob('*')):
  if file.is_file():output.write(file,file.relative_to(RELEASES),compress_type=zipfile.ZIP_STORED if file.suffix=='.gguf' else zipfile.ZIP_DEFLATED)
with archive.open('rb') as f:digest=hashlib.file_digest(f,'sha256').hexdigest()
(RELEASES/'SHA256SUMS.txt').write_text(f'{digest}  {archive.name}\n')
print('Created',archive,'size',archive.stat().st_size,'SHA256',digest,flush=True)
