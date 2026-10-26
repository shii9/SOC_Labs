#!/usr/bin/env bash
# Usage: bash scripts/ubuntu/verify-test-event.sh KALI-SOC-LAB 'Wazuh Kali centralized monitoring test'
set -euo pipefail
if [ "$#" -ne 2 ]; then echo "Usage: $0 AGENT_NAME EXPECTED_TEXT"; exit 2; fi
agent="$1"; pattern="$2"
archive=/var/ossec/logs/archives/archives.json
if [ ! -f "$archive" ]; then
  echo "Missing $archive; run this on Ubuntu Manager with logall_json enabled."
  exit 1
fi
sudo grep -F '"name":"'"$agent"'"' "$archive" | grep -F -- "$pattern" | tail -3 || {
  echo 'No matching event found in current archive file. Check log rotation and collection.'; exit 1;
}
