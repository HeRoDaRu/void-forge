# 🗺️ Roadmap de Desarrollo: Void Forge

Progreso estimado del proyecto: `[====------] 40%`

---

## 🟢 Fase 0: MVP Jugable (Completada)
> **Objetivo:** Establecer el bucle principal de combate y economía.
- [x] Sistema de Boss con vida fija y progresión en secuencia.
- [x] Doble interacción: **Comprar upgrades** vs **Atacar manualmente**.
- [x] Lógica de daño pasivo con DPS cacheado y cap al 85% del daño manual.
- [x] Persistencia de datos con `localStorage` e invalidación automática por config hash.
- [x] UI adaptativa (Mobile Friendly).
- [x] Sistema de Loops con HP escalada por `scalingPerLoop`.

---

## 🟢 Fase 1: Feedback & "Juiciness" (Completada)
> **Objetivo:** Que el juego se sienta vivo y satisfactorio al tacto.
- [x] **Floating Damage:** Números que brotan del Boss al clickar y por DPS.
- [x] **Impacto Visual:** Animación de rebote y flash de color al recibir daño.
- [x] **Feedback de botones:** Animación de click en botones de compra.
- [x] **Hint de inicio:** Indicador visual para nuevos jugadores.
- [ ] **Estados del Boss:** Cambios de emoji según % de vida (🌌 → 🌑 → 💥).
- [ ] **Audio:** Feedback sonoro sutil mediante *Web Audio API*.

---

## 🟢 Fase 2: Sistemas Secundarios (Completada)
> **Objetivo:** Añadir capas de decisión al bucle principal.
- [x] **Void Trials:** Modo de combate alternativo con coste en Shards y recompensa en Essence.
- [x] **Sistema de Shards:** Moneda secundaria obtenida al matar bosses.
- [x] **Balanceo v2:** Reajuste completo de costes, HP de bosses, essenceRatio y scalingPerLoop tras feedback de betatesting.

---

## 🟡 Fase 3: Progresión Profunda (En curso)
> **Objetivo:** Retener al jugador con metas a largo plazo.
- [X] **Sistema de Prestige:** Reiniciar el universo a cambio de multiplicadores permanentes.
- [ ] **Logros (Achievements):** Sistema de medallas por daño total, loops completados o trials ganados.
- [ ] **Offline Progress:** Cálculo de daño y esencia acumulada al cerrar el juego.
- [ ] **Escalado de contenido:** Ampliar hasta 8-10 upgrades con curva balanceada.
- [ ] **Trials mejorados:** Recompensas progresivas según dificultad del boss generado.

---

## 🟠 Fase 4: Pulido & Contenido Extra
> **Objetivo:** Variedad visual y personalización.
- [ ] **Boss Skins:** Diferentes entidades del vacío con distintos escalados y efectos visuales.
- [ ] **Estadísticas:** Panel detallado de tiempo jugado, clics totales, DPS máximo alcanzado, etc.
- [ ] **Data Management:** Botón para exportar/importar partidas (JSON).
- [ ] **Modo Hardcore:** Variante con mayor dificultad y recompensas exclusivas.
- [ ] **Audio:** Efectos de sonido y música ambiente opcionales.
- [x] **Testeos Internos:** Posibilidad de verificar que todo funciona sin tener que testearlo directamente en el juego

---

## 🌌 Fase 5: Comunidad & Meta (Opcional)
- [ ] Leaderboard local o por sesión.
- [ ] Sistema de combos por clics rítmicos.
- [ ] Lore expandido en la descripción de objetos y bosses.
- [ ] Achievements compartibles.

---

*Última actualización: Abril 2025*