<template>
    <div class="login-bg">
        <div class="login-container">
            <div class="login-header">
                <img class="logo mr10" src="../../assets/img/logo.svg" alt="" />
                <div class="login-title">后台管理系统</div>
            </div>
            <el-form 
                :model="param" 
                :rules="rules" 
                ref="loginForm"
                size="large"
            >
                <el-form-item prop="username">
                    <el-input v-model="param.username" placeholder="用户名">
                        <template #prepend>
                            <el-icon><User /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <el-form-item prop="password">
                    <el-input
                        type="password"
                        placeholder="密码"
                        v-model="param.password"
                        @keyup.enter="handleSubmit"
                    >
                        <template #prepend>
                            <el-icon><Lock /></el-icon>
                        </template>
                    </el-input>
                </el-form-item>
                <div class="pwd-tips">
                    <el-checkbox v-model="rememberPassword">记住密码</el-checkbox>
                    <el-link type="primary" @click="$router.push('/reset-pwd')">忘记密码</el-link>
                </div>
                <el-button 
                    class="login-btn" 
                    type="primary" 
                    size="large" 
                    @click="handleSubmit"
                >登录</el-button>
                <p class="login-tips">Tips : 用户名：admin，密码：123123</p>
            </el-form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePermissStore } from '@/store/permiss';
import { ElMessage } from 'element-plus';
import type { FormInstance, FormRules } from 'element-plus';
import { User, Lock } from '@element-plus/icons-vue';

const router = useRouter();
const permiss = usePermissStore();
const loginForm = ref<FormInstance>();
const rememberPassword = ref(false);

const param = ref({
    username: 'admin',
    password: '123123'
});

// 表单验证规则
const rules: FormRules = {
    username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
    ]
};

const handleSubmit = async () => {
    if (!loginForm.value) return;
    
    await loginForm.value.validate((valid) => {
        if (valid) {
            if (param.value.username === 'admin' && param.value.password === '123123') {
                // 设置token，有效期30天
                const token = generateToken();
                const expiresTime = new Date().getTime() + 30 * 24 * 60 * 60 * 1000;
                localStorage.setItem('token', token);
                localStorage.setItem('token_expires', expiresTime.toString());
                localStorage.setItem('vuems_name', param.value.username);
                
                // 设置权限
                const keys = permiss.defaultList[param.value.username];
                permiss.handleSet(keys);
                
                ElMessage.success('登录成功');
                router.push('/');
            } else {
                ElMessage.error('账号或密码错误');
            }
        }
    });
};

// 生成简单的token
const generateToken = () => {
    return Math.random().toString(36).substr(2) + new Date().getTime();
};
</script>

<style scoped>
.login-bg {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100vh;
    background: url(../../assets/img/login-bg.jpg) center/cover no-repeat;
}

.login-header {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 40px;
}

.logo {
    width: 35px;
}

.login-title {
    font-size: 22px;
    color: #333;
    font-weight: bold;
}

.login-container {
    width: 450px;
    border-radius: 5px;
    background: #fff;
    padding: 40px 50px 50px;
    box-sizing: border-box;
}

.pwd-tips {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 14px;
    margin: -10px 0 10px;
    color: #787878;
}

.pwd-checkbox {
    height: auto;
}

.login-btn {
    display: block;
    width: 100%;
}

.login-tips {
    font-size: 12px;
    color: #999;
}

.login-text {
    display: flex;
    align-items: center;
    margin-top: 20px;
    font-size: 14px;
    color: #787878;
}
</style>
