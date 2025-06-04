<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { getRecommendProducts } from '@/api/shop'

const router = useRouter()

// 轮播图数据
const carouselItems = ref([])

// 跳转到商品详情
const goToProduct = (id) => {
  router.push(`/product/${id}`)
}

// 获取轮播图数据
const fetchCarouselItems = async () => {
  try {
    const res = await getRecommendProducts()
    if (res.data.code === 0) {
      carouselItems.value = res.data.data
    } else {
      ElMessage.error(res.data.message)
    }
  } catch (error) {
    console.error('获取轮播图数据失败', error)
  }
}

onMounted(async () => {
  await fetchCarouselItems()
})
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
            <h3 class="carousel-title">{{ item.productName }}</h3>
            <p class="carousel-subtitle">{{ item.subtitle }}</p>
            <el-button
              type="primary"
              size="large"
              class="carousel-button"
              @click="goToProduct(item.productId)">
              立即购买
            </el-button>
          </div>
          <div class="content-right">
            <img :src="item.mainImage" :alt="item.title" class="carousel-image">
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
  background: rgba(255, 255, 255, 0.25);
  border: 2px solid rgba(255, 255, 255, 0.4);
  color: #fff;
  font-weight: bold;
  padding: 12px 24px;
  border-radius: 25px;
  transition: all 0.2s ease;
}

.carousel-button:hover {
  background: rgba(255, 255, 255, 0.35);
  border-color: rgba(255, 255, 255, 0.6);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.carousel-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
}

.carousel-image:hover {
  transform: scale(1.02);
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
