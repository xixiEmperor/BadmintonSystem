<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 轮播图数据
const carouselItems = ref([
  {
    id: 1,
    title: 'YONEX 弓箭11羽毛球拍',
    subtitle: '专业级碳纤维球拍，轻量化设计，提升击球速度',
    image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=400&fit=crop',
    buttonText: '立即购买',
    link: '/product/1',
    bgColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    id: 2,
    title: 'Victor 胜利羽毛球',
    subtitle: '比赛级羽毛球，优质鹅毛制作，飞行稳定耐打',
    image: 'https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?w=800&h=400&fit=crop',
    buttonText: '查看详情',
    link: '/product/2',
    bgColor: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    id: 3,
    title: 'ASICS 专业羽毛球鞋',
    subtitle: '防滑耐磨，缓震舒适，专为羽毛球运动设计',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=400&fit=crop',
    buttonText: '查看详情',
    link: '/product/3',
    bgColor: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  },
  {
    id: 4,
    title: 'Li-Ning 羽毛球服套装',
    subtitle: '透气速干面料，专业剪裁，运动更自在',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
    buttonText: '立即选购',
    link: '/product/4',
    bgColor: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)'
  }
])

// 跳转到商品详情
const goToProduct = (link) => {
  router.push(link)
}
</script>

<template>
  <div class="product-carousel">
    <el-carousel
      :interval="4000"
      type="card"
      height="280px"
      class="carousel-container">
      <el-carousel-item
        v-for="item in carouselItems"
        :key="item.id"
        class="carousel-item">
        <div
          class="carousel-content"
          :style="{ background: item.bgColor }">
          <div class="content-left">
            <h3 class="carousel-title">{{ item.title }}</h3>
            <p class="carousel-subtitle">{{ item.subtitle }}</p>
            <el-button
              type="primary"
              size="large"
              class="carousel-button"
              @click="goToProduct(item.link)">
              {{ item.buttonText }}
            </el-button>
          </div>
          <div class="content-right">
            <img :src="item.image" :alt="item.title" class="carousel-image">
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<style scoped>
.product-carousel {
  margin: 20px 0 30px 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.carousel-container {
  border-radius: 12px;
}

.carousel-item {
  border-radius: 12px;
  overflow: hidden;
}

.carousel-content {
  height: 100%;
  display: flex;
  align-items: center;
  padding: 30px;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.carousel-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  z-index: 1;
}

.content-left {
  flex: 1;
  z-index: 2;
  position: relative;
}

.content-right {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  position: relative;
}

.carousel-title {
  font-size: 28px;
  font-weight: bold;
  color: #fff;
  margin-bottom: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.carousel-subtitle {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 24px;
  line-height: 1.5;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.carousel-button {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-weight: bold;
  padding: 12px 24px;
  border-radius: 25px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
}

.carousel-button:hover {
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.carousel-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease;
}

.carousel-image:hover {
  transform: scale(1.05);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .product-carousel {
    margin: 15px 0 20px 0;
  }

  .carousel-container {
    height: 200px !important;
  }

  .carousel-content {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }

  .content-left {
    margin-bottom: 15px;
  }

  .content-right {
    display: none; /* 移动端隐藏图片 */
  }

  .carousel-title {
    font-size: 20px;
    margin-bottom: 8px;
  }

  .carousel-subtitle {
    font-size: 14px;
    margin-bottom: 15px;
  }

  .carousel-button {
    padding: 8px 16px;
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  .carousel-container {
    height: 160px !important;
  }

  .carousel-content {
    padding: 15px;
  }

  .carousel-title {
    font-size: 18px;
  }

  .carousel-subtitle {
    font-size: 12px;
  }
}

/* 自定义轮播图指示器样式 */
:deep(.el-carousel__indicator) {
  background-color: rgba(255, 255, 255, 0.3);
}

:deep(.el-carousel__indicator.is-active) {
  background-color: rgba(255, 255, 255, 0.8);
}

:deep(.el-carousel__arrow) {
  background-color: rgba(255, 255, 255, 0.2);
  border: none;
  color: #fff;
}

:deep(.el-carousel__arrow:hover) {
  background-color: rgba(255, 255, 255, 0.3);
}
</style>
