<template>
  <div class="login-page">
    <div class="login-container">
      <!-- 左侧品牌区域 -->
      <div class="login-brand">
        <div class="brand-icon">
          <!-- <el-icon :size="48"><Setting /></el-icon> -->
          <img src="@/assets/images/oneths2.png" alt="">
        </div>
        <h1 class="brand-title">中科元景万象注册中心</h1>
        <p class="brand-subtitle">分布式代理负载均衡管理平台</p>
      </div>

      <!-- 右侧登录表单 -->
      <div class="login-card">
        <h2 class="login-title">欢迎登录</h2>

        <!-- 登录方式切换 Tab -->
        <div class="login-tabs">
          <span class="tab-item" :class="{ active: activeTab === 'password' }"
            @click="switchTab('password')">密码登录</span>
          <span class="tab-item" :class="{ active: activeTab === 'email' }" @click="switchTab('email')">邮箱登录</span>
        </div>

        <!-- ============================================ -->
        <!-- 密码登录表单                                   -->
        <!-- ============================================ -->
        <el-form v-show="activeTab === 'password'" ref="pwdFormRef" :model="pwdForm" :rules="pwdRules"
          class="login-form" @keyup.enter="handlePwdLogin">
          <el-form-item prop="username">
            <el-input v-model="pwdForm.username" placeholder="请输入用户名" :prefix-icon="User" size="large" tabindex="1" />
          </el-form-item>

          <el-form-item prop="password">
            <el-input v-model="pwdForm.password" type="password" placeholder="请输入密码" :prefix-icon="Lock" size="large"
              show-password tabindex="2" />
          </el-form-item>

          <!-- 验证码 -->
          <el-form-item prop="captchaCode">
            <div class="captcha-row">
              <el-input v-model="pwdForm.captchaCode" placeholder="请输入验证码" size="large" tabindex="3"
                class="captcha-input" />
              <div class="captcha-img-wrapper" @click="refreshCaptcha" title="点击刷新验证码">
                <img v-if="captchaImage" :src="captchaImage" alt="验证码" class="captcha-img" />
                <div v-else class="captcha-placeholder">
                  <el-icon :size="20" class="captcha-loading-icon">
                    <Loading />
                  </el-icon>
                </div>
                <div class="captcha-mask">
                  <el-icon :size="16">
                    <Refresh />
                  </el-icon>
                  <span>点击刷新</span>
                </div>
              </div>
            </div>
          </el-form-item>

          <div class="login-options">
            <el-checkbox v-model="pwdForm.remember" label="记住我" />
          </div>

          <el-form-item class="login-btn-wrapper">
            <el-button type="primary" size="large" :loading="pwdLoading" class="login-btn" @click="handlePwdLogin">
              {{ pwdLoading ? '登录中...' : '登 录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- ============================================ -->
        <!-- 邮箱验证码登录表单                             -->
        <!-- ============================================ -->
        <el-form v-show="activeTab === 'email'" ref="emailFormRef" :model="emailForm" :rules="emailRules"
          class="login-form" @keyup.enter="handleEmailLogin">
          <el-form-item prop="email">
            <el-input v-model="emailForm.email" placeholder="请输入邮箱地址" :prefix-icon="Message" size="large"
              tabindex="1" />
          </el-form-item>

          <el-form-item prop="mailCode">
            <div class="captcha-row">
              <el-input v-model="emailForm.mailCode" placeholder="请输入邮箱验证码" size="large" tabindex="2"
                class="captcha-input" />
              <el-button type="primary" :disabled="sendCodeCountdown > 0" :loading="sendingCode" class="send-code-btn"
                @click="handleSendCode">
                {{ sendCodeCountdown > 0 ? `${sendCodeCountdown}s` : '发送验证码' }}
              </el-button>
            </div>
          </el-form-item>

          <div class="login-options">
            <el-checkbox v-model="emailForm.remember" label="记住我" />
          </div>

          <el-form-item class="login-btn-wrapper">
            <el-button type="primary" size="large" :loading="emailLoading" class="login-btn" @click="handleEmailLogin">
              {{ emailLoading ? '登录中...' : '登 录' }}
            </el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <!-- <p class="login-footer">Copyright &copy; {{ currentYear }} Broker管理平台</p> -->
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { User, Lock, Message, Refresh, Loading } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { encrypt } from '@/utils/encryption'
import {
  getCaptcha,
  login,
  loginByCode,
  sendLoginCode,
  getOrganizations,
} from '@/api/auth'
import {
  setToken,
  setRefreshToken,
  setUserInfo,
  setOrganizationInfo,
  decodeJwt,
} from '@/utils/auth'

// ---------------------------------------------------------------------------
// 路由 & 基础状态
// ---------------------------------------------------------------------------

const router = useRouter()
const route = useRoute()

const activeTab = ref<'password' | 'email'>('password')
const pwdFormRef = ref<FormInstance>()
const emailFormRef = ref<FormInstance>()

// ---------------------------------------------------------------------------
// 验证码
// ---------------------------------------------------------------------------

const captchaImage = ref('')
const captchaLoading = ref(false)
let captchaKey = ''

/** 刷新图形验证码 */
async function refreshCaptcha() {
  captchaLoading.value = true
  try {
    const res = await getCaptcha()
    // 验证码图片可能是 base64（data:image/...）或纯 base64 字符串
    const img = res.data.image
    captchaImage.value = img.startsWith('data:') ? img : `data:image/png;base64,${img}`
    captchaKey = res.data.key
    // 刷新后清空已输入的验证码
    pwdForm.captchaCode = ''
  } catch {
    // 获取失败不阻断登录流程，用户可稍后重试
  } finally {
    captchaLoading.value = false
  }
}

// ---------------------------------------------------------------------------
// 密码登录
// ---------------------------------------------------------------------------

const pwdForm = reactive({
  username: '',
  password: '',
  captchaCode: '',
  remember: false,
})

const pwdRules: FormRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  captchaCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
}

const pwdLoading = ref(false)

async function handlePwdLogin() {
  const valid = await pwdFormRef.value?.validate().catch(() => false)
  if (!valid) return

  // 检查密码加密是否成功（JSEncrypt.encrypt 失败时返回 false）
  const encryptedPwd = encrypt(pwdForm.password)
  if (encryptedPwd === false) {
    ElMessage.error('密码加密失败，请重试')
    return
  }

  pwdLoading.value = true
  try {
    const res = await login({
      username: pwdForm.username,
      password: encryptedPwd,
      captchaCode: pwdForm.captchaCode,
      captchaKey,
    })

    // 登录成功：存储 token
    // 兼容两种后端返回格式：
    //   1. data: { token: "xxx" }  （LoginResult 对象）
    //   2. data: "xxx"             （token 字符串直接返回）
    const token = typeof res.data === 'string'
      ? res.data
      : (res.data as { token: string }).token

    if (!token) {
      console.error('登录响应缺少 token 字段', res)
      ElMessage.error('登录异常：未获取到 token')
      refreshCaptcha()
      return
    }

    const remember = pwdForm.remember
    setToken(token, remember)
    setRefreshToken(token, remember)

    // 从 JWT payload 中提取基础用户信息（不额外请求后端）
    const payload = decodeJwt(token)
    if (payload) {
      setUserInfo({
        id: payload.sub,
        username: payload.username || pwdForm.username,
        name: payload.name || pwdForm.username,
      }, remember)
    }

    ElMessage.success('登录成功')
    await fetchOrganizations(remember)
    await doRedirect()
  } catch (err) {
    console.error('登录失败', err)
    ElMessage.error('登录失败，请检查用户名、密码及验证码')
    refreshCaptcha()
  } finally {
    pwdLoading.value = false
  }
}

// ---------------------------------------------------------------------------
// 获取组织信息并缓存
// ---------------------------------------------------------------------------
async function fetchOrganizations(remember: boolean) {
  try {
    const res = await getOrganizations()
    const orgList = res.data
    if (orgList && orgList.length > 0) {
      // 默认选中第一个组织
      const org = orgList[0]
      setOrganizationInfo(org, remember)
    }
  } catch {
    // 获取组织信息失败不阻断登录流程
    console.warn('获取组织信息失败，将使用默认值')
  }
}


// ---------------------------------------------------------------------------
// 邮箱验证码登录
// ---------------------------------------------------------------------------

const emailForm = reactive({
  email: '',
  mailCode: '',
  remember: false,
})

const emailRules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' },
  ],
  mailCode: [{ required: true, message: '请输入邮箱验证码', trigger: 'blur' }],
}

