export let savedCourseStatus = "automatic";

export default async function handler(req, res) {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    const { password, status } = req.body || {};

    if (password !== process.env.ADMIN_PASSWORD) {
        return res.status(401).json({
            error: "Wrong password"
        });
    }

    const allowedStatuses = [
        "automatic",
        "open",
        "closed",
        "frost",
        "temporary-greens",
        "preferred-lies",
        "maintenance"
    ];

    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
            error: "Invalid status"
        });
    }

    savedCourseStatus = status;

    return res.status(200).json({
        success: true,
        status: savedCourseStatus
    });
}