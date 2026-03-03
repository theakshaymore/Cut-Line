import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <main className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-black text-ink">NextCut</h1>
      <p className="text-slate-600 dark:text-slate-300 mt-2">Digital salon queue management in real-time.</p>
      <div className="grid md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold">I&apos;m a Customer</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Find salons, join queues remotely, and track your turn.</p>
          <div className="mt-4 flex gap-3">
            <Link to="/customer/login" className="px-4 py-2 rounded bg-ink text-white">Login</Link>
            <Link to="/customer/register" className="px-4 py-2 rounded border border-slate-300 dark:border-slate-600">Register</Link>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-bold">I&apos;m a Barber</h2>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">Manage chairs and control queue flow live.</p>
          <div className="mt-4 flex gap-3">
            <Link to="/barber/login" className="px-4 py-2 rounded bg-ink text-white">Login</Link>
            <Link to="/barber/register" className="px-4 py-2 rounded border border-slate-300 dark:border-slate-600">Register</Link>
          </div>
          <div className="mt-5 rounded bg-amber-50 border border-amber-200 dark:bg-amber-900/30 dark:border-amber-700 p-3 text-sm">
            Barber registration is invite-only. Contact admin to receive your secure link.
          </div>
        </div>
      </div>
    </main>
  );
};

export default Landing;
