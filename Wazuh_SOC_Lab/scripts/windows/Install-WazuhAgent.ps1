# Guarded first-time installer (Windows PowerShell 5.1+). Requires elevation.
# Usage: .\Install-WazuhAgent.ps1 -ManagerAddress <YOUR_MANAGER_IP> -AgentName WIN11-SOC-HOST
# NOTE: Only run when Wazuh Agent is NOT already installed.
[CmdletBinding(SupportsShouldProcess=$true)]
param(
    [Parameter(Mandatory=$true)][string]$ManagerAddress,
    [Parameter(Mandatory=$true)][ValidatePattern('^[a-zA-Z0-9._-]+$')][string]$AgentName
)
$admin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if(-not $admin){throw 'Open PowerShell with Run as administrator.'}
if(Get-Service -Name WazuhSvc -ErrorAction SilentlyContinue){
    throw 'WazuhSvc exists. Inspect/repair the existing installation; do NOT reinstall blindly.'
}
$path=Join-Path $env:TEMP 'wazuh-agent-4.14.9-1.msi'
$url='https://packages.wazuh.com/4.x/windows/wazuh-agent-4.14.9-1.msi'
if($PSCmdlet.ShouldProcess($env:COMPUTERNAME, 'Download and install Wazuh Agent 4.14.9')){
    Invoke-WebRequest -Uri $url -OutFile $path -UseBasicParsing
    $sig=Get-AuthenticodeSignature $path
    Write-Host ('MSI signature status: ' + $sig.Status)
    if($sig.Status -ne 'Valid'){throw 'MSI signature not valid. Stop and validate vendor package.'}
    $args='/i "{0}" /qn WAZUH_MANAGER={1} WAZUH_REGISTRATION_SERVER={1} WAZUH_AGENT_NAME={2}' -f $path,$ManagerAddress,$AgentName
    $result=Start-Process msiexec.exe -ArgumentList $args -Wait -PassThru
    if($result.ExitCode -notin @(0,3010)){throw ('Installation failed, exit code '+$result.ExitCode)}
    if($result.ExitCode -eq 3010){Write-Warning 'Installer requested restart.'}
    else {Start-Service WazuhSvc; Get-Service WazuhSvc}
}
