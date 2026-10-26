# 02 — End-to-end deployment playbook

> **Applies to:** Wazuh 4.14.9, Ubuntu Server 24.04 LTS, Kali Linux (Debian-based), Windows 10 VM, Windows 11 physical host. This reproduces the documented lab; adjust version-specific paths against vendor docs. **Do not reinstall an already-working Wazuh central server.**

## Phase 0 — Prerequisites / VMware networking

1. Prepare VMware Workstation on Windows 11. Provision Ubuntu Server with an appropriate virtual disk, memory, and vCPUs. Provision Windows 10 and Kali Linux endpoint VMs.
2. Connect VMs using a reachable NAT / host-only topology as appropriate. Keep the central Manager accessible from endpoints and from the host browser. Use a DHCP reservation or stable Manager IP.
3. In a public repository, **only display** `192.168.x.x` for all machines. Replace `<WAZUH_MANAGER_IP>` with the private address **locally** in terminal commands.
4. Update Ubuntu and confirm time sync; keep VM snapshots before significant changes.
5. Service ports: TCP 1514 (events), 1515 (enrollment), 443 (web UI), 22 (SSH management). Avoid exposing internal 9200/55000 outside the central VM.

## Phase 1 — Ubuntu Server: Wazuh all-in-one

**Machine: Ubuntu Server VM (NOT Windows PowerShell).** Choose an installation release supported by Wazuh. The setup used the Wazuh 4.14 release channel and resulted in version 4.14.9.

```bash
sudo apt update
sudo apt install -y curl
curl -fsSLo wazuh-install.sh https://packages.wazuh.com/4.14/wazuh-install.sh
sudo bash ./wazuh-install.sh -a
```

**Warning:** The installation assistant is for a new clean instance; never rerun it on a working installation as a health check. Save generated credentials in a password manager, not in this repo. After installation, verify:

```bash
sudo systemctl is-active wazuh-manager wazuh-indexer wazuh-dashboard filebeat
sudo /var/ossec/bin/agent_control -l
sudo filebeat test output
```

To enable boot startup once:

```bash
sudo systemctl enable wazuh-manager wazuh-indexer wazuh-dashboard filebeat
```

Open `https://<WAZUH_MANAGER_IP>` in the host browser. Review the TLS certificate warning in the isolated lab; configure trusted certificates before using the deployment outside the lab.

## Phase 2 — Windows 10 VM: agent + Sysmon

**Machine: Windows 10 PowerShell as Administrator.** First test endpoint connectivity, substituting your Manager address in the commands:

```powershell
$Manager = Read-Host 'Wazuh Manager IP / FQDN'
Test-NetConnection $Manager -Port 1514
Test-NetConnection $Manager -Port 1515
```

