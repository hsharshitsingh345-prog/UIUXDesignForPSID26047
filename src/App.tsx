import { useState } from 'react'

const NAV_ITEMS = ['Dashboard', 'Programs', 'Community', 'Resources', 'Profile']

const upcomingActions = [
  { time: '10:00 AM', label: 'Mental Health Workshop', tag: 'Session', tagColor: '#6E84A0' },
  { time: '12:30 PM', label: 'Nutrition Counselling', tag: 'Consultation', tagColor: '#C66F5B' },
  { time: '3:00 PM', label: 'Peer Support Circle', tag: 'Community', tagColor: '#8A7F73' },
  { time: 'Tomorrow', label: 'Digital Literacy Module 3', tag: 'Learning', tagColor: '#6E84A0' },
  { time: 'Fri, 13 Sep', label: 'Community Health Screening', tag: 'Event', tagColor: '#C66F5B' },
]

const statsCards = [
  { label: 'Sessions Attended', value: '14', sub: 'This month', delta: '+3 from last month' },
  { label: 'Learning Hours', value: '28.5', sub: 'Modules completed: 6', delta: '+4.5 hrs this week' },
  { label: 'Community Points', value: '340', sub: 'Rank: Contributor', delta: '+60 this week' },
  { label: 'Wellness Score', value: '82 / 100', sub: 'Last assessed 2 Sep', delta: '+7 pts since Aug' },
]

const programs = [
  {
    title: 'Mental Health First Aid',
    category: 'Health',
    duration: '6 weeks',
    enrolled: 1240,
    nextSession: 'Today, 10:00 AM',
    progress: 67,
    img: 'photo-1576091160550-2173dba999ef',
  },
  {
    title: 'Digital Skills for Employment',
    category: 'Education',
    duration: '8 weeks',
    enrolled: 3412,
    nextSession: 'Tomorrow, 2:00 PM',
    progress: 38,
    img: 'photo-1522202176988-66273c2fd55f',
  },
  {
    title: 'Women Safety & Legal Awareness',
    category: 'Social',
    duration: '4 weeks',
    enrolled: 872,
    nextSession: 'Wed, 11 Sep',
    progress: 0,
    img: 'photo-1573496359142-b8d87734a5a2',
  },
]

const communityPosts = [
  {
    author: 'Priya Sharma',
    avatar: 'PS',
    avatarColor: '#6E84A0',
    time: '2 hrs ago',
    text: 'Completed the Digital Literacy Module 2 today — the section on online safety was incredibly practical. Highly recommend to everyone in the program.',
    likes: 18,
    replies: 4,
  },
  {
    author: 'Arjun Mehta',
    avatar: 'AM',
    avatarColor: '#C66F5B',
    time: '5 hrs ago',
    text: 'The peer support circle yesterday helped me open up about study stress. The facilitators created such a safe space. Thank you all.',
    likes: 31,
    replies: 9,
  },
  {
    author: 'Fatima Noor',
    avatar: 'FN',
    avatarColor: '#8A7F73',
    time: 'Yesterday',
    text: 'Attended the community health screening. Got my BP and sugar checked for the first time in years. Everyone please do go — it is free and very thorough.',
    likes: 47,
    replies: 12,
  },
]

const resources = [
  { title: 'National Mental Health Helpline', type: 'Helpline', detail: '1800-599-0019 · 24/7 Free' },
  { title: 'PM e-Vidya Learning Portal', type: 'Portal', detail: 'Government learning resources' },
  { title: 'Ayushman Bharat Health Card', type: 'Scheme', detail: 'Health coverage up to ₹5 lakh' },
  { title: 'Digital India Skill Training', type: 'Training', detail: 'Certification programs' },
]

function ProgressBar({ value }: { value: number }) {
  if (value === 0) return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-[#DDD3C8]" />
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#7A6F66' }}>Not started</span>
    </div>
  )
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-[#DDD3C8]">
        <div
          className="h-1.5 rounded-full transition-all"
          style={{ width: `${value}%`, backgroundColor: '#6E84A0' }}
        />
      </div>
      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#7A6F66' }}>{value}%</span>
    </div>
  )
}

