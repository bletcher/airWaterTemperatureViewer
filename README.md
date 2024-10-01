# Temperature Raw Data Viewer

Demo at: https://temperature-viewer.s3.us-east-2.amazonaws.com/index.html

Setup steps:

## Enable command line R

Add .R and .RScript to [Path](https://info201.github.io/r-intro.html#windows-command-line). Will need to update the path when R version is updated.  5.2.1.1 Windows Command-Line

## Set up observable framework project

1) In the terminal, go to root directory (one below the subdirectory you will create in the next step).
2) Run `npm init "@observablehq"` and don't initialize git.
3) In vsCode, open the folder for the project and then publish to a new repo (from the `source control` badge).
4) Make changes for deploying suggested [here](https://observablehq.com/framework/deploying#other-hosting-services).  
5) In the terminal, run `npm run build` to build the site in /dist.  
6) Copy files from /dist to temperature-viewer S3 bucket. Best to open file explorer and drag the files and folders in /dist into the S3 upload space.  
7) make sure to enable static web hosting and to add a bucket policy like:
   {
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::temperature-viewer/*"
        }
    ]
}

Notes:
1) To force rerun of cached objects, run: `rm docs/.observablehq/cache/data/*.*` with approriate changes for specific files or file types.  
2) Run `getPrepareRData.r` by hand.  
3) Then run `npm run build` and copy files to S3 bucket.  

## Data flow
raw data: "./docs/data/dataIn/dt.EcoDrought.flowtemp.rds"  
data prep: run `getPrepareRData.r` in "./docs/data/r/"  
main page: temepratureDataParquet.md



## From Observable

This is an [Observable Framework](https://observablehq.com/framework) project. To start the local preview server, run:

```js
npm run dev
```

Then visit <http://localhost:3000> to preview your project.

For more, see <https://observablehq.com/framework/getting-started>.

## Project structure

A typical Framework project looks like this:

```ini
.
├─ docs
│  ├─ components
│  │  └─ timeline.js           # an importable module
│  ├─ data
│  │  ├─ launches.csv.js       # a data loader
│  │  └─ events.json           # a static data file
│  ├─ example-dashboard.md     # a page
│  ├─ example-report.md        # another page
│  └─ index.md                 # the home page
├─ .gitignore
├─ observablehq.config.js      # the project config file
├─ package.json
└─ README.md
```

**`docs`** - This is the “source root” — where your source files live. Pages go here. Each page is a Markdown file. Observable Framework uses [file-based routing](https://observablehq.com/framework/routing), which means that the name of the file controls where the page is served. You can create as many pages as you like. Use folders to organize your pages.

**`docs/index.md`** - This is the home page for your site. You can have as many additional pages as you’d like, but you should always have a home page, too.

**`docs/data`** - You can put [data loaders](https://observablehq.com/framework/loaders) or static data files anywhere in your source root, but we recommend putting them here.

**`docs/components`** - You can put shared [JavaScript modules](https://observablehq.com/framework/javascript/imports) anywhere in your source root, but we recommend putting them here. This helps you pull code out of Markdown files and into JavaScript modules, making it easier to reuse code across pages, write tests and run linters, and even share code with vanilla web applications.

**`observablehq.config.js`** - This is the [project configuration](https://observablehq.com/framework/config) file, such as the pages and sections in the sidebar navigation, and the project’s title.

## Command reference

| Command           | Description                                              |
| ----------------- | -------------------------------------------------------- |
| `npm install`            | Install or reinstall dependencies                        |
| `npm run dev`        | Start local preview server                               |
| `npm run build`      | Build your static site, generating `./dist`              |
| `npm run deploy`     | Deploy your project to Observable                        |
| `npm run clean`      | Clear the local data loader cache                        |
| `npm run observable` | Run commands like `observable help`                      |
