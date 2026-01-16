'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-sauna-paper/90 backdrop-blur-md border-b border-sauna-ash/50">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-sauna-bark flex items-center justify-center
                          group-hover:bg-sauna-walnut transition-colors duration-300">
            <Image 
              src="/images/logo.svg" 
              alt="Sauna Guide Logo" 
              width={20} 
              height={20} 
              className="w-5 h-5"
            />
          </div>
          <span className="font-display text-xl font-medium text-sauna-ink tracking-tight">Sauna Guide</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/saunas" className="text-sauna-slate hover:text-sauna-ink transition-colors text-sm font-medium tracking-wide uppercase">
            Directory
          </Link>
          <Link href="/guides" className="text-sauna-slate hover:text-sauna-ink transition-colors text-sm font-medium tracking-wide uppercase">
            Guides
          </Link>
          <Link href="/gear" className="text-sauna-slate hover:text-sauna-ink transition-colors text-sm font-medium tracking-wide uppercase">
            Gear
          </Link>
          <Link href="/sauna-brands" className="text-sauna-slate hover:text-sauna-ink transition-colors text-sm font-medium tracking-wide uppercase">
            Brands
          </Link>
          <Link href="/#newsletter" className="px-5 py-2.5 bg-sauna-ink text-sauna-paper rounded-lg text-sm font-medium
                                               hover:bg-sauna-charcoal transition-colors duration-300">
            Get The Briefing
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 -mr-2 text-sauna-ink"
          aria-label="Toggle menu"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-sauna-paper border-t border-sauna-ash/50">
          <div className="px-6 py-4 space-y-4">
            <Link
              href="/saunas"
              onClick={() => setIsOpen(false)}
              className="block text-sauna-ink font-medium py-2 hover:text-sauna-walnut transition-colors"
            >
              Directory
            </Link>
            <Link
              href="/guides"
              onClick={() => setIsOpen(false)}
              className="block text-sauna-ink font-medium py-2 hover:text-sauna-walnut transition-colors"
            >
              Guides
            </Link>
            <Link
              href="/gear"
              onClick={() => setIsOpen(false)}
              className="block text-sauna-ink font-medium py-2 hover:text-sauna-walnut transition-colors"
            >
              Gear
            </Link>
            <Link
              href="/sauna-brands"
              onClick={() => setIsOpen(false)}
              className="block text-sauna-ink font-medium py-2 hover:text-sauna-walnut transition-colors"
            >
              Brands
            </Link>
            <Link
              href="/#newsletter"
              onClick={() => setIsOpen(false)}
              className="block w-full text-center px-5 py-3 bg-sauna-ink text-sauna-paper rounded-lg font-medium
                         hover:bg-sauna-charcoal transition-colors duration-300"
            >
              Get The Briefing
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
