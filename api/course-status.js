export default async function handler(req, res) {
    try {
        const sanityUrl =
            "https://c54r3a5t.api.sanity.io/v2024-03-01/data/query/production?query=" +
            encodeURIComponent(`*[_type == "clubSettings" && _id == "clubSettings"][0]{
                courseStatus,
                showNotice,
                clubNotice,
                competitionNotice,
                eventsNotice,
                visitorsNotice
            }`);

        const sanityResponse = await fetch(sanityUrl);
        const sanityData = await sanityResponse.json();

        const settings = sanityData?.result || {};
        const sanityStatus = settings.courseStatus || "automatic";

        const now = new Date();

        const ukTime = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Europe/London",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }).format(now);

        const [hour, minute] = ukTime.split(":").map(Number);
        const minutesNow = hour * 60 + minute;

        const openTime = 8 * 60;
        const closeTime = 17 * 60 + 52;

        let status = "closed";

        if (minutesNow >= openTime && minutesNow < closeTime) {
            status = "open";
        }

        if (sanityStatus && sanityStatus !== "automatic") {
            status = sanityStatus;
        }

        return res.status(200).json({
            status,
            time: ukTime,
            source: "sanity",
            sanityStatus,
            notices: {
                showNotice: settings.showNotice || false,
                clubNotice: settings.clubNotice || "",
                competitionNotice: settings.competitionNotice || "",
                eventsNotice: settings.eventsNotice || "",
                visitorsNotice: settings.visitorsNotice || ""
            }
        });

    } catch (error) {
        return res.status(200).json({
            status: "closed",
            error: "Sanity status failed",
            notices: {
                showNotice: false,
                clubNotice: "",
                competitionNotice: "",
                eventsNotice: "",
                visitorsNotice: ""
            }
        });
    }
}