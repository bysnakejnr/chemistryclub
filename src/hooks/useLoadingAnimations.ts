import { useEffect, useRef } from 'react'

/**
 * Hook for managing staggered loading animations
 * Adds fade-in animations to elements with staggered delays
 */
export function useLoadingAnimations(dependencies: any[] = []) {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    const elements = container.querySelectorAll('.animate-on-load')

    // Add animation classes to elements
    elements.forEach((element, index) => {
      const htmlElement = element as HTMLElement
      
      // Determine animation type based on element position
      const animationType = getAnimationType(htmlElement)
      const staggerClass = getStaggerClass(index)
      
      // Add animation classes
      htmlElement.classList.add(animationType, staggerClass)
      
      // Remove initial hidden state after animation starts
      setTimeout(() => {
        htmlElement.style.opacity = '1'
      }, 50)
    })

    return () => {
      // Cleanup animations if needed
      elements.forEach((element) => {
        const htmlElement = element as HTMLElement
        htmlElement.classList.remove(
          'fade-in-up', 'fade-in-down', 'fade-in-left', 'fade-in-right', 'scale-in'
        )
      })
    }
  }, dependencies)

  return containerRef
}

/**
 * Determines animation type based on element position and attributes
 */
function getAnimationType(element: HTMLElement): string {
  // Check for explicit animation preference
  const animationAttr = element.getAttribute('data-animation')
  if (animationAttr) {
    return animationAttr
  }

  // Check element position in viewport
  const rect = element.getBoundingClientRect()
  const viewportHeight = window.innerHeight
  
  if (rect.top < viewportHeight * 0.3) {
    return 'fade-in-down'
  } else if (rect.top > viewportHeight * 0.7) {
    return 'fade-in-up'
  } else {
    return 'fade-in-up'
  }
}

/**
 * Gets stagger class based on element index
 */
function getStaggerClass(index: number): string {
  const staggerClasses = [
    'stagger-1', 'stagger-2', 'stagger-3', 'stagger-4',
    'stagger-5', 'stagger-6', 'stagger-7', 'stagger-8'
  ]
  
  return staggerClasses[index % staggerClasses.length]
}

/**
 * Hook for skeleton loading states
 */
export function useSkeletonLoading(isLoading: boolean, itemCount: number = 3) {
  const skeletonItems = Array.from({ length: itemCount }, (_, index) => index)

  return {
    showSkeleton: isLoading,
    skeletonItems
  }
}

/**
 * Hook for page transition animations
 */
export function usePageTransition(isLoading: boolean) {
  const containerRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    
    if (isLoading) {
      container.classList.add('page-transition-exit-active')
    } else {
      container.classList.remove('page-transition-exit-active')
      container.classList.add('page-transition-enter-active')
      
      setTimeout(() => {
        container.classList.remove('page-transition-enter-active')
      }, 500)
    }
  }, [isLoading])

  return containerRef
}
