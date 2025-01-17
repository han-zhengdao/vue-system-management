import { Menus } from '@/types/menu';

export interface MenuItem {
    icon: string;
    index: string;
    title: string;
    permiss?: string;
    children?: MenuItem[];
}

export const menuData: MenuItem[] = [
    {
        icon: 'House',
        index: '/dashboard',
        title: '系统首页'
    },
    {
        icon: 'Setting',
        index: '/system',
        title: '系统设置',
        permiss: '11',
        children: [
            {
                index: '/system-user',
                title: '后台用户',
                permiss: '11'
            },
            {
                index: '/system-role',
                title: '角色管理',
                permiss: '12'
            }
        ]
    },
    {
        icon: 'ShoppingBag',
        index: '/mall',
        title: '商城管理',
        permiss: '51',
        children: [
            {
                index: '/products',
                title: '商品管理',
                permiss: '51'
            },
            {
                index: '/categories',
                title: '分类管理',
                permiss: '51'
            },
            {
                index: '/orders',
                title: '订单管理',
                permiss: '51'
            }
        ]
    },
    {
        icon: 'Avatar',
        index: 'user',
        title: '用户管理',
        permiss: '61',
        children: [
            {
                index: 'user-list',
                title: '用户列表',
                permiss: '61'
            },
            {
                index: 'user-analysis',
                title: '用户分析',
                permiss: '61'
            }
        ]
    }
];
