<template>
    <div class="sidebar">
        <el-menu
            class="sidebar-el-menu"
            :default-active="onRoutes"
            :collapse="sidebar.collapse"
            :background-color="sidebar.bgColor"
            :text-color="sidebar.textColor"
            router
        >
            <template v-for="item in menuData" :key="item.index">
                <el-menu-item 
                    v-if="!item.children" 
                    :index="item.index"
                    v-permiss="item.permiss"
                >
                    <el-icon>
                        <component :is="item.icon" />
                    </el-icon>
                    <template #title>{{ item.title }}</template>
                </el-menu-item>
                
                <el-sub-menu 
                    v-else 
                    :index="item.index"
                    v-permiss="item.permiss"
                >
                    <template #title>
                        <el-icon>
                            <component :is="item.icon" />
                        </el-icon>
                        <span>{{ item.title }}</span>
                    </template>
                    <template v-for="subItem in item.children" :key="subItem.index">
                        <el-menu-item 
                            :index="subItem.index"
                            v-permiss="subItem.permiss"
                        >
                            {{ subItem.title }}
                        </el-menu-item>
                    </template>
                </el-sub-menu>
            </template>
        </el-menu>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSidebarStore } from '../store/sidebar';
import { useRoute } from 'vue-router';
import { menuData } from '@/components/menu';  // 导入菜单配置

const route = useRoute();
const onRoutes = computed(() => {
    return route.path;
});

const sidebar = useSidebarStore();
</script>

<style scoped>
.sidebar {
    display: block;
    position: absolute;
    left: 0;
    top: 70px;
    bottom: 0;
    overflow-y: scroll;
}

.sidebar::-webkit-scrollbar {
    width: 0;
}

.sidebar-el-menu:not(.el-menu--collapse) {
    width: 250px;
}

.sidebar-el-menu {
    min-height: 100%;
}
</style>
