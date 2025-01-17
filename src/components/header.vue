<template>
    <div class="header">
        <div class="header-left">
            <div class="title-container">
                <el-icon class="system-icon"><Monitor /></el-icon>
                <span class="system-title">后台管理系统</span>
            </div>
            <div class="collapse-btn" @click="collapseChange">
                <el-icon v-if="!collapse"><Expand /></el-icon>
                <el-icon v-else><Fold /></el-icon>
            </div>
        </div>
        <div class="header-right">
            <div class="header-user-con">
                <!-- 添加清除缓存按钮 -->
                <el-tooltip
                    effect="dark"
                    content="清除缓存"
                    placement="bottom"
                >
                    <div class="btn-clear" @click="clearCache">
                        <el-icon><Refresh /></el-icon>
                    </div>
                </el-tooltip>
                
                <!-- 原有的头像部分 -->
                <el-avatar
                    :size="30"
                    :src="imgurl"
                    @error="errorHandler"
                />
                <!-- 用户名下拉菜单 -->
                <el-dropdown class="user-name" trigger="click">
                    <span class="el-dropdown-link">
                        {{ username }}
                        <el-icon class="el-icon--right">
                            <arrow-down />
                        </el-icon>
                    </span>
                    <template #dropdown>
                        <el-dropdown-menu>
                            <el-dropdown-item @click="handleCommand('user')">个人中心</el-dropdown-item>
                            <el-dropdown-item divided @click="handleCommand('loginout')">退出登录</el-dropdown-item>
                        </el-dropdown-menu>
                    </template>
                </el-dropdown>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useSidebarStore } from '../store/sidebar';
import { usePermissStore } from '../store/permiss';
import { useRouter } from 'vue-router';
import { Monitor, Expand, Fold, Refresh } from '@element-plus/icons-vue';
import imgurl from '../assets/img/img.jpg';
import { ElMessage } from 'element-plus';

const username: string | null = localStorage.getItem('vuems_name');
const sidebar = useSidebarStore();
const router = useRouter();
const permiss = usePermissStore();

// 侧边栏折叠
const collapseChange = () => {
    sidebar.handleCollapse();
};

onMounted(() => {
    if (document.body.clientWidth < 1500) {
        collapseChange();
    }
});

// 用户名下拉菜单选择事件
const handleCommand = (command: string) => {
    if (command == 'loginout') {
        // 清除所有登录相关信息
        localStorage.removeItem('token');
        localStorage.removeItem('token_expires');
        localStorage.removeItem('vuems_name');
        // 清除权限状态
        permiss.handleSet([]);
        // 跳转到登录页
        router.push('/login');
    } else if (command == 'user') {
        router.push('/ucenter');
    }
};

// 添加清除缓存方法
const clearCache = () => {
    localStorage.clear();
    ElMessage.success('缓存清除成功，请重新登录');
    // 跳转到登录页
    window.location.href = '/login';
};
</script>

<style scoped>
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 70px;
    background-color: var(--header-bg-color);
    border-bottom: 1px solid #ddd;
}

.header-left {
    display: flex;
    align-items: center;
    padding-left: 20px;
}

.title-container {
    display: flex;
    align-items: center;
    font-size: 20px;
    font-weight: bold;
    color: var(--header-text-color);
}

.system-icon {
    font-size: 24px;
    margin-right: 8px;
}

.system-title {
    letter-spacing: 1px;
    margin-right: 20px;
}

.collapse-btn {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    padding: 0 20px;
    cursor: pointer;
    font-size: 22px;
    color: #fff;
}

.header-right {
    padding-right: 50px;
}

.header-user-con {
    display: flex;
    align-items: center;
    height: 70px;
}

.user-avator {
    margin: 0 10px 0 20px;
}

.el-dropdown-link {
    color: var(--header-text-color);
    cursor: pointer;
    display: flex;
    align-items: center;
}

/* 添加清除缓存按钮样式 */
.btn-clear {
    display: inline-block;
    margin-right: 15px;
    cursor: pointer;
    color: var(--header-text-color);
    font-size: 20px;
}

.btn-clear:hover {
    color: #409eff;
}
</style>
