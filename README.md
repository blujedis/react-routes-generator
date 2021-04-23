# React Routes Generator

Stupid simple generator that generates routes by path and convention. Similar to that of **NextJS**. In no way is this meant to be comprehensive but rather a simple way to generate routes to speed up things a hair particularly early on.

Paths are generated in two ways. Either by using the file name or when used with a bracket the generator assumes this is a route param. When an **index** file is detected "index" is droped and the route directory is used. Consider the following:

<pre>
/src
  /pages
    /home
      index.ts
    /items
      [id].ts
      create.lazy.ts
</pre>

The above structure would produce the following routes:

<table>
  <thead>
    <tr><th>Route</th><th>Note</th></tr>
  </thead>
  <tbody>
      <tr>
        <td>/</td>
        <td>Note "home" is stripped since this is rootComponent</td>
      </tr>
      <tr>
        <td>/items/:id</td>
        <td>Id in brackets is converted to a route param.</td>
      </tr>
      <tr>
        <td>/items/create</td>
        <td>Imported using **React.lazy** instead of eager import.</td>
      </tr>
  </tbody>
</table>

**NOTE:** you can also define folders using `[some_name]` which result in an inline route param.

See more on [React.lazy()](https://reactjs.org/docs/code-splitting.html);

## Install

```sh
$ npm install react-routes-generator -g
```

OR

```sh
$ yarn global add react-routes-generator
```

**You could of course just install locally to your devDependencies also"

## Configuration

To view options run the following:

<code>rrg --help</code>

### Command Line

In most cases you'll only need to change a couple args if that. This is accomplished using typical command line syntax. For example if you wanted to switch from the default **Typescript** mode you run the following:

```sh
$ rrg --mode js
```

Perhaps your **pages** as we typically call them are actually located in **components**, you might run:

```sh
$ rrg --mode js --pages-dir components
```

Using the default **rootDir** the above would then assume we will generate routes from components in:

<code>./src/components</code>

### Package Json

Options can be applied via CLI or using a key in your package.json. In most cases the defaults are probably pretty close.

By default the root project dir is simply **src**. The folder containing your pages, screens or whatever you call them **pages** is used. Hence **./src/pages** is assumed to be where components are located. 

```js
{
  "reactRoutesGenerator": {
    "rootDir": "src",
    "rootComponent": "home"
  }
}
```

## Options

<p>
  <img src="https://github.com/blujedis/react-routes-generator/blob/main/fixtures/options.png" />
</p>

