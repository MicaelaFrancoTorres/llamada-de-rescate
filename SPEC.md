# SPEC · Llamada de Rescate · Hackathon 2026

> Fuente de verdad del proyecto. Orden de trabajo (SDD): intención → spec → clarify → plan → tareas → implementación → evidencia.

## Teoría de la cursada aplicada
| Clase | Dónde se aplica |
|---|---|
| 3 · HTML semántico y WCAG | `main`, `section`, `header`, `article`, `fieldset`/`legend`, `label`, `aria-label`, `aria-live`, `role="alert"`, foco visible, 44 px mínimos |
| 4 · CSS moderno | `box-sizing: border-box`, variables CSS, Grid para la grilla de opciones, Flexbox para la pantalla de llamada, media query |
| 5 · JavaScript base | `const`/`let` (sin `var`), `===`, arrow functions, template literals, `??` |
| 6 · DOM | `querySelector`, `addEventListener`, patrón **estado → render()** |
| 7 · Arrays | `find`, `map`, `includes`, `forEach` (métodos que no modifican el array) |
| 8 · Objetos | `LUGARES` es un array de objetos y se usa desestructuración |
| 32 · SDD | Esta spec: reglas, estados y transiciones, Given/When/Then, trazabilidad |
| 38 / 41 · Testing | `rescate.test.js` con estructura AAA, casos borde y `node --test` |

## 1. Ficha del invento
| Campo | Descripción |
|---|---|
| Nombre | Llamada de Rescate |
| Pabellón | Molestias Cotidianas |
| Quién | Persona atrapada en un cumpleaños, una reunión familiar, una cita o una reunión de trabajo |
| Problema | Me quiero ir y no sé cómo hacerlo sin quedar mal |
| Entrada | Lugar (4 opciones) y ganas de irme (1 a 10) |
| Proceso | `armarRescate(lugar, ganas)` elige llamador, excusa, pasos, credibilidad y tiempo |
| Salida | Llamada entrante falsa con sonido y, al atender, un guion de escape |
| Ingrediente | **Botón de emergencia**: el botón rojo "RESCATAME" |

## 2. Actores
- **Usuario/a atrapado/a:** usa la app desde el celular o la compu.
- **Testigos:** las personas presentes, que ven la "llamada" en la pantalla.

## 3. Alcance
- Elegir el lugar y el nivel de ganas.
- Simular una llamada entrante con sonido y vibración del avatar.
- Mostrar el guion de escape al atender.
- Rechazar la llamada o cortar para terminar, y volver al inicio.

## 4. Fuera de alcance
- Llamadas telefónicas reales, login, base de datos o guardar historial.
- Personalizar el nombre de quien llama.

## 5. Reglas de negocio
- **R1:** las ganas 1–3 son nivel suave, 4–7 medio y 8–10 extremo.
- **R2:** cada lugar tiene un llamador fijo: cumpleaños → Mamá, familia → Vecina Marta, cita → Mejor amiga, trabajo → Soporte Técnico.
- **R3:** credibilidad = base del nivel (94 / 78 / 52) − ganas. Tiempo de escape: 120 / 45 / 12 segundos.
- **R4:** sin lugar elegido, o con ganas fuera de 1–10, no hay rescate (`null`) y se muestra un aviso.

## 6. Estados y transiciones
| Desde | Hacia | Evento |
|---|---|---|
| inicio | sonando | Clic en RESCATAME con lugar elegido |
| sonando | en-llamada | Clic en 📞 Atender |
| sonando | fin | Clic en 📵 Rechazar |
| en-llamada | fin | Clic en 📵 Cortar y huir |
| fin | inicio | Clic en ← Volver |

**Cualquier otra transición es inválida y se ignora.**

## 7. Criterios de aceptación (Given / When / Then)
- **E1 (R4):** *Given* no elegí lugar, *When* toco RESCATAME, *Then* aparece "⚠️ Primero elegí dónde estás" y **no** cambia de pantalla.
- **E2 (R2):** *Given* elegí "Cumpleaños", *When* toco RESCATAME, *Then* suena una llamada de "Mamá" y el avatar vibra.
- **E3 (R1, R3):** *Given* "Cita" con ganas 9, *When* atiendo, *Then* veo la excusa extrema, "Credibilidad: 43%" y "Escape en 12 s", y el contador de llamada avanza.
- **E4:** *Given* está sonando, *When* toco Rechazar, *Then* se corta el sonido y veo "Rechazaste tu propio rescate".
- **E5:** *Given* estoy en la llamada, *When* toco Cortar, *Then* se frena el contador y veo "¡Escapaste con éxito!".
- **E6:** *Given* estoy en el fin, *When* toco Volver, *Then* vuelvo al inicio con mi lugar y mis ganas **sin cambiar**.

## 8. Casos borde
- Ganas en los límites: 1, 3, 4, 7, 8 y 10 (cubiertos por los tests).
- Lugar inexistente o `null` → `null`.
- Doble clic en RESCATAME mientras suena: no aplica, porque el botón ya no está visible.

## 9. Accesibilidad
- Etiquetas `label`, `fieldset` y `legend` en el formulario. Todo se puede usar con teclado (Tab, flechas y Enter).
- Foco visible, botones de 44 px como mínimo y `aria-label` en los botones que solo tienen emoji.

## 10. Plan
- HTML semántico, CSS con variables y JavaScript sin frameworks: se abre con doble clic.
- `rescate.js` tiene la lógica pura (testeable) y `app.js` la interfaz con el patrón **estado → render**.

## 11. Tareas y trazabilidad
| Tarea | Regla | Escenario | Evidencia |
|---|---|---|---|
| T1: Spec y README | — | — | Este archivo |
| T2: Estructura HTML | — | E1–E6 | `index.html` |
| T3: Estilos | — | E2 (vibración) | `style.css` |
| T4: Lógica y tests | R1–R4 | E2, E3 | `rescate.js` y `rescate.test.js` (`npm test` en verde) |
| T5: Interfaz y estados | Transiciones | E1–E6 | `app.js` y prueba manual en el navegador |

## 12. Preguntas abiertas
Ninguna crítica.

## 13. Anexo: código fuente
El código fuente vive en los archivos del repositorio: `index.html`, `style.css`, `rescate.js`, `rescate.test.js`, `package.json` y `app.js`.
