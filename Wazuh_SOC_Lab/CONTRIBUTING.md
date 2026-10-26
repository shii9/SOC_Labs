# Contributions and evidence quality

This repository is a reproducible educational Wazuh SOC lab record. Contributions should emphasize verifiable evidence over broad claims.

- Describe **which machine** executes each command: Ubuntu Manager, Kali endpoint, Windows 10 VM, or Windows 11 host.
- Prefer official version-matched Wazuh instructions; clearly label optional proposals and untested configurations.
- Put XML snippets in the relevant `configs/` subtree and **never present fragments as a complete live configuration file**.
- Keep detection examples non-destructive. Include expected event source, rule ID, ATT&CK context (if justified), positive/negative tests and false-positive notes.
- Do not add personal IP addresses, real account names, unmasked screenshots, secrets, Wazuh enrollment keys or sensitive raw logs.
- Run `python3 -m unittest discover -s tests -v` and `bash -n scripts/ubuntu/*.sh scripts/kali/*.sh` before requesting a review.
- For evidence updates, distinguish **observed**, **pending**, and **planned** explicitly in `docs/validation.md`.
