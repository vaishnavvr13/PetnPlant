import { motion } from "framer-motion";
import { PawPrint, Leaf, Package, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const services = [
  {
    icon: PawPrint,
    title: "Pet Care",
    price: "$25",
    unit: "per visit",
    description: "Professional care for your furry, feathered, or scaly companions.",
    features: [
      "Daily feeding & water",
      "Walks & playtime",
      "Medication administration",
      "Photo updates",
      "Emergency contact support",
    ],
    popular: false,
  },
  {
    icon: Leaf,
    title: "Plant Care",
    price: "$15",
    unit: "per visit",
    description: "Expert nurturing for your indoor and outdoor green friends.",
    features: [
      "Watering schedules",
      "Pruning & maintenance",
      "Soil & fertilizer check",
      "Pest inspection",
      "Growth progress photos",
    ],
    popular: false,
  },
  {
    icon: Package,
    title: "Combined Package",
    price: "15%",
    unit: "discount",
    description: "The best value for pet and plant parents. Get both services bundled.",
    features: [
      "All Pet Care features",
      "All Plant Care features",
      "Priority scheduling",
      "Dedicated provider",
      "Weekly summary reports",
    ],
    popular: true,
    highlight: true,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

const Services = () => {
  return (
    <section className="py-24 px-4 relative" id="services">
      {/* Background Accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/20 to-background" />
      
      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">Services & Pricing</span>
          <h2 className="text-3xl md:text-4xl font-bold font-display mt-3 mb-4">
            Transparent, Simple Pricing
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Choose the care package that fits your needs. No hidden fees, just quality service.
          </p>
        </motion.div>

        {/* Service Cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-6 lg:gap-8"
        >
          {services.map((service) => (
            <motion.div
              key={service.title}
              variants={cardVariants}
              className={`relative group ${service.highlight ? 'md:-mt-4 md:mb-4' : ''}`}
            >
              {/* Popular Badge */}
              {service.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-lime text-primary-foreground text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Best Value
                  </div>
                </div>
              )}
              
              <div className={`
                card-elevated p-6 lg:p-8 h-full flex flex-col hover-lift
                ${service.highlight ? 'border-primary/50 ring-1 ring-primary/20' : ''}
              `}>
                {/* Icon */}
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center mb-5
                  ${service.highlight ? 'bg-gradient-lime' : 'bg-primary/10'}
                `}>
                  <service.icon className={`w-7 h-7 ${service.highlight ? 'text-primary-foreground' : 'text-primary'}`} />
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold font-display mb-2">{service.title}</h3>
                <p className="text-sm text-muted-foreground mb-5">{service.description}</p>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold font-display text-gradient-lime">{service.price}</span>
                  <span className="text-muted-foreground ml-2">{service.unit}</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-grow">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm">
                      <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button 
                  variant={service.highlight ? "hero" : "outline"} 
                  className="w-full"
                  size="lg"
                >
                  {service.highlight ? "Get Combined Package" : `Choose ${service.title}`}
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;
