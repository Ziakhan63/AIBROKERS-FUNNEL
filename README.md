# AI Brokers Funnel

A professional, high-converting lead generation funnel for AI-powered real estate brokerage services. Built with semantic HTML5, modern CSS, and vanilla JavaScript — no frameworks or build steps required.

## 🚀 Pages

| File | Description |
|---|---|
| `index.html` | Main landing page — hero, features, how it works, testimonials, lead capture form, FAQ, CTA |
| `thank-you.html` | Post-submission confirmation page with next-steps guide |
| `styles.css` | Full design system (dark theme, responsive, accessible) |
| `main.js` | Interactivity — form validation, scroll reveal, animated counters, FAQ accordion, toast notifications |

## ✨ Features

- **AI lead capture form** with client-side validation (name, email, phone, company, team size, primary goal, consent)
- **Animated stats counters** (12,400+ deals closed, 94% accuracy, $2.1B+ volume)
- **Live dashboard card** showing AI deal intelligence metrics
- **Scroll-reveal animations** via IntersectionObserver
- **FAQ accordion** with keyboard accessibility and ARIA attributes
- **Mobile-responsive** layout (hamburger nav, stacked form grid)
- **Demo toast notifications** simulating real-time AI activity
- **Sticky navbar** that transitions from transparent to solid on scroll
- **WCAG-friendly** — semantic HTML, ARIA labels, roles, live regions, keyboard navigation

## 🛠 Getting Started

No build step needed. Open `index.html` in any modern browser, or serve with any static server:

```bash
# Using Python
python -m http.server 8080

# Using Node.js (npx)
npx serve .

# Using VS Code Live Server
# Right-click index.html → Open with Live Server
```

Then visit [http://localhost:8080](http://localhost:8080).

## 📁 Structure

```
AIBROKERS-FUNNEL/
├── index.html      # Landing / funnel page
├── thank-you.html  # Post-submission page
├── styles.css      # Design system & component styles
├── main.js         # All interactivity
└── README.md
```

## 🔗 Connecting a Backend

The lead form currently simulates submission with a `setTimeout`. To connect a real backend, replace the timeout block in `main.js` with a `fetch` call:

```js
fetch('/api/leads', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(Object.fromEntries(new FormData(form))),
})
  .then(res => res.json())
  .then(() => {
    // show success state or redirect
    window.location.href = 'thank-you.html';
  });
```

## 📄 License

MIT