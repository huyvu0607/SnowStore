(function () {
    'use strict';

    // Avoid redeclaration error
    if (window.jwtAuth) {
        console.log('JWT Service already exists, skipping...');
        return;
    }

    class JWTAuthService {
        constructor() {
            this.tokenKey = 'jwt_access_token';
            this.userKey = 'jwt_user_info';
            this.apiBaseUrl = '/api/AuthApi';
            console.log('JWTAuthService initialized');
        }

        saveAuthData(token, user) {
            try {
                localStorage.setItem(this.tokenKey, token);
                localStorage.setItem(this.userKey, JSON.stringify(user));
                console.log('JWT auth data saved:', user);
            } catch (error) {
                console.error('Failed to save JWT data:', error);
            }
        }

        getToken() {
            try {
                return localStorage.getItem(this.tokenKey);
            } catch (error) {
                console.error('Failed to get JWT token:', error);
                return null;
            }
        }

        getUser() {
            try {
                const userStr = localStorage.getItem(this.userKey);
                return userStr ? JSON.parse(userStr) : null;
            } catch (error) {
                console.error('Failed to get JWT user:', error);
                return null;
            }
        }

        clearAuthData() {
            try {
                localStorage.removeItem(this.tokenKey);
                localStorage.removeItem(this.userKey);
                console.log('JWT auth data cleared');
            } catch (error) {
                console.error('Failed to clear JWT data:', error);
            }
        }

        isAuthenticated() {
            const token = this.getToken();
            if (!token) return false;

            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                const isValid = payload.exp * 1000 > Date.now();
                return isValid;
            } catch (error) {
                console.error('JWT token validation error:', error);
                return false;
            }
        }

        async login(email, password) {
            try {
                console.log('JWT login attempt for:', email);

                const response = await fetch(`${this.apiBaseUrl}/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();

                if (data.success) {
                    this.saveAuthData(data.accessToken, data.user);
                    return { success: true, user: data.user };
                } else {
                    return { success: false, message: data.message };
                }
            } catch (error) {
                console.error('JWT login error:', error);
                return { success: false, message: `Lỗi đăng nhập: ${error.message}` };
            }
        }

        logout() {
            this.clearAuthData();
            console.log('JWT logout completed');
        }
    }

    // Create global instance
    window.jwtAuth = new JWTAuthService();
    console.log('Global jwtAuth service created');

})();
