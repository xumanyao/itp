<template>
    <div class="container">
        <div class="inner">
            <div class="logo"><img style="width: 426px;height: 304px" src="../../../../static/img/logo.png" alt="">
            </div>
            <div class="title">欢迎使用综合测试平台</div>
        </div>
    </div>
</template>

<script>
  import {ipcRenderer} from 'electron';
  ipcRenderer.on('goLit', (e, msg) => {
    if (msg) {
      window.location.hash = '#/list';
    }
  });
  export default {
    name: 'MainPage'
  };
</script>

<style scoped>
    .container {
        display: flex;
        justify-content: center;
    }

    .inner {
        display: inline-block;
    }
    .title {
        text-align: center;
        color: #5E8479;
        font-weight: bolder;
        font-size: 24px;
        font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
        height: 56px;
        line-height: 56px;
        border: 1px dashed #5E8479;
        border-radius: 6px;
    }
</style>
