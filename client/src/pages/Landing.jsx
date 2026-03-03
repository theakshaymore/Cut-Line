import { Link } from "react-router-dom";
import { Armchair, Scissors, Store, UsersRound } from "lucide-react";

const Landing = () => {
  return (
    <main className="max-w-6xl mx-auto px-4 py-12">
      <section className="rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-gradient-to-r from-teal-600 to-cyan-700 text-white">
        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-5">
          <div className="p-8 lg:p-10">
            <p className="uppercase tracking-[0.2em] text-xs text-cyan-100">
              Smart Queueing
            </p>
            <h1 className="text-4xl md:text-5xl font-black mt-2">NextCut</h1>
            <p className="mt-3 text-cyan-50 max-w-xl">
              A live salon queue platform for customers and barbers. Track wait
              times, manage chairs, and keep shop flow smooth.
            </p>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1">
                <Store size={14} /> Nearby salons
              </span>
              <span className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1">
                <UsersRound size={14} /> Live queue position
              </span>
              <span className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1">
                <Armchair size={14} /> Chair control
              </span>
            </div>
          </div>
          <img
            src="https://images.pexels.com/photos/853427/pexels-photo-853427.jpeg"
            alt="Salon"
            className="h-full min-h-[240px] object-cover"
          />
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <UsersRound size={18} /> I&apos;m a Customer
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Find salons, join queues remotely, and track your turn in real-time.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              to="/customer/login"
              className="px-4 py-2 rounded bg-ink text-white"
            >
              Login
            </Link>
            <Link
              to="/customer/register"
              className="px-4 py-2 rounded border border-slate-300 dark:border-slate-600"
            >
              Register
            </Link>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Scissors size={18} /> I&apos;m a Barber
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
            Manage chairs, assign customers, and run queue flow from one
            dashboard.
          </p>
          <div className="mt-4 flex gap-3">
            <Link
              to="/barber/login"
              className="px-4 py-2 rounded bg-ink text-white"
            >
              Login
            </Link>
            <Link
              to="/barber/register"
              className="px-4 py-2 rounded border border-slate-300 dark:border-slate-600"
            >
              Register
            </Link>
          </div>
          <div className="mt-5 rounded bg-amber-50 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-700 p-3 text-sm">
            Barber registration is invite-only. Contact admin to receive your
            secure link.
          </div>
        </div>
      </div>
    </main>
  );
};

export default Landing;
