# 01 — Wazuh SOC architecture

![System architecture](../images/wazuh-soc-architecture.svg)

## Design decision

**A single Ubuntu Server 24.04 LTS virtual machine hosts the Wazuh central stack**, distinct from the Windows 11 physical host. VMware Workstation provides lab virtualization; a NAT network provides connectivity. Windows 10 and Kali Linux run in their own VMs, while the physical Windows 11 host has an optional, separate Wazuh Agent and is the primary console for browser/SSH access. All shown IPs use `192.168.x.x` as privacy placeholders.

## Roles and boundaries

| Component | Resides on | Responsibility | Data produced |
|---|---|---|---|
| Wazuh Agent | Windows 10 VM | Windows Event Channels and Sysmon, SCA, FIM, inventory | Telemetry events, agent heartbeat |
| Wazuh Agent | Kali VM | journald, optional auditd, SCA, FIM, inventory | Linux logs and agent heartbeat |
| Wazuh Agent | Windows 11 host | Security, System, Application; optional Defender | Host events and heartbeat |
| Wazuh Manager | Ubuntu Server VM | Enrollment, receive/normalize, decode, correlate, evaluate XML rules | Alerts (`alerts.json`), optional archives (`archives.json`) |
| Filebeat | Ubuntu Server VM | Forward Wazuh JSON alert/archive files to Indexer | Indexed JSON documents |
| Wazuh Indexer | Ubuntu Server VM | Persist/search `wazuh-alerts-*`, optionally `wazuh-archives-*` | Search indices |
| Wazuh Dashboard | Ubuntu Server VM | Agent status via Manager API; security search/visualization via Indexer | Browser UI |
| Wazuh API | Ubuntu Server VM | Status/configuration interface typically on loopback | Operational metadata |

> **Important ordering:** Wazuh **Manager applies detection rules before** Filebeat sends alert JSON to the Indexer. The Indexer stores and searches; it is not the primary Wazuh rule-processing engine. The Dashboard is a presentation/administration client, not the detector.

![Telemetry pipeline](../images/wazuh-telemetry-pipeline.svg)

## Two event pathways

1. **Alerts:** Endpoint → Wazuh Agent → Manager decoder/rule engine → `alerts.json` → Filebeat → `wazuh-alerts-*` → Threat Hunting.
2. **Raw archives (optional):** Endpoint → Agent → Manager → `archives.json` (`logall_json=yes`) → Filebeat archives input → `wazuh-archives-*` → Discover.

A normal application event may be present in archives but **absent from Threat Hunting** if no rule triggered. Archive indexing requires **two** independent switches: Manager archiving and Filebeat archive input.

## Default lab port and isolation matrix

| Source → Target | Port | Necessity | Boundary |
|---|---|---|---|
| Endpoints → Manager | TCP 1514 | Required | VMware NAT / trusted lab |
| Endpoints → enrollment service | TCP 1515 | Registration | VMware NAT / trusted lab |
| Host browser → Dashboard | TCP 443 | UI | Host-to-VM |
| Windows host SSH → Ubuntu | TCP 22 | Optional admin | Host-to-VM |
| Dashboard → Manager API | TCP 55000 | Internal operational status | Local/loopback recommended |
| Filebeat/Dashboard → Indexer | TCP 9200 | Internal ingest/search | Local/loopback recommended |

The VMware NAT host interface and endpoint addresses may change under DHCP. Use a reserved address for the Manager; do not paste actual assignments into public docs. Validate from Windows with `Test-NetConnection <WAZUH_MANAGER_IP> -Port 1514` and from Kali with `nc -zv <WAZUH_MANAGER_IP> 1514`.

## Deployment properties

- **Form factor:** single-node / all-in-one VM; not clustered or highly available.
- **Lab starting resources:** 8 GB RAM, 4 vCPU and at least 80 GB virtual disk are reasonable small-lab planning values, **not a performance guarantee**. Consult the official capacity recommendations and monitor disk consumption.
- **Boot:** VMware powers on Ubuntu; systemd launches the installed services if enabled. SSH cannot turn on a powered-off VM.
- **Trust:** Endpoint log agents are privileged software; indexer/API ports should not be internet-facing.
- **Time:** VM clock sync matters: ingestion time, Windows event time and displayed dashboard time-zone can differ.

## What has actually been proven?

- Windows 10 agent logs and Sysmon event ID 13 were observed in the Ubuntu archive.
- Kali journald message and sudo rule ID 5402 were observed centrally.
- Windows 11 was enrolled and Active in the Manager agent list; individual Windows 11 raw event forwarding requires its own final test.
- Agents can be Disconnected when the corresponding VM is switched off; this is normal.

For step-by-step evidence, see [validation](validation.md).
