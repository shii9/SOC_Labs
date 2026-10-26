# Sources and technical references

This repository is based on (1) the author's hands-on 2026 Wazuh setup and terminal verification, (2) the architecture/documentation organization of their own Splunk lab, and (3) official vendor guidance. Some sample optional configurations are **proposed** and have not been validated on every platform.

## Existing portfolio source

- [shii9/SOC_Lab_Setup_Splunk](https://github.com/shii9/SOC_Lab_Setup_Splunk) — reviewed README, project report, Windows/Kali configurations, repository structure and image inventory. The Wazuh repo is a new, separate document set—not a renamed copy of the Splunk implementation.

## Wazuh documentation

- [Quickstart (all-in-one Wazuh installation)](https://documentation.wazuh.com/current/quickstart.html)
- [Architecture and required ports](https://documentation.wazuh.com/current/getting-started/architecture.html)
- [Windows Agent deployment](https://documentation.wazuh.com/current/installation-guide/wazuh-agent/wazuh-agent-package-windows.html)
- [Linux Agent deployment](https://documentation.wazuh.com/current/installation-guide/wazuh-agent/wazuh-agent-package-linux.html)
- [Windows enrollment deployment variables](https://documentation.wazuh.com/current/user-manual/agent/agent-enrollment/deployment-variables/deployment-variables-windows.html)
- [Client configuration, including nested enrollment](https://documentation.wazuh.com/current/user-manual/reference/ossec-conf/client.html)
- [Event logging, archives and Discover](https://documentation.wazuh.com/current/user-manual/manager/event-logging.html)
- [Wazuh Indexer archives settings](https://documentation.wazuh.com/current/user-manual/wazuh-indexer/wazuh-indexer-indices.html)
- [Custom rules](https://documentation.wazuh.com/current/user-manual/ruleset/rules/custom.html)
- [Wazuh logtest](https://documentation.wazuh.com/current/user-manual/ruleset/testing.html)
- [Proof-of-concept reference](https://documentation.wazuh.com/current/proof-of-concept-guide/index.html)

## Tools

- [Microsoft Sysinternals Sysmon](https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon)
- [VMware Workstation documentation](https://techdocs.broadcom.com/)
- [MITRE ATT&CK Enterprise](https://attack.mitre.org/)

## Technical scope disclaimer

Commands were checked against the documented Wazuh 4.14 series and the captured lab session. Some third-party documents evolve. Always verify external installation URLs/version compatibility before deploying to a fresh or production system.
