import { useTheme } from '../context/ThemeContext';
import { Leaf, Lightbulb, Globe, Shield } from 'lucide-react';

const About = () => {
  const { isWater } = useTheme();

  const content = {
    water: {
      title: "Protecting Our Most Precious Resource",
      description: "At PlanetEarthSolutions, we're dedicated to revolutionizing water management through cutting-edge treatment technologies, sustainable recycling systems, and comprehensive conservation strategies. Our mission is to ensure clean, safe water for communities while protecting our environment for future generations.",
      highlights: [
        "Advanced water purification systems",
        "Sustainable recycling solutions",
        "Environmental protection focus",
        "Community-driven initiatives",
      ],
    },
    solar: {
      title: "Leading the Renewable Energy Revolution",
      description: "PlanetEarthSolutions is at the forefront of the clean energy transition, delivering high-efficiency solar infrastructure that powers homes, businesses, and industries. We're committed to reducing carbon footprints while maximizing energy independence and long-term savings for our clients.",
      highlights: [
        "High-efficiency solar technology",
        "Carbon footprint reduction",
        "Energy independence solutions",
        "Scalable infrastructure",
      ],
    },
  };

  const current = isWater ? content.water : content.solar;

  const values = [
    { icon: Leaf, label: "Sustainability" },
    { icon: Lightbulb, label: "Innovation" },
    { icon: Globe, label: "Global Impact" },
    { icon: Shield, label: "Reliability" },
  ];

  return (
    <section id="about" className="py-24 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-glow opacity-30 transition-theme" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div>
            <span className="inline-block text-primary font-medium mb-4 transition-theme">About Us</span>
            <h2 
              key={current.title}
              className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-foreground"
            >
              {current.title}
            </h2>
            <p 
              key={current.description}
              className="text-muted-foreground text-lg mb-8 leading-relaxed"
            >
              {current.description}
            </p>
            
            {/* Highlights */}
            <ul className="space-y-3 mb-8">
              {current.highlights.map((highlight, index) => (
                <li key={index} className="flex items-center gap-3 text-foreground">
                  <div className="w-2 h-2 rounded-full bg-primary transition-theme" />
                  {highlight}
                </li>
              ))}
            </ul>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-2 gap-4">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={value.label}
                  className="card-gradient rounded-3xl p-8 border border-border hover:border-primary/30 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-7 h-7 text-primary transition-theme" />
                  </div>
                  <h3 className="font-display font-semibold text-xl text-foreground">
                    {value.label}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
