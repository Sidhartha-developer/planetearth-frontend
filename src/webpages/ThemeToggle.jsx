import { useTheme } from '../context/ThemeContext';
import { Droplets, Sun } from 'lucide-react';

const ThemeToggle = () => {
  const { theme, toggleTheme, isWater } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border transition-theme hover:border-primary/50 group"
      aria-label={`Switch to ${isWater ? 'Solar' : 'Water'} theme`}
    >
      <Droplets 
        className={`w-4 h-4 transition-theme ${isWater ? 'text-primary' : 'text-muted-foreground'}`} 
      />
      
      <div className="relative w-12 h-6 bg-background rounded-full border border-border overflow-hidden">
        <div 
          className={`absolute top-1 w-4 h-4 rounded-full transition-all duration-500 glow-effect ${
            isWater 
              ? 'left-1 bg-primary' 
              : 'left-7 bg-primary'
          }`}
        />
      </div>
      
      <Sun 
        className={`w-4 h-4 transition-theme ${!isWater ? 'text-primary' : 'text-muted-foreground'}`} 
      />
    </button>
  );
};

export default ThemeToggle;