Download matching Wazuh Windows MSI from the [official package instructions](https://documentation.wazuh.com/current/installation-guide/wazuh-agent/wazuh-agent-package-windows.html). For a first-time install, the guarded script `scripts/windows/Install-WazuhAgent.ps1` accepts the Manager address and agent name. Read it before running:

```powershell
.\scripts\windows\Install-WazuhAgent.ps1 -ManagerAddress $Manager -AgentName 'WIN10-SOC-LAB'
```

If already installed, **do not reinstall**; check `WazuhSvc`, `ossec.conf`, and the agent state instead.

Install **Microsoft Sysinternals Sysmon** only from [Microsoft](https://learn.microsoft.com/en-us/sysinternals/downloads/sysmon); use a reviewed Sysmon filtering XML. This laboratory used Windows 10 Sysmon successfully. Add *only* this snippet inside the existing `<ossec_config>` of `C:\Program Files (x86)\ossec-agent\ossec.conf`:

```xml
<localfile>
  <location>Microsoft-Windows-Sysmon/Operational</location>
  <log_format>eventchannel</log_format>
</localfile>
```

Optional extra PowerShell/Defender source declarations are in [`configs/windows10/eventchannels-snippet.xml`](../configs/windows10/eventchannels-snippet.xml). Do not add duplicate `<localfile>` entries.

```powershell
[xml](Get-Content 'C:\Program Files (x86)\ossec-agent\ossec.conf' -Raw) | Out-Null
Restart-Service WazuhSvc
Get-Service WazuhSvc
Get-WinEvent -ListLog 'Microsoft-Windows-Sysmon/Operational'
```

For a safe local process event (depending on Sysmon policy): `Start-Process notepad.exe`. Query Sysmon ID 1 locally with `Get-WinEvent`. Sysmon Event ID 13 from Notepad was confirmed forwarded in the original lab; see validation.

## Phase 3 — Kali Linux VM: Wazuh Agent and journald

**Machine: Kali terminal (NOT Ubuntu Manager).** Use the official Wazuh APT repository. The supplied script is for **fresh installation only** and asks for the Manager address:

```bash
bash scripts/kali/install-agent.sh
```

Manual equivalents (replace IP locally):

```bash
sudo apt update
sudo apt install -y curl gnupg apt-transport-https
curl -fsSL https://packages.wazuh.com/key/GPG-KEY-WAZUH \
  | gpg --dearmor | sudo tee /usr/share/keyrings/wazuh.gpg >/dev/null
sudo chmod 644 /usr/share/keyrings/wazuh.gpg
printf '%s\n' 'deb [signed-by=/usr/share/keyrings/wazuh.gpg] https://packages.wazuh.com/4.x/apt/ stable main' \
  | sudo tee /etc/apt/sources.list.d/wazuh.list
sudo apt update
apt-cache madison wazuh-agent | head
# Replace the placeholder in your own shell; do not publish real address:
sudo env WAZUH_MANAGER='<WAZUH_MANAGER_IP>' WAZUH_REGISTRATION_SERVER='<WAZUH_MANAGER_IP>' \
  WAZUH_AGENT_NAME='KALI-SOC-LAB' apt-get install -y wazuh-agent=4.14.9-1
sudo systemctl enable --now wazuh-agent
sudo apt-mark hold wazuh-agent
```

The default installed Kali configuration already had journald collection. Confirm instead of adding duplicate blocks:

```bash
sudo grep -n -B 2 -A 3 '<location>journald</location>' /var/ossec/etc/ossec.conf
sudo systemctl is-active wazuh-agent systemd-journald
logger -p authpriv.notice -t KaliSOCTest 'Wazuh Kali centralized monitoring test'
sudo journalctl -t KaliSOCTest -n 5 --no-pager
```

`/var/ossec/bin/agent_control` and `/var/ossec/logs/archives/archives.json` belong on the **Ubuntu Manager**, not Kali. See [telemetry](telemetry.md) and [validation](validation.md).

## Phase 4 — Windows 11 host: agent, not the SIEM server

**Machine: physical Windows 11 PowerShell as Administrator.** Important: the original lab initially had a Wazuh Agent service already installed but stopped, so blindly reinstalling returned MSI policy error `1625`.

1. Check admin elevation: `([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)`
2. Check existing installation: `Get-Service WazuhSvc -ErrorAction SilentlyContinue` and `Test-Path 'C:\Program Files (x86)\ossec-agent\ossec.conf'`.
3. If installed, back up configuration, update the existing `<client><server><address>` and nest `<enrollment>` **inside `<client>`**, not at top-level. See [`configs/windows11/client-example.xml`](../configs/windows11/client-example.xml). This is an **illustrative fragment** and not a replacement for the full default XML.
4. Save full XML and verify `[xml](Get-Content ... -Raw) | Out-Null`, then `Start-Service WazuhSvc`.
5. Check `status='connected'` in the Wazuh Agent state and confirm `WIN11-SOC-HOST` Active on Ubuntu.

First-time installs can use the guarded PowerShell script for `WIN11-SOC-HOST`, only when the service/package is not already present.

For additional Windows Defender event collection, merge [`configs/windows11/eventchannels-snippet.xml`](../configs/windows11/eventchannels-snippet.xml) if those EventChannels exist on your host.

## Phase 5 — Verify from the Ubuntu server

```bash
sudo /var/ossec/bin/agent_control -l
sudo grep -F 'Wazuh Kali centralized monitoring test' /var/ossec/logs/archives/archives.json | tail -2
sudo grep -F 'Microsoft-Windows-Sysmon' /var/ossec/logs/archives/archives.json | tail -2
```

All agents Active requires the endpoints to be running and healthy. The Manager retains disconnected agents' registration when powered-off VMs go offline.

## Phase 6 — Dashboard

Open the browser on Windows 11: `https://<WAZUH_MANAGER_IP>`. Threat Hunting searches alert indices; Discover can search archived raw logs after archive indexing is enabled. **Don't type `wazuh-archives-*` in a Linux shell**—it is an index pattern.

See [telemetry](telemetry.md), [operations](operations.md), [validation](validation.md), and [troubleshooting](troubleshooting.md).
