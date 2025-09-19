'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  sizes?: string
  fill?: boolean
  style?: React.CSSProperties
  onLoad?: () => void
  onError?: () => void
  fallback?: string | React.ReactNode
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  sizes,
  fill = false,
  style,
  onLoad,
  onError,
  fallback
}: OptimizedImageProps) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const handleLoad = () => {
    setLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setError(true)
    onError?.()
  }

  if (error && fallback) {
    if (typeof fallback === 'string') {
      return (
        <div className={cn('bg-gray-100 flex items-center justify-center', className)}>
          <img src={fallback} alt={alt} className="object-cover" />
        </div>
      )
    }
    return <>{fallback}</>
  }

  if (error) {
    return (
      <div className={cn('bg-gray-100 flex items-center justify-center text-gray-400', className)}>
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
        </svg>
      </div>
    )
  }

  return (
    <div className={cn('relative overflow-hidden', className)} style={style}>
      <Image
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        fill={fill}
        priority={priority}
        quality={quality}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        sizes={sizes}
        className={cn(
          'transition-opacity duration-300',
          loaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
      {!loaded && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
    </div>
  )
}

// Avatar component with optimized loading
interface AvatarProps {
  src?: string
  alt: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallbackText?: string
  online?: boolean
}

export function Avatar({
  src,
  alt,
  size = 'md',
  className,
  fallbackText,
  online
}: AvatarProps) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl'
  }

  const fallback = fallbackText || alt.split(' ').map(n => n.charAt(0)).join('').slice(0, 2).toUpperCase()

  return (
    <div className={cn('relative', sizeClasses[size], className)}>
      {src ? (
        <OptimizedImage
          src={src}
          alt={alt}
          fill
          className="rounded-full object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          fallback={
            <div className={cn(
              'rounded-full bg-[#873bff]/10 flex items-center justify-center text-[#873bff] font-medium',
              sizeClasses[size]
            )}>
              {fallback}
            </div>
          }
        />
      ) : (
        <div className={cn(
          'rounded-full bg-[#873bff]/10 flex items-center justify-center text-[#873bff] font-medium',
          sizeClasses[size]
        )}>
          {fallback}
        </div>
      )}
      {online && (
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
      )}
    </div>
  )
}

// Logo component with optimized loading
interface LogoProps {
  src?: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
}

export function Logo({
  src,
  alt,
  width = 120,
  height = 40,
  className,
  priority = true
}: LogoProps) {
  if (!src) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="w-8 h-8 bg-[#873bff] rounded-lg" />
        <span className="font-bold text-xl text-gray-900">{alt}</span>
      </div>
    )
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={cn('object-contain', className)}
      fallback={
        <div className={cn('flex items-center gap-2', className)}>
          <div className="w-8 h-8 bg-[#873bff] rounded-lg" />
          <span className="font-bold text-xl text-gray-900">{alt}</span>
        </div>
      }
    />
  )
}

// Hook for lazy loading images with intersection observer
export function useLazyImage(src: string, options?: IntersectionObserverInit) {
  const [imageSrc, setImageSrc] = useState<string>()
  const [loaded, setLoaded] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const img = imgRef.current
    if (!img || !src) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setImageSrc(src)
          observer.disconnect()
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(img)

    return () => {
      observer.disconnect()
    }
  }, [src, options])

  const handleLoad = () => {
    setLoaded(true)
  }

  return {
    ref: imgRef,
    src: imageSrc,
    loaded,
    onLoad: handleLoad
  }
}

// Progressive image component for better perceived performance
interface ProgressiveImageProps {
  lowQualitySrc: string
  highQualitySrc: string
  alt: string
  width?: number
  height?: number
  className?: string
}

export function ProgressiveImage({
  lowQualitySrc,
  highQualitySrc,
  alt,
  width,
  height,
  className
}: ProgressiveImageProps) {
  const [highQualityLoaded, setHighQualityLoaded] = useState(false)

  return (
    <div className={cn('relative', className)}>
      {/* Low quality placeholder */}
      <OptimizedImage
        src={lowQualitySrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'absolute inset-0 object-cover transition-opacity duration-300',
          highQualityLoaded ? 'opacity-0' : 'opacity-100'
        )}
        quality={30}
        priority
      />
      
      {/* High quality image */}
      <OptimizedImage
        src={highQualitySrc}
        alt={alt}
        width={width}
        height={height}
        className={cn(
          'object-cover transition-opacity duration-300',
          highQualityLoaded ? 'opacity-100' : 'opacity-0'
        )}
        onLoad={() => setHighQualityLoaded(true)}
        quality={90}
      />
    </div>
  )
}
