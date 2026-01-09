import { Eye, FolderOpen, Clock, Shield, Check, Sparkles, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"

function LandingPage() {
  const navigate = useNavigate()
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg shadow-blue-500/30">
                <FolderOpen className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">CloudVault</span>
            </div>
            <nav className=" items-center gap- md:flex">
              <button onClick={()=> {navigate("/register")}} className="px-4 py-2 border-2 border-blue-600 rounded text-sm font-medium hover:bg-blue-600 hover:text-white transition-colors">
                Register
              </button>
              <button onClick={()=> {navigate("/login")}} className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900">
                Login
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8 lg:py-28">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 shadow-sm">
            <Sparkles className="h-4 w-4" />
            <span>Now in early access</span>
          </div>
          <h1 className="mt-8 text-balance text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl">
            See exactly what you have,
            <br />
            <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">
              and when it changed
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-slate-600 sm:text-xl">
            Your files are secure and accessible from anywhere. No confusion about versions, no digging through chaos.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <button onClick={()=> {navigate("/register")}}  className="group inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5">
              Create free account
              <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
            </button>
            <button className="inline-flex items-center rounded-xl border-2 border-slate-300 bg-white px-8 py-4 text-base font-semibold text-slate-700 transition-all hover:border-slate-400 hover:bg-slate-50">
              See how it works
            </button>
          </div>
        </div>
      </section>

      {/* Pain Point Section */}
      <section className="border-y border-slate-200 bg-gradient-to-b from-slate-100/50 to-slate-50 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-balance text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
              You shouldn't have to wonder
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
              "When did I last update this file?" "Which folder was that in?" "Is this the latest version?"
            </p>
          </div>

          <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Card 1 */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 shadow-lg shadow-orange-500/30 transition-transform duration-300 group-hover:scale-110">
                  <Clock className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">Lost track of changes</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  Not knowing when files were modified creates uncertainty and wasted time.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-400 to-purple-500 shadow-lg shadow-purple-500/30 transition-transform duration-300 group-hover:scale-110">
                  <FolderOpen className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">Disorganized storage</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  Files scattered everywhere. No clear structure. Finding anything takes too long.
                </p>
              </div>
            </div>

            {/* Card 3 */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-400 to-blue-500 shadow-lg shadow-blue-500/30 transition-transform duration-300 group-hover:scale-110">
                  <Eye className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">No visibility</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  You can't see what's happening with your files at a glance. Everything feels opaque.
                </p>
              </div>
            </div>

            {/* Card 4 - NEW */}
            <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1">
              <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-rose-400 to-rose-500 shadow-lg shadow-rose-500/30 transition-transform duration-300 group-hover:scale-110">
                  <Search className="h-7 w-7 text-white" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-slate-900">Endless searching</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                  Spending minutes hunting for a file you know exists somewhere. Frustrating every time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Solution Section */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-balance text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
              A clearer way to store files
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
              ClearVault shows you exactly when each file was last modified, keeps your folders organized, and gives you
              simple access from any device.
            </p>
          </div>

          <div className="mt-16 space-y-6">
            <div className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/30 transition-transform duration-300 group-hover:scale-105">
                  <Clock className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">Last modified, always visible</h3>
                  <p className="mt-3 leading-relaxed text-slate-600">
                    Every file shows when it was last changed. No more guessing. You know if you're looking at the
                    current version.
                  </p>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/30 transition-transform duration-300 group-hover:scale-105">
                  <FolderOpen className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">Organized folders that make sense</h3>
                  <p className="mt-3 leading-relaxed text-slate-600">
                    Create folders that reflect how you think. Name them clearly. Find what you need without searching
                    through everything.
                  </p>
                </div>
              </div>
            </div>

            <div className="group rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all hover:border-blue-200 hover:shadow-2xl hover:shadow-blue-500/10">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-xl shadow-blue-500/30 transition-transform duration-300 group-hover:scale-105">
                  <Eye className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900">Access from anywhere</h3>
                  <p className="mt-3 leading-relaxed text-slate-600">
                    Your files are available on any device. Upload from your phone, access from your laptop. It just
                    works.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section
        id="security"
        className="border-y border-slate-200 bg-gradient-to-b from-blue-50 via-blue-50/80 to-white py-20 sm:py-24"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-2xl shadow-blue-500/40">
              <Shield className="h-10 w-10 text-white" />
            </div>
            <h2 className="mt-6 text-balance text-3xl font-bold text-slate-900 sm:text-4xl lg:text-5xl">
              Security you can trust
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-base leading-relaxed text-slate-600 sm:text-lg">
              Your files are encrypted and protected. We built this with security as the foundation, not an
              afterthought.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col items-center rounded-2xl border border-blue-100 bg-white p-8 text-center shadow-sm transition-all hover:shadow-lg">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 ring-4 ring-blue-50">
                <Check className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">Secure login</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                Your account is protected with modern authentication.
              </p>
            </div>

            <div className="flex flex-col items-center rounded-2xl border border-blue-100 bg-white p-8 text-center shadow-sm transition-all hover:shadow-lg">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 ring-4 ring-blue-50">
                <Check className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">Encrypted storage</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                Files are encrypted at rest and in transit.
              </p>
            </div>

            <div className="flex flex-col items-center rounded-2xl border border-blue-100 bg-white p-8 text-center shadow-sm transition-all hover:shadow-lg">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-100 ring-4 ring-blue-50">
                <Check className="h-7 w-7 text-blue-600" />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">Access control</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600">
                You control who can see your files. Nobody else.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-balance text-4xl font-bold text-slate-900 sm:text-5xl">
            Start organizing your files today
          </h2>
          <p className="mt-5 text-pretty text-lg leading-relaxed text-slate-600">
            Free to start. No credit card needed.
          </p>
          <div className="mt-10">
            <button onClick={()=> {navigate("/register")}} className="group inline-flex items-center rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 px-10 py-4 text-lg font-semibold text-white shadow-xl shadow-blue-500/30 transition-all hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5">
              Create free account
              <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
            </button>
          </div>
        </div>
      </section>

      {/* Early Access Note */}
      <section className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm leading-relaxed text-slate-600">
            ClearVault is in early access. We're actively improving based on feedback from users like you. If something
            doesn't work as expected, we want to hear about it.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
                <FolderOpen className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-slate-600">ClearVault</span>
            </div>
            <div className="flex gap-8">
              <a href="#privacy" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
                Privacy
              </a>
              <a href="#terms" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
                Terms
              </a>
              <a href="#contact" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
