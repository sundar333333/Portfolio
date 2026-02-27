import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";

interface HeaderProps {
  onTextHover: (text: string | null) => void;
  isDarkText?: boolean;
}

export function Header({ onTextHover, isDarkText = false }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "About Me", section: "about" },
    { label: "Works", section: "works" },
    { label: "3D Room", section: "room" },
  ];

  const handleNavClick = (section: string) => {
    window.dispatchEvent(new CustomEvent('navigateTo', { detail: { section } }));
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-12 py-4 pointer-events-auto"
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
        data-testid="header"
      >
        <motion.div
          className={`font-anton text-xl md:text-3xl tracking-wide cursor-pointer transition-colors duration-500 ${isDarkText ? 'text-black' : 'text-white'}`}
          onMouseEnter={() => onTextHover("SUNDAR RAM")}
          onMouseLeave={() => onTextHover(null)}
          whileHover={{ scale: 1.02 }}
          data-testid="text-brand-name"
        >
          SUNDAR RAM
        </motion.div>

        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <motion.button
              key={item.label}
              className={`text-sm font-medium transition-colors duration-500 bg-transparent border-none cursor-pointer ${isDarkText ? 'text-black/80 hover:text-black' : 'text-white/80 hover:text-white'}`}
              onMouseEnter={() => onTextHover(item.label)}
              onMouseLeave={() => onTextHover(null)}
              onClick={() => handleNavClick(item.section)}
              whileHover={{ y: -2 }}
              data-testid={`link-nav-${item.label.toLowerCase().replace(" ", "-")}`}
            >
              {item.label}
            </motion.button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <motion.button
            className={`hidden sm:block px-4 py-2 text-sm font-medium rounded-full transition-colors duration-500 border-none cursor-pointer ${isDarkText ? 'text-white bg-black hover:bg-black/90' : 'text-black bg-white hover:bg-white/90'}`}
            onMouseEnter={() => onTextHover("Contact / Recruit Me")}
            onMouseLeave={() => onTextHover(null)}
            onClick={() => handleNavClick('contact')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            data-testid="button-contact"
          >
            Contact / Recruit Me
          </motion.button>

          <motion.button
            className={`md:hidden flex items-center justify-center w-10 h-10 transition-colors duration-500 ${isDarkText ? 'text-black' : 'text-white'}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            whileTap={{ scale: 0.95 }}
            data-testid="button-mobile-menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>
      </motion.header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-black/95 md:hidden flex flex-col items-center justify-center gap-8 pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            data-testid="mobile-menu"
          >
            {navItems.map((item, index) => (
              <motion.button
                key={item.label}
                className="font-anton text-3xl text-white bg-transparent border-none cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleNavClick(item.section)}
                data-testid={`link-mobile-nav-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                {item.label}
              </motion.button>
            ))}
            <motion.button
              className="mt-4 px-6 py-3 text-lg font-medium text-black bg-white rounded-full border-none cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: 0.3 }}
              onClick={() => handleNavClick('contact')}
              data-testid="button-mobile-contact"
            >
              Contact / Recruit Me
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
