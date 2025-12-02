import React, { useEffect, useRef } from 'react'
import './App.css'

function App() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let width = 0
    let height = 0
    let rafId = null
    let dpr = window.devicePixelRatio || 1
    let mouse = { x: null, y: null }

    function resize() {
      dpr = window.devicePixelRatio || 1
      width = window.innerWidth
      height = window.innerHeight
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    let resizeTimer
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(resize, 120)
    })

    // performant particle settings (low density + capped connections)
    const area = Math.max(1, width * height)
    const PARTICLE_COUNT = Math.max(30, Math.min(120, Math.round(area / 250000)))
    const particles = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.2 + 0.6,
      })
    }

    const maxDist = 110
    const maxDist2 = maxDist * maxDist

    function frame() {
      ctx.clearRect(0, 0, width, height)

      // draw particles (simple fill, no heavy shadow)
      for (let p of particles) {
        p.x += p.vx
        p.y += p.vy

        // simple mouse attraction (light)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const d2 = dx * dx + dy * dy
          if (d2 < 180 * 180) {
            p.vx += (dx / 180) * 0.001
            p.vy += (dy / 180) * 0.001
          }
        }

        if (p.x < -10) p.x = width + 10
        if (p.x > width + 10) p.x = -10
        if (p.y < -10) p.y = height + 10
        if (p.y > height + 10) p.y = -10

        ctx.beginPath()
        ctx.fillStyle = 'rgba(200,200,220,0.95)'
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
      }

      // draw connections but cap per-particle checks for performance
      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        let conn = 0
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const d2 = dx * dx + dy * dy
          if (d2 < maxDist2) {
            const alpha = 0.12 * (1 - d2 / maxDist2)
            ctx.beginPath()
            ctx.strokeStyle = `rgba(160,160,200,${alpha})`
            ctx.lineWidth = 1
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
            conn++
            if (conn >= 3) break // limit connections per particle
          }
        }
      }

      rafId = requestAnimationFrame(frame)
    }

    // mouse handlers (throttled via requestAnimationFrame)
    let scheduled = false
    function onMove(e) {
      if (scheduled) {
        mouse.x = e.clientX
        mouse.y = e.clientY
        return
      }
      scheduled = true
      mouse.x = e.clientX
      mouse.y = e.clientY
      requestAnimationFrame(() => {
        scheduled = false
      })
    }
    function onLeave() {
      mouse.x = null
      mouse.y = null
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseout', onLeave)

    frame()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseout', onLeave)
    }
  }, [])

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <h1 className="logo">Francisco Costa</h1>
          <nav className="nav">
            <a href="#home">HOME</a>
            <a href="#blog">BLOG</a>
            <a href="#impossible">IMPOSSIBLE LIST</a>
            <a href="#cv">CV</a>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <div className="background-animation">
          <canvas ref={canvasRef} className="bg-canvas" />
        </div>

        <section className="hero">
          <div className="profile-container">
            <img src="/francisco-picture.jpg" alt="Francisco Costa" className="profile-image" />
            <h2 className="name">Francisco Costa</h2>
            <p className="tagline">DevOps Engineer</p>
          </div>
          <div className="social-links">
            <a href="#" title="GitHub">
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v 3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
            </a>
            <a href="#" title="Mastodon">
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path d="M8 12c0-1.657 1.343-3 3-3s3 1.343 3 3v1h-6v-1z" fill="#000" opacity="0.6" />
              </svg>
            </a>
            <a href="#" title="Discord">
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.545 2.907a13.227 13.227 0 00-3.573-1.04c-.522.224-.872.735-.872 1.459v.294c.61-.053 1.203-.009 1.816.066.402.045.824.084 1.289.1a6.6 6.6 0 01.996.057l-.494 2.475m9.025 1.993c.857.214 1.327.617 1.605 1.228a17.93 17.93 0 01-2.457-.147c-.557-.045-1.096-.135-1.496-.285l.735-3.066a13.04 13.04 0 012.613 2.27zM6.3 5.755a9.966 9.966 0 00-1.071-.175c-.307-.032-.614-.054-.921-.066.494-2.475.729-3.374.729-3.374 1.156.264 2.296.648 3.434 1.194-.42.88-.774 1.39-.774 1.39-.389.116-.748.23-1.397.231zM2.034 15.964a13.88 13.88 0 01-1.44-6.564c0-.22 0-.44.015-.66A9.967 9.967 0 013.897 9.09c.622 1.124 1.36 2.151 2.205 3.06-.256 1.75.531 3.21 2.769 4.369.076.04.15.08.226.12-.592.649-1.123 1.012-1.458 1.26-.908.642-1.4.788-1.605.788z"/>
              </svg>
            </a>
            <a href="#" title="Medium">
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42c1.87 0 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.59 0-1.1-2.58-1.1-5.75s.51-5.75 1.1-5.75c.66 0 1.19 2.58 1.19 5.75z"/>
              </svg>
            </a>
            <a href="#" title="AnyType">
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10"/>
              </svg>
            </a>
            <a href="#" title="Steam">
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.979 0C5.678 0 0.5 5.175.5 11.448c0 4.41 2.583 8.215 6.344 10.048.471.22.622-.204.622-.456 0-.226-.01-.977-.015-1.916-2.58.56-3.131-1.24-3.131-1.24-.429-1.09-1.047-1.38-1.047-1.38-.856-.585.065-.573.065-.573.947.066 1.445.972 1.445.972.843 1.441 2.21 1.024 2.75.8.086-.622.33-1.025.6-1.261-2.1-.238-4.31-1.05-4.31-4.67 0-1.033.37-1.878 .976-2.542-.098-.238-.423-1.203.093-2.508 0 0 .796-.255 2.609.755.757-.21 1.568-.314 2.375-.318.805.004 1.616.108 2.374.318 1.81-1.01 2.606-.755 2.606-.755.517 1.305.192 2.27.095 2.508.607.664.976 1.509.976 2.542 0 3.628-2.213 4.429-4.32 4.66.34.293.641.87.641 1.752 0 1.264-.011 2.283-.011 2.593 0 .253.148.679.628.454 3.757-1.836 6.336-5.64 6.336-10.045C23.5 5.175 18.322 0 11.979 0z"/>
              </svg>
            </a>
            <a href="#" title="Instagram">
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.117.6c-.794.272-1.473.646-2.154 1.327-.682.682-1.055 1.361-1.327 2.154-.266.788-.468 1.657-.527 2.935C.04 8.333.024 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.527 2.935.272.794.646 1.473 1.328 2.154.682.683 1.36 1.056 2.153 1.328.787.266 1.657.467 2.934.527 1.28.058 1.687.072 4.947.072s3.667-.015 4.947-.072c1.277-.06 2.148-.261 2.934-.527.794-.272 1.473-.645 2.154-1.327.683-.682 1.056-1.361 1.328-2.154.266-.787.467-1.657.527-2.935.058-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.261-2.148-.527-2.935-.272-.793-.645-1.473-1.328-2.154-.682-.682-1.361-1.055-2.154-1.327-.788-.266-1.657-.468-2.935-.527-1.28-.058-1.687-.072-4.947-.072zM12 2.163c3.259 0 3.667.01 4.947.072 1.195.055 1.843.249 2.175.414.546.213.936.479 1.345.888.409.41.675.799.888 1.345.165.332.36.98.413 2.175.061 1.28.073 1.689.073 4.948 0 3.259-.012 3.668-.073 4.948-.056 1.195-.248 1.843-.413 2.175-.213.546-.479.936-.888 1.345-.41.409-.799.675-1.345.888-.332.165-.98.36-2.175.413-1.28.061-1.689.073-4.948.073-3.259 0-3.668-.012-4.948-.073-1.195-.056-1.843-.248-2.175-.413-.546-.213-.936-.479-1.345-.888-.409-.41-.675-.799-.888-1.345-.165-.332-.36-.98-.413-2.175-.061-1.28-.073-1.689-.073-4.948 0-3.259.012-3.668.073-4.948.056-1.195.248-1.843.413-2.175.213-.546.479-.936.888-1.345.41-.409.799-.675 1.345-.888.332-.165.98-.36 2.175-.413 1.28-.061 1.689-.073 4.948-.073z"/>
                <path d="M5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 100-8 4 4 0 000 8zm4.965-10.322a1.44 1.44 0 11-2.881.001 1.44 1.44 0 012.881-.001z"/>
              </svg>
            </a>
            <a href="#" title="Gmail">
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
            </a>
            <a href="#" title="Security Key">
              <svg className="icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5s-5 2.24-5 5v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </a>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
