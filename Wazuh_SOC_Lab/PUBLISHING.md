# Publishing this repository to GitHub

The original [Splunk repository](https://github.com/shii9/SOC_Lab_Setup_Splunk) is a separate project and should **not be overwritten**. This folder is prepared as a new public repository named `SOC_Lab_Setup_Wazuh`.

## Before publishing

1. Review every Markdown document, script, image, diagram and screenshot in this folder.
2. Run the static validation commands:

   ```bash
   python3 -m unittest discover -s tests -v
   bash -n scripts/ubuntu/*.sh scripts/kali/*.sh
   ```

3. Do not upload filled-in `.env` files, genuine IP addresses, enrollment keys, Wazuh passwords, certificates, user records, Windows event exports or other sensitive logs.
4. Verify each image does not expose personal or lab network details. The provided screenshots were selected because no real IP address is visible in them.
5. The full report clearly distinguishes proven telemetry from pending Windows 11 raw-event verification.

## Option A — GitHub website

1. Create an empty repository named `SOC_Lab_Setup_Wazuh` in your GitHub account.
2. Extract the ZIP onto your local computer.
3. Upload the **contents of the `SOC_Lab_Setup_Wazuh` directory**, preserving the file/folder structure, and commit.
4. Preview `README.md` on GitHub: SVG architecture images and relative links should render there.

## Option B — GitHub CLI / Git

From **inside** the extracted folder, after authenticating locally with GitHub CLI:

```bash
git init
git add .
git commit -m "docs: publish Wazuh SOC home lab architecture and deployment"
git branch -M main
gh repo create shii9/SOC_Lab_Setup_Wazuh --public --source . --remote origin --push
```

**Do not run the `gh repo create` command if the repository already exists.** In that case use a normal remote and `git push`, after checking existing history. The ZIP creation itself does **not** create or modify any GitHub repository.

## Local interactive architecture preview

Open `site/index.html` in a modern browser. The page uses relative paths to original SVG assets; it requires no API keys or live Wazuh access. For publication as a website, deploy the `site/` page and its referenced image paths together using an appropriate static site configuration.

## Repository details suggestion

- **Description:** `Ubuntu-hosted Wazuh 4.14.9 SOC home lab with Windows 10 Sysmon, Kali journald, Windows 11 agents, architecture diagrams, detection engineering, and verification.`
- **Topics:** `wazuh`, `soc`, `blue-team`, `siem`, `sysmon`, `linux-security`, `cybersecurity-lab`, `detection-engineering`, `incident-response`, `vmware`.
- **License:** MIT for this repository's original documentation/scripts/diagrams. Third-party software retains its own licenses.
