export async function onRequestGet(context) {
    try {
        const query = `*[_type == "clubSettings" && _id == "clubSettings"][0]{
            courseStatus,
            showNotice,
            clubNotice,
            competitionNotice,
            eventsNotice,
            visitorsNotice
        }`;

        const sanityUrl =
            "https://c54r3a5t.api.sanity.io/v2024-03-01/data/query/production?query=" +
            encodeURIComponent(query);

        const sanityResponse = await fetch(sanityUrl);

        if (!sanityResponse.ok) {
            throw new Error(`Sanity query failed: ${sanityResponse.status}`);
        }

        const sanityData = await sanityResponse.json();
        const settings = sanityData?.result || {};
        const sanityStatus = settings.courseStatus || "automatic";

        const ukTime = new Intl.DateTimeFormat("en-GB", {
            timeZone: "Europe/London",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false
        }).format(new Date());

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

        return Response.json({
            hasWeatherKey: !!context.env.OPENWEATHER_API_KEY,
            weatherKeyLength: context.env.OPENWEATHER_API_KEY?.length || 0,
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
        return Response.json({
            status: "closed",
            error: "Sanity status failed",
            details: error.message,
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
