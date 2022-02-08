# Typescript project starter

You can begin a Typescript project easily.

No install
```bash
npx @bizhermit/starter [dirname] <options>
```

Install
```bash
npm -g @bizhermit/starter
npx starter [dirname] <options>
```

`dirname` develop directory path. default is current working directory.

```bash
# start
select project type
- [c]  : cancel to start
- [cli]: command line interface application 
- [mod]: module
- [s-web] : static web application (react + etc.)
- [web]: dynamic web application (@bizhermit/nexpress + next + etc.)
- [dt] : desktop application (@bizhermit/nextron + next + etc.)
- [wd] : dynamic web and desktop application (@bizhermit/nexpress + @bizhermit/nextron + next + etc.)
please input (default c) >
```

### Options

* `-m [projectType]` select mode. if set, you don't necessary to conversation.


## Project type

* `cli` command line interface application
* `mod` npm module
* `s-web` static web application
* `web` dynamic web application
* `dt` desktop application
* `wd` dynamic web and desktop application