# CrowdSec Monitoring Dashboard

Modern read-only SOC dashboard for CrowdSec Local API data.

## Credentials

Preferred setup is a dedicated machine/watcher credential:

```powershell
& 'C:\Program Files\CrowdSec\cscli.exe' machines add dashboard_user --auto -f - --url http://127.0.0.1:8080
```

Copy the emitted values into `.env.local`:

```env
CROWDSEC_URL=http://127.0.0.1:8080
CROWDSEC_LOGIN=dashboard_user
CROWDSEC_PASSWORD=<generated password>
```

All three variables must be set in `.env.local`. The dashboard does not read `local_api_credentials.yaml` or other credential files.

## Run

```powershell
npm install
npm run dev
```

Open `http://localhost:3000/dashboard`.
