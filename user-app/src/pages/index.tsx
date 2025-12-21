import { GetStaticProps } from "next";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaCar,
  FaUserTie,
  FaChartLine,
  FaShieldAlt,
  FaClock,
  FaDollarSign,
} from "react-icons/fa";

export default function Home() {
  const features = [
    {
      icon: <FaCar className="text-4xl" />,
      title: "Wide Vehicle Selection",
      description:
        "Choose from our diverse fleet of modern, well-maintained vehicles",
    },
    {
      icon: <FaUserTie className="text-4xl" />,
      title: "Professional Drivers",
      description:
        "Experienced and verified drivers for your safety and comfort",
    },
    {
      icon: <FaChartLine className="text-4xl" />,
      title: "Real-time Tracking",
      description:
        "Track your bookings and trips in real-time with our dashboard",
    },
    {
      icon: <FaShieldAlt className="text-4xl" />,
      title: "Secure & Safe",
      description: "Advanced security measures to ensure your data and safety",
    },
    {
      icon: <FaClock className="text-4xl" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support for all your needs",
    },
    {
      icon: <FaDollarSign className="text-4xl" />,
      title: "Competitive Pricing",
      description: "Transparent pricing with no hidden fees",
    },
  ];

  return (
    <>
      <Head>
        <title>Fleet Management System - Home</title>
        <meta
          name="description"
          content="Modern fleet management solution for customers, drivers, and vehicle owners"
        />
      </Head>

      <div className="min-h-screen bg-dark-950">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-lg border-b border-dark-800">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold gradient-text">
                FleetHub
              </Link>
              <div className="flex items-center gap-4">
                <Link href="/login" className="btn btn-outline text-sm">
                  Login
                </Link>
                <Link href="/signup" className="btn btn-primary text-sm">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="gradient-text">Manage Your Fleet</span>
                <br />
                <span className="text-white">With Confidence</span>
              </h1>
              <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                A comprehensive platform for vehicle owners, drivers, and
                customers. Book vehicles, manage trips, and grow your fleet
                business effortlessly.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="btn btn-primary text-lg px-8 py-4"
                >
                  Start Your Journey
                </Link>
                <Link
                  href="/login"
                  className="btn btn-outline text-lg px-8 py-4"
                >
                  Sign In
                </Link>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20"
            >
              {[
                { value: "500+", label: "Vehicles" },
                { value: "1000+", label: "Happy Customers" },
                { value: "200+", label: "Professional Drivers" },
                { value: "50+", label: "Cities" },
              ].map((stat, index) => (
                <div key={index} className="card p-6 text-center">
                  <div className="text-3xl font-bold gradient-text">
                    {stat.value}
                  </div>
                  <div className="text-gray-400 mt-2">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-6 bg-dark-900/50">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">
                Why Choose <span className="gradient-text">FleetHub</span>
              </h2>
              <p className="text-gray-400 text-lg">
                Everything you need to manage your fleet efficiently
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card-hover p-6"
                >
                  <div className="text-primary-500 mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Roles Section */}
        <section className="py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold mb-4">
                Built For <span className="gradient-text">Everyone</span>
              </h2>
              <p className="text-gray-400 text-lg">
                Three powerful dashboards for different user types
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  role: "Customer",
                  description:
                    "Browse vehicles, make bookings, and track your trips",
                  features: [
                    "Easy booking",
                    "Trip history",
                    "Real-time tracking",
                  ],
                  gradient: "bg-gradient-primary",
                },
                {
                  role: "Driver",
                  description:
                    "Register for vehicles, manage trips, and earn money",
                  features: [
                    "Vehicle registration",
                    "Trip management",
                    "Earnings dashboard",
                  ],
                  gradient: "bg-gradient-secondary",
                },
                {
                  role: "Vehicle Owner",
                  description:
                    "Manage your fleet, track revenue, and grow your business",
                  features: [
                    "Fleet management",
                    "Revenue analytics",
                    "Driver assignments",
                  ],
                  gradient: "bg-gradient-success",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="card p-8 hover:scale-105 transition-transform"
                >
                  <div
                    className={`w-16 h-16 rounded-full ${item.gradient} flex items-center justify-center mb-6`}
                  >
                    <span className="text-2xl font-bold text-white">
                      {item.role[0]}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">{item.role}</h3>
                  <p className="text-gray-400 mb-6">{item.description}</p>
                  <ul className="space-y-2">
                    {item.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-300">
                        <span className="text-primary-500 mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-6 bg-gradient-primary">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6 text-white">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Join thousands of users already managing their fleet with
                FleetHub
              </p>
              <Link
                href="/signup"
                className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-4"
              >
                Create Your Account
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 px-6 bg-dark-900 border-t border-dark-800">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-4 gap-8 mb-8">
              <div>
                <h3 className="text-xl font-bold gradient-text mb-4">
                  FleetHub
                </h3>
                <p className="text-gray-400">
                  Modern fleet management solution
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="#" className="hover:text-primary-500">
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-primary-500">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-primary-500">
                      FAQ
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="#" className="hover:text-primary-500">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-primary-500">
                      Contact
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-primary-500">
                      Careers
                    </Link>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-4">Legal</h4>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    <Link href="#" className="hover:text-primary-500">
                      Privacy
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-primary-500">
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="hover:text-primary-500">
                      Security
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-dark-800 pt-8 text-center text-gray-400">
              <p>&copy; 2024 FleetHub. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
