# Railway deployment

- Public URL: https://playform-studio-production.up.railway.app
- Project: `6608a05e-5080-4c03-9799-acee9839c763`
- Production environment: `b627d8f4-8152-461d-abc8-50b07716a157`
- Service: `b53c5143-3ac0-471f-9236-f11faa023203`
- Start command: `node scripts/serve.mjs`
- Health check: `/health`

Deploy source from this directory using `railway up --project 6608a05e-5080-4c03-9799-acee9839c763 --environment b627d8f4-8152-461d-abc8-50b07716a157 --service b53c5143-3ac0-471f-9236-f11faa023203 --detach -m '<release summary>'`. Verify the newest deployment reaches SUCCESS before reporting a release as live.

The current release stores projects in browser localStorage, separately on each device. Use project export/import to transfer work.
