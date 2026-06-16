export default async function handler(req, res) {
    try {
        const apiKey = process.env.OPENWEATHER_API_KEY;

        if (!apiKey) {
            return res.status(200).json({
                temp: "--",
                error: "Missing OPENWEATHER_API_KEY"
            });
        }

        const url =
            `https://api.openweathermap.org/data/2.5/weather?q=Dudley,GB&units=metric&appid=${apiKey}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("OpenWeather request failed");
        }

        const data = await response.json();

        return res.status(200).json({
            temp: Math.round(data.main.temp)
        });

    } catch (error) {
        return res.status(200).json({
            temp: "--",
            error: error.message
        });
    }
}