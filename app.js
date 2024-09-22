// Función para decodificar la configuración de Firebase
function decodeFirebaseConfig(encodedConfig) {
    return JSON.parse(atob(encodedConfig));
}

// Configuración de Firebase codificada
const encodedFirebaseConfig = 'eyJhcGlLZXkiOiJBSXphU3lES0VjR2NUblFicmdzdXZfSTBua3QwelJlR09SWEdMbmMiLCJhdXRoRG9tYWluIjoid2ViYXBwY29weS5maXJlYmFzZWFwcC5jb20iLCJkYXRhYmFzZVVSTCI6Imh0dHBzOi8vd2ViYXBwY29weS1kZWZhdWx0LXJ0ZGIuZmlyZWJhc2Vpby5jb20iLCJwcm9qZWN0SWQiOiJ3ZWJhcHBjb3B5Iiwic3RvcmFnZUJ1Y2tldCI6IndlYmFwcGNvcHkuYXBwc3BvdC5jb20iLCJtZXNzYWdpbmdTZW5kZXJJZCI6IjM5MTk4MTY0Mjg4MCIsImFwcElkIjoiMTozOTE5ODE2NDI4ODA6d2ViOjVjODllMWFhOGVmODc1Mzg2NzYyNjUifQ==';

// Hash de la contraseña (no codificado)
const correctPasswordHash = 'Tm9wZdEvKi0rMA==';

// Pide la contraseña al cargar la página
const enteredPassword = prompt("Ingresa la contraseña:");
const enteredPasswordHash = btoa(enteredPassword);

if (enteredPasswordHash !== correctPasswordHash) {
    alert("Contraseña incorrecta. Recarga la página para intentar de nuevo.");
    document.body.innerHTML = "<h1>Acceso denegado</h1>";
} else {
    // Decodifica y configura Firebase
    const firebaseConfig = decodeFirebaseConfig(encodedFirebaseConfig);
    firebase.initializeApp(firebaseConfig);

    const database = firebase.database();
    const contentRef = database.ref('sharedContent');

    const contentTextarea = document.getElementById('content');
    const saveBtn = document.getElementById('saveBtn');
    const savedContentDiv = document.getElementById('savedContent');

    // Cargar contenido guardado
    function loadContent() {
        contentRef.once('value').then(snapshot => {
            const data = snapshot.val();
            if (data && data.messages) {
                const messages = data.messages;
                savedContentDiv.innerHTML = '';
                Object.keys(messages).forEach(key => {
                    const messageDiv = document.createElement('div');
                    messageDiv.textContent = messages[key].content;
                    savedContentDiv.appendChild(messageDiv);
                });
            } else {
                savedContentDiv.textContent = 'No hay contenido guardado';
            }
        }).catch(error => {
            console.error('Error al cargar:', error);
            savedContentDiv.textContent = 'Error al cargar el contenido';
        });
    }

    // Guardar contenido
    saveBtn.addEventListener('click', () => {
        const content = contentTextarea.value;
        if (content.trim() !== '') {
            contentRef.once('value').then(snapshot => {
                const data = snapshot.val();
                let messages = data && data.messages ? data.messages : {};
                const timestamp = Date.now();
                messages[timestamp] = { content: content };
                contentRef.set({ messages: messages }).then(() => {
                    loadContent();
                    contentTextarea.value = '';
                }).catch(error => console.error('Error al guardar:', error));
            });
        }
    });

    // Cargar contenido al iniciar
    loadContent();
}