const marked = require('meta-marked');
const { highlightAuto } = require('highlight.js');
const fs = require('fs-extra');
const slug = require('slug');
const path = require('path');
const nunjucks = require('nunjucks');
const moment = require('moment');

nunjucks.configure('site');

marked.setOptions({
  highlight: (code) => highlightAuto(code).value
});

const siteDir = './site';
const sectionDir = 'sections';
const assetDir = 'assets';
const buildDir = './build';

Promise.all([
  fs.readdir(path.join(siteDir, sectionDir)),
  fs.readdir(path.join(siteDir, assetDir)),
  fs.ensureDir(buildDir)
]).then(([sections, assets]) => {
  return Promise.all(assets.map((asset) => {
    return fs.copy(path.join(siteDir, assetDir, asset), path.join(buildDir, asset));
  }).concat(sections.map((section) => {
    const sectionPath = path.join(siteDir, sectionDir, section);
    return fs.readdir(sectionPath).then((files) => {
      const posts = files.filter((file) => file.endsWith('.md'));
      const postMetadata = [];
      const createIndexFile = () => {
        if(postMetadata.length === posts.length && files.includes('index.html')) {
          postMetadata.forEach((metadata) => {
            metadata.momentDate = moment(metadata.date);
          });
          postMetadata.sort((a, b) => {
            if(a.momentDate.isBefore(b.momentDate)) return 1;
            if(a.momentDate.isAfter(b.momentDate)) return -1;
            return 0;
          });
          const indexContents = nunjucks.render(
            path.join(sectionDir, section, 'index.html'),
            { postMetadata, title: section.substr(0, 1).toUpperCase() + section.substr(1) }
          );
          const indexDir = path.join(buildDir, section);
          fs.ensureDir(indexDir).then(() => {
            return fs.writeFile(path.join(indexDir, 'index.html'), indexContents);
          }).catch((err) => console.error(err));
        }
      };
      if(posts.length === 0) {
        createIndexFile();
      } else {
        posts.forEach((file) => {
          fs.readFile(path.join(sectionPath, file), 'utf8').then((md) => {
            const { meta, html } = marked(md);
            if(!meta.title) {
              return console.error(`No title given for ${file}`);
            }
            const postSlug = slug(meta.title);
            const postPath = path.join(buildDir, section, postSlug);
            meta.slug = postSlug;
            meta.dateString = moment(meta.date).format('MMMM Do, YYYY'),
            meta.preview = html.substr(0, 250) + '...';
            postMetadata.push(meta);
            const contents = nunjucks.render(
              path.join(sectionDir, section, 'template.html'),
              Object.assign({}, meta, { contents: html })
            );
            fs.ensureDir(postPath, (err) => {
              if(err) {
                return console.error(err);
              }
              fs.writeFile(path.join(postPath, 'index.html'), contents, (err) => {
                if(err) {
                  return console.error(err);
                }
              });
            });
          }).catch((err) => console.error(err));
          createIndexFile();
        });
      }
    });
  })));
}).catch((err) => console.error(err));
