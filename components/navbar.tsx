import { useRouter } from 'next/navigation';
import LoginButton from '@/components/LoginLogoutButton'; // Import the LoginButton component

export default function Navbar() {
  const router = useRouter();

  // Custom smooth scrolling function
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const targetPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 1000; // 1000ms = 1 second (adjust this for slower scrolling)
      let start: number | null = null;

      const smoothScroll = (timestamp: number) => {
        if (!start) start = timestamp;
        const progress = timestamp - start;
        const easeInOutQuad = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // easing function
        const percent = easeInOutQuad(Math.min(progress / duration, 1));
        window.scrollTo(0, startPosition + distance * percent);
        if (progress < duration) {
          window.requestAnimationFrame(smoothScroll);
        }
      };

      window.requestAnimationFrame(smoothScroll);
    }
  };

  return (
    <nav className="w-full bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <a href="/" className="text-2xl font-bold text-babyblue-600">
              Inkbound.ai
            </a>
          </div>
          <div className="flex items-center space-x-6">
            <button
              className="text-gray-600 hover:text-babyblue-600"
              onClick={() => scrollToSection('features')}
            >
              Features
            </button>
            <button
              className="text-gray-600 hover:text-babyblue-600"
              onClick={() => scrollToSection('pricing')}
            >
              Pricing
            </button>
            <button
              className="text-gray-600 hover:text-babyblue-600"
              onClick={() => scrollToSection('faq')}
            >
              FAQ
            </button>
            <button
              className="text-gray-600 hover:text-babyblue-600"
              onClick={() => scrollToSection('about-us')}
            >
              About Us
            </button>
          </div>
          <div className="flex items-center space-x-4">
            {/* Try Now Button */}
            <LoginButton label="Try Now" />  {/* Same functionality as login, but labeled "Try Now" */}

            {/* Login Button */}
            <LoginButton label="Login" />
          </div>
        </div>
      </div>
    </nav>
  );
}