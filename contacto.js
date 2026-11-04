const form = document.getElementById('form-contacto');
if (form) {
    const aviso = document.getElementById('aviso');
    const boton = document.getElementById('btn-enviar');
    function mostrarError(campo, texto) {
        const elemento = document.querySelector(`[data-error="${campo}"]`);
        if (elemento) {
            elemento.textContent = texto;
        }
    }
    function validar(datos) {
        let ok = true;
        ['nombre', 'email', 'telefono', 'asunto', 'mensaje'].forEach(campo => {
            mostrarError(campo, '');
        });
        if (datos.nombre.trim().length < 2) {
            mostrarError('nombre', 'Escribí tu nombre.');
            ok = false;
        }
        if (!/^\S+@\S+\.\S+$/.test(datos.email.trim())) {
            mostrarError('email', 'Escribí un email válido.');
            ok = false;
        }
        if (
            datos.telefono.trim() &&
            !/^[0-9+\s()-]{6,20}$/.test(datos.telefono.trim())
        ) {
            mostrarError('telefono', 'Usá un teléfono válido.');
            ok = false;
        }
        if (datos.asunto.trim().length < 3) {
            mostrarError('asunto', 'Escribí el asunto.');
            ok = false;
        }
        if (datos.mensaje.trim().length < 10) {
            mostrarError('mensaje', 'El mensaje debe tener al menos 10 caracteres.');
            ok = false;
        }
        return ok;
    }
    function mostrarAviso(texto, tipo) {
        aviso.textContent = texto;
        aviso.className = 'aviso ' + tipo;
    }
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const datos = Object.fromEntries(new FormData(form));
        if (!validar(datos)) return;
        boton.disabled = true;
        boton.textContent = 'Enviando...';
        try {
            const respuesta = await fetch('/api/consultas', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos)
            });
            const resultado = await respuesta.json();
            if (!respuesta.ok) {
                throw new Error(
                    resultado.mensaje ||
                    resultado.error ||
                    'No se pudo enviar la consulta.'
                );
            }
            mostrarAviso(
                '¡Gracias! Recibimos tu consulta correctamente.',
                'ok'
            );
            form.reset();
        } catch (error) {
            console.error('Error al enviar la consulta:', error);
            mostrarAviso(
                error.message || 'Ocurrió un error al enviar la consulta.',
                'mal'
            );
        } finally {
            boton.disabled = false;
            boton.textContent = 'Enviar consulta';
        }
    });
}
