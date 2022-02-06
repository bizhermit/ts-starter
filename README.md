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
- [hp] : homepage (react + etc.)
- [cli]: command line interface application 
- [web]: web application (express + next + etc.)
- [dt] : desktop application (electron + next + etc.)
- [wd] : web and desktop application (express + electron + next + etc.)
please input (default c) >
```

### Options

* `-m [projectType]` select mode. if set, you don't necessary to conversation.

# プロジェクトの種類

## \[hp] Homepage

レンタルサーバー等で公開するためのホームページのひな型を作成します。

## \[cli] Command line interface application

コマンドラインインターフェース（CLI）のアプリケーションのひな型を作成します。

## \[web] Web application

Webアプリケーションのひな型を作成します。

構成は[Next.js](https://nextjs.org/)をベースに[Express](https://expressjs.com/)を使用します。

## \[dt] Desktop application

デスクトップアプリケーションのひな型を作成します。

構成は[Next.js](https://nextjs.org/)をベースに[Electron](https://www.electronjs.org/)を使用します。

## \[wd] Web and Desktop application

Webアプリケーションおよびデスクトップアプリケーションのひな型を作成します。

構成はWebアプリケーションおよびデスクトップアプリケーションと同様です。