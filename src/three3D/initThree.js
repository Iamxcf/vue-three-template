
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { GUI } from 'dat.gui'
import Stats from 'three/examples/jsm/libs/stats.module.js'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js'
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader.js'

const MAP_NAMES = [
  'map',
  'aoMap',
  'emissiveMap',
  'glossinessMap',
  'metalnessMap',
  'normalMap',
  'roughnessMap',
  'specularMap'
]
export class Viewer {
  constructor(el, options) {
    this.container = el
    this.camera = null
    this.scene = null
    this.renderer = null
    this.controls = null
    this.content = null
    this.mixer = null
    this.animFolder = null
    this.gui = null
    this.prevTime = 0
    this.lights = []
    this.stats = new Stats()
    this.raycaster = new THREE.Raycaster()
    this.composer = null
    this.clips = []

    this.options = {
      ...{
        rotate: {
          x: 0, y: 0, z: 0
        }
      },
      ...options
    }
    this.state = {

      background: false,
      playbackSpeed: 1.0,
      actionStates: {}

    }
    this.init()
  }
  init() {
    this.initCamera()
    this.initScene()
    this.initContainer()
    this.initControls()
    // this.addGUI()
    this.useEffectComposer()
    this.animate = this.animate.bind(this)
    requestAnimationFrame( this.animate )
    window.addEventListener('resize', this.onWindowResize.bind(this), false)
  }
  load(url) {
    return new Promise((resolve, reject) => {
      const loader = new GLTFLoader()

      loader.load(url, (gltf) => {
        // this.getFitScaleValue(gltf)
        const scene = gltf.scene || gltf.scenes[0]
        const clips = gltf.animations || []
        this.setContent(scene, clips)

        this.render()

        resolve(gltf)
      }, undefined, reject)
    })
  }
  render() {
    this.renderer.render(this.scene, this.camera)
    this.composer.render()
  }
  initContainer() {
    const {clientWidth, clientHeight} = this.container
    this.renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true } )
    this.renderer.setSize( clientWidth, clientHeight )
    this.renderer.setClearColor(0xcccccc, 1)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.container.appendChild( this.renderer.domElement )
  }
  initCamera() {
    const {clientWidth, clientHeight} = this.container
    this.camera = new THREE.PerspectiveCamera(60, clientWidth / clientHeight, 0.01, 1000)
  }

  initScene() {
    this.scene = new THREE.Scene()
    this.addLights()

    this.scene.add( this.camera )
  }

  initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.autoRotate = false
    this.controls.autoRotateSpeed = -10
    this.controls.screenSpacePanning = true
    this.controls.addEventListener('change', this.render.bind(this)) // use if there is no animation loop
  }
  addLights() {
    const light1 = new THREE.AmbientLight(0xbbbbbb)
    // const light1 = new THREE.HemisphereLight( 0xffffff, 0x080820, 1 )
    light1.name = 'ambient_light'
    this.scene.add(light1)

    const light2 = new THREE.DirectionalLight(0xf2f2f2, 0.8)
    // light2.position.set(200, 300, 200) // ~60º
    light2.position.set(-120, 20, 20) // ~60º

    light2.name = 'main_light'
    light2.castShadow = true
    this.scene.add(light2)
  }

  animate (time) {
    requestAnimationFrame( this.animate )
    const dt = (time - this.prevTime) / 1000
    this.controls.update()
    this.stats.update()
    this.mixer && this.mixer.update(dt)
    this.render()
    this.prevTime = time
  }
  onWindowResize() {
    const {clientWidth, clientHeight} = this.container
    this.camera.aspect = clientWidth / clientHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(clientWidth, clientHeight)
    this.render()
  }

  clear() {
    if ( !this.content ) return

    this.scene.remove( this.content )

    // dispose geometry
    this.content.traverse((node) => {
      if ( !node.isMesh ) return
      node.geometry.dispose()
    } )

    // dispose textures
    traverseMaterials( this.content, (material) => {
      MAP_NAMES.forEach( (map) => {
        if (material[ map ]) material[ map ].dispose()
      } )
    } )
  }
  /**
   * @param {THREE.Object3D} object
   * @param {Array<THREE.AnimationClip} clips
   */
  setContent ( object, clips ) {
    this.clear()

    const box = new THREE.Box3().setFromObject(object)
    const size = box.getSize(new THREE.Vector3()).length() * 0.1
    const center = box.getCenter(new THREE.Vector3())

    this.controls.reset()

    object.position.x += (object.position.x - center.x)
    object.position.y += (object.position.y - center.y)
    object.position.z += (object.position.z - center.z)
    this.controls.maxDistance = size * 10
    this.camera.near = size / 100
    this.camera.far = size * 100
    this.camera.updateProjectionMatrix()

    this.camera.position.copy(center)
    this.camera.position.x += size / 2.0
    this.camera.position.y += size / 5.0
    this.camera.position.z += size / 2.0
    this.camera.lookAt(center)
    this.controls.saveState()

    this.scene.add(object)
    this.content = object
    this.setClips(clips)
  }
  addGUI() {
    const gui = this.gui = new GUI({autoPlace: false, width: 260, hideable: true})
    // Animation controls.
    this.animFolder = gui.addFolder('Animation')
    // this.animFolder.domElement.style.display = 'none'
    const playbackSpeedCtrl = this.animFolder.add(this.state, 'playbackSpeed', 0, 1)
    playbackSpeedCtrl.onChange((speed) => {
      if (this.mixer) this.mixer.timeScale = speed
    })
    // this.animFolder.add({playAll: () => this.playAllClips()}, 'playAll')
    const guiWrap = document.createElement('div')
    this.container.appendChild( guiWrap )
    guiWrap.classList.add('gui-wrap')
    guiWrap.appendChild(gui.domElement)
    gui.open()
  }
  /**
   * @param {Array<THREE.AnimationClip} clips 动画
   */
  setClips ( clips ) {
    if (this.mixer) {
      this.mixer.stopAllAction()
      this.mixer.uncacheRoot(this.mixer.getRoot())
      this.mixer = null
    }

    this.clips = clips
    if (!clips.length) return

    this.mixer = new THREE.AnimationMixer(this.content)
    this.playAllClips()
  }
  // 播放动画
  playAllClips () {
    this.clips.forEach((clip) => {
      this.mixer.clipAction(clip).reset().play()
      this.state.actionStates[clip.name] = true
    })
  }

  getFitScaleValue(obj) {
    let scaleNum = 1
    const {clientWidth, clientHeight} = this.container
    const group = new THREE.Group()
    group.add(obj.scene)
    const box = new THREE.Box3().setFromObject(group)
    const xVal = (box.max.x - box.min.x)
    const yVal = (box.max.y - box.min.y)
    const zVal = (box.max.z - box.min.z)
    group.position.set(0, 0, 0)
    const dist = Math.abs(this.camera.position.z - group.position.z - (zVal / 2)) // 计算相机到物体正面的距离。
    const vFov = this.camera.fov * Math.PI / 180 // 将垂直fov转换为弧度
    const vheight = 2 * Math.tan(vFov * 0.5) * dist
    const fraction = yVal / vheight
    const finalHeight = clientHeight * fraction
    const finalWidth = (finalHeight * xVal) / yVal
    const scaleWidth = clientWidth / finalWidth
    // 包围盒计算的高/finalHeight = 包围盒计算的宽/finalWidth 。
    const scaleHeight = clientHeight / finalHeight

    if (scaleWidth > scaleHeight){
      scaleNum = scaleHeight
    } else {
      scaleNum = scaleWidth
    }
    this.setRotate(group)

    group.scale.set(scaleNum, scaleNum, scaleNum)
    const newBox = new THREE.Box3().setFromObject(group)

    group.position.set(-(newBox.max.x + newBox.min.x) / 2,
      -(newBox.max.y + newBox.min.y) / 2,
      -(newBox.max.z + newBox.min.z) / 2 - (newBox.max.z - newBox.min.z) / 2)
    // group.geometry.center()

    const newBoxHelper = new THREE.BoxHelper(group, 0xbe1915) // 外面红色框
    this.scene.add(newBoxHelper)

    this.scene.add(group)
  }
  setRotate(group) {
    const rotaX = this.options.rotate.x * Math.PI / 180
    const rotaY = this.options.rotate.y * Math.PI / 180
    const rotaZ = this.options.rotate.z * Math.PI / 180
    group.rotateX(rotaX)
    group.rotateY(rotaY)
    group.rotateZ(rotaZ)
  }
  getLocalPosition(point) {
    // 获取到窗口的一半高度和一半宽度
    // const halfWidth = this.containerHeight / 2
    // const halfHeight = this.containerWidth / 2
    const {clientWidth, clientHeight} = this.container

    const halfWidth = window.innerWidth / 2
    const halfHeight = window.innerHeight / 2
    const vector = point.project(this.camera)
    const x = vector.x * halfWidth + halfWidth
    const y = -vector.y * halfHeight + halfHeight
    return [x, y]
  }
  useEffectComposer() {
    // const {clientWidth, clientHeight} = this.container

    const composer = new EffectComposer(this.renderer)
    this.composer = composer
    const renderPass = new RenderPass(this.scene, this.camera)
    composer.addPass(renderPass)
    const outlinePass = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      this.scene,
      this.camera
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
  getFirstIntersectObj(event) {
    if (!event) {
      return
    }
    const rect = this.container.getBoundingClientRect()
    const { left, top } = rect
    const {clientWidth, clientHeight} = this.container

    // 通过鼠标点击的位置计算出raycaster所需要的点的位置，以屏幕中心为原点，值的范围为-1到1.
    const mouse = new THREE.Vector2()
    // mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    // mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    mouse.x = ( (event.clientX - left) / clientWidth ) * 2 - 1
    mouse.y = -( (event.clientY - top) / clientHeight ) * 2 + 1
    // 通过鼠标点的位置和当前相机的矩阵计算出raycaster
    this.raycaster.setFromCamera(mouse, this.camera)
    // 获取raycaster直线和所有模型相交的数组集合
    const obj = this.raycaster.intersectObjects(this.scene.children, true)[0]
    if (!obj) {
      return
    } else if (obj && obj.object.name === '立方体') {
      this.outlinePass.selectedObjects = [obj.object.parent]
    } else {
      this.outlinePass.selectedObjects = [obj.object]
    }
    return obj
  }
}

function traverseMaterials (object, callback) {
  object.traverse((node) => {
    if (!node.isMesh) return
    const materials = Array.isArray(node.material)
      ? node.material
      : [node.material]
    materials.forEach(callback)
  })
}
