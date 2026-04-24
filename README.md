# 🌌 Void Forge: Eternal Abyss

Un juego *incremental clicker* con temática cósmica desarrollado con **Vanilla Web Stack**.
Enfréntate a una secuencia de bosses del vacío, cosecha esencia y mejora tus herramientas de destrucción.

---

## 🕹️ Mecánicas de Juego

- **Atacar manualmente:** Haz click sobre el boss para infligir daño instantáneo basado en tus herramientas.
- **DPS Pasivo:** Mejora las herramientas con upgrades de DPS para que ataquen solas de forma continua. El DPS nunca supera el 85% de tu daño manual por diseño.
- **Void Essence:** El 25% del daño infligido (manual o pasivo) se convierte en esencia, la moneda del juego.
- **Shards:** Moneda secundaria obtenida al matar bosses. Se usa para entrar a los Void Trials y para comprar mejoras permanentes en el árbol de Prestigio.
- **Prestigio:** Sistema de reinicio voluntario. Sacrifica todo tu progreso actual (essence, shards, upgrades) a cambio de desbloquear mejoras permanentes. Requiere tanto Essence como Shards para activarse. Los multiplicadores del árbol persisten entre reinicios.
- **Progresión de Bosses:** Los bosses aparecen en secuencia. Al completar la lista, el ciclo reinicia con HP escalada ×1.45 por loop.
- **Void Trials:** Modo alternativo de combate de un solo golpe. Pagas Shards para enfrentarte a un boss aleatorio con HP basada en tu daño manual. Si puedes matarlo de un golpe, recibes esencia extra.

---

## 👾 Bosses

| Boss | HP Base | Recompensa | Especial |
| :--- | :---: | :---: | :---: |
| **The Void Wraith** | 50.000 | 150 ✨ | — |
| **Nebula Devourer** | 300.000 | 600 ✨ | — |
| **Rift Colossus** | 1.500.000 | 3.000 ✨ | — |
| **The Event Horizon** | 8.000.000 | 18.000 ✨ | Boss Final |

Cada vez que se completa la secuencia entera, la HP de todos los bosses se multiplica por **×1.45**.
La recompensa de esencia también escala con el número de loops completados.

---

## 🛠️ Herramientas de Forja

| Item | Daño Manual | Coste Inicial | Descripción |
| :--- | :---: | :---: | :--- |
| **Void Spark** ✨ | 12 | 150 | Una pequeña chispa de energía negativa. |
| **Echo Fragment** 🔊 | 45 | 8.000 | Fragmentos de realidades colapsadas. |
| **Nebula Weaver** 🌌 | 160 | 250.000 | Tejedora de nubes de gas estelar. |
| **Rift Anchor** 🌊 | 520 | 8.000.000 | Ancla la existencia para golpearla mejor. |

El coste de cada herramienta escala ×1.38 por unidad comprada.

---

## ⚡ Mejoras de DPS

Accesibles desde el botón **MEJORAR DPS**. Amplifican el daño pasivo de cada herramienta.

| Mejora | Herramienta | Multiplicador | Niveles | Coste Base |
| :--- | :--- | :---: | :---: | :---: |
| **Void Spark DPS** | Void Spark | +20% por nivel | 5 | 40.000 |
| **Echo Fragment DPS** | Echo Fragment | +28% por nivel | 5 | 500.000 |
| **Nebula Weaver DPS** | Nebula Weaver | +60% por nivel | 5 | 8.000.000 |
| **Rift Anchor DPS** | Rift Anchor | +90% por nivel | 5 | 30.000.000 |

Fórmula del DPS: `daño_base × multiplicador × nivel × unidades_poseídas`
El DPS está limitado al **85% del daño manual total** como techo de diseño.
El coste de cada nivel de DPS escala ×1.30.

---

## ⚔️ Void Trials

Sistema de combate alternativo accesible desde el botón **TRIALES**.

- **Coste de entrada:** 50 Shards por intento.
- **Mecánica:** Se genera un boss aleatorio con HP basada en tu daño manual actual (×0.8 a ×1.5).
- **Victoria:** Si tu daño manual iguala o supera el HP del boss, recibes esencia (daño manual × 80).
- **Derrota:** Pierdes los Shards sin recompensa.
- **Shards por boss:** 8 / 18 / 35 / 80 al matar cada boss de la secuencia principal.

---

## ⭐ Sistema de Prestigio

Accesible desde el botón **PRESTIGIO**. Reinicia el progreso actual a cambio de mejoras permanentes.

### Coste de Prestigio
| Tier | Shards | Essence | Se desbloquea en |
| :--- | :---: | :---: | :---: |
| **Tier 1** | 800 | 5.000 | Primer prestigio |
| **Tier 2** | 2.500 | 50.000 | Prestigio 3 |
| **Tier 3** | 8.000 | 500.000 | Prestigio 15 |

### Árbol de Nodos
Los nodos se compran con Shards después de prestigiar. Cada tier se desbloquea al alcanzar el prestigio correspondiente.

