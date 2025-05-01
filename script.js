// Nos conectamos a la API de TMDB
const API_KEY = 'e763d251eb0af389d35b9a55f74e7c83';
const API_URL = 'https://api.themoviedb.org/3/search/movie?api_key=' + API_KEY + '&language=es-ES&query=';

// Elementos del DOM
const buscarInput = document.getElementById('buscar');
const botonBuscar = document.getElementById('botonBuscar');
const peliculasContainer = document.getElementById('peliculas');
const favoritosContainer = document.getElementById('favoritos');
const vistasContainer = document.getElementById('vistas');

// Elementos del modal de descripción
const modal = document.getElementById('modalDescripcion');
const cerrarModal = document.getElementById('cerrarModal');
const modalImagen = document.getElementById('modalImagen');
const modalTitulo = document.getElementById('modalTitulo');
const modalFecha = document.getElementById('modalFecha');
const modalDescripcionTexto = document.getElementById('modalDescripcionTexto');

// Navegación al inicio
document.getElementById('irInicio').addEventListener('click', (e) => {
    e.preventDefault();
    buscarInput.value = '';
    peliculasContainer.innerHTML = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Cerrar la modal al hacer clic en la "X"
cerrarModal.addEventListener('click', () => {
    modal.classList.remove('mostrar');
});

// Abrir modal de descripción
function abrirModal(pelicula) {
    modalImagen.src = `https://image.tmdb.org/t/p/w500${pelicula.poster_path}`;
    modalTitulo.textContent = pelicula.title;
    modalFecha.textContent = `Año: ${pelicula.release_date ? pelicula.release_date.split('-')[0] : 'Desconocido'}`;
    modalDescripcionTexto.textContent = pelicula.overview || 'No hay descripción disponible.';
    modal.classList.add('mostrar');
}

// Buscar películas
async function buscarPeliculas() {
    const query = buscarInput.value.trim();
    if (query === '') {
        alert('Pon el nombre de una película para buscar');
        return;
    }
    try {
        const response = await fetch(API_URL + encodeURIComponent(query));
        const data = await response.json();
        mostrarPeliculas(data.results);
    } catch (error) {
        console.error('Error al buscar películas:', error);
    }
}

// Mostrar resultados de búsqueda
function mostrarPeliculas(peliculas) {
    peliculasContainer.innerHTML = '';

    if (peliculas.length === 0) {
        peliculasContainer.innerHTML = '<p>No se han encontrado datos sobre esa película.</p>';
        return;
    }

    const favoritas = JSON.parse(localStorage.getItem('favoritas')) || [];
    const vistas = JSON.parse(localStorage.getItem('vistas')) || [];

    peliculas.forEach((pelicula, index) => {
        const peliculaElemento = document.createElement('div');
        peliculaElemento.classList.add('pelicula');

        const esFavorita = favoritas.some(fav => fav.id == pelicula.id);
        const esVista = vistas.some(v => v.id == pelicula.id);

        peliculaElemento.innerHTML = `
            <img src="https://image.tmdb.org/t/p/w200${pelicula.poster_path}" alt="${pelicula.title}">
            <h3>${pelicula.title}</h3>
            <p>${pelicula.release_date ? pelicula.release_date.split('-')[0] : 'Fecha desconocida'}</p>
            <button class="botonFavoritas ${esFavorita ? 'activo' : ''}" 
                data-id="${pelicula.id}" 
                data-titulo="${pelicula.title}" 
                data-poster="${pelicula.poster_path}">
                ${esFavorita ? 'Eliminar' : 'Favorita'}
            </button>
            <button class="botonVista ${esVista ? 'activo' : ''}"
                data-id="${pelicula.id}" 
                data-titulo="${pelicula.title}" 
                data-poster="${pelicula.poster_path}">
                ${esVista ? 'Eliminar' : 'Vista'}
            </button>
            <button class="botonDescripcion">Ver descripción</button>
            <button class="botonTrailer "onclick="verTrailer(${pelicula.id})">🎬 Ver tráiler</button>
        `;

        peliculasContainer.appendChild(peliculaElemento);
    });

    document.querySelectorAll('.botonFavoritas').forEach(btn =>
        btn.addEventListener('click', toggleFavorito)
    );

    document.querySelectorAll('.botonVista').forEach(btn =>
        btn.addEventListener('click', toggleVista)
    );

    document.querySelectorAll('.botonDescripcion').forEach((btn, index) =>
        btn.addEventListener('click', () => abrirModal(peliculas[index]))
    );
}

// Favoritos
function toggleFavorito(event) {
    const { id, titulo, poster } = event.target.dataset;
    let favoritas = JSON.parse(localStorage.getItem('favoritas')) || [];

    favoritas = favoritas.some(p => p.id == id)
        ? favoritas.filter(p => p.id != id)
        : [...favoritas, { id, titulo, poster }];

    localStorage.setItem('favoritas', JSON.stringify(favoritas));
    mostrarFavoritos();
    buscarPeliculas();
}

function mostrarFavoritos() {
    const favoritas = JSON.parse(localStorage.getItem('favoritas')) || [];
    favoritosContainer.innerHTML = favoritas.length === 0
        ? '<p>No tienes películas favoritas</p>'
        : favoritas.map(p => `
            <div class="pelicula">
                <img src="https://image.tmdb.org/t/p/w200${p.poster}" alt="${p.titulo}">
                <h3>${p.titulo}</h3>
                <button class="eliminar-favorito" data-id="${p.id}">Eliminar</button>
            </div>
        `).join('');

    document.querySelectorAll('.eliminar-favorito').forEach(btn =>
        btn.addEventListener('click', eliminarFavorito)
    );
}

function eliminarFavorito(event) {
    const id = event.target.dataset.id;
    let favoritas = JSON.parse(localStorage.getItem('favoritas')) || [];
    favoritas = favoritas.filter(p => p.id != id);
    localStorage.setItem('favoritas', JSON.stringify(favoritas));
    mostrarFavoritos();
}

// Vistas
const getVistas = () => JSON.parse(localStorage.getItem('vistas')) || [];
const setVistas = vistas => localStorage.setItem('vistas', JSON.stringify(vistas));

function toggleVista(event) {
    const { id, titulo, poster } = event.target.dataset;
    let vistas = getVistas();

    vistas = vistas.some(p => p.id == id)
        ? vistas.filter(p => p.id != id)
        : [...vistas, { id, titulo, poster }];

    setVistas(vistas);
    mostrarVistas();
    buscarPeliculas();
}

function mostrarVistas() {
    const vistas = getVistas();
    vistasContainer.innerHTML = vistas.length === 0
        ? '<p>No tienes películas vistas</p>'
        : vistas.map(p => `
            <div class="pelicula">
                <img src="https://image.tmdb.org/t/p/w200${p.poster}" alt="${p.titulo}">
                <h3>${p.titulo}</h3>
                <button class="eliminar-vista" data-id="${p.id}">Eliminar</button>
            </div>
        `).join('');

    document.querySelectorAll('.eliminar-vista').forEach(btn =>
        btn.addEventListener('click', eliminarVista)
    );
}

function eliminarVista(event) {
    const id = event.target.dataset.id;
    let vistas = getVistas();
    vistas = vistas.filter(p => p.id != id);
    setVistas(vistas);
    mostrarVistas();
}

// Ver tráiler
async function verTrailer(id) {
    const url = `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}&language=es-ES`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        const trailer = data.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');

        if (trailer) {
            window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
        } else {
            alert('No se encontró un tráiler disponible.');
        }
    } catch (err) {
        console.error('Error al obtener el tráiler:', err);
        alert('No se pudo cargar el tráiler.');
    }
}

// Eventos
botonBuscar.addEventListener('click', buscarPeliculas);
buscarInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') buscarPeliculas();
});

document.addEventListener('DOMContentLoaded', () => {
    mostrarFavoritos();
    mostrarVistas();
});
