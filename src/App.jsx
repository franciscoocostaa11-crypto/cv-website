import React, { useEffect, useRef, useState } from 'react'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './App.css'

function App() {
  const canvasRef = useRef(null)
  const heroRef = useRef(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

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

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerWidth > 768 && heroRef.current) {
        const scrollY = window.scrollY
        
        // Get the timeline end content and footer elements
        const endContent = document.querySelector('.timeline-end-content')
        const footer = document.querySelector('.footer')
        
        if (endContent) {
          const endContentRect = endContent.getBoundingClientRect()
          
          // Check if end content is visible in viewport
          const isEndContentVisible = endContentRect.top < window.innerHeight
          
          if (isEndContentVisible) {
            // Stop moving - keep current transform
            return
          }
        }
        
        // Calculate max translateY to prevent overlap with footer
        if (footer) {
          const heroHeight = heroRef.current.offsetHeight
          const footerTop = footer.offsetTop
          const maxTranslateY = footerTop - heroHeight - 150 // 150px buffer
          
          // Move down with scroll but limit to prevent footer overlap
          const translateY = Math.min(scrollY, maxTranslateY)
          
          heroRef.current.style.transform = `translateY(${translateY}px)`
          heroRef.current.style.willChange = 'transform'
        } else {
          // Fallback if footer not found
          const translateY = scrollY
          heroRef.current.style.transform = `translateY(${translateY}px)`
          heroRef.current.style.willChange = 'transform'
        }
      }
    }

    handleScroll() // Call once on mount
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="app-container">
      <button className="hamburger-menu" onClick={() => setIsDrawerOpen(true)} aria-label="Open menu">
        <i className="fas fa-bars"></i>
      </button>

      <div className={`drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-overlay" onClick={() => setIsDrawerOpen(false)}></div>
        <div className="drawer-content">
          <button className="drawer-close" onClick={() => setIsDrawerOpen(false)} aria-label="Close menu">
            <i className="fas fa-times"></i>
          </button>
          <nav className="drawer-nav">
            <a href="#home" onClick={() => setIsDrawerOpen(false)}>HOME</a>
            <a href="#blog" onClick={() => setIsDrawerOpen(false)}>BLOG</a>
            <a href="#impossible" onClick={() => setIsDrawerOpen(false)}>IMPOSSIBLE LIST</a>
            <a href="#cv" onClick={() => setIsDrawerOpen(false)}>CV</a>
          </nav>
        </div>
      </div>

      <div className="background-animation">
        <canvas ref={canvasRef} className="bg-canvas" />
      </div>

      <main className="main-content">
        <section className="hero" ref={heroRef}>
          <div className="profile-container">
            <img src="/francisco-picture.jpg" alt="Francisco Costa" className="profile-image" />
            <h2 className="name">Francisco Costa</h2>
            <p className="tagline">DevOps Engineer</p>
          </div>
          <div className="social-links">
            <a href="https://github.com/franciscoocostaa11-crypto" title="GitHub" target="_blank" rel="noopener noreferrer">
              <i className="fab fa-github"></i>
            </a>
            <a href="https://www.linkedin.com/in/franciscoocosta/" title="LinkedIn" target="_blank" rel="noopener noreferrer">
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
            <h2 className="timeline-title">Work Experience Timeline</h2>
            
            <div className="timeline-items">
              {/* Item 1 */}
              <div className="timeline-item left">
                <div className="timeline-content">
                  <h3>Research Assistant</h3>
                  <p className="company">LangSec Group @ KTH</p>
                  <p className="date">September 2024</p>
                  <ul className="description-list">
                    <li>Designed and executed comprehensive load testing scenarios</li>
                    <li>Analyzed system performance under various load conditions</li>
                    <li>Identified bottlenecks and provided optimization recommendations</li>
                  </ul>
                </div>
              </div>

              {/* Item 2 */}
              <div className="timeline-item right">
                <div className="timeline-content">
                  <h3>IST Delegate Election Customer Service in SAP Environment as DevOps Engineer</h3>
                  <p className="company">Election app for Técnico's Pedagogical Council</p>
                  <p className="date">October 2023</p>
                  <ul className="description-list">
                    <li>Provided customer support for SAP environments.</li>
                    <li>Performed troubleshooting on deployment issues.</li>
                    <li>Used Kubernetes, monitoring tools, metrics analysis, and downtime investigation.</li>
                    <li>Conducted root cause analysis (RCA) to identify and resolve production incidents.</li>
                  </ul>
                </div>
              </div>

              {/* Item 3 */}
              <div className="timeline-item left">
                <div className="timeline-content">
                  <h3>Migration of On-Premise Applications to Cloud</h3>
                  <p className="company">MSc Cybersecurity</p>
                  <p className="date">August 2023</p>
                  <ul className="description-list">
                    <li>Modernized legacy applications and containerized them using Docker.</li>
                    <li>Performed deployments using GitLab Actions.</li>
                    <li>Integrated and provisioned infrastructures on Azure and Google Cloud Platform (GCP).</li>
                    <li>Ensured portability, performance, and scalability in the new cloud environments.</li>
                  </ul>
                </div>
              </div>

              {/* Item 4 */}
              <div className="timeline-item right">
                <div className="timeline-content">
                  <h3>DevOps Solution for a Microservices Platform</h3>
                  <p className="company">A Rust and Yew.rs (Web Assembly) app</p>
                  <p className="date">April 2022</p>
                  <ul className="description-list">
                    <li>Developed CI/CD pipelines in GitLab for microservices and UI components.</li>
                    <li>Automated deployments in VMware environments.</li>
                    <li>Used Docker and Kubernetes for containerization and orchestration.</li>
                    <li>Built a scalable and resilient application platform.</li>
                  </ul>
                </div>
              </div>

              {/* Item 5 */}
              <div className="timeline-item left">
                <div className="timeline-content">
                  <h3>Replatforming in the Banking Sector</h3>
                  <p className="company">Personal Projects</p>
                  <p className="date">2021</p>
                  <ul className="description-list">
                    <li>Modernized and automated legacy processes.</li>
                    <li>Used GitHub Actions, Jenkins, and Ansible for CI/CD.</li>
                    <li>Performed deployments in VMware environments.</li>
                    <li>Integrated multiple tools to improve delivery time and reliability.</li>
                  </ul>
                </div>
              </div>

              {/* Item 6 */}
              <div className="timeline-item right">
                <div className="timeline-content">
                  <h3>Load Testing with JMeter</h3>
                  <p className="work sector">Energy</p>
                  <p className="date">2019</p>
                  <ul className="description-list">
                    <li>Conducted load tests using Apache JMeter.</li>
                    <li>Assessed the performance of critical systems in the energy sector.</li>
                    <li>Generated reports and identified bottlenecks to optimize system performance.</li>
                  </ul>
                </div>
              </div>

              {/* Ending Icon */}
              <div className="timeline-start-icon">
                <img src="/accenture-logo.png" alt="Accenture-logo" />
              </div>
              
              <div className="timeline-end-content">
                <h3>Accenture Technology</h3>
              
              </div>
            </div>
          </div>
        </section>

      </main>

      <section className="projects">
        <div className="projects-container">
          <h2 className="projects-title">Academic & Athletic Background</h2>
          <div className="projects-grid">
            {/* Project 1 */}
            <div className="project-card project-blue">
              <div className="project-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h3>ISEP</h3>
              <p className="project-description">
                Bachelor's degree in Systems Engineering from ISEP, where I developed strong foundations in software development, systems architecture, and problem-solving within technical environments.
              </p>
            </div>

            {/* Project 2 */}
            <div className="project-card project-red">
              <div className="project-icon">
                <i className="fas fa-person-running"></i>
              </div>
              <h3>Football Player</h3>
              <p className="project-description">
                Played football for 15 years, progressing through competitive levels and ultimately reaching the professional tier. This experience strengthened my discipline, teamwork, and resilience.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Francisco Costa. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
