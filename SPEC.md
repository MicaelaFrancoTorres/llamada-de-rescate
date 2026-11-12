# SPEC · Llamada de Rescate · Hackathon 2026

> Fuente de verdad del proyecto. Orden de trabajo (SDD): intención → spec → clarify → plan → tareas → implementación → evidencia.

## Teoría de la cursada aplicada
| Clase | Dónde se aplica |
|---|---|
| 3 · HTML semántico y WCAG | `main`, `section`, `header`, `article`, `fieldset`/`legend`, `label`, `aria-label`, `aria-live`, `role="alert"`, foco visible, 44 px mínimos |
| 4 · CSS moderno | `box-sizing: border-box`, variables CSS, Grid para la grilla de opciones, Flexbox para la pantalla de llamada, media query |
| 5 · JavaScript base | `const`/`let` (sin `var`), `===`, arrow functions, template literals, `??` |
| 6 · DOM | `querySelector`, `addEventListener`, patrón **estado → render()** |
| 5 · JavaScript base (ampliación) | `setInterval` para la cuenta regresiva, `Number()` para leer la demora y `??=` para crear el audio una sola vez |
| 6 · DOM y APIs del navegador | `speechSynthesis` para leer los turnos de la llamada; burbujas de chat dibujadas desde el estado |
| 7 · Arrays | `find`, `map`, `includes`, `forEach`, `slice`, `filter` (métodos que no modifican el array) |
| 7 · Arrays y 8 · Objetos (inmutabilidad) | `registrarResultado` devuelve un objeto nuevo con desestructuración, sin mutar el historial recibido |
| 5 · JavaScript base (texto) | `trim`, spread de string para contar caracteres sin partir emojis, y `||` para el valor por defecto |
| 6 · DOM (eventos de teclado) | `keydown` en `document`, `e.key` y `matches` para ignorar los campos de texto |
| 6 · DOM y APIs del navegador (persistencia) | `localStorage` con `try/catch`: si el navegador lo bloquea, la app sigue funcionando |
| 8 · Objetos | `LUGARES` es un array de 8 objetos con `dialogos` anidados por nivel, y se usa desestructuración |
| 32 · SDD | Esta spec: reglas, estados y transiciones, Given/When/Then, trazabilidad |
| 38 / 41 · Testing | `rescate.test.js` con estructura AAA, casos borde y `node --test`; el CI de GitHub Actions corre los tests en cada push y pull request |

## 1. Ficha del invento
| Campo | Descripción |
|---|---|
| Nombre | Llamada de Rescate |
| Pabellón | Molestias Cotidianas |
| Quién | Persona atrapada en un cumpleaños, una reunión familiar, una cita, el trabajo, una clase, un asado, una reunión de consorcio o una sala de espera |
| Problema | Me quiero ir y no sé cómo hacerlo sin quedar mal |
| Entrada | Lugar (8 opciones) y ganas de irme (1 a 10) |
| Proceso | `armarRescate(lugar, ganas)` elige llamador, excusa, pasos, credibilidad y tiempo |
| Salida | Llamada entrante falsa con sonido y, al atender, un guion de escape |
| Ingrediente | **Botón de emergencia**: el botón rojo "RESCATAME" |

## 2. Actores
- **Usuario/a atrapado/a:** usa la app desde el celular o la compu.
- **Testigos:** las personas presentes, que ven la "llamada" en la pantalla.

## 3. Alcance
- Elegir el lugar, el nivel de ganas y cuándo suena la llamada (Ya, 5 s o 10 s).
- Opcionalmente, personalizar el nombre de quien llama.
- Simular una llamada entrante con sonido y vibración del avatar.
- Al atender, mostrar una conversación por turnos (chat y voz) y, al terminar, el guion de escape.
- Rechazar la llamada o cortar para terminar, y volver al inicio.

