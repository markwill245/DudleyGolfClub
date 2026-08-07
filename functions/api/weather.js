export async function onRequestGet(context) {
    try {
        const apiKey = context.env.OPENWEATHER_API_KEY;

        if (!apiKey) {
            return Response.json({
                temp: "--",
                error: "Missing OPENWEATHER_API_KEY"
            });
        }

        const url =
            `https://api.openweathermap.org/data/2.5/weather?q=Dudley,GB&units=metric&appid=${apiKey}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`OpenWeather request failed: ${response.status}`);
        }

        const data = await response.json();

        return Response.json({
            temp: Math.round(data.main.temp)
        });

    } catch (error) {
        return Response.json({
            temp: "--",
            error: error.message
        });
    }
}
