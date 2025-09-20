import React from 'react';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  Heart,
  Code,
  Sparkles
} from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { icon: Facebook, href: '#', color: 'hover:text-blue-400' },
    { icon: Twitter, href: '#', color: 'hover:text-sky-400' },
    { icon: Linkedin, href: '#', color: 'hover:text-blue-600' },
    { icon: Instagram, href: '#', color: 'hover:text-pink-400' },
  ];

  const quickLinks = [
    { name: 'About CSIT', href: '#' },
    { name: 'Academic Programs', href: '#' },
    { name: 'Faculty', href: '#' },
    { name: 'Research', href: '#' },
    { name: 'Student Portal', href: '#' },
    { name: 'Contact Us', href: '#' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  };

  return (
    <motion.footer
      className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 text-white overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={containerVariants}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full"
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [360, 180, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="relative z-10">
        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* University Info */}
            <motion.div variants={itemVariants} className="space-y-6">
              <div className="flex items-center space-x-3">
                <motion.div
                  className="bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 p-3 rounded-2xl shadow-lg"
                  whileHover={{ 
                    scale: 1.1,
                    boxShadow: "0 0 30px rgba(59, 130, 246, 0.6)" 
                  }}
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(59, 130, 246, 0.3)",
                      "0 0 30px rgba(147, 51, 234, 0.4)",
                      "0 0 20px rgba(59, 130, 246, 0.3)"
                    ]
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <GraduationCap className="w-8 h-8 text-white" />
                </motion.div>
                <div>
                  <h3 className="text-xl font-bold">NED University</h3>
                  <p className="text-sm text-gray-300">CSIT Department</p>
                </div>
              </div>
              
              <p className="text-gray-300 leading-relaxed">
                Department of Computer Science & Information Technology, 
                NED University of Engineering & Technology - Leading innovation 
                in technology education since 1922.
              </p>

              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    className={`p-3 bg-white/10 backdrop-blur-xl rounded-xl ${social.color} transition-all border border-white/20`}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h4 className="text-lg font-semibold flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-blue-400" />
                Quick Links
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link, index) => (
                  <motion.li key={index}>
                    <motion.a
                      href={link.href}
                      className="text-gray-300 hover:text-white transition-colors flex items-center group"
                      whileHover={{ x: 5 }}
                    >
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-3 group-hover:bg-purple-400 transition-colors"></span>
                      {link.name}
                    </motion.a>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h4 className="text-lg font-semibold flex items-center">
                <Mail className="w-5 h-5 mr-2 text-blue-400" />
                Contact Info
              </h4>
              <div className="space-y-4">
                <motion.div 
                  className="flex items-start space-x-3 p-3 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <MapPin className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-gray-300">
                      University Road, Karachi-75270, Pakistan
                    </p>
                  </div>
                </motion.div>

                <motion.div 
                  className="flex items-center space-x-3 p-3 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Phone className="w-5 h-5 text-green-400" />
                  <p className="text-sm text-gray-300">+92-21-99261261-8</p>
                </motion.div>

                <motion.div 
                  className="flex items-center space-x-3 p-3 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Mail className="w-5 h-5 text-purple-400" />
                  <p className="text-sm text-gray-300">info@neduet.edu.pk</p>
                </motion.div>

                <motion.div 
                  className="flex items-center space-x-3 p-3 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.1)' }}
                >
                  <Globe className="w-5 h-5 text-cyan-400" />
                  <p className="text-sm text-gray-300">www.neduet.edu.pk</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Newsletter */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h4 className="text-lg font-semibold flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-blue-400" />
                Stay Updated
              </h4>
              <p className="text-gray-300 text-sm">
                Subscribe to get the latest updates about CSIT programs, events, and announcements.
              </p>
              
              <div className="space-y-3">
                <motion.input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white placeholder-white/50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  whileFocus={{ scale: 1.02 }}
                />
                <motion.button
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Subscribe
                </motion.button>
              </div>

              <div className="p-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-xl border border-blue-500/30">
                <p className="text-sm text-blue-200 flex items-center">
                  <Code className="w-4 h-4 mr-2" />
                  Built with modern web technologies
                </p>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          className="border-t border-white/20 bg-black/20 backdrop-blur-xl"
          variants={itemVariants}
        >
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <motion.p 
                className="text-gray-300 text-sm flex items-center"
                whileHover={{ scale: 1.05 }}
              >
                © {currentYear} NED University of Engineering & Technology. Made with 
                <motion.span
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="mx-1"
                >
                  <Heart className="w-4 h-4 text-red-400 inline" />
                </motion.span>
                by CSIT Department
              </motion.p>
              
              <div className="flex items-center space-x-6 text-sm text-gray-300">
                <motion.a 
                  href="#" 
                  className="hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Privacy Policy
                </motion.a>
                <motion.a 
                  href="#" 
                  className="hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Terms of Service
                </motion.a>
                <motion.a 
                  href="#" 
                  className="hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Support
                </motion.a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}