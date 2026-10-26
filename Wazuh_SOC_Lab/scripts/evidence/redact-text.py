#!/usr/bin/env python3
"""First-pass text IPv4 masking helper. Manual privacy review STILL required.

Usage: python3 scripts/evidence/redact-text.py source.txt redacted.txt
"""
import argparse
import ipaddress
import re
from pathlib import Path

IP_RE = re.compile(r'(?<![\w.])(?:\d{1,3}\.){3}\d{1,3}(?![\w.])')

def anonymize(text: str) -> str:
    def repl(match):
        try:
            ipaddress.IPv4Address(match.group(0))
        except ipaddress.AddressValueError:
            return match.group(0)
        return '192.168.x.x'
    return IP_RE.sub(repl, text)

def main():
    p = argparse.ArgumentParser()
    p.add_argument('source', type=Path)
    p.add_argument('target', type=Path)
    args = p.parse_args()
    if args.source.resolve() == args.target.resolve():
        p.error('Target must be a different file; original is preserved.')
    args.target.write_text(anonymize(args.source.read_text(encoding='utf-8')), encoding='utf-8')
    print('Created masked text copy. Review usernames, secrets and image contents manually.')

if __name__ == '__main__':
    main()
