# Containerized

A simple repository using `docker-compose` to run a backend powered by [Django](https://www.djangoproject.com/) and a React SSR client powered using [Razzle](https://github.com/jaredpalmer/razzle).

This uses [Apollo Federation](https://www.apollographql.com/docs/federation/) to connect the Django GraphQL Schema to the Node.JS GraphQL Schema.

-   `app`: React app built using `npx create-razzle-app app`
-   `backend`: Django project built using `django-admin startproject backend`

## Quickstart

```
docker-compose up --build
```

## Features

-   Node-powered GraphQL schema
-   Django-powered GraphQL schema
-   Node-powered Federated GraphQL schema
