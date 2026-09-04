function textToBytes(value) {
    return new TextEncoder().encode(value);
}

function hexToBytes(hex) {
    if (!/^[0-9a-f]+$/i.test(hex) || hex.length % 2 !== 0) {
        return null;
    }

    const bytes = new Uint8Array(hex.length / 2);

    for (let i = 0; i < bytes.length; i++) {
        bytes[i] = parseInt(hex.substr(i * 2, 2), 16);
    }

    return bytes;
}

function getCookie(request, name) {
    const cookieHeader = request.headers.get("Cookie") || "";

    for (const part of cookieHeader.split(";")) {
        const [key, ...valueParts] = part.trim().split("=");

        if (key === name) {
            return valueParts.join("=");
        }
    }

    return null;
}

async function validMemberSession(context) {
    const secret = context.env.MEMBER_SESSION_SECRET;

    if (!secret) {
        return false;
    }

    const session = getCookie(
        context.request,
        "dgc_member_session"
    );

    if (!session) {
        return false;
    }

    const lastDot = session.lastIndexOf(".");

    if (lastDot === -1) {
        return false;
    }

    const payload = session.slice(0, lastDot);
    const signatureHex = session.slice(lastDot + 1);

    const match = /^member:(\d+)$/.exec(payload);

    if (!match) {
        return false;
    }

    const expiresAt = Number(match[1]);
    const now = Math.floor(Date.now() / 1000);

    if (!Number.isFinite(expiresAt) || expiresAt <= now) {
        return false;
    }

    const signatureBytes = hexToBytes(signatureHex);

    if (!signatureBytes) {
        return false;
    }

    const key = await crypto.subtle.importKey(
        "raw",
        textToBytes(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["verify"]
    );

    return crypto.subtle.verify(
        "HMAC",
        key,
        signatureBytes,
        textToBytes(payload)
    );
}

export async function onRequestGet(context) {
    const authenticated =
        await validMemberSession(context);

    return Response.json(
        { authenticated },
        {
            status: 200,
            headers: {
                "Cache-Control": "no-store"
            }
        }
    );
}
