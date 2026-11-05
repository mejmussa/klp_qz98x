// Contact form: instant feedback, no double sends, timeout with WhatsApp fallback.
(function () {
    "use strict";

    var form = document.getElementById("contact-form");
    if (!form) return;

    var ENDPOINT = "https://formsubmit.co/ajax/manyangwaemails@gmail.com";
    var TIMEOUT_MS = 15000;
    var WHATSAPP = "https://wa.me/255767484562";

    var sw = (document.documentElement.lang || "").toLowerCase().indexOf("sw") === 0;
    var t = sw ? {
        sending: "Inatuma...",
        sent: "Ujumbe umetumwa kikamilifu! Tutawasiliana nawe hivi karibuni.",
        failed: "Samahani, huduma ya ujumbe haipatikani kwa sasa. Ujumbe wako bado upo, tuma kupitia WhatsApp:",
        timeout: "Samahani, huduma ya ujumbe haijibu kwa sasa. Ujumbe wako bado upo, tuma kupitia WhatsApp:",
        offline: "Hakuna mtandao. Tafadhali angalia muunganisho wako.",
        whatsapp: "Tuma ujumbe huu WhatsApp",
        intro: "Habari Manyangwa, jina langu ni ",
        phone: "Simu", email: "Barua pepe", message: "Ujumbe"
    } : {
        sending: "Sending...",
        sent: "Message sent successfully! We will get back to you soon.",
        failed: "Sorry, our message service is unavailable right now. Your message is still here, send it on WhatsApp:",
        timeout: "Sorry, our message service is not responding right now. Your message is still here, send it on WhatsApp:",
        offline: "You are offline. Please check your connection.",
        whatsapp: "Send this message on WhatsApp",
        intro: "Hello Manyangwa, my name is ",
        phone: "Phone", email: "Email", message: "Message"
    };

    // WhatsApp link with the visitor's form details already typed in
    function whatsappWithMessage(data) {
        var text = t.intro + (data.get("name") || "") + ".\n" +
            t.phone + ": " + (data.get("phone") || "") + "\n" +
            t.email + ": " + (data.get("email") || "") + "\n" +
            t.message + ": " + (data.get("message") || "");
        return WHATSAPP + "?text=" + encodeURIComponent(text);
    }

    var button = form.querySelector('button[type="submit"]');
    var buttonHtml = button ? button.innerHTML : "";
    var busy = false;

    function notify(type, text, withWhatsApp, waUrl) {
        var html = text;
        if (withWhatsApp) {
            html += '<br><a href="' + (waUrl || WHATSAPP) + '" target="_blank" rel="noopener" style="text-decoration:underline;font-weight:600">' + t.whatsapp + "</a>";
        }
        if (window.toastr) {
            window.toastr[type](html, "", withWhatsApp ? { timeOut: 0, extendedTimeOut: 0, closeButton: true, tapToDismiss: false } : {});
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

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        if (busy) return;

        if (!navigator.onLine) {
            notify("error", t.offline, true);
            return;
        }

        var data = new FormData(form);
        data.append("_subject", "New website message from " + (data.get("name") || "a visitor"));
        data.append("_template", "table");
        data.append("_captcha", "false");

        var controller = window.AbortController ? new AbortController() : null;
        var timer = setTimeout(function () { if (controller) controller.abort(); }, TIMEOUT_MS);

        setBusy(true);

        fetch(ENDPOINT, {
            method: "POST",
            headers: { "Accept": "application/json" },
            body: data,
            signal: controller ? controller.signal : undefined
        })
            .then(function (res) {
                return res.json().catch(function () { return {}; }).then(function (json) {
                    if (res.ok && String(json.success) !== "false") {
                        notify("success", t.sent, false);
                        form.reset();
                    } else {
                        notify("error", t.failed, true, whatsappWithMessage(data));
                    }
                });
            })
            .catch(function (err) {
                notify("error", err && err.name === "AbortError" ? t.timeout : t.failed, true, whatsappWithMessage(data));
            })
            .then(function () {
                clearTimeout(timer);
                setBusy(false);
            });
    });
})();
