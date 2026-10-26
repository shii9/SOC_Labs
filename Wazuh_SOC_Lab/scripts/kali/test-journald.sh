#!/usr/bin/env bash
# Harmless collector test; on Kali Linux.
set -euo pipefail
logger -p authpriv.notice -t KaliSOCTest 'Wazuh Kali centralized monitoring test'
sudo journalctl -t KaliSOCTest -n 3 --no-pager
printf '\nNow inspect Ubuntu Manager archives (not the Kali filesystem).\n'
