export async function onRequestGet(context) {
    return Response.json({
        bindings: Object.keys(context.env || {}).sort()
    });
}
