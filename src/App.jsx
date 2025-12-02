import React, { useEffect, useRef } from 'react'
import '@fortawesome/fontawesome-free/css/all.min.css'
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
            <a href="https://github.com" title="GitHub" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-github"></i>
            </a>
            <a href="https://linkedin.com" title="LinkedIn" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-linkedin"></i>
            </a>
          </div>
          <div className="about-content">
            <p>
              I'm a passionate DevOps Engineer and cybersecurity enthusiast currently pursuing a Master's degree in Cybersecurity at KTH Royal Institute of Technology. With a strong background in full-stack development and research, I focus on building secure, scalable infrastructure and innovative solutions that bridge the gap between security and technology. When I'm not coding or researching, you'll find me exploring new technologies and contributing to open-source projects.
            </p>
          </div>
        </section>

        

        <section className="timeline">
          <div className="timeline-container">
            <h2 className="timeline-title">Timeline</h2>
            
            <div className="timeline-items">
              {/* Item 1 */}
              <div className="timeline-item left">
                <div className="timeline-content">
                  <h3>Research Assistant</h3>
                  <p className="company">LangSec Group @ KTH</p>
                  <p className="date">September 2024</p>
                  <p className="description">
                    I worked as a research assistant at the LangSec group at KTH, where I investigated the impact and prevalence of client-side prototype pollution in various websites. As part of this work, I developed a <a href="#" className="content-link">Chromium fork</a> to detect prototype pollution gadgets when a vulnerable website is visited.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="timeline-item right">
                <div className="timeline-content">
                  <h3>IST Delegate Election</h3>
                  <p className="company">Election app for Técnico's Pedagogical Council</p>
                  <p className="date">October 2023</p>
                  <p className="description">
                    Since I was member of the Pedagogical Council in my last year at Técnico, I volunteered to re-build the delegate (student representative) <a href="#" className="content-link">election platform</a> using more modern technologies. It was built using Rust and React, which should result in a longer life span and need fewer maintenance.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="timeline-item left">
                <div className="timeline-content">
                  <h3>KTH</h3>
                  <p className="company">MSc Cybersecurity</p>
                  <p className="date">August 2023</p>
                  <p className="description">
                    I started a Cybersecurity Master programme at <a href="#" className="content-link">KTH Royal Institute of Technology</a> in Sweden.
                  </p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="timeline-item right">
                <div className="timeline-content">
                  <h3>Friqu</h3>
                  <p className="company">A Rust and Yew.rs (Web Assembly) app</p>
                  <p className="date">April 2022</p>
                  <p className="description">
                    This was my first Web Assembly application, made with Yew.rs for the frontend and Axum for the backend. Friqu is a web app to help with grocery shopping and meal planning.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
