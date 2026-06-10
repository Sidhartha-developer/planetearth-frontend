import { useTheme } from '../context/ThemeContext';
import { Shield, Zap, Users, TrendingUp, Award, Heart, CheckCircle, Leaf } from 'lucide-react';

const WhyChooseUs = () => {
  const { isWater } = useTheme();

  const reasons = {
    water: [
      { icon: Award, title: "Certified Technologies", desc: "Industry-leading water treatment certifications" },
      { icon: Leaf, title: "Eco-Safe Processes", desc: "Environmentally responsible methods" },
      { icon: Shield, title: "Reliable Systems", desc: "24/7 monitoring and maintenance" },
      { icon: Heart, title: "Community Impact", desc: "Clean water for thousands of families" },
    ],
    solar: [
      { icon: Zap, title: "High Efficiency", desc: "Premium solar panels with 22%+ efficiency" },
      { icon: TrendingUp, title: "Cost Effective", desc: "Reduce energy bills by up to 80%" },
      { icon: Users, title: "Scalable Solutions", desc: "From homes to industrial complexes" },
      { icon: CheckCircle, title: "Long-Term Savings", desc: "25-year performance warranties" },
    ],
  };

  const current = isWater ? reasons.water : reasons.solar;

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1/3 h-2/3 bg-glow opacity-20 transition-theme" />
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block text-primary font-medium mb-4 transition-theme">Why Choose Us</span>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-6 text-foreground">
            The <span className="gradient-text transition-theme">PlanetEarth</span> Advantage
          </h2>
          <p className="text-muted-foreground text-lg">
            {isWater 
              ? "Trusted water solutions backed by decades of expertise and cutting-edge technology."
              : "Leading solar energy solutions that deliver performance, savings, and sustainability."
            }
          </p>
        </div>

        {/* Reasons Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {current.map((reason, index) => {
            const Icon = reason.icon;
            return (
              <div
                key={`${reason.title}-${isWater ? 'water' : 'solar'}`}
                className="group text-center p-8 rounded-3xl card-gradient border border-border hover:border-primary/30 transition-all duration-300 hover:-translate-y-2"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <Icon className="w-8 h-8 text-primary transition-theme" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {reason.title}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {reason.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
