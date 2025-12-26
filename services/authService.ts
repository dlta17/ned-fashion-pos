
import { getUsers } from './api';
import { User } from '../types';

const USER_KEY = 'dr_phone_pos_user';

export const login = async (username: string, password: string): Promise<User> => {
    const users = await getUsers();
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                // Do not store password in session
                const { password, ...userToStore } = user;
                sessionStorage.setItem(USER_KEY, JSON.stringify(userToStore));
                resolve(userToStore);
            } else {
                reject(new Error('Invalid credentials'));
            }
        }, 500);
    });
};

export const logout = () => {
    sessionStorage.removeItem(USER_KEY);
};

export const getCurrentUser = (): User | null => {
    const userJson = sessionStorage.getItem(USER_KEY);
    if (userJson) {
        return JSON.parse(userJson) as User;
    }
    return null;
};
