# Django + React Integration (PoC)

This project demonstrates a minimal and modern integration between
**Django (v4.2)** and **React (v17)** without using a full SPA or React
Router. Django handles routing and template rendering, while React is
mounted as small "islands" inside Django templates.

## Tech Stack

- **Backend:** Django 4.2 (Python 3.10+)
- **Frontend:** React 17 + Webpack  + Babel
- **Build Output:** Single bundle (`main.js`) copied to Django's
    static files

## Project Structure

    backend/
      manage.py
      myproject/
      core/
        templates/
          base.html
          core/home.html
          core/about.html
      static/
        frontend/main.js   ← generated bundle from Webpack

    frontend/
      package.json
      webpack.config.js
      src/
        index.js
        Home.js
        About.js

## How It Works

1. **Django renders normal HTML templates** for each route (`/`,
    `/about/`).

2. Each template includes a `<div>` with attributes:

    ``` html
    <div data-react-component="Home"
         data-react-props='{"pageTitle": "Home Page"}'></div>
    ```

3. **React mounts automatically** on each component container based on\
    `data-react-component` + `data-react-props`.

4. Webpack builds a single bundle:

        npm run build → frontend/dist/main.js

5. The bundle is copied into `backend/static/frontend/main.js` and
    loaded in `base.html`.

## Development Commands

### Backend

``` bash
cd backend
python -m venv venv
source venv/bin/activate 
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend

``` bash
cd frontend
npm install
npm run build
# copy dist/main.js → backend/static/frontend/main.js
```

## Purpose of This PoC

- Keep Django in control of routing and HTML rendering.
- Use React only where interactive components are needed.
- Provide a simple, predictable build workflow using Webpack.
- Avoid the complexity of a full SPA while still benefiting from
    React.
