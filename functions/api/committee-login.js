function textToBytes(value) {
    return new TextEncoder().encode(value);
}

function bytesToHex(bytes) {
    return Array.from(new Uint8Array(bytes))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

async function sign(secret, payload) {
    const key = await crypto.subtle.importKey(
        "raw",
        textToBytes(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
    );

    const signature = await crypto.subtle.sign(
        "HMAC",
        key,
        textToBytes(payload)
    );

    return bytesToHex(signature);
}

export async function onRequestPost(context) {
    const password = context.env.COMMITTEE_PASSWORD;
    const secret = context.env.COMMITTEE_SESSION_SECRET;

    if (!password || !secret) {
        return Response.json(
            { error: "Committee login is not configured." },
            { status: 503 }
        );
    }

    let submittedPassword;

    try {
        const body = await context.request.json();
        submittedPassword = body?.password;
    } catch {
        return Response.json(
            { error: "Invalid login request." },
            { status: 400 }
        );
    }

    if (
        typeof submittedPassword !== "string" ||
        submittedPassword !== password
    ) {
        return Response.json(
            { error: "Incorrect password." },
            { status: 401 }
        );
    }

    const expiresAt =
        Math.floor(Date.now() / 1000) + 60 * 60 * 12;

    const payload = `committee:${expiresAt}`;
    const signature = await sign(secret, payload);
    const sessionValue = `${payload}.${signature}`;

    return new Response(
        JSON.stringify({ success: true }),
        {
            status: 200,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "no-store",
                "Set-Cookie":
                    `dgc_committee_session=${sessionValue}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=43200`
            }
        }
    );
}