## 4. Fuera de alcance
- Llamadas telefónicas reales, login, base de datos o historial en un servidor (solo se guarda un contador en el navegador).
## 5. Reglas de negocio
- **R1:** las ganas 1–3 son nivel suave, 4–7 medio y 8–10 extremo.
- **R2:** cada lugar tiene un llamador fijo: cumpleaños → Mamá, familia → Vecina Marta, cita → Mejor amiga, trabajo → Soporte Técnico, clase aburrida → Hermano/a, asado eterno → Abuela, reunión de consorcio → Cerrajero, sala de espera → Trabajo. Son 8 lugares y cada uno tiene excusa y diálogo para los 3 niveles.
- **R7:** el historial es `{escapes, rechazos}`. `registrarResultado(historial, resultado)` es una función pura: con "escape" suma un escape, con "rechazo" suma un rechazo, y devuelve siempre un objeto **nuevo** sin mutar el recibido. Un historial inválido cuenta como 0. Cortar la llamada registra un escape; rechazarla, un rechazo. Se guarda en `localStorage` (con `try/catch`) y se muestra en el inicio: "🏃 Escapes exitosos: N · 😶 Rechazados: M".
- **R8:** en el estado inicio, la tecla R (sin Ctrl, Alt ni Meta) dispara el rescate igual que el botón RESCATAME, con la misma demora. Si no hay lugar elegido usa "cumple" y lo marca en pantalla. No se activa mientras se escribe en un campo de texto, ni en otros estados. En el inicio se ve el texto chico "Atajo secreto: tecla R".
- **R9:** el nombre de contacto es opcional ("¿Quién querés que te llame?"). `limpiarNombre` le quita los espacios de los extremos y lo corta en 20 caracteres. Si queda un nombre, reemplaza al llamador del lugar (R2); si queda vacío, vale el llamador de siempre. No cambia el diálogo.
- **R10:** cada lugar tiene una voz propia `voz: {tono, velocidad}`, que se usa en los turnos de quien llama: Mamá 1,2 / 1; Vecina Marta 1,3 / 0,9; Mejor amiga 1,4 / 1,1; Soporte Técnico 0,7 / 1; Hermano/a 1,1 / 1,15; Abuela 1,3 / 0,8; Cerrajero 0,6 / 0,95; Trabajo 0,8 / 1,05. La voz es del personaje: si se personaliza el nombre (R9), sigue siendo la del lugar. Se prefiere una voz en español (primero es-AR); si el navegador no tiene ninguna, se usa la voz por defecto con `lang` "es-AR". La lectura arranca directo en el clic de Atender, con `speechSynthesis.cancel()` antes y sin esperar `voiceschanged`.
- **R11:** los turnos de "vos" se leen SIEMPRE con una voz distinta a la de quien llama: otra voz en español si hay más de una (tono 1, velocidad 1); si hay una sola, la misma voz con tono 0,9 y velocidad 1,05. `elegirVoces(voces)` es una función pura. Se lee la conversación completa (llama, vos, llama, vos, llama) con 0,5 s entre turnos. Como las respuestas ya se leen siempre, se elimina el interruptor "Modo práctica".
- **R3:** credibilidad = base del nivel (94 / 78 / 52) − ganas. Tiempo de escape: 120 / 45 / 12 segundos.
- **R4:** sin lugar elegido, o con ganas fuera de 1–10, no hay rescate (`null`) y se muestra un aviso.
- **R5:** cada lugar y nivel tiene un `dialogo` de 5 turnos `{quien, texto}`: empieza con "llama", alterna con "vos" y es coherente con la excusa (`decir` es el primer turno de "vos"). Al atender, los turnos se revelan como chat (burbujas: izquierda quien llama, derecha vos). Todos los turnos se leen con `speechSynthesis` (voces en R10 y R11) y los de "vos" se resaltan "💬 Decí: ...". Sin soporte de voz, los de "llama" esperan 2,5 s y los de "vos" 3 s. Al terminar aparecen los pasos de escape y el botón Cortar. Cortar o rechazar frena la voz.
- **R6:** la demora puede ser Ya (0 s), 5 s o 10 s (por defecto, Ya). Con demora mayor a 0, entre inicio y sonando hay un estado `esperando` con cuenta regresiva en `#aviso` ("⏳ Sonando en N s..."), y RESCATAME queda deshabilitado.

## 6. Estados y transiciones
| Desde | Hacia | Evento |
|---|---|---|
| inicio | sonando | Clic en RESCATAME con lugar elegido y demora Ya |
| inicio | esperando | Clic en RESCATAME con lugar elegido y demora de 5 s o 10 s |
| esperando | sonando | La cuenta regresiva llega a 0 |
| sonando | en-llamada | Clic en 📞 Atender |
| sonando | fin | Clic en 📵 Rechazar |
| en-llamada | fin | Clic en 📵 Cortar y huir (solo visible cuando terminó la conversación) |
| fin | inicio | Clic en ← Volver |

