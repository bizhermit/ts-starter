# Typescript project starter

You can begin a Typescript project easily.

No install
```bash
npx @bizhermit/starter@latest [dirname] <options>
```

Install
```bash
npm i -g @bizhermit/starter@latest
npx starter [dirname] <options>
```

`dirname` develop directory path. default is current working directory.

```bash
# start
select project type
- [c]  : cancel
- [mod]: module
- [cli]: command line interface application
- [fas]: frontend application server [ Next.js ]
- [bas]: backend application server  [ Express + Next.js ]
- [web]: web application server      [ Express + Next.js ]
- [dsk]: desktop application         [ Electron + Next.js ]
- [app]: web & desktop application   [ Express + Electron + Next.js ]
- [mob]: mobile application          [ react-native ]
please input (default c) >
```

### Options

* `-t [projectType]` If you don't want to conversation, choose a project type.
