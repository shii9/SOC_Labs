# Trivy Vulnerability Scanner + Wazuh SIEM | SOC Vulnerability Monitoring Lab

<p align="center">
  <img src="https://img.shields.io/badge/Wazuh-v4.14.9-007EC6?style=for-the-badge&logo=wazuh&logoColor=white" alt="Wazuh v4.14.9">
  <img src="https://img.shields.io/badge/Trivy-v0.76.x-1904DA?style=for-the-badge&logo=aqua&logoColor=white" alt="Trivy v0.76">
  <img src="https://img.shields.io/badge/Platforms-Linux%20%2B%20Windows-blue?style=for-the-badge&logo=linux&logoColor=white" alt="Platforms">
  <img src="https://img.shields.io/badge/Rules-110400--110402-orange?style=for-the-badge&logo=securityscorecard&logoColor=white" alt="Custom Rules">
  <img src="https://img.shields.io/badge/Status-Verified%20%26%20Operational-success?style=for-the-badge&logo=checkmarx&logoColor=white" alt="Status">
</p>

A practical SOC vulnerability monitoring lab integrating **Trivy Vulnerability Scanner** with the **Wazuh SIEM Platform**. The system performs automated vulnerability assessments of container images and application dependencies across Linux and Windows endpoints, normalizes findings into structured JSONL events, and forwards them through existing Wazuh Agents to the centralized Ubuntu Wazuh Manager for severity-based detection, alerting, and threat hunting.

> **📄 View Full Lab Report (PDF):** [Trivy with Wazuh.pdf](Trivy%20with%20Wazuh.pdf) *(Native report converted directly from original docx)*

---

## Table of Contents

