# SDOH & Place Project - Data Discovery

This [data discovery application](https://search.sdohplace.org) is one component of the [SDOH & Place Project](https://sdohplace.org), an effort by the [Healthy Regions & Policies Lab](https://healthyregions.org) (University of Illinois, Urbana-Champaign) to create a community of practice around geospatial public health data, specifically in the context of Social Determinants of Health.

The purpose of the data discovery application is to provide a curated and easy-to-search index of geospatial datasets that are especially useful within this research framework.

The platform itself is a NextJS application that interfaces with a Solr index. The Solr configuration, schema of the records, and all of the records themselves, are stored in our [metadata manager](https://github.com/healthyregions/sdohplace-metadatamanager), which is deployed at [metadata.sdohplace.org](https://metadata.sdohplace.org).

The structure of this application is inspired by [GeoBlacklight](https://geoblacklight.org), whose associated [OGM Aardvark](https://opengeometadata.org/ogm-aardvark/) metadata schema is the foundation of our own metadata schema. Instead of implementing GeoBlacklight proper, however, we have instead built this custom frontend app to query and interface with the Solr index.

## Dev install

We use the latest [Netlify Edge feature](https://www.netlify.com/platform/core/edge) to host the middle-layer API for LLM calls while keeping the site statically hosted, maintaining our existing setup. Netlify Edge is an advanced feature that will also allow us to localize content, serve relevant ads, authenticate users, personalize content, redirect visitors, and much more in the future. This feature allows us to implement, test and deploy both server-based api calls and static content in the same environment.

1. (One-time setup) To install the app locally, run:

    ```
    git clone https://github.com/healthyregions/sdohplace-data-discovery
    cd sdohplace-data-discovery
    yarn install
    ```

2. Set up environment variables:

    ```
    cp .env.local.example .env
    ```

    Update environment variables as needed. See the explanation in `.env.local.example` for what variables need to be setup.

### Keycloak frontend setup

Contributor login uses the frontend Keycloak client configuration in `.env`:

```env
NEXT_PUBLIC_KEYCLOAK_ISSUER=...
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=...
NEXT_PUBLIC_KEYCLOAK_SCOPE=openid profile email roles
NEXT_PUBLIC_KEYCLOAK_REQUIRED_ROLE=contributor
NEXT_PUBLIC_KEYCLOAK_REDIRECT_PATH=/sign-in
NEXT_PUBLIC_KEYCLOAK_POST_LOGOUT_REDIRECT_PATH=/
```

For local development, make sure the Keycloak client includes exact matches for the frontend URLs you use:

- Valid redirect URIs: `http://localhost:3000/sign-in`, `http://localhost:8888/sign-in`
- Valid post logout redirect URIs: `http://localhost:3000/`, `http://localhost:8888/`
- Web origins: `http://localhost:3000`, `http://localhost:8888`

If you are testing the Netlify local setup, `netlify dev --port=8888` (i.e. `npm run dev:full`) uses `8888` as the browser-facing origin and proxies the Next app running on `3000`, so Keycloak settings for `8888` must be present.

3. To run the app locally, use:

    ```
    npm run dev:full
    ```

    This will start both the Netlify local proxy and the Next app. `localhost:8888` is the Netlify-facing local URL, and `localhost:3000` is the underlying Next dev server.

    For auth or Edge Function testing, use `localhost:8888`. For plain frontend-only testing, `localhost:3000` is also available.

4. To build and view the entire site locally, use

    ```
    yarn build
    yarn start
    ```

## Running with Docker
We also provide a Docker Compose recipe for building and running a local instance of the app.

> [!NOTE]
> We still need to update the Docker build to incorporate the middle-layer Netlify API.

To build the image:
```
docker compose build
```
NOTE: this is a shorthand for running `docker build -t herop/sdohplace-data-discovery .`

To run the application:
```bash
docker compose up -d
```
NOTE: this is a shorthand for running `docker run -it -p 8080:80 --env-file .env --name sdohplace-data-discovery herop/sdohplace-data-discovery`

Navigate to http://localhost:8080 to access the running application

To build and run in a single step:
```bash
docker compose up -d --build
```

To shut down the application:
```bash
docker compose down
```
NOTE: this is a shorthand for running `docker rm -f sdohplace-data-discovery`

## Contributors

Adam Cox, Pengyin Shan, Sara Lambert, Shubham Kumar
