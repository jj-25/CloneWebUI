const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const router = express.Router();

async function getHtmlAndCss(url) {
  try {
    const response = await axios.get(url);
    const html = response.data.toLowerCase();
    const $ = cheerio.load(html.toLowerCase());
    const css = $("style").html();

    return { html, css };
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
