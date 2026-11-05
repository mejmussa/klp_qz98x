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
        failed: "Ujumbe haukutumwa. Tafadhali jaribu tena au tuandikie WhatsApp.",
        timeout: "Mtandao ni wa polepole. Tafadhali jaribu tena au tuandikie WhatsApp.",
        offline: "Hakuna mtandao. Tafadhali angalia muunganisho wako.",
        whatsapp: "Tuandikie WhatsApp"
    } : {
        sending: "Sending...",
        sent: "Message sent successfully! We will get back to you soon.",
        failed: "Your message could not be sent. Please try again or message us on WhatsApp.",
        timeout: "The connection is slow. Please try again or message us on WhatsApp.",
        offline: "You are offline. Please check your connection.",
        whatsapp: "Message us on WhatsApp"
    };

    var button = form.querySelector('button[type="submit"]');
    var buttonHtml = button ? button.innerHTML : "";
    var busy = false;

    function notify(type, text, withWhatsApp) {
        var html = text;
        if (withWhatsApp) {
            html += '<br><a href="' + WHATSAPP + '" target="_blank" rel="noopener" style="text-decoration:underline">' + t.whatsapp + "</a>";
        }
        if (window.toastr) {
            window.toastr[type](html, "", withWhatsApp ? { timeOut: 10000, extendedTimeOut: 5000 } : {});
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
                        notify("error", t.failed, true);
                    }
                });
            })
            .catch(function (err) {
                notify("error", err && err.name === "AbortError" ? t.timeout : t.failed, true);
            })
            .then(function () {
                clearTimeout(timer);
                setBusy(false);
            });
    });
})();
