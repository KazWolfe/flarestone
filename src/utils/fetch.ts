const DESKTOP_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) " +
    "Chrome/141.0.0.0 Safari/537.36 (compatible; Flarestone/0.3; +https://xivauth.net/flarestone)";

const MOBILE_USER_AGENT = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 " +
    "(KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1 " +
    "(compatible; Flarestone/0.3; +https://xivauth.net/flarestone)"

export async function fsFetch(input: string | URL | Request, init?: RequestInit | undefined) {
    console.log(`Fetching URL ${input}`)

    init = {
        ...init,
        headers: {
            ...init?.headers,
            'User-Agent': DESKTOP_USER_AGENT
        }
    };

    return await fetch(input, init);
}

export async function fsFetchMobile(input: string | URL | Request, init?: RequestInit | undefined) {
    console.log(`Fetching URL ${input} with mobile user-agent`)

    init = {
        ...init,
        headers: {
            ...init?.headers,
            'User-Agent': MOBILE_USER_AGENT
        }
    }

    return await fetch(input, init);
}