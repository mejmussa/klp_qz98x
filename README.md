# Manyangwa Company Limited – Website

Company website for **Manyangwa Co. Ltd**, a Tanzanian manufacturer of Skim Coat wall putty, Spectrum Paints and SpecTex wall texture.

- **Live site:** https://www.manyangwa.co.tz
- **Repository:** https://github.com/mejmussa/klp_qz98x
- **Type:** static HTML site (no build step, no server code)
- **Languages:** English and Kiswahili

---

## 1. Key details at a glance

| Item | Value |
|---|---|
| Domain | `www.manyangwa.co.tz` (the bare `manyangwa.co.tz` redirects to it) |
| Hosting | GitHub Pages, from the `main` branch, root folder |
| HTTPS | GitHub Pages certificate covering `manyangwa.co.tz` and `www.manyangwa.co.tz`; "Enforce HTTPS" is on |
| Phone / WhatsApp | **+255 767 484 562** |
| Public email shown on site | info@manyangwa.co.tz |
| Contact form service (main) | **Web3Forms**, form "manyangwa.co.tz", sends to `manyangwaemails@gmail.com` |
| Contact form service (backup) | FormSubmit, sends to `manyangwaemails@gmail.com` |

---

## 2. Contact form (how website messages reach email)

The form is on **Home** and **Contact Us** in both languages (`index.html`, `contact.html`, `sw-index.html`, `sw-contact.html`). All four use one shared script: **`js/contact-form.js`**.

### How a message is sent

1. **Web3Forms** (main service). If it confirms, the visitor sees "Message sent successfully!".
2. If Web3Forms fails, the script automatically tries **FormSubmit** (backup).
3. If both fail, the visitor gets an error with a **"Send this message on WhatsApp"** link. Their name, phone, email and message are already typed into WhatsApp, so no enquiry is lost.

Also built in:

- The button shows "Sending…" and is locked while sending, so visitors can't send duplicates.
- Time limits: 12 seconds for Web3Forms, then 8 seconds for FormSubmit.
- A hidden `botcheck` field catches spam bots.
- Messages switch automatically between English and Kiswahili based on the page's `<html lang="...">`.

### Web3Forms (main service)

| Setting | Value |
|---|---|
| Website | https://web3forms.com (dashboard: https://app.web3forms.com) |
| Account / login email | `manyangwaemails@gmail.com` |
| Form name | `manyangwa.co.tz` |
| Access key | `a770b792-77cf-40de-9766-4e53cce9b6bd` |
| Messages delivered to | `manyangwaemails@gmail.com` |
| Free plan limit | 250 submissions per month |
| Email subject | `New website message from <visitor name>` |
| Fields sent | name, email, phone, message, page |

The access key is **public by design**. Web3Forms intends it to sit in website code, so it's safe in this repository.

**To change which inbox receives messages:** log in to the Web3Forms dashboard and change the form's email. No website change is needed.

**To use a new access key:** edit this line in `js/contact-form.js`:

```js
var WEB3FORMS_KEY = "a770b792-77cf-40de-9766-4e53cce9b6bd";
```

### FormSubmit (backup service)

| Setting | Value |
|---|---|
| Website | https://formsubmit.co |
| Endpoint | `https://formsubmit.co/ajax/manyangwaemails@gmail.com` |
| Messages delivered to | `manyangwaemails@gmail.com` |

FormSubmit was unreliable in November 2026: its servers returned "522" errors. That's why it is now only the backup. To hide the email address from the page code, FormSubmit can give you a random alias. Use it in place of the email in `FORMSUBMIT_URL` in `js/contact-form.js`.

### WhatsApp

- The number used by the WhatsApp button and the form fallback is set in `js/contact-form.js`:

  ```js
  var WHATSAPP = "https://wa.me/255767484562";
  ```

- The green floating WhatsApp button (bottom right) is a link in every HTML page with the class `whatsapp-float`. English pages pre-type an English greeting and Kiswahili pages a Kiswahili one.

### Testing the form

1. Open https://www.manyangwa.co.tz/contact.html and send a real message.
2. Check the inbox (`manyangwaemails@gmail.com`). If nothing arrives, check **Spam** and mark the message "Not spam".
3. Automated "headless" browsers are blocked by Web3Forms' security, so test in a normal browser.

---

## 3. Phone numbers and contact details

The phone number appears in two places on **every page**: "Call Us" in the header, and the footer. Both are tap-to-call links:

```html
<a href="tel:+255767484562" class="text-reset">+255 767 484 562</a>
```

To change the number, search all `.html` files for `255767484562` and `+255 767 484 562`, and also update `js/contact-form.js`.

