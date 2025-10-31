// Simple Authentication System
class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.loadSession();
    }

    signup(username, password) {
        if (!username || !password) {
            return { success: false, error: 'Username dan password diperlukan' };
        }

        const users = this.getUsers();
        if (users[username]) {
            return { success: false, error: 'Username sudah digunakan' };
        }

        users[username] = {
            password: btoa(password), // Simple encoding
            createdAt: new Date().toISOString()
        };

        localStorage.setItem('users', JSON.stringify(users));
        return { success: true };
    }

    login(username, password) {
        const users = this.getUsers();
        const user = users[username];

        if (!user || atob(user.password) !== password) {
            return { success: false, error: 'Username atau password salah' };
        }

        this.currentUser = username;
        localStorage.setItem('currentUser', username);
        return { success: true, username };
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    loadSession() {
        this.currentUser = localStorage.getItem('currentUser');
    }

    getUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : {};
    }
}

window.authSystem = new AuthSystem();
