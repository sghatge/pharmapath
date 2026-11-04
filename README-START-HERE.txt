PHARMAPATH PATHOLOGY LAB — WEBSITE + APP (FINAL)
=================================================
One folder = website + installable Android/iPhone app (PWA). No WordPress, no database.
Every booking, report request and medicine enquiry opens WhatsApp to 91728 99472.

FILES
  index.html        Main site (all sections)
  data.js           <-- EDIT THIS to change prices, packages, tests, hours
  app.js / style.css  Logic and design (no need to touch)
  privacy.html, terms.html, offline.html
  manifest.json, sw.js, icons/   App install + offline support
  robots.txt, sitemap.xml        Google SEO
  .well-known/assetlinks.json    Needed only for the Play Store app (step 4)

-------------------------------------------------
STEP 1 — CONFIRM WITH CLIENT BEFORE GOING LIVE
-------------------------------------------------
[ ] One official business name (posters use 4 different names)
[ ] Package prices and tests; is ₹5,400 a genuine earlier price for C Pro? If not, delete  mrp:5400  in data.js
[ ] Real hours (site says "Open 24 hours")
[ ] Gym Fitness package tests + price
[ ] Individual test prices (currently "Price on request")
[ ] Pharmacy licence no. / lab registration no. (add to footer)
[ ] Real logo file (replace icons/logo.svg and the PNG icons)

-------------------------------------------------
STEP 2 — PUT IT ONLINE (pick ONE)
-------------------------------------------------
A) FREE, 5 minutes — Netlify
   1. Go to app.netlify.com/drop
   2. Drag this whole folder onto the page -> you get https://xxxx.netlify.app
   3. Later: Site settings > Domain > add pharmapathlab.in (HTTPS is automatic)

B) FREE — GitHub Pages (github.com/sghatge)
   1. New repo "pharmapath" -> upload all files (include the .well-known folder)
   2. Settings > Pages > Branch: main / root -> Save
   3. Live at https://sghatge.github.io/pharmapath/

C) Paid hosting (Hostinger etc.) — upload all files into public_html via File Manager.

Domain: buy pharmapathlab.in (~₹700–1,100/yr; check price at checkout). DNS can take a few hours up to 48h.
If you use a different domain, find/replace "pharmapathlab.in" in index.html, robots.txt, sitemap.xml.

-------------------------------------------------
STEP 3 — APP ON PHONES (works the day the site is live)
-------------------------------------------------
Android (Chrome): open the site -> "Install" banner appears, or menu > Install app.
iPhone (Safari): Share > Add to Home Screen.
Test: install, turn on airplane mode, reopen -> site still opens.

-------------------------------------------------
STEP 4 — GOOGLE PLAY STORE (optional, ~3 weeks)
-------------------------------------------------
1. Client creates Google Play Console account in Pharmapath's name (US$25 one-time).
2. pwabuilder.com -> enter live URL -> Package for Android -> package id: in.pharmapathlab.app
3. Copy the SHA-256 fingerprint PWABuilder gives you into .well-known/assetlinks.json, re-upload.
4. Upload the .aab to Play Console. Needs: privacy policy URL (https://YOURDOMAIN/privacy.html),
   health-app declaration, screenshots, icon (icons/icon-512.png).
5. New personal accounts: closed test with 12+ testers for 14 days before public release.

APPLE APP STORE: Apple rejects apps that only wrap a website (Guideline 4.2) and may require an
organisation account (D-U-N-S) for health apps. Recommend the "Add to Home Screen" app for iPhone for now.

-------------------------------------------------
STEP 5 — GOOGLE MAPS / SEO
-------------------------------------------------
1. Google Business Profile with the SAME name, address, phone as the site; add website link.
2. search.google.com/search-console -> add domain -> submit sitemap.xml
3. Ask real patients for reviews (no incentives, never write them yourself).

-------------------------------------------------
UPDATING PRICES LATER
-------------------------------------------------
Open data.js in Notepad -> change numbers -> save -> re-upload data.js.
Also open sw.js and change  pp-v1  to  pp-v2  (so installed apps fetch the update).

PRIVACY — IMPORTANT
Do NOT put patient reports on the website (e.g. /reports/9172899472.pdf). Anyone could download
them by guessing a number. Reports go on WhatsApp to the registered number only.