const emailLoading = ref(false)
const sendingCode = ref(false)
const sendCodeCountdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

/** 发送邮箱验证码 */
async function handleSendCode() {
  // 先校验邮箱字段
  if (!emailForm.email) {
    ElMessage.warning('请先输入邮箱地址')
    return
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(emailForm.email)) {
    ElMessage.warning('请输入正确的邮箱格式')
    return
  }

  sendingCode.value = true
  try {
    await sendLoginCode({ mail: emailForm.email })
    ElMessage.success('验证码已发送，请查收邮箱')

    // 启动倒计时
    sendCodeCountdown.value = 60
    countdownTimer = setInterval(() => {
      sendCodeCountdown.value--
      if (sendCodeCountdown.value <= 0 && countdownTimer) {
        clearInterval(countdownTimer)
        countdownTimer = null
      }
    }, 1000)
  } catch {
    // 错误由拦截器处理
  } finally {
    sendingCode.value = false
  }
}

/** 邮箱验证码登录 */
async function handleEmailLogin() {
  const valid = await emailFormRef.value?.validate().catch(() => false)
  if (!valid) return

  emailLoading.value = true
  try {
    const res = await loginByCode({
      email: emailForm.email,
      mailCode: emailForm.mailCode,
    })

    // 兼容两种后端返回格式：
    //   1. data: { token: "xxx" }  （LoginResult 对象）
    //   2. data: "xxx"             （token 字符串直接返回）
    const token = typeof res.data === 'string'
      ? res.data
      : (res.data as { token: string }).token

    if (!token) {
      console.error('邮箱登录响应缺少 token 字段', res)
      ElMessage.error('登录异常：未获取到 token')
      return
    }

    const remember = emailForm.remember
    setToken(token, remember)
    setRefreshToken(token, remember)

    const payload = decodeJwt(token)
    if (payload) {
      setUserInfo({
        id: payload.sub,
        username: payload.username || emailForm.email,
        name: payload.name || emailForm.email,
      }, remember)
    }

    ElMessage.success('登录成功')
    await fetchOrganizations(remember)
    await doRedirect()
  } catch (err) {
    console.error('邮箱登录失败', err)
    ElMessage.error('登录失败，请检查邮箱及验证码')
  } finally {
    emailLoading.value = false
  }
}