- [1. Executive Summary & Capabilities](#1-executive-summary--capabilities)
- [2. System Architecture & Topology](#2-system-architecture--topology)
  - [2.1 High-Level Architecture Diagram](#21-high-level-architecture-diagram)
  - [2.2 End-to-End Event Pipeline](#22-end-to-end-event-pipeline)
  - [2.3 Component Responsibility Matrix](#23-component-responsibility-matrix)
- [3. Monitored Endpoint Fleet](#3-monitored-endpoint-fleet)
- [4. Custom Detection Rules](#4-custom-detection-rules)
- [5. Observed Detection Evidence & Verification](#5-observed-detection-evidence--verification)
  - [5.1 Kali Linux VM — Container Image Vulnerability Alerts](#51-kali-linux-vm--container-image-vulnerability-alerts)
  - [5.2 Windows 10 VM — Application Dependency Alerts](#52-windows-10-vm--application-dependency-alerts)
- [6. Official References](#6-official-references)

---

## 1. Executive Summary & Capabilities

Traditional vulnerability scanners generate static reports that require manual review. This lab bridges that gap by converting Trivy scan output into a live SIEM event stream, enabling SOC analysts to:

- **Scan Container Images:** Detect HIGH and CRITICAL CVEs in Docker images (e.g., `python:3.9-slim-bullseye`) from Kali Linux.
- **Scan Application Dependencies:** Identify vulnerable Python packages (e.g., Django 2.2.0) declared in `requirements.txt` from Windows 10.
- **Normalize & Forward:** Convert nested Trivy JSON into flat JSONL events — one event per CVE — for Wazuh Agent collection.
- **Centralized Detection:** Apply severity-based custom rules (110401 HIGH / 110402 CRITICAL) on the Wazuh Manager.
- **Unified Threat Hunting:** Investigate vulnerability findings alongside endpoint telemetry in the Wazuh Dashboard.

---

## 2. System Architecture & Topology

### 2.1 High-Level Architecture Diagram

<p align="center">
  <img src="assets/trivy-wazuh-architecture.png" alt="Trivy + Wazuh Vulnerability Monitoring Architecture" width="900">
</p>

### 2.2 End-to-End Event Pipeline

```mermaid
flowchart TB
    subgraph KaliLinux["Kali Linux VM (Agent 002)"]
        TSCAN1["Trivy Image Scan<br/>python:3.9-slim-bullseye"] --> JSON1["kali-scan-bil.json<br/>(108 findings)"]
        JSON1 --> JQ["jq Normalization"]
        JQ --> JSONL1["/var/log/trivy/findings.jsonl<br/>(1 event per CVE)"]
        JSONL1 --> WA1["Wazuh Agent<br/>(Logcollector → json format)"]
    end

    subgraph Windows10["Windows 10 VM (Agent 001)"]
        TSCAN2["Trivy FS Scan<br/>requirements.txt"] --> JSON2["windows-scan.json"]
        JSON2 --> PS["PowerShell Normalization"]
        PS --> JSONL2["C:\TrivyLab\logs\findings.jsonl<br/>(1 event per CVE)"]
        JSONL2 --> WA2["Wazuh Agent<br/>(Logcollector → json format)"]
    end

    subgraph UbuntuServer["Ubuntu Server VM (Wazuh All-in-One)"]
        MGR["Wazuh Manager<br/>JSON Decoder"] --> RULES["Custom Rules Engine<br/>trivy_rules.xml"]
        RULES --> A1["Rule 110401 — HIGH (Level 10)"]
        RULES --> A2["Rule 110402 — CRITICAL (Level 12)"]
        A1 & A2 --> IDX["Wazuh Indexer<br/>wazuh-alerts-*"]
        IDX --> DASH["Wazuh Dashboard"]
    end

    WA1 -- "TCP 1514 (TLS)" --> MGR
    WA2 -- "TCP 1514 (TLS)" --> MGR
    DASH -- "HTTPS 443" --> ANALYST["SOC Analyst<br/>Windows 11 Host"]
```

### 2.3 Component Responsibility Matrix

| Component | Layer | Role & Responsibility |
|---|---|---|
| **Trivy Scanner** | Vulnerability Assessment | Scans container images (Kali) and filesystem dependencies (Windows) for known CVEs at HIGH and CRITICAL severity. |
| **jq (Kali)** | Data Normalization | Extracts individual vulnerability records from nested Trivy JSON arrays and emits flat JSONL events. |
| **PowerShell (Windows)** | Data Normalization | Parses Trivy JSON report and transforms each finding into a structured JSONL event with consistent schema. |
| **JSONL Log Files** | Structured Event Store | One-event-per-line log files monitored by the local Wazuh Agent's Logcollector module. |
| **Wazuh Agent** | Telemetry Transport | Reads new JSONL lines and forwards them over encrypted TCP 1514 to the centralized Wazuh Manager. |
| **Wazuh Manager** | SIEM Correlation | Receives events, applies the JSON decoder, and evaluates against `trivy_rules.xml` custom rules. |
| **Custom Rules (110400–110402)** | Detection Logic | Base Trivy event identification (110400), HIGH alert (110401, Level 10), CRITICAL alert (110402, Level 12). |
| **Wazuh Indexer** | Search & Storage | Indexes generated alerts into `wazuh-alerts-*` for full-text search and aggregation. |
| **Wazuh Dashboard** | SOC Visualization | Provides threat hunting, CVE investigation, and vulnerability trend analysis for SOC analysts. |

---

## 3. Monitored Endpoint Fleet

| System Name | Operating System | Wazuh Agent ID | Trivy Scan Type | Scan Target |
|---|---|:---:|---|---|
| **`KALI-SOC-LAB`** | Kali Linux Rolling | `002` | Container Image (`trivy image`) | `python:3.9-slim-bullseye` |
| **`WIN10-SOC-LAB`** | Windows 10 Pro | `001` | Filesystem (`trivy fs`) | `requirements.txt` (Django 2.2.0) |
| **`wazuh-server`** | Ubuntu Server 24.04 | `000` | — (Manager / Indexer / Dashboard) | N/A |

---

## 4. Custom Detection Rules

The following rules are deployed to `/var/ossec/etc/rules/trivy_rules.xml` on the Wazuh Manager:

| Rule ID | Alert Level | Condition | Purpose |
|:---:|:---:|---|---|
| **110400** | 3 | `trivy` field exists in decoded JSON | Base rule — identifies any Trivy vulnerability event |
| **110401** | 10 | Child of 110400 + `severity` = `HIGH` | Detect HIGH-severity CVE findings |
| **110402** | 12 | Child of 110400 + `severity` = `CRITICAL` | Detect CRITICAL-severity CVE findings |

---

## 5. Observed Detection Evidence & Verification

### 5.1 Kali Linux VM — Container Image Vulnerability Alerts

Trivy scanned the container image `python:3.9-slim-bullseye` identifying 108 vulnerabilities. The normalized JSONL findings were ingested by the Kali Wazuh Agent and forwarded to the Wazuh Manager, triggering Rules 110401 (HIGH) and 110402 (CRITICAL).

#### 1. Wazuh Threat Hunting — Kali Event Log Stream
<p align="center">
  <img src="assets/kali-threat-hunting-trivy-alerts.png" alt="Kali agent view showing Trivy HIGH/CRITICAL alerts in Wazuh Dashboard" width="900">
</p>
<p align="center"><em>Figure 2. Kali Linux (KALI-SOC-LAB, Agent 002) threat hunting view displaying 247 hits including Trivy HIGH (Rule 110401, Level 10) and CRITICAL (Rule 110402, Level 12) alerts.</em></p>

#### 2. Expanded Event Details — CVE-2026-24049 (wheel 0.45.1)
<p align="center">
  <img src="assets/kali-alert-detail-cve-2026-24049.png" alt="Expanded Kali alert: CVE-2026-24049, wheel 0.45.1" width="750">
</p>
<p align="center"><em>Figure 3. Document details for CVE-2026-24049 affecting wheel 0.45.1 (fixed in 0.46.2) in container image python:3.9-slim-bullseye. Ingested from /var/log/trivy/findings.jsonl via JSON decoder.</em></p>

---

### 5.2 Windows 10 VM — Application Dependency Alerts

Trivy performed a filesystem scan against `C:\TrivyLab\test-app` targeting `requirements.txt` containing outdated `Django==2.2.0`. The Windows Wazuh Agent forwarded the generated JSONL findings to generate CRITICAL security alerts.

#### 3. Wazuh Threat Hunting — Windows 10 Event Log Stream
<p align="center">
  <img src="assets/windows-threat-hunting-django-alerts.png" alt="Five CRITICAL Django-related Trivy events from WIN10-SOC-LAB" width="900">
</p>
<p align="center"><em>Figure 4. Five CRITICAL Django-related Trivy vulnerability alerts from WIN10-SOC-LAB (Agent 001) matching Rule 110402 (Level 12). DQL: agent.name:"WIN10-SOC-LAB" AND rule.groups:trivy.</em></p>

#### 4. Expanded Event Details — CVE-2022-28347 (Django 2.2.0 SQLi)
<p align="center">
  <img src="assets/windows-alert-detail-cve-2022-28347.png" alt="Expanded Windows alert: CVE-2022-28347, Django 2.2.0" width="750">
</p>
<p align="center"><em>Figure 5. Document details for CVE-2022-28347 affecting Django 2.2.0 in requirements.txt (fixed in 2.2.28, 3.2.13, 4.0.4). Ingested from C:\TrivyLab\logs\findings.jsonl via JSON decoder.</em></p>

---

## 6. Official References

- [Trivy Documentation — Quick Start](https://aquasecurity.github.io/trivy/latest/getting-started/quickstart/)
- [Trivy Documentation — Container Image Scanning](https://aquasecurity.github.io/trivy/latest/docs/target/container_image/)
- [Trivy Documentation — Filesystem Scanning](https://aquasecurity.github.io/trivy/latest/docs/target/filesystem/)
- [Trivy Documentation — JSON Report Format](https://aquasecurity.github.io/trivy/latest/docs/configuration/reporting/#json)
- [Wazuh Documentation — Custom Rules](https://documentation.wazuh.com/current/user-manual/ruleset/custom.html)
- [Wazuh Documentation — Local Log Data Collection (`localfile`)](https://documentation.wazuh.com/current/user-manual/capabilities/log-data-collection/index.html)
- [Wazuh Documentation — JSON Decoder](https://documentation.wazuh.com/current/user-manual/ruleset/decoders/index.html)
- [jq Manual — Lightweight JSON Processor](https://jqlang.github.io/jq/manual/)

---

<p align="center">
  <b>SOC Vulnerability Monitoring Lab</b> • Crafted for centralized vulnerability detection and defensive security operations.
</p>
