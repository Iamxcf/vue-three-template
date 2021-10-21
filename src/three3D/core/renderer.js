import * as THREE from 'three'

// Main webGL renderer class
export default class Renderer {
  constructor(scene, container) {
    // Properties
    this.containerWidth = container.offsetWidth
    this.containerHeight = container.offsetHeight
    this.scene = scene
    this.container = container

    // Create WebGL renderer and set its antialias
    this.threeRenderer = new THREE.WebGLRenderer({
      antialias: true, // 是否开启抗锯齿
      alpha: true // 是否开启alphaBuffer，执行透明和半透明操作，A是RGBA中的A的透明度,开启后会透明！！！
    })
    this.threeRenderer.setClearColor(new THREE.Color(0x555555))
    // Appends canvas
    container.appendChild(this.threeRenderer.domElement)

    // Shadow map options
    this.threeRenderer.shadowMap.enabled = true
    // Initial size update set to canvas container
    this.updateSize()

    // Listeners
    document.addEventListener('DOMContentLoaded', () => this.updateSize(), false)
    window.addEventListener('resize', this.updateSize.bind(this), false)
  }

  updateSize() {
    this.threeRenderer.setSize(this.container.offsetWidth, this.container.offsetHeight)
  }

  render(scene, camera) {
    // Renders scene to canvas target
    this.threeRenderer.render(scene, camera)
  }
}
