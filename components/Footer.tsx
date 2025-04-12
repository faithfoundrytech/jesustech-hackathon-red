"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Instagram, Twitter, Facebook, Youtube, Mail, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  // Partner logos placeholder
  const partnerLogos = [
    "https://placehold.co/200x80/FFFFFF/4B0082?text=Partner+1",
    "https://placehold.co/200x80/FFFFFF/4B0082?text=Partner+2",
    "https://placehold.co/200x80/FFFFFF/4B0082?text=Partner+3",
    "https://placehold.co/200x80/FFFFFF/4B0082?text=Partner+4",
  ];
  
  return (
    <footer className="bg-indigo-950 py-12 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Partners section */}

        <div className="mb-12 pb-12 border-b border-indigo-800/30">
            <h4 className="text-center font-poppins font-semibold text-indigo-100 text-3xl mb-8">
              Trusted by Churches and Organizations
            </h4>
            <div className="flex flex-wrap justify-center gap-8">
              {[
                '/onehope.png', 
                '/lifeabundance.png', 
                '/alx.jpeg', 
                '/gc.avif',
                '/ihub.avif', 
              ].map((logo, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Image
                    src={logo}
                    alt={`Partner logo ${index + 1}`}
                    width={300}
                    height={180}
                    className="h-12 w-auto opacity-70 hover:opacity-100 transition-opacity"
                  />
                </motion.div>
              ))}
            </div>
          </div>


        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className="flex flex-col">
            <div className="mb-4">
              <Image 
                src="/play-the-word-logo-2.png" 
                alt="Play The Word" 
                width={180} 
                height={60} 
                className="mb-4"
              />
            </div>
            <p className="text-indigo-300 text-sm mb-6">
              An AI-powered platform that transforms sermons into interactive learning games to boost engagement and retention.
            </p>
            <div className="flex space-x-4">
              <SocialIcon icon={<Instagram size={18} />} />
              <SocialIcon icon={<Twitter size={18} />} />
              <SocialIcon icon={<Facebook size={18} />} />
              <SocialIcon icon={<Youtube size={18} />} />
            </div>
          </div>
          
          <div>
            <h4 className="font-poppins font-semibold text-indigo-100 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <FooterLink>Home</FooterLink>
              <FooterLink>About Us</FooterLink>
              <FooterLink>For Churches</FooterLink>
              <FooterLink>For Players</FooterLink>
              <FooterLink>Pricing</FooterLink>
            </ul>
          </div>
          
          <div>
            <h4 className="font-poppins font-semibold text-indigo-100 mb-4">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-2 text-indigo-300">
                <Mail size={16} className="text-indigo-400" />
                <span>hello@playtheword.com</span>
              </li>
            </ul>
            
            <div className="mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-indigo-500 text-white px-5 py-2 rounded-full text-sm font-semibold shadow-md hover:shadow-lg transition-shadow"
              >
                Contact Us
              </motion.button>
            </div>
          </div>
        </div>
        
        <div className="border-t border-indigo-800/30 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-indigo-400 text-sm text-center md:text-left mb-4 md:mb-0">
            © {currentYear} Play The Word. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <span className="text-indigo-400 text-sm hover:text-indigo-200 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="text-indigo-400 text-sm hover:text-indigo-200 transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-indigo-400 flex items-center justify-center">
          Made with <Heart size={12} className="mx-1 text-indigo-300" /> for God's Kingdom
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ children }: { children: React.ReactNode }) {
  return (
    <li>
      <motion.a 
        href="#" 
        className="text-indigo-300 hover:text-indigo-100 transition-colors"
        whileHover={{ x: 3 }}
      >
        {children}
      </motion.a>
    </li>
  );
}

function SocialIcon({ icon }: { icon: React.ReactNode }) {
  return (
    <motion.a
      href="#"
      className="w-8 h-8 rounded-full bg-indigo-800/60 flex items-center justify-center text-indigo-200 hover:bg-indigo-500 hover:text-white transition-colors"
      whileHover={{ scale: 1.1, rotate: 5 }}
      whileTap={{ scale: 0.95 }}
    >
      {icon}
    </motion.a>
  );
}