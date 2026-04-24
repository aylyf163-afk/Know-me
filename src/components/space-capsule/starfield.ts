import * as THREE from 'three'

/**
 * Generate a wide "Earth from orbit" view: deep-space starfield in the upper half
 * and a massive Earth arc with a bright atmospheric limb filling the lower half.
 * Rendered onto a 2D canvas so it can be used as a window texture without any
 * external assets.
 */
export function createEarthViewTexture(variant: number = 0): THREE.CanvasTexture {
  const w = 1536
  const h = 640
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  const rand = mulberry32(2024 + variant * 131)

  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#01030a')
  sky.addColorStop(0.55, '#041025')
  sky.addColorStop(1, '#062044')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)

  for (let i = 0; i < 900; i++) {
    const y = rand() * h * 0.72
    const r = rand() * 1.3 + 0.15
    const fade = 1 - y / (h * 0.72)
    const a = (0.25 + rand() * 0.7) * fade
    ctx.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`
    ctx.beginPath()
    ctx.arc(rand() * w, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  for (let i = 0; i < 40; i++) {
    const x = rand() * w
    const y = rand() * h * 0.6
    const r = rand() * 1.6 + 1
    const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 4.5)
    grd.addColorStop(0, 'rgba(220,240,255,0.95)')
    grd.addColorStop(1, 'rgba(220,240,255,0)')
    ctx.fillStyle = grd
    ctx.beginPath()
    ctx.arc(x, y, r * 4.5, 0, Math.PI * 2)
    ctx.fill()
  }

  const ecx = w * (0.5 + (variant - 1) * 0.12)
  const ecy = h * 1.45
  const er = h * 1.35

  ctx.save()
  ctx.beginPath()
  ctx.arc(ecx, ecy, er, 0, Math.PI * 2)
  ctx.clip()

  const base = ctx.createRadialGradient(ecx, ecy - er * 0.45, 0, ecx, ecy, er)
  base.addColorStop(0, '#a9d7ff')
  base.addColorStop(0.15, '#4e9fe0')
  base.addColorStop(0.35, '#1f62a8')
  base.addColorStop(0.6, '#0d3570')
  base.addColorStop(0.85, '#061a3d')
  base.addColorStop(1, '#020a1c')
  ctx.fillStyle = base
  ctx.fillRect(0, 0, w, h)

  for (let i = 0; i < 28; i++) {
    const theta = (rand() - 0.5) * 1.1
    const rad = er * (0.9 + rand() * 0.07)
    const lx = ecx + Math.sin(theta) * rad
    const ly = ecy - Math.cos(theta) * rad
    const sz = rand() * 120 + 50
    ctx.fillStyle = `rgba(30,58,78,${0.35 + rand() * 0.25})`
    ctx.beginPath()
    ctx.ellipse(lx, ly + (rand() - 0.5) * 20, sz, sz * (0.35 + rand() * 0.3), rand() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalAlpha = 0.85
  for (let i = 0; i < 60; i++) {
    const theta = (rand() - 0.5) * 1.1
    const rad = er * (0.9 + rand() * 0.08)
    const lx = ecx + Math.sin(theta) * rad
    const ly = ecy - Math.cos(theta) * rad
    const sz = rand() * 90 + 25
    const ca = 0.18 + rand() * 0.45
    const cloud = ctx.createRadialGradient(lx, ly, 0, lx, ly, sz)
    cloud.addColorStop(0, `rgba(240,250,255,${ca.toFixed(3)})`)
    cloud.addColorStop(1, 'rgba(240,250,255,0)')
    ctx.fillStyle = cloud
    ctx.beginPath()
    ctx.ellipse(lx, ly, sz, sz * 0.45, rand() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  ctx.restore()

  ctx.globalCompositeOperation = 'lighter'
  const outerLimb = ctx.createRadialGradient(ecx, ecy, er * 0.985, ecx, ecy, er * 1.14)
  outerLimb.addColorStop(0, 'rgba(0,0,0,0)')
  outerLimb.addColorStop(0.35, 'rgba(170, 225, 255, 0.9)')
  outerLimb.addColorStop(0.7, 'rgba(90, 170, 240, 0.35)')
  outerLimb.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = outerLimb
  ctx.beginPath()
  ctx.arc(ecx, ecy, er * 1.14, 0, Math.PI * 2)
  ctx.fill()

  ctx.save()
  ctx.beginPath()
  ctx.arc(ecx, ecy, er, 0, Math.PI * 2)
  ctx.clip()
  const rim = ctx.createRadialGradient(ecx, ecy, er * 0.9, ecx, ecy, er)
  rim.addColorStop(0, 'rgba(0,0,0,0)')
  rim.addColorStop(0.8, 'rgba(180, 220, 255, 0.22)')
  rim.addColorStop(1, 'rgba(220, 240, 255, 0.55)')
  ctx.fillStyle = rim
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
  ctx.globalCompositeOperation = 'source-over'

  const moonX = variant === 1 ? w * 0.82 : variant === 0 ? w * 0.18 : w * 0.92
  const moonY = h * (0.24 + variant * 0.02)
  const moonR = 14 + variant * 2
  const moon = ctx.createRadialGradient(moonX - 4, moonY - 4, 0, moonX, moonY, moonR)
  moon.addColorStop(0, 'rgba(238,238,245,0.95)')
  moon.addColorStop(0.7, 'rgba(188,188,210,0.85)')
  moon.addColorStop(1, 'rgba(90,90,130,0)')
  ctx.fillStyle = moon
  ctx.beginPath()
  ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2)
  ctx.fill()

  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.wrapS = THREE.ClampToEdgeWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  tex.needsUpdate = true
  return tex
}

function mulberry32(seed: number) {
  let a = seed >>> 0
  return function () {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
