import json
from django.shortcuts import render

def home(request):
    initial_props = {
        "username": request.user.username or "Guest",
        "pageTitle": "Home Page",
    }

    return render(request, "core/home.html", {
        "initial_props": initial_props,
        "initial_props_json": json.dumps(initial_props),
    })


def about(request):
    initial_props = {
        "pageTitle": "About Page",
        "description": "This is a simple Django + React PoC.",
    }

    return render(request, "core/about.html", {
        "initial_props": initial_props,
        "initial_props_json": json.dumps(initial_props),
    })
