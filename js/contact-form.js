// Contact form: instant feedback, no double sends, backup service, WhatsApp as last resort.
// 1) Web3Forms (main)  2) FormSubmit (backup)  3) WhatsApp link with the message prefilled
(function () {
    "use strict";

    var form = document.getElementById("contact-form");
    if (!form) return;

    var WEB3FORMS_KEY = "a770b792-77cf-40de-9766-4e53cce9b6bd"; // public key, safe in page code
    var WEB3FORMS_URL = "https://api.web3forms.com/submit";
    var FORMSUBMIT_URL = "https://formsubmit.co/ajax/manyangwaemails@gmail.com";
    var WHATSAPP = "https://wa.me/255767484562";

    var sw = (document.documentElement.lang || "").toLowerCase().indexOf("sw") === 0;
    var t = sw ? {
        sending: "Inatuma...",
        sent: "Ujumbe umetumwa kikamilifu! Tutawasiliana nawe hivi karibuni.",
        failed: "Samahani, huduma ya ujumbe haipatikani kwa sasa. Ujumbe wako bado upo, tuma kupitia WhatsApp:",
        offline: "Hakuna mtandao. Tafadhali angalia muunganisho wako.",
        whatsapp: "Tuma ujumbe huu WhatsApp",
        intro: "Habari Manyangwa, jina langu ni ",
        phone: "Simu", email: "Barua pepe", message: "Ujumbe"
    } : {
        sending: "Sending...",
        sent: "Message sent successfully! We will get back to you soon.",
        failed: "Sorry, our message service is unavailable right now. Your message is still here, send it on WhatsApp:",
        offline: "You are offline. Please check your connection.",
        whatsapp: "Send this message on WhatsApp",
        intro: "Hello Manyangwa, my name is ",
        phone: "Phone", email: "Email", message: "Message"
    };

    // Hidden spam trap: real people never tick it, bots often do
    var trap = document.createElement("input");
    trap.type = "checkbox";
    trap.name = "botcheck";
    trap.tabIndex = -1;
    trap.autocomplete = "off";
    trap.setAttribute("aria-hidden", "true");
    trap.style.display = "none";
    form.appendChild(trap);

    var button = form.querySelector('button[type="submit"]');
    var buttonHtml = button ? button.innerHTML : "";
    var busy = false;

    function field(name) {
        var el = form.elements[name];
        return el ? String(el.value || "").trim() : "";
    }

    function whatsappWithMessage() {
        var text = t.intro + field("name") + ".\n" +
            t.phone + ": " + field("phone") + "\n" +
            t.email + ": " + field("email") + "\n" +
            t.message + ": " + field("message");
        return WHATSAPP + "?text=" + encodeURIComponent(text);
    }

    function notify(type, text, waUrl) {
        var html = text;
        if (waUrl) {
            html += '<br><a href="' + waUrl + '" target="_blank" rel="noopener" style="text-decoration:underline;font-weight:600">' + t.whatsapp + "</a>";
        }
        if (window.toastr) {
            window.toastr[type](html, "", waUrl ? { timeOut: 0, extendedTimeOut: 0, closeButton: true, tapToDismiss: false } : {});
        } else {
            alert(text);
        }
    }

    function setBusy(on) {
        busy = on;
        if (!button) return;
        button.disabled = on;
        button.innerHTML = on
            ? '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>' + t.sending
            : buttonHtml;
    }

    // POST with a time limit; resolves true only when the service confirms success
    function post(url, body, timeoutMs) {
        var controller = window.AbortController ? new AbortController() : null;
        var timer = setTimeout(function () { if (controller) controller.abort(); }, timeoutMs);
        return fetch(url, {
            method: "POST",
            headers: { "Accept": "application/json" },
            body: body,
            signal: controller ? controller.signal : undefined
        })
            .then(function (res) {
                return res.json().catch(function () { return {}; }).then(function (json) {
                    return res.ok && json.success !== false && String(json.success) !== "false";
                });
            })
            .catch(function () { return false; })
            .then(function (ok) { clearTimeout(timer); return ok; });
    }

    function web3formsData() {
        var d = new FormData();
        d.append("access_key", WEB3FORMS_KEY);
        d.append("subject", "New website message from " + (field("name") || "a visitor"));
        d.append("from_name", "Manyangwa Website");
        d.append("name", field("name"));
        d.append("email", field("email"));
        d.append("phone", field("phone"));
        d.append("message", field("message"));
        d.append("page", window.location.pathname);
        return d;
    }

    function formsubmitData() {
        var d = new FormData();
        d.append("name", field("name"));
        d.append("email", field("email"));
        d.append("phone", field("phone"));
        d.append("message", field("message"));
        d.append("_subject", "New website message from " + (field("name") || "a visitor"));
        d.append("_template", "table");
        d.append("_captcha", "false");
        return d;
    }

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (busy) return;

        if (trap.checked) { form.reset(); return; } // bot: silently drop

        if (!navigator.onLine) {
            notify("error", t.offline);
            return;
        }

        setBusy(true);

        post(WEB3FORMS_URL, web3formsData(), 12000)
            .then(function (ok) {
                return ok || post(FORMSUBMIT_URL, formsubmitData(), 8000);
            })
            .then(function (ok) {
                if (ok) {
                    notify("success", t.sent);
                    form.reset();
                } else {
                    notify("error", t.failed, whatsappWithMessage());
                }
                setBusy(false);
            });
    });
})();
