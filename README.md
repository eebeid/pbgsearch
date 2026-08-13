# PBG Website — Client Update Guide

This website is designed so you can make content updates **without touching any code**.
All content lives in a single file: **`content.json`**

---

## 📁 File Overview

| File | What it does |
|------|-------------|
| `index.html` | The website structure — rarely needs changes |
| `index.css` | Visual styles — rarely needs changes |
| `main.js` | Website logic — rarely needs changes |
| **`content.json`** | ✅ **This is where you make all updates** |
| `README.md` | This guide |

---

## ✏️ How to Edit content.json

### Option A — Using a Text Editor
1. Open `content.json` in **any text editor** (Notepad, TextEdit, VS Code, etc.)
2. Find the text you want to change
3. Edit the text **between the quotation marks only**
4. Save the file
5. Deploy (see Deployment section below)

### Option B — Using VS Code (Recommended)
VS Code is free and makes JSON editing easy. Download at [code.visualstudio.com](https://code.visualstudio.com/)

---

## 🔧 Common Updates

### Update Phone Numbers or Email Addresses
Find the team member in the `"team"` section:
```json
"office": "(202) 853-9131",
"mobile": "(202) 251-2966",
"email":  "apollack@pbgsearch.com"
```
Change the values between the quotes.

---

### Update a Team Bio
Find the team member in the `"team"` array and edit `"bio_short"` or `"bio_full"`:
```json
{
  "name":      "Abe Pollack",
  "title":     "Co-Founder & Principal",
  "bio_short": "Short preview shown on the card...",
  "bio_full":  "Full bio shown in the popup when clicking 'Full Bio'..."
}
```
For `bio_full`, you can add paragraph breaks using `\n\n` (two backslashes + two n's).

---

### Add a New Team Member
Copy an existing team member block and add it inside the `"team": [ ]` array:
```json
{
  "name":      "Jane Smith",
  "title":     "Senior Recruiter",
  "photo":     "assets/team/jane-smith.jpg",
  "bio_short": "Jane has 15 years of experience...",
  "bio_full":  "Jane's full biography goes here...",
  "office":    "(202) 555-0100",
  "mobile":    "",
  "email":     "jsmith@pbgsearch.com",
  "linkedin":  "https://www.linkedin.com/in/jane-smith"
}
```
**Don't forget** to add a comma after the previous team member's closing `}` before adding the new one.

---

### Add or Remove a Job Listing
Job listings are in the `"openings"` section under `"jobs": [ ]`.

**To add a job**, copy this block and fill it in:
```json
{
  "title":       "Lateral Associate — Litigation",
  "firm":        "AmLaw 100 Firm",
  "location":    "Washington, DC",
  "type":        "Law Firm",
  "class_years": "3–6 years",
  "description": "Brief description of the role...",
  "apply_url":   "#contact"
}
```
Set `"apply_url"` to `"#contact"` to send applicants to your contact form, or use a full URL to an external listing.

**To remove a job**, delete its entire block (from `{` to `}`, including the comma after it).

**If there are no current openings**, just empty the array:
```json
"jobs": []
```
The site will automatically display your `empty_message` text instead.

---

### Update the "Current Openings" Empty Message
```json
"openings": {
  "empty_message": "No current openings at this time. Please check back soon or reach out directly..."
}
```

---

### Update Office Address or Main Contact Info
Find the `"contact"` section:
```json
"contact": {
  "address_line1": "2600 Virginia Avenue NW",
  "address_line2": "Suite 1111",
  "address_city":  "Washington, DC 20037",
  "phone_main":    "(202) 853-9131",
  "email_general": "info@pbgsearch.com"
}
```

---

### Enable Contact Form Email Delivery (Formspree)
1. Go to [formspree.io](https://formspree.io) and create a free account
2. Create a new form and copy your **Form ID** (looks like `xabc1234`)
3. In `content.json`, find `"formspree_id"` and replace the placeholder:
```json
"formspree_id": "xabc1234"
```
Form submissions will now be emailed directly to you.

---

## ⚠️ JSON Rules to Follow

- Always keep quotation marks `"` around text values
- Don't delete commas between items in a list
- Don't add trailing commas after the last item in a list
- If unsure, paste your file into [jsonlint.com](https://jsonlint.com/) to check for errors

---

## 🚀 How to Deploy Updates

### Option A — Netlify Drop (Easiest, Zero Cost)
1. Go to [netlify.com/drop](https://app.netlify.com/drop)
2. Drag your entire **pbgsearch** folder onto the page
3. Your site is live instantly with a Netlify URL
4. For a custom domain, go to Netlify → Domain settings

### Option B — GitHub Pages
1. Push changes to your GitHub repository
2. Site automatically updates in ~1 minute

### Option C — Any Web Host
Upload all files via FTP to your web host's `public_html` or `www` folder.

> **Note:** When testing locally by double-clicking `index.html`, content may not load (browser security).
> Use a local server instead: run `npx serve .` in the folder, then open `http://localhost:3000`

---

## 🆘 Need Help?

If something breaks, the most common cause is a JSON formatting error.
Paste your `content.json` into [jsonlint.com](https://jsonlint.com/) — it will show you exactly where the problem is.

---

*Last updated: 2024*
