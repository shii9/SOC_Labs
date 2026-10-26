# Screenshot evidence gallery

`wazuh-threat-hunting-win10.png` is an actual screenshot from this laboratory's Windows 10 Threat Hunting view. It shows 431 historical alert hits in a selected time range. **Not a live metric.**

Other recommended captures to add once verified:

| Proposed file | Expected screenshot | Publication precautions |
|---|---|---|
| `agents-overview-redacted.png` | Agent IDs / state in Wazuh Dashboard | Obscure addresses, user names and account IDs |
| `win10-sysmon-13-redacted.png` | Discover showing Sysmon provider + Event 13 | Obscure usernames, registry paths, IPs |
| `kali-rule-5402-redacted.png` | Kali sudo detection in Threat Hunting | Obscure terminal names and real command arguments |
| `win11-event-102-redacted.png` | Raw forwarded Windows 11 test event | Capture only after the test actually passes |
| `service-health-redacted.png` | Ubuntu active Manager, Indexer, Dashboard, Filebeat | Obscure node address, credentials and user details |

Images generated as original vector diagrams elsewhere in `images/` are *conceptual illustrations*, not screenshots of a live product.
