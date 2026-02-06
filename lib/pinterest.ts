
const CLIENT_ID = process.env.PINTEREST_CLIENT_ID;
const CLIENT_SECRET = process.env.PINTEREST_CLIENT_SECRET;
const REDIRECT_URI = process.env.PINTEREST_REDIRECT_URI;

if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    console.warn("Missing Pinterest API Credentials in .env");
}

export class PinterestClient {
    static getLoginUrl() {
        const scopes = [
            'boards:read',
            'boards:write',
            'pins:read',
            'pins:write',
            'user_accounts:read'
        ].join(',');

        // Pinterest uses 'state' to prevent CSRF, we can use a random string
        const state = Math.random().toString(36).substring(7);

        return `https://www.pinterest.com/oauth/?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI!)}&response_type=code&scope=${scopes}&state=${state}`;
    }

    static async getAccessToken(code: string) {
        const tokenUrl = 'https://api.pinterest.com/v5/oauth/token';
        const headers = {
            'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI!
        });

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: headers,
            body: body
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error_description || data.message || "Failed to get Pinterest Token");
        }

        return data; // { access_token, refresh_token, scope, expires_in, token_type }
    }

    static async refreshAccessToken(refreshToken: string) {
        const tokenUrl = 'https://api.pinterest.com/v5/oauth/token';
        const headers = {
            'Authorization': 'Basic ' + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        const body = new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken
        });

        const response = await fetch(tokenUrl, {
            method: 'POST',
            headers: headers,
            body: body
        });

        const data = await response.json();
        if (data.error) throw new Error(data.message);
        return data;
    }

    static async getUserInfo(accessToken: string) {
        const url = 'https://api.pinterest.com/v5/user_account';
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        if (data.code) throw new Error(data.message);
        return data; // { username, profile_image, ... }
    }

    static async getBoards(accessToken: string) {
        const url = 'https://api.pinterest.com/v5/boards';
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        // Pagination logic omitted for MVP
        return data.items || [];
    }

    static async createPin(accessToken: string, boardId: string, imageUrl: string, title?: string, description?: string, link?: string) {
        const url = 'https://api.pinterest.com/v5/pins';

        const payload = {
            board_id: boardId,
            media_source: {
                source_type: 'image_url',
                url: imageUrl
            },
            title: title ? title.substring(0, 100) : undefined, // Max 100 chars
            description: description ? description.substring(0, 500) : undefined,
            link: link
        };

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (data.code) throw new Error(data.message + (data.details ? ': ' + JSON.stringify(data.details) : ''));
        return data; // { id, ... }
    }
}
