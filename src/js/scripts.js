import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import * as dat from 'dat.gui'
import { createNoise2D } from 'simplex-noise';

const renderer = new THREE.WebGLRenderer()

renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

renderer.shadowMap.enabled = true

const scene = new THREE.Scene()

const camera = new THREE.PerspectiveCamera(
  45, 
  window.innerWidth/window.innerHeight,
  1,
  1000
)
camera.position.set(5,5,30)

new OrbitControls(camera, renderer.domElement)

let planeGeometry = new THREE.PlaneBufferGeometry(200,200,150,150)
let planeMesh = new THREE.MeshLambertMaterial({ 
  color: 0xffffff, 
  side: THREE.DoubleSide,
  wireframe: true
})
let plane = new THREE.Mesh(planeGeometry, planeMesh);
plane.rotation.x = -Math.PI / 2
scene.add(plane);
plane.receiveShadow = true

let offsetX = 0
let offsetY = 0

let planeW = 200
let planeH = 200
let planeSW = 150
let planeSH = 150

const noise2D = createNoise2D()

const options = {
  speed: 0.001,
  wireframe: false,
  height: 5
}

const gui = new dat.GUI()
gui.add(options, 'speed', 0.001, 0.01)
gui.add(options, 'height', 1, 10)

function updatePlane(step) {
  let pos = planeGeometry.attributes.position.array
  offsetX += options.speed
  offsetY = 0

  for(let i = 0; i < pos.length; i+=3) {
    let x = pos[i]
    let y = pos[i+1]

    let dx = planeW / planeSW
    let dy = planeH / planeSH

    let row = Math.floor((y+10) / dy)
    let col = Math.floor((x+10) / dx)

    let tx = offsetX
    let ty = offsetY

    tx += row * 0.025
    ty += col * 0.025

    pos[i+2] = noise2D(tx, ty) * options.height
  }

  planeGeometry.attributes.position.needsUpdate = true
}

const vertexShader = `
  uniform float time;
  varying vec2 vUv;
  void main() {
    vec3 pos = position;
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`

const fragmentShader = `
  uniform float time;
  varying vec2 vUv;
  void main() {
    gl_FragColor = vec4(vUv, 0.0, 1.0);
  }
`

const r = 30
const y = 10
const lightDistance = 500

let conf = {
  lightIntensity: 0.9,
  light1Color: 0x0E09DC,
  light2Color: 0x1CD1E1,
  light3Color: 0x18C02C,
  light4Color: 0xee3bcf
}

let light1 = new THREE.PointLight(conf.light1Color, conf.lightIntensity, lightDistance)
light1.position.set(0, y, r)
scene.add(light1)

let light2 = new THREE.PointLight(conf.light2Color, conf.lightIntensity, lightDistance)
light2.position.set(0, -y, -r)
scene.add(light2)

let light3 = new THREE.PointLight(conf.light3Color, conf.lightIntensity, lightDistance)
light3.position.set(r, y, 0)
scene.add(light3)

let light4 = new THREE.PointLight(conf.light4Color, conf.lightIntensity, lightDistance)
light4.position.set(-r, y, 0)
scene.add(light4)

function updateLights() {
  const time = Date.now() * 0.001
  const d = 10
  light1.position.x = Math.sin(time * 0.1) * d
  light1.position.z = Math.cos(time * 0.2) * d
  light2.position.x = Math.cos(time * 0.3) * d
  light2.position.z = Math.sin(time * 0.4) * d
  light3.position.x = Math.sin(time * 0.5) * d
  light3.position.z = Math.sin(time * 0.6) * d
  light4.position.x = Math.sin(time * 0.7) * d
  light4.position.z = Math.cos(time * 0.8) * d
}

function animate(){

  updatePlane()
  updateLights()

  renderer.render(scene, camera)
}

renderer.setAnimationLoop(animate)

window.addEventListener('resize', function(){
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})

const mousePosition = new THREE.Vector2()
window.addEventListener('mousemove', function(e){
  mousePosition.x = (e.clientX / window.innerWidth) * 2 - 1
  mousePosition.y = - (e.clientY / window.innerHeight) * 2 + 1
})