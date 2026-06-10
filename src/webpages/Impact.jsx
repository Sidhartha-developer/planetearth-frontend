import { useTheme } from '../context/ThemeContext';
import { Target, Globe, TrendingUp, Sparkles } from 'lucide-react';

const Impact = () => {
  const { isWater } = useTheme();

  const stats = [
    { value: "500K+", label: "Liters Purified Daily", waterLabel: "Liters Purified Daily", solarLabel: "kWh Generated Daily" },
    { value: "200+", label: "Projects Completed", waterLabel: "Projects Completed", solarLabel: "Installations Complete" },
    { value: "50+", label: "Communities Served", waterLabel: "Communities Served", solarLabel: "Cities Powered" },
    { value: "95%", label: "Client Satisfaction", waterLabel: "Water Quality Rating", solarLabel: "Energy Efficiency" },
  ];

  const content = {
    water: {
      title: "Creating Waves of Positive Change",
      vision: "Our vision is a world where every community has access to clean, safe water. Through innovative treatment solutions and sustainable practices, we're turning this vision into reality—one drop at a time.",
      mission: "We're committed to environmental stewardship, investing in technologies that not only purify water but also protect natural ecosystems for future generations.",
    },
    solar: {
      title: "Illuminating a Brighter Tomorrow",
      vision: "We envision a future powered entirely by clean, renewable energy. Our solar solutions are designed to accelerate this transition, making sustainable energy accessible to homes, businesses, and industries worldwide.",
      mission: "By reducing carbon footprints and promoting energy independence, we're contributing to national development goals while creating lasting value for our clients and communities.",
    },
  };

  const current = isWater ? content.water : content.solar;

  return (
    <section className="py-24 bg-card relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-glow opacity-30 transition-theme" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-3xl bg-background/50 border border-border"
            >
              <div className="font-display text-4xl sm:text-5xl font-bold gradient-text mb-2 transition-theme">
                {stat.value}
              </div>
              <p 
                key={`stat-${index}-${isWater ? 'water' : 'solar'}`}
                className="text-muted-foreground text-sm"
              >
                {isWater ? stat.waterLabel : stat.solarLabel}
              </p>
            </div>
          ))}
        </div>

        {/* Vision & Mission */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Vision */}
          <div className="rounded-3xl card-gradient border border-border p-8 lg:p-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary transition-theme" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">Our Vision</h3>
            </div>
            <p 
              key={current.vision}
              className="text-muted-foreground text-lg leading-relaxed"
            >
              {current.vision}
            </p>
          </div>

          {/* Mission */}
          <div className="rounded-3xl card-gradient border border-border p-8 lg:p-12">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary transition-theme" />
              </div>
              <h3 className="font-display text-2xl font-bold text-foreground">Our Mission</h3>
            </div>
            <p 
              key={current.mission}
              className="text-muted-foreground text-lg leading-relaxed"
            >
              {current.mission}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Impact;
