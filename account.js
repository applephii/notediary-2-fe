import { BASE_URL } from "./config.js";
import { refreshAccessTokenIfNeeded } from "./auth.js";

const axiosJWT = axios.create();
axiosJWT.interceptors.request.use(async (config) => {
    const token = await refreshAccessTokenIfNeeded();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const editProfileForm = document.getElementById('editProfileForm');
const deleteProfileButton = document.getElementById('delProfileButton');

//login
document.addEventListener("DOMContentLoaded", () => {
    //login
    if (loginForm) {
        document.getElementById('loginForm').addEventListener('submit', async function (e) {
            e.preventDefault();
            const username = document.getElementById('inputUsername').value;
            const password = document.getElementById('inputPassword').value;


            try {
                await axios.post(`${BASE_URL}/login`, {
                    username: username,
                    password: password
                }, {
                    withCredentials: true
                });

                const res = await axios.get(`${BASE_URL}/token`, { withCredentials: true });
                const accessToken = res.data.accessToken;
                const decoded = JSON.parse(atob(accessToken.split('.')[1]));

                sessionStorage.setItem('accessToken', accessToken);
                sessionStorage.setItem('expire', decoded.exp);
                sessionStorage.setItem('username', decoded.username);
                sessionStorage.setItem('userId', decoded.id);

                alert(`Login successful, Welcome ${username}!`);
                window.location.href = 'index.html';
            } catch (error) {
                alert('Login failed: ' + (error.response?.data?.message || error.message));
            }
        });
    }

    //register
    if (registerForm) {
        document.getElementById('registerForm').addEventListener('submit', async function (e) {
            e.preventDefault();

            const username = document.getElementById('inputUsername').value;
            const email = document.getElementById('inputEmail').value;
            const password = document.getElementById('inputPassword').value;

            try {
                await axios.post(`${BASE_URL}/register`, {
                    username,
                    email,
                    password
                });

                alert('Registration successful! You can now log in.');
                window.location.href = 'login.html';
            } catch (error) {
                alert('Registration failed: ' + (error.response?.data?.message || error.message));
            }
        });
    }

    //edit profile
    if (editProfileForm) {
        const profileUser = async () => {
            const userId = sessionStorage.getItem('userId');
            try {
                const response = await axiosJWT.get(`${BASE_URL}/users/${userId}`, { withCredentials: true });
                const user = response.data.data;

                document.getElementById('inputUsername').value = user.username;
                document.getElementById('inputEmail').value = user.email;
                document.getElementById('inputPassword').value = '';
            } catch (error) {
                alert('Failed to load profile: ' + (error.response?.data?.message || error.message));
            }
        }

        profileUser();
        document.getElementById('editProfileForm').addEventListener('submit', async function (e) {
            e.preventDefault();

            const userId = sessionStorage.getItem('userId');
            const newUsername = document.getElementById('inputUsername').value;
            const newEmail = document.getElementById('inputEmail').value;
            const newPassword = document.getElementById('inputPassword').value;

            const updateData = {
                username: newUsername,
                email: newEmail,
            };

            if (newPassword.trim() !== '') {
                updateData.password = newPassword;
            }

            try {
                await axiosJWT.put(`${BASE_URL}/users/${userId}`, updateData, { withCredentials: true });

                sessionStorage.setItem('username', newUsername);
                alert('Profile updated successfully!');
                window.location.href = 'index.html';
            } catch (error) {
                alert('Profile update failed: ' + (error.response?.data?.message || error.message));
            }
        }
        );
    }

    if( deleteProfileButton) {
        deleteProfileButton.addEventListener('click', async function (e) {
            e.preventDefault();
            const userId = sessionStorage.getItem('userId');

            if (confirm("Are you sure you want to delete your profile? This action cannot be undone.")) {
                try {
                    await axiosJWT.delete(`${BASE_URL}/users/${userId}`, { withCredentials: true });
                    alert('Profile deleted successfully!');
                    sessionStorage.clear();
                    window.location.href = 'index.html';
                } catch (error) {
                    alert('Failed to delete profile: ' + (error.response?.data?.message || error.message));
                }
            }
        });
    }
});

