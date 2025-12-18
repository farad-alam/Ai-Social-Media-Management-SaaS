
const APP_ID = process.env.FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI;

if (!APP_ID || !APP_SECRET || !REDIRECT_URI) {
    console.error("Missing Instagram API Credentials in .env");
}

export class InstagramClient {
    static getLoginUrl() {
        // Scopes needed for publishing and reading basics
        const scopes = [
            "instagram_basic",
            "instagram_content_publish",
            "pages_show_list",
            "pages_read_engagement",
            "business_management", // Often needed to list pages
        ].join(",");

        return `https://www.facebook.com/v19.0/dialog/oauth?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&scope=${scopes}&state=st=${Math.random().toString(36).substring(7)}`; // Simple random state
    }

    static async getAccessToken(code: string) {
        const url = `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${APP_ID}&redirect_uri=${REDIRECT_URI}&client_secret=${APP_SECRET}&code=${code}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }
        return data.access_token;
    }

    static async getLongLivedToken(shortLivedToken: string) {
        const url = `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${APP_ID}&client_secret=${APP_SECRET}&fb_exchange_token=${shortLivedToken}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.access_token;
    }

    static async getInstagramAccountId(accessToken: string) {
        // 1. Get User's Pages
        const pagesUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${accessToken}`;
        const pagesRes = await fetch(pagesUrl);
        const pagesData = await pagesRes.json();

        console.log("Pages Data Response:", JSON.stringify(pagesData, null, 2));

        if (pagesData.error) throw new Error(pagesData.error.message);

        // 2. Find a page with an Instagram Business Account connected
        for (const page of pagesData.data) {
            // Fetch specific page details to get IG ID
            const pageDetailsUrl = `https://graph.facebook.com/v19.0/${page.id}?fields=instagram_business_account,access_token&access_token=${accessToken}`;
            const detailRes = await fetch(pageDetailsUrl);
            const detailData = await detailRes.json();

            console.log(`Page Details for ${page.name} (${page.id}):`, JSON.stringify(detailData, null, 2));

            if (detailData.instagram_business_account) {
                return {
                    instagramId: detailData.instagram_business_account.id,
                    pageId: page.id,
                    username: page.name,
                    accessToken: accessToken
                };
            }
        }
        console.log("No Instagram Business Account found in any of the pages.");
        return null;
    }

    static async getInstagramUserDetails(instagramId: string, accessToken: string) {
        const url = `https://graph.facebook.com/v19.0/${instagramId}?fields=username,profile_picture_url&access_token=${accessToken}`;
        const res = await fetch(url);
        return await res.json();
    }

    static async publishImage(instagramId: string, imageUrl: string, caption: string, accessToken: string) {
        // 1. Create Container
        const createUrl = `https://graph.facebook.com/v19.0/${instagramId}/media?image_url=${encodeURIComponent(imageUrl)}&caption=${encodeURIComponent(caption)}&access_token=${accessToken}`;
        const createRes = await fetch(createUrl, { method: 'POST' });
        const createData = await createRes.json();

        if (createData.error) throw new Error(createData.error.message);

        const creationId = createData.id;

        // 2. Publish Container
        const publishUrl = `https://graph.facebook.com/v19.0/${instagramId}/media_publish?creation_id=${creationId}&access_token=${accessToken}`;
        const publishRes = await fetch(publishUrl, { method: 'POST' });
        const publishData = await publishRes.json();

        if (publishData.error) throw new Error(publishData.error.message);

        return publishData.id;
    }
}
