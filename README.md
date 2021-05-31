# dig-wtf-worker

A Cloudflare Worker for returning dig-like results on dig.wtf.

#### Wrangler

Test locally using [wrangler](https://github.com/cloudflare/wrangler).

```
wrangler dev
```

A Github Action deploy's the worker to production after it's committed to the master branch.
```
name: Deploy

on:
  push:
    branches:
      - master

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy
    steps:
      - uses: actions/checkout@v2
      - name: Publish
        uses: cloudflare/wrangler-action@1.3.0
        with:
          apiToken: ${{ secrets.CF_API_TOKEN }}
          environment: 'production'
```
