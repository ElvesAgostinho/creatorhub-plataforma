/**
 * CreatorSocialLinks
 * Renders social network icons with proper brand SVGs.
 * Each link opens in a new tab. Only renders links that have a value.
 *
 * Props:
 *   socialLinks: { website, instagram, facebook, twitter, youtube, linkedin }
 *   className: optional wrapper className
 *   size: icon size in px (default 16)
 */

const NETWORKS = [
  {
    key: "website",
    label: "Website",
    color: "hover:bg-neutral-700",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
    ),
  },
  {
    key: "instagram",
    label: "Instagram",
    color: "hover:bg-gradient-to-br hover:from-[#833ab4] hover:via-[#fd1d1d] hover:to-[#fcb045]",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
      </svg>
    ),
  },
  {
    key: "youtube",
    label: "YouTube",
    color: "hover:bg-[#FF0000]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.97C18.88 4 12 4 12 4s-6.88 0-8.59.45A2.78 2.78 0 0 0 1.46 6.42 29.94 29.94 0 0 0 1 12a29.94 29.94 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.97C5.12 20 12 20 12 20s6.88 0 8.59-.45a2.78 2.78 0 0 0 1.95-1.97A29.94 29.94 0 0 0 23 12a29.94 29.94 0 0 0-.46-5.58z" />
        <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
      </svg>
    ),
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    color: "hover:bg-[#0A66C2]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
        <rect width="4" height="12" x="2" y="9" />
        <circle cx="4" cy="4" r="2" />
      </svg>
    ),
  },
  {
    key: "twitter",
    label: "X / Twitter",
    color: "hover:bg-black",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: "facebook",
    label: "Facebook",
    color: "hover:bg-[#1877F2]",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      </svg>
    ),
  },
]

function normalizeUrl(url) {
  if (!url) return null
  return url.startsWith("http://") || url.startsWith("https://") ? url : `https://${url}`
}

export default function CreatorSocialLinks({ socialLinks = {}, className = "", size = 16 }) {
  const hasAny = Object.values(socialLinks).some(Boolean)
  if (!hasAny) return null

  return (
    <div className={`flex gap-2 flex-wrap ${className}`}>
      {NETWORKS.map(({ key, label, color, icon }) => {
        const raw = socialLinks[key]
        if (!raw) return null
        const href = normalizeUrl(raw)
        return (
          <a
            key={key}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            title={label}
            className={`w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:text-white transition-all duration-200 hover:scale-110 ${color}`}
            style={{ padding: 10 }}
          >
            <span style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {icon}
            </span>
          </a>
        )
      })}
    </div>
  )
}
