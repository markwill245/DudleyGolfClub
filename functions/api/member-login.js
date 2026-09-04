function textToBytes(value) {
    return new TextEncoder().encode(value);
}

function bytesToHex(bytes) {
    return Array.from(new Uint8Array(bytes))
        .map(byte => byte.toString(16).padStart(2, "0"))
        .join("");
}

async function createSignature(secret, payload) {
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
    try {
        const body = await context.request.json();
        const password = String(body?.password || "");

        if (!context.env.MEMBER_PASSWORD || !context.env.MEMBER_SESSION_SECRET) {
            return Response.json(
                { error: "Members login is not configured." },
                { status: 500 }
            );
        }

        if (password !== context.env.MEMBER_PASSWORD) {
            return Response.json(
                { error: "Incorrect password." },
                { status: 401 }
            );
        }

        const expiresAt = Math.floor(Date.now() / 1000) + (60 * 60 * 12);
        const payload = `member:${expiresAt}`;
        const signature = await createSignature(
            context.env.MEMBER_SESSION_SECRET,
            payload
        );

        const sessionValue = `${payload}.${signature}`;

        const url = new URL(context.request.url);
        const secureFlag =
            url.protocol === "https:" ? "; Secure" : "";

        return new Response(
            JSON.stringify({ success: true }),
            {
                status: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Set-Cookie":
                        `dgc_member_session=${sessionValue}; Path=/; HttpOnly${secureFlag}; SameSite=Lax; Max-Age=43200`
                }
            }
        );

    } catch (error) {
        return Response.json(
            { error: "Could not sign in." },
            { status: 500 }
        );
    }
}
