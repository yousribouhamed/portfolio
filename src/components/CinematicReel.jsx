import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const defaultItems = [
  {
    title: 'SPP Dream Generator',
    subtitle: 'AI Image and Video Generator',
    image: '/detroit-assets/alice.webp',
    href: '#',
  },
  {
    title: 'Sunset Drift',
    subtitle: 'Interactive Spatial Experience',
    image: '/detroit-assets/island.webp',
    href: '#',
  },
  {
    title: 'Helios Motion',
    subtitle: 'Motion Design Showcase',
    image: '/detroit-assets/courts.webp',
    href: '#',
  },
  {
    title: 'Mira Stories',
    subtitle: 'Experimental Visual Storytelling',
    image: '/detroit-assets/fair.webp',
    href: '#',
  },
  {
    title: 'Echo Atlas',
    subtitle: 'Generative World Building',
    image: '/detroit-assets/summer.webp',
    href: '#',
  },
  {
    title: 'Northbound',
    subtitle: 'Editorial Brand System',
    image: '/detroit-assets/church.webp',
    href: '#',
  },
]

// Geometry — frames live on the circumference of a circle. The whole ring is
// tilted forward so we see the back arc curving across the upper screen, and
// it rotates around its central axis as the user scrolls.
const RING_TILT = 62          // deg — how much the ring is laid back
const MIN_FRAMES_FOR_ANGLE = 8 // ensures the ring isn't crowded with few items

function shortestSignedDelta(rawOffset, total) {
  // Returns offset in (-total/2, total/2] — used for opacity/blur falloff so
  // a frame approaching from behind also fades in nicely.
  const half = total / 2
  let d = rawOffset
  while (d > half) d -= total
  while (d <= -half) d += total
  return d
}

export default function CinematicReel({ items = defaultItems }) {
  const sectionRef = useRef(null)
  const ringRef = useRef(null)
  const frameRefs = useRef([])
  const activeRef = useRef(0)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const N = items.length
    const STEP_ANGLE = 360 / Math.max(N, MIN_FRAMES_FOR_ANGLE)

    const ctx = gsap.context(() => {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // Place every frame at its fixed angular position around the ring.
      // - rotateZ(theta): position around the ring
      // - translateY(calc(...)): push outward to the ring radius
      // - rotateX(-RING_TILT): counter the parent's tilt so the active frame
      //   (currently at the back of the ring) faces the camera squarely.
      const placeFrames = () => {
        frameRefs.current.forEach((el, i) => {
          if (!el) return
          const theta = i * STEP_ANGLE
          el.style.transform =
            `rotateZ(${theta}deg) ` +
            `translateY(calc(var(--ring-radius) * -1)) ` +
            `rotateX(${-RING_TILT}deg)`
        })
      }

      const layout = (cam) => {
        const ringEl = ringRef.current
        if (ringEl) {
          const camAngle = cam * STEP_ANGLE
          // Ring's outer transform: tilt + rotate-around-its-axis.
          // CSS applies transforms left-to-right, so tilt is established first
          // and then the spin happens within the tilted frame — which means
          // scrolling rotates the disc around its own (now-tilted) central
          // axis, exactly like a film reel turning.
          ringEl.style.transform =
            `translate(-50%, -50%) ` +
            `rotateX(${RING_TILT}deg) ` +
            `rotateZ(${-camAngle}deg)`
        }

        // Per-frame visual emphasis based on angular distance from active.
        frameRefs.current.forEach((el, i) => {
          if (!el) return
          const offset = shortestSignedDelta(i - cam, N)
          const abs = Math.abs(offset)
          const opacity = Math.max(0.18, 1 - abs * 0.28)
          const blur = Math.min(5, abs * 1.4)
          el.style.opacity = String(opacity)
          el.style.filter = `blur(${blur}px) brightness(${1 - abs * 0.06})`
          el.dataset.dist = abs.toFixed(2)
        })
      }

      placeFrames()
      layout(0)

      if (reduceMotion) return

      const st = ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: () => `+=${(N - 1) * window.innerHeight * 1.1}`,
        pin: true,
        scrub: 0.55,
        invalidateOnRefresh: true,
        onRefresh: () => placeFrames(),
        onUpdate: (self) => {
          const cam = self.progress * (N - 1)
          layout(cam)
          const idx = Math.min(N - 1, Math.max(0, Math.round(cam)))
          if (idx !== activeRef.current) {
            activeRef.current = idx
            setActive(idx)
          }
        },
      })

      return () => st.kill()
    }, sectionRef)

    return () => ctx.revert()
  }, [items.length])

  const item = items[active]

  return (
    <section ref={sectionRef} className="cinematic-reel" aria-label="Selected projects reel">
      <div className="reel-vignette" aria-hidden="true" />
      <div className="reel-glow" aria-hidden="true" />

      <div className="reel-stage">
        <header className="reel-headline" aria-live="polite">
          <span key={`title-${active}`} className="reel-title reel-flip">
            {item.title}
          </span>
          <span key={`sub-${active}`} className="reel-subtitle reel-flip reel-flip--delay">
            <span>{item.subtitle}</span>
            {item.href && (
              <>
                <span className="reel-dot" aria-hidden="true" />
                <a className="reel-cta" href={item.href}>
                  View project <span aria-hidden="true">→</span>
                </a>
              </>
            )}
          </span>
        </header>

        <div ref={ringRef} className="reel-ring">
          {items.map((it, i) => (
            <div
              ref={(el) => {
                frameRefs.current[i] = el
              }}
              key={it.title}
              className="reel-frame"
              data-active={i === active ? 'true' : 'false'}
            >
              <span className="reel-perfs reel-perfs--top" aria-hidden="true" />
              <div className="reel-frame-inner">
                <img src={it.image} alt="" loading="lazy" draggable="false" />
                <span className="reel-frame-meta">
                  <span className="reel-frame-index">{String(i + 1).padStart(2, '0')}</span>
                  <span className="reel-frame-label">{it.title}</span>
                </span>
              </div>
              <span className="reel-perfs reel-perfs--bottom" aria-hidden="true" />
            </div>
          ))}
        </div>

        <div className="reel-cue" aria-hidden="true">
          <span className="reel-cue-line" />
          <span>Scroll to explore</span>
          <span className="reel-cue-line" />
        </div>

        <div className="reel-pager" aria-hidden="true">
          {items.map((_, i) => (
            <span key={i} className="reel-pager-dot" data-active={i === active ? 'true' : 'false'} />
          ))}
        </div>
      </div>
    </section>
  )
}
