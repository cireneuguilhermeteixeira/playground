
const btnGet = document.getElementById('btnGet');
const btnPost = document.getElementById('btnPost');
const out = document.getElementById('out');

function show(obj) {
    out.textContent = JSON.stringify(obj, null, 2);
}

btnGet.addEventListener('click', async () => {
    out.textContent = 'Loading...';
    try {
    const response = await fetch('https://jsonplaceholder.typicode.com/todoss/1');
    console.log(response);

    // fetch DO NOT throw an error for HTTP errors (4xx, 5xx) - you need to check response.ok and handle it yourself. Also, you don't get any context (status, response, etc) in the error, you need to get it yourself from the response object.
    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status} ${response.statusText} - ${text}`);
    }

    const data = await response.json();
    show({ method: 'GET', data });
    } catch (error) {
    console.error(error);
    out.textContent = `Error: ${error?.message ?? error}`;
    }
});

btnPost.addEventListener('click', async () => {
    out.textContent = 'Loading...';
    try {
    const payload = { title: 'hello', completed: false, userId: 123 };

    const response = await fetch('https://jsonplaceholder.typicode.com/todos', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const text = await response.text().catch(() => '');
        throw new Error(`HTTP ${response.status} ${response.statusText} - ${text}`);
    }

    const data = await response.json();
    show({ method: 'POST', sent: payload, data });
    } catch (error) {
    out.textContent = `Error: ${error?.message ?? error}`;
    }
});
