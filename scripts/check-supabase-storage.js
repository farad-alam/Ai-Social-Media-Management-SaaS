
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually read .env to get credentials without using dotenv
function getEnv(key) {
    const envContent = fs.readFileSync(path.join(__dirname, '../.env'), 'utf-8');
    const match = envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : null;
}

const supabaseUrl = getEnv('NEXT_PUBLIC_SUPABASE_URL');
const supabaseKey = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorage() {
    console.log("Checking Supabase Storage for 'posts' bucket...");

    // 1. Try to upload a test file
    const testFileName = `test-${Date.now()}.txt`;
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('posts')
        .upload(testFileName, 'test content');

    if (uploadError) {
        console.error("❌ Upload failed:", uploadError);
        // If upload fails, maybe bucket doesn't exist or RLS issue
    } else {
        console.log("✅ Upload success:", uploadData.path);
    }

    // 2. Try to get Public URL for that file
    const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(uploadData ? testFileName : 'non-existent');

    console.log("ℹ️ Public URL generated:", publicUrl);

    // 3. Try to fetch the Public URL
    if (publicUrl) {
        try {
            const res = await fetch(publicUrl);
            if (res.ok) {
                console.log("✅ Public URL is accessible (Status:", res.status, ")");
                console.log("Content:", await res.text());
            } else {
                console.error("❌ Public URL is NOT accessible (Status:", res.status, ")");
                console.log("Reason: Likely the bucket is PRIVATE or network issue.");
            }
        } catch (fetchError) {
            console.error("❌ Failed to fetch public URL:", fetchError.message);
        }
    }

    // Capture logic about deleting the test file could be added but skipping for simplicity
}

checkStorage().catch(console.error);
