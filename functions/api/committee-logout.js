export async function onRequestPost() {
    const headers = new Headers();
    headers.set("Content-Type", "application/json");
    headers.set("Cache-Control", "no-store");

    headers.append(
        "Set-Cookie",
        "dgc_committee_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
    );

    headers.append(
        "Set-Cookie",
        "dgc_committee_session=; Path=/committee; HttpOnly; Secure; SameSite=Lax; Max-Age=0"
    );

    return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers }
    );
}
