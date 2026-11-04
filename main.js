const listaServicios = document.getElementById('lista-servicios');
const servicios = [
    {
        titulo: 'Mantenimiento de computadoras',
        descripcion: 'Limpieza, revisión y mantenimiento preventivo para mejorar el funcionamiento de tus equipos.'
    },
    {
        titulo: 'Instalación y configuración de equipos',
        descripcion: 'Instalación de componentes, sistemas operativos, programas y dispositivos.'
    },
    {
        titulo: 'Diagnóstico y reparación de problemas',
        descripcion: 'Identificación de fallas de hardware y software para encontrar posibles soluciones.'
    },
    {
        titulo: 'Instalación y configuración de redes',
        descripcion: 'Conexión y configuración de equipos para facilitar la comunicación y el acceso a la red.'
    },
    {
        titulo: 'Respaldo y recuperación de datos',
        descripcion: 'Copias de seguridad y recuperación de archivos e información cuando sea posible.'
    },
    {
        titulo: 'Protección y seguridad informática',
        descripcion: 'Instalación y actualización de antivirus y medidas para proteger la información.'
    },
    {
        titulo: 'Asesoramiento y capacitación informática',
        descripcion: 'Ayuda y orientación para aprender a utilizar equipos, programas y herramientas informáticas.'
    },
    {
        titulo: 'Armado y actualización de computadoras',
        descripcion: 'Selección, instalación y reemplazo de componentes según las necesidades y el presupuesto.'
    },
    {
        titulo: 'Optimización de equipos y programas',
        descripcion: 'Configuración y ajustes para mejorar el rendimiento y facilitar el uso de los equipos.'
    }
];
if (listaServicios) {
    listaServicios.innerHTML = '';
    servicios.forEach((servicio, indice) => {
        const tarjeta = document.createElement('article');
        tarjeta.className = 'servicio-card';
        const titulo = document.createElement('h3');
        titulo.textContent = servicio.titulo;
        const descripcion = document.createElement('p');
        descripcion.textContent = servicio.descripcion;
        tarjeta.appendChild(titulo);
        tarjeta.appendChild(descripcion);
        listaServicios.appendChild(tarjeta);
    });
}
