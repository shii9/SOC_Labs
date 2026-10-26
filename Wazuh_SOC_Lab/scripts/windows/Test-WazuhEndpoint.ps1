# Read-only endpoint checks. PowerShell on Windows 10/11.
param([Parameter(Mandatory=$true)][string]$ManagerAddress)
Write-Host '=== Wazuh Endpoint ==='
Get-Service -Name WazuhSvc -ErrorAction SilentlyContinue | Format-Table Status,Name,StartType
$base='C:\Program Files (x86)\ossec-agent'
$config=Join-Path $base 'ossec.conf'
if(Test-Path $config){
    try { [xml]$xml=Get-Content $config -Raw; Write-Host ('XML valid; configured Manager: '+$xml.ossec_config.client.server.address) }
    catch { Write-Warning ('Invalid XML: '+$_.Exception.Message) }
} else { Write-Warning 'Missing ossec.conf' }
$state=Join-Path $base 'wazuh-agent.state'
if(Test-Path $state){ Select-String -Path $state -Pattern '^status=' } else { Write-Warning 'No agent state file yet' }
foreach($port in 1514,1515){
    $r=Test-NetConnection $ManagerAddress -Port $port -WarningAction SilentlyContinue
    Write-Host ('Port {0}: {1}' -f $port,$r.TcpTestSucceeded)
}
Write-Host 'Completed. These checks do not change host configuration.'
