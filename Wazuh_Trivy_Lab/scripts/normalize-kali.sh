#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────
# normalize-kali.sh — Convert Trivy JSON to Wazuh-compatible JSONL
# Usage:  bash normalize-kali.sh [input.json] [output.jsonl]
# ──────────────────────────────────────────────────────────────
set -euo pipefail

INPUT="${1:-$HOME/trivy-wazuh/reports/kali-scan-bil.json}"
OUTPUT="${2:-/var/log/trivy/findings.jsonl}"
HOSTNAME="$(hostname)"

# Ensure output directory exists
sudo mkdir -p "$(dirname "$OUTPUT")"

echo "[*] Normalizing: $INPUT → $OUTPUT"

jq -c '
  .Results[]
  | .Target as $target
  | .Vulnerabilities[]?
  | {
      trivy: "vulnerability",
      scanner_host: "'"$HOSTNAME"'",
      target: $target,
      vulnerability_id: .VulnerabilityID,
      package: .PkgName,
      installed_version: .InstalledVersion,
      fixed_version: (.FixedVersion // "none"),
      severity: .Severity,
      title: .Title,
      source_report: "'"$(basename "$INPUT")"'"
    }
' "$INPUT" | sudo tee -a "$OUTPUT" > /dev/null

COUNT=$(wc -l < "$OUTPUT")
echo "[✓] Done — $COUNT total events in $OUTPUT"
