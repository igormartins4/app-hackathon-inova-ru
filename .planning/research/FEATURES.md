# Feature Landscape — Rangoo Universitário

**Domain:** Mobile payment app for university meal plans (Brazilian context)
**Researched:** 2026-07-12
**Overall confidence:** HIGH — grounded in PROJECT.md constraints, Brazilian RU apps research, and payment app best practices

---

## Table Stakes

Features users expect in a university RU payment app. Missing any = product feels broken or incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **CPF + Password Login** | Standard auth for Brazilian university systems (SIGAA, Si3, etc.) | Low | FUMP API provides this — no custom auth needed |
| **Balance Check** | Core utility — students need to know credits before entering RU | Low | Cache locally for offline; show on home screen |
| **PIX Payment Flow** | The entire value proposition — recharge credits via PIX | High | QR Code + "Pix Copia e Cola" + amount entry + confirmation |
| **Transaction History** | Students track spending, verify charges, dispute errors | Medium | Cache for offline access; show last 30 days |
| **Secure Token Storage** | JWT never in plaintext — security baseline | Medium | EncryptedSharedPreferences / Android Keystore |
| **Error Handling** | Network failures, expired PIX, API errors — app must not crash | Medium | Retry logic, clear PT-BR messages, fallback states |
| **Offline Balance Cache** | Campus connectivity is unreliable — app must show last known balance | Medium | Store balance + timestamp; show staleness indicator |
| **Basic Accessibility** | WCAG AA baseline — screen reader labels, contrast, touch targets | Medium | TalkBack support, 48dp touch targets, WCAG AA contrast |

---

## Differentiators

Features that set Rangoo Universitário apart. Not expected from a hackathon project, but create competitive advantage and impress judges.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Extreme Accessibility (WCAG AA+)** | Differentiator per hackathon rules + social impact for students with disabilities | High | TalkBack, Switch Access, adjustable font (16-24sp), high contrast mode, semantic labels on all interactive elements |
| **Fluid Microinteractions** | Animations make app feel polished, not like a typical university system | Medium | Lottie/RN Animated for balance refresh, PIX success, tab transitions |
| **Offline-First Architecture** | App works seamlessly in low-connectivity campus environments | High | Local-first data, background sync, queue writes, stale-while-revalidate pattern |
| **Creative Original Design** | Hackathon judges evaluate originality — generic = low score | Medium | Custom design system, RU-themed colors, not a Bootstrap clone |
| **Real-Time PIX Status Polling** | Students see live payment confirmation — no anxiety after paying | Medium | Exponential backoff (3s→5s→8s→13s), 2-min timeout, visual progress indicator |
| **<30 Second Recharge** | Core value proposition from PROJECT.md — speed is the product | Medium | Optimize UX flow: value → confirm → PIX → done in 3 taps |
| **Low Balance Alerts** | Proactive notifications prevent awkward "insufficient credits" at RU entrance | Low | Push notification or in-app banner when balance < threshold |

---

## Anti-Features

Features to deliberately NOT build. Each would add complexity without value for this hackathon context.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Mobile Food Ordering** | Out of scope per PROJECT.md; FUMP API doesn't support it | Focus on payment flow — ordering is a different product |
| **Multiple Payment Methods** | Out of scope — PIX only per PROJECT.md | PIX is sufficient and universally adopted in Brazil |
| **User Registration** | Out of scope — FUMP handles account creation | App only authenticates, never creates accounts |
| **iOS Support** | Out of scope — hackathon requires Android APK only | React Native code is portable, but don't build/test iOS |
| **Multi-Language** | Out of scope — Portuguese only | No i18n overhead; focus on PT-BR accessibility |
| **Loyalty/Rewards Programs** | Irrelevant for university context — no commercial incentive | Students don't need cashback on R$1.10 meals |
| **P2P Transfers** | Not in scope; FUMP API doesn't support it | Students can't transfer credits to each other |
| **NFC/Contactless Payments** | Requires hardware integration; out of scope | PIX QR Code is the payment method |
| **AI Spending Analytics** | Over-engineered for hackathon; no data science value | Simple transaction history is sufficient |
| **Menu/Food Integration** | FUMP doesn't provide menu data; different product entirely | App is for payments, not food discovery |
| **Social Features** | Adds complexity without university RU value | No friend lists, sharing, or social feeds |
| **Subscription/Recurring Payments** | FUMP API handles billing; not our concern | App is a payment interface, not a billing system |

