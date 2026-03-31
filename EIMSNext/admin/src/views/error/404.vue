<script setup lang="ts">
import { useRouter } from "vue-router";

defineOptions({
  name: "Page404",
});

const router = useRouter();

function back() {
  router.back();
}
</script>

<template>
  <div class="page-container">
    <div class="pic-404">
      <img class="pic-404__parent" src="@/assets/images/404.png" alt="404" />
      <img class="pic-404__child left" src="@/assets/images/404_cloud.png" alt="404" />
      <img class="pic-404__child mid" src="@/assets/images/404_cloud.png" alt="404" />
      <img class="pic-404__child right" src="@/assets/images/404_cloud.png" alt="404" />
    </div>
    <div class="bullshit">
      <div class="bullshit__oops">OOPS!</div>
      <div class="bullshit__info">
        All rights reserved
        <a class="info-link" href="https://wallstreetcn.com" target="_blank">wallstreetcn</a>
      </div>
      <div class="bullshit__headline">The webmaster said that you can not enter this page...</div>
      <div class="bullshit__info">
        Please check that the URL you entered is correct, or click the button below to return to the
        homepage.
      </div>
      <a href="#" class="bullshit__return-home" @click.prevent="back">Back to home</a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.page-container {
  display: flex;
  padding: var(--et-size-100);

  .pic-404 {
    width: var(--et-size-600);
    overflow: hidden;

    &__parent {
      width: 100%;
    }

    &__child {
      &.left {
        top: 17px;
        left: 220px;
        width: var(--et-size-80);
        opacity: 0;
        animation-name: cloudLeft;
        animation-duration: 2s;
        animation-timing-function: linear;
        animation-delay: 1s;
        animation-fill-mode: forwards;
      }

      &.mid {
        top: 10px;
        left: 420px;
        width: var(--et-size-46);
        opacity: 0;
        animation-name: cloudMid;
        animation-duration: 2s;
        animation-timing-function: linear;
        animation-delay: 1.2s;
        animation-fill-mode: forwards;
      }

      &.right {
        top: 100px;
        left: 500px;
        width: var(--et-size-62);
        opacity: 0;
        animation-name: cloudRight;
        animation-duration: 2s;
        animation-timing-function: linear;
        animation-delay: 1s;
        animation-fill-mode: forwards;
      }

      @keyframes cloudLeft {
        0% {
          top: 17px;
          left: 220px;
          opacity: 0;
        }

        20% {
          top: 33px;
          left: 188px;
          opacity: 1;
        }

        80% {
          top: 81px;
          left: 92px;
          opacity: 1;
        }

        100% {
          top: 97px;
          left: 60px;
          opacity: 0;
        }
      }

      @keyframes cloudMid {
        0% {
          top: 10px;
          left: 420px;
          opacity: 0;
        }

        20% {
          top: 40px;
          left: 360px;
          opacity: 1;
        }

        70% {
          top: 130px;
          left: 180px;
          opacity: 1;
        }

        100% {
          top: 160px;
          left: 120px;
          opacity: 0;
        }
      }

      @keyframes cloudRight {
        0% {
          top: 100px;
          left: 500px;
          opacity: 0;
        }

        20% {
          top: 120px;
          left: 460px;
          opacity: 1;
        }

        80% {
          top: 180px;
          left: 340px;
          opacity: 1;
        }

        100% {
          top: 200px;
          left: 300px;
          opacity: 0;
        }
      }
    }
  }

  .bullshit {
    width: var(--et-size-300);
    padding: var(--et-space-30) 0;
    overflow: hidden;

    &__oops {
      margin-bottom: var(--et-space-20);
      font-size: var(--et-size-32);
      font-weight: bold;
      line-height: var(--et-line-height-40);
      color: var(--et-color-primary);
      opacity: 0;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-fill-mode: forwards;
    }

    &__headline {
      margin-bottom: var(--et-space-10);
      font-size: var(--et-font-size-20);
      font-weight: bold;
      line-height: var(--et-line-height-24);
      color: var(--et-text-primary);
      opacity: 0;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.1s;
      animation-fill-mode: forwards;
    }

    &__info {
      margin-bottom: var(--et-space-30);
      font-size: var(--et-font-size-13);
      line-height: var(--et-line-height-20);
      color: var(--et-text-secondary);
      opacity: 0;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.2s;
      animation-fill-mode: forwards;
    }

    &__return-home {
      display: block;
      float: left;
      width: var(--et-size-110);
      height: var(--et-size-36);
      font-size: var(--et-font-size-14);
      line-height: var(--et-line-height-36);
      color: var(--et-text-on-primary);
      text-align: center;
      cursor: pointer;
      background: var(--et-color-primary);
      border-radius: var(--et-radius-100);
      opacity: 0;
      animation-name: slideUp;
      animation-duration: 0.5s;
      animation-delay: 0.3s;
      animation-fill-mode: forwards;
    }

    @keyframes slideUp {
      0% {
        opacity: 0;
        transform: translateY(60px);
      }

      100% {
        opacity: 1;
        transform: translateY(0);
      }
    }
  }
}

.info-link {
  color: var(--et-color-primary);
}
</style>
