# 08 — Security, disclosure hygiene and limitations

## Defensive authorization

All activity in this repository is for systems owned or expressly authorized by the operator. The lab contains no exploit payloads, credential theft tooling, phishing kits or destructive techniques. The safe exercises use event logging, Notepad, local journald and normal sudo operations.

## Exposure controls

- Restrict VMware virtual networking to the required host and endpoint routes; avoid promiscuous network bridging unless justified.
- Allow TCP 1514/1515 only from monitored endpoints and trusted admin networks. Limit 443 and SSH access. Keep Wazuh API 55000 and Indexer 9200 internal/loopback when all-in-one.
- Use least privilege for Dashboard accounts. Change auto-generated passwords and use appropriately managed certificates.
- Do not place API tokens, service passwords, TLS keys, `client.keys`, raw `ossec.log`, copied auth records, or unredacted screenshots in Git.
- Before uploading evidence, review screenshots for address bar, account names, file paths, device names, tokens, fingerprints and IP addresses.

## Data integrity, privacy and ethics

Raw Sysmon and Windows security events may contain user names, commands, file paths and DNS queries. Only archive data essential for authorized lab experiments, protect access, and retain it for a defined period. Prefer aggregate screenshots or sanitized individual examples. The helper `scripts/evidence/redact-text.py` makes a **first-pass** substitution of IPv4 literals; manual review remains mandatory.

## Retention and disk budget

Wazuh JSON archives are high-volume when enabled. Filebeat archive forwarding creates searchable `wazuh-archives-*` indices, using additional disk. A single-node 80 GB VM can reach storage pressure quickly during verbose Sysmon collection. Monitor `df -h`, Indexer storage, and archive growth; implement retention based on official docs. Do not claim "all events forever" unless capacity and policy support it.

## Reality vs simulation

| Claim | Lab can substantiate? | Caveat |
|---|---|---|
| Wazuh central server works | Yes | Demonstrated from service/API + agents |
| Three agents can enroll | Yes | IDs 001/002/003 observed |
| All three always Active | No | Powered-off endpoints disconnect |
| Sysmon channel forwards | Yes for Windows 10 | Event 13 verified; not all Sysmon IDs enabled |
| Kali journald forwards | Yes | Test event verified |
| Windows 11 raw logs forward | Not yet proven in source session | Agent Active != event ingestion validated |
| All custom rules tested | No | Sample XML is illustrative, requires `wazuh-logtest` |
| Fully production hardened / HA | No | Single Ubuntu VM, educational environment |
| Automated incident containment | No | Analyst-only training flow, no automated blocking |

## Software versions

This project records a specific working Wazuh **4.14.9** deployment, not a claim that it remains the latest release. Consult the vendor's versioned documentation before installing a different version. Upgrades and agent/manager compatibility require coordinated planning.
