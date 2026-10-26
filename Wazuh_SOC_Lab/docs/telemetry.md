# 03 — Telemetry engineering and Wazuh search

## Sources and event meaning

| Device | Collector | High-value events | Wazuh view |
|---|---|---|---|
| Windows 10 | `Security` EventChannel | 4624 success, 4625 failed logon, 4720 account creation, 4732 group change | Alert if a rule fires; otherwise archives |
| Windows 10 | Sysmon Operational | 1 process, 3 network, 11 file, 13 registry, 22 DNS **when enabled by XML policy** | Alert or archives |
| Windows 10/11 | System / Application | Service & application events | Alert or archives |
| Windows 11 | Defender Operational (optional) | Antivirus detection/activity where present | Alert or archives |
| Kali Linux | `journald` | Authentication, sudo, service and local test messages | Alert or archives |
| All agents | FIM, SCA, inventory | Integrity, benchmark findings, assets | Dashboard modules / alerts |

> Windows IDs **7045** (service installed, System channel) and **4688** (process creation in Security channel) depend on source/audit policy. High event volume (e.g. Sysmon 7) should be deliberately filtered, not indiscriminately collected.

## Alerts are not archives

- **Rules are evaluated on the Wazuh Manager** (the Indexer does not execute Wazuh XML detection rules).
- **Alerts:** `/var/ossec/logs/alerts/alerts.json` → Filebeat → `wazuh-alerts-*` → **Threat Hunting**.
- **Archived raw events:** `/var/ossec/logs/archives/archives.json` → Filebeat archives input → `wazuh-archives-*` → **Explore → Discover**.
- **Archive storage:** `logall_json=yes` on Manager stores all collected events in JSON, including non-alerts; can fill a small disk. Indexing requires a *second* switch in Filebeat.

## Enable raw archives (optional, disk-intensive)

**Ubuntu only; back up configs first.** In the existing `/var/ossec/etc/ossec.conf` `<global>` section ensure:

```xml
<logall_json>yes</logall_json>
```

Back up `/etc/filebeat/filebeat.yml`, then in its existing Wazuh module ensure:

```yaml
filebeat.modules:
  - module: wazuh
    alerts:
      enabled: true
    archives:
      enabled: true
```

Do not replace the entire Filebeat config with that snippet. Validate after changes:

```bash
sudo filebeat test config
sudo systemctl restart wazuh-manager
sudo systemctl restart filebeat
sudo filebeat test output
sudo ls -lh /var/ossec/logs/archives/archives.json
```

Then in Dashboard → **Dashboard Management → Index patterns → Create index pattern** `wazuh-archives-*`, time field `timestamp`, and open **Explore → Discover**. A historical event generated before archive indexing was enabled is not guaranteed to be indexed retroactively.

## Reusable DQL examples

Select the matching data view (`wazuh-alerts-*` or `wazuh-archives-*`) and a time range covering the event.

```text
agent.name:"WIN10-SOC-LAB"
agent.name:"KALI-SOC-LAB"
agent.name:"WIN11-SOC-HOST"
agent.name:"KALI-SOC-LAB" AND rule.id:"5402"
agent.name:"WIN10-SOC-LAB" AND data.win.system.providerName:"Microsoft-Windows-Sysmon"
agent.name:"WIN10-SOC-LAB" AND data.win.system.eventID:"13"
agent.name:"WIN11-SOC-HOST" AND data.win.system.eventID:"102"
```

Field mappings can differ across event types; expand a real event to confirm field names. Use `@timestamp` only where the index pattern is mapped to it; the documented Wazuh archives pattern uses `timestamp` as the time field.

## On-server verification

**Ubuntu Server only:**

```bash
sudo /var/ossec/bin/agent_control -l
sudo grep -F 'Microsoft-Windows-Sysmon' /var/ossec/logs/archives/archives.json | tail -1
sudo grep -F 'Wazuh Kali centralized monitoring test' /var/ossec/logs/archives/archives.json | tail -1
sudo grep -F 'WazuhHostTest' /var/ossec/logs/archives/archives.json | tail -1
```

The third command confirms Kali test collection; fourth is the *pending* Windows 11 raw forwarding test. A missing line is not proof that agent enrollment failed—check the agent state, source, and archive configuration.

## Storage/retention guidance

Document actual disk use (`df -h`, `du -sh /var/ossec/logs/archives`), Indexer growth and retention. Do not blindly leave `logall_json=yes` + archive indexing enabled indefinitely on a small VM. Disable raw archiving/indexing when not needed, or configure tested retention/rotation suited to your environment. Store screenshots with private fields redacted.
