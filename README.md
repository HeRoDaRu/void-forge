# 🌌 Void Forge: Eternal Abyss

Un juego *incremental clicker* con temática cósmica desarrollado con **Vanilla Web Stack**.
Enfréntate a una secuencia de bosses del vacío, cosecha esencia y mejora tus herramientas de destrucción.

---

## 🕹️ Mecánicas de Juego

- **Atacar manualmente:** Cada herramienta tiene un botón de ataque que inflige daño instantáneo.
- **DPS Pasivo:** Mejora las herramientas con upgrades de DPS para que ataquen solas de forma continua.
- **Void Essence:** El 70% del daño infligido (manual o pasivo) se convierte en esencia, la moneda del juego.
- **Progresión de Bosses:** Los bosses aparecen en secuencia. Al completar la lista, el ciclo reinicia con HP escalada.

---

## 👾 Bosses

| Boss | HP Base | Recompensa | Especial |
| :--- | :---: | :---: | :---: |
| **The Void Wraith** | 100.000 | 500 ✨ | — |
| **Nebula Devourer** | 250.000 | 1.500 ✨ | — |
| **Rift Colossus** | 600.000 | 4.000 ✨ | — |
| **The Event Horizon** | 1.500.000 | 12.000 ✨ | Boss Final |

Cada vez que se completa la secuencia entera, la HP de todos los bosses se multiplica por **×2.2**.
La recompensa de esencia también escala con el número de loop completados.

---

## 🛠️ Herramientas de Forja

| Item | Daño Manual | Coste Inicial | Descripción |
| :--- | :---: | :---: | :--- |
| **Void Spark** ✨ | 12 | 15 | Una pequeña chispa de energía negativa. |
| **Echo Fragment** 🔊 | 45 | 70 | Fragmentos de realidades colapsadas. |
| **Nebula Weaver** 🌌 | 160 | 320 | Tejedora de nubes de gas estelar. |
| **Rift Anchor** 🌊 | 520 | 1.100 | Ancla la existencia para golpearla mejor. |

El coste de cada herramienta escala ×1.18 por unidad comprada.

---

## ⚡ Mejoras de DPS

Accesibles desde el botón **UPGRADE DPS**. Amplifican el daño pasivo de cada herramienta.

| Mejora | Herramienta | Multiplicador | Niveles | Coste Base |
| :--- | :--- | :---: | :---: | :---: |
| **Void Spark DPS** | Void Spark | +25% por nivel | 5 | 700 |
| **Echo Fragment DPS** | Echo Fragment | +35% por nivel | 5 | 2.500 |

Fórmula del DPS: `daño_base × (multiplicador × nivel) × unidades_poseídas`

El coste de cada nivel de DPS escala ×1.25.

---

## 💾 Arquitectura
void-forge/
├── index.html   — Estructura y layout
├── style.css    — Estilos (CSS Custom Properties, Flexbox, Grid)
└── script.js    — Lógica del juego

**Decisiones de diseño destacadas:**

- **CONFIG vs gameState** — La configuración del juego (stats, costes base, lista de bosses) es inmutable y vive en `CONFIG`. Solo el estado variable (esencia, HP, unidades compradas) se guarda en `localStorage`.
- **Render parcial** — `renderUpgrades()` construye el DOM una sola vez al inicio. Las actualizaciones posteriores usan `updateUpgradeCards()`, que modifica solo los valores que cambian sin reconstruir el DOM.
- **Dirty checking** — El game loop solo actualiza las cards de upgrades cuando la esencia cambia de unidad entera, evitando trabajo innecesario en cada frame.
- **DPS cacheado** — `cachedDPS` se recalcula únicamente al comprar una mejora, no en cada tick del game loop.
- **Event delegation** — Un único listener en `document` gestiona todos los clicks del juego.

---

## 🚀 Tecnologías

- **Frontend:** HTML5 & CSS3 (Custom Properties, Flexbox, Grid, `100dvh`)
- **Lógica:** Vanilla JavaScript ES6+ (sin dependencias)
- **Persistencia:** `localStorage` con merge selectivo para compatibilidad entre versiones
- **Rendimiento:** `requestAnimationFrame` para el game loop, dirty checking para minimizar reflows

---

## 🎮 Cómo jugar

1. Empieza atacando con **Void Spark** — el único item desbloqueado al inicio.
2. Usa la esencia generada para comprar más unidades del mismo item o desbloquear los siguientes.
3. Cuando tengas suficiente esencia, abre **UPGRADE DPS** para activar el daño pasivo.
4. El daño pasivo permite progresar sin interacción — el juego avanza solo.
5. Mata todos los bosses para completar el primer loop. Cada loop siguiente es más difícil y más rentable.

---

*Desarrollado como proyecto de aprendizaje de mecánicas incrementales y arquitectura de juegos en Vanilla JS.*