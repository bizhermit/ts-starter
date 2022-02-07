# Project Starter

Typescriptプロジェクトを手軽に始めるためのツールです。

# 使い方

@bizhermit/starterをnpxで実行します。
```bash
> npx @bizhermit/starter [dirname] <options>
```
- dirname : ひな型を展開するディレクトリの相対パス（初期値はカレントディレクトリ）

※注意）dirnameの場所にはファイルやフォルダが一切存在しないようにしてください。

プロジェクトの種類を選びます。（各詳細は後述）
```bash
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

# プロジェクトの種類

## \[cli] Command line interface application

コマンドラインインターフェース（CLI）のアプリケーションのひな型を作成します。

## \[mod] Module

モジュールのひな型を作成します。

## \[s-web] Static web application

[react](https://www.npmjs.com/package/react)を使用した静的Webアプリケーションのひな型を作成します。

## \[web] Web application

[@bizhermit/nexpress](https://www.npmjs.com/package/@bizhermit/nexpress)を使用した動的Webアプリケーションのひな型を作成します。

## \[dt] Desktop application

[@bizhermit/nextron](https://www.npmjs.com/package/@bizhermit/nextron)を使用したデスクトップアプリケーションのひな型を作成します。

## \[wd] Web and Desktop application

Webアプリケーションおよびデスクトップアプリケーションのひな型を作成します。

構成はWebアプリケーションおよびデスクトップアプリケーションと同様です。