<h1 align="center">
  Tiles
</h1>

<h1 align="center"><img align="center" src="https://raw.githubusercontent.com/Fairbanks-io/tiles-client/master/logo.png" height="50%" width="50%" alt="tiles-logo"/></h1>

![Docker Cloud Automated build](https://img.shields.io/docker/cloud/automated/fairbanksio/tiles-client.svg)
![Docker Cloud Build Status](https://img.shields.io/docker/cloud/build/fairbanksio/tiles-client.svg)
![GitHub top language](https://img.shields.io/github/languages/top/Fairbanks-io/tiles-client.svg)
![Docker Pulls](https://img.shields.io/docker/pulls/fairbanksio/tiles-client.svg)
![GitHub last commit](https://img.shields.io/github/last-commit/Fairbanks-io/tiles-client.svg)

<p align="center">Pixel art chatrooms with your friends!</p>

## Getting Started

#### Prerequisites

The following will need to be installed before proceeding:

- Node v8+
- Mongo DB
- Nginx
- [Tiles API](https://github.com/Fairbanks-io/tiles-api)

#### Clone the Project

```sh
# Clone it
git clone https://github.com/Fairbanks-io/tiles-client.git
cd tiles-client/
```

#### Setup Backend API

The frontend requires the Tiles API to be running for saving drawings and managing chats. To setup the backend API, please checkout the [Tiles API readme](https://github.com/Fairbanks-io/tiles-api/blob/master/README.md).

#### Install & Launch the Frontend

```sh
npm install
npm start
```

The Tiles UI should now be available at http://localhost:3000

#### Nginx

The following is an Nginx configuration block for both frontend and backend:
_This section may not apply when deployed via kubernetes_
```sh
server {
    listen               443  ssl;
    ssl                  on;
    ssl_certificate fullchain.pem;
    ssl_certificate_key privkey.pem;
    server_name    tiles.mysite.io;
    large_client_header_buffers 4 8k;
    location / {
        proxy_pass      http://127.0.0.1:3000/;
        # Upgrade for Websockets
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    location /socket.io/ {
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_pass http://127.0.0.1:4001/socket.io/;
    }
    location /tiles {
        proxy_pass      http://127.0.0.1:4001/tiles;
        # Upgrade for Websockets
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

# Docker

The Tiles UI can also be launched via Docker using the following example:

```sh
docker build -t Fairbanks-io/tiles-client .
docker run -d -p 80:80 --name 'tiles-client' Fairbanks-io/tiles-client
```

# Kubernetes
_Depends on helm v2 or v3 and a default storage provisioner_

Create namespace 'tiles'

```sh
kubectl create namespace tiles
```

Save DB password as shell env var
```sh
# do not use @ or ! in password as they will cause issues with connection strings.
export DB_PASS=M0ngoPassH3re
```



Deploy Database
```sh
# Download production values template
curl -O https://raw.githubusercontent.com/kubernetes/charts/master/stable/mongodb/values-production.yaml

# Helm v3
helm install tilesdb -f values-production.yaml stable/mongodb --set mongodbUsername=TilesDB --set mongodbPassword=${DB_PASS} --set mongodbDatabase=tiles --namespace tiles

# Helm v2
helm install --name tilesdb -f values-production.yaml stable/mongodb --set --set mongodbUsername=TilesDB --set mongodbPassword=${DB_PASS} --set mongodbDatabase=tiles --namespace tiles
```
_check that it's ready `kubectl get po -n tiles` before moving on_

Deploy Session Cache
```sh
# Helm v3
helm install tiles-session-db stable/redis --namespace tiles --set usePassword=false
# Helm v2
helm install --name tiles-session-db stable/redis --namespace tiles --set usePassword=false
```

Create secrets
```sh
# If the name of the service (such as helm naming releases oddly), you may need to update the hostnames for both mongoURI and redishost to whatever the service names are for the respective installs
kubectl create secret generic tiles-config --from-literal=mongouri=mongodb://TilesDB:${DB_PASS}@tilesdb-mongodb:27017/tiles --from-literal=redishost=tiles-session-db-redis-master -n tiles
```
_check all pods ready `kubectl get po -n tiles` before moving on_

Deploy Tiles (Deployments, Services, Ingresses, and HPAs)
_You may want to update the HOST values in the ingress portion of yaml before applying below_
```sh
kubectl apply -f kubernetes.yml
```



Verify deployment
```sh
# make sure all pods running
kubectl get po -n tiles
# View logs of api to make sure it's running
kubectel get po -n tiles tiles-api-XXXXXXXXXXX
# make sure cert is available
kubectl get cert -n tiles
```

Unset DB Pass
```sh
unset DB_PASS
```