# Developer usage

A development environment for dynamic web application. Powered by [Next.js](https://nextjs.org/), [Express](https://expressjs.com/) and others.  

The `./src/pages` directory is mapped **Page** URL.  
The `./src/pages/signin.tsx` file is page of [http://localhost:8000/signin](http://localhost:8000/signin).  

The `./src/pages/api` directory is mapped **API** URL.  
The `./src/pages/api/signin.ts` is [http://localhost:8000/api/signin](http://localhost:8000/signin).  

When customizing environment variables, edit `./next.config.js`.  

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