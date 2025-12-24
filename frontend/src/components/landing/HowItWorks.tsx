import { motion } from "framer-motion";
import { Search, Calendar, Heart, FileCheck, Shield, Briefcase } from "lucide-react";

const ownerSteps = [
  {
    icon: Search,
    title: "Browse Providers",
    description: "Search verified care providers in your area based on services, ratings, and availability.",
  },
  {
    icon: Calendar,
    title: "Book & Confirm",
    description: "Select your preferred provider, choose dates, and wait for booking confirmation.",
  },
  {
    icon: Heart,
    title: "Relax & Enjoy",
    description: "Your pets and plants are in safe hands. Receive updates and photos during care.",
  },
];

const providerSteps = [
  {
    icon: FileCheck,
    title: "Apply & Verify",
    description: "Submit your application with qualifications and complete our KYC verification process.",
  },
  {
    icon: Shield,
    title: "Get Approved",
    description: "Once verified by our admin team, your profile goes live and clients can find you.",
  },
  {
    icon: Briefcase,
    title: "Start Earning",
    description: "Accept bookings, provide excellent care, and build your reputation with reviews.",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

const StepCard = ({ step, index }: { step: typeof ownerSteps[0]; index: number }) => (
  <motion.div variants={itemVariants} className="relative group">
    <div className="card-elevated p-6 h-full hover-lift">
      {/* Step Number */}
      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-gradient-lime flex items-center justify-center text-sm font-bold text-primary-foreground">
        {index + 1}
      </div>
      
      {/* Icon */}
      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
        <step.icon className="w-7 h-7 text-primary" />
      </div>
      
      {/* Content */}
      <h3 className="text-lg font-semibold font-display mb-2">{step.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
    </div>
  </motion.div>
);

const HowItWorks = () => {
  return (
    <section className="py-24 px-4" id="how-it-works">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-primary font-medium text-sm uppercase tracking-wider">How It Works</span>
          <h2 className="text-3xl md:text-4xl font-bold font-display mt-3 mb-4">
            Simple Steps to Get Started
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Whether you're looking for care or ready to provide it, getting started takes just minutes.
          </p>
        </motion.div>

        {/* For Owners */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-primary/50" />
            <h3 className="text-xl font-semibold font-display text-primary">For Pet & Plant Owners</h3>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/50" />
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-3 gap-6 md:gap-8"
          >
            {ownerSteps.map((step, index) => (
              <StepCard key={step.title} step={step} index={index} />
            ))}
          </motion.div>
        </div>

        {/* For Providers */}
        <div id="providers">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="h-px flex-1 max-w-[60px] bg-gradient-to-r from-transparent to-primary/50" />
            <h3 className="text-xl font-semibold font-display text-primary">For Care Providers</h3>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/50" />
          </motion.div>
          
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="grid md:grid-cols-3 gap-6 md:gap-8"
          >
            {providerSteps.map((step, index) => (
              <StepCard key={step.title} step={step} index={index} />
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
