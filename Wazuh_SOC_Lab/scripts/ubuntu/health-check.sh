#!/usr/bin/env bash
# Read-only health snapshot. Run on the Ubuntu Wazuh Manager.
set -u
if ! command -v systemctl >/dev/null 2>&1; then echo 'Requires systemd'; exit 2; fi
printf '\n== Core services ==\n'
for svc in wazuh-manager wazuh-indexer filebeat wazuh-dashboard; do
  printf '%-20s %s\n' "$svc" "$(systemctl is-active "$svc" 2>/dev/null || true)"
done
printf '\n== Agent list (sudo if needed) ==\n'
if [ -x /var/ossec/bin/agent_control ]; then
  sudo /var/ossec/bin/agent_control -l || true
else
  echo 'Not found: are you on the Ubuntu Manager?'
fi
printf '\n== Disk utilization ==\n'
df -h /
printf '\n== Archive footprint (if enabled) ==\n'
if [ -d /var/ossec/logs/archives ]; then
  sudo du -sh /var/ossec/logs/archives 2>/dev/null || true
else
  echo 'No archives directory (may be disabled)'
fi
printf '\n== Filebeat configuration ==\n'
if command -v filebeat >/dev/null 2>&1; then sudo filebeat test config || true; fi
printf '\nRead-only checks complete. No service was restarted.\n'