---

## Feature Dependencies

```
Login (CPF + Password) → All other features (auth required)
    ↓
Balance Check → Transaction History (related data)
    ↓
PIX Payment Flow → QR Code Generation → Status Polling → Confirmation
    ↓
Offline Cache ← Balance Check + Transaction History (both cached)
    ↓
Accessibility ← All UI features (cross-cutting concern)
    ↓
Error Handling ← All network operations (cross-cutting concern)
```

**Critical path:** Login → Balance → PIX Flow → Confirmation

**Parallel workstreams:**
1. Auth + API integration (backend-dependent)
2. UI/UX + Design system (independent, can mock)
3. Accessibility layer (cross-cutting, can start early)
4. Offline cache (independent, can implement alongside features)

---

## MVP Recommendation

**Prioritize (must ship):**
1. **CPF + Password Login** — Gate to all features; FUMP API integration is critical
2. **Balance Check** — Core utility; must work offline
3. **PIX Payment Flow** — The product's reason to exist; QR Code + Copia e Cola + polling
4. **Transaction History** — Students expect to see past charges
5. **Basic Accessibility** — TalkBack labels, contrast, touch targets (hackathon requirement)

**Include if time permits:**
6. **Offline Cache** — Balance + history cached locally
7. **Error States** — Graceful handling of network/API failures
8. **Microinteractions** — Polish for hackathon presentation

**Defer to post-hackathon:**
- Advanced accessibility (Switch Access, font scaling beyond defaults)
- Push notifications for low balance
- Transaction export/statistics
- Biometric authentication (fingerprint/PIN unlock)

---

## Research Context

### Brazilian University RU Apps Surveyed

| App | University | Key Features |
|-----|-----------|--------------|
| Minha UFDPar | UFDPar | PIX via PagTesouro, GRU, balance, menu |
| Unicamp Serviços | Unicamp | PIX recharge, institutional ID integration |
| Cardápio+ USP | USP | Menu, RuCard balance, social services |
| RU – UFC | UFC | Credits, menu, balance, PIX recharge |
| App UFSC | UFSC | PIX, GRU, menu, balance, 24/7 availability |
| LunchPass | Generic | Balance, notifications, menu, accessibility |
| UECEApp | UECE | E-tickets, balance, multi-campus support |
| Minha UFPI+ | UFPI | PIX, balance, QR access, multi-campus roadmap |

**Common patterns across all apps:**
- PIX as primary payment method (replacing GRU/boleto)
- Balance check as core feature
- QR Code for payment and/or access
- Offline limitations acknowledged but rarely solved well
- Accessibility rarely mentioned as a feature (opportunity for Rangoo Universitário)

### Payment App Industry Trends (2025-2026)

From payment app development guides:
- **QR Code payments** are dominant (380B+ transactions globally)
- **Instant confirmation** is table stakes — users expect <5 second feedback
- **Offline-first** architecture is becoming standard for mobile payments
- **Biometric authentication** is expected but not critical for MVP
- **Transaction history** with real-time updates is baseline
- **Accessibility** is legally required (EAA 2025, ADA) but still poorly implemented

---

## Sources

- PROJECT.md (project context and constraints)
- Brazilian university RU apps: UFDPar, Unicamp, USP, UFC, UFSC, UFES, UFPI, UECE official announcements
- Payment app development guides: Techugo, Itexus, Suffescom, DashDevs (2025-2026)
- Offline-first architecture: Android Developers, Flutter docs, Ionic blog, Medium articles
- PIX payment UX: UX Recommendations, dLocal docs, Stripe Brazil guide, BCB regulation
- WCAG 2.2 mobile: W3C WCAG2Mobile, Inclusive Web, Appricotsoft accessibility guides
- Campus meal apps: BalanceU, CampusCrave, Grubhub Campus, Transact IDX, GET Mobile
