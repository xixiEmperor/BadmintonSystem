<script setup>
import { useRouter } from 'vue-router'
import { Calendar, User, ChatLineRound } from '@element-plus/icons-vue'

const router = useRouter()

const goToBooking = () => {
  router.push('/booking')
}

const goToShop = () => {
  router.push('/shop')
}

const goToForum = () => {
  router.push('/forum')
}
</script>

<template>
  <div class="home-container">
    <img src="../../assets/index_img.png" alt="" />
    <h2>欢迎使用南湖校区羽毛球场预定系统</h2>

    <div class="info-section">
      <p>南湖校区羽毛球场预定系统为您提供便捷的场地预约、装备购买及交流互动服务。</p>
      <p>使用本系统，您可以轻松预约羽毛球场地，查看场地使用情况，并与其他羽毛球爱好者交流。</p>
    </div>

    <div class="quick-actions">
      <el-card class="action-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <h3>快速预约</h3>
          </div>
        </template>
        <div class="card-content">
          <el-image src="https://via.placeholder.com/150" class="card-image"></el-image>
          <p>点击下方按钮快速预约羽毛球场地</p>
          <el-button type="primary" @click="goToBooking">立即预约</el-button>
        </div>
      </el-card>

      <el-card class="action-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <h3>热门推荐</h3>
          </div>
        </template>
        <div class="card-content">
          <el-image src="https://via.placeholder.com/150" class="card-image"></el-image>
          <p>查看热门羽毛球装备</p>
          <el-button type="success" @click="goToShop">去商城</el-button>
        </div>
      </el-card>

      <el-card class="action-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <h3>交流互动</h3>
          </div>
        </template>
        <div class="card-content">
          <el-image src="https://via.placeholder.com/150" class="card-image"></el-image>
          <p>加入羽毛球爱好者社区</p>
          <el-button type="warning" @click="goToForum">进入论坛</el-button>
        </div>
      </el-card>
    </div>

    <div class="statistics-section">
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="statistic-card">
            <div class="statistic-icon">
              <el-icon><Calendar /></el-icon>
            </div>
            <div class="statistic-info">
              <div class="statistic-value">120+</div>
              <div class="statistic-label">每日场地预约</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="statistic-card">
            <div class="statistic-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="statistic-info">
              <div class="statistic-value">5000+</div>
              <div class="statistic-label">注册用户</div>
            </div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="statistic-card">
            <div class="statistic-icon">
              <el-icon><ChatLineRound /></el-icon>
            </div>
            <div class="statistic-info">
              <div class="statistic-value">200+</div>
              <div class="statistic-label">每日论坛互动</div>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<style lang="less" scoped>
@primary-color: #2b6fc2;
@text-color: #666;
@bg-color: #f9f9f9;

.home-container {
  padding: 0;

  img {
    width: 1200px;
    height: auto;
    margin: 20px auto;
    display: block;
  }
}

h2 {
  text-align: center;
  color: @primary-color;
  margin-bottom: 20px;
}

.info-section {
  text-align: center;
  margin-bottom: 30px;
  color: @text-color;
  line-height: 1.6;
}

.quick-actions {
  display: flex;
  justify-content: space-between;
  margin: 30px 0;
  flex-wrap: wrap;
}

.action-card {
  width: 32%;
  transition: all 0.3s;
  margin-bottom: 20px;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  }

  .card-header {
    display: flex;
    justify-content: center;
    align-items: center;

    h3 {
      margin: 0;
      font-size: 18px;
      color: @primary-color;
    }
  }

  .card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
  }

  .card-image {
    margin-bottom: 15px;
    border-radius: 5px;
  }
}

.statistics-section {
  margin: 40px 0 20px;
}

.statistic-card {
  background-color: @bg-color;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

  .statistic-icon {
    font-size: 30px;
    color: @primary-color;
    margin-right: 15px;
  }

  .statistic-info {
    .statistic-value {
      font-size: 24px;
      font-weight: bold;
      color: @primary-color;
    }

    .statistic-label {
      font-size: 14px;
      color: @text-color;
      margin-top: 5px;
    }
  }
}

@media (max-width: 768px) {
  .action-card {
    width: 100%;
  }
}
</style>
