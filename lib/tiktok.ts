
const CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY;
const CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET;
const REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI;

if (!CLIENT_KEY || !CLIENT_SECRET || !REDIRECT_URI) {
    console.warn("Missing TikTok API Credentials in .env");
}

export class TikTokClient {
    static getLoginUrl() {
        const scopes = [
            'user.info.basic',
            'video.publish',
            'video.upload' // Check current API requirements
        ].join(',');

        const csrfState = Math.random().toString(36).substring(7);

        return `https://www.tiktok.com/v2/auth/authorize/?client_key=${CLIENT_KEY}&response_type=code&scope=${scopes}&redirect_uri=${encodeURIComponent(REDIRECT_URI!)}&state=${csrfState}`;
    }

    static async getAccessToken(code: string) {
        const url = 'https://open.tiktokapis.com/v2/oauth/token/';
        const params = new URLSearchParams({
            client_key: CLIENT_KEY!,
            client_secret: CLIENT_SECRET!,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI!
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        });

        const data = await response.json();
        if (data.error) throw new Error(data.error_description || "Failed to get TikTok Token");
        return data; // { access_token, refresh_token, open_id, ... }
    }

    static async getUserInfo(accessToken: string) {
        const url = 'https://open.tiktokapis.com/v2/user/info/?fields=open_id,union_id,avatar_url,display_name';
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        if (data.error) throw new Error(data.error.message);
        return data.data; // { display_name, avatar_url, ... }
    }

    static async initPublish(accessToken: string, postInfo: any) {
        // Implementation for Video/Photo publish init
        // https://developers.tiktok.com/doc/CONTENT_POSTING_API
        const url = 'https://open.tiktokapis.com/v2/post/publish/content/init/';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(postInfo)
        });
        return await response.json();
    }
}
