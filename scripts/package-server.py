from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
ROOT=Path(__file__).resolve().parent.parent
TARGET=ROOT/'dist/playform-server-kit.zip'
README='''Playform personal server
Requires Node.js 22+. No npm dependencies are required.
Extract this folder, run npm start, and open http://localhost:3000.
To host online: deploy this folder to your hosting account, start with npm start,
and set PLAYFORM_HOSTING_MODE=external. Your host supplies PORT.
Railway users can deploy this directory with railway up using their own account.
Use HTTPS and allow streaming responses (EventSource) for multiplayer.
Attach a volume for persistent feedback and accounts; set HOSTING_STORAGE_DIR
and FEEDBACK_STORAGE_DIR to directories on that volume.
In Playform, open Project > Server & account, paste the HTTPS URL, test and save.
Invite links include the project server address. Local editing needs no server.
The first Windows export downloads a verified Electron runtime.
No credentials, private projects, account data or AI model are in this ZIP.
This is a small-room development server without competitive anti-cheat.
Apply your host's resource limits. Hosting costs belong to your hosting account.
'''
with ZipFile(TARGET,'w',ZIP_DEFLATED,compresslevel=6)as z:
 for path in sorted((ROOT/'dist').rglob('*')):
  if path.is_file() and path!=TARGET and path.suffix not in ['.mp4','.webm']:
   z.write(path,path.relative_to(ROOT))
 for name in ['serve.mjs','hosting.mjs','feedback.mjs','multiplayer.mjs','orbit.mjs','windows-export.mjs','game-main.cjs','game-server.cjs','game-player-entry.js']:
  z.write(ROOT/'scripts'/name,'scripts/'+name)
 z.writestr('package.json','{"name":"playform-personal-server","type":"module","private":true,"scripts":{"start":"node scripts/serve.mjs"},"engines":{"node":">=22"}}')
 z.writestr('README.txt',README)
print('Server kit ready:',TARGET.stat().st_size,'bytes')
