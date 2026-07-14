# CIS Grid — cisgrid.org

A conversational design diagnostic for Climate Information Services. It walks a team through six design dimensions, records a self-assessment from 0 to 3 on each of thirty questions, and returns a heuristic reading: a hexagonal radar, a per-dimension verdict, and the design brief each gap generates.

The instrument implements the conversational tool described in §9 of the study *From Forecast to Decision* (Di Dio, La Scala, Jamaldeen, Weigel & Schillaci). Designed and developed by **Domenico Schillaci**.

Everything runs client-side in `index.html`. No build step, no framework, no server.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole site: landing, framework, privacy policy, contact, interview, report. |
| `apps-script.gs` | Google Apps Script that receives the anonymous scores and appends them to your Sheet. |
| `og-image.png` | Social preview image, referenced by the Open Graph tags. |
| `LICENSE` | MIT for the code, CC BY-SA 4.0 for the diagnostic content. |

## What it collects, and what it never collects

Written notes never leave the device: they are held in the browser so an interview can be resumed, and they are never transmitted. The report is generated locally.

Before the interview begins, the user is asked whether to contribute to the research. Only on consent, and only when they finish or leave, the tool sends the thirty 0–3 ratings, the six dimension averages, the dimension reached, whether they completed, whether they downloaded the report, and a random session identifier. No name, no email, no IP, no free text. Declining leaves the tool fully usable.

Visits and referrers are counted by GoatCounter, which sets no cookies and stores no personal data. This is why the site needs no cookie banner. GoatCounter answers "who arrives"; the Sheet answers "what they do".

## Before you publish — five values to set

Open `index.html`, find the `CONFIG` block near the top of the script, and fill in:

| Key | Where it comes from |
| --- | --- |
| `COLLECTOR_URL` | The `/exec` URL of your deployed Apps Script web app. |
| `COLLECTOR_KEY` | A long random string. Must match `SECRET` in `apps-script.gs`. |
| `WEB3FORMS_KEY` | The access key from web3forms.com (free). |
| `CONTACT_EMAIL` | Currently `salvatore.didio@unipa.it`. Change if enquiries go elsewhere. |
| `REPO_URL` | The public GitHub repository URL, shown in the footer credit. |

Also replace `YOURCODE` in the GoatCounter `<script>` tag in `<head>`.

Until a key is filled, its feature degrades safely: no collector URL means nothing is sent even with consent; no Web3Forms key means the contact form falls back to opening the user's email client; no GoatCounter code means no counting. The interview always works.

## 1. Set up the research collector (Google Sheets)

1. Create a Google Sheet and copy its ID from the URL (`.../spreadsheets/d/<ID>/edit`).
2. In the Sheet: Extensions → Apps Script. Delete the default code, paste `apps-script.gs`.
3. Fill `SHEET_ID` and `SECRET` (invent a long random string).
4. Deploy → New deployment → Web app. Execute as **Me**, access **Anyone**. Authorise when prompted.
5. Copy the `/exec` URL into `CONFIG.COLLECTOR_URL`, and the same secret into `CONFIG.COLLECTOR_KEY`.

The Sheet creates a `responses` tab with one row per session: timestamp, session id, status (completed or abandoned), the dimension reached, whether the report was downloaded, the six dimension averages, and the thirty raw ratings. That is the corpus.

After any edit to the script, re-deploy as a **new version**, or the old code keeps running.

## 2. Set up analytics (GoatCounter)

Create a free account at goatcounter.com, choose a site code, and put it in the `data-goatcounter` attribute. The events `interview-start`, `dimension-D1-complete` … `dimension-D6-complete`, `interview-complete`, `report-download` and `contact-sent` appear in the dashboard. The free hosted plan covers non-commercial and research use.

## 3. Set up the contact form (Web3Forms)

Create a free access key at web3forms.com with the destination email address, and paste it into `CONFIG.WEB3FORMS_KEY`. Messages arrive in that inbox; nothing is stored on the site.

## 4. Publish on GitHub Pages

1. Create a **public** repository, for example `cisgrid`.
2. Upload `index.html`, `og-image.png`, `LICENSE`, `apps-script.gs`, `README.md` to the root.
3. Settings → Pages → Source: *Deploy from a branch*, branch `main`, folder `/ (root)`.
4. Settings → Pages → Custom domain: enter `cisgrid.org` and save. This writes a `CNAME` file into the repository.
5. Tick **Enforce HTTPS** once the certificate has been issued (it can take up to an hour).

## 5. Point the OVH domain at GitHub Pages

In the OVH control panel: Domain names → cisgrid.org → DNS zone.

Add four A records for the apex domain (`cisgrid.org`, leave the subdomain field empty), pointing to GitHub Pages:

```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

Add one CNAME record for `www`, pointing to `<your-github-username>.github.io.` (note the trailing dot).

Delete any pre-existing A or CNAME record on the apex left over from OVH's parking page, or it will conflict. DNS propagation usually takes minutes, occasionally hours. Verify the four A records against GitHub's own documentation before saving, in case the addresses have changed.

## 6. Test before announcing

Run one full pass on the live domain, not on the local file. Voice recognition needs `https://`, so it will behave correctly only once published.

- The consent screen appears first, and declining still lets the interview run.
- Each dimension shows its explanation, then five questions with an example and the 0–3 scale.
- Leaving mid-interview and returning offers **Resume**, with the answers intact.
- The radar renders six labelled axes and the two lowest dimensions are named as priorities.
- The PDF downloads; the contact form returns a success message and the email arrives.
- With consent given, a row appears in the Sheet on completion; abandoning mid-way writes an `abandoned` row with the dimension reached.
- On Chrome, read-aloud and dictation work; on Firefox, dictation is hidden with a note to type.

## Launch checklist beyond the site

- Replace the placeholder in §9 of the manuscript (`available at: zzzzzzzz`) with `cisgrid.org`.
- Add the Data Protection Officer contact for the University of Palermo to the privacy policy, where the page currently shows a marked placeholder.
- Add the full citation and DOI in the footer and in `LICENSE` once the article is published.
- Set `REPO_URL` so the footer credit links to the public repository.
- Run a pilot with two or three teams before circulating the link widely, to check the questions read correctly outside the authors' context.

## Known limits

The engine is deterministic: the reading maps your scores onto the article's briefs, red flags and good-design signals, and does not generate free prose per team. An optional AI pass on the final narrative is the natural next step; it was left out to keep the tool free and to keep answers on the device.

The interview covers the v1 thirty-question protocol. The v2 sub-protocols (human relay, three-scale temporality, failure-mode rehearsal, epistemic provenance) inform the explanations and the briefs but are not added as extra questions, which keeps the radar hexagonal and the sitting short.

## Licence

Code MIT, content CC BY-SA 4.0. Anyone who adapts the diagnostic content must
release the adaptation under the same licence. See `LICENSE`.

Because the diagnostic content derives from a co-authored study, confirm the
ShareAlike choice with the co-authors before publishing the repository.
