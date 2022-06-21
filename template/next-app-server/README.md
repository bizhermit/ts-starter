# Developer usage

A development environment for dynamic web application. Powered by [Next.js](https://nextjs.org/), [Express](https://expressjs.com/) and others.  

The `./src/pages` directory is mapped **Page** URL.  
The `./src/pages/signin.tsx` file is page of [http://localhost:8000/signin](http://localhost:8000/signin).  

The `./src/pages/api` directory is mapped **API** URL.  
The `./src/pages/api/signin.ts` is [http://localhost:8000/api/signin](http://localhost:8000/signin).  

When customizing environment variables, edit `./next.config.js`.  


```js
const basePath = "/myapp";
const nextConfig = {
  basePath,
  env: {
    APP_BASE_PATH: basePath,
    NEXT_PUBLIC_APP_BASE_PATH: basePath,
    APP_PORT: 3000,
    ...(add more)
  },
};
```

lean more: [Next.js](https://nextjs.org/)  

## debug

```bash
npm run server
```

## build

```
npm run build
```

## start

```bash
npm run start
```