const form = document.querySelector("#registro-form");
const estado = document.querySelector("#estado");
const boton = document.querySelector("#enviar");
const categorias = document.querySelector("#categorias");
const popupEstado = document.querySelector("#popup-estado");
const popupIcono = document.querySelector("#popup-icono");
const popupTitulo = document.querySelector("#popup-titulo");
const popupMensaje = document.querySelector("#popup-mensaje");
const cerrarPopup = document.querySelector("#cerrar-popup");
const campoCodigo = form.elements.Cod_prestador;
const campoInstitucion = form.elements.Institucion;
const campoSinCodigo = document.querySelector("#sin-codigo-prestador");
const campoCorreo = form.elements.Correo;
const campoConfirmarCorreo = form.elements.ConfirmarCorreo;
const prestadores = Array.isArray(window.PRESTADORES) ? window.PRESTADORES : [];
const listaCodigos = document.querySelector("#lista-codigos");
const listaInstituciones = document.querySelector("#lista-instituciones");
const fechaActualBogota = () => new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Bogota",
  year: "numeric",
  month: "2-digit",
  day: "2-digit"
}).format(new Date());
document.querySelector('[name="Fecha_Diligenciamiento"]').value = fechaActualBogota();

for (const prestador of prestadores) {
  const opcionCodigo = document.createElement("option");
  opcionCodigo.value = prestador.codigo;
  opcionCodigo.label = prestador.institucion;
  listaCodigos.append(opcionCodigo);

  const opcionInstitucion = document.createElement("option");
  opcionInstitucion.value = prestador.institucion;
  opcionInstitucion.label = prestador.codigo;
  listaInstituciones.append(opcionInstitucion);
}

function validarCodigoPrestador() {
  if (campoSinCodigo.checked) {
    campoCodigo.setCustomValidity("");
    return;
  }
  campoCodigo.value = campoCodigo.value.replace(/\D/g, "").slice(0, 12);
  if (campoCodigo.value && !campoCodigo.value.startsWith("11001")) {
    campoCodigo.value = "11001";
  }
  campoCodigo.setCustomValidity(
    campoCodigo.value && !/^(?:11001\d{7}|1100104035)$/.test(campoCodigo.value)
      ? "El código del prestador debe tener 12 dígitos y comenzar por 11001, salvo códigos autorizados del catálogo."
      : ""
  );
}

campoCodigo.addEventListener("focus", () => {
  if (!campoCodigo.value) campoCodigo.value = "11001";
});

campoSinCodigo.addEventListener("change", () => {
  if (campoSinCodigo.checked) {
    campoCodigo.value = "";
    campoCodigo.required = false;
    campoCodigo.disabled = true;
    campoCodigo.setCustomValidity("");
  } else {
    campoCodigo.disabled = false;
    campoCodigo.required = true;
    campoCodigo.focus();
    validarCodigoPrestador();
  }
});

campoCodigo.addEventListener("input", () => {
  validarCodigoPrestador();
  const coincidencia = prestadores.find(item => item.codigo === campoCodigo.value);
  if (coincidencia) campoInstitucion.value = coincidencia.institucion;
});

campoInstitucion.addEventListener("change", () => {
  const nombre = campoInstitucion.value.trim().toLocaleLowerCase("es-CO");
  const coincidencia = prestadores.find(item => item.institucion.trim().toLocaleLowerCase("es-CO") === nombre);
  if (coincidencia && !campoSinCodigo.checked) {
    campoCodigo.value = coincidencia.codigo;
    validarCodigoPrestador();
  }
});

function validarConfirmacionCorreo() {
  campoConfirmarCorreo.setCustomValidity(
    campoConfirmarCorreo.value && campoConfirmarCorreo.value.trim().toLocaleLowerCase() !== campoCorreo.value.trim().toLocaleLowerCase()
      ? "Los correos electrónicos no coinciden."
      : ""
  );
}

campoCorreo.addEventListener("input", validarConfirmacionCorreo);
campoConfirmarCorreo.addEventListener("input", validarConfirmacionCorreo);

for (let numero = 1; numero <= 4; numero += 1) {
  categorias.insertAdjacentHTML("beforeend", `<tr>
    <th>Categoría ${numero}</th>
    <td data-label="Total de trabajadores"><input name="Cat${numero}Total" aria-label="Total categoría ${numero}" type="number" min="0" step="1" required></td>
    <td data-label="Trabajadores capacitados"><input name="Cat${numero}Capacitados" aria-label="Capacitados categoría ${numero}" type="number" min="0" step="1" required></td>
    <td data-label="Indicador"><output id="cat${numero}Indicador">0,00 %</output></td></tr>`);
}

