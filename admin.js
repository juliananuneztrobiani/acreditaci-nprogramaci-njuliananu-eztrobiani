if (!token) {
  location.href = 'login.html';
}
const $ = (id) => document.getElementById(id);
let consultaAbierta = null;
let consultasCargadas = [];
async function api(url, opciones = {}) {
  const respuesta = await fetch(url, {
    ...opciones,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token,
      ...opciones.headers
    }
  });

  if (respuesta.status === 401) {
    sessionStorage.removeItem('token');
    location.href = 'login.html';
    throw new Error('Tu sesión expiró. Iniciá sesión nuevamente.');
  }
  const datos = await respuesta.json();
  if (!respuesta.ok) {
    throw new Error(datos.mensaje || datos.error || 'Ocurrió un error.');
  }
  return datos;
}
function fechaLinda(texto) {
  if (!texto) return 'Sin fecha';
  const fecha = new Date(texto);
  if (isNaN(fecha.getTime())) return texto;
  return fecha.toLocaleString('es-AR', {
    dateStyle: 'short',
    timeStyle: 'short'
  });
}
function mostrarError(texto) {
  const aviso = $('aviso');
  aviso.textContent = texto;
  aviso.classList.toggle('oculto', !texto);
}
async function cargarLista() {
  const cuerpo = $('filas');
  cuerpo.innerHTML = '<tr><td colspan="5">Cargando consultas...</td></tr>';
  try {
    const consultas = await api('/api/consultas');
    consultasCargadas = consultas
    aplicarFiltros();
    mostrarError('');
  } catch (error) {
    cuerpo.innerHTML = '';
    mostrarError(error.message);
  }
}
function aplicarFiltros() {
  const busqueda = $('f-q').value.trim().toLowerCase();
  const estado = $('f-estado').value;
  const fecha = $('f-fecha').value;
  let consultas = consultasCargadas.filter((c) => {
    const coincideTexto =
      (c.nombre || '').toLowerCase().includes(busqueda) ||
      (c.email || '').toLowerCase().includes(busqueda);
    const estaLeida = Boolean(Number(c.leida));
    const coincideEstado =
      estado === '' ||
      (estado === 'leida' && estaLeida) ||
      (estado === 'noleida' && !estaLeida);
    const coincideFecha =
      fecha === '' ||
      (c.fecha && new Date(c.fecha).toLocaleDateString('en-CA') === fecha);
    return coincideTexto && coincideEstado && coincideFecha;
  });
  mostrarFilas(consultas);
}
function mostrarFilas(consultas) {
  const cuerpo = $('filas');
  cuerpo.innerHTML = '';
  const sinLeer = consultasCargadas.filter(
    (c) => !Boolean(Number(c.leida))
  ).length;
  $('resumen').textContent =
    `${consultasCargadas.length} consultas recibidas (${sinLeer} sin leer)`;
  if (consultas.length === 0) {
    const fila = cuerpo.insertRow();
    const celda = fila.insertCell();
    celda.colSpan = 5;
    celda.textContent = 'No hay consultas con esos filtros.';
    return;
  }
  consultas.forEach((c) => {
    const fila = cuerpo.insertRow();
    const leida = Boolean(Number(c.leida));
    if (!leida) {
      fila.classList.add('no-leida');
    }
    fila.tabIndex = 0;
    fila.style.cursor = 'pointer';
    [c.nombre, c.email, c.asunto || 'Sin asunto', fechaLinda(c.fecha)]
      .forEach((texto) => {
        fila.insertCell().textContent = texto || 'No indicado';
      });
    const estado = document.createElement('span');
    estado.className = 'estado ' + (leida ? 'vista' : 'nueva');
    estado.textContent = leida ? 'Leída' : 'Nueva';
    fila.insertCell().append(estado);
    fila.addEventListener('click', () => abrirDetalle(c.id));
    fila.addEventListener('keydown', (evento) => {
      if (evento.key === 'Enter') {
        abrirDetalle(c.id);
      }
    });
  });
}
async function abrirDetalle(id) {
  try {
    const consulta = await api('/api/consultas/' + id);
    consultaAbierta = consulta;
    $('d-asunto').textContent = consulta.asunto || 'Consulta sin asunto';
    $('d-nombre').textContent = consulta.nombre || 'No indicado';
    $('d-email').textContent = consulta.email || 'No indicado';
    $('d-telefono').textContent = consulta.telefono || 'No indicó';
    $('d-fecha').textContent = fechaLinda(consulta.fecha);
    $('d-mensaje').textContent = consulta.mensaje || 'Sin mensaje';
    const leida = Boolean(Number(consulta.leida));
    $('btn-leida').textContent = leida
      ? 'Marcar como no leída'
      : 'Marcar como leída';
    $('detalle').classList.remove('oculto');
    $('detalle').scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  } catch (error) {
    mostrarError(error.message);
  }
}
$('btn-leida').addEventListener('click', async () => {
  if (!consultaAbierta) return;
  const nuevoEstado = !Boolean(Number(consultaAbierta.leida));
  try {
    await api(`/api/consultas/${consultaAbierta.id}/leida`, {
      method: 'PUT',
      body: JSON.stringify({ leida: nuevoEstado })
    });
    consultaAbierta.leida = nuevoEstado ? 1 : 0;
    $('btn-leida').textContent = nuevoEstado
      ? 'Marcar como no leída'
      : 'Marcar como leída';
    await cargarLista();
  } catch (error) {
    mostrarError(error.message);
  }
});
$('btn-cerrar-detalle').addEventListener('click', () => {
  $('detalle').classList.add('oculto');
  consultaAbierta = null;
});
['f-q', 'f-estado', 'f-fecha'].forEach((id) => {
  $(id).addEventListener('input', aplicarFiltros);
});
$('btn-limpiar').addEventListener('click', () => {
  $('f-q').value = '';
  $('f-estado').value = '';
  $('f-fecha').value = '';
  aplicarFiltros();
});
$('filtros').addEventListener('submit', (evento) => {
  evento.preventDefault();
});
$('btn-salir').addEventListener('click', () => {
  sessionStorage.removeItem('token');
  location.href = 'login.html';
});
const botonActualizar = document.createElement('button');
botonActualizar.type = 'button';
botonActualizar.className = 'boton';
botonActualizar.textContent = '↻ Actualizar';
$('filtros').append(botonActualizar);
botonActualizar.addEventListener('click', cargarLista);
cargarLista();