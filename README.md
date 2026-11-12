# 🚨 Llamada de Rescate

**Pabellón:** Molestias Cotidianas
**Ingrediente improbable:** Botón de emergencia

## El problema
Todos quedamos alguna vez atrapados en un cumpleaños aburrido, una reunión familiar eterna, una cita que va mal o una reunión de trabajo interminable. Nos queremos ir, pero no sabemos cómo hacerlo sin quedar mal.

## La solución
Llamada de Rescate es un botón de emergencia para huir con dignidad. Elegís dónde estás y cuántas ganas tenés de irte, apretás **RESCATAME** y tu pantalla recibe una **llamada entrante falsa** con sonido, que podés mostrarles a los demás. Al atender, te da un **guion de escape**: qué decir en voz alta y qué pasos seguir.

Lo distinto: la excusa se adapta al lugar y a tu desesperación. Cuantas más ganas tenés de irte, más dramática es la excusa y más rápido salís, aunque sea menos creíble.

## Características
- 🗣️ Conversación por turnos al atender: burbujas de chat, con la voz de quien llama (`speechSynthesis`).
- 🔊 Modo práctica: también lee tus frases para ensayarlas.
- 📍 Ocho lugares, cada uno con su llamador, su excusa y su diálogo en tres niveles de desesperación.
- 🏆 Historial de escapes y rechazos, guardado en el navegador (`localStorage`).
- 👤 Nombre personalizado: elegís quién te llama (hasta 20 caracteres).
- ⌨️ Atajo secreto: la tecla **R** dispara el rescate sin tocar el mouse.
- ⏳ Demora configurable: la llamada suena ya, a los 5 s o a los 10 s, con cuenta regresiva.

## Cómo probarlo
1. Descargar el repositorio y abrir `index.html` en el navegador (doble clic, no hace falta instalar nada).
2. Elegir dónde estás, mover la barra de ganas y apretar el botón rojo **RESCATAME**.
3. Debería sonar una llamada entrante. Con 📞 aparece el guion de escape y con 📵 terminás la huida.

**Tests** (requiere Node 18 o superior): `npm test`

## Estructura
| Archivo | Qué hace |
|---|---|
| `index.html` | Las dos pantallas, con HTML semántico y accesible |
| `style.css` | Diseño con variables CSS, Grid y Flexbox, y animaciones |
| `rescate.js` | Lógica pura: datos y la función central `armarRescate(lugar, ganas)` |
| `app.js` | Interfaz: `estado`, `render()` y transiciones entre pantallas |
| `rescate.test.js` | Tests de las reglas R1 a R5 |
| `SPEC.md` | Especificación completa (reglas, estados y criterios de aceptación) |

## Herramientas de IA utilizadas
- **Claude (Anthropic):** para leer las bases, generar y comparar ideas, redactar la spec, escribir el código y los tests, y armar este README. Yo elegí la idea, el pabellón y el ingrediente, revisé el código y probé que funcionara.
