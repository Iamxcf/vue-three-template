<template>
  <div class="home">
    <div id="box" class="box" />
  </div>
</template>

<script>
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import {Viewer} from '@/three3D/initThree'
let camera, scene, renderer, controls, clock, mixer, container

export default {
  name: 'Home',

  components: {

  },
  data(){
    return {
      // img: require('@/assets/logo.png')
      content: '首页'
    }
  },
  created(){
    console.log('process.env.NODE_ENV :>> ', process.env.VUE_APP_BASE_API)
  },
  mounted(){
    container = document.querySelector('#box')

    this.inter()
    // this.init()
    // this.animate()
  },
  methods: {
    inter(){
      const viewer = new Viewer(container)
      console.log('viewer :>> ', viewer)
    },
    init(){
      clock = new THREE.Clock()

      const { offsetWidth, offsetHeight} = container
      camera = new THREE.PerspectiveCamera( 45, offsetWidth / offsetHeight, 0.25, 1000 )
      camera.position.set( 0, 0.4, 0.7 )

      scene = new THREE.Scene()

      new RGBELoader()
        .setPath( 'three/hdr/' )
        .load( 'floor.hdr', function ( texture ) {
          texture.mapping = THREE.EquirectangularReflectionMapping

          scene.background = texture
          scene.environment = texture

          // model
          const scale = 0.01
          new GLTFLoader()
            .setPath( 'three/models/' )
            .setDRACOLoader( new DRACOLoader().setDecoderPath( 'three/libs/draco/gltf/' ) )
            .load( 'Horse.glb', function ( gltf ) {
              const mesh = gltf.scene

              mixer = new THREE.AnimationMixer( mesh )
              mixer.clipAction( gltf.animations[ 0 ] ).play()
              mesh.scale.set(scale, scale, scale)
              scene.add( mesh )
            } )
        } )

      renderer = new THREE.WebGLRenderer( { antialias: true } )
      renderer.setPixelRatio( window.devicePixelRatio )
      renderer.setSize( offsetWidth, offsetHeight )
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1
      renderer.outputEncoding = THREE.sRGBEncoding
      container.appendChild( renderer.domElement )

      controls = new OrbitControls( camera, renderer.domElement )
      controls.enableDamping = true
      controls.minDistance = 0.5
      controls.maxDistance = 1
      controls.target.set( 0, 0.1, 0 )
      controls.update()

      window.addEventListener( 'resize', this.onWindowResize )
    },
    onWindowResize(){
      const {offsetWidth, offsetHeight } = container

      camera.aspect = offsetWidth / offsetHeight
      camera.updateProjectionMatrix()

      renderer.setSize( offsetWidth, offsetHeight )
    },
    animate() {
      requestAnimationFrame( this.animate )

      if ( mixer ) mixer.update( clock.getDelta() )

      controls.update() // required if damping enabled

      this.render()
    },

    render() {
      renderer.render( scene, camera )
    }
  }
}
</script>
<style lang="scss" scoped>
.home{
  height: 100vh;
  width: 100vw;
  position: relative;
  @include flex();
  .box{
    background: #000;
    width: 100%;
    height: 100%;
  }
}
</style>
