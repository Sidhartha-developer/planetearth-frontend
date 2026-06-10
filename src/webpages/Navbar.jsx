import { useState, useEffect } from 'react';
import { Menu, X, Shield } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { Link } from "react-router-dom";



const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Solutions', href: '#solutions' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-background/80 backdrop-blur-xl border-b border-border shadow-lg' 
          : 'bg-transparent'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center glow-effect transition-theme">
              <span className="text-primary font-display font-bold text-xl">P</span>
            </div>
            <span className="font-display font-semibold text-lg text-foreground hidden sm:block">
              PlanetEarth<span className="text-primary">Solutions</span>
            </span>
          </a>

          {/* Desktop Navigation */}
<div className="hidden md:flex items-center gap-8">
  {navLinks.map((link) => (
    <a
      key={link.name}
      href={link.href}
      className="text-muted-foreground hover:text-primary transition-colors duration-300 font-medium"
    >
      {link.name}
    </a>
  ))}

  {/* Admin Login Button */}
<Link
  to="/login"
  className="flex items-center gap-2 px-4 py-2 rounded-xl 
             bg-primary/10 border border-primary/30 
             text-primary font-medium
             hover:bg-primary/20 hover:shadow-[0_0_20px_rgba(0,194,255,0.35)]
             transition-all duration-300"
>
  <Shield className="w-4 h-4" />
  Admin Login
</Link>
</div>


          {/* Theme Toggle & Mobile Menu */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-foreground"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in-up">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-3 text-muted-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </a>
            ))}

            {/* Mobile Admin Login Button */}
<Link
  to="/login"
  onClick={() => setIsMobileMenuOpen(false)}
  className="mt-3 flex items-center gap-2 py-3 px-3 rounded-xl
             bg-primary/10 border border-primary/30
             text-primary font-medium
             hover:bg-primary/20 transition-all duration-300"
>
  <Shield className="w-4 h-4" />
  Admin Login
</Link>

          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
