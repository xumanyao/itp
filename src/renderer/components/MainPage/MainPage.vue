<template>
    <div class="container">
        <div class="inner">
            <div class="logo" v-show="state === 1">
                <img style="width: 426px;height: 304px" src="../../../../static/img/logo.png"/>
            </div>
            <div class="use" v-show="state === 2"></div>
            <div class="feedback" v-show="state === 3"></div>
        </div>
    </div>
</template>

<script>
  import {ipcRenderer} from 'electron'

  ipcRenderer.on('goList', (e, msg) => {
    if (msg) {
      console.log(msg)
      window.location.hash = '#/list'
    }
  })
  ipcRenderer.on('goType', (e, msg) => {
    if (msg) {
      console.log(msg)
      window.location.hash = '#/type'
    }
  })
  ipcRenderer.on('infoType', (e, type) => {
    console.log(type)
  })

  export default {
    name: 'MainPage',
    created () {
      ipcRenderer.on('infoType', (e, type) => {
        console.log(type)
        switch (type) {
          case 'useText':
            this.state = 2
            break
          case 'feedback':
            this.state = 3
        }
      })
    },
    data () {
      return {
        state: 1
      }
    }
  }
</script>

<style scoped>
    .container {
        display: flex;
        justify-content: center;
    }

    .inner {
        display: inline-block;
    }
    .use {
        min-height: 200px;
        border: 1px solid black;
    }

</style>
