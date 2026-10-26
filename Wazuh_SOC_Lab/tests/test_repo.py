"""Static repository checks (not Wazuh integration tests)."""
import importlib.util
import ipaddress
import re
import unittest
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
class RepoChecks(unittest.TestCase):
    def test_essential_files(self):
        for p in ('README.md','Wazuh_SOC_Home_Lab_Project_Report.md','docs/deployment.md',
                  'images/wazuh-soc-architecture.svg','images/wazuh-telemetry-pipeline.svg',
                  'images/incident-investigation.svg','images/screenshots/wazuh-threat-hunting-win10.png'):
            self.assertTrue((ROOT/p).is_file(),p)
    def test_xml_and_svg(self):
        for p in ROOT.rglob('*.svg'):
            ET.parse(p)
        for p in ROOT.rglob('*.xml'):
            # XML snippets can have multiple top-level sibling elements.
            ET.fromstring('<wrapper>' + p.read_text(encoding='utf-8') + '</wrapper>')
    def test_client_enrollment_nested(self):
        p=ROOT/'configs/windows11/client-example.xml'
        root=ET.parse(p).getroot()
        self.assertEqual(root.tag,'client')
        self.assertIsNotNone(root.find('enrollment'))
        self.assertEqual(root.findtext('enrollment/agent_name'),'WIN11-SOC-HOST')
    def test_sensitive_ip_literals_not_present(self):
        # Excludes intentional placeholder 192.168.x.x: concrete IPv4 are forbidden.
        regex=re.compile(r'(?<![\w.])(?:\d{1,3}\.){3}\d{1,3}(?![\w.])')
        extensions={'.md','.xml','.yml','.yaml','.py','.ps1','.sh','.svg','.rules','.example','.html'}
        for p in ROOT.rglob('*'):
            if not p.is_file() or (p.suffix not in extensions and p.name!='LICENSE'):
                continue
            for match in regex.finditer(p.read_text(encoding='utf-8')):
                try: ipaddress.IPv4Address(match.group())
                except ValueError: continue
                if match.group() in ('0.0.0.0','127.0.0.1'):
                    continue # Non-routable generic error/loopback constants, not device addresses
                self.fail(f'Concrete IPv4 address in {p.relative_to(ROOT)}: {match.group()}')
    def test_relative_markdown_file_links(self):
        link=re.compile(r'(?<!!)\[[^]]*\]\(([^)]+)\)')
        for p in ROOT.rglob('*.md'):
            text=p.read_text(encoding='utf-8')
            for url in link.findall(text):
                if url.startswith(('https://','http://','#','mailto:')):continue
                if not re.match(r'^(?:\.\.?/|docs/|images/|configs/|scripts/|tests/|Wazuh_SOC|README|LICENSE)',url): continue
                target=url.split('#')[0]
                if not target: continue
                self.assertTrue((p.parent/target).exists(),f'{p.relative_to(ROOT)} -> {target}')
    def test_redact_helper(self):
        path=ROOT/'scripts/evidence/redact-text.py'
        spec=importlib.util.spec_from_file_location('redact_text',path)
        module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
        test_ip='.'.join(['192','168','10','45'])
        self.assertIn('192.168.x.x',module.anonymize('src='+test_ip))
        self.assertNotIn(test_ip,module.anonymize('src='+test_ip))
if __name__=='__main__': unittest.main()
