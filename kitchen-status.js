(function () {
    const kitchen = document.getElementById("kitchen-status");
    if (!kitchen) return;

    let courseStatus = null; let manualClosure = false;

    function updateKitchen() {
        const now = new Date();
        const day = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Europe/London",
            weekday: "long"
        }).format(now);

        const timeParts = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Europe/London",
            hour: "2-digit",
            minute: "2-digit",
            hourCycle: "h23"
        }).formatToParts(now);

        const hour = Number(timeParts.find(p => p.type === "hour").value);
        const minute = Number(timeParts.find(p => p.type === "minute").value);
        const time = hour * 60 + minute;

        const breakfast = ["Friday", "Saturday", "Sunday"].includes(day)
            && time >= 420 && time < 660;

        const mainMenu = ["Friday", "Saturday"].includes(day)
            && time >= 720 && time < 1170;

        if (courseStatus === null) {
            kitchen.textContent = "KITCHEN STATUS UNKNOWN";
            kitchen.className = "font-bold uppercase text-gray-400";
        } else if (manualClosure) {
            kitchen.textContent = "KITCHEN CLOSED";
            kitchen.className = "font-bold uppercase text-red-400";
        } else if (breakfast || mainMenu) {
            kitchen.textContent = breakfast ? "BREAKFAST AVAILABLE" : "FOOD AVAILABLE";
            kitchen.className = "font-bold uppercase text-green-400";
        } else {
            kitchen.textContent = "KITCHEN CLOSED";
            kitchen.className = "font-bold uppercase text-gray-400";
        }
    }

    async function refreshKitchen() {
        try {
            const response = await fetch("/api/course-status", {
                cache: "no-store"
            });
            if (!response.ok) throw new Error("Course status unavailable");
            const data = await response.json(); if (data.error || typeof data.sanityStatus !== "string" || typeof data.status !== "string") throw new Error("Course status unavailable");
            manualClosure = data.sanityStatus === "closed"; courseStatus = typeof data.status === "string"
                ? data.status
                : null;
        } catch (error) {
            manualClosure = false;
            courseStatus = null;
        }

        updateKitchen();
    }

    refreshKitchen();
    setInterval(refreshKitchen, 60000);
    setInterval(updateKitchen, 1000);
})();
