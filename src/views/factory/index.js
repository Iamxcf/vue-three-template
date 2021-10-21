import * as THREE from 'three'
import BaseThree from '@/three3D/core/BaseThree'
import emitter from '@/three3D/events/event-emitter'
import throttle from 'lodash/throttle'
const arr = ['Cube001', 'Cube002', 'Cube003', 'Cube004', 'Cube005', 'Cube006', 'Cube008']
export default class FactoryThree extends BaseThree {
  constructor(container) {
    super(container)
    // this.showWelComeMessage()
    this.init()
    this.initEvent()
  }

  init() {
    this.loadModel().then(gltf => {
      const scene = gltf.scene || gltf.scenes[0]
      const scaleNum = 3
      scene.scale.set(scaleNum, scaleNum, scaleNum)
      scene.position.set(50, 0, -100)
      console.log('scene :>> ', scene)
      scene.rotation.set(0, -80 * Math.PI / 180, 0)
      scene.traverse(child => {
        const {name} = child
        // const materialPhong = new THREE.MeshBasicMaterial({
        //   opacity: 0.5,
        //   color: 0x1f56b9,
        //   side: THREE.BackSide,
        //   transparent: true
        // })

        // const materialPhong = new THREE.MeshLambertMaterial({ emissive: 0xff0000 })
        // const materialPhong = new THREE.MeshPhongMaterial({
        //   emissive: 0x111111
        // })

        const materialPhong = new THREE.MeshPhongMaterial({
          color: 0x666666,
          specular: 0x050505,
          shininess: 100
        })
        if (name && name.indexOf('Cube') > -1 && !arr.includes(name)) {
        // if (name && arr.includes(name)) {
          // child.material = basicMat
          child.material = materialPhong
          // light.position.set(-100, -69, 20)// 光方向
        }
      })
      this.scene.add(scene)
    })
  }
  initEvent() {
    // window.addEventListener('click', this.showObjInfo.bind(this), false) // 单击选中物体
    // window.addEventListener('pointermove', this.showObjInfo.bind(this), false) // 单击选中物体
    window.addEventListener('pointermove', throttle(this.showObjInfo.bind(this), 300)) // 单击选中物体
  }

  showObjInfo(event) {
    const targetObj = this.getFirstIntersectObj(event)
    // console.log('object', targetObj.object.name)
    if (targetObj) {
      this.timer = setTimeout(() => {
        const position = this.getLocalPosition(targetObj.point)
        emitter.emit('show-info', targetObj.object, position)
        this.timer = null
      }, 200)
    } else {
      emitter.emit('show-info', {name: 'none'})
    }
  }
}
