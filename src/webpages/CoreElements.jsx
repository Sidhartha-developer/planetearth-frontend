import { useTheme } from '../context/ThemeContext';
import { Droplets, Sun, Wind, Recycle, ArrowUpRight } from 'lucide-react';

const Solutions = () => {
  const { isWater } = useTheme();

  const solutions = [
    {
      id: 'water',
      icon: Droplets,
      title: 'Water Solutions',
      waterDesc: 'Comprehensive water treatment, purification, and conservation systems for sustainable communities.',
      solarDesc: 'Integrated water management systems powered by clean solar energy.',
      featured: isWater,
    },
    {
      id: 'solar',
      icon: Sun,
      title: 'Solar Solutions',
      waterDesc: 'Clean solar energy to power water treatment and recycling facilities.',
      solarDesc: 'High-efficiency solar panels and infrastructure for maximum energy generation.',
      featured: !isWater,
    },
    {
      id: 'air',
      icon: Wind,
      title: 'Air Solutions',
      waterDesc: 'Air quality monitoring and purification for healthier environments.',
      solarDesc: 'Solar-powered air treatment systems for clean, sustainable air quality.',
      featured: false,
    },
    {
      id: 'ewaste',
      icon: Recycle,
      title: 'E-Waste Management',
      waterDesc: 'Responsible electronic waste recycling protecting water sources from contamination.',
      solarDesc: 'Sustainable e-waste processing powered by renewable solar energy.',
      featured: false,
    },
  ];

  return (
    <section id="solutions" className="py-24 bg-card relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-glow opacity-20 transition-theme" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-primary font-medium mb-4 transition-theme">Our Solutions</span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-foreground">
            Comprehensive <span className="gradient-text transition-theme">Green Technology</span> Services
          </h2>
          <p className="text-muted-foreground text-lg">
            From water purification to solar energy, we provide end-to-end sustainable solutions for a better tomorrow.
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {solutions.map((solution, index) => {
            const Icon = solution.icon;
            const description = isWater ? solution.waterDesc : solution.solarDesc;
            
            return (
              <div
                key={solution.id}
                className={`group relative rounded-3xl p-8 border transition-all duration-500 hover:-translate-y-2 cursor-pointer ${
                  solution.featured
                    ? 'bg-primary/10 border-primary/30 glow-effect'
                    : 'card-gradient border-border hover:border-primary/30'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Featured Badge */}
                {solution.featured && (
                  <span className="absolute top-4 right-4 px-3 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary border border-primary/30">
                    Featured
                  </span>
                )}

                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110 ${
                    solution.featured ? 'bg-primary/20' : 'bg-primary/10'
                  }`}>
                    <Icon className="w-8 h-8 text-primary transition-theme" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-display font-semibold text-xl text-foreground">
                        {solution.title}
                      </h3>
                      <ArrowUpRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <p 
                      key={`${solution.id}-${isWater ? 'water' : 'solar'}`}
                      className="text-muted-foreground leading-relaxed"
                    >
                      {description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Solutions;
