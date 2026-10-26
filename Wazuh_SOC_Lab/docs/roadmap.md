# 09 — Professional SOC upgrade roadmap

These are **future improvements**, not already implemented capabilities.

| Priority | Workstream | Deliverables | Acceptance criteria |
|---|---|---|---|
| P0 | Complete evidence | Windows 11 raw Event ID 102 test; screenshots of three agents and logs | Event in Ubuntu archives attributed to Win11 |
| P0 | Storage / privacy | Retention notes, index size monitoring, redacted screenshots | Defined space threshold; no personal data in Git |
| P1 | Expanded Windows telemetry | PowerShell Operational, Defender, tuned Sysmon | Source exists, events indexed, noise measured |
| P1 | Linux host detection | Journald review, optional auditd and FIM | Safe test case produces searchable evidence |
| P1 | Custom rules | Test and tune custom Wazuh XML signatures | Positive/negative tests using `wazuh-logtest` |
| P1 | SOC dashboards | Per-host views; MITRE distribution; daily alert count | Reviewable filters and annotated screen captures |
| P2 | Case response | Template for alert triage / escalation / lessons learned | Repeatable sample case from raw event to disposition |
| P2 | Rule QA automation | XML schema/lint + sandbox replay pipeline | Tests pass on known fixtures; no production-side scripts |
| P2 | Network IDS | Optional Suricata / Zeek events ingested into Wazuh | Trusted sample detection with clear metadata |
| P3 | Identity lab | Isolated Active Directory test VM | Authentication event pipeline, no production exposure |
| P3 | IR automation | Analyst-approved response playbooks | Explicit approval and rollback before any containment |

## Research questions

1. Which subset of Sysmon events provides highest useful signal per megabyte on a constrained single-node Wazuh deployment?
2. How do native Wazuh rules compare with custom rules for ATT&CK mapping precision and false positives?
3. How quickly do disconnected Windows/Kali VMs reconnect after VMware suspend/resume?
4. Which dashboard workflows provide the clearest evidence chain for incident reporting?

## Suggested portfolio deliverables

- One sanitized network architecture image and one detailed component flow.
- Capture of agent status (three endpoints) and separate searchable evidence for each.
- Detection case study: alert → underlying raw event → triage reasoning → false positive/incident disposition.
- Documentation of known failure cases and corrected configuration (especially Windows 11 XML repair).
- Measured performance/retention impact before turning on high-volume Sysmon data.
