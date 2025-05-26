<script setup>
import { useRouter } from 'vue-router'
import {
  Calendar,
  User,
  ChatLineRound,
  Ticket,
  ShoppingBag,
  ChatDotRound,
} from '@element-plus/icons-vue'
import imgUrl from '@/assets/index_img.png'

const router = useRouter()

const goToBooking = () => {
  const routeUrl = router.resolve('/booking')
  window.open(routeUrl.href, '_blank')
}

const goToShop = () => {
  const routeUrl = router.resolve('/shop')
  window.open(routeUrl.href, '_blank')
}

const goToForum = () => {
  const routeUrl = router.resolve('/forum')
  window.open(routeUrl.href, '_blank')
}
</script>

<template>
  <div class="home-container">
    <el-image :src="imgUrl" alt="" fit="contain" class="hero-image" />
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
          <el-icon :size="80" color="#2b6fc2"><Ticket /></el-icon>
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
          <el-icon :size="80" color="#67c23a"><ShoppingBag /></el-icon>
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
          <el-icon :size="80" color="#e6a23c"><ChatDotRound /></el-icon>
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
  margin-top: 20px;

  @media (max-width: 768px) {
    margin-top: 10px;
    padding: 0 10px;
  }

  @media (max-width: 480px) {
    margin-top: 5px;
    padding: 0 5px;
  }

  .hero-image {
    width: 1200px;
    height: 500px;
    margin: 20px auto;
    display: block;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

    @media (max-width: 1200px) {
      width: 100%;
      height: 400px;
      margin: 15px auto;
    }

    @media (max-width: 768px) {
      width: 100%;
      height: 250px;
      margin: 10px auto;
      border-radius: 4px;
    }

    @media (max-width: 480px) {
      width: 100%;
      height: 200px;
      margin: 10px auto;
    }
  }
}

h2 {
  text-align: center;
  color: @primary-color;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 15px;
    padding: 0 10px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    margin-bottom: 10px;
  }
}

.info-section {
  text-align: center;
  margin-bottom: 30px;
  color: @text-color;
  line-height: 1.6;

  @media (max-width: 768px) {
    margin-bottom: 20px;
    padding: 0 15px;
    font-size: 14px;
  }

  @media (max-width: 480px) {
    margin-bottom: 15px;
    padding: 0 10px;
    font-size: 13px;
  }
}

.quick-actions {
  display: flex;
  justify-content: space-between;
  margin: 30px 0;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    margin: 20px 0;
    padding: 0 10px;
  }

  @media (max-width: 480px) {
    margin: 15px 0;
    padding: 0 5px;
  }
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

      @media (max-width: 768px) {
        font-size: 16px;
      }

      @media (max-width: 480px) {
        font-size: 14px;
      }
    }
  }

  .card-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;

    @media (max-width: 768px) {
      padding: 15px;
    }

    @media (max-width: 480px) {
      padding: 10px;
    }

    .el-icon {
      margin-bottom: 15px;

      @media (max-width: 768px) {
        margin-bottom: 10px;
        font-size: 60px !important;
      }

      @media (max-width: 480px) {
        margin-bottom: 8px;
        font-size: 50px !important;
      }
    }

    p {
      @media (max-width: 768px) {
        font-size: 14px;
        margin-bottom: 10px;
      }

      @media (max-width: 480px) {
        font-size: 12px;
        margin-bottom: 8px;
      }
    }

    .el-button {
      @media (max-width: 768px) {
        font-size: 14px;
        padding: 8px 16px;
      }

      @media (max-width: 480px) {
        font-size: 12px;
        padding: 6px 12px;
      }
    }
  }

  .card-image {
    margin-bottom: 15px;
    border-radius: 5px;
  }
}

.statistics-section {
  margin: 40px 0 20px;

  @media (max-width: 768px) {
    margin: 30px 0 15px;
    padding: 0 10px;
  }

  @media (max-width: 480px) {
    margin: 20px 0 10px;
    padding: 0 5px;
  }
}

.statistic-card {
  background-color: @bg-color;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

  @media (max-width: 768px) {
    padding: 15px;
    margin-bottom: 15px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    margin-bottom: 10px;
    flex-direction: column;
    text-align: center;
  }

  .statistic-icon {
    font-size: 30px;
    color: @primary-color;
    margin-right: 15px;

    @media (max-width: 768px) {
      font-size: 25px;
      margin-right: 12px;
    }

    @media (max-width: 480px) {
      font-size: 20px;
      margin-right: 0;
      margin-bottom: 8px;
    }
  }

  .statistic-info {
    .statistic-value {
      font-size: 24px;
      font-weight: bold;
      color: @primary-color;

      @media (max-width: 768px) {
        font-size: 20px;
      }

      @media (max-width: 480px) {
        font-size: 18px;
      }
    }

    .statistic-label {
      font-size: 14px;
      color: @text-color;
      margin-top: 5px;

      @media (max-width: 768px) {
        font-size: 13px;
      }

      @media (max-width: 480px) {
        font-size: 12px;
        margin-top: 3px;
      }
    }
  }
}

@media (max-width: 768px) {
  .action-card {
    width: 100%;
  }
}
</style>
