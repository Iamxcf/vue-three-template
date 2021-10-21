import * as THREE from 'three'

import Config from './config'

// 相机类
export default class Camera {
  constructor(renderer, container) {
    this.container = container

    // 相机位置
    this.threeCamera = new THREE.PerspectiveCamera(
      Config.camera.fov,
      this.container.offsetWidth / this.container.offsetHeight,
      Config.camera.near,
      Config.camera.far
    )

    this.threeCamera.position.set(Config.camera.posX, Config.camera.posY, Config.camera.posZ)
    // this.threeCamera.position.set(0,50,100)

    // 初始化
    this.updateSize(this.container)

    // 监听事件
    window.addEventListener('resize', this.updateSize.bind(this, this.container), false)
  }

  updateSize(container) {
    // 更新相机
    console.log('this :>> ', this)
    console.log('container :>> ', container)
    this.threeCamera.aspect = container.offsetWidth / container.offsetHeight

    this.threeCamera.updateProjectionMatrix()
  }
}
