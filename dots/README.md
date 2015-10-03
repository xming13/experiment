#Flint
---
Flint is a starter directory for building basic static sites using Sass, Js, html and Gulp for automation. It exists to speed up the scaffolding of projects. Reducing setup time to a couple of minutes if not seconds.

The bulk of the work is managed by [Gulp](http://gulpjs.com/). Therefore you will need to have [node](https://nodejs.org/en/) and [npm](https://www.npmjs.com/) installed for this to work. I reccomend using [Homebrew](http://brew.sh/) to do this.

Using [Gulp](http://gulpjs.com/), almost all common tasks are automated. In Brief gulpfile.js will automate

- Installation of all Bower depedencies.
- Compile Sass and add any necessary vendor prefixes
- Concat and minify Js files
- Run a live local Server and watch for changes.

The directory includes a source and distribution folder. Within the source folder there is:

- A Sass folder organised using the [SMACSS](https://smacss.com/) methodolgy
- A Js folder
- An Assets folder
- Html files linked to scripts and css. They also include common meta tags in the head of the doc.

---


##Getting started
To get started simply run the following commands. 


```
	git clone https://github.com/Petecass/flint.git
	cd flint
	npm install
	gulp
	
```
```npm install``` will install all of the packages necessary for gulp to run on this project.

Once all of the node packages have been installed running ```gulp``` will:

- Install all dependencies, listed in your projects bower.json file, into the bower_components folder - default is jQuery.
- Move all of the main files from bower_components to either the js or css folder in the src directory. ie jquery.js will now be in your js folder.
- Link your html pages to every js file listed in your js folder. Main.js will always be listed last and jquery will always be first.
- Compile sass into app.css in the css folder. Source maps will also be created. App.css will also have all necessary vendor prefixes added to it.
- Launch a live server with browsersync. You can connect multiple devices to this server. The url is supplied in the console. 
- Watch for changes.
	- If you change a scss file, your sass will be recompiled and css will be injected into the browser.
	- If you change a html file the broswer will reload.
	- If you install another bower package the main file will be moved and the links in your html adjusted. The browser will reload.
	
Happy developing :) 

---

## The production stage

	 
Once everything has been developped. Its time to minify assets, concatenate scripts etc. Yep there's a command for all that too.

``` 
gulp build

```

Running this will :

- Optimize all images in the assets folder and move the new images to dist/assets.
- Minify you app.css file and rename it app.min.css
	- as well as rewrite the link in your html file.
	- html files and css are moved into the dist folder aswell.
- Concatenate all of your js files and minify them into app.min.js.
	- rewrites the link in your html too.
	
And that's it your site is ready for deployment. :)

---

## Deploy to gh-pages.

If you want to be really cool run

```
gulp deploy

```

This will run the build command and then push everything in the dist folder up to a gh-pages branch on your git repo. 

You will need to have a remote git repository set up for this to work.

---


Happy coding folks :)

 
	
	 






























 



	





