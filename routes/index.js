const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const router = express.Router();

const CSSRegex = /\.+(css)/;
const StyleSheetRegex = /stylesheet/;

async function getHtmlAndCss(url) {
  try {
    const response = await axios.get(url);

    const html = response.data;
    const $ = cheerio.load(html);
    const css = $("style").html() ?? "";

    let links;
    let stylesheet;

    $("link").each((i, el) => {
      const linkHref = $(el).attr("href");
      const linkRel = $(el).attr("rel");
      // find <link rel=stylesheet href="xxx.css"/>
      if (linkRel.match(StyleSheetRegex) && linkHref.match(CSSRegex)) {
        links = "https://" + response.request.socket._host + linkHref;
      }
    });

    if (links) {
      stylesheet = await axios.get(links);
    }

    return {
      html: html.replace(/<link[^>]*>/g, ""), //trim link tag
      css: css + stylesheet?.data,
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function getResult(url) {
  const result = await getHtmlAndCss(url);
  return result;
}

router.post("/getWebClone", (req, res) => {
  const { url } = req.body;
  getResult(url)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => console.error(err));
});

module.exports = router;
