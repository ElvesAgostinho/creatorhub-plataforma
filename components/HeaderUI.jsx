"use client"

import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Book, Settings, Crown, LogOut, ShoppingCart, DollarSign, Mic,
  Search, ChevronDown, ChevronRight, Menu, X, Mail
} from "lucide-react"
import { categoryTree } from "@/lib/data/categories"
import { useCart } from "./CartContext"
import Logo from "@/components/brand/Logo"

/**
 * Header único da plataforma.
 *
 * Antes havia duas versões muito diferentes — uma pílula flutuante com sombra
 * pesada na página inicial e outra fixa no marketplace — e o logótipo era a
 * palavra em itálico encorpado a laranja. Agora é uma só barra de 64px, branca,
 * encostada ao topo, com uma linha de 1px em baixo em vez de sombra: a diferença
 * entre o marketplace e o resto é apenas a pesquisa e o menu de categorias.
 */
export default function HeaderUI({ user, profile, unreadCount = 0 }) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isMarketplace = pathname === "/marketplace" || pathname.startsWith("/marketplace/")
  const isLearn = pathname.startsWith("/learn") || pathname.startsWith("/checkout")

  const { cart, setIsCartOpen, isMounted } = useCart()

  // A área de aulas e o checkout têm o seu próprio cabeçalho
  if (isLearn) return null

  const navItems = [
    { href: "/features", label: "Como funciona" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/affiliates", label: "Afiliados" },
    { href: "/support", label: "Ajuda" },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">

        {/* Logótipo */}
        <div className="flex shrink-0 items-center">
          <a href="/" className="flex items-center rounded-lg transition hover:opacity-80" aria-label="ABOVE — ir para a página inicial">
            <Logo size="md" />
          </a>
          {isMarketplace && (
            <a
              href="/marketplace"
              className="ml-2.5 hidden border-l border-neutral-200 pl-2.5 text-sm font-medium text-neutral-500 transition hover:text-ink-800 sm:inline"
            >
              Marketplace
            </a>
          )}
        </div>

        {/* Navegação / categorias */}
        {isMarketplace ? (
          <CategoriesMenu />
        ) : (
          <nav className="ml-4 hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href)
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-brand-soft text-brand"
                      : "text-neutral-600 hover:bg-neutral-100 hover:text-ink-800"
                  }`}
                >
                  {item.label}
                </a>
              )
            })}
          </nav>
        )}

        {/* Pesquisa (só no marketplace) */}
        {isMarketplace && (
          <form method="GET" action="/marketplace" className="relative mx-2 hidden min-w-0 flex-1 items-center md:flex">
            <Search size={15} className="pointer-events-none absolute left-3.5 text-neutral-400" />
            <input
              type="search"
              name="q"
              placeholder="Pesquisar cursos, livros ou mentorias"
              className="w-full rounded-lg border border-neutral-200 bg-neutral-100 py-2 pl-9 pr-3 text-sm text-ink-800 outline-none transition placeholder:text-neutral-400 focus:border-brand focus:bg-white focus:ring-4 focus:ring-brand/10"
            />
          </form>
        )}

        {/* Ações */}
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative hidden h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition hover:bg-neutral-100 hover:text-ink-800 sm:flex"
            aria-label="Abrir carrinho"
          >
            <ShoppingCart size={18} />
            {isMounted && cart.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                {cart.length}
              </span>
            )}
          </button>

          {user ? (
            <>
              <a
                href="/inbox"
                className="relative hidden h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition hover:bg-neutral-100 hover:text-ink-800 sm:flex"
                aria-label="Mensagens"
              >
                <Mail size={18} />
                {unreadCount > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </a>
              <UserMenu user={user} profile={profile} />
            </>
          ) : (
            <>
              <a
                href="/login"
                className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-100 hover:text-ink-800 sm:inline-block"
              >
                Entrar
              </a>
              <a
                href="/signup"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                Criar conta
              </a>
            </>
          )}

          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-600 transition hover:bg-neutral-100 lg:hidden"
            aria-label="Menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {/* Menu em ecrã pequeno */}
      {mobileOpen && (
        <div className="border-t border-neutral-200 bg-white lg:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                {item.label}
              </a>
            ))}
            {!user && (
              <a
                href="/login"
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                Entrar
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

/* ---------------------------------------------------------------- */

function CategoriesMenu() {
  return (
    <div className="group relative ml-2 hidden h-16 items-center md:flex">
      <button className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-ink-800">
        Categorias
        <ChevronDown size={14} className="text-neutral-400" />
      </button>

      <div className="invisible absolute left-0 top-full opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
        <div className="flex min-w-[260px] flex-col rounded-xl border border-neutral-200 bg-white p-1.5 shadow-float">
          {Object.keys(categoryTree).map((cat) => (
            <div key={cat} className="group/sub relative">
              <a
                href={`/marketplace?category=${encodeURIComponent(cat)}`}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-ink-800"
              >
                {cat}
                {categoryTree[cat]?.length > 0 && <ChevronRight size={13} className="text-neutral-400" />}
              </a>
              {categoryTree[cat]?.length > 0 && (
                <div className="invisible absolute left-full top-0 opacity-0 transition-all duration-150 group-hover/sub:visible group-hover/sub:opacity-100">
                  <div className="ml-1 flex min-w-[220px] flex-col rounded-xl border border-neutral-200 bg-white p-1.5 shadow-float">
                    {categoryTree[cat].map((sub) => (
                      <a
                        key={sub}
                        href={`/marketplace?category=${encodeURIComponent(sub)}`}
                        className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-ink-800"
                      >
                        {sub}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="my-1 h-px bg-neutral-100" />

          <div className="px-3 pb-1 pt-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Formatos
          </div>
          {[
            { href: "/marketplace?type=course", label: "Cursos" },
            { href: "/marketplace?type=mentorship", label: "Mentorias" },
            { href: "/marketplace?type=book", label: "E-books / PDF" },
          ].map((f) => (
            <a
              key={f.href}
              href={f.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 hover:text-ink-800"
            >
              {f.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

function UserMenu({ user, profile }) {
  const initial = (profile?.full_name || user.email || "?").slice(0, 1).toUpperCase()
  const isStaff = profile?.role === "admin" || profile?.role === "creator"

  return (
    <div className="group relative">
      <button className="flex items-center gap-1.5 rounded-lg p-1 transition hover:bg-neutral-100" aria-label="Conta">
        <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-brand text-sm font-bold text-white">
          {profile?.avatar_url ? (
            <img loading="lazy" decoding="async" src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            initial
          )}
        </span>
        <ChevronDown size={14} className="hidden text-neutral-400 sm:block" />
      </button>

      <div className="invisible absolute right-0 top-full pt-2 opacity-0 transition-all duration-150 group-hover:visible group-hover:opacity-100">
        <div className="w-64 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-float">
          <div className="border-b border-neutral-100 px-4 py-3">
            <p className="truncate text-sm font-semibold text-ink-800">{profile?.full_name || user.email}</p>
            <p className="mt-0.5 text-xs text-neutral-500">
              {profile?.role === "admin" ? "Administrador" : profile?.role === "creator" ? "Criador" : "Membro"}
            </p>
          </div>

          <div className="p-1.5">
            <MenuLink href="/library" icon={Book}>Biblioteca</MenuLink>
            <MenuLink href="/affiliates" icon={DollarSign}>Painel de afiliado</MenuLink>
            {isStaff ? (
              <MenuLink href="/admin/products" icon={Settings}>Painel de criador</MenuLink>
            ) : (
              <MenuLink href="/become-creator" icon={Mic}>Tornar-se criador</MenuLink>
            )}
            {profile?.role === "admin" && (
              <MenuLink href="/admin" icon={Crown} tone="brand">Administração</MenuLink>
            )}
          </div>

          <form action="/auth/logout" method="post" className="border-t border-neutral-100 p-1.5">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 transition hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-4 w-4" /> Terminar sessão
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function MenuLink({ href, icon: Icon, children, tone }) {
  const brand = tone === "brand"
  return (
    <a
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
        brand ? "text-brand hover:bg-brand-soft" : "text-neutral-700 hover:bg-neutral-100 hover:text-ink-800"
      }`}
    >
      <Icon className={`h-4 w-4 ${brand ? "" : "text-neutral-400"}`} />
      {children}
    </a>
  )
}
