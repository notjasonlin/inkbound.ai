export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between">
          <div>
            <h3 className="text-2xl font-semibold text-gray-700">
              Inkbound.ai
            </h3>
            <p className="text-gray-600">
              Affordable college athletic recruitment software.
            </p>
          </div>
          <div className="flex space-x-6">
            <a href="/policy/privacy" className="text-gray-600 hover:text-babyblue-600">
              Privacy Policy
            </a>
            <a href="/terms-and-conditions" className="text-gray-600 hover:text-babyblue-600">
              Terms and Conditions
            </a>
          </div>
        </div>
        <div className="mt-8 text-center text-gray-600">
          &copy; {new Date().getFullYear()} Inkbound.ai. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
