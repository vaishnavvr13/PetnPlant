import { motion } from "framer-motion";
import { PawPrint, Leaf, Users, Star } from "lucide-react";

const stats = [
  {
    icon: PawPrint,
    value: "1,000+",
    label: "Pets Cared For",
    color: "text-primary",
  },
  {
    icon: Leaf,
    value: "1,000+",
    label: "Plants Nurtured",
    color: "text-primary",
  },
  {
    icon: Users,
    value: "500+",
    label: "Verified Providers",
    color: "text-primary",
  },
  {
    icon: Star,
    value: "4.9",
    label: "Average Rating",
    color: "text-primary",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const Stats = () => {
  return (
    <section className="relative py-16 px-4">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 max-w-6xl mx-auto"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={itemVariants}
              className="relative group"
            >
              <div className="card-elevated p-6 md:p-8 text-center hover-lift">
                {/* Glow Effect */}
                <div className="absolute inset-0 rounded-xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-4">
                    <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold font-display text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
};

export default Stats;
