const allowedStatuses = [
    "automatic",
    "open",
    "closed",
    "frost",
    "temporary-greens",
    "preferred-lies",
    "maintenance"
];

export async function onRequestPost(context) {
    try {
        const body = await context.request.json();
        const { password, status } = body || {};

        if (password !== context.env.ADMIN_PASSWORD) {
            return Response.json(
                { error: "Wrong password" },
                { status: 401 }
            );
        }

        if (!allowedStatuses.includes(status)) {
            return Response.json(
                { error: "Invalid status" },
                { status: 400 }
            );
        }

        const token = context.env.SANITY_WRITE_TOKEN;

        if (!token) {
            return Response.json(
                { error: "Missing SANITY_WRITE_TOKEN" },
                { status: 500 }
            );
        }

        const mutationUrl =
            "https://c54r3a5t.api.sanity.io/v2024-03-01/data/mutate/production?returnDocuments=true";

        const mutationResponse = await fetch(mutationUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                mutations: [
                    {
                        patch: {
                            id: "clubSettings",
                            set: {
                                courseStatus: status
                            }
                        }
                    }
                ]
            })
        });

        if (!mutationResponse.ok) {
            const text = await mutationResponse.text();
            throw new Error(
                `Sanity mutation failed: ${mutationResponse.status} ${text}`
            );
        }

        return Response.json({
            success: true,
            status
        });

    } catch (error) {
        return Response.json(
            {
                error: "Could not update course status",
                details: error.message
            },
            { status: 500 }
        );
    }
}
