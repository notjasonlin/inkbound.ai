export default function Footer() {
    return (
      <footer className="w-full bg-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between">
            <div>
              <h3 className="text-2xl font-semibold text-gray-700">
                Commit.io
              </h3>
              <p className="text-gray-600">
                Affordable college athletic recruitment software.
              </p>
            </div>
            <div className="flex space-x-6">
              <a href="https://www.twitter.com" className="text-gray-600 hover:text-babyblue-600">
                Twitter
              </a>
              <a href="https://www.instagram.com" className="text-gray-600 hover:text-babyblue-600">
                Instagram
              </a>
              <a href="https://www.linkedin.com" className="text-gray-600 hover:text-babyblue-600">
                LinkedIn
              </a>
            </div>
          </div>
          <div className="mt-8 text-center text-gray-600">
            &copy; {new Date().getFullYear()} Commit.io. All rights reserved.
          </div>
        </div>
      </footer>
    );
  }
  