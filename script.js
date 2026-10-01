const form = document.querySelector("#registro-form");
const estado = document.querySelector("#estado");
const boton = document.querySelector("#enviar");
const categorias = document.querySelector("#categorias");
document.querySelector('[name="Fecha_Diligenciamiento"]').value = new Date().toISOString().slice(0, 10);

for (let numero = 1; numero <= 4; numero += 1) {
  categorias.insertAdjacentHTML("beforeend", `<tr>
    <th>Categoría ${numero}</th>
    <td><input name="Cat${numero}Periodo" aria-label="Periodo categoría ${numero}" placeholder="Ej. enero a marzo" required></td>
    <td><input name="Cat${numero}Total" aria-label="Total categoría ${numero}" type="number" min="0" step="1" value="0" required></td>
    <td><input name="Cat${numero}Capacitados" aria-label="Capacitados categoría ${numero}" type="number" min="0" step="1" value="0" required></td>
    <td><output id="cat${numero}Indicador">0,00 %</output></td></tr>`);
}

const porcentaje = (parte, total) => total > 0 ? (parte / total) * 100 : 0;
const mostrarPorcentaje = valor => `${valor.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;

function recalcular() {
  const puntos = Number(form.elements.PuntosAtencion.value) || 0;
  const conElementos = Number(form.elements.PuntosConElementos.value) || 0;
  document.querySelector("#indicadorInfraestructura").value = `Indicador: ${mostrarPorcentaje(porcentaje(conElementos, puntos))}`;
  let totalTrabajadores = 0, totalCapacitados = 0;
  for (let numero = 1; numero <= 4; numero += 1) {
    const total = Number(form.elements[`Cat${numero}Total`].value) || 0;
    const capacitados = Number(form.elements[`Cat${numero}Capacitados`].value) || 0;
    totalTrabajadores += total; totalCapacitados += capacitados;
    document.querySelector(`#cat${numero}Indicador`).value = mostrarPorcentaje(porcentaje(capacitados, total));
  }
  document.querySelector("#totalTrabajadores").textContent = totalTrabajadores;
  document.querySelector("#totalCapacitados").textContent = totalCapacitados;
  document.querySelector("#indicadorCapacitacion").textContent = mostrarPorcentaje(porcentaje(totalCapacitados, totalTrabajadores));
}

function mostrarEstado(mensaje, tipo = "") { estado.textContent = mensaje; estado.className = `estado ${tipo}`; }
form.addEventListener("input", recalcular);
form.addEventListener("submit", async event => {
  event.preventDefault();
  const endpoint = window.APP_CONFIG?.powerAutomateUrl?.trim();
  if (!endpoint) return mostrarEstado("Falta configurar la URL de Power Automate en config.js.", "error");
  const datos = Object.fromEntries(new FormData(form).entries());
  const puntos = Number(datos.PuntosAtencion), conElementos = Number(datos.PuntosConElementos);
  if (conElementos > puntos) return mostrarEstado("Los puntos con elementos básicos no pueden superar los puntos de atención.", "error");
  datos.IndicadorInfraestructura = porcentaje(conElementos, puntos).toFixed(2);
  let totalTrabajadores = 0, totalCapacitados = 0;
  for (let numero = 1; numero <= 4; numero += 1) {
    const total = Number(datos[`Cat${numero}Total`]), capacitados = Number(datos[`Cat${numero}Capacitados`]);
    if (capacitados > total) return mostrarEstado(`En la categoría ${numero}, los capacitados no pueden superar el total.`, "error");
    datos[`Cat${numero}Indicador`] = porcentaje(capacitados, total).toFixed(2);
    totalTrabajadores += total; totalCapacitados += capacitados;
  }
  Object.assign(datos, { TotalTrabajadores: String(totalTrabajadores), TotalCapacitados: String(totalCapacitados), IndicadorCapacitacion: porcentaje(totalCapacitados, totalTrabajadores).toFixed(2), ID: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}` });
  boton.disabled = true; mostrarEstado("Guardando…");
  try {
    const respuesta = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json;charset=UTF-8" }, body: JSON.stringify(datos) });
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    form.reset(); form.elements.Fecha_Diligenciamiento.value = new Date().toISOString().slice(0, 10); recalcular(); mostrarEstado("Notificación guardada correctamente.", "ok");
  } catch (error) { console.error(error); mostrarEstado("No fue posible guardar. Revise el flujo e intente de nuevo.", "error"); }
  finally { boton.disabled = false; }
});
recalcular();
