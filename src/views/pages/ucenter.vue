<template>
    <div class="container">
        <el-card class="box-card">
            <template #header>
                <div class="card-header">
                    <span>个人信息</span>
                </div>
            </template>
            <el-form 
                ref="formRef"
                :model="form"
                :rules="rules"
                label-width="80px"
            >
                <!-- 头像 -->
                <el-form-item label="头像">
                    <el-upload
                        class="avatar-uploader"
                        action="/api/upload"
                        :show-file-list="false"
                        :on-success="handleAvatarSuccess"
                    >
                        <img v-if="form.avatar" :src="form.avatar" class="avatar" />
                        <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
                    </el-upload>
                </el-form-item>

                <!-- 昵称 -->
                <el-form-item label="昵称" prop="nickname">
                    <el-input v-model="form.nickname" />
                </el-form-item>

                <!-- 修改密码 -->
                <el-form-item label="原密码" prop="oldPassword">
                    <el-input 
                        v-model="form.oldPassword"
                        type="password"
                        show-password
                    />
                </el-form-item>
                <el-form-item label="新密码" prop="newPassword">
                    <el-input 
                        v-model="form.newPassword"
                        type="password"
                        show-password
                    />
                </el-form-item>
                <el-form-item label="确认密码" prop="confirmPassword">
                    <el-input 
                        v-model="form.confirmPassword"
                        type="password"
                        show-password
                    />
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="handleSubmit">保存修改</el-button>
                </el-form-item>
            </el-form>
        </el-card>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const formRef = ref<FormInstance>()
const form = ref({
    avatar: '',
    nickname: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
})

// 表单验证规则
const rules: FormRules = {
    nickname: [
        { required: true, message: '请输入昵称', trigger: 'blur' }
    ],
    oldPassword: [
        { required: true, message: '请输入原密码', trigger: 'blur' }
    ],
    newPassword: [
        { required: true, message: '请输入新密码', trigger: 'blur' },
        { min: 6, message: '密码长度不能小于6位', trigger: 'blur' }
    ],
    confirmPassword: [
        { required: true, message: '请确认密码', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value !== form.value.newPassword) {
                    callback(new Error('两次输入的密码不一致'))
                } else {
                    callback()
                }
            },
            trigger: 'blur'
        }
    ]
}

// 处理头像上传成功
const handleAvatarSuccess = (response: any) => {
    form.value.avatar = response.url
}

// 提交表单
const handleSubmit = async () => {
    if (!formRef.value) return
    
    await formRef.value.validate((valid) => {
        if (valid) {
            // TODO: 调用API保存修改
            ElMessage.success('保存成功')
        }
    })
}
</script>

<style scoped>
.container {
    padding: 20px;
}
.avatar-uploader {
    border: 1px dashed var(--el-border-color);
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: var(--el-transition-duration-fast);
}
.avatar-uploader:hover {
    border-color: var(--el-color-primary);
}
.avatar-uploader-icon {
    font-size: 28px;
    color: #8c939d;
    width: 100px;
    height: 100px;
    text-align: center;
    line-height: 100px;
}
.avatar {
    width: 100px;
    height: 100px;
    display: block;
}
</style>