| Nodo | Tier | Coste | Efecto |
| :--- | :---: | :---: | :--- |
| **Essence Surge** ⚡ | 1 | 200 💎 | +10% esencia ganada |
| **Shard Mastery** 💎 | 1 | 200 💎 | -5% coste de Trials |
| **Eternal Growth** 🌱 | 1 | 250 💎 | -2% crecimiento de costes de upgrades |
| **Loop Resilience** 🛡️ | 1 | 250 💎 | -5% HP de bosses por loop |
| **Manual Mastery** 👊 | 2 | 600 💎 | +15% daño manual |
| **DPS Synergy** 🤝 | 2 | 600 💎 | +10% multiplicador de DPS |
| **Essence Efficiency** ♻️ | 2 | 600 💎 | -10% coste de mejoras DPS |
| **Shard Hoarder** 🧤 | 2 | 800 💎 | +10% shards por boss |
| **Loop Mastery** 🔁 | 3 | 2.500 💎 | +20% esencia por loop completado |
| **Trial Veteran** 🏅 | 3 | 2.500 💎 | +15% esencia y shards en Trials |
| **DPS Overdrive** 🚀 | 3 | 2.500 💎 | +25% DPS total |
| **Upgrade Overhaul** ⚙️ | 3 | 3.500 💎 | -15% coste de upgrades |

### Qué se resetea y qué no
- **Se resetea:** Essence, Shards, upgrades compradas, niveles de DPS, progreso de bosses y loops.
- **No se resetea:** Contador de prestigios y nodos del árbol desbloqueados.

---

## 💾 Arquitectura
void-forge/
├── index.html   — Estructura y layout
├── style.css    — Estilos (CSS Custom Properties, Flexbox, Grid)
└── script.js    — Lógica del juego

**Decisiones de diseño destacadas:**

- **CONFIG vs gameState** — La configuración del juego (stats, costes base, lista de bosses) es inmutable y vive en `CONFIG`. Solo el estado variable (esencia, HP, unidades compradas) se guarda en `localStorage`.
- **Config hash para saves** — El save key incluye un hash del CONFIG. Si los valores base cambian, los saves antiguos se invalidan automáticamente evitando estados corruptos.
- **Render parcial** — `renderUpgrades()` construye el DOM una sola vez al inicio. Las actualizaciones posteriores usan `updateUpgradeCards()`, que modifica solo los valores que cambian sin reconstruir el DOM.
- **Dirty checking** — El game loop solo actualiza las cards de upgrades cuando la esencia cambia de unidad entera, evitando trabajo innecesario en cada frame.
- **DPS cacheado** — `cachedDPS` se recalcula únicamente al comprar una mejora, no en cada tick del game loop.
- **DPS cap dinámico** — El DPS nunca puede superar el 85% del daño manual total. El cap crece con el jugador y registra advertencias en consola durante beta.
- **Event delegation** — Un único listener en `document` gestiona todos los clicks del juego.
- **Prestige state separado** — `prestigeState` vive en su propia key de `localStorage` sin hash de CONFIG, garantizando que los prestigios nunca se invalidan aunque cambien los valores base del juego.
- **Data-driven prestige** — Cada nodo del árbol define su efecto en CONFIG mediante `{ key, type, value }`. `getPrestigeMultipliers()` los aplica automáticamente sin lógica hardcodeada, facilitando añadir nodos nuevos sin tocar código.
- **Click throttle** — Los clicks en el boss están limitados a 20 por segundo para evitar que autoclickers saturen el event loop.
- **Save debounce** — `saveGame()` escribe en localStorage como máximo una vez cada 2 segundos, evitando bloqueos del hilo principal por escrituras síncronas frecuentes.

---

## 🚀 Tecnologías

- **Frontend:** HTML5 & CSS3 (Custom Properties, Flexbox, Grid, `100dvh`)
- **Lógica:** Vanilla JavaScript ES6+ (sin dependencias)
- **Persistencia:** `localStorage` con hash de CONFIG para invalidación automática de saves
- **Rendimiento:** `requestAnimationFrame` para el game loop, dirty checking para minimizar reflows

---

## 🎮 Cómo jugar

1. Empieza atacando con **Void Spark** — el único item desbloqueado al inicio.
2. Usa la esencia generada para comprar más unidades del mismo item o desbloquear los siguientes.
3. Cuando tengas suficiente esencia, abre **MEJORAR DPS** para activar el daño pasivo.
4. Acumula **Shards** matando bosses y úsalos en **TRIALES** para conseguir esencia extra.
5. El daño pasivo permite progresar sin interacción — el juego avanza solo.
6. Mata todos los bosses para completar el primer loop. Cada loop siguiente es más difícil pero más rentable.
7. Cuando tengas suficiente Essence y Shards, abre **PRESTIGIO** para reiniciar con mejoras permanentes activas.
8. Usa los Shards post-prestigio para comprar nodos del árbol y hacerte más fuerte en cada ciclo.

---

*Desarrollado como proyecto de aprendizaje de mecánicas incrementales y arquitectura de juegos en Vanilla JS.*