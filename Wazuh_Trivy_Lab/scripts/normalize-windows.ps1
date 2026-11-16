# ──────────────────────────────────────────────────────────────
# normalize-windows.ps1 — Convert Trivy JSON to Wazuh-compatible JSONL
# Usage:  powershell -File normalize-windows.ps1 [-InputFile path] [-OutputFile path]
# ──────────────────────────────────────────────────────────────
param(
    [string]$InputFile  = "C:\TrivyLab\reports\windows-scan.json",
    [string]$OutputFile = "C:\TrivyLab\logs\findings.jsonl"
)

$ErrorActionPreference = "Stop"

# Ensure output directory exists
$outDir = Split-Path -Parent $OutputFile
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}

Write-Host "[*] Normalizing: $InputFile -> $OutputFile"

$report = Get-Content -Raw $InputFile | ConvertFrom-Json
$hostname = $env:COMPUTERNAME
$sourceReport = Split-Path -Leaf $InputFile
$count = 0

foreach ($result in $report.Results) {
    $target = $result.Target
    foreach ($vuln in $result.Vulnerabilities) {
        $event = [ordered]@{
            trivy              = "vulnerability"
            scanner_host       = $hostname
            target             = $target
            vulnerability_id   = $vuln.VulnerabilityID
            package            = $vuln.PkgName
            installed_version  = $vuln.InstalledVersion
            fixed_version      = if ($vuln.FixedVersion) { $vuln.FixedVersion } else { "none" }
            severity           = $vuln.Severity
            title              = $vuln.Title
            source_report      = $sourceReport
        }
        $line = $event | ConvertTo-Json -Compress
        Add-Content -Path $OutputFile -Value $line -Encoding UTF8
        $count++
    }
}

Write-Host "[OK] Done - $count events written to $OutputFile"