**Cualquier otra transición es inválida y se ignora.**

## 7. Criterios de aceptación (Given / When / Then)
- **E1 (R4):** *Given* no elegí lugar, *When* toco RESCATAME, *Then* aparece "⚠️ Primero elegí dónde estás" y **no** cambia de pantalla.
- **E2 (R2):** *Given* elegí "Cumpleaños", *When* toco RESCATAME, *Then* suena una llamada de "Mamá" y el avatar vibra.
- **E3 (R1, R3):** *Given* "Cita" con ganas 9, *When* atiendo y termina la conversación, *Then* veo la excusa extrema, "Credibilidad: 43%" y "Escape en 12 s", y el contador de llamada avanzó mientras tanto.
- **E4:** *Given* está sonando, *When* toco Rechazar, *Then* se corta el sonido y veo "Rechazaste tu propio rescate".
- **E5:** *Given* estoy en la llamada y terminó la conversación, *When* toco Cortar, *Then* se frena el contador, se corta la voz y veo "¡Escapaste con éxito!".
- **E6:** *Given* estoy en el fin, *When* toco Volver, *Then* vuelvo al inicio con mi lugar y mis ganas **sin cambiar**.
- **E7 (R5):** *Given* atiendo una llamada, *When* pasan los turnos, *Then* las burbujas de quien llama aparecen a la izquierda y se leen en voz alta, mis frases aparecen a la derecha como "💬 Decí: ...", y al terminar los 5 turnos aparecen los pasos de escape y el botón Cortar.
- **E8 (R11):** *Given* atiendo una llamada, *When* llega un turno mío, *Then* se lee en voz alta con una voz distinta a la de quien llama, y los 5 turnos se leen en orden: llama, vos, llama, vos, llama.
- **E9 (R6):** *Given* elegí "Cumpleaños" y "5 s", *When* toco RESCATAME, *Then* veo "⏳ Sonando en 5 s..." bajando cada segundo, el botón queda deshabilitado y a los 5 s suena la llamada de "Mamá".
- **E10 (R2, R5):** *Given* elijo "Asado eterno" con ganas 5, *When* toco RESCATAME y atiendo, *Then* llama "Abuela" y la conversación habla de la luz cortada. Lo mismo vale para "Clase aburrida" (Hermano/a), "Reunión de consorcio" (Cerrajero) y "Sala de espera" (Trabajo).
- **E11 (R7):** *Given* el historial dice "Escapes exitosos: 0 · Rechazados: 0", *When* corto una llamada y después rechazo otra, *Then* al volver al inicio veo "🏃 Escapes exitosos: 1 · 😶 Rechazados: 1", y sigue así después de recargar la página.
- **E12 (R8):** *Given* estoy en el inicio sin elegir lugar, *When* toco la tecla R, *Then* se marca "Cumpleaños" y suena la llamada de "Mamá" (o empieza la cuenta regresiva si elegí demora). *Given* estoy escribiendo en un campo de texto o ya hay una llamada, *When* toco R, *Then* no pasa nada.
- **E13 (R9):** *Given* escribí "  Tía Rosa  " en el nombre y elegí "Cumpleaños", *When* toco RESCATAME, *Then* suena una llamada de "Tía Rosa" en vez de "Mamá". *Given* dejé el campo vacío, *Then* llama "Mamá".
- **E14 (CI):** *Given* hago push o abro un pull request a `main`, *When* termina el workflow "CI", *Then* `npm test` corrió con Node 22 y la pestaña Actions muestra el resultado (verde si pasan todos los tests).
- **E15 (R10):** *Given* elijo "Asado eterno" y después "Reunión de consorcio", *When* atiendo cada llamada, *Then* la Abuela suena aguda y lenta (tono 1,3 / velocidad 0,8) y el Cerrajero grave (tono 0,6 / velocidad 0,95). Con el nombre "Tía Rosa" la voz sigue siendo la del lugar.

