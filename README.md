# CrowdSec Dashboard

A modern, open-source monitoring dashboard for CrowdSec built with Next.js, TypeScript, and CrowdSec LAPI.

![Dashboard Screenshot](./screenshots/dashboard.png)

## Overview

CrowdSec Dashboard provides a clean and intuitive interface for monitoring CrowdSec security events, active decisions, machine status, and overall platform health.

Unlike traditional security interfaces that focus on configuration and administration, this project focuses on operational visibility, making it easier for security analysts, engineers, and system administrators to understand what is happening in their CrowdSec deployment.

## Features

### Dashboard Overview

* Security posture overview
* Real-time statistics
* Attack activity timeline
* Top attacker visibility
* Recent activity feed

### Alerts Monitoring

* Live CrowdSec alerts
* Search and filtering
* Alert details
* Scenario visibility
* Event tracking

### Decisions Monitoring

* Active decisions
* Ban visibility
* Decision search
* Decision analytics
* CSV export

### Machine Monitoring

* Connected machine status
* Version visibility
* Heartbeat monitoring
* Platform information

### Bouncer Monitoring

* Connected bouncers
* Health status
* Pull activity monitoring

### Platform Health

* CrowdSec LAPI connectivity
* System status monitoring
* Auto-refresh support

## Screenshots

### Dashboard

![Dashboard](./screenshots/dashboard.png)

### Alerts

![Alerts](./screenshots/alerts.png)

### Decisions

![Decisions](./screenshots/decisions.png)

### Machines

![Machines](./screenshots/machines.png)

## Technology Stack

* Next.js 15
* React 19
* TypeScript
* Tailwind CSS
* React Query
* TanStack Table
* Recharts
* Lucide Icons
* CrowdSec LAPI

## Requirements

* CrowdSec installed and running
* CrowdSec Local API (LAPI) enabled
* Node.js 20+
* npm

## Installation

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/crowdsec-dashboard.git
cd crowdsec-dashboard
```

Install dependencies:

```bash
npm install
```

Create environment configuration:

```bash
cp .env.example .env.local
```

Configure CrowdSec credentials:

```env
CROWDSEC_URL=http://127.0.0.1:8080
CROWDSEC_LOGIN=your_machine_id
CROWDSEC_PASSWORD=your_password
CROWDSEC_BOUNCER_API_KEY=
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Production Build

Build the application:

```bash
npm run build
```

Run production server:

```bash
npm start
```

## CrowdSec Integration

This dashboard connects directly to CrowdSec Local API (LAPI) and retrieves:

* Alerts
* Decisions
* Metrics
* Machine information
* Bouncer information
* Health information

Authentication is performed using CrowdSec watcher credentials.

## Security

Never commit:

* `.env`
* `.env.local`
* API keys
* Machine credentials
* CrowdSec passwords

Review `.gitignore` before publishing changes.

## Roadmap

### v1.1

* Authentication
* Role-based access
* Improved analytics

### v1.2

* Docker support
* Docker Compose deployment
* NGINX examples

### v1.3

* Multi-instance CrowdSec support
* Aggregated dashboards
* Historical data storage

### v2.0

* Microsoft Entra ID integration
* SSO support
* Advanced threat intelligence
* CTI enrichment

## Contributing

Contributions, issues, and feature requests are welcome.

If you would like to contribute:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

## License

MIT License

## Disclaimer

This project is an independent open-source dashboard for CrowdSec and is not affiliated with or endorsed by CrowdSec.

## Author

Built by Kosal Marathe.

If you find this project useful, consider starring the repository.
