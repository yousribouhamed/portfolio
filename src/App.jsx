import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import heroShape from './assets/hero.png'

gsap.registerPlugin(ScrollTrigger)

const services = [
  {
    title: 'Websites & landing pages',
    text: 'Creating high-end and beautiful websites built to perform and convert.',
    media: ['Guide', 'Grid', 'Morable', 'Shop', 'Loot'],
  },
  {
    title: 'Visual branding',
    text: 'Distinctive art direction, color systems, and image treatments built to carry a brand across product and web.',
    media: ['Marks', 'Color', 'Poster', 'Type', 'Launch'],
  },
  {
    title: 'Product design enhancement',
    text: 'Sharper interfaces for complex products, with hierarchy, interaction states, and polish that make the product easier to read.',
    media: ['Audit', 'Flow', 'Dash', 'Mobile', 'Prototype'],
  },
  {
    title: 'Webflow & React builds',
    text: 'Responsive implementation with creative micro-interactions, smooth scrolling, reusable components, and hand-off ready structure.',
    media: ['React', 'GSAP', 'Lenis', 'CMS', 'Handoff'],
  },
]

const workItems = [
  'Brand system for a fintech product',
  'Animated launch page for a SaaS studio',
  'Portfolio refresh for a creative director',
]

const clientColumns = [
  [
    { label: 'animoca BRANDS', variant: 'animoca' },
    { label: 'THE SANDBOX', variant: 'sandbox' },
    { label: 'MONAD', variant: 'monad' },
  ],
  [
    { label: 'Immutable', variant: 'immutable' },
    { label: 'Seedify', variant: 'seedify' },
    { label: 'abstract', variant: 'abstract' },
  ],
]

function ServiceTitle({ title }) {
  if (title === 'Websites & landing pages') {
    return (
      <>
        Websites <span className="nineties-font">&amp;Landing Pages</span>
      </>
    )
  }

  if (title === 'Visual branding') {
    return (
      <>
        Visual <span className="nineties-font">Branding</span>
      </>
    )
  }

  if (title === 'Product design enhancement') {
    return (
      <>
        Product design <span className="nineties-font">Enhancement</span>
      </>
    )
  }

  return title
}

function ArrowIcon({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  )
}