## 8. Casos borde
- Ganas en los límites: 1, 3, 4, 7, 8 y 10 (cubiertos por los tests).
- Lugar inexistente o `null` → `null`.
- Doble clic en RESCATAME mientras suena: no aplica, porque el botón ya no está visible.
- `localStorage` bloqueado (ventana privada, permisos) o con datos corruptos: el historial arranca en 0 y la app funciona igual, sin guardar.
- Nombre con solo espacios, o de más de 20 caracteres: el primero se toma como vacío y el segundo se recorta a 20 (el campo además tiene `maxlength`).
- Los 8 lugares existen en los 3 niveles: un test recorre todos para que no falte ninguna combinación.
- Doble clic en RESCATAME durante la espera: se ignora, porque el botón está deshabilitado.
- Con demora el timbre suena fuera del clic: el audio se crea y se reanuda en el clic para que el navegador lo permita.
- Navegador sin `speechSynthesis`: los turnos de "llama" esperan 2,5 s y los de "vos" 3 s en silencio, y la conversación sigue igual.
- El navegador todavía no cargó las voces al atender: se habla igual con la voz por defecto y `lang` "es-AR", y los turnos siguientes vuelven a buscar voces en español.
- Una sola voz en español disponible: "vos" usa esa voz con tono 0,9 y velocidad 1,05, para que no suene igual que quien llama.
- Rechazar o cortar mientras habla la voz: se cancela la lectura y no se revela ningún turno más.

## 9. Accesibilidad
- Etiquetas `label`, `fieldset` y `legend` en el formulario. Todo se puede usar con teclado (Tab, flechas y Enter).
- Foco visible, botones de 44 px como mínimo y `aria-label` en los botones que solo tienen emoji.
- El chat vive dentro de la región `aria-live="polite"`, así que un lector de pantalla anuncia cada turno nuevo.
## 10. Plan
- HTML semántico, CSS con variables y JavaScript sin frameworks: se abre con doble clic.
- `rescate.js` tiene la lógica pura (testeable) y `app.js` la interfaz con el patrón **estado → render**.
- CI: `.github/workflows/ci.yml` corre `npm test` con Node 22 en cada push y pull request a `main`, y cancela la corrida anterior de la misma rama (`concurrency`).

## 11. Tareas y trazabilidad
| Tarea | Regla | Escenario | Evidencia |
|---|---|---|---|
| T1: Spec y README | — | — | Este archivo |
| T2: Estructura HTML | — | E1–E6 | `index.html` |
| T3: Estilos | — | E2 (vibración) | `style.css` |
| T4: Lógica y tests | R1–R4 | E2, E3 | `rescate.js` y `rescate.test.js` (`npm test` en verde) |
| T5: Interfaz y estados | Transiciones | E1–E6 | `app.js` y prueba manual en el navegador |
| T6: Conversación por turnos y voz | R5 | E3, E5, E7, E8 | `dialogos` en `rescate.js`, tests R5 y `app.js` |
| T7: Demora antes de la llamada | R6 | E9 | `index.html` (radios), `app.js` (estado `esperando`) y prueba manual |
| T8: Ocho lugares | R2, R5 | E10 | `LUGARES` en `rescate.js`, `index.html` (8 radios) y test de 8 lugares × 3 niveles |
| T9: Historial persistido | R7 | E11 | `registrarResultado` y sus tests en `rescate.js`, `localStorage` en `app.js` |
| T10: Atajo de teclado secreto | R8 | E12 | `app.js` (`rescatar()` y `keydown`) y prueba manual |
| T11: Nombre de contacto personalizado | R9 | E13 | `limpiarNombre` y `armarRescate` con tests en `rescate.js`, input en `index.html` |
| T12: Integración continua | R1–R9 | E14 | `.github/workflows/ci.yml` y la pestaña Actions de GitHub |
| T13: Voces por personaje y para las respuestas | R10, R11 | E7, E8, E15 | `voz` en `LUGARES` y `elegirVoces` con tests en `rescate.js`, `leer()` en `app.js` |

## 12. Preguntas abiertas
Ninguna crítica.

## 13. Anexo: código fuente
El código fuente vive en los archivos del repositorio: `index.html`, `style.css`, `rescate.js`, `rescate.test.js`, `package.json` y `app.js`.
