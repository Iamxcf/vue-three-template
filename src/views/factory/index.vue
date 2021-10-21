<template>
  <div class="home">

    <div id="box" class="box" />
    <div ref="info" class="info" :class="{show:isShow}">{{ info.name }}</div>
  </div>
</template>
<script>
import FactoryThree from './index.js'
import emitter from '@/three3D/events/event-emitter'

export default {
  name: 'Factory',
  data(){
    return {
      isShow: false,
      colors: [0xff0000, 0xffff00],
      info: {
        name: '123'
      }
    }
  },
  mounted(){
    new FactoryThree(document.getElementById('box'))
    emitter.on('show-info', (obj, position) => {
      const {name} = obj
      console.log('name :>> ', name)
      if (name === 'none' || name === '立方体'){
        this.isShow = false
      } else {
        this.isShow = true

        this.$refs.info.style = `top:${position[1]}px;left:${position[0] + 20}px`
        this.info.name = obj.name || '未知物品'
      }
    })
  }

}
</script>
<style lang="scss" scoped>
.info{
  opacity: 0;
  position: absolute;
  left: 0;
  top: 0;
  @include flex();
  color: #fff;
  background: rgba(0,0,255,.5);
  padding: 10px 30px;
  border-radius: 4px;
  &.show{
    opacity: 1;
  }
}
.home{
  height: 100vh;
  width: 80vw;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  margin: auto;
  @include flex();
  justify-content: center;
  align-items: center;
  flex-direction: column;
  .box{
    background: #fff;
    height: 100%;
    width: 100%;
  }
}
</style>
