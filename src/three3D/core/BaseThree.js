import * as THREE from 'three'
import TWEEN from '@tweenjs/tween.js'
import Renderer from './renderer' // 初始化渲染器(paint、shadow、resize、dpr)
import Camera from './camera' // 初始化相机(init、resize、position change)
import Light from './light' // 给场景添加光源(环境光、方向光、点光、半球光)
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'

// 全局配置
import Config from './config'

process.env.NODE_ENV === 'development' && (Config.isDev = true)
export default class BaseThree {
  constructor(container) {
    this.container = container
    this.containerWidth = this.container.offsetWidth
    this.containerHeight = this.container.offsetHeight
    this.initScene()
    this.initLight()
    this.initRenderer()
    this.initCamera()
    this.initOrbitControl()
    this.initRaycaster()
    this.useEffectComposer()
    // Config.isDev && this.initAxis()
    this.clock = new THREE.Clock()
    this.render()
    window.__HMF__ = {} // 缓存已加载的物体
  }
  loadModel() {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader()

      loader.load('three/models/test.gltf', (gltf) => {
        resolve(gltf)
      }, undefined, reject)
    })
  }

  initAxis() {
    // 轴辅助 （每一个轴的长度）
    var object = new THREE.AxesHelper(100)
    object.position.set(0, 0, 0)
    this.scene.add(object)
  }

  initScene() {
    this.scene = new THREE.Scene()
  }

  initOrbitControl() {
    this.threeControls = new OrbitControls(this.camera.threeCamera, this.container)
    this.threeControls.target.set(Config.controls.target.x, Config.controls.target.y, Config.controls.target.z)
    this.threeControls.autoRotate = Config.controls.autoRotate
    this.threeControls.autoRotateSpeed = Config.controls.autoRotateSpeed
    this.threeControls.rotateSpeed = Config.controls.rotateSpeed
    this.threeControls.zoomSpeed = Config.controls.zoomSpeed
    this.threeControls.minDistance = Config.controls.minDistance
    this.threeControls.maxDistance = Config.controls.maxDistance
    this.threeControls.minPolarAngle = Config.controls.minPolarAngle
    this.threeControls.maxPolarAngle = Config.controls.maxPolarAngle
    this.threeControls.enableDamping = Config.controls.enableDamping
    this.threeControls.enableZoom = Config.controls.enableZoom
    this.threeControls.dampingFactor = Config.controls.dampingFactor
  }

  initCamera() {
    this.camera = new Camera(this.renderer.threeRenderer, this.container)
  }
  initRenderer() {
    this.renderer = new Renderer(this.scene, this.container)
  }
  initLight() {
    this.light = new Light(this.scene)
    const lights = ['ambient', 'spot']
    lights.forEach(light => this.light.place(light))
  }
  initRaycaster() {
    this.raycaster = new THREE.Raycaster()
  }

  // 设置模型的每个部位都可以投影
  setCastShadowAndReceiveShadow(obj) {
    obj.traverse(function(child) {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }
  getFirstIntersectObj(event) {
    if (!event) {
      return
    }
    // 通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
    const mouse = new THREE.Vector2()
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
    this.raycaster.setFromCamera(mouse, this.camera.threeCamera)
    // 获取raycaster直线和所有模型相交的数组集合
    const obj = this.raycaster.intersectObjects(this.scene.children, true)[0]
    if (obj && obj.object.name === '立方体') {
      this.outlinePass.selectedObjects = [obj.object.parent]
    } else {
      this.outlinePass.selectedObjects = [obj.object]
    }
    return obj
  }
  getLocalPosition(point) {
    // 获取到窗口的一半高度和一半宽度
    // const halfWidth = this.containerHeight / 2
    // const halfHeight = this.containerWidth / 2
    const halfWidth = window.innerWidth / 2
    const halfHeight = window.innerHeight / 2
    const vector1 = point.project(this.camera.threeCamera)
    return [vector1.x * halfWidth + halfWidth, -vector1.y * halfHeight + halfHeight]
  }
  positionAnimate(obj, targetPosition, i) {
    new TWEEN.Tween(obj.position)
      .to(
        {
          x: targetPosition[0],
          y: targetPosition[1],
          z: targetPosition[2]
        },
        2000
      )
      .easing(TWEEN.Easing.Quadratic.Out)
      .delay(200 * i + 1500)
      .start()
  }
  scaleAnimate(obj, targetScale, i) {
    new TWEEN.Tween(obj.scale)
      .to(
        {
          x: targetScale[0],
          y: targetScale[1],
          z: targetScale[2]
        },
        2000
      )
      .easing(TWEEN.Easing.Quadratic.Out)
      .delay(200 * i)
      .start()
  }
  useEffectComposer() {
    const composer = new EffectComposer(this.renderer.threeRenderer)
    this.composer = composer
    const renderPass = new RenderPass(this.scene, this.camera.threeCamera)
    composer.addPass(renderPass)
    const outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.scene,
      this.camera.threeCamera
    )
    outlinePass.visibleEdgeColor.set('#00a426')
    outlinePass.hiddenEdgeColor.set('#4d4542')
    outlinePass.edgeStrength = 5
    outlinePass.edgeGlow = 1
    outlinePass.edgeThickness = 1
    outlinePass.pulsePeriod = 1
    this.outlinePass = outlinePass
    composer.addPass(outlinePass)
    // 抗锯齿
    const effectFXAA = new ShaderPass(FXAAShader)
    effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight)
    composer.addPass(effectFXAA)
  }
  render() {
    this.threeControls.update()
    this.renderer.render(this.scene, this.camera.threeCamera)
    this.composer.render()

    requestAnimationFrame(this.render.bind(this))
  }
}
