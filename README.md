# warten-info
warten.info waiting times crawler

crudely written crawler to get data from "NetCallUp" waiting number terminals and push it into InfluxDB.

## running locally
```bash
npm install
npm start
```

## running in docker
```bash
docker build -t warten-info-crawler .
docker run warten-info-crawler
```

## configuration
See `index.ts` for environment variable keys that can be used for configuration.