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
              A weekly letter from the heat. Saunas worth visiting,
              the science of warmth, and permission to slow down.
            </p>
          </div>

          <div>
            <h2 className="font-medium mb-4 text-sauna-sand text-base">Explore</h2>
            <ul className="space-y-2 text-sauna-fog">
              <li><Link href="/saunas" className="hover:text-sauna-paper transition-colors">Sauna Directory</Link></li>
              <li><Link href="/guides" className="hover:text-sauna-paper transition-colors">Guides & Protocols</Link></li>
              <li><Link href="/gear" className="hover:text-sauna-paper transition-colors">Gear Guide</Link></li>
              <li><Link href="/sauna-brands" className="hover:text-sauna-paper transition-colors">Sauna Brands</Link></li>
              <li><Link href="/challenge" className="hover:text-sauna-paper transition-colors">30-Day Reset</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-sauna-bark flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sauna-stone text-sm">
            &copy; {new Date().getFullYear()} Sauna Guide. All rights reserved.
          </p>
          <p className="text-sauna-stone text-sm">
            Every Thursday: why heat heals, where to find it, and five minutes of stillness.
          </p>
        </div>
      </div>
    </footer>
  )
}
