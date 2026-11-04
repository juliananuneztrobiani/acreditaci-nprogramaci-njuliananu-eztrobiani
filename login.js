
if (sessionStorage.getItem('token')) {
    location.href = 'panel.html';
}
const formLogin = document.getElementById('form-login');
const avisoLogin = document.getElementById('aviso');

formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value.trim();
    const password = document.getElementById('password').value;
    if (!usuario || !password) {
        avisoLogin.textContent = 'Completá usuario y contraseña.';
        avisoLogin.classList.remove('oculto');
        return;
    }
    try {
        const respuesta = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ usuario, password })
        });
        const datos = await respuesta.json();
        if (!respuesta.ok) {
            throw new Error(datos.error || 'Usuario o contraseña incorrectos.');
        }
        sessionStorage.setItem('token', datos.token);

        location.href = 'panel.html';

    } catch (error) {
        console.error('Error al iniciar sesión:', error);

        avisoLogin.textContent = error.message || 'No se pudo ingresar.';
        avisoLogin.classList.remove('oculto');
    }
});

