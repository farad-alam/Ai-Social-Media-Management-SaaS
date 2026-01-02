
// using global fetch

async function checkHeaders() {
    const url = 'https://dvrsttahehrqkglahsys.supabase.co/storage/v1/object/public/posts/test-1767078615073.txt';
    try {
        const res = await fetch(url, { method: 'HEAD' });
        console.log("Status:", res.status);
        console.log("Headers:");
        res.headers.forEach((val, key) => console.log(`${key}: ${val}`));

        if (res.headers.get('cross-origin-resource-policy')) {
            console.log("✅ CORP Header present");
        } else {
            console.log("❌ CORP Header MISSING");
        }
    } catch (e) {
        console.error("Error:", e);
    }
}

checkHeaders();
