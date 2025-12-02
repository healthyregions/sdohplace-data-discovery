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

3. To run the app locally, use:

    ```
    npm run dev:full
    ```

    This will start both the API and the display layer. Navigate to `localhost:3000` to view the front end. 

    Note: Your browser may automatically open `localhost:8888`, but that’s for the API—you can close it. You can also monitor API results in the console.

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

