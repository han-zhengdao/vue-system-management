import { defineStore } from 'pinia';

export interface PermissState {
    key: string[];
    defaultList: {
        [key: string]: string[];
    };
}

export const usePermissStore = defineStore('permiss', {
    state: (): PermissState => {
        // 从 localStorage 获取权限状态
        const username = localStorage.getItem('vuems_name') || '';
        const defaultList = {
            admin: [
                '1', '2', '3', '4', '5', '6', '7', '8', '9',
                '11', '12', '13', '14', '15',
                '21', '22', '23', '24', '25', '26', '27', '28', '29',
                '31', '32', '33', '34', '35',
                '41', '42', '43', '44', '45',
                '51', '52', '53', '54', '55',
                '61', '62'
            ],
            user: ['1', '2']
        };

        // 根据用户名获取对应权限
        const key = username === 'admin' ? defaultList.admin : defaultList.user;

        return {
            key,
            defaultList
        };
    },
    actions: {
        handleSet(val: string[]) {
            this.key = val;
        }
    },
    persist: {
        enabled: true,
        strategies: [
            {
                key: 'permiss',
                storage: localStorage
            }
        ]
    }
});
