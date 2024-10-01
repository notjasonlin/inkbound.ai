import { motion } from 'framer-motion';

const About = () => {
  return (
    <section id="about-us" className="py-16 bg-gradient-to-r from-blue-50 to-babyblue-100 w-full">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <h2 className="text-4xl font-bold text-babyblue-700 text-center mb-10">About The Founders</h2>
        {/* Text Content */}
        <motion.div
          className="text-lg md:text-xl text-gray-700 leading-relaxed space-y-6 text-left"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <p>
            The idea of Inkbound.ai was born from our own experience navigating the competitive landscape of college athletics recruitment. Just a few years ago, we were in your shoes—looking for a way to stand out, connect with the right coaches, and make the most of our athletic potential.
          </p>
          <p>
            Like many student-athletes, we found that most of the resources out there were either way too expensive or didn't offer the personalized guidance we needed. We often wished there was something affordable, simple, and actually helpful to make the recruitment process easier.
          </p>
          <p>
            That's why we created Inkbound.ai—to solve the problems we faced. Our AI-driven platform helps athletes like you get noticed without breaking the bank. Whether you're aiming for D1 athletics or balancing academics and sports at a D3 school, we're here to help you connect with the right opportunities.
          </p>
          <p>
            Over the past year, we've worked tirelessly to build a platform that meets the real needs of student-athletes. By bridging the gap between athletes and coaches with modern tools and data-driven insights, we believe the future of recruitment should be accessible to all.
          </p>
          <p>
            We created Inkbound.ai because we knew there had to be a better way. Now, we're here to make sure the process is smoother, more transparent, and more affordable for you.
          </p>
        </motion.div>

        {/* Signatures */}
        <motion.div
          className="mt-8 text-left font-semibold text-blue-700"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <p>- Elan, Gabriel, Jason, & John</p>
        </motion.div>
      </div>
    </section>
  );
};

export default About;
