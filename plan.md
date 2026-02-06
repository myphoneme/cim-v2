Let’s discuss the purpose of the software so we can clearly understand the existing codebase and plan the additional features required to achieve our goal.

We manage a large infrastructure spread across 13 data center locations, consisting of multiple types of equipment such as servers, switches, storage systems, nodes, and virtual machines (VMs).
Currently, monitoring is done via Grafana, where we already have dashboards for individual equipment and VMs.

However, Grafana alone does not meet our operational needs. We want to build a customizable Cloud Infrastructure Monitoring (CIM) system tailored to our workflows and monitoring team.

Current Monitoring Challenge

Each equipment/VM has its own Grafana dashboard.

Metrics vary by equipment type (CPU, RAM, Disk, Network, etc.).

We have a 25-member monitoring team.

There is no centralized system to store, analyze, and act on monitoring data in a structured way.

Proposed Solution / Workflow

The monitoring team will capture screenshots of Grafana dashboards.

Screenshots will include IP address and resource utilization metrics (CPU, RAM, Disk, Network, etc.).

Metrics may vary depending on equipment type, so equipment grouping will be required.

These screenshots will be uploaded into the CIM application.

An LLM-based system will:

Extract utilization data from the screenshots.

Store the parsed metrics in a PostgreSQL database with proper timestamps.

Associate data with the correct equipment and group.

On detecting abnormal conditions (e.g., high CPU/RAM/Disk usage):

An alert will be triggered.

The alert will be sent to the relevant team.

The assigned team will:

Investigate and resolve the issue.

Update the resolution/status in the CIM system for tracking and auditing.

Current Project Status

Project theme and UI are already created.

Authentication is implemented:

Email & password login

Google authentication

Equipment master data is already available.

Backend uses PostgreSQL.

Environment variables (.env) already contain:

Database credentials

LLM API key

Tech stack:

Backend: FastAPI

Frontend: React (TypeScript)

Objective

Please analyze the existing codebase and propose:

Required new features

Data models and workflows

LLM integration strategy

Alerting and notification logic

Any architectural improvements needed to meet the above goals total equipment are around 750(including VMS).

Let me know if any clarification or additional information is required 