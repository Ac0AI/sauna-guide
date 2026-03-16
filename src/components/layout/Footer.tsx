import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  return (
    <footer className="bg-sauna-charcoal text-sauna-paper py-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-sauna-bark flex items-center justify-center">
                <Image 
                  src="/images/logo.svg" 
                  alt="Sauna Guide Logo" 
                  width={20} 
                  height={20} 
                  className="w-5 h-5"
                />
              </div>
              <span className="font-display text-xl font-medium">Sauna Guide</span>
            </div>
            <p className="text-sauna-fog max-w-sm leading-relaxed">
              The independent sauna buying guide. Honest reviews,
              real costs, and everything you need to get your first home sauna right.
            </p>
          </div>

          <div>
            <h2 className="font-medium mb-4 text-sauna-sand text-base">Explore</h2>
            <ul className="space-y-2 text-sauna-fog">
              <li><Link href="/saunas" className="hover:text-sauna-paper transition-colors">Sauna Directory</Link></li>
              <li><Link href="/guides" className="hover:text-sauna-paper transition-colors">Guides & Protocols</Link></li>
              <li><Link href="/accessories" className="hover:text-sauna-paper transition-colors">Accessories</Link></li>
              <li><Link href="/sauna-brands" className="hover:text-sauna-paper transition-colors">Sauna Brands</Link></li>
              <li><Link href="/#guide" className="hover:text-sauna-paper transition-colors">Free Buying Guide</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-sauna-bark flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sauna-stone text-sm">
            &copy; {new Date().getFullYear()} Sauna Guide. All rights reserved.
          </p>
          <p className="text-sauna-stone text-sm">
            We don&apos;t sell saunas. We help you buy the right one.
          </p>
        </div>
      </div>
    </footer>
  )
}