The slider and promo **images** have other numbers printed inside them (+255 659 213 333 / +255 659 186 666). Changing those needs new images from a designer.

---

## 4. Project structure

```
index.html, about.html, service.html, team.html,
testimonial.html, contact.html, 404.html     English pages
sw-*.html                                    Kiswahili versions of the same pages
css/bootstrap.min.css                        Bootstrap 5.0.0 (customised)
css/style.css                                Site styles (incl. WhatsApp button)
js/main.js                                   Navbar, counters, carousels
js/contact-form.js                           Contact form sending logic
lib/                                         Self-hosted libraries (see below)
img/                                         Images (optimised JPGs)
pwa/manifest.json, pwa/icons/                Installable app ("Install App") settings
service-worker.js                            Offline/caching for the installable app
CNAME                                        Custom domain for GitHub Pages
scss/                                        Bootstrap source (not used at runtime)
```

### Self-hosted libraries (`lib/`)

Everything loads from the site itself. Nothing comes from outside CDNs except the Google Map embed and the form services.

| Library | Version | Path |
|---|---|---|
| jQuery | 3.7.1 | `lib/jquery/` |
| Bootstrap JS | 5.0.2 (matches the 5.0.0 CSS) | `lib/bootstrap/` |
| Font Awesome | 5.15.4 | `lib/fontawesome/` |
| Open Sans font | Latin subsets | `lib/fonts/` |
| Toastr (pop-up messages) | 2.1.4 | `lib/toastr/` |
| Owl Carousel, Waypoints, CounterUp, Lightbox | template versions | `lib/...` |

`lib/animate` and `lib/wow` are no longer used by any page and can be deleted.

---

## 5. Languages (English / Kiswahili)

- Each page has a Kiswahili copy with the prefix `sw-` (for example `about.html` and `sw-about.html`).
- The **EN / SW** button in the navbar saves the choice in the browser (`localStorage` key `siteLang`) and opens the same page in the other language straight away. There is no Save button.
- When a visitor opens a page in the wrong language for their saved choice, it redirects automatically.
- **When you edit text, update both versions of the page.**

---

## 6. Installable app and caching (`service-worker.js`)

- **Pages (HTML)** are always fetched fresh when online, so visitors never see an outdated page. The cached copy is used only when offline.
- **CSS, JS, fonts and images** are served from the visitor's device cache, so repeat visits open instantly. They update in the background.
- **Important:** after changing CSS, JS or images, returning visitors see the change on their **second** visit. To force everyone to get it immediately, increase the version at the top of `service-worker.js`:

  ```js
  const VERSION = "v4";   // change to "v5", "v6", ...
  ```

---

## 7. Hosting, domain and HTTPS

- Hosting is **GitHub Pages**: repository → Settings → Pages → *Deploy from a branch* → `main` / `(root)`.
- The custom domain is set to `www.manyangwa.co.tz` (also stored in the `CNAME` file).
- DNS (at the domain registrar):
  - `manyangwa.co.tz`: A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
  - `www.manyangwa.co.tz`: CNAME `mejmussa.github.io`
- **If the "Not secure" warning appears on the bare domain:** in Settings → Pages, click **Remove** on the custom domain, re-enter `www.manyangwa.co.tz`, **Save**, wait for the certificate, then tick **Enforce HTTPS**.
- **Renew the `.co.tz` domain** before it expires; multi-year renewal and auto-renew are recommended. An expired domain takes the whole site offline.

---

## 8. Publishing changes

1. Edit the files.
2. Commit and push to `main`:

   ```bash
   git add -A
   git commit -m "Describe the change"
   git push origin main
   ```

3. GitHub Pages publishes in about 1 minute. Press **Ctrl + F5** to see the new version.

### Performance rules (keep the site fast)

- Resize photos before adding them: about **1920 px wide for full-width banners** and about **1200 px for others**, saved as JPG at quality around 80. Never upload multi-megabyte PNG photos.
- Add `loading="lazy" decoding="async"` to images below the first screen.
- Don't add scroll/fade-in animation libraries back. They make the page appear piece by piece.
- Prefer files in `lib/` over new external CDN links.

---

## 9. Known to-dos

- Social media icons in the top bar (Facebook, Twitter, LinkedIn, Instagram) have empty links (`href=""`). Add the real profile URLs.
- The breadcrumb links under page titles use `text-secondary` and are hard to read on the dark header.
- Unused images such as `testimonial-2.jpg` and `testimonial-7.jpg`, and unused libraries (`lib/animate`, `lib/wow`), can be removed.
- Optional: set up free uptime monitoring (for example UptimeRobot) to get an email if the site goes down.
