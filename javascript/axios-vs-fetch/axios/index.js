const btnGet = document.getElementById('btnGet');
const btnPost = document.getElementById('btnPost');
const out = document.getElementById('out');

function show(obj) {
    out.textContent = JSON.stringify(obj, null, 2);
}

btnGet.addEventListener('click', async () => {
    out.textContent = 'Loading...';
    try {
    // Axios throws an error for HTTP errors (4xx, 5xx), and gives you more context (status, response, etc)
    const response = await axios.get('https://jsonplaceholder.typicode.com/todoss/1');
    console.log(response);
    show({ method: 'GET', data: response.data });
    } catch (error) {
    console.error(error);
    const status = error?.response?.status;
    const body = error?.response?.data;
    out.textContent = `Error: ${error?.message ?? error}\nStatus: ${status ?? 'n/a'}\nBody: ${JSON.stringify(body, null, 2)}`;
    }
});

btnPost.addEventListener('click', async () => {
    out.textContent = 'Loading...';
    try {
    const payload = { title: 'hello', completed: false, userId: 123 };

    const response = await axios.post(
        'https://jsonplaceholder.typicode.com/todos',
        payload,
        { headers: { 'Accept': 'application/json' } }
    );

    show({ method: 'POST', sent: payload, data: response.data });
    } catch (error) {
    const status = error?.response?.status;
    const body = error?.response?.data;
    out.textContent = `Error: ${error?.message ?? error}\nStatus: ${status ?? 'n/a'}\nBody: ${JSON.stringify(body, null, 2)}`;
    }
});