function ServiceShowcase({ service, index }) {
  return (
    <article className="service-showcase">
      <div className="service-copy">
        <h3>
          <ServiceTitle title={service.title} />
        </h3>
        <p>{service.text}</p>
      </div>
      <div className="service-media-track" aria-hidden="true">
        {service.media.map((label, mediaIndex) => (
          <div className="service-media" key={label}>
            <div className={`media-visual media-visual-${index}-${mediaIndex % 5}`}>
              <img src={heroShape} alt="" />
            </div>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </article>
  )
}

function ClientCard({ client }) {
  const words = client.label.split(' ')

  return (
    <article className="client-card">
      <div className={`client-logo client-logo-${client.variant}`}>
        <span className="client-mark" aria-hidden="true" />
        <span>
          {client.variant === 'animoca' ? (
            <>
              <strong>{words[0]}</strong>
              <em>{words.slice(1).join(' ')}</em>
            </>
          ) : (
            client.label
          )}
        </span>
      </div>
    </article>
  )
}

function App() {
  const appRef = useRef(null)
  const scrollTextRef = useRef(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cleanupAnimations = () => {}
    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      const lenis = new Lenis({
        lerp: 0.08,
        smoothWheel: true,
        wheelMultiplier: 0.86,
      })

      const updateScroll = (time) => lenis.raf(time * 1000)
      gsap.ticker.add(updateScroll)
      gsap.ticker.lagSmoothing(0)

      const storyUnits = gsap.utils.toArray('.story-unit')

      if (!reduceMotion) {
        const intro = gsap.timeline({ defaults: { ease: 'power4.out' } })
        intro
          .to('.loader-line', { scaleX: 1, duration: 0.85 })
          .to('.loader-word', { yPercent: -110, duration: 0.75 }, '-=0.15')
          .to('.loader', { yPercent: -100, duration: 1.05 }, '-=0.38')
          .from('.site-nav', { y: -24, opacity: 0, duration: 0.75 }, '-=0.48')

        gsap.from(storyUnits, {
          opacity: 0.08,
          y: 18,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.scroll-story',
            start: 'top 82%',
            end: 'top 8%',
            scrub: true,
          },
        })

        gsap.utils.toArray('[data-speed]').forEach((shape) => {
          gsap.to(shape, {
            yPercent: Number(shape.dataset.speed) * -12,
            rotate: Number(shape.dataset.speed) * 4,
            ease: 'none',
            scrollTrigger: {
              trigger: '.scroll-story',
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          })
        })

        gsap.utils.toArray('.service-showcase').forEach((row) => {
          const media = gsap.utils.toArray(row.querySelectorAll('.service-media'))
          const serviceReveal = gsap.timeline({ paused: true })

          serviceReveal.fromTo(
            row.querySelector('.service-copy'),
            {
              y: 52,
              opacity: 0,
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.75,
              ease: 'power3.out',
            },
            0,
          )

          const revealGroups = [
            [media[0], media[4]].filter(Boolean),
            [media[1], media[3]].filter(Boolean),
            [media[2]].filter(Boolean),
          ]

          revealGroups.forEach((group, groupIndex) => {
            serviceReveal.fromTo(
              group,
              {
                y: 220,
                rotateX: 76,
                scale: 0.94,
                opacity: 0,
                transformOrigin: '50% 100%',
                transformPerspective: 1200,
              },
              {
                y: 0,
                rotateX: 0,
                scale: 1,
                opacity: 1,
                duration: 1.18,
                ease: 'expo.out',
                force3D: true,
              },
              0.18 + groupIndex * 0.13,
            )

            serviceReveal.fromTo(
              group.map((item) => item.querySelector('.media-visual')),
              {
                y: 58,
                scale: 1.1,
              },
              {
                y: 0,
                scale: 1,
                duration: 1.24,
                ease: 'expo.out',
                force3D: true,
              },
              0.18 + groupIndex * 0.13,
            )
          })

          ScrollTrigger.create({
            trigger: row,
            start: 'top 70%',
            end: 'bottom 18%',
            onEnter: () => serviceReveal.restart(true),
            onEnterBack: () => serviceReveal.restart(true),
            onLeave: () => serviceReveal.pause(0),
            onLeaveBack: () => serviceReveal.pause(0),
          })
        })

        gsap.from('.clients-copy > *, .clients-intro', {
          y: 34,
          opacity: 0,
          duration: 0.85,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.clients-section',
            start: 'top 68%',
          },
        })

        gsap.from('.client-card', {
          y: 92,
          opacity: 0,
          rotateX: 18,
          duration: 1,
          stagger: 0.08,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.clients-section',
            start: 'top 58%',
          },
        })

        gsap.to('.clients-orbit', {
          yPercent: -12,
          ease: 'none',
          scrollTrigger: {
            trigger: '.clients-section',
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })

        gsap.from('.work-line', {
          scaleX: 0,
          transformOrigin: 'left center',
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.selected-work',
            start: 'top 72%',
          },
        })
      } else {
        gsap.set('.loader', { display: 'none' })
      }

      ScrollTrigger.refresh()

      cleanupAnimations = () => {
        gsap.ticker.remove(updateScroll)
        lenis.destroy()
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
      }
    }, appRef)

    return () => {
      cleanupAnimations()
      ctx.revert()
    }
  }, [])

  const copyEmail = async () => {
    await navigator.clipboard.writeText('hello@yourstudio.com')
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }

  return (
    <main ref={appRef} className="portfolio-site">
      <div className="loader" aria-hidden="true">
        <div className="loader-name">
          <img src="/mogi-logo.svg" alt="" />
        </div>
        <div className="loader-line" />
      </div>

      <nav className="site-nav" aria-label="Primary navigation">
        <a className="name-lockup" href="#top">
          <img src="/mogi-logo.svg" alt="Mogi" />
        </a>

        <div className="nav-pill">
          <a href="#services">Services</a>
          <a className="nav-mark" href="#top" aria-label="Home">
            <img src="/mogi-logo.svg" alt="" />
          </a>
          <a href="#work">Work</a>
        </div>

        <div className="social-links">
          <button type="button" onClick={copyEmail}>
            {copied ? 'Copied' : 'Email'}
          </button>
          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
            in
          </a>
          <a href="https://x.com/" target="_blank" rel="noreferrer">
            x
          </a>
          <a href="https://www.behance.net/" target="_blank" rel="noreferrer">
            Be
          </a>
        </div>
      </nav>

      <section id="top" className="hero" data-nav="peach">
        <div className="hero-backdrop" aria-hidden="true" />
        <div className="hero-vignette" aria-hidden="true" />
        <div className="hero-copy">
          <h1>Brand & digital design specialist</h1>
        </div>
        <div className="hero-wordmark hero-wordmark-logo" aria-hidden="true">
          <img src="/mogi-logo.svg" alt="" />
        </div>
        <p className="hero-role">Freelance Design Director</p>
      </section>

      <section className="scroll-story" aria-labelledby="scroll-story-title">
        <h2
          id="scroll-story-title"
          ref={scrollTextRef}
          aria-label="16 years making users click and scroll my designs"
        >
          <span className="story-line story-line-years">
            <span className="story-unit">16 years</span>
          </span>
          <span className="story-line story-line-users">
            <span className="story-unit">making users</span>
          </span>
          <span className="story-line story-line-action">
            <span className="story-unit story-pill">click</span>
            <span className="story-unit story-and">and</span>
            <span className="story-unit story-scroll">scroll</span>
          </span>
          <span className="story-line story-line-designs">
            <span className="story-unit">my designs</span>
          </span>
        </h2>
        <div className="shape-field" aria-hidden="true">
          <div className="shape shape-circle" data-speed="5" />
          <div className="shape shape-pill" data-speed="7" />
          <div className="shape shape-hex" data-speed="4" />
          <div className="shape shape-coin" data-speed="9" />
          <div className="shape shape-blue" data-speed="6" />
          <div className="scroll-lines" data-speed="8" />
        </div>
      </section>

      <section id="services" className="services-section">
        <div className="section-heading">
          <p>Design expert</p>
          <h2>I help companies succeed on projects like:</h2>
        </div>
        <div className="services-list">
          {services.map((service, index) => (
            <ServiceShowcase key={service.title} service={service} index={index} />
          ))}
        </div>
      </section>

      <section id="clients" className="clients-section" aria-labelledby="clients-title">
        <div className="clients-orbit" aria-hidden="true" />
        <div className="clients-stars" aria-hidden="true" />
        <div className="clients-shell">
          <div className="clients-copy">
            <p className="clients-kicker">Clients</p>
            <h2 id="clients-title">
              Trusted by{' '}
              <span className="nineties-font clients-title-break">
                <span>Leading Innovators</span>
                <span>in Web3</span>
              </span>
            </h2>
            <a className="clients-cta" href="#top">
              <span>Get Started</span>
              <span className="clients-cta-icon">
                <ArrowIcon size={18} />
              </span>
            </a>
          </div>

          <div className="clients-right">
            <p className="clients-intro">
              We partner with forward-thinking startups, protocols, marketplaces, and metaverse
              brands shaping the future of the internet. Whether you&apos;re launching your first
              project or scaling globally, our clients rely on us to turn attention into adoption.
            </p>
            <div className="clients-card-grid" aria-label="Client logos">
              {clientColumns.map((column, columnIndex) => (
                <div className="client-column" key={columnIndex}>
                  {column.map((client) => (
                    <ClientCard key={client.variant} client={client} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="work" className="selected-work">
        <div className="work-line" aria-hidden="true" />
        <h2>Selected work for brands that need a sharper digital presence.</h2>
        <div className="work-list">
          {workItems.map((item, index) => (
            <a href="#top" key={item}>
              <span>{`0${index + 1}`}</span>
              <strong>{item}</strong>
              <ArrowIcon />
            </a>
          ))}
        </div>
      </section>

      <footer className="site-footer">
        <button type="button" onClick={copyEmail}>
          <MailIcon />
          {copied ? 'Email copied' : 'Start a project'}
        </button>
        <p>Built with React, GSAP, Lenis, SplitType, and responsive CSS.</p>
      </footer>
    </main>
  )
}

export default App
