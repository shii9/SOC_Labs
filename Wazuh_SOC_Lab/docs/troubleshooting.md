# 07 — Troubleshooting guide: real lab cases

> Always distinguish the terminal: **Ubuntu Server / Kali shell** and **Windows 11 or Windows 10 PowerShell** are not interchangeable.

## Triage order

1. Is the Ubuntu VM actually powered on?
2. Can the host/endpoint reach the Manager?
3. Is the Manager up? (`sudo systemctl is-active wazuh-manager` on Ubuntu)
4. Does the agent exist and show Active? (`agent_control -l` on Ubuntu)
5. Is the endpoint agent service Running? (`WazuhSvc` Windows; `wazuh-agent` Kali)
6. Does the source event exist locally?
7. Is it present in `archives.json` on Ubuntu?
8. Does it generate an alert? If not, expect only archive visibility, not Threat Hunting.
9. Does Filebeat index archives? Does the selected Dashboard time range include the event?

## Issues actually encountered

| Symptom | Proven/potential cause | Correct remedy |
|---|---|---|
| Windows 11 MSI exit `1625` | Windows Installer policy blocked install and shell was not elevated | Run PowerShell as Administrator, inspect installed Wazuh Agent first; **do not disable system policies** |
| `Cannot open WazuhSvc` / `Access is denied` | Non-admin PowerShell | Verify elevation returns `True` |
| Agent logs `Invalid server address '0.0.0.0'` | Wrong `<client><server><address>` | Use actual Manager IP/FQDN in private local config |
| Agent logs `Invalid element: 'enrollment'` | `<enrollment>` misplaced at root | Place `<enrollment>` **inside** `<client>` |
| XML error `Unexpected end of file` | Only top of XML was pasted; `<ossec_config>` unclosed | Restore full `.bak`, edit only necessary elements; validate XML |
| Agent Pending right after key receipt | Waiting before first connection, or broken comms if persistent | Check agent log, state, Manager list; allow initial reconnection time, investigate if persistent |
| `wazuh-agent` is `inactive` on Ubuntu | Queried endpoint service on central Manager | On Ubuntu inspect `wazuh-manager`, not `wazuh-agent` |
| `agent_control: command not found` on Kali | Utility exists on Manager, not endpoint | Run `sudo /var/ossec/bin/agent_control -l` on Ubuntu Server |
| `archives.json: No such file` on Kali | Read Manager archives path on endpoint | SSH to Ubuntu and search there |
| `sudo` disabled on Windows | Linux command mistakenly run in Windows PowerShell | SSH to Ubuntu first, then run Ubuntu commands |
| Sysmon service running but 0 central events | Sysmon EventChannel missing in Windows Agent config | Add only one Sysmon `<localfile>`, restart `WazuhSvc`, generate new test |
| Events in `archives.json` but not Threat Hunting | Non-alerting raw event | Use `wazuh-archives-*` Discover after archive indexing |
| `wazuh-archives-* command not found` | Dashboard index pattern typed into terminal | Select as a Discover data view, not shell command |
| Kali APT duplicate source warning | Duplicate entries in **Kali** `/etc/apt/sources.list` | Inspect Kali source file; don't edit Ubuntu's sources in response |
| Windows 10 Disconnected | VM powered down or agent/network down | Power on VM; check `WazuhSvc`, then heartbeat |
| Filebeat test output healthy, archives not visible | Archive input disabled or no archive index | Check Manager `logall_json`, Filebeat `archives.enabled`, restart, create index pattern |

## Safe Windows 11 XML repair strategy

When the full Windows Agent `ossec.conf` became truncated during lab setup, recovery was:

1. Restore its earlier valid backup (`ossec.conf.bak`) **after verifying it is full**.
2. Modify only the existing `<client>` block's server address and nested `<enrollment>`.
3. Keep unrelated EventChannel, FIM, inventory, and SCA configuration untouched.
4. Validate XML via PowerShell `[xml]$doc = Get-Content '...\ossec.conf' -Raw`.
5. `Start-Service WazuhSvc` as Administrator. Review **new** error log entries after the start attempt, not only historic errors.
6. On Ubuntu `agent_control -l`; successful Agent Active was eventually observed.

The example fragment in [`configs/windows11/client-example.xml`](../configs/windows11/client-example.xml) is **not** a replacement for complete `ossec.conf`.

## Network troubleshooting

**Windows PowerShell:**

```powershell
$Manager = Read-Host 'Manager IP or DNS'
Test-NetConnection $Manager -Port 1514
Test-NetConnection $Manager -Port 1515
Get-Service WazuhSvc
```

**Kali terminal:**

```bash
sudo systemctl is-active wazuh-agent
sudo tail -n 40 /var/ossec/logs/ossec.log
# Substitute your actual manager address locally:
nc -zv <WAZUH_MANAGER_IP> 1514
```

**Ubuntu Manager:**

```bash
sudo systemctl is-active wazuh-manager wazuh-indexer wazuh-dashboard filebeat
sudo /var/ossec/bin/agent_control -l
sudo tail -n 40 /var/ossec/logs/ossec.log
sudo filebeat test config
sudo filebeat test output
```

## When not to panic

- `Active` status requires a running connected endpoint, not just a registered agent.
- A self-signed certificate on a fresh lab is expected; use trusted certificates for serious deployment.
- Valid Filebeat configuration is not identical to data indexed; check each pipeline stage.
- An Event ID 101/102 informational or warning test may produce **zero alerts** if no matching rule exists.