export default function App() {
  const [activeNav, setActiveNav] = useState('Dashboard')
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())

  const toggleLike = (i: number) => {
    setLikedPosts(prev => {
      const next = new Set(prev)
      next.has(i) ? next.delete(i) : next.add(i)
      return next
    })
  }

  return (
    <div className="min-h-full flex flex-col" style={{ backgroundColor: '#FBF7F2' }}>
      {/* Top nav */}
      <header
        className="sticky top-0 z-30 border-b"
        style={{ backgroundColor: '#FBF7F2', borderColor: '#DDD3C8' }}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#6E84A0' }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5" r="3" fill="white" opacity="0.9" />
                <path d="M2 14c0-3.31 2.686-6 6-6s6 2.69 6 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
              </svg>
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 17, color: '#2D2B28' }}>
                SamarthYa
              </span>
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#7A6F66', marginLeft: 6 }}>
                PSID26047
              </span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item}
                onClick={() => setActiveNav(item)}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: activeNav === item ? 600 : 400,
                  backgroundColor: activeNav === item ? '#6E84A0' : 'transparent',
                  color: activeNav === item ? '#ffffff' : '#2D2B28',
                }}
              >
                {item}
              </button>
            ))}
          </nav>

          {/* User chip */}
          <div className="flex items-center gap-3">
            <button
              className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-white"
              style={{ backgroundColor: '#C66F5B', fontFamily: 'var(--font-sans)' }}
            >
              RK
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        {/* Welcome banner — two-column signature layout */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          {/* Narrative panel (3/5) */}
          <div
            className="lg:col-span-3 rounded-[10px] p-7 relative overflow-hidden"
            style={{ backgroundColor: '#EFE5DA', boxShadow: '0 1px 4px rgba(45,43,40,0.08)' }}
          >
            <div className="relative z-10">
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: '#C66F5B', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
                Good morning
              </p>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 30, color: '#2D2B28', lineHeight: 1.25, marginBottom: 14 }}>
                Welcome back, Rohan.<br />You're making steady progress.
              </h1>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 16, color: '#5A5249', lineHeight: 1.65, maxWidth: 480 }}>
                This month you've attended <strong>14 sessions</strong> and completed <strong>6 learning modules</strong>.
                Your wellness score has improved by 7 points since August — a meaningful step forward.
                Today's mental health workshop begins at 10:00 AM. Your facilitator, Dr. Anjali Rao, has sent a pre-session note.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  className="px-5 py-2.5 rounded-[10px] text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#6E84A0', fontFamily: 'var(--font-sans)' }}
                >
                  View Session Note
                </button>
                <button
                  className="px-5 py-2.5 rounded-[10px] text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ backgroundColor: 'transparent', border: '1.5px solid #C0B5AB', color: '#2D2B28', fontFamily: 'var(--font-sans)' }}
                >
                  My Progress Report
                </button>
              </div>
            </div>

            {/* Restrained line illustration — abstract wave */}
            <svg
              className="absolute right-0 bottom-0 opacity-10"
              width="220" height="160" viewBox="0 0 220 160" fill="none"
            >
              <path d="M10 140 Q60 80 110 120 Q160 160 210 60" stroke="#6E84A0" strokeWidth="2" fill="none" />
              <path d="M10 160 Q60 100 110 140 Q160 180 210 80" stroke="#C66F5B" strokeWidth="1.5" fill="none" />
              <circle cx="110" cy="120" r="4" fill="#6E84A0" />
              <circle cx="210" cy="60" r="4" fill="#C66F5B" />
            </svg>
          </div>

          {/* Action stack (2/5) */}
          <div
            className="lg:col-span-2 rounded-[10px] p-5"
            style={{ backgroundColor: '#ffffff', border: '1px solid #DDD3C8', boxShadow: '0 1px 4px rgba(45,43,40,0.06)' }}
          >
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: '#7A6F66', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 14 }}>
              Today &amp; Upcoming
            </p>
            <div className="flex flex-col gap-2">
              {upcomingActions.map((a, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-[8px] transition-colors cursor-pointer hover:bg-[#F5EFE8]"
                >
                  <div className="mt-0.5 w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: a.tagColor, marginTop: 6 }} />
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 500, color: '#2D2B28', lineHeight: 1.3 }}>{a.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#7A6F66' }}>{a.time}</span>
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-medium"
                        style={{ backgroundColor: a.tagColor + '18', color: a.tagColor, fontFamily: 'var(--font-sans)' }}
                      >
                        {a.tag}
                      </span>
                    </div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-1 opacity-40">
                    <path d="M5 3l4 4-4 4" stroke="#2D2B28" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats row */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsCards.map((s, i) => (
            <div
              key={i}
              className="rounded-[10px] p-5"
              style={{ backgroundColor: i % 2 === 0 ? '#ffffff' : '#EFE5DA', border: '1px solid #DDD3C8', boxShadow: '0 1px 4px rgba(45,43,40,0.06)' }}
            >
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 600, color: '#7A6F66', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>{s.label}</p>
              <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: 26, color: '#2D2B28', marginBottom: 2 }}>{s.value}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#7A6F66', marginBottom: 4 }}>{s.sub}</p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#C66F5B', fontWeight: 500 }}>{s.delta}</p>
            </div>
          ))}
        </section>

        {/* Programs section */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 22, color: '#2D2B28' }}>
              Your Programs
            </h2>
            <button style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#6E84A0', fontWeight: 600 }}>
              Browse all →
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {programs.map((p, i) => (
              <div
                key={i}
                className="rounded-[10px] overflow-hidden group cursor-pointer"
                style={{ backgroundColor: '#ffffff', border: '1px solid #DDD3C8', boxShadow: '0 1px 4px rgba(45,43,40,0.06)' }}
              >
                {/* Image */}
                <div className="h-40 overflow-hidden" style={{ backgroundColor: '#DDD3C8' }}>
                  <img
                    src={`https://images.unsplash.com/${p.img}?w=480&h=160&fit=crop&auto=format`}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className="px-2.5 py-1 rounded text-xs font-semibold"
                      style={{
                        fontFamily: 'var(--font-sans)',
                        backgroundColor: p.category === 'Health' ? '#6E84A018' : p.category === 'Education' ? '#C66F5B18' : '#8A7F7318',
                        color: p.category === 'Health' ? '#6E84A0' : p.category === 'Education' ? '#C66F5B' : '#8A7F73',
                      }}
                    >
                      {p.category}
                    </span>
                    <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#7A6F66' }}>{p.duration}</span>
                  </div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 16, color: '#2D2B28', lineHeight: 1.3, marginBottom: 6 }}>{p.title}</h3>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#7A6F66', marginBottom: 12 }}>
                    {p.enrolled.toLocaleString('en-IN')} enrolled · Next: {p.nextSession}
                  </p>
                  <ProgressBar value={p.progress} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom two-column: Community + Resources */}
        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Community feed (3/5) */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 22, color: '#2D2B28' }}>
                Community Voices
              </h2>
              <button style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: '#6E84A0', fontWeight: 600 }}>
                View forum →
              </button>
            </div>
            <div className="flex flex-col gap-4">
              {communityPosts.map((post, i) => (
                <div
                  key={i}
                  className="rounded-[10px] p-5"
                  style={{ backgroundColor: '#ffffff', border: '1px solid #DDD3C8', boxShadow: '0 1px 4px rgba(45,43,40,0.06)' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                      style={{ backgroundColor: post.avatarColor, fontFamily: 'var(--font-sans)' }}
                    >
                      {post.avatar}
                    </div>
                    <div>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: '#2D2B28' }}>{post.author}</p>
                      <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#7A6F66' }}>{post.time}</p>
                    </div>
                  </div>
                  <p style={{ fontFamily: 'var(--font-sans)', fontSize: 15, color: '#3D3A36', lineHeight: 1.6 }}>{post.text}</p>
                  <div className="flex items-center gap-5 mt-4 pt-4 border-t" style={{ borderColor: '#EFE5DA' }}>
                    <button
                      onClick={() => toggleLike(i)}
                      className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
                      style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: likedPosts.has(i) ? '#C66F5B' : '#7A6F66' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill={likedPosts.has(i) ? '#C66F5B' : 'none'} stroke="currentColor" strokeWidth="1.5">
                        <path d="M7 12.5S1 9 1 4.5C1 3 2.5 2 4 2c1 0 2 .5 3 1.5C8 2.5 9 2 10 2c1.5 0 3 1 3 2.5 0 4.5-6 8-6 8z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {post.likes + (likedPosts.has(i) ? 1 : 0)}
                    </button>
                    <button
                      className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
                      style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 500, color: '#7A6F66' }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 2h10v8H7.5L5 12v-2H2V2z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {post.replies} replies
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources (2/5) */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 22, color: '#2D2B28' }}>
                Key Resources
              </h2>
            </div>

            {/* Emergency card */}
            <div
              className="rounded-[10px] p-5 mb-4"
              style={{ backgroundColor: '#C66F5B', boxShadow: '0 1px 4px rgba(45,43,40,0.1)' }}
            >
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                In Crisis?
              </p>
              <p style={{ fontFamily: 'var(--font-serif)', fontWeight: 600, fontSize: 20, color: '#ffffff', marginBottom: 4 }}>
                iCall Helpline
              </p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 700, color: '#ffffff', marginBottom: 8, letterSpacing: '-0.01em' }}>
                9152987821
              </p>
              <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>
                Confidential psychosocial support. Monday–Saturday, 8 AM – 10 PM.
              </p>
            </div>

            {/* Resource list */}
            <div className="flex flex-col gap-3">
              {resources.map((r, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-[10px] cursor-pointer transition-colors hover:bg-[#EFE5DA]"
                  style={{ backgroundColor: '#ffffff', border: '1px solid #DDD3C8' }}
                >
                  <div
                    className="w-9 h-9 rounded-[8px] flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#EFE5DA' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="2" y="3" width="12" height="10" rx="2" stroke="#6E84A0" strokeWidth="1.5" />
                      <path d="M5 7h6M5 10h4" stroke="#6E84A0" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: 600, color: '#2D2B28', marginBottom: 2 }}>{r.title}</p>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-[11px] font-medium"
                        style={{ backgroundColor: '#6E84A018', color: '#6E84A0', fontFamily: 'var(--font-sans)' }}
                      >
                        {r.type}
                      </span>
                      <span style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#7A6F66' }}>{r.detail}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Badge/SIH tag */}
            <div
              className="mt-5 rounded-[10px] p-4 flex items-center gap-3"
              style={{ backgroundColor: '#EFE5DA', border: '1px solid #DDD3C8' }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-white text-sm font-bold"
                style={{ backgroundColor: '#2D2B28', fontFamily: 'var(--font-sans)' }}
              >
                SIH
              </div>
              <div>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, fontWeight: 600, color: '#2D2B28' }}>Smart India Hackathon 2024</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: 12, color: '#7A6F66' }}>Problem Statement PSID26047 · Ministry of Education</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t mt-10 py-6 px-6" style={{ borderColor: '#DDD3C8' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#7A6F66' }}>
            © 2024 SamarthYa · Built for Smart India Hackathon · PSID26047
          </p>
          <div className="flex gap-5">
            {['Privacy Policy', 'Accessibility', 'Help & Support', 'Grievance'].map(link => (
              <button
                key={link}
                className="transition-colors hover:text-[#6E84A0]"
                style={{ fontFamily: 'var(--font-sans)', fontSize: 13, color: '#7A6F66' }}
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
