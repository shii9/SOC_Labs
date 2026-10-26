# 04 — SOC operations runbook

## Normal day: startup, monitor, shutdown

1. **Windows 11:** Power on the **Ubuntu Server VM** from VMware Workstation. Do not expect an SSH command to start a powered-off VM.
2. **Windows 11 terminal:** `ssh <UBUNTU_USERNAME>@<WAZUH_MANAGER_IP>` after the Ubuntu VM is running and reachable.
3. **Ubuntu Server:** `sudo systemctl is-active wazuh-manager wazuh-indexer wazuh-dashboard filebeat` (expect four `active` results).
4. **Ubuntu Server:** `sudo /var/ossec/bin/agent_control -l` (only online agents are Active).
5. **Windows 11 browser:** `https://<WAZUH_MANAGER_IP>` → Threat Hunting/Discover.
6. **Optional endpoints:** Power on Windows 10 and Kali VMs when conducting investigations, and check that their Wazuh agents reconnect.
7. **End of session:** Close analysis sessions, shut down endpoint VMs gracefully, then Ubuntu if desired.

Once systemd startup is enabled, you **do not need an SSH login** merely to use the Wazuh Dashboard. SSH is for administration. VMware's `vmrun` may automate VM startup *locally on Windows* if installed and given a valid `.vmx` path, but that is separate from SSH.

## Health commands (Ubuntu Server)

```bash
sudo systemctl is-enabled wazuh-manager wazuh-indexer wazuh-dashboard filebeat
sudo systemctl is-active wazuh-manager wazuh-indexer wazuh-dashboard filebeat
sudo /var/ossec/bin/agent_control -l
sudo filebeat test config
sudo filebeat test output
sudo ss -lntp | grep -E ':(1514|1515|443|55000|9200)\b'
sudo df -h
sudo du -sh /var/ossec/logs/archives 2>/dev/null || true
```

Read only first: `bash scripts/ubuntu/health-check.sh`. For a stopped service, inspect `systemctl status` and `journalctl -u` before starting it. Restart services only with a reason, especially when agents are ingesting telemetry.

## Services

| Ubuntu service | Function | Start / restart (Ubuntu only) |
|---|---|---|
| `wazuh-indexer` | Indexes alerts and optional archives | `sudo systemctl restart wazuh-indexer` |
| `wazuh-manager` | Enrollment, decoding, detection | `sudo systemctl restart wazuh-manager` |
| `filebeat` | Forwards JSON from Manager to Indexer | `sudo systemctl restart filebeat` |
| `wazuh-dashboard` | Browser UI | `sudo systemctl restart wazuh-dashboard` |

Enable auto-start once: `sudo systemctl enable wazuh-indexer wazuh-manager filebeat wazuh-dashboard`. **Do not** try to manage Ubuntu services with Windows `Start-Service` or Linux `sudo` within Windows PowerShell.

## When an agent says Disconnected

- Confirm its VM/host is actually running. If Windows 10 is powered off, `WIN10-SOC-LAB` should eventually show Disconnected. This is expected, not deletion.
- For Windows: `Get-Service WazuhSvc`, then inspect `C:\Program Files (x86)\ossec-agent\ossec.log`, `wazuh-agent.state`.
- For Kali: `systemctl is-active wazuh-agent`, `sudo tail -n 40 /var/ossec/logs/ossec.log`.
- Verify traffic to Manager TCP 1514. TCP 1515 handles enrollment and is not required for each normal heartbeat.
- Agent status from `agent_control -l` is Manager-side. `Pending` after enrollment may be transient: the agent can wait before connecting.

## Service files and logs

| Platform | Path | Purpose |
|---|---|---|
| Ubuntu | `/var/ossec/etc/ossec.conf` | Central Manager config |
| Ubuntu | `/var/ossec/logs/ossec.log` | Manager internal log |
| Ubuntu | `/var/ossec/logs/api.log` | API log |
| Ubuntu | `/var/ossec/logs/alerts/alerts.json` | Generated alerts |
| Ubuntu | `/var/ossec/logs/archives/archives.json` | Collected raw JSON (if enabled) |
| Ubuntu | `/etc/filebeat/filebeat.yml` | Index forwarding |
| Windows agent | `C:\Program Files (x86)\ossec-agent\ossec.conf` | Agent config |
| Windows agent | `C:\Program Files (x86)\ossec-agent\ossec.log` | Agent errors and messages |
| Windows agent | `C:\Program Files (x86)\ossec-agent\wazuh-agent.state` | Heartbeat state |
| Kali | `/var/ossec/etc/ossec.conf` | Agent config |
| Kali | `/var/ossec/logs/ossec.log` | Agent debug information |

## Snapshots and recovery

1. Take a VMware snapshot **before** changing agent configuration or installing new detection rule sets.
2. Back up `ossec.conf`, Filebeat settings, custom rule XML, and local Dashboard customizations. Keep certificates, credentials and Wazuh agent keys **outside** Git.
3. After an XML edit, validate well-formedness and ensure Wazuh actually starts (well-formed XML alone does not guarantee Wazuh accepts a directive).
4. Keep sufficient free space for daily log rotation. Never test destructive disk cleanup on the only copy of your lab evidence.
5. Document the exact package version and restore procedure whenever upgrading the central stack.

## Incident investigation mini-runbook

![Investigation lifecycle](../images/incident-investigation.svg)

1. **Alert intake:** Record rule ID, timestamp, agent and raw event details.
2. **Triage:** Confirm whether the event is expected test/maintenance activity, benign anomaly, or suspicious behavior.
3. **Scope:** Investigate related events across agents, process parents, authentication and persistence indicators.
4. **Containment (if appropriate):** Perform actions only on owned or expressly authorized assets; lab default is manual analyst approval.
5. **Recovery:** Verify service/function restoration and continued telemetry.
6. **Lessons learned:** Tune detections, document misses and false positives, preserve redacted evidence.

*Lab rule: Do not automatically isolate your physical Windows 11 host; it is also the hypervisor and administrator console.*
