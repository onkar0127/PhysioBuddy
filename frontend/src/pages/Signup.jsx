import doctorGif from "../assets/doc.gif"; // update path correctly

export default function Signup() {
  return (
    <div className="min-h-screen w-full lg:flex bg-gradient-to-r from-cyan-100 via-cyan-200 to-blue-100">
      {/* Left Side */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center px-10 bg-cyan-600 text-white">
        <h1 className="text-5xl font-extrabold drop-shadow-lg mb-6">
          Exercise Instructor
        </h1>
        <img src={doctorGif} alt="Doctor animation" className="w-96 h-auto" />
      </div>

      {/* Right Side with Glassy Signup Form */}
      <div className="flex flex-col justify-center items-center px-6 py-12 lg:px-8 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="backdrop-blur-xl bg-white/30 border border-white/20 rounded-xl shadow-xl hover:shadow-2xl transition p-8">
            <div className="flex justify-center">
              <img
                alt="Health Logo"
                src="https://www.svgrepo.com/show/331649/medical-cross.svg"
                className="h-10 w-auto"
              />
            </div>
            <h2 className="mt-6 text-center text-2xl font-bold text-cyan-900">
              Create your account
            </h2>

            <form action="#" method="POST" className="space-y-6 mt-8">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-cyan-900"
                >
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-2 block w-full rounded-md bg-white/50 text-cyan-900 px-3 py-2 placeholder:text-cyan-400 border border-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-cyan-900"
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="mt-2 block w-full rounded-md bg-white/50 text-cyan-900 px-3 py-2 placeholder:text-cyan-400 border border-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                aria-label="Create account"
                className="w-full rounded-md bg-cyan-600 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
              >
                Sign up
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-cyan-800">
              Already a member?{" "}
              <a
                href="#"
                className="font-semibold text-cyan-700 hover:text-cyan-900"
              >
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
