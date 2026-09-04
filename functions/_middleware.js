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

const protectedPaths = new Set([
    "/members-area",
    "/members-area.html",

    "/committee/golfer-of-the-year",
    "/committee/golfer-of-the-year.html",

    "/golf-analytics-centre-members-prototype",
    "/golf-analytics-centre-members-prototype.html",

    "/golf-partnership-analytics-members-prototype",
    "/golf-partnership-analytics-members-prototype.html",

    "/player-profile-members-prototype",
    "/player-profile-members-prototype.html",

    "/records-centre-members-prototype",
    "/records-centre-members-prototype.html"
]);

export async function onRequest(context) {
    const url = new URL(context.request.url);

    if (!protectedPaths.has(url.pathname)) {
        return context.next();
    }

    const authorised = await validMemberSession(context);

    if (authorised) {
        return context.next();
    }

    const returnPath = url.pathname + url.search;
    const loginUrl = new URL("/login.html", url.origin);

    loginUrl.searchParams.set("return", returnPath);

    return Response.redirect(loginUrl.toString(), 302);
}
