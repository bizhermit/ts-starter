# Developer usage

A development environment for dynamic web and desktop applications. Powered by [Next.js](https://nextjs.org/), [Express](https://expressjs.com/), [Electron](https://www.electronjs.org/) and others.  

The `./src/pages` directory is mapped **Page** URL.  
The `./src/pages/signin.tsx` file is page of [http://localhost:8000/signin](http://localhost:8000/signin).  
For desktop applications, it acts as the logic of the renderer process.  

The `./src/pages/api` directory is mapped **API** URL.  
The `./src/pages/api/signin.ts` is [http://localhost:8000/api/signin](http://localhost:8000/signin).  
For desktop applications, it acts as the logic of the main process. Access it using `electron-accessor`.  

When customizing environment variables, edit `./next.config.js`.  

lean more: [Next.js](https://nextjs.org/)  

## Server

### debug

```bash
npm run server
```

### build

```
npm run build
```

### start

```bash
npm run start
```

## Desktop

### debug

```bash
npm run desktop
```

### generate installer

#### for Windows

```
npm run pack:win
```