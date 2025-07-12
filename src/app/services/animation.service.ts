import { Injectable } from "@angular/core"

@Injectable({
  providedIn: "root",
})
export class AnimationService {
  constructor() {

    this.loadGSAP()
  }

  private loadGSAP(): void {

    const gsapScript = document.createElement("script")
    gsapScript.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"
    gsapScript.async = true
    document.head.appendChild(gsapScript)


    const scrollTriggerScript = document.createElement("script")
    scrollTriggerScript.src = "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"
    scrollTriggerScript.async = true
    document.head.appendChild(scrollTriggerScript)
  }


  animateDashboardCards(selector: string): void {
    if (typeof window !== "undefined" && (window as any).gsap) {
      const gsap = (window as any).gsap

      gsap.from(selector, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
      })
    }
  }

  // Method to animate elements when they enter viewport
  animateOnScroll(selector: string): void {
    if (typeof window !== "undefined" && (window as any).gsap && (window as any).ScrollTrigger) {
      const gsap = (window as any).gsap
      const ScrollTrigger = (window as any).ScrollTrigger

      gsap.registerPlugin(ScrollTrigger)

      gsap.from(selector, {
        scrollTrigger: {
          trigger: selector,
          start: "top 80%",
          toggleActions: "play none none none",
        },
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
      })
    }
  }

  // Method for number counter animation
  animateCounter(element: HTMLElement, targetValue: number, duration = 2, prefix = "", suffix = ""): void {
    if (typeof window !== "undefined" && (window as any).gsap) {
      const gsap = (window as any).gsap

      const obj = { value: 0 }

      gsap.to(obj, {
        value: targetValue,
        duration: duration,
        ease: "power2.out",
        onUpdate: () => {
          element.textContent = prefix + Math.round(obj.value) + suffix
        },
      })
    }
  }

  // Method for animated progress bars
  animateProgressBar(element: HTMLElement, targetWidth: string): void {
    if (typeof window !== "undefined" && (window as any).gsap) {
      const gsap = (window as any).gsap

      gsap.to(element, {
        width: targetWidth,
        duration: 1.5,
        ease: "power2.inOut",
      })
    }
  }

  // Method for hover animations
  addHoverAnimation(selector: string): void {
    if (typeof window !== "undefined" && (window as any).gsap) {
      const gsap = (window as any).gsap

      const elements = document.querySelectorAll(selector)

      elements.forEach((element) => {
        element.addEventListener("mouseenter", () => {
          gsap.to(element, {
            y: -5,
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            duration: 0.3,
            ease: "power2.out",
          })
        })

        element.addEventListener("mouseleave", () => {
          gsap.to(element, {
            y: 0,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            duration: 0.3,
            ease: "power2.out",
          })
        })
      })
    }
  }
}
