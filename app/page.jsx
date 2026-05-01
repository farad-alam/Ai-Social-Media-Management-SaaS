import Link from "next/link"
import { auth } from "@clerk/nextjs/server"

// landing paage

export default async function LandingPage() {
  const { userId } = await auth()

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-secondary antialiased overflow-x-hidden selection:bg-primary/30">
<nav className="fixed top-0 z-50 w-full border-b border-white/50 bg-white/80 backdrop-blur-md">
<div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
<div className="flex items-center gap-2">
<div className="flex size-8 items-center justify-center rounded-lg bg-primary text-white">
<span className="material-symbols-outlined" >rocket_launch</span>
</div>
<span className="text-xl font-bold tracking-tight text-gray-900" >OmaticSocial</span>
</div>
<div className="hidden md:flex items-center gap-8">
<a className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#features" >Features</a>
<a className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#how-it-works" >How it works</a>
<a className="text-sm font-medium text-gray-600 hover:text-primary transition-colors" href="#pricing" >Pricing</a>
</div>
<div className="flex items-center gap-4">
{userId ? (
    <Link href="/dashboard">
      <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-dark focus:ring-4 focus:ring-primary/20">
        Dashboard
      </button>
    </Link>
  ) : (
    <>
      <Link href="/signin">
        <span className="hidden text-sm font-medium text-gray-900 sm:block hover:text-primary transition-colors cursor-pointer">Log in</span>
      </Link>
      <Link href="/signup">
        <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white transition hover:bg-primary-dark focus:ring-4 focus:ring-primary/20">
          Start Free Trial
        </button>
      </Link>
    </>
  )}
</div>
</div>
</nav>
<section className="relative pt-32 pb-20 lg:pt-40 lg:pb-24 overflow-hidden">
<div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-background-light to-background-light"></div>
<div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
<div className="mx-auto max-w-4xl flex flex-col items-center">
<div className="mb-6 inline-flex items-center rounded-full border border-primary/20 bg-white px-3 py-1 text-sm font-medium text-primary shadow-sm" >
<span className="flex h-2 w-2 rounded-full bg-primary mr-2"></span>
                Now with AI-powered video captions
            </div>
<h1 className="text-5xl font-black tracking-tight text-gray-900 sm:text-6xl lg:text-7xl" >
                Create once. <br className="hidden sm:block" />
<span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent" >Schedule everywhere.</span> <br />
                Let AI handle the rest.
            </h1>
<p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl" >
                The all-in-one workspace for high-growth creators. Stop the manual madness and start growing with intelligent scheduling and AI content generation.
            </p>
<div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
{userId ? (
    <Link href="/dashboard">
      <button className="h-12 px-8 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary-dark transition shadow-lg shadow-primary/25 w-full sm:w-auto">
        Go to Dashboard
      </button>
    </Link>
  ) : (
    <Link href="/signup">
      <button className="h-12 px-8 rounded-xl bg-primary text-white font-bold text-lg hover:bg-primary-dark transition shadow-lg shadow-primary/25 w-full sm:w-auto">
        Start Free Trial
      </button>
    </Link>
  )}
<button className="h-12 px-8 rounded-xl bg-white border border-gray-200 text-gray-900 font-bold text-lg hover:bg-gray-50 transition w-full sm:w-auto flex items-center justify-center gap-2" >
<span className="material-symbols-outlined" >play_circle</span>
                    View Demo
                </button>
</div>
</div>
<div className="mt-16 sm:mt-20 relative isolate mx-auto max-w-4xl h-80 sm:h-96 w-full flex justify-center items-center">
<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/20 blur-[100px] rounded-full -z-10"></div>
<div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 sm:w-72 bg-white rounded-2xl shadow-xl border border-gray-100 p-4 transform rotate-[-3deg] hover:rotate-0 transition-all duration-500 z-10">
<div className="flex items-center gap-3 mb-3">
<div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 p-0.5">
<div className="w-full h-full bg-white rounded-full p-0.5">
<div className="w-full h-full bg-gray-200 rounded-full"></div>
</div>
</div>
<div className="flex-1">
<div className="h-2.5 w-24 bg-gray-200 rounded mb-1"></div>
<div className="h-2 w-16 bg-gray-100 rounded"></div>
</div>
<span className="material-symbols-outlined text-gray-400 text-sm" >more_horiz</span>
</div>
<div className="aspect-[4/5] w-full bg-gray-100 rounded-lg mb-3 overflow-hidden relative">
<div className="absolute inset-0 flex items-center justify-center text-gray-300">
<span className="material-symbols-outlined text-4xl" >image</span>
</div>
</div>
<div className="space-y-2">
<div className="flex gap-3">
<span className="material-symbols-outlined text-xl text-gray-800" >favorite</span>
<span className="material-symbols-outlined text-xl text-gray-800" >chat_bubble</span>
<span className="material-symbols-outlined text-xl text-gray-800" >send</span>
</div>
<div className="h-2 w-full bg-gray-100 rounded"></div>
<div className="h-2 w-3/4 bg-gray-100 rounded"></div>
</div>
</div>
<div className="absolute top-24 right-4 sm:right-12 md:right-24 w-60 bg-white/95 backdrop-blur-sm rounded-xl shadow-soft border border-purple-100 p-4 transform rotate-[4deg] hover:rotate-0 transition-all duration-500 z-20 animate-bounce" style={{ animationDuration: '4s' }}>
<div className="flex items-center gap-2 mb-3">
<div className="bg-primary/10 p-1.5 rounded-lg text-primary">
<span className="material-symbols-outlined text-sm" >auto_awesome</span>
</div>
<span className="text-xs font-bold text-gray-800 uppercase tracking-wide" >AI Suggestion</span>
</div>
<div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
<p className="text-xs text-gray-600 leading-relaxed" >
                        "Stop scrolling! 🛑 Here's the secret to doubling your engagement in 2024..."
                    </p>
</div>
<div className="flex gap-2 mt-3">
<button className="flex-1 py-1.5 bg-primary text-white text-[10px] font-bold rounded-lg hover:bg-primary-dark" >Use This</button>
<button className="px-2 py-1.5 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200" >
<span className="material-symbols-outlined text-sm" >refresh</span>
</button>
</div>
</div>
<div className="absolute bottom-4 sm:bottom-12 left-4 sm:left-12 md:left-24 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-3 transform rotate-[-2deg] hover:scale-105 transition-all duration-300 z-30">
<div className="flex justify-between items-center mb-3 px-1">
<span className="text-xs font-bold text-gray-500" >Scheduled</span>
<span className="text-[10px] font-medium bg-green-100 text-green-700 px-2 py-0.5 rounded-full" >4 Posts Ready</span>
</div>
<div className="flex gap-2 justify-between">
<div className="flex flex-col items-center gap-1">
<span className="text-[10px] text-gray-400 font-medium" >Mon</span>
<div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 border border-pink-200">
<span className="material-symbols-outlined text-sm" >image</span>
</div>
</div>
<div className="flex flex-col items-center gap-1">
<span className="text-[10px] text-gray-400 font-medium" >Tue</span>
<div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
<span className="material-symbols-outlined text-sm" >videocam</span>
</div>
</div>
<div className="flex flex-col items-center gap-1">
<span className="text-[10px] text-gray-400 font-medium" >Wed</span>
<div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-300 border border-dashed border-gray-300">
<span className="material-symbols-outlined text-sm" >add</span>
</div>
</div>
<div className="flex flex-col items-center gap-1">
<span className="text-[10px] text-gray-400 font-medium" >Thu</span>
<div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 border border-purple-200">
<span className="material-symbols-outlined text-sm" >article</span>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
<section className="border-y border-gray-200 bg-white py-12">
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
<p className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-8" >Trusted by 10,000+ creators and teams</p>
<div className="grid grid-cols-2 gap-8 md:grid-cols-5 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
<div className="flex justify-center items-center gap-2 text-xl font-bold font-display" ><span className="material-symbols-outlined" >verified</span> Acme Corp</div>
<div className="flex justify-center items-center gap-2 text-xl font-bold font-display" ><span className="material-symbols-outlined" >bolt</span> EnergyInc</div>
<div className="flex justify-center items-center gap-2 text-xl font-bold font-display" ><span className="material-symbols-outlined" >landscape</span> Summit</div>
<div className="flex justify-center items-center gap-2 text-xl font-bold font-display" ><span className="material-symbols-outlined" >waves</span> FlowState</div>
<div className="flex justify-center items-center gap-2 text-xl font-bold font-display" ><span className="material-symbols-outlined" >language</span> Global</div>
</div>
</div>
</section>
<section className="py-24 bg-background-light">
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
<div className="text-center max-w-2xl mx-auto mb-16">
<h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl" >Stop the manual madness</h2>
<p className="mt-4 text-lg text-gray-600" >Eliminate the stress of manual posting and focus on creating great content.</p>
</div>
<div className="grid grid-cols-1 gap-8 md:grid-cols-3">
<div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-8 transition hover:shadow-lg hover:border-primary/30 group">
<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600 group-hover:bg-red-100 transition">
<span className="material-symbols-outlined" >content_copy</span>
</div>
<div>
<h3 className="text-lg font-bold text-gray-900" >Copy-paste fatigue</h3>
<p className="mt-2 text-sm text-gray-600 leading-relaxed" >Stop wasting hours manually copying content across 5 different platforms and reformatting it every time.</p>
</div>
</div>
<div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-8 transition hover:shadow-lg hover:border-primary/30 group">
<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition">
<span className="material-symbols-outlined" >tag</span>
</div>
<div>
<h3 className="text-lg font-bold text-gray-900" >Hashtag guessing</h3>
<p className="mt-2 text-sm text-gray-600 leading-relaxed" >Stop guessing which tags work. Let our AI analyze trends and find the perfect tags for maximum reach.</p>
</div>
</div>
<div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-8 transition hover:shadow-lg hover:border-primary/30 group">
<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition">
<span className="material-symbols-outlined" >calendar_month</span>
</div>
<div>
<h3 className="text-lg font-bold text-gray-900" >Inconsistent posting</h3>
<p className="mt-2 text-sm text-gray-600 leading-relaxed" >Maintain a consistent schedule without burnout. Queue up weeks of content in a single afternoon.</p>
</div>
</div>
</div>
</div>
</section>
<section className="py-24 bg-white overflow-hidden" id="features">
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
<div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
<div className="max-w-xl">
<div className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6" >
<span className="material-symbols-outlined text-[18px] mr-1" >auto_awesome</span>
                    AI Content Generator
                </div>
<h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl mb-6" >Never run out of ideas again</h2>
<p className="text-lg text-gray-600 mb-8" >
                    Our advanced AI understands your brand voice. It generates engaging hooks, writes complete captions, and even suggests image ideas instantly.
                </p>
<ul className="space-y-4">
<li className="flex items-start gap-3" >
<span className="material-symbols-outlined text-green-500 mt-1" >check_circle</span>
<span className="text-gray-700 font-medium" >Generate 10 viral hooks in seconds</span>
</li>
<li className="flex items-start gap-3" >
<span className="material-symbols-outlined text-green-500 mt-1" >check_circle</span>
<span className="text-gray-700 font-medium" >Auto-adjust tone for LinkedIn vs TikTok</span>
</li>
<li className="flex items-start gap-3" >
<span className="material-symbols-outlined text-green-500 mt-1" >check_circle</span>
<span className="text-gray-700 font-medium" >Repurpose long-form content automatically</span>
</li>
</ul>
<div className="mt-10">
<button className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all" >
                        Try the generator
                        <span className="material-symbols-outlined" >arrow_forward</span>
</button>
</div>
</div>
<div className="relative">
<div className="absolute -inset-4 rounded-full bg-gradient-to-r from-primary to-blue-400 opacity-20 blur-3xl"></div>
<div className="relative rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 shadow-2xl">
<div className="flex flex-col gap-4">
<div className="flex items-end justify-end gap-2">
<div className="rounded-2xl rounded-tr-sm bg-primary px-4 py-3 text-white">
<p className="text-sm" >Write a LinkedIn post about remote work productivity.</p>
</div>
<div className="h-8 w-8 rounded-full bg-gray-600 overflow-hidden shrink-0">
<img alt="User Avatar" className="h-full w-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDYmwJ6IAkFNnpgzs_tL7r9RaabwPsSJY_VpCAw6RoE18rIU4KGhvCV0PUuB7BlzQR-1F_5cLiUd99T96VTTdfaJOk4M2D8OnoSYzOsARCSJFIOUcnE4mACnVVPSTEarUiqzfQPZ796tQxZ2mBsOyhcP2m_BxsEfPmbxrfC61HOocwVVZGsxU9rxnwpAeNjDSmd1lDYVF6L8a-O_w-LNrXBEOGj8qpCMSYll4JmK8yX3l1YRQK84_Y6sput-uwQxSrnQWTd6aLC_RTv"  />
</div>
</div>
<div className="flex items-start gap-2 mt-4">
<div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-primary text-white">
<span className="material-symbols-outlined text-sm" >smart_toy</span>
</div>
<div className="flex flex-col gap-2">
<div className="rounded-2xl rounded-tl-sm bg-gray-700/50 px-4 py-3 text-gray-100 shadow-inner">
<p className="text-sm font-medium text-gray-300 mb-2" >Option 1 (Professional)</p>
<p className="text-sm leading-relaxed" >
                                        Remote work isn't just about working from home—it's about working effectively from anywhere. 🌍<br /><br />
                                        Here are 3 productivity hacks I've learned after 2 years of WFH...
                                    </p>
</div>
<div className="rounded-2xl rounded-tl-sm bg-gray-700/50 px-4 py-3 text-gray-100 shadow-inner">
<p className="text-sm font-medium text-gray-300 mb-2" >Option 2 (Controversial)</p>
<p className="text-sm leading-relaxed" >
                                        Unpopular opinion: Offices are productivity killers. 🚫<br /><br />
                                        Distractions, commute times, useless meetings. Is the hybrid model actually the worst of both worlds? Let's discuss. 👇
                                    </p>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</div>
</section>
<section className="py-24 bg-background-light">
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
<div className="text-center mb-16">
<h2 className="text-3xl font-black tracking-tight text-gray-900" >Everything you need to grow</h2>
</div>
<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
<div className="group relative overflow-hidden rounded-3xl bg-white border border-gray-200 p-8 hover:border-primary/30 transition shadow-sm hover:shadow-soft">
<div className="flex items-center justify-between mb-8">
<div className="h-12 w-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
<span className="material-symbols-outlined" >schedule</span>
</div>
</div>
<h3 className="text-2xl font-bold text-gray-900 mb-3" >Multi-platform Scheduling</h3>
<p className="text-gray-600 mb-8 max-w-md" >Connect LinkedIn, Twitter, Instagram, and TikTok. Schedule a month of content in one sitting and visualize it on a unified drag-and-drop calendar.</p>
<div className="relative h-48 w-full bg-gray-50 rounded-xl border border-gray-100 overflow-hidden">
<div className="absolute top-4 left-4 right-4 bottom-0 bg-white rounded-t-lg shadow-sm p-4 grid grid-cols-7 gap-2">
<div className="col-span-1 h-12 bg-purple-50 rounded-md border border-purple-100"></div>
<div className="col-span-1 h-12 bg-blue-50 rounded-md border border-blue-100"></div>
<div className="col-span-1 h-12 bg-green-50 rounded-md border border-green-100"></div>
<div className="col-span-1 h-12 bg-gray-50 rounded-md"></div>
<div className="col-span-1 h-12 bg-purple-50 rounded-md border border-purple-100"></div>
</div>
</div>
</div>
<div className="group relative overflow-hidden rounded-3xl bg-white border border-gray-200 p-8 hover:border-primary/30 transition shadow-sm hover:shadow-soft">
<div className="flex items-center justify-between mb-8">
<div className="h-12 w-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center">
<span className="material-symbols-outlined" >recycling</span>
</div>
</div>
<h3 className="text-2xl font-bold text-gray-900 mb-3" >Smart Repurposing</h3>
<p className="text-gray-600 mb-8 max-w-md" >Turn that winning Twitter thread into a carousel for LinkedIn and Instagram automatically. Maximize the lifespan of your best ideas.</p>
<div className="relative h-48 w-full bg-gray-50 rounded-xl border border-gray-100 overflow-hidden flex items-center justify-center gap-4">
<div className="w-24 h-32 bg-white shadow-md rounded-lg p-2 border border-gray-200 rotate-[-6deg] z-10">
<div className="w-full h-2 bg-gray-200 rounded mb-2"></div>
<div className="w-2/3 h-2 bg-gray-200 rounded mb-4"></div>
<div className="w-full h-16 bg-blue-50 rounded"></div>
</div>
<span className="material-symbols-outlined text-gray-400" >arrow_right_alt</span>
<div className="w-24 h-32 bg-white shadow-md rounded-lg p-2 border border-gray-200 rotate-[6deg] z-10">
<div className="w-full h-20 bg-purple-50 rounded mb-2"></div>
<div className="w-full h-2 bg-gray-200 rounded"></div>
</div>
</div>
</div>
</div>
</div>
</section>
<section className="py-24 bg-white" id="pricing">
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
<div className="text-center max-w-2xl mx-auto mb-16">
<h2 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl" >Simple, transparent pricing</h2>
<p className="mt-4 text-lg text-gray-600" >Start for free, scale as you grow. No credit card required.</p>
</div>
<div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:gap-12 items-start">
<div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
<h3 className="text-lg font-semibold text-gray-900" >Free</h3>
<p className="mt-2 text-sm text-gray-500" >For hobbyists just starting out.</p>
<div className="my-6">
<span className="text-4xl font-bold text-gray-900" >$0</span>
<span className="text-gray-500" >/month</span>
</div>
<button className="w-full rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-900 hover:bg-gray-200 transition" >Get Started</button>
<ul className="mt-8 space-y-4 text-sm text-gray-600">
<li className="flex items-center gap-3" ><span className="material-symbols-outlined text-green-500 text-lg" >check</span> 3 Social Accounts</li>
<li className="flex items-center gap-3" ><span className="material-symbols-outlined text-green-500 text-lg" >check</span> 10 Scheduled Posts</li>
<li className="flex items-center gap-3" ><span className="material-symbols-outlined text-green-500 text-lg" >check</span> Basic Analytics</li>
</ul>
</div>
<div className="relative rounded-3xl border-2 border-primary bg-white p-8 shadow-2xl shadow-primary/10 scale-105 z-10">
<div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-bold text-white uppercase tracking-wide" >Most Popular</div>
<h3 className="text-lg font-semibold text-gray-900" >Creator</h3>
<p className="mt-2 text-sm text-gray-500" >For growing personal brands.</p>
<div className="my-6">
<span className="text-4xl font-bold text-gray-900" >$29</span>
<span className="text-gray-500" >/month</span>
</div>
<button className="w-full rounded-xl bg-primary py-3 text-sm font-bold text-white hover:bg-primary-dark transition shadow-lg shadow-primary/20" >Start 14-Day Free Trial</button>
<ul className="mt-8 space-y-4 text-sm text-gray-600">
<li className="flex items-center gap-3" ><span className="material-symbols-outlined text-green-500 text-lg" >check</span> 10 Social Accounts</li>
<li className="flex items-center gap-3" ><span className="material-symbols-outlined text-green-500 text-lg" >check</span> Unlimited Scheduling</li>
<li className="flex items-center gap-3" ><span className="material-symbols-outlined text-green-500 text-lg" >check</span> <span className="font-bold text-gray-900" >AI Content Generator</span></li>
<li className="flex items-center gap-3" ><span className="material-symbols-outlined text-green-500 text-lg" >check</span> Advanced Analytics</li>
</ul>
</div>
<div className="rounded-3xl border border-gray-200 bg-white p-8 shadow-sm">
<h3 className="text-lg font-semibold text-gray-900" >Pro Team</h3>
<p className="mt-2 text-sm text-gray-500" >For agencies and small teams.</p>
<div className="my-6">
<span className="text-4xl font-bold text-gray-900" >$79</span>
<span className="text-gray-500" >/month</span>
</div>
<button className="w-full rounded-xl bg-gray-100 py-3 text-sm font-bold text-gray-900 hover:bg-gray-200 transition" >Contact Sales</button>
<ul className="mt-8 space-y-4 text-sm text-gray-600">
<li className="flex items-center gap-3" ><span className="material-symbols-outlined text-green-500 text-lg" >check</span> Unlimited Accounts</li>
<li className="flex items-center gap-3" ><span className="material-symbols-outlined text-green-500 text-lg" >check</span> 5 Team Members</li>
<li className="flex items-center gap-3" ><span className="material-symbols-outlined text-green-500 text-lg" >check</span> Approval Workflows</li>
<li className="flex items-center gap-3" ><span className="material-symbols-outlined text-green-500 text-lg" >check</span> Dedicated Support</li>
</ul>
</div>
</div>
</div>
</section>
<section className="py-20 px-4">
<div className="mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-secondary relative">
<div className="absolute top-0 right-0 -mr-20 -mt-20 h-[500px] w-[500px] rounded-full bg-primary/20 blur-3xl"></div>
<div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[500px] w-[500px] rounded-full bg-purple-500/20 blur-3xl"></div>
<div className="relative z-10 flex flex-col items-center justify-center px-6 py-16 text-center sm:px-12 sm:py-24">
<h2 className="text-3xl font-black tracking-tight text-white sm:text-5xl mb-6" >Ready to go viral?</h2>
<p className="mx-auto max-w-2xl text-lg text-gray-300 mb-10" >
                Join 10,000+ creators who are saving 20 hours a week with OmaticSocial. 
                No credit card required for trial.
            </p>
<div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
{userId ? (
    <Link href="/dashboard">
      <button className="h-14 px-8 rounded-2xl bg-white text-secondary font-bold text-lg hover:bg-gray-100 transition shadow-xl w-full sm:w-auto">
        Go to Dashboard
      </button>
    </Link>
  ) : (
    <Link href="/signup">
      <button className="h-14 px-8 rounded-2xl bg-white text-secondary font-bold text-lg hover:bg-gray-100 transition shadow-xl w-full sm:w-auto">
        Start Free Trial Today
      </button>
    </Link>
  )}
</div>
<p className="mt-6 text-sm text-gray-400" >14-day free trial. Cancel anytime.</p>
</div>
</div>
</section>
<footer className="bg-background-light border-t border-gray-200">
<div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
<div className="flex flex-col md:flex-row justify-between items-center gap-6">
<div className="flex items-center gap-2">
<div className="flex size-6 items-center justify-center rounded bg-primary text-white">
<span className="material-symbols-outlined text-sm" >rocket_launch</span>
</div>
<span className="text-lg font-bold text-gray-900" >OmaticSocial</span>
</div>
<div className="flex gap-8">
<a className="text-sm text-gray-500 hover:text-primary" href="#" >Privacy</a>
<a className="text-sm text-gray-500 hover:text-primary" href="#" >Terms</a>
<a className="text-sm text-gray-500 hover:text-primary" href="#" >Twitter</a>
<a className="text-sm text-gray-500 hover:text-primary" href="#" >Instagram</a>
</div>
<p className="text-sm text-gray-400" >© 2023 OmaticSocial Inc.</p>
</div>
</div>
</footer>

    </div>
  )
}
