#!/usr/bin/env bash
# For NEW Kali installations only; never overwrite a running Wazuh Agent.
# Run on Kali Linux. Asks for private Manager address at execution time.
set -euo pipefail
if ! command -v apt-get >/dev/null; then echo 'Debian/APT required'; exit 2; fi
if dpkg-query -W -f='${Status}' wazuh-agent 2>/dev/null | grep -q 'install ok installed'; then
  echo 'Wazuh Agent already installed. Inspect service; no changes made.'
  exit 0
fi
read -r -p 'Manager IP or FQDN (never publish this value): ' manager
if [ -z "$manager" ] || [[ "$manager" == *' '* ]]; then echo 'Invalid manager input'; exit 2; fi
read -r -p 'Agent name [KALI-SOC-LAB]: ' name
name=${name:-KALI-SOC-LAB}
read -r -p "Install Wazuh Agent 4.14.9-1 for $name? [yes/NO] " confirm
[ "$confirm" = yes ] || { echo 'Cancelled'; exit 0; }
sudo apt-get update
sudo apt-get install -y curl gnupg apt-transport-https
if [ ! -f /usr/share/keyrings/wazuh.gpg ]; then
  curl -fsSL https://packages.wazuh.com/key/GPG-KEY-WAZUH | gpg --dearmor | sudo tee /usr/share/keyrings/wazuh.gpg >/dev/null
fi
sudo chmod 644 /usr/share/keyrings/wazuh.gpg
printf '%s\n' 'deb [signed-by=/usr/share/keyrings/wazuh.gpg] https://packages.wazuh.com/4.x/apt/ stable main' | sudo tee /etc/apt/sources.list.d/wazuh.list >/dev/null
sudo apt-get update
sudo env WAZUH_MANAGER="$manager" WAZUH_REGISTRATION_SERVER="$manager" WAZUH_AGENT_NAME="$name" apt-get install -y wazuh-agent=4.14.9-1
sudo systemctl daemon-reload
sudo systemctl enable --now wazuh-agent
sudo apt-mark hold wazuh-agent
sudo systemctl is-active wazuh-agent
printf 'Agent started. Verify Active status from the Ubuntu Wazuh Manager.\n'
