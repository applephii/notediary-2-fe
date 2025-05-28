import { BASE_URL } from "./config.js";

async function refreshAccessTokenIfNeeded() {
    const token = sessionStorage.getItem('accessToken');
    const expire = parseInt(sessionStorage.getItem("expire")) || 0;
    const now = new Date().getTime();

    if (!token || expire * 1000 < now) {
        try {
            const response = await axios.get(`${BASE_URL}/token`, { withCredentials: true });
            const newToken = response.data.accessToken;
            const decoded = JSON.parse(atob(newToken.split('.')[1]));

            sessionStorage.setItem('accessToken', newToken);
            sessionStorage.setItem('expire', decoded.exp);
            sessionStorage.setItem('username', decoded.username);

            return newToken;
        } catch (error) {
            sessionStorage.clear();
            alert("Session expired. Please login again.");
            window.location.href = 'login.html';
            return null;
        }
    }

    return token;
}

export { refreshAccessTokenIfNeeded };