// ---------------------------------------------------------------------------
// 公共
// ---------------------------------------------------------------------------

/** 切换登录方式，重置校验状态 */
function switchTab(tab: 'password' | 'email') {
  activeTab.value = tab
  // 清除另一表单的校验提示
  if (tab === 'password') {
    emailFormRef.value?.clearValidate()
  } else {
    pwdFormRef.value?.clearValidate()
  }
}

/** 登录成功后跳转 */
async function doRedirect() {
  const redirectQuery = route.query.redirect
  const redirect = typeof redirectQuery === 'string' && redirectQuery
    ? redirectQuery
    : '/home'
  try {
    await router.push(redirect)
  } catch {
    await router.replace('/home')
  }
}

// ---------------------------------------------------------------------------
// 生命周期
// ---------------------------------------------------------------------------

onMounted(() => {
  // 进入登录页时预加载验证码
  refreshCaptcha()
})

onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
})
</script>

<style scoped>
/* ---- 基础布局 ---- */
.login-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.login-container {
  display: flex;
  align-items: stretch;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  width: 860px;
  max-width: 95vw;
}

/* ---- 左侧品牌区域 ---- */
.login-brand {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #409eff 0%, #337ecc 100%);
  color: #fff;
  padding: 48px 32px;
}

.brand-icon {
  margin-bottom: 20px;
  opacity: 0.9;

  img {
    width: 100px;
    height: 100px;
  }
}

.brand-title {
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 8px;
  letter-spacing: 1px;
}

.brand-subtitle {
  font-size: 13px;
  opacity: 0.75;
  margin: 0;
}

/* ---- 右侧表单区域 ---- */
.login-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 40px 40px;
  min-width: 380px;
}

.login-title {
  font-size: 20px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 20px;
  text-align: center;
}

/* ---- Tab 切换 ---- */
.login-tabs {
  display: flex;
  justify-content: center;
  gap: 32px;
  margin-bottom: 24px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 12px;
}

.tab-item {
  font-size: 14px;
  color: #909399;
  cursor: pointer;
  padding: 4px 0;
  position: relative;
  transition: color 0.2s;
  user-select: none;
}

.tab-item:hover {
  color: #409eff;
}

.tab-item.active {
  color: #409eff;
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -13px;
  left: 50%;
  transform: translateX(-50%);
  width: 24px;
  height: 2px;
  background: #409eff;
  border-radius: 1px;
}

/* ---- 表单 ---- */
.login-form {
  width: 100%;
}

.login-form :deep(.el-input__wrapper) {
  border-radius: 8px;
}

/* ---- 验证码 ---- */
.captcha-row {
  display: flex;
  gap: 12px;
  align-items: stretch;
  width: 100%;
}

.captcha-input {
  flex: 1;
}

.captcha-img-wrapper {
  width: 140px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  position: relative;
  flex-shrink: 0;
  border: 1px solid #dcdfe6;
  background: #f5f7fa;
}

.captcha-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.captcha-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
}

.captcha-loading-icon {
  animation: spin 1s linear infinite;
}

.captcha-mask {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  color: #fff;
  font-size: 11px;
  opacity: 0;
  transition: opacity 0.2s;
}

.captcha-img-wrapper:hover .captcha-mask {
  opacity: 1;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* ---- 发送验证码按钮 ---- */
.send-code-btn {
  width: 120px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
}

/* ---- 记住我 & 登录按钮 ---- */
.login-options {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 4px;
}

.login-btn-wrapper {
  margin-top: 8px;
}

.login-btn {
  width: 100%;
  border-radius: 8px;
  font-size: 15px;
  letter-spacing: 4px;
}

/* ---- 底部版权 ---- */
.login-footer {
  position: absolute;
  bottom: 24px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 12px;
}

/* ---- 响应式 ---- */
@media screen and (max-width: 700px) {
  .login-container {
    flex-direction: column;
    width: 90vw;
  }

  .login-brand {
    padding: 28px 24px;
  }

  .brand-title {
    font-size: 18px;
  }

  .login-card {
    padding: 28px 24px;
    min-width: unset;
  }

  .captcha-img-wrapper,
  .send-code-btn {
    width: 100px;
  }
}
</style>