const porcentaje = (parte, total) => total > 0 ? (parte / total) * 100 : 0;
const mostrarPorcentaje = valor => `${valor.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;

function recalcular() {
  const campoPuntos = form.elements.PuntosAtencion;
  const campoConElementos = form.elements.PuntosConElementos;
  const puntos = Number(campoPuntos.value) || 0;
  let conElementos = Number(campoConElementos.value) || 0;
  campoConElementos.max = String(puntos);
  if (conElementos > puntos) {
    conElementos = puntos;
    campoConElementos.value = String(puntos);
  }
  document.querySelector("#indicadorInfraestructura").value = `Indicador: ${mostrarPorcentaje(porcentaje(conElementos, puntos))}`;
  let totalTrabajadores = 0, totalCapacitados = 0;
  for (let numero = 1; numero <= 4; numero += 1) {
    const campoTotal = form.elements[`Cat${numero}Total`];
    const campoCapacitados = form.elements[`Cat${numero}Capacitados`];
    const total = Number(campoTotal.value) || 0;
    let capacitados = Number(campoCapacitados.value) || 0;
    campoCapacitados.max = String(total);
    if (capacitados > total) {
      capacitados = total;
      campoCapacitados.value = String(total);
    }
    campoCapacitados.setCustomValidity("");
    totalTrabajadores += total; totalCapacitados += capacitados;
    document.querySelector(`#cat${numero}Indicador`).value = mostrarPorcentaje(porcentaje(capacitados, total));
  }
  document.querySelector("#totalTrabajadores").textContent = totalTrabajadores;
  document.querySelector("#totalCapacitados").textContent = totalCapacitados;
  document.querySelector("#indicadorCapacitacion").textContent = mostrarPorcentaje(porcentaje(totalCapacitados, totalTrabajadores));
}

function mostrarEstado(mensaje, tipo = "") { estado.textContent = mensaje; estado.className = `estado ${tipo}`; }
function mostrarPopup(tipo, titulo, mensaje) {
  popupIcono.className = `popup-icono ${tipo}`;
  popupTitulo.textContent = titulo;
  popupMensaje.textContent = mensaje;
  cerrarPopup.hidden = tipo !== "error";
  popupEstado.hidden = false;
}
function ocultarPopup() { popupEstado.hidden = true; }
cerrarPopup.addEventListener("click", ocultarPopup);
form.addEventListener("input", event => {
  if (event.target instanceof HTMLInputElement && event.target.type === "number") {
    event.target.value = event.target.value.replace(/^0+(?=\d)/, "");
  }
  recalcular();
});
form.addEventListener("submit", async event => {
  event.preventDefault();
  const endpoint = window.APP_CONFIG?.powerAutomateUrl?.trim();
  if (!endpoint) return mostrarEstado("Falta configurar la URL de Power Automate en config.js.", "error");
  const datos = Object.fromEntries(new FormData(form).entries());
  datos.Cod_prestador = campoSinCodigo.checked ? "111111111111" : campoCodigo.value;
  delete datos.ConfirmarCorreo;
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
  mostrarPopup("cargando", "Guardando información", "Por favor espere mientras procesamos el registro.");
  try {
    const respuesta = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json;charset=UTF-8" }, body: JSON.stringify(datos) });
    if (!respuesta.ok) throw new Error(`HTTP ${respuesta.status}`);
    form.reset(); campoCodigo.disabled = false; campoCodigo.required = true; form.elements.Fecha_Diligenciamiento.value = fechaActualBogota(); recalcular(); mostrarEstado("Notificación guardada correctamente.", "ok");
    mostrarPopup("ok", "Registro enviado", "La información fue guardada correctamente. Recibirá la confirmación en su correo electrónico.");
    setTimeout(ocultarPopup, 2800);
  } catch (error) { console.error(error); mostrarEstado("No fue posible guardar. Revise la conexión e intente de nuevo.", "error"); mostrarPopup("error", "No fue posible enviar", "Ocurrió un error al guardar la información. Cierre este mensaje e intente nuevamente."); }
  finally { boton.disabled = false; }
});
recalcular();
