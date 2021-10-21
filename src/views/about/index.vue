<template>
  <div class="home">
    <!-- <div @click="changeColor(0)">红色</div>
    <div @click="changeColor(1)">黄色</div> -->
    <div id="box" class="box" />
    <div ref="info" class="info" :class="{show:isShow}">{{ info.name }}</div>

  </div>
</template>
<script>
import * as THREE from 'three'
import throttle from 'lodash/throttle'

import {Viewer} from '@/three3D/initThree'
let viewer, container; let scene; const mouse = new THREE.Vector2(); const raycaster = new THREE.Raycaster()
export default {
  name: 'About',
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
    this.init()
    // this.init()
    // this.animate()

    // document.addEventListener('pointermove', this.$throttle(this.onPointerClick, 150) )
    window.addEventListener('pointermove', throttle(this.showObjInfo.bind(this), 300)) // 单击选中物体
  },
  beforeDestory(){
    viewer.clear()
  },
  methods: {
    init(){
      container = document.querySelector('#box')
      const url = 'three/models/test.gltf'
      const options = {
        rotate: {
          x: 30, y: 0, z: 0
        }
      }
      if (viewer){
        viewer.clear()
      }
      viewer = new Viewer(container, options)
      viewer
        .load(url)
        .then((gltf) => {
          console.log('gltf :>> ', gltf)
          scene = gltf.scene
          scene.castShadow = true

          scene.traverse((node) => {
            if (!node.isMesh) return
            node.castShadow = true
          })
          console.log('scene :>> ', scene)
          // const size = 0.5
          // gltf.scene.scale.set(size, size, size)
        })
        .catch((e) => {
          console.log('e :>> ', e)
        })
    },
    showObjInfo(event) {
      const targetObj = viewer.getFirstIntersectObj(event)
      if (!targetObj){
        return
      }
      // console.log('object', targetObj.object.name)
      const position = viewer.getLocalPosition(targetObj.point)
      // const position = viewer.getLocalPosition(event)

      this.infoShow(targetObj.object, position)
    },
    infoShow(obj, position) {
      const {name} = obj
      if (name === 'Cube009'){
        // debugger
      }
      console.log('name :>> ', name)
      if (name === 'none' || name === '立方体'){
        this.isShow = false
      } else {
        this.isShow = true

        this.$refs.info.style = `top:${position[1]}px;left:${position[0] + 20}px`
        this.info.name = obj.name || '未知物品'
      }
    },
    changeColor(i){
      const arr = [0xff0000, 0xffff00, 0x0000ff]
      const cur = arr[i]
      scene.children[0].material.color = new THREE.Color(cur)
    },
    onPointerClick(event) {
      console.log('11111111111 :>> ', 11111111111)
      const [w, h] = [window.innerWidth, window.innerHeight]
      mouse.x = (event.clientX / w) * 2 - 1
      mouse.y = -(event.clientY / h) * 2 + 1
      raycaster.setFromCamera(mouse, viewer.defaultCamera)
      let intersects
      if (scene.type === 'Mesh') {
        intersects = raycaster.intersectObjects([scene], false)
      } else {
        intersects = raycaster.intersectObjects(scene.children, true)
      }

      if (intersects.length > 0) {
        // 回调函数，返回被监听对象本身
        const object = intersects[ 0 ].object
        // object.material.color = new THREE.Color(0xff0000)
        // transformControl.attach( object )
        /*
        intersects.map((obj, i) => {
          const {object} = obj
          console.log('i :>> ', i)
          const color = this.colors[i] || this.colors[0]
          object.material.color = new THREE.Color(color)
        }) */
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.info{
  opacity: 0;
  position: fixed;
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
  width: 100vw;
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
    // background: rgba(0,0,0,0);
    background: #000;
    height: 100%;
    width: 100%;
  }
}
</style>
