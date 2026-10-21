const bookingForm = document.querySelector("#booking-form");

if (bookingForm) {
    const dateField = bookingForm.querySelector("#booking-date");
    const status = bookingForm.querySelector("#booking-status");
    const fallbackLink = bookingForm.querySelector("#booking-email-fallback");
    const bookingEmail = "hello@example.com";
    const today = new Date();
    const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 10);

    dateField.min = localToday;

    bookingForm.addEventListener("submit", event => {
        event.preventDefault();
        if (!bookingForm.reportValidity()) return;

        const formData = new FormData(bookingForm);
        const details = [
            `Name: ${formData.get("name")}`,
            `Email: ${formData.get("email")}`,
            `Phone: ${formData.get("phone") || "Not provided"}`,
            `Preferred date: ${formData.get("date")}`,
            `Preferred time: ${formData.get("time")}`,
            `Guests: ${formData.get("guests")}`,
            `Notes: ${formData.get("notes") || "None"}`
        ].join("\n");
        const subject = encodeURIComponent(`Table request for ${formData.get("name")}`);
        const body = encodeURIComponent(details);
        const mailto = `mailto:${bookingEmail}?subject=${subject}&body=${body}`;

        fallbackLink.href = mailto;
        fallbackLink.hidden = false;
        status.textContent = "Your email app should open with the request. Review it and press Send. If it doesn't open, use the link below; the table is not confirmed until the café replies.";
        window.location.href = mailto;
    });
}
