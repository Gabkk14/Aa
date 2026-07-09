==================================================
Downloads/Instagram1.js
==================================================
const axios = require("axios");
const cheerio = require("cheerio");
const qs = require("qs");

function igdl(t) {
  return new Promise(async e => {
    try {
      var a;
      if (!t.match(/(?:https?:\/\/(web\.|www\.|m\.)?(facebook|fb)\.(com|watch)\S+)?$/) && !t.match(/(https|http):\/\/www.instagram.com\/(p|reel|tv|stories)/gi)) {
        return e({
          developer: "@gb",
          status: false,
          msg: "Link Url not valid"
        });
      }

      const response = await axios.post("https://snapsave.app/action.php?lang=id",
        qs.stringify({ url: t }),
        {
          headers: {
            accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "content-type": "application/x-www-form-urlencoded",
            origin: "https://snapsave.app",
            referer: "https://snapsave.app/id",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36"
          }
        }
      );

      a = response.data;

      let _ = function t(e) {
        return e.split("getElementById(\"download-section\").innerHTML = \"")[1].split("\"; document.getElementById(\"inputData\").remove(); ")[0].replace(/\\(\\)?/g, "");
      }(function t(e) {
        let [x, _, i, o, r, n] = e;
        function l(t, e, $) {
          let x = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/".split("");
          let _ = x.slice(0, e);
          let i = x.slice(0, $);
          let o = t.split("").reverse().reduce(function (t, $, x) {
            if (_.indexOf($) !== -1) {
              return t += _.indexOf($) * Math.pow(e, x);
            }
          }, 0);
          let r = "";
          while (o > 0) {
            r = i[o % $] + r;
            o = (o - o % $) / $;
          }
          return r || "0";
        }
        n = "";
        for (let c = 0, s = x.length; c < s; c++) {
          let d = "";
          while (x[c] !== i[r]) {
            d += x[c];
            c++;
          }
          for (let u = 0; u < i.length; u++) {
            d = d.replace(RegExp(i[u], "g"), u.toString());
          }
          n += String.fromCharCode(l(d, r, 10) - o);
        }
        return decodeURIComponent(encodeURIComponent(n));
      }(function t(e) {
        return e.split("decodeURIComponent(escape(r))}(")[1].split("))")[0].split(",").map(t => t.replace(/"/g, "").trim());
      }(a)));

      let i = cheerio.load(_);
      let o = [];

      if (i("table.table").length || i("article.media > figure").length) {
        let r = i("article.media > figure").find("img").attr("src");
        i("tbody > tr").each((t, e) => {
          let x = i(e);
          let _ = x.find("td");
          let n = _.eq(0).text();
          let l = _.eq(2).find("a").attr("href") || _.eq(2).find("button").attr("onclick");
          let c = /get_progressApi/ig.test(l || "");
          if (c) {
            l = /get_progressApi\('(.*?)'\)/.exec(l || "")?.[1] || l;
          }
          o.push({
            resolution: n,
            thumbnail: r,
            url: l,
            shouldRender: c
          });
        });
      } else {
        i("div.download-items__thumb").each((t, e) => {
          let x = i(e).find("img").attr("src");
          i("div.download-items__btn").each((t, e) => {
            let _ = i(e).find("a").attr("href");
            if (!/https?:\/\//.test(_ || "")) {
              _ = "https://snapsave.app" + _;
            }
            o.push({
              thumbnail: x,
              url: _
            });
          });
        });
      }

      if (!o.length) {
        return e("Result Not Found! Check Your Url Now!");
      }
      return e(o);
    } catch (n) {
      return e("Request Failed With Code 401");
    }
  });
}

module.exports = { igdl };-e 


==================================================
Downloads/Instagram2.js
==================================================
// Gab-arqv/LB-APIS/Downloads/igdl.js
const https = require('https')

function makeRequest(urlOrOptions, method, data = null) {
return new Promise((resolve, reject) => {
const req = https.request(urlOrOptions, (res) => {
let body = ''
res.on('data', chunk => body += chunk)
res.on('end', () => resolve(body))
})
req.on('error', reject)
if (data) req.write(data)
req.end()
})
}

async function getInstagramLinks(igUrl) {
try {
const homeHtml = await makeRequest('https://reelsvideo.io/', 'GET')

const ttMatch = homeHtml.match(/<input[^>]+id="tt"[^>]+value="([^"]+)"/)
const tsMatch = homeHtml.match(/<input[^>]+id="ts"[^>]+value="([^"]+)"/)
if (!ttMatch || !tsMatch) throw new Error('Tokens tt/ts não encontrados')

const tt = ttMatch[1]
const ts = tsMatch[1]

const postData = new URLSearchParams({
id: igUrl,
locale: 'en',
tt,
ts
}).toString()

const options = {
hostname: 'reelsvideo.io',
port: 443,
path: '/',
method: 'POST',
headers: {
'Content-Type': 'application/x-www-form-urlencoded',
'HX-Request': 'true',
'HX-Target': 'target',
'HX-Current-URL': 'https://reelsvideo.io/',
'Origin': 'https://reelsvideo.io',
'Referer': 'https://reelsvideo.io/',
'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
'Content-Length': Buffer.byteLength(postData)
}
}

const resultHtml = await makeRequest(options, 'POST', postData)

const results = []
const linkRegex = /<a[^>]+href="(https:\/\/ssscdn\.io\/reelsvideo\/[^"]+)"[^>]*class="([^"]+)"/g
let match
while ((match = linkRegex.exec(resultHtml)) !== null) {
const url = match[1]
const classes = match[2]
let type = classes.includes('type_audio') || classes.includes('mp3') ? 'mp3' : 'video'
results.push({ type, url })
}

return results

} catch (error) {
throw error
}
}

module.exports = { getInstagramLinks }-e 


==================================================
Downloads/Instagram3.js
==================================================
const axios = require('axios')

async function fastdl(url) {
try {
url = url.split('?')[0]

const headers = {
accept: '*/*',
'user-agent': 'Mozilla/5.0 (Linux; Android 10)',
referer: 'https://fastdl.cc/'
}

let endpoint
let referer

if (url.includes('/reel/')) {
endpoint = 'reels/download'
referer = 'https://fastdl.cc/reels'
} else if (url.includes('/stories/')) {
endpoint = 'story/download'
referer = 'https://fastdl.cc/story'
} else {
endpoint = 'img/download'
referer = 'https://fastdl.cc/photo'
}

headers.referer = referer

const { data } = await axios.get(`https://fastdl.cc/${endpoint}?url=${encodeURIComponent(url)}`, { headers })
if (!data.success) throw new Error('Media não encontrada')

let media = []
if (data.images) {
media = data.images.map(v => v.url)
} else if (data.url) {
media = [data.url]
}

return {
status: true,
type: data.type,
media
}
} catch (e) {
return {
status: false,
message: e.message
}
}
}

module.exports = { fastdl }-e 


==================================================
Downloads/Instagram4.js
==================================================
// insaver.js
const axios = require('axios')
const cheerio = require('cheerio')
const qs = require('qs')

async function instagramDownload(instagramUrl) {
    const baseUrl = 'https://insaver.io'

    try {
        const initialResponse = await axios.get(baseUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        })

        const $initial = cheerio.load(initialResponse.data)
        const token = $initial('input[name="token"]').val()
        const action = $initial('input[name="action"]').val() || 'insta'
        const cookies = initialResponse.headers['set-cookie']

        if (!token) {
            throw new Error('Nao foi possivel encontrar o token de sessao')
        }

        const postData = qs.stringify({
            link: instagramUrl,
            token: token,
            action: action,
            lang: 'en',
            url_source: '/'
        })

        const downloadResponse = await axios.post(`${baseUrl}/download`, postData, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': baseUrl,
                'Cookie': cookies ? cookies.join('; ') : ''
            }
        })

        const $download = cheerio.load(downloadResponse.data)
        const links = new Set()

        $download('a').each((i, el) => {
            const text = $download(el).text().trim().toLowerCase()
            const href = $download(el).attr('href')

            if (!href || href === '#') return
            if (href.includes('insaver.io')) return
            if (!text.includes('download')) return

            links.add(href)
        })

        const photos = []
        const videos = []

        links.forEach(link => {
            const cleanLink = link.split('?')[0].toLowerCase()
            if (cleanLink.endsWith('.jpg') || cleanLink.endsWith('.jpeg') || cleanLink.endsWith('.png') || cleanLink.endsWith('.webp')) {
                photos.push(link)
            } else if (cleanLink.endsWith('.mp4') || cleanLink.includes('.mp4')) {
                videos.push(link)
            }
        })

        return { photos, videos, total: photos.length + videos.length }

    } catch (error) {
        console.error('Erro ao extrair links:', error.message)
        return { photos: [], videos: [], total: 0 }
    }
}

module.exports = { instagramDownload }-e 


==================================================
Downloads/aptoide.js
==================================================
const axios = require('axios')

const API_BASE = 'https://ws75.aptoide.com/api/7'
const UA = 'Mozilla/5.0 (Linux; Android 11; Redmi Note 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'

function extractSize(app) {
if(!app.file?.filesize && !app.file?.size && !app.size) return 'N/A'
const bytes = app.file?.filesize || app.file?.size || app.size
if(bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
}

async function aptoideSearch(query, limit = 10) {
try {
const { data } = await axios.get(`${API_BASE}/apps/search`, {
params: { query, limit },
headers: { 'User-Agent': UA },
timeout: 10000
})
const list = data.datalist?.list || []
return list.slice(0, limit).map(app => ({
title: app.name,
id: app.package,
url: `https://es.aptoide.com/app/${app.package}`,
thumb: app.icon,
version: app.file?.vername || 'N/A',
size: extractSize(app),
rating: app.stats?.rating?.avg?.toFixed(1) || '0.0'
}))
} catch(e) {
console.error(e.message)
return []
}
}

async function aptoideInfo(packageName) {
try {
const { data } = await axios.get(`${API_BASE}/app/get`, {
params: { package_name: packageName },
headers: { 'User-Agent': UA },
timeout: 10000
})
const app = data.nodes?.meta?.data || data.datalist?.list?.[0]
if(!app) return null
const rawDesc = app.media?.description || app.description || ''
return {
title: app.name,
id: app.package,
version: app.file?.vername || 'N/A',
size: extractSize(app),
thumb: app.icon,
updated: app.updated,
downloads: app.stats?.downloads?.toLocaleString() || '0',
rating: app.stats?.rating?.avg?.toFixed(1) || '0.0',
total_reviews: app.stats?.rating?.total || 0,
is_safe: app.file?.malware?.rank === 'TRUSTED',
security_reason: app.file?.malware?.reason?.sig || 'Verificado',
min_android: app.file?.hardware?.sdk ? `Android ${app.file.hardware.sdk}+` : 'Varía',
arch: app.file?.hardware?.cpus?.join(', ') || 'Universal',
md5: app.file?.md5sum,
screenshots: app.media?.screenshots?.map(s => s.url) || [],
video: app.media?.videos?.[0]?.url || null,
description: rawDesc.replace(/<[^>]*>/g,'').trim().slice(0,1000),
download: app.file?.path || null,
url: `https://es.aptoide.com/app/${app.package}`
}
} catch(e) {
console.error(e.message)
return null
}
}

module.exports = { aptoideSearch, aptoideInfo }-e 


==================================================
Downloads/audiomeme.js
==================================================
const axios = require('axios');
const cheerio = require('cheerio');

async function audiomeme(query) {
  const url = 'https://www.myinstants.com/pt/search/?name=' + encodeURIComponent(query);
  const { data: searchResults } = await axios.get(url, {
    headers: {
      "user-agent": userAgent(),
      "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
    }
  });

  const cache = [];
  const $ = cheerio.load(searchResults);
  $('#instants_container > .instants.result-page > .instant').each((i, elem) => {
    const title = $(elem).find('button.small-button').attr('title').replace("Tocar o som de ", '');
    const audio = "https://www.myinstants.com" + $(elem).find('button.small-button').attr('onclick').replace("play('", '').split("',")[0];
    cache.push({ title, audio });
  });

  return cache.length > 0 ? cache[Math.floor(Math.random() * cache.length)] : null;
}

function userAgent() {
  const oos = ['Macintosh; Intel Mac OS X 10_15_7', 'Windows NT 10.0; Win64; x64'];
  return `Mozilla/5.0 (${oos[Math.floor(Math.random() * oos.length)]}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36`;
}

module.exports = { audiomeme };-e 


==================================================
Downloads/capcut.js
==================================================
const puppeteer = require("puppeteer-core")

const TOKENS = [
  "2Uc3Wf3lPhKUycob642c4ce094bee05ec258f39ddb8819171",
  "2UcR17zBrPq3E4Sbf3693486a1a90b8f24469c886c755a0a0",
  "2UcR5WpJttRlB41726d9318de6477130b08d7613ff4ae4fa5",
  "2UcR7gAuh8SCEHQc94f835414c38e59bd0bf5a64329f02c12",
  "2UcRAKts9vnx0xed2e8bcd46984d2c5c6a3d7e2a5ae6fd599",
  "2UcR9HmxnkhX7lDe347a98fe459c9ab6d0af6901641d51af8"
]

async function capcutScraper(url) {
const TOKEN = TOKENS[Math.floor(Math.random() * TOKENS.length)]
const browser = await puppeteer.connect({
browserWSEndpoint: `wss://production-sfo.browserless.io?token=${TOKEN}`
})
const page = await browser.newPage()
await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36')
try {
await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 })
await page.waitForSelector('video', { timeout: 30000 })
const downloadLinks = await page.evaluate(() => {
const videos = Array.from(document.querySelectorAll('video'))
const sources = Array.from(document.querySelectorAll('video source'))
const links = [...videos.map(v => v.src), ...sources.map(s => s.src)]
return [...new Set(links.filter(link => link && link.startsWith('http')))]
})
return downloadLinks
} catch (error) {
throw new Error('Erro ao extrair links')
} finally {
await browser.close()
}
}

module.exports = { capcutScraper }-e 


==================================================
Downloads/capcut2.js
==================================================
const axios = require("axios")

async function capcutDownload(url) {
try {
const apiUrl = "https://www.genviral.io/api/tools/social-downloader"
const { data } = await axios.post(apiUrl, { url }, {
headers: { 
accept: "*/*",
"accept-language": "en-US,en;q=0.5",
baggage: "sentry-environment=production,sentry-release=102ca3483de9fd3f3fc19cd9c61e8923bdab7852,sentry-public_key=360a5271964ef3bc33b47f8760ecec7d,sentry-trace_id=477e8e97116373a0dca68d1509192b89,sentry-org_id=4509345024901120,sentry-transaction=GET%20%2Ftools%2Fdownload%2F%5Bplatform%5D,sentry-sampled=true,sentry-sample_rand=0.0037737885879629562,sentry-sample_rate=1",
"content-type": "application/json",
dnt: "1",
origin: "https://www.genviral.io",
priority: "u=1, i",
referer: "https://www.genviral.io/tools/download/capcut",
"sec-ch-ua": '"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
"sec-ch-ua-mobile": "?0",
"sec-ch-ua-platform": '"Windows"',
"sec-fetch-dest": "empty",
"sec-fetch-mode": "cors",
"sec-fetch-site": "same-origin",
"sec-gpc": "1",
"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
}
})
return data
} catch(e) {
throw new Error(`Erro na API CapCut: ${e.message}`)
}
}

module.exports = { capcutDownload }-e 


==================================================
Downloads/deezer.js
==================================================
const axios = require('axios')
module.exports = {
deezerTrack: async (query, format = 'flac') => {
const UA = 'Mozilla/5.0 (Linux; Android 11; Redmi Note 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
const BASE = 'https://flacdownloader.com'
const APIBASE = `${BASE}/flac`
const KEY = 'l@p*gute)77=g5clebcp4lz#=x%(*rwg+ku0_)bh=&%6wg!a'
const HEADERS = { 'User-Agent': UA, 'Referer': `${BASE}/` }
const { data } = await axios.get(`${APIBASE}/search`, { params: { query }, headers: HEADERS, timeout: 12000 })
const results = (data.data || []).slice(0, 10)
if(!results.length) throw new Error('Nenhum resultado encontrado')
const track = results[0]
const { data: tokenData } = await axios.get(`${APIBASE}/download-token`, { params: { t: track.id, f: format }, headers: { ...HEADERS, 'X-Download-Access': KEY }, timeout: 10000 })
const { token, expires } = tokenData
const dlRes = await axios.get(`${APIBASE}/download`, { params: { t: track.id, f: format, token, expires }, headers: HEADERS, responseType: 'arraybuffer', timeout: 60000 })
const ext = format.toLowerCase().includes('flac') ? 'flac' : 'mp3'
const mimeType = ext === 'flac' ? 'audio/flac' : 'audio/mpeg'
const fileName = `${track.artist} - ${track.title}.${ext}`.replace(/[\/\\:*?"<>|]/g, '')
return {
title: track.title,
artist: track.artist.name,
album: track.album.title,
duration: track.duration,
cover: track.album.cover_xl,
link: track.link,
explicit: track.explicit_lyrics,
download: { buffer: Buffer.from(dlRes.data), ext, mimeType, size: parseInt(dlRes.headers['content-length'] || '0', 10) },
fileName
}
}
}-e 


==================================================
Downloads/facebookdl.js
==================================================
const request = require("request");
const cheerio = require("cheerio");

class ScrapperData {

    static getHeaders() {
        const headers = {
            "sec-fetch-user": "?1",
            "sec-ch-ua-mobile": "?0",
            "sec-fetch-site": "none",
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "cache-control": "max-age=0",
            "authority": "www.facebook.com",
            "upgrade-insecure-requests": "1",
            "accept-language": "en-GB,en;q=0.9,tr-TR;q=0.8,tr;q=0.7,en-US;q=0.6",
            "sec-ch-ua": '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.114 Safari/537.36",
            "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
            "cookie": "sb=Rn8BYQvCEb2fpMQZjsd6L382; datr=Rn8BYbyhXgw9RlOvmsosmVNT; c_user=100003164630629; _fbp=fb.1.1629876126997.444699739; wd=1920x939; spin=r.1004812505_b.trunk_t.1638730393_s.1_v.2_; xs=28%3A8ROnP0aeVF8XcQ%3A2%3A1627488145%3A-1%3A4916%3A%3AAcWIuSjPy2mlTPuZAeA2wWzHzEDuumXI89jH8a_QIV8; fr=0jQw7hcrFdas2ZeyT.AWVpRNl_4noCEs_hb8kaZahs-jA.BhrQqa.3E.AAA.0.0.BhrQqa.AWUu879ZtCw"
        };
        return headers;
    }

    static formatDuration(ms) {
        if (!ms || ms <= 0) return "00:00";
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
        const seconds = (totalSeconds % 60).toString().padStart(2, "0");
        return `${minutes}:${seconds}`;
    }

    static getHTML(url, config = {}) {
        return new Promise((resolve, reject) => {
            request({ url, ...config }, (error, res, body) => {
                if (error) return reject(error);
                resolve(body);
            });
        });
    }

    static decodeHTML(texto) {
        return texto.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
            return String.fromCharCode(parseInt(hex, 16)).trim();
        });
    }

    static get(videoUrl) {
        return new Promise((resolve, reject) => {
            if (!videoUrl || !videoUrl.trim()) return reject("Por favor, especifique o URL do Facebook na execução do script.");
            if (!videoUrl.includes("facebook.com") && !videoUrl.includes("fb.watch")) return reject("Isso é um link de um vídeo do Facebook? Verifique, por favor.");
            this.getHTML(videoUrl, {
                headers: this.getHeaders()
            })
            .then((response) => {
                const data = response.replace(/&quot;/g, '"').replace(/&amp;/g, "&");

                const sdMatch = data.match(/"browser_native_sd_url":"(.*?)"/) || data.match(/"playable_url":"(.*?)"/) || data.match(/sd_src\s*:\s*"([^"]*)"/);
                const hdMatch = data.match(/"browser_native_hd_url":"(.*?)"/) || data.match(/"playable_url_quality_hd":"(.*?)"/) || data.match(/hd_src\s*:\s*"([^"]*)"/);
                const titleMatch = data.match(/<meta\sname="description"\scontent="(.*?)"/);
                const thumbMatch = data.match(/"preferred_thumbnail":{"image":{"uri":"(.*?)"/);
                const durationMatch = data.match(/"playable_duration_in_ms":(\d+)/);
                const duration_in_miliseconds = durationMatch ? parseInt(durationMatch[1], 10) : 0;
                const titleFormatted = this.decodeHTML(titleMatch && titleMatch[1] ? titleMatch[1] : data.match(/<title>(.*?)<\/title>/)?.[1] ?? "").trim();

                if (sdMatch && sdMatch[1]) {
                    const result = {
                        status: "Online",
                        resultado: {
                            url: videoUrl,
                            title: titleFormatted,
                            duration: this.formatDuration(duration_in_miliseconds),
                            dl_link: {
                                HD: hdMatch && hdMatch[1] ? hdMatch[1] : "",
                                SD: sdMatch[1]
                            },
                            thumbnail: thumbMatch && thumbMatch[1] ? thumbMatch[1] : ""
                        },
                        statusCode: 200
                    };
                    return resolve(result);
                } else {
                    return reject({
                        status: "Error",
                        message: "Não foi possível obter informações do vídeo. Tente novamente mais tarde!",
                        statusCode: 404
                    });
                }
            }).catch((error) => {
                return reject({
                    status: "Offline",
                    errorMessage: error,
                    statusCode: 500
                });
            });
        });
    }
}

module.exports = ScrapperData;-e 


==================================================
Downloads/gdrive.js
==================================================
const cheerio = require("cheerio");
const axios = require("axios");

function parseFileSize(size) {
    return parseFloat(size) * (/GB/i.test(size) ? 1000000 : /MB/i.test(size) ? 1000 : /KB/i.test(size) ? 1 : /bytes?/i.test(size) ? 0.001 : /B/i.test(size) ? 0.1 : 0);
}

async function GDriveDl(url) {
    let id;
    if (!(url && url.match(/drive\.google/i))) throw "O url fornecido está inválido.";
    id = (url.match(/\/?id=(.+)/i) || url.match(/\/d\/(.*?)\//)) [1];
    if (!id) throw "Error - [ID NOT FOUND] - Possível motivo: O arquivo pode estar privado.";

    let res = await axios.post(`https://drive.google.com/uc?id=${id}&authuser=0&export=download`, null, {
        headers: {
            "accept-encoding": "gzip, deflate, br",
            "content-length": 0,
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            origin: "https://drive.google.com",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36",
            "x-client-data": "CKG1yQEIkbbJAQiitskBCMS2yQEIqZ3KAQioo8oBGLeYygE=",
            "x-drive-first-party": "DriveWebUi",
            "x-json-requested": "true",
        }
    });

    let { fileName, sizeBytes, downloadUrl } = JSON.parse(res.data.slice(4));
    if (!downloadUrl) throw "Limite de download de links!";

    let data = await axios.get(downloadUrl, { validateStatus: null });
    if (data.status !== 200) throw data.statusText;

    return {
        downloadUrl,
        fileName,
        mimetype: data.headers["content-type"]
    };
}

module.exports = { GDriveDl };-e 


==================================================
Downloads/ghost.js
==================================================
"use strict";

const puppeteer = require("puppeteer-core");
const https     = require("https");
const fs        = require("fs");

const TOKEN = "2Uc3Wf3lPhKUycob642c4ce094bee05ec258f39ddb8819171";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function ghostface(command) {
  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://production-sfo.browserless.io?token=${TOKEN}`,
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  );

  let videoUrl = null;
  page.on("response", (res) => {
    const url = res.url();
    if (
      (url.includes(".mp4") || url.includes(".webm")) &&
      !url.includes("idle") &&
      !url.includes("loop") &&
      !url.includes("manifest")
    ) {
      videoUrl = url;
    }
  });

  try {
    await page.goto("https://subservientghostface.com/br", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Idade
    await page.waitForSelector('input[name="month"]', { timeout: 15000 });
    await page.evaluate(() => {
      document.querySelector('input[name="month"]').value = "06";
      document.querySelector('input[name="day"]').value   = "03";
      document.querySelector('input[name="year"]').value  = "2000";
      ["month", "day", "year"].forEach((n) =>
        document.querySelector(`input[name="${n}"]`).dispatchEvent(new Event("input", { bubbles: true }))
      );
      (document.querySelector('button[type="submit"]') || document.querySelector("button")).click();
    });
    await delay(3000);

    // Enviar comando
    await page.waitForSelector("#command-input", { timeout: 15000 });
    await page.focus("#command-input");
    await page.type("#command-input", command, { delay: 60 });
    await delay(300);
    await page.keyboard.press("Enter");

    // Aguardar vídeo capturado via rede
    const start = Date.now();
    while (!videoUrl && Date.now() - start < 60000) await delay(500);
    if (!videoUrl) throw new Error("Vídeo não encontrado");

    return { status: true, url: videoUrl };

  } finally {
    await browser.close();
  }
}

module.exports = { ghostface };-e 


==================================================
Downloads/kwaisc.js
==================================================
const setClass = new Object({
	query: '',
	cookie: ''
})

module.exports = class Kwai {
	constructor(config = {}) {
		const { query, cookie } = Object.assign(setClass, config)
		this.query = query
		this.cookie = cookie
	}
	
	get() {
		if (!this.query) return Promise.reject("O campo de texto está vazio. Por favor, insira uma URL, nome de usuário ou pesquise um vídeo.")
		
		const Regex = /@([A-Za-z0-9._]+)/
		const url = this.isUrl()
		const user = Regex.test(this.query) && this.query.match(Regex)[0]
		if (url) {
			this.query = url[0]
			return /\/(old\/photo|p)\//.test(this.query) ? this.gerais() : this.video()
		} else if (user) {
			this.query = user
			return this.user()
		} else {
			return this.search()
		}
	};
	
	isUrl(url = this.query) {
		const m1 = /((?:https?:\/\/)?(?:(www|m)\.)?kwai\.com(?:\/([^/?#&]+)|)\/(video|photo)\/([0-9]+)).*/
		const m2 = /((?:https?:\/\/)?(?:(www|m|k)\.)?kwai\.com\/p\/([a-zA-Z]+)).*/
		return url.match(m1.test(url) ? m1 : m2)
	};
	
	search() {
		if (!(this.query && !this.isUrl() && typeof this.query == 'string')) {
			return Promise.reject("O campo de texto está vazio. Por favor, insira algum texto para realizar a pesquisa.");
		}
		
		const data = JSON.stringify({
			fromPage: 'PWA_NEW_SEARCH',
			fromUser: true,
			infiniteType: 'search_boost_feed',
			pcursor: 0,
			searchWord: this.query
		});
		const fetch = require('node-fetch');
		return fetch("https://www.kwai.com/rest/o/w/pwa/feed/searchNew", {
			method: 'POST',
			headers: {
				Cookie: this.cookie,
				Origin: 'https://www.kwai.com',
				Referer: 'https://www.kwai.com/discover/'+encodeURIComponent(this.query),
				'User-Agent': this.userAgent(),
				'Accept-Language': "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7",
				Accept: 'application/json, text/plain, */*',
				'Content-Type': 'application/json',
				'Sec-Ch-Ua-Platform': "Android",
				'Content-Length': data.length
			},
			body: data
		}).then(i => i.json()).then(i => i.data.map(o => ({		   
			name: (o.data.feeds.ugcSoundAuthorName || ''),
			user: o.data.feeds.kwai_id,
			icon: o.data.feeds.headurls[0].url,
			caption: o.data.feeds.caption,
			comments: o.data.feeds.comment_count,
			likes: o.data.feeds.like_count,
			views: o.data.feeds.view_count,
			sharing: o.data.feeds.forward_count,
			url: 'https://www.kwai.com/@'+o.data.feeds.kwai_id+'/video/'+o.data.feeds.photo_id_str+'?page_source=discover'
		})))
	};
	
	interactionStatistic(o) {
		const rest = {}
		for (let i of o.map(i => ({ count: i.userInteractionCount, type: i.interactionType['@type'].split('/').pop().replace('Action', '').toLowerCase() }))) {
			Object.assign(rest, { [i.type]: i.count })
		}
		return rest
	};
	
	cheerioEqJson(html, index = 0) {
		const cheerio = require('cheerio');
		const $ = cheerio.load(html)
    	const str = JSON.parse($('script[type="application/ld+json"]').eq(index).html())
    	return str
	};
	
	gerais() {
		if (!(this.query && this.isUrl() && /\/(old\/photo|p)\//.test(this.query))) {
			return Promise.reject("É necessário que seja um link de old/photo.");
		}
		
		const fetch = require('node-fetch');
		return fetch(this.query, {
			method: 'GET',
			headers: {
				'User-Agent': this.userAgent(),
				'Sec-Ch-Ua-Platform': "Android"
			}
		}).then(i => i.text()).then(html => {
			const { thumbnailUrl } = this.cheerioEqJson(html)
			this.query = thumbnailUrl
			return this.video()
		});
	};
	
	video() {
		if (!(this.query && this.isUrl() && /\/(video|photo)\//.test(this.query))) {
			return Promise.reject("É necessário que seja um link de vídeo.");
		}
		
		const fetch = require('node-fetch');
		return fetch(this.query, {
			method: 'GET',
			headers: {
				'User-Agent': this.userAgent(),
				'Sec-Ch-Ua-Platform': "Android"
			}
		}).then(i => i.text()).then(html => {
    		let { description, uploadDate, contentUrl, audio, creator: { mainEntity }, commentCount, interactionStatistic, genre } = this.cheerioEqJson(html)
			interactionStatistic = this.interactionStatistic(interactionStatistic)
			mainEntity.interactionStatistic = this.interactionStatistic(mainEntity.interactionStatistic)
			return Promise.resolve({			   
				description,
				date: uploadDate,
				dl: contentUrl,
				audioName: audio.name,
				audioAuthor: audio.author,
				genre: (genre || []),
				comments: commentCount,
				...interactionStatistic,
				profile: {
					name: mainEntity.name,
					user: mainEntity.alternateName,
					...mainEntity.interactionStatistic,
					publications: mainEntity.agentInteractionStatistic.userInteractionCount,
					description: mainEntity.description,
					icon: mainEntity.image,
					url: mainEntity.url,
					networks: mainEntity.sameAs
				}
			});
		});
	};
	
	user() {
		if (!/@([A-Za-z0-9._]+)/.test(this.query)) return Promise.reject("O campo de texto não contém um usuário. Por favor, insira um usuário para realizar a busca.")
		
		const fetch = require('node-fetch');
		return fetch("https://www.kwai.com/"+this.query+"?page_source=video_detail", {
			method: 'GET',
			headers: {
				'User-Agent': this.userAgent(),
				'Sec-Ch-Ua-Platform': "Android"
			}
		}).then(i => i.text()).then(html => {
    		let { dateCreated, mainEntity } = this.cheerioEqJson(html)
    		mainEntity.interactionStatistic = this.interactionStatistic(mainEntity.interactionStatistic)
    		return Promise.resolve({
    			dateCreated,
				name: mainEntity.name,
				user: mainEntity.alternateName,
				...mainEntity.interactionStatistic,
				publications: mainEntity.agentInteractionStatistic.userInteractionCount,
				description: mainEntity.description,
				icon: mainEntity.image,
				url: mainEntity.url,
				networks: mainEntity.sameAs
			});
		});
	};
	
	userAgent() {
		const oos = [ 'Macintosh; Intel Mac OS X 10_15_7', 'Macintosh; Intel Mac OS X 10_15_5', 'Macintosh; Intel Mac OS X 10_11_6', 'Macintosh; Intel Mac OS X 10_6_6', 'Macintosh; Intel Mac OS X 10_9_5', 'Macintosh; Intel Mac OS X 10_10_5', 'Macintosh; Intel Mac OS X 10_7_5', 'Macintosh; Intel Mac OS X 10_11_3', 'Macintosh; Intel Mac OS X 10_10_3', 'Macintosh; Intel Mac OS X 10_6_8', 'Macintosh; Intel Mac OS X 10_10_2', 'Macintosh; Intel Mac OS X 10_10_3', 'Macintosh; Intel Mac OS X 10_11_5', 'Windows NT 10.0; Win64; x64', 'Windows NT 10.0; WOW64', 'Windows NT 10.0' ];
		return `Mozilla/5.0 (${oos[Math.floor(Math.random() * oos.length)]}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * 3) + 87}.0.${Math.floor(Math.random() * 190) + 4100}.${Math.floor(Math.random() * 50) + 140} Safari/537.36`;
	};
}-e 


==================================================
Downloads/mediafire.js
==================================================
const axios = require('axios');
const fetch = require("node-fetch");
const cheerio = require('cheerio');

function mediafiredl(url) {
    return new Promise(async (resolve, reject) => {
        try {
            if (!/https?:\/\/(www\.)?mediafire\.com/.test(url)) return resolve(null);

            const response = await axios.get(url);
            const $ = cheerio.load(response.data);
            const downloadUrl = $('#downloadButton').attr('href');
            const filename = $('div.filename').text().trim();
            const filesizeH = $('ul.details > li').first().find('span').text().trim();

            if (!downloadUrl || !filename) {
                return resolve(null);
            }

            resolve({
                url: downloadUrl,
                filename,
                filesizeH,
            });
        } catch (error) {
            reject(error);
        }
    });
}

module.exports.mediafiredl = mediafiredl;-e 


==================================================
Downloads/pindl.js
==================================================
const puppeteer = require("puppeteer-core")
const TOKENS = [
  "2Uc3Wf3lPhKUycob642c4ce094bee05ec258f39ddb8819171",
  "2UcR17zBrPq3E4Sbf3693486a1a90b8f24469c886c755a0a0",
  "2UcR5WpJttRlB41726d9318de6477130b08d7613ff4ae4fa5",
  "2UcR7gAuh8SCEHQc94f835414c38e59bd0bf5a64329f02c12",
  "2UcRAKts9vnx0xed2e8bcd46984d2c5c6a3d7e2a5ae6fd599",
  "2UcR9HmxnkhX7lDe347a98fe459c9ab6d0af6901641d51af8"
]
const TOKEN = TOKENS[Math.floor(Math.random() * TOKENS.length)]
async function pinterestDownload(url) {
 const browser = await puppeteer.connect({
  browserWSEndpoint: `wss://production-sfo.browserless.io?token=${TOKEN}`
 })
 try {
  const page = await browser.newPage()
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')
  await page.goto("https://klickpin.com/", { waitUntil: "networkidle2" })
  await page.waitForSelector('input[name="url"]', { visible: true })
  await page.type('input[name="url"]', url)
  await page.click('#fd')
  await page.waitForSelector('table, a[href*="download?url="]', { visible: true, timeout: 45000 })
  const result = await page.evaluate(() => {
   const links = Array.from(document.querySelectorAll('a'))
   const targets = [
    { label: 'Vídeo', pattern: /DOWNLOAD THE VIDEO/i },
    { label: 'Imagem', pattern: /DOWNLOAD THE IMAGE|DOWNLOAD ARTWORK/i },
    { label: 'Link 2', pattern: /DOWNLOAD LINK 2/i }
   ]
   for (const target of targets) {
    const found = links.find(a => target.pattern.test(a.innerText))
    if (found && found.href && !found.href.includes('chromewebstore')) {
     return { type: target.label, url: found.href }
    }
   }
   const fallback = links.find(a => a.href.includes('download?url='))
   if (fallback) return { type: 'Detectado (Fallback)', url: fallback.href }
   return null
  })
  return result
 } finally {
  await browser.close()
 }
}

module.exports = { pinterestDownload }-e 


==================================================
Downloads/pinterestmp4.js
==================================================
const axios = require('axios');
const cheerio = require('cheerio');

const pintedlk = (url) => new Promise((resolve, reject) => {
axios.get(url)
.then((res) => {
const $ = cheerio.load(res.data);
const script = $('script[data-test-id="video-snippet"]').html();
if (!script) return reject(new Error('F.')); 
const json = JSON.parse(script);
resolve({
status: res.status,
titulo: json.name,
thumb: json.thumbnailUrl,
video: json.contentUrl
});
})
.catch((e) => reject(e));
});

module.exports = { pintedlk };-e 


==================================================
Downloads/reddit.js
==================================================
const axios = require("axios")
const cheerio = require("cheerio")

async function redditDownloader(url) {
try {
const res = await axios.get(
`https://rapidsave.com/info?url=${encodeURIComponent(url)}`,
{
headers: {
"user-agent": "Mozilla/5.0"
}
}
)

const $ = cheerio.load(res.data)

// 🔥 PEGA O LINK FINAL DIRETO (CORRETO)
const downloadUrl = $("a.downloadbutton").attr("href")

if (!downloadUrl) return null

return downloadUrl

} catch (e) {
return null
}
}

module.exports = { redditDownloader }-e 


==================================================
Downloads/scraperdlV1.js
==================================================
const axios = require('axios');
const fetch = require("node-fetch");
const cheerio = require('cheerio');

class ScrapperData {

 static async isUrl(url) {
    return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/gi))
 } 

 static async getOriginalUrl(url) {
   return new Promise(async(resolve, reject) => {
     await fetch(url).then((OriginalURL) => {
       resolve(OriginalURL.url);
     }).catch((error) => reject("Ocorreu um erro ao obter o URlL original."));
   })
 }
 
 static async mediafireDL(url) {
   try {
     const res = await axios.get(`https://www-mediafire-com.translate.goog/${url.replace('https://www.mediafire.com/','')}?_x_tr_sl=en&_x_tr_tl=fr&_x_tr_hl=en&_x_tr_pto=wapp`)
     const $ = cheerio.load(res.data)
     const dl_link = $('#downloadButton').attr('href')
     const fileName = $('.dl-btn-label').attr('title') || $('body > main > div.content > div.center > div > div.dl-btn-cont > div.dl-btn-labelWrap > div.promoDownloadName.notranslate > div').attr('title').replaceAll(' ','').replaceAll('\n','')
     //const upload = $('body > main > div.content > div.center > div > div.dl-info > ul > li:nth-child(2) > span').text()
     const size = $('#downloadButton').text().replace('Download', '').replace('(', '').replace(')', '').replace('\n', '').replace('\n', '').replace('                         ', '').replaceAll(' ','')
     let mimetype = ''
     let rese = await axios.head(dl_link)
     mimetype = rese.headers['content-type']
     
     return Promise.resolve({dl_link, fileName, size, mimetype})
   } catch(error) {
     return Promise.reject(error);
   }
 }

 static async instagramDL(url) {
  return new Promise(async (resolve, reject) => {
    if (!this.isUrl(url)) return reject("O que foi preenchido não é um URL!");
    if (!url.includes("instagram.com")) return reject("URL não pertence ao Instagram! (V)");
    const res = await fetch("https://v3.igdownloader.app/api/ajaxSearch", {
      method: "POST",
      body: new URLSearchParams({
        recapthaToken: "",
        q: url,
        t: "media",
        lang: "id",
      }),
    }).then((v) => v.json())
      .then((v) => v.data);
    if (!res) return reject("O vídeo/imagem que você deseja baixar, pertence a uma conta privada, por favor não insista.");
    const resultado = [];
    const $ = cheerio.load(res);
    $($("ul")).find("li").each((i, el) => {
        resultado.push({
          type: $(el).find("a[title]").attr("title").toLowerCase().includes("photo") ? "image" : "video",
          thumbnailUrl: $(el).find("img").attr("data-src") || $(el).find("img").attr("src"),
          mediaUrl: $(el).find("a[title]").attr("href"),
        });
      });
       resolve(resultado);
   });
 }

 static async tiktokStalk(username) {
   return new Promise(async(resolve, reject) => {
     axios.get(`https://tiktok.com/@${username}`, {
       headers: {
         "User-Agent": "PostmanRuntime/7.32.2"
       }
      }).then(async(request) => {
        const $ = await cheerio.load(request.data);
        const resultado = await $("#__UNIVERSAL_DATA_FOR_REHYDRATION__").text();
        const data = JSON.parse(resultado);
        if (data["__DEFAULT_SCOPE__"]["webapp.user-detail"].statusCode !== 0) return reject('Sem resultado de data.');
        const resultData = {
          userInfo: data["__DEFAULT_SCOPE__"]["webapp.user-detail"].userInfo.user,
          stats: data["__DEFAULT_SCOPE__"]["webapp.user-detail"].userInfo.stats,
          share: data["__DEFAULT_SCOPE__"]["webapp.user-detail"].shareMeta
       }
        return resolve(resultData);
      }).catch((error) => reject(String(error)));
   })
}

 static async soundcloud(url) {
   return new Promise(async(resolve, reject) => {
    if (!this.isUrl(url)) return reject("O que foi preenchido não é um URL!");
    if (!url.includes("soundcloud.com")) return reject("URL não pertence ao SoundCloud! (V)")
      axios(`https://api.downloadsound.cloud/track`, {
        method: "post", 
        data: {url: url},
        headers: {
          "Content-Type": "application/json"
        }
      }).then((dataUrl) => {
        return resolve(dataUrl.data)
      }).catch((error) => reject(String(error)));
    })
  }

}


module.exports = new Object({
   MediaFireDL: (URL) => ScrapperData.mediafireDL(URL),
   InstagramDL: (URL) => ScrapperData.instagramDL(URL),
   TiktokStalk: (URL) => ScrapperData.tiktokStalk(URL),
   SoundCloud: (URL) => ScrapperData.soundcloud(URL)
})-e 


==================================================
Downloads/shazam.js
==================================================
const acrcloud = require("acrcloud")
const fs = require("fs")

const arcloud = async (Aud64) => {

let acr = new acrcloud({
   host: "identify-us-west-2.acrcloud.com/",
   access_key: "5fa558ba9eebbab70db053014f283431",
   access_secret: "4zblfTHO0JNtvRVggdamzuvABy9TKN9FPjyz0f3w",
})

let audd = Buffer.from(Aud64, "base64")
let data = await acr.identify(audd)
let hasil = []
hasil.push({
 artista: data.metadata.music[0].artists[0].name,
 album: data.metadata.music[0].album.name,
 titulo: data.metadata.music[0].title,
 rotulo: data.metadata.music[0].label
})
return hasil
}

module.exports = { arcloud }-e 


==================================================
Downloads/snapchat.js
==================================================
const axios = require("axios")

async function snapchatDownload(url) {
  if(!url) throw new Error("URL do Snapchat é necessária")
  const res = await axios.post("https://solyptube.com/findsnapchatvideo", { url }, {
    headers: {
      accept: "*/*",
      "accept-language": "en-US,en;q=0.6",
      "content-type": "application/json",
      dnt: "1",
      origin: "https://spotlight.how2shout.com",
      referer: "https://spotlight.how2shout.com/",
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36"
    },
    maxBodyLength: Infinity
  })
  const story = res.data?.data
  if(!story) throw new Error("Sem dados")
  const snaps = story.snapList || []
  if(!snaps.length) throw new Error("Nenhum conteúdo encontrado")
  const mediaUrl = snaps[0]?.snapUrls?.mediaUrl
  const thumbnail = story.thumbnailUrl?.value || null
  if(!mediaUrl) throw new Error("URL de mídia não encontrada")
  return { mediaUrl, thumbnail }
}

module.exports = { snapchatDownload }-e 


==================================================
Downloads/soundcloud.js
==================================================
// soundclouddl.js
const axios = require("axios")

async function soundcloudDownload(url) {
    try {
        const apiUrl = "https://urlmp4.com/wp-json/aio-dl/video-data/"

        const response = await axios.post(
            apiUrl,
            `url=${encodeURIComponent(url)}&token=8b6e170975d92939bb67d8db567f82e43fa2da91e00a84f258af77c1186c5e8a`,
            {
                headers: {
                    accept: "*/*",
                    "accept-language": "en-US,en;q=0.9",
                    "content-type": "application/x-www-form-urlencoded",
                    priority: "u=1, i",
                    "sec-fetch-dest": "empty",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-origin",
                    "sec-gpc": "1",
                    cookie: "pll_language=en",
                    Referer: "https://urlmp4.com/en/soundcloud-downloader/"
                }
            }
        )

        return response.data
    } catch (error) {
        throw new Error(`SoundCloud API request failed: ${error.message}`)
    }
}

module.exports = { soundcloudDownload }-e 


==================================================
Downloads/spotifydl.js
==================================================
const axios = require('axios')
const cheerio = require('cheerio')

const UA = 'Mozilla/5.0 (Linux; Android 11; Redmi Note 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
const BASE_URL = 'https://spotidown.app'

async function getSession() {
const { data, headers } = await axios.get(`${BASE_URL}/es5`, { headers: { 'User-Agent': UA }, timeout: 12000 })
const $ = cheerio.load(data)
const tokenName = $('input[type="hidden"]').not('[name="g-recaptcha-response"]').first().attr('name')
const token = $('input[type="hidden"]').not('[name="g-recaptcha-response"]').first().val()
const cookies = headers['set-cookie']?.map(c => c.split(';')[0]).join('; ') || ''
return { tokenName, token, cookies }
}

function buildHeaders(cookies) {
return { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded', 'Referer': `${BASE_URL}/es5`, 'Origin': BASE_URL, 'Cookie': cookies, 'X-Requested-With': 'XMLHttpRequest' }
}

async function spotidownTrack(inputUrl) {
if (!inputUrl) throw new Error('É necessário fornecer um link de track do Spotify')
let url = inputUrl.replace(/\/intl-[a-z]{2}\//i, '/')
if (!url.includes('spotify.com/track')) throw new Error('URL inválida. Deve ser um link de track do Spotify.')
const { tokenName, token, cookies } = await getSession()
const { data: actionData } = await axios.post(`${BASE_URL}/action`, new URLSearchParams({ url, 'g-recaptcha-response': '', [tokenName]: token }), { headers: buildHeaders(cookies), timeout: 20000 })
if (actionData?.error) throw new Error(actionData.message || 'Error al obtener el track.')
const $r = cheerio.load(actionData.data || '')
const dataF = $r('input[name="data"]').first().val()
const baseF = $r('input[name="base"]').first().val()
const tkF = $r('input[name="token"]').first().val()
if (!dataF) throw new Error('No se pudo obtener la info del track.')
const trackInfo = JSON.parse(Buffer.from(dataF, 'base64').toString())
const { data: trackData } = await axios.post(`${BASE_URL}/action/track`, new URLSearchParams({ data: dataF, base: baseF, token: tkF }), { headers: buildHeaders(cookies), timeout: 30000 })
if (trackData?.error) throw new Error(trackData.message || 'Error al descargar el track.')
const $t = cheerio.load(trackData.data || '')
const links = []
$t('a[id="popup"]').each((_, el) => {
const href = $t(el).attr('href') || ''
const label = $t(el).find('span span').text().trim()
if (href) links.push({ label, url: href })
})
const mp3 = links.find(l => l.label.toLowerCase().includes('mp3'))?.url || null
const cover = links.find(l => l.label.toLowerCase().includes('cover'))?.url || null
return { name: trackInfo.name, artist: trackInfo.artist, album: trackInfo.album, duration: trackInfo.duration, year: trackInfo.date, cover: trackInfo.cover, mp3, coverHd: cover }
}

async function spotidownSearch(query) {
if (!query?.trim()) throw new Error('Informe um termo de busca.')
const { tokenName, token, cookies } = await getSession()
const { data: actionData } = await axios.post(`${BASE_URL}/action`, new URLSearchParams({ url: query.trim(), 'g-recaptcha-response': '', [tokenName]: token }), { headers: buildHeaders(cookies), timeout: 20000 })
if (actionData?.error) throw new Error(actionData.message || 'Erro ao buscar.')
const $ = cheerio.load(actionData.data || '')
const allForms = $('form[name="submitspurl"]')
const results = []
$('.grid-item.spotidown').each((i, el) => {
const $el = $(el)
const name = $el.find('h1[itemprop="name"] a').attr('title') || $el.find('h1[itemprop="name"] a').text().trim()
const artist = $el.find('p > span').first().text().trim()
const thumb = $el.find('.spotidown-left img').attr('src') || null
const $f = allForms.eq(i)
const dataF = $f.find('input[name="data"]').val() || null
const baseF = $f.find('input[name="base"]').val() || null
let meta = {}
if (dataF) { try { meta = JSON.parse(Buffer.from(dataF, 'base64').toString()) } catch (_) {} }
const tid = meta.tid || null
results.push({ position: i + 1, name: meta.name || name, artist: meta.artist || artist, album: meta.album || null, duration: meta.duration || null, cover: meta.cover || thumb, trackUrl: tid ? `https://open.spotify.com/track/${tid}` : null, _formData: dataF ? { data: dataF, base: baseF } : null })
})
if (!results.length) throw new Error('Nenhum resultado encontrado.')
return results
}

async function spotidownDownloadResult(result) {
if (!result._formData?.data) throw new Error('Resultado sem dados para download.')
const { tokenName, token, cookies } = await getSession()
const { data: trackData } = await axios.post(`${BASE_URL}/action/track`, new URLSearchParams({ data: result._formData.data, base: result._formData.base || '', [tokenName]: token }), { headers: buildHeaders(cookies), timeout: 30000 })
if (trackData?.error) throw new Error(trackData.message || 'Erro ao baixar.')
const $t = cheerio.load(trackData.data || '')
const links = []
$t('a[id="popup"]').each((_, el) => {
const href = $t(el).attr('href') || ''
const label = $t(el).find('span span').text().trim()
if (href) links.push({ label, url: href })
})
return { name: result.name, artist: result.artist, album: result.album, duration: result.duration, cover: result.cover, trackUrl: result.trackUrl, mp3: links.find(l => l.label.toLowerCase().includes('mp3'))?.url || null, coverHd: links.find(l => l.label.toLowerCase().includes('cover'))?.url || null }
}

module.exports = { spotidownTrack, spotidownSearch, spotidownDownloadResult }-e 


==================================================
Downloads/spotifydl2.js
==================================================
const axios = require("axios");

async function spotifyDownload(url){
if(!url||typeof url!=="string")throw new Error("A valid Spotify URL must be provided")
try{
const res=await axios.post("https://musicfab.io/api/spotify",{url},{
headers:{
"Content-Type":"application/json",
Accept:"application/json",
Referer:"https://musicfab.io/",
Origin:"https://musicfab.io"
},
timeout:15000,
validateStatus:status=>status<500
})
if(res.status>=400)throw new Error(`MusicFab API error: ${res.status}`)
return res.data
}catch(err){
if(err.code==="ECONNABORTED")throw new Error("Request timeout from MusicFab API")
if(err.response)throw new Error(`MusicFab API error: ${err.response.status} ${err.response.statusText}`)
if(err.request)throw new Error("No response received from MusicFab API")
throw new Error(`Request failed: ${err.message}`)
}}

module.exports={spotifyDownload}-e 


==================================================
Downloads/terabox.js
==================================================
const axios = require("axios")
const cheerio = require("cheerio")
const qs = require("qs")

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_4_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4.1 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Mobile Safari/537.36"
]

const getUA = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]

async function fetchNonce(ua) {
  const res = await axios.get("https://teradownloaderz.com", {
    headers: { "user-agent": ua }
  })
  const $ = cheerio.load(res.data)
  const scriptContent = $("#jquery-core-js-extra").html()
  if (!scriptContent) throw new Error("Nonce script not found")
  const nonceMatch = scriptContent.match(/"nonce":"(.*?)"/)
  if (!nonceMatch) throw new Error("Nonce not found")
  return nonceMatch[1]
}

async function tryTeradownloaderz(teraboxUrl) {
  const ua = getUA()
  const nonce = await fetchNonce(ua)
  const res = await axios.post(
    "https://teradownloaderz.com/wp-admin/admin-ajax.php",
    qs.stringify({ action: "terabox_fetch", url: teraboxUrl, nonce }),
    {
      headers: {
        accept: "*/*",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
        origin: "https://teradownloaderz.com",
        referer: "https://teradownloaderz.com/",
        "user-agent": ua,
        "x-requested-with": "XMLHttpRequest"
      }
    }
  )
  const raw = res.data?.data?.debug_raw_response
  if (!raw) throw new Error("Sem resposta válida")
  const parsed = JSON.parse(raw)
  if (!parsed?.list?.length) throw new Error("Lista vazia")
  return parsed.list
}

async function tryTbsaveAPI(teraboxUrl) {
  const ua = getUA()
  const res = await axios.get(`https://api.tbsave.com/api/terabox?link=${encodeURIComponent(teraboxUrl)}`, {
    headers: { "user-agent": ua },
    timeout: 15000
  })
  const list = res.data?.data?.list || res.data?.list
  if (!list?.length) throw new Error("Sem resultado")
  return list
}

async function tryTeraboxDL(teraboxUrl) {
  const ua = getUA()
  const res = await axios.post(
    "https://terabox.dhakamistu.workers.dev/",
    { url: teraboxUrl },
    {
      headers: {
        "content-type": "application/json",
        "user-agent": ua
      },
      timeout: 15000
    }
  )
  const list = res.data?.list || res.data?.data
  if (!list?.length) throw new Error("Sem resultado")
  return list
}

async function teraboxDownload(teraboxUrl) {
  const attempts = [
    () => tryTeradownloaderz(teraboxUrl),
    () => tryTbsaveAPI(teraboxUrl),
    () => tryTeraboxDL(teraboxUrl)
  ]

  for (const attempt of attempts) {
    try {
      const list = await attempt()
      return { success: true, list }
    } catch (err) {
      console.log("Tentativa falhou:", err.message)
    }
  }

  throw new Error("Todos os métodos falharam")
}

module.exports = { teraboxDownload }-e 


==================================================
Downloads/threads.js
==================================================
const axios = require('axios')
const FormData = require('form-data')
const UA = 'Mozilla/5.0 (Linux; Android 11; Redmi Note 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
const BASE = 'https://sssthreads.app'

function decodeToken(token){
const parts = token.split('.')
const pad = p=>p+'='.repeat((4-p.length%4)%4)
try{return JSON.parse(Buffer.from(pad(parts[0]),'base64').toString())}catch{return null}
}

async function downloadThreadsMedia(url){
if(!url.includes('threads.net') && !url.includes('threads.com')) return {error:true,msg:'URL inválida'}
const form = new FormData()
form.append('action','fetch_source')
form.append('url',url)
const {data} = await axios.post(BASE+'/',form,{
headers:{
'User-Agent':UA,
'Referer':BASE+'/',
'Origin':BASE
},
timeout:20000,
validateStatus:()=>true
})
if(!data?.success || !data?.token) return {error:true,msg:data?.error||'Não foi possível processar o conteúdo'}
const payload = decodeToken(data.token)
if(!payload?.v) return {error:true,msg:'Não se encontrou conteúdo no post'}
const mediaUrl = payload.v.replace(/&amp;/g,'&')
const thumb = payload.t?.replace(/&amp;/g,'&')||null
const type = mediaUrl.includes('.mp4') || mediaUrl.includes('/v/')?'video':'imagem'
return {error:false,resultado:[{type,url:mediaUrl,thumb,downloadUrl:BASE+'/download.php?tk='+encodeURIComponent(data.token)}]}
}

module.exports = {downloadThreadsMedia}-e 


==================================================
Downloads/threads2.js
==================================================
const axios = require("axios")
const cheerio = require("cheerio")

async function threadsDownloader(postUrl) {
const endpoint = "https://lovethreads.net/api/ajaxSearch"
const form = new URLSearchParams({ q: postUrl, t: "media", lang: "en" })

const { data } = await axios.post(endpoint, form.toString(), {
headers: {
"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
origin: "https://lovethreads.net",
referer: "https://lovethreads.net/en",
"x-requested-with": "XMLHttpRequest"
}
})

if(data.status !== "ok") throw new Error("Falha ao processar Threads")

const $ = cheerio.load(data.data)
const photos = []
const videos = []

$(".download-box > li").each((_, li) => {
const item = $(li)

if(item.find(".icon-dlimage").length) {
const thumbnail = item.find(".download-items__thumb img").attr("src")
const variants = []
item.find(".photo-option option").each((_, opt) => {
const url = $(opt).attr("value")
const label = $(opt).text().trim()
if(!url || !label.includes("x")) return
const [width, height] = label.split("x").map(Number)
variants.push({ resolution: label, width, height, url })
})
variants.sort((a,b) => b.width*b.height - a.width*a.height)
photos.push({ index: photos.length+1, thumbnail, variants })
}

if(item.find(".icon-dlvideo").length) {
const thumbnail = item.find(".download-items__thumb img").attr("src")
const videoUrl = item.find('a[title="Download Video"]').attr("href")
if(videoUrl) videos.push({ index: videos.length+1, thumbnail, url: videoUrl, format: "mp4" })
}
})

return { platform: "threads", photoCount: photos.length, videoCount: videos.length, photos, videos }
}

module.exports = { threadsDownloader }-e 


==================================================
Downloads/tiktok1.js
==================================================
const puppeteer = require('puppeteer-core')

const TOKENS = [
  "2Uc3Wf3lPhKUycob642c4ce094bee05ec258f39ddb8819171",
  "2UcR17zBrPq3E4Sbf3693486a1a90b8f24469c886c755a0a0",
  "2UcR5WpJttRlB41726d9318de6477130b08d7613ff4ae4fa5",
  "2UcR7gAuh8SCEHQc94f835414c38e59bd0bf5a64329f02c12",
  "2UcRAKts9vnx0xed2e8bcd46984d2c5c6a3d7e2a5ae6fd599",
  "2UcR9HmxnkhX7lDe347a98fe459c9ab6d0af6901641d51af8"
]

const TOKEN = TOKENS[Math.floor(Math.random() * TOKENS.length)]

async function getTikTokioLinks(tiktokUrl) {
  let browser
  try {
    browser = await puppeteer.connect({
      browserWSEndpoint: `wss://production-sfo.browserless.io?token=${TOKEN}`
    })

    const page = await browser.newPage()
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36')
    await page.setViewport({ width: 1280, height: 800 })

    await page.goto('https://tiktokio.com/pt/', { waitUntil: 'networkidle2', timeout: 60000 })

    await page.waitForFunction(() => !!document.querySelector('div[data-prefix="tiktokio.com"]'), { timeout: 20000 })

    await page.evaluate((videoUrl) => {
      const host = document.querySelector('div[data-prefix="tiktokio.com"]')
      if (!host?.shadowRoot) return
      const root = host.shadowRoot
      const input = root.querySelector('#tk-url-input')
      const btn = root.querySelector('#tk-download-btn')
      if (input && btn) {
        input.value = videoUrl
        input.dispatchEvent(new Event('input', { bubbles: true }))
        btn.click()
      }
    }, tiktokUrl)

    await page.waitForFunction(() => {
      const host = document.querySelector('div[data-prefix="tiktokio.com"]')
      const result = host?.shadowRoot?.querySelector('#tk-result')
      return result && result.querySelectorAll('a').length > 0
    }, { timeout: 30000 })

    await new Promise(r => setTimeout(r, 1000))

    const links = await page.evaluate(() => {
      const host = document.querySelector('div[data-prefix="tiktokio.com"]')
      return Array.from(host.shadowRoot.querySelectorAll('#tk-result a'))
        .map(a => ({ title: a.innerText.trim() || 'Download', url: a.href }))
        .filter(item => item.url.startsWith('http'))
    })

    return links

  } catch (e) {
    console.error('❌ Erro:', e.message)
    return []
  } finally {
    if (browser) await browser.close()
  }
}

module.exports = { getTikTokioLinks }-e 


==================================================
Downloads/tiktok2.js
==================================================
const axios = require("axios")
const cheerio = require("cheerio")

async function tiktokScraper(url) {
    try {
        const baseUrl = 'https://musicaldown.com/en'
        const downloadUrl = 'https://musicaldown.com/download'

        const { data: initialData, headers } = await axios.get(baseUrl, {
            headers: {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            }
        })

        const $ = cheerio.load(initialData)
        const cookie = headers['set-cookie']

        const urlInputName = $('input[id="link_url"]').attr('name')
        const tokenInput = $('input[type="hidden"]').not('[name="verify"]')
        const tokenInputName = tokenInput.attr('name')
        const tokenValue = tokenInput.val()

        if (!urlInputName || !tokenInputName) throw new Error("Campos do formulário não encontrados")

        const params = new URLSearchParams()
        params.append(urlInputName, url)
        params.append(tokenInputName, tokenValue)
        params.append('verify', '1')

        const { data: postData } = await axios.post(downloadUrl, params.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': cookie ? cookie.join('; ') : '',
                'Origin': baseUrl,
                'Referer': baseUrl,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        })

        const $result = cheerio.load(postData)
        const downloadLinks = []

        $result('a.btn.waves-effect').each((i, el) => {
            const text = $result(el).text().trim().replace('arrow_downward', '').trim()
            const href = $result(el).attr('href')
            if (href && !href.includes('musicaldown.com/en') && !text.includes('ANOTHER')) downloadLinks.push({ title: text, url: href })
        })

        if (!downloadLinks.length) throw new Error("Nenhum link encontrado")
        return downloadLinks
    } catch {
        throw new Error("Erro ao processar a URL do TikTok")
    }
}

module.exports = tiktokScraper-e 


==================================================
Downloads/tiktok3.js
==================================================
module.exports = {
  'ttdl': ttdl
};
function generateRandomIP() {
  return Math.floor(Math.random() * 254) + '.' + Math.floor(Math.random() * 254) + '.' + Math.floor(Math.random() * 254) + '.' + Math.floor(Math.random() * 254);
}
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args))
async function ttdl(_0x27536d) {
  try {
    let _0x5a4f16 = await fetch("https://www.tikwm.com/api/", {
      'method': "POST",
      'headers': {
        'Accept': "application/json, text/javascript, */*; q=0.01",
        'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8",
        'X-Forwarded-For': Math.floor(Math.random() * 254) + '.' + Math.floor(Math.random() * 254) + '.' + Math.floor(Math.random() * 254) + '.' + Math.floor(Math.random() * 254),
        'Custom-Port': "443",
        'Sec-CH-UA': "\"Chromium\";v=\"104\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"104\"",
        'User-Agent': "Chrome/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
      },
      'body': new URLSearchParams({
        'url': _0x27536d,
        'count': 0xc,
        'cursor': 0x0,
        'web': 0x1,
        'hd': 0x1
      })
    });
    let _0x387f79 = await _0x5a4f16.json();
    let _0x51677e = _0x387f79.data.region;
    let _0x5cc5a7 = _0x387f79.data.title;
    let _0x51973a = "https://www.tikwm.com" + _0x387f79.data.author.avatar;
    let _0x232ddf = _0x387f79.data.author.nickname;
    let _0x590188 = _0x387f79.data.author.unique_id;
    let _0x56485d = _0x387f79.data.comment_count.toLocaleString();
    let _0x1b030e = "https://www.tikwm.com" + _0x387f79.data.cover;
    let _0x38df6f = _0x387f79.data.play_count.toLocaleString();
    let _0x764898 = _0x387f79.data.digg_count.toLocaleString();
    let _0x25ee30 = _0x387f79.data.collect_count.toLocaleString();
    let _0x44a7e4 = _0x387f79.data.create_time;
    let _0x1c0e80 = new Date(_0x44a7e4 * 1000);
    let _0x5b215a = _0x1c0e80.toLocaleDateString();
    let _0x4da2f7 = _0x5b215a.trim();
    let _0x3a8f9b = "https://www.tikwm.com" + _0x387f79.data.play;
    let _0x49282f = "https://www.tikwm.com" + _0x387f79.data.wmplay;
    let _0x52b0e6 = "https://www.tikwm.com" + _0x387f79.data.hdplay;
    let _0x27bc0d = _0x387f79.data.music_info.play;
    return {
      'region': _0x51677e,
      'title': _0x5cc5a7,
      'avatar': _0x51973a,
      'author': _0x232ddf,
      'username': _0x590188,
      'comment': _0x56485d,
      'views': _0x38df6f,
      'cover': _0x1b030e,
      'like': _0x764898,
      'bookmark': _0x25ee30,
      'published': _0x4da2f7,
      'video': _0x3a8f9b,
      'video_wm': _0x49282f,
      'video_hd': _0x52b0e6,
      'music': _0x27bc0d,
      'duration': ''
    };
  } catch (_0x411730) {
    throw "something gone wrong";
  }
}-e 


==================================================
Downloads/tiktok4.js
==================================================
// ./Gab-arqv/LB-APIS/Downloads/tiktok.js
const axios = require("axios")
const cheerio = require("cheerio")
const qs = require("qs")

async function tiktokDownloader(videoUrl) {
if (!videoUrl) throw new Error("TikTok URL is required")

const body = qs.stringify({
id: videoUrl,
locale: "en",
tt: "dHl6Ylg4"
})

const res = await axios.post("https://ssstik.io/abc?url=dl", body, {
headers: {
accept: "*/*",
"content-type": "application/x-www-form-urlencoded",
"user-agent": "Mozilla/5.0",
referer: "https://ssstik.io/en-1",
"hx-request": "true",
"hx-target": "target",
"hx-trigger": "_gcaptcha_pt"
}
})

const html = res.data
const $ = cheerio.load(html)

const title = $("#avatar_and_text h2").text().trim() || $("#avatarAndTextUsual h2").text().trim() || null
const thumbnail = $(".result_author").attr("src") || $("#mainpicture").css("background-image") || null
const downloads = []

$("a.download_link:not(.slide)").each((_, el) => {
const text = $(el).text().replace(/\s+/g, " ").trim()
const url = $(el).attr("href")
if (!url || url === "#") return
downloads.push({ text, url })
})

$("a.download_link.slide").each((_, el) => {
const url = $(el).attr("href")
if (!url || url === "#") return
downloads.push({ url })
})

return { status: true, title, thumbnail, downloads }
}

module.exports = { tiktokDownloader }-e 


==================================================
Downloads/tkkscdl.js
==================================================
const fetch = require('node-fetch');

async function tiktokSearch(query) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch("https://tikwm.com/api/feed/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Cookie: "current_language=en",
          "User-Agent":
            "Mozilla/5.0 (Linux Android 10 K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
        },
        body: new URLSearchParams({
          keywords: query,
          count: 10,
          cursor: 0,
          HD: 1,
        }),
      }).then((v) => v.json());
      const videos = response.data.videos;
      if (videos.length === 0) {
        reject("Tidak ada video ditemukan.");
      } else {
        const dann = Math.floor(Math.random() * videos.length);
        const video = videos.map((v) => {
          return {
            title: v.title,
            cover: v.cover,
            origin_cover: v.origin_cover,
            link: `https://www.tiktok.com/@${v.author.unique_id}/video/${v.video_id}`,
            no_watermark: v.play,
            watermark: v.wmplay,
            music: v.music_info,
            views: v.play_count,
            like: v.digg_count,
            comment: v.comment_count || null,
            share: v.share_count,
            download: v.download_count || null,
            save: v.collect_count || null,
            create_time: v.create_time * 1000,
          };
        });

        resolve(video);
      }
    } catch (error) {
      reject(error);
    }
  });
}

async function tiktokInfo(url) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch("https://tikwm.com/api/", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          Cookie: "current_language=en",
          "User-Agent":
            "Mozilla/5.0 (Linux Android 10 K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36",
        },
        body: new URLSearchParams({
          region: "id",
          url: url,
          count: 10,
          cursor: 0,
          HD: 1,
        }),
      }).then((v) => v.json());
      const video = response.data;
      if (video.length === 0) {
        reject("Tidak ada video ditemukan.");
      } else {
        const result = {
          title: video.title,
          cover: video.cover,
          origin_cover: video.origin_cover,
          link: `https://www.tiktok.com/@${video.author.unique_id}/video/${video.id}`,
          no_watermark: video.play,
          hd: video.hdplay || null,
          watermark: video.wmplay,
          music: video.music,
          no_wm_size: video.size,
          wm_size: video.wm_size,
          hd_size: video.hd_size || null,
          views: video.play_count,
          like: video.digg_count,
          comment: video.comment_count || null,
          share: video.share_count,
          download: video.download_count || null,
          save: video.collect_count,
          create_time: video.create_time * 1000,
        };
        resolve(result);
      }
    } catch (error) {
      reject(error);
    }
  });
}

async function tiktokUserPost(user) {
  return new Promise(async (resolve, reject) => {
    const result = [];
    const res = await fetch("https://www.tikwm.com/api/user/posts", {
      method: "POST",
      body: new URLSearchParams({
        unique_id: `@${user.replace(/@/gi, "")}`,
        hd: 1,
        cursor: 0,
      }),
    }).then((v) => v.json());
    const posts = res.data.videos;
    for (let {
      title,
      duration,
      play_count,
      origin_cover,
      create_time,
      digg_count,
      share_count,
      download_count,
      collect_count,
      comment_count,
      play,
      wmplay,
      music_info,
      video_id,
      author,
    } of posts) {
      result.push({
        title,
        duration,
        link: `https://www.tiktok.com/@${author.unique_id}/video/${video_id}`,
        origin_cover,
        views: play_count,
        like: digg_count,
        comment: comment_count,
        share: share_count,
        download: download_count,
        saved: collect_count || null,
        create_time,
        no_watermark: play,
        watermark: wmplay,
        music: music_info,
      });
    }

    await resolve(result);
  });
}

module.exports = { tiktokSearch, tiktokInfo, tiktokUserPost };-e 


==================================================
Downloads/twitterdl.js
==================================================
const cheerio = require("cheerio");
const axios = require("axios");
const qs = require("qs");

async function twitterdl(link) {
  try {
    const config = { URL: link };
    const { data } = await axios.post(
      "https://twdown.net/download.php",
      qs.stringify(config),
      {
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "sec-ch-ua":
            '" Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"',
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        },
      }
    );

    const $ = cheerio.load(data);
    const descrição = $('div:nth-child(1) > div:nth-child(2) > p').text().trim();
    const capa = $('div:nth-child(1) > img').attr('src');
    const HD = $('tbody > tr:nth-child(1) > td:nth-child(4) > a').attr('href');
    const SD = $('tr:nth-child(2) > td:nth-child(4) > a').attr('href');
    const audio = $('tr:nth-child(4) > td:nth-child(4) > a').attr('href');

    if (!descrição || !HD || !SD || !audio) {
      throw new Error("Erro ao extrair informações do site.");
    }

    return {
      descrição,
      capa: capa ? `https://twdown.net/${capa}` : null,
      HD,
      SD,
      audio: audio.startsWith("http") ? audio : `https://twdown.net/${audio}`,
    };
  } catch (error) {
    throw new Error(error.message || "Erro ao processar o download.");
  }
}


module.exports.twitterdl = twitterdl;-e 


==================================================
Downloads/twitterdl2.js
==================================================
const axios = require("axios")

const HEADERS = {
"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
"Referer": "https://platform.twitter.com/"
}

function parseTweetId(url) {
const m = url.match(/\/status\/(\d+)/)
return m ? m[1] : (/^\d+$/.test(url) ? url : null)
}

function parseMedia(details) {
if (!details?.length) return []
return details.map(m => {
if (m.type === "video" || m.type === "animated_gif") {
const variants = m.video_info?.variants || []
const best = variants.filter(v=>v.content_type==="video/mp4").sort((a,b)=>(b.bitrate||0)-(a.bitrate||0))[0]
return {
type: m.type==="animated_gif"?"gif":"video",
url: best?.url||"",
thumbnail: m.media_url_https+"?format=jpg&name=large",
width: m.original_info?.width||0,
height: m.original_info?.height||0,
variants: variants.filter(v=>v.url).map(v=>({ url:v.url, contentType:v.content_type, bitrate:v.bitrate||0 }))
}
}
return { type:"photo", url:m.media_url_https+"?format=jpg&name=orig", thumb:m.media_url_https+"?format=jpg&name=small", width:m.original_info?.width||0, height:m.original_info?.height||0 }
})
}

async function tweetInfo(url) {
const id = parseTweetId(url)
if (!id) throw new Error("URL/ID de Twitter inválido")
const res = await axios.get(`https://cdn.syndication.twimg.com/tweet-result?id=${id}&lang=en&features=tfw_timeline_list%3A%3Btfw_follower_count_sunset%3Atrue&token=abc123`, { headers: HEADERS, timeout:15000 })
const d = res.data
if (!d?.id_str) throw new Error("Tweet não encontrado ou privado")
const medias = parseMedia(d.mediaDetails)
return {
id: d.id_str,
text: d.text||"",
lang: d.lang||"",
createdAt: d.created_at||"",
likes: d.favorite_count||0,
replies: d.conversation_count||0,
author: { id:d.user?.id_str||"", name:d.user?.name||"", username:d.user?.screen_name||"", avatar:d.user?.profile_image_url_https?.replace("_normal","")||"", verified:d.user?.is_blue_verified||false },
hashtags: d.entities?.hashtags?.map(h=>h.text)||[],
mentions: d.entities?.user_mentions?.map(m=>m.screen_name)||[],
urls: d.entities?.urls?.map(u=>u.expanded_url)||[],
medias,
url: `https://x.com/${d.user?.screen_name}/status/${d.id_str}`
}
}

async function tweetDownload(url) {
const info = await tweetInfo(url)
const videos = info.medias.filter(m=>m.type==="video"||m.type==="gif")
const photos = info.medias.filter(m=>m.type==="photo")
if (!videos.length && !photos.length) throw new Error("Este tweet não tem mídia para baixar")
return { id: info.id, text: info.text, lang: info.lang, createdAt: info.createdAt, likes: info.likes, replies: info.replies, author: info.author, hashtags: info.hashtags, mentions: info.mentions, urls: info.urls, tweetUrl: info.url, videos, photos, hasVideo: videos.length>0, hasPhoto: photos.length>0 }
}

module.exports = { tweetInfo, tweetDownload }-e 


==================================================
Downloads/twitterdl3.js
==================================================
// ./Gab-arqv/LB-APIS/Downloads/twitter.js
const axios = require("axios")
const cheerio = require("cheerio")

async function twitterDownloader(tweetUrl) {
if (!tweetUrl) throw new Error("Tweet URL is required")

const endpoint = "https://savetwitter.net/api/ajaxSearch"

const form = new URLSearchParams({
q: tweetUrl,
lang: "en",
cftoken: "",
})

const { data } = await axios.post(endpoint, form.toString(), {
headers: {
"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
origin: "https://savetwitter.net",
referer: "https://savetwitter.net/en4",
"x-requested-with": "XMLHttpRequest",
"user-agent":
"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36",
},
timeout: 15000,
})

if (data.status !== "ok") throw new Error("Failed to fetch Twitter media")

const $ = cheerio.load(data.data)

const tweetId = $("#TwitterId").val() || null
const title = $(".tw-middle h3").first().text().trim() || null
const duration = $(".tw-middle p").first().text().trim() || null
const thumbnail =
$(".thumbnail img").attr("src") ||
$(".download-items__thumb img").attr("src") ||
null

const videos = []
const images = []

$(".tw-button-dl").each((_, el) => {
const href = $(el).attr("href")
const text = $(el).text()
if (!href || !href.includes("dl.snapcdn.app")) return
if (text.includes("MP4")) {
const qualityMatch = text.match(/\((\d+p)\)/)
videos.push({ quality: qualityMatch ? qualityMatch[1] : "unknown", url: href })
}
if (text.includes("图片")) images.push({ url: href })
})

$(".photo-list img").each((_, img) => {
const src = $(img).attr("src")
if (src) images.push({ url: src })
})

videos.sort((a, b) => {
const qa = parseInt(a.quality) || 0
const qb = parseInt(b.quality) || 0
return qb - qa
})

return { type: videos.length ? "video" : "photo", tweetId, title, duration, thumbnail, videos, images }
}

module.exports = { twitterDownloader }-e 


==================================================
Downloads/ytdl.js
==================================================
const axios = require("axios")
const qs = require("qs")

const headers = {
  "accept": "*/*",
  "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
  "x-requested-with": "XMLHttpRequest",
  "referer": "https://app.ytdown.to/id21/",
  "origin": "https://app.ytdown.to"
}

function normalizeQ(q = "") {
  q = q.toLowerCase()
  if (q.includes("1080") || q.includes("fhd")) return "1080"
  if (q.includes("720") || q.includes("hd")) return "720"
  if (q.includes("480")) return "480"
  if (q.includes("360") || q.includes("sd")) return "360"
  if (q.includes("240")) return "240"
  if (q.includes("144")) return "144"
  return ""
}

async function convert(url) {
  try {
    const { data } = await axios.post(
      "https://app.ytdown.to/proxy.php",
      qs.stringify({ url }),
      { headers, timeout: 20000 }
    )
    return data?.api?.status === "completed" ? data.api : null
  } catch {
    return null
  }
}

async function ytdown(url, quality = "720") {
  try {
    const { data } = await axios.post(
      "https://app.ytdown.to/proxy.php",
      qs.stringify({ url }),
      { headers, timeout: 20000 }
    )

    if (data?.api?.status !== "ok") return { status: false }

    const targetQ = normalizeQ(quality)
    const isAudioOnly = /mp3|audio/i.test(quality)

    let selectedVideo = null
    let fallbackVideo = null
    let bestAudio = null
    let fallbackAudio = null

    for (let item of data.api.mediaItems) {
      const res = await convert(item.mediaUrl)
      if (!res) continue

      const ext = res.fileName?.split(".").pop()?.toLowerCase()

      const obj = {
        quality: item.mediaQuality,
        url: res.fileUrl,
        size: res.fileSize,
        ext,
        mime: item.type === "Video" ? "video/" + ext : "audio/" + ext
      }

      if (item.type === "Video") {
        const qNum = normalizeQ(item.mediaQuality)
        if (qNum == targetQ && !selectedVideo) selectedVideo = obj
        if (!fallbackVideo || Number(qNum) > Number(normalizeQ(fallbackVideo.quality))) fallbackVideo = obj
      }

      if (item.type === "Audio") {
        if (ext === "mp3" && !bestAudio) bestAudio = obj
        if (!fallbackAudio) fallbackAudio = obj
      }
    }

    return {
      status: true,
      title: data.api.title,
      channel: data.api.userInfo?.name,
      thumbnail: data.api.imagePreviewUrl,
      duration: data.api.mediaItems?.[0]?.mediaDuration,
      video: isAudioOnly ? null : (selectedVideo || fallbackVideo),
      audio: bestAudio || fallbackAudio
    }
  } catch (e) {
    return { status: false, error: String(e) }
  }
}

module.exports = ytdown-e 


==================================================
Downloads/ytdl2.js
==================================================
const axios = require("axios")
const yts = require("yt-search")
const { createDecipheriv } = require('crypto')

function get_id(url) {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|v\/|embed\/|user\/[^\/\n\s]+\/)?(?:watch\?v=|v%3D|embed%2F|video%2F)?|youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtube\.com\/v\/|youtube\.com\/shorts\/|youtube\.com\/playlist\?list=)([a-zA-Z0-9_-]{11})/
    const match = url.match(regex)
    return match ? match[1] : null
}

const audio = [92, 128, 256, 320]
const video = [144, 360, 480, 720, 1080]

function decode(enc) {
    try {
        const secret_key = 'C5D58EF67A7584E4A29F6C35BBC4EB12'
        const data = Buffer.from(enc, 'base64')
        const iv = data.slice(0, 16)
        const content = data.slice(16)
        const key = Buffer.from(secret_key, 'hex')
        const decipher = createDecipheriv('aes-128-cbc', key, iv)
        let decrypted = Buffer.concat([decipher.update(content), decipher.final()])
        return JSON.parse(decrypted.toString())
    } catch (error) {
        throw new Error(error.message)
    }
}

async function savetube(link, quality, value) {
    try {
        const cdn = (await axios.get("https://media.savetube.vip/api/random-cdn")).data.cdn
        const infoget = (await axios.post(`https://${cdn}/v2/info`, { url: link }, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/133.0.0.0 Mobile Safari/537.36',
                'Referer': 'https://save-tube.com/'
            }
        })).data
        const info = decode(infoget.data)
        const qualities = value === "audio" ? audio : video
        const startIndex = qualities.indexOf(quality)
        const toTry = startIndex >= 0
            ? [...qualities.slice(startIndex).reverse(), ...qualities.slice(0, startIndex).reverse()]
            : [...qualities].reverse()
        for (const q of toTry) {
            const response = (await axios.post(`https://${cdn}/download`, {
                'downloadType': value,
                'quality': `${q}`,
                'key': info.key
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 Chrome/133.0.0.0 Mobile Safari/537.36',
                    'Referer': 'https://save-tube.com/'
                }
            })).data
            if (response?.data?.downloadUrl) {
                return {
                    status: true,
                    quality: `${q}${value === "audio" ? "kbps" : "p"}`,
                    url: response.data.downloadUrl,
                    filename: `${info.title} (${q}${value === "audio" ? "kbps).mp3" : "p).mp4"})`
                }
            }
        }
        return { status: false, message: "Nenhuma qualidade disponível" }
    } catch (error) {
        return { status: false, message: "Converting error" }
    }
}

async function ytmp3(link, formats = 128) {
    const id = get_id(link)
    const format = audio.includes(Number(formats)) ? Number(formats) : 128
    if (!id) return { status: false, message: "Link inválido!" }
    try {
        let url = `https://youtube.com/watch?v=${id}`
        let data = await yts(url)
        let response = await savetube(url, format, "audio")
        return { status: true, metadata: data.all[0], download: response }
    } catch { return { status: false, message: "Erro no sistema!" } }
}

async function ytmp4(link, formats = 360) {
    const id = get_id(link)
    const format = video.includes(Number(formats)) ? Number(formats) : 360
    if (!id) return { status: false, message: "Link inválido!" }
    try {
        let url = `https://youtube.com/watch?v=${id}`
        let data = await yts(url)
        let response = await savetube(url, format, "video")
        return { status: true, metadata: data.all[0], download: response }
    } catch { return { status: false, message: "Erro no sistema!" } }
}

async function search_teks(teks) {
    try {
        let data = await yts(teks)
        return { status: true, results: data.all }
    } catch (error) {
        return { status: false, message: error.message }
    }
}

module.exports = { ytmp3, ytmp4, search_teks }-e 


==================================================
Ias/bing.js
==================================================
const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeBing(query) {
    try {
        const url = `https://www.bing.com/search?q=${query}&setmkt=pt-BR&PC=EMMX01&form=LWS002&scope=web`;
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);
        const resultados = [];

        $("div > p").each(function () {
            const titulo = $(this).text();
            if (titulo.length > 10) {
                resultados.push(titulo.replace(new RegExp("Web", "gi"), ""));
            }
        });

        if (resultados.length === 0) return "Nenhum resultado encontrado.";
        return resultados.join('\n\n');
    } catch (error) {
        console.error('Erro ao buscar no Bing:', error);
        return "Erro, digite algo que queira pesquisar.";
    }
}

module.exports = { scrapeBing };-e 


==================================================
Ias/chatsandbox.js
==================================================
const axios = require('axios');

const setClass = new Object({
    model: "openai", 
    prompt: "Quem é você e o que você pode fazer?" 
});

class ChatSandBox {

    constructor(config = {}) {
		const { model, prompt } = Object.assign(setClass, config);
		this.prompt = prompt;
		this.model = model;
		this.validModels = ["openai", "llama", "mistral", "mistral-large"];
		this.baseURL = "https://chatsandbox.com/api/chat";
	}
	
	async start() {
	   if(!this.validModels.includes(this.model)) return Promise.reject("Modelo inválido!")
	   return new Promise((resolve, reject) => {
	     axios.request({
	        method: 'POST',
            url: this.baseURL,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Android 10; Mobile; rv:131.0) Gecko/131.0 Firefox/131.0',
                'Content-Type': 'application/json',
                'Accept-language': 'id-ID',
                'Referer': 'https://chatsandbox.com/chat/' + this.model,
                'Origin': 'https://chatsandbox.com',
                'Alt-Used': 'chatsandbox.com',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'same-origin',
                'Priority': 'u=0',
                'Te': 'trailers',
                'Cookie': '_ga_V22YK5WBFD=GS1.1.1734654982.3.0.1734654982.0.0.0; _ga=GA1.1.803874982.1734528677'
            },
            data: JSON.stringify({
                messages: [this.prompt],
                character: this.model
            })
	     }).then(async(response) => {
	        return resolve(response.data.replaceAll('**', ''));
	     }).catch((error) => {
	        return reject(error.message);
	     })
	   })
	}
	
}

module.exports = ChatSandBox;-e 


==================================================
Ias/hd.js
==================================================

const FormData = require("form-data");
const Jimp = require("jimp"); 

const setClass = new Object({
    operation: "", 
    media: "" 
});

class VyroEngine {   
    constructor(config = {}) {
      const { operation, media } = { ...setClass, ...config };
      this.operation = operation || "";
      this.media = media || "";
   }
   
  start(image = this.media, operation = this.operation) {
   let config = () => Promise.reject('Error.'); 
   if(!operation) return Promise.reject("Faltando definir a operação.");
   if(!image) return Promise.reject("Sem Mídia.")
   return new Promise(async(resolve, reject) => {
    const type = ["enhance", "recolor", "dehaze"];
      if (type.includes(operation)) {
        operation = operation;
      } else {
        operation = availableOperations[0];
      }
      const formData = new FormData();
        formData.append("image", Buffer.from(image), {
          filename: "enhance_image_body.jpg",
          contentType: "image/jpeg",
         });
        formData.append("model_version", 1, {
          "Content-Transfer-Encoding": "binary",
          "contentType": "multipart/form-data; charset=utf-8"
        });
        formData.submit({
           url: "https://inferenceengine.vyro.ai/" + operation + ".vyro",
           host: "inferenceengine.vyro.ai",
           path: "/" + operation,
           protocol: "https:",
           headers: {
              "User-Agent": "okhttp/4.9.3",
              "Connection": "Keep-Alive",
              "Accept-Encoding": "gzip",
           },
        }, function(err, res) {
            if (err) reject(err);
            const chunks = [];
            res.on("data", function(chunk) {
            chunks.push(chunk);
        });
            res.on("end", function() {
              resolve(Buffer.concat(chunks));
        });
            res.on("error", function(err) {
              reject(err);
        });
     });
   });
  }
   
}

module.exports = VyroEngine;-e 


==================================================
Ias/hd2.js
==================================================
async function jpghdScrape(imageUrl) {
  const fakeIP = Array.from({ length: 4 }, () =>
    Math.floor(Math.random() * 256)
  ).join('.')

  const baseHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Accept': 'application/json',
    'Origin': 'https://jpghd.com',
    'Referer': 'https://jpghd.com/id',
    'Cookie': 'jpghd_lng=id',
    'User-Agent': 'CT Android/1.1.0',
    'X-Forwarded-For': fakeIP,
    'X-Real-IP': fakeIP
  }

  const create = await fetch('https://jpghd.com/api/task/', {
    method: 'POST',
    headers: baseHeaders,
    body: `conf=${JSON.stringify({
      filename: imageUrl.split('/').pop(),
      livephoto: '',
      color: '',
      scratch: '',
      style: 'art',
      input: imageUrl
    })}`
  })

  const createJson = await create.json()
  if (createJson.status !== 'ok') return { status: false, message: 'Falha ao criar task' }

  const tid = createJson.tid

  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 2000))

    const check = await fetch(`https://jpghd.com/api/task/${tid}`, {
      headers: {
        'Accept': 'application/json',
        'Referer': 'https://jpghd.com/id',
        'Cookie': 'jpghd_lng=id',
        'User-Agent': 'CT Android/1.1.0',
        'X-Forwarded-For': fakeIP,
        'X-Real-IP': fakeIP
      }
    })

    const checkJson = await check.json()
    const data = checkJson[tid]

    if (data?.status === 'success') {
      return { status: true, result: data.output.jpghd, size: data.output.size }
    }
  }

  return { status: false, message: 'Timeout, tente novamente' }
}

module.exports = { jpghdScrape }-e 


==================================================
Ias/prodia.js
==================================================

const lbzinkey =  "rsnai_Pks30sJqtk1s1us3mN25hm1m"

const { RsnChat } = require('rsnchat')

const tipoMododelo = [ `*Escolha o modelo de acordo com o numero.*
  
- *1.* realidade_absoluta_V16
- *2.* realidade_absoluta_V181
- *3.* difusao_analogica_1.0
- *4.* podado_qualquer_coisa_v3_0
- *5.* podado_qualquer_coisa_v4.5
- *6.* qualquer_coisaV5_PrtRE
- *7.* AOM3A3_mistura_laranja
- *8.* moldador_sonhador_7
- *9.* moldador_sonhador_8
- *10.* difusao_animada_Eimis_V1
- *11.* mistura_vivida_elldreths
- *12.* mecanico_mixer_v10
- *13.* meinamix_meina_V9
- *14.* meinamix_meina_V11
- *15.* jornada_aberta_V4
- *16.* retrato_mais_V1.0
- *17.* visao_realista_V1.4_podado_fp16
- *18.* visao_realista_V2.0
- *19.* visao_realista_V4.0
- *20.* visao_realista_V5.0
- *21.* difusao_redshift_V10
- *22.* revAnimated_V122
- *23.* sdv1_4
- *24.* bela_mistura_de_shonins_V10
- *25.* a_mistura_aliada_ii_churned
- *26.* intemporal_1.0`
]

const modelos = {
  '1': "absolutereality_V16.safetensors [37db0fc3]",
  '2': "absolutereality_v181.safetensors [3d9d4d2b]",
  '3': "analog-diffusion-1.0.ckpt [9ca13f02]",
  '4': "anythingv3_0-pruned.ckpt [2700c435]",
  '5': "anything-v4.5-pruned.ckpt [65745d25]",
  '6': "anythingV5_PrtRE.safetensors [893e49b9]",
  '7': "AOM3A3_orangemixs.safetensors [9600da17]",
  '8': "dreamshaper_7.safetensors [5cf5ae06]",
  '9': "dreamshaper_8.safetensors [9d40847d]",
  '10': "EimisAnimeDiffusion_V1.ckpt [4f828a15]",
  '11': "elldreths-vivid-mix.safetensors [342d9d26]",
  '12': "lyriel_v16.safetensors [68fceea2]",
  '13': "mechamix_v10.safetensors [ee685731]",
  '14': "meinamix_meinaV9.safetensors [2ec66ab0]",
  '15': "meinamix_meinaV11.safetensors [b56ce717]",
  '16': "openjourney_V4.ckpt [ca2f377f]",
  '17': "portraitplus_V1.0.safetensors [1400e684]",
  '18': "Realistic_Vision_V1.4-pruned-fp16.safetensors [8d21810b]",
  '19': "Realistic_Vision_V2.0.safetensors [79587710]",
  '20': "Realistic_Vision_V4.0.safetensors [29a7afaa]",
  '21': "Realistic_Vision_V5.0.safetensors [614d1063]",
  '22': "redshift_diffusion-V10.safetensors [1400e684]",
  '23': "revAnimated_v122.safetensors [3f4fefd9]",
  '24': "sdv1_4.ckpt [7460a6fa]",
  '25': "shoninsBeautiful_v10.safetensors [25d8c546]",
  '26': "theallys-mix-ii-churned.safetensors [5d9225a4]",
  '27': "timeless-1.0.ckpt [7c4971d4]",
};

const fontesX = async (prompto, negativePrompto, numeroModelo) => {
const rsInstacia = new RsnChat(lbzinkey);
const nomeModelo = modelos[numeroModelo];

if (!nomeModelo) {
 throw new Error(`Modelo com o número "${numeroModelo}" não encontrado.`)}

try {
const resposta = await rsInstacia.prodia(prompto, negativePrompto, nomeModelo);
if (!resposta || !resposta.imageUrl) { console.error(`url da imagem não encontrada para o modelo número "${numeroModelo}".`) 
return null }
    
console.log(`URL da imagem modelo número "${numeroModelo}":`, resposta.imageUrl)

return resposta.imageUrl } catch (erro) { console.error(`erro ao analisar o modelo número ${numeroModelo}:`, erro)
throw erro }}


module.exports = { fontesX, tipoMododelo }-e 


==================================================
Pesquisas/dicion.js
==================================================
const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function buscarPriberam(palavra) {
  try {
    const url = `https://dicionario.priberam.org/${encodeURIComponent(palavra)}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Erro na requisição: ${response.statusText}`);
    const html = await response.text();
    const $ = cheerio.load(html);

    const significado = [];
    $('.def').each((i, el) => {
      significado.push($(el).text().trim());
    });

    const etimologia = $('.etim').text().trim();
    const sinonimos = $('.sinonimos span').map((i, el) => $(el).text().trim()).get().join(', ');
    const foto = $('.media img').attr('src') ? `https://dicionario.priberam.org${$('.media img').attr('src')}` : null;

    return {
      palavra,
      significado,
      etimologia,
      sinonimos,
      foto,
      fonte: url
    };
  } catch (error) {
    throw new Error(`Erro ao processar a palavra: ${error.message}`);
  }
}

module.exports = { buscarPriberam };-e 


==================================================
Pesquisas/gerarnick.js
==================================================
const axios = require('axios')
const cheerio = require('cheerio')
async function gerarnick(teks) {
    return new Promise((resolve, reject) => {
        axios.get('http://qaz.wtf/u/convert.cgi?text='+teks)
        .then(({ data }) => {
            let $ = cheerio.load(data)
            let hasil = []
            $('table > tbody > tr').each(function (a, b) {
                hasil.push({ name: $(b).find('td:nth-child(1) > span').text(), result: $(b).find('td:nth-child(2)').text().trim() })
            })
            resolve(hasil)
        })
    })
}

module.exports = gerarnick-e 


==================================================
Pesquisas/gethtml.js
==================================================
const axios = require('axios');
const cheerio = require('cheerio');

async function getHtml(url) {
    try {
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
            }
        });

        const $ = cheerio.load(data);

        // Extraindo várias informações
        const title = $('title').text() || 'Título não encontrado';
        const description = $('meta[name="description"]').attr('content') || 'Descrição não encontrada';
        const keywords = $('meta[name="keywords"]').attr('content') || 'Palavras-chave não encontradas';
        const headings = [];
        $('h1, h2, h3, h4, h5, h6').each((i, el) => {
            headings.push({ tag: el.tagName, text: $(el).text().trim() });
        });
        const links = [];
        $('a').each((i, el) => {
            links.push({ href: $(el).attr('href'), text: $(el).text().trim() });
        });
        const images = [];
        $('img').each((i, el) => {
            images.push({ src: $(el).attr('src'), alt: $(el).attr('alt') || 'Sem texto alternativo' });
        });

        return { title, description, keywords, headings, links, images };
    } catch (err) {
        throw new Error(`Erro ao buscar o HTML: ${err.message}`);
    }
}

module.exports = { getHtml };-e 


==================================================
Pesquisas/githubsc.js
==================================================
const fetch = require('node-fetch');

async function searchGithubRepositories(query) {
if (!query) throw new Error('Por favor, forneça um termo de pesquisa.');
const githubSearchUrl = `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc`;
try {
const response = await fetch(githubSearchUrl, {
headers: { 'Accept': 'application/vnd.github.v3+json' }
});
const data = await response.json();
const repositories = data.items.slice(0, 5);
if (repositories.length === 0) return 'Nenhum repositório encontrado.';
return repositories.map(repo => {
const name = repo.name;
const description = repo.description || 'Sem descrição';
const link = repo.html_url;
return `*${name}*\n${description}\n${link}`;
}).join('\n\n–\n\n');
} catch (error) {
console.error('Erro ao buscar resultados no GitHub:', error);
throw new Error('Ocorreu um erro ao buscar os resultados.');
}
}

module.exports = searchGithubRepositories;-e 


==================================================
Pesquisas/google.js
==================================================
const axios = require('axios');
const cheerio = require('cheerio');

const buscarGoogle = async (query) => {
    try {
        let url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
        let response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        if (!response) {
            throw new Error('Não foi possível acessar o Google para buscar resultados.');
        }
        
        let $ = cheerio.load(response.data);
        let resultados = [];

        $('.tF2Cxc').each((i, el) => {
            let titulo = $(el).find('h3').text().trim();
            let link = $(el).find('a').attr('href');
            let descricao = $(el).find('.VwiC3b').text().trim();
            if (titulo && link && descricao) {
                resultados.push({
                    titulo,
                    link,
                    descricao
                });
            }
        });

        return resultados.length > 0 ? resultados.slice(0, 5) : null;
    } catch (e) {
        throw new Error('Ocorreu um erro ao buscar resultados no Google.');
    }
};

module.exports = buscarGoogle;-e 


==================================================
Pesquisas/gpsc.js
==================================================
const axios = require('axios');
const cheerio = require('cheerio');

function gpsrc(nome) {
  return new Promise((resolve, reject) => {
    axios.get(`https://zaplinksbrasil.com.br/?s=${nome}`).then(tod => {
      const $ = cheerio.load(tod.data);
      let postagem = [];
      $("div.grupo").each((_, say) => {
        let titulo = $(say).find("a").attr('title') || "Sem título";
        let link = $(say).find("a").attr('href') || "Sem link";
        let img = $(say).find("img").attr('src') || null;
        let conteudo = $(say).find("div.listaCategoria").text().trim() || "Sem descrição";
        postagem.push({ titulo, img, conteudo, link });
      });
      resolve(postagem);
    }).catch(err => {
      console.error("Erro no scraping:", err);
      reject("Erro ao buscar dados.");
    });
  });
}

module.exports = gpsrc;-e 


==================================================
Pesquisas/jogo.js
==================================================
// LB
const axios = require('axios');

const getGameInfo = async (q) => {
  const MY_KEY = "34e936a681924c8cba8711d2dacb999e";
  try {
    const gamesearch = await axios.get(`https://api.rawg.io/api/games?key=${MY_KEY}&search=${encodeURIComponent(q)}&page_size=1`);
    let searchapi = gamesearch.data.results[0];
    if (!searchapi) return null;
    let gameInfo = {
      titulo: searchapi.name,
      gabgame: searchapi.genres.map(genre => genre.name).join(', '),
      plataforma: searchapi.platforms.map(platform => platform.platform.name).join(', '),
      compreaqui: searchapi.stores ? searchapi.stores.map(store => store.store.name).join(', ') : '',
      tempodejogatina: searchapi.playtime,
      datadelancamento: searchapi.released,
      avaliacaodojogo: searchapi.rating,
      rating_top: searchapi.rating_top,
      esrb: searchapi.esrb_rating ? searchapi.esrb_rating.name : '',
      background_image: searchapi.background_image
    };
    return gameInfo;
  } catch (e) {
    console.error(e);
    return null;
  }
};

module.exports = { getGameInfo };-e 


==================================================
Pesquisas/jovempan.js
==================================================
const axios = require('axios');
const cheerio = require('cheerio');

const jovempanScraper = async () => {
    try {
        const { data } = await axios.get('https://jovempan.com.br/');
        const $ = cheerio.load(data);
        const dados = [];
        const unescapeHtml = (text) => typeof text === 'string' ? text
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .replace(/&gt;/g, '>')
            .replace(/&#39;/g, "'")
            .replace(/lt;/g, '<')
            .replace(/&#8216;/g, '‘')
            .replace(/&#8217;/g, '’')
            .trim() : undefined;

        $('div.featured-news').each((i, e) => {
            dados.push({
                noticia: unescapeHtml($(e).find('p.title').text()?.trim()),
                imagem: $(e).find('img').attr('src'),
                link: $(e).find('a').attr('href')
            });
        });

        $('div.news-small').each((i, e) => {
            if ($(e).find('a').attr('href')) {
                dados.push({
                    noticia: unescapeHtml($(e).find('p.title').text() || $(e).find('p.title-edicase').text()),
                    imagem: $(e).find('img').attr('src'),
                    categoria: $(e).find('h6.category').text()?.trim() || $(e).find('h6.category-edicase').text()?.trim(),
                    link: $(e).find('a').attr('href')
                });
            }
        });

        $('a.item').each((i, e) => {
            dados.push({
                noticia: unescapeHtml($(e).find('p.title').text()?.trim()),
                imagem: $(e).find('img').attr('src'),
                categoria: $(e).find('h6.category').text()?.trim(),
                link: $(e).attr('href')
            });
        });

        return dados;
    } catch (error) {
        console.error('Erro ao buscar notícias:', error);
        throw new Error('Não foi possível buscar as notícias da Jovem Pan.');
    }
};

module.exports = { jovempanScraper };-e 


==================================================
Pesquisas/lyrics.js
==================================================
const request = require('request');
const cheerio = require('cheerio');

class ScrapperLyrics {

    static getHTML(url, config = {}) {
       return new Promise((resolve, reject) => {
          request({
            url,
            ...config
          }, (error, res, body) => {
            if (error) return reject(error);
            try {
               body = JSON.parse(body);
            } catch { }
			resolve(body);
	      });
       });
   };
   
   static UserAgent() {
       const oos = [ 'Macintosh; Intel Mac OS X 10_15_5', 'Macintosh; Intel Mac OS X 10_11_6', 'Windows NT 10.0; Win64; x64', 'Windows NT 10.0; WOW64', 'Windows NT 10.0', 'Macintosh; Intel Mac OS X 10_15_7', 'Macintosh; Intel Mac OS X 10_6_6', 'Macintosh; Intel Mac OS X 10_9_5', 'Macintosh; Intel Mac OS X 10_10_5', 'Macintosh; Intel Mac OS X 10_7_5', 'Macintosh; Intel Mac OS X 10_11_3', 'Macintosh; Intel Mac OS X 10_10_3', 'Macintosh; Intel Mac OS X 10_6_8', 'Macintosh; Intel Mac OS X 10_10_2', 'Macintosh; Intel Mac OS X 10_10_3', 'Macintosh; Intel Mac OS X 10_11_5' ];
       return `Mozilla/5.0 (${oos[Math.floor(Math.random() * oos.length)]}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * 3) + 87}.0.${Math.floor(Math.random() * 190) + 4100}.${Math.floor(Math.random() * 50) + 140} Safari/537.36`;
   };
   
   static get(query) {
      return new Promise((resolve, reject) => {
        this.getHTML(`https://solr.sscdn.co/letras/m1/?q=${query}&wt=json&callback=LetrasSug`, {
          headers: {
            'User-Agent': this.UserAgent()
          }
        }).then(async(response) => {
            if (typeof response === 'string') {
               const start = response.indexOf('(');
               const end = response.lastIndexOf(')');
               if (start !== -1 && end !== -1 && start < end) {
                   const jsonString = response.slice(start + 1, end);
                   const jsonData = JSON.parse(jsonString);
                   const result = await Promise.all(jsonData.response.docs.map(async(doc) => {
                      const responseSong = await this.getHTML(`https://www.letras.mus.br/${doc.dns || ''}/${doc.url || doc.urlal || ''}/`, {});
                      const $ = cheerio.load(responseSong);
                      const imgSet = $('.thumbnail img').attr('srcset');
                      const img = imgSet ? imgSet.split(', ')[1].split(' ')[0] : null;
                      const lyrics = $('.lyric-original p').map((i, el) => $(el).html().replace(/<br\/?>/g, '\n')).get().join('\n\n');
                      return { 
                        ...doc, 
                        img,
                        url: `https://www.letras.mus.br/${doc.dns || ''}/${doc.url || doc.urlal || ''}`,
                        lyrics 
                      };
                   }));
                   if (result.length === 0) return reject('Nenhum resultado encontrado.');
                   return resolve(result);
               }
            }
        }).catch((error) => reject(error.message));
     });
  }
  
}

module.exports = ScrapperLyrics;-e 


==================================================
Pesquisas/model.js
==================================================
const axios = require('axios')
const cheerio = require('cheerio')

async function Model(modelo) {
try {
const searchUrl = `https://www.stockrom.net/?s=${encodeURIComponent(modelo)}`
const { data: searchHtml } = await axios.get(searchUrl, {
headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }
})
const $search = cheerio.load(searchHtml)
const firstResultLink = $search('.post-title a').first().attr('href')
if (!firstResultLink) return { erro: 'Nenhum resultado encontrado para este modelo.' }

const { data: postHtml } = await axios.get(firstResultLink)
const $ = cheerio.load(postHtml)

const infoExtraida = {
model: '',
nome: $('.post-title').text().trim() || 'Não encontrado',
regiao: '',
idioma: '',
os: '',
operadora: '',
ap: '',
csc: '',
modem: '',
productCode: '',
referencias: '',
build: '',
securityPatch: '',
tamanho: '',
imagem: $('.entry-content img').first().attr('src') || 'Imagem não encontrada',
linksDownload: []
}

// Mapeia as linhas da tabela para os campos padronizados
$('table tr').each((i, el) => {
const cols = $(el).find('td')
if(cols.length < 2) return
const chave = $(cols[0]).text().trim().toLowerCase()
const valor = $(cols[1]).text().trim()
if(!valor) return

if(chave.includes('model') || chave.includes('dispositivo') || chave.includes('device')) infoExtraida.model = valor
else if(chave.includes('região') || chave.includes('region') || chave.includes('país') || chave.includes('country')) infoExtraida.regiao = valor
else if(chave.includes('idioma') || chave.includes('language')) infoExtraida.idioma = valor
else if(chave.includes('os version') || chave.includes('versão') || chave.includes('android')) infoExtraida.os = valor
else if(chave.includes('operadora') || chave.includes('operator') || chave.includes('carrier')) infoExtraida.operadora = valor
else if(chave.includes('ap') || chave.includes('pda')) infoExtraida.ap = valor
else if(chave.includes('csc')) infoExtraida.csc = valor
else if(chave.includes('modem') || chave.includes('banda de base') || chave.includes('cp version')) infoExtraida.modem = valor
else if(chave.includes('product code') || chave.includes('código do produto')) infoExtraida.productCode = valor
else if(chave.includes('referências') || chave.includes('references')) infoExtraida.referencias = valor
else if(chave.includes('build') || chave.includes('release date') || chave.includes('lançamento')) infoExtraida.build = valor
else if(chave.includes('security patch') || chave.includes('segurança')) infoExtraida.securityPatch = valor
else if(chave.includes('tamanho') || chave.includes('size')) infoExtraida.tamanho = valor
})

// Extrai links de download
$('.entry-content a').each((i, el) => {
const href = $(el).attr('href')
const texto = $(el).text().trim()
if(!href) return
if(href.includes('drive.google') || href.includes('mediafire') || href.includes('mega.nz') || href.includes('androidfilehost') || texto.toLowerCase().includes('download')) {
infoExtraida.linksDownload.push({ servidor: texto || 'Link de Download', url: href })
}
})

return infoExtraida
} catch(e) {
return { erro: 'Erro ao processar a busca: ' + e.message }
}
}

module.exports = { Model }-e 


==================================================
Pesquisas/ngl.js
==================================================
const axios = require('axios')

function delay(ms) {
return new Promise(resolve => setTimeout(resolve, ms))
}

function randomDelay(min = 800, max = 1800) {
return Math.floor(Math.random() * (max - min + 1)) + min
}

function generateDeviceId() {
return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
const r = Math.floor(Math.random() * 16)
const v = c === 'x' ? r : (r & 0x3 | 0x8)
return v.toString(16)
})
}

function extractUsername(url) {
const match = url.match(/ngl\.link\/([^\/\s]+)/)
return match ? match[1] : null
}

async function sendNgl({ url, messages, count }) {
const username = extractUsername(url)
if (!username) return { ok: false, error: 'URL inválida' }

let log = []
let success = 0

for (let i = 0; i < count; i++) {
try {
const msg = Array.isArray(messages)
? messages[i] || messages[0]
: messages

const payload = {
username,
question: msg,
deviceId: generateDeviceId(),
gameSlug: ''
}

const headers = {
'User-Agent': 'Mozilla/5.0',
'Origin': 'https://ngl.link',
'Referer': url,
'Content-Type': 'application/json'
}

await axios.post('https://ngl.link/api/submit', payload, { headers })

success++

log.push(`[SUCESSO ${success}]`)
log.push(`Mensagem: ${msg}`)
log.push(`By: LB-BOT`)
log.push('-------------------------')

} catch (e) {
log.push(`[ERRO ${i + 1}] ${e.message}`)
}

await delay(randomDelay())
}

log.push('')
log.push('==== RESUMO ====')
log.push(`Mensagens enviadas: ${success}/${count}`)
log.push('By: LB-BOT')

return {
ok: true,
log: log.join('\n'),
success,
count
}
}

module.exports = { sendNgl }-e 


==================================================
Pesquisas/pensador.js
==================================================
// pensador.js
const axios = require('axios');
const cheerio = require('cheerio');

async function pensador(nome) {
  return new Promise((resolve, reject) => {
    axios.get(`https://www.pensador.com/busca.php?q=${nome}`).then(tod => {
      const $ = cheerio.load(tod.data);
      let postagem = [];
      $("div.thought-card.mb-20").each((_, say) => {
        let frase = $(say).find("p").text().trim();
        let compartilhamentos = $(say).find("div.total-shares").text().trim();
        let autor = $(say).find("a").text().split("\n")[0];
        let imagem = $(say).find("div.sg-social-hidden.sg-social").attr('data-media');
        let resultado = {
          image: imagem,
          frase: frase,
          compartilhamentos: compartilhamentos
        };
        postagem.push(resultado);
      });
      resolve(postagem);
    }).catch(reject);
  });
}

module.exports = pensador; -e 


==================================================
Pesquisas/phone.js
==================================================
const axios = require('axios')
const cheerio = require('cheerio')
const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }

async function Phone(nomeAparelho) {
try {
const searchUrl = `https://www.gsmarena.com/results.php3?sQuickSearch=yes&sName=${encodeURIComponent(nomeAparelho)}`
const { data: searchHtml } = await axios.get(searchUrl, { headers })
const $search = cheerio.load(searchHtml)
const firstLink = $search('.makers ul li a').attr('href')
if(!firstLink) return { erro: 'Nenhum aparelho encontrado' }
const urlFinal = `https://www.gsmarena.com/${firstLink}`
const { data: postHtml } = await axios.get(urlFinal, { headers })
const $ = cheerio.load(postHtml)
let nomeFull = $('.specs-phone-name-title').text().trim() || 'Não encontrado'
let nomeLimpo = nomeFull.split(' SM-')[0].split(' /')[0].trim()
let phoneData = {
nome: nomeLimpo,
imagem: $('.specs-photo-main img').attr('src') || 'Imagem não encontrada',
processador: '',
especificacoes: {}
}
$('table').each((i, table) => {
const section = $(table).find('th').text().trim() || `Geral_${i}`
phoneData.especificacoes[section] = {}
$(table).find('tr').each((j, row) => {
const key = $(row).find('.ttl').text().trim()
const value = $(row).find('.nfo').text().trim().replace(/\n/g, ' ')
if(key) {
phoneData.especificacoes[section][key] = value
if(key.toLowerCase() === 'chipset') phoneData.processador = value
}
})
})
return phoneData
} catch(e) {
return { erro: 'Erro ao processar a busca: ' + e.message }
}
}

module.exports = { Phone }-e 


==================================================
Pesquisas/pinterest.js
==================================================
const axios = require('axios')
const cheerio = require('cheerio')
const HEADERS = {
 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G975F) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
 'Accept-Language': 'en-US,en;q=0.9'
}
function toOriginal(src) {
 return src.replace(/\/\d+x\//, '/originals/').replace(/\/\d+x\d+\//, '/originals/')
}
function isValidPin(src) {
 return src.includes('i.pinimg.com') && /\.(jpg|jpeg|png|webp)/.test(src) && !src.includes('/60x60/') && !src.includes('/videos/thumbnails/')
}
function extractFromHtml(html) {
 const $ = cheerio.load(html)
 const pinIds = []
 const seenIds = new Set()
 $('a[href*="/pin/"]').each((_, el) => {
  const m = ($(el).attr('href') || '').match(/\/pin\/(\d+)/)
  if (m && !seenIds.has(m[1])) { seenIds.add(m[1]); pinIds.push(m[1]) }
 })
 const imgList = []
 const seenImgs = new Set()
 $('img').each((_, el) => {
  const src = $(el).attr('src') || ''
  const srcset = $(el).attr('srcset') || ''
  const sources = [src, ...srcset.split(',').map(s => s.trim().split(' ')[0])]
  for (const s of sources) {
   if (!isValidPin(s)) continue
   const high = toOriginal(s)
   if (!seenImgs.has(high)) { seenImgs.add(high); imgList.push(high) }
  }
 })
 return { pinIds, imgList }
}
async function pinsearch(query, limit = 5) {
 const res = await axios.get(`https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`, { headers: HEADERS, timeout: 15000 })
 const { pinIds, imgList } = extractFromHtml(res.data)
 if (!imgList.length) throw new Error('Sem resultados no Pinterest')
 return imgList.slice(0, limit).map((img, i) => ({ index: i + 1, image: img, url: pinIds[i] ? `https://www.pinterest.com/pin/${pinIds[i]}/` : '', pinId: pinIds[i] || null }))
}
async function pinimg(url, limit = 5) {
 let resolvedUrl = url
 if (url.includes('pin.it/')) {
  const r = await axios.get(url, { headers: HEADERS, maxRedirects: 5, timeout: 10000 })
  resolvedUrl = r.request?.res?.responseUrl || r.config?.url || url
 }
 const res = await axios.get(resolvedUrl, { headers: HEADERS, timeout: 15000 })
 const { pinIds, imgList } = extractFromHtml(res.data)
 if (!imgList.length) throw new Error('Sem vídeos/imagens neste pin')
 return imgList.slice(0, limit).map((img, i) => ({ index: i + 1, image: img, url: resolvedUrl, pinId: pinIds[i] || null }))
}
module.exports = { pinsearch, pinimg }-e 


==================================================
Pesquisas/playstore.js
==================================================
const axios = require('axios');
const cheerio = require('cheerio');

async function PlayStoreSearch(query) {
  return new Promise((resolve, reject) => {
    axios.get(`https://play.google.com/store/search?q=${encodeURIComponent(query)}&c=apps`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    })
    .then((res) => {
      const $ = cheerio.load(res.data);
      const dados = [];
      $('.VfPpkd-aGsRMb').each((i, e) => {
        const nome = $(e).find('.DdYX5:first').text().trim();
        const imagem = $(e).find('img:first').attr('src') || $(e).find('img:last').attr('src');
        const desenvolvedor = $(e).find('.wMUdtb:first').text().trim();
        const estrelas = $(e).find('.w2kbF:first').text().trim();
        const link = 'https://play.google.com' + $(e).find('a:first').attr('href');

        if (nome) {
          dados.push({ nome, imagem, desenvolvedor, estrelas, link });
        }
      });
      resolve(dados);
    })
    .catch((e) => {
      reject(e);
    });
  });
}

module.exports = PlayStoreSearch;-e 


==================================================
Pesquisas/poder360.js
==================================================
const axios = require('axios');
const cheerio = require('cheerio');

const Poder360 = async () => {
    const useragent_1 = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' };
    const response = await axios.get('https://www.poder360.com.br/', { headers: useragent_1 });
    const $ = cheerio.load(response.data);
    const dados = [];
    $('.box-news-list__news').each((i, e) => {
        if(i < 4){
            dados.push({
                noticia: $(e).find('h2 > a').text().trim(),
                link: $(e).find('h2 > a').attr('href')
            });
        }
    });
    return dados;
};

module.exports = { Poder360 };-e 


==================================================
Pesquisas/receitas.js
==================================================
const BASE_URL = 'https://cybercook.com.br';
const cheerio = require('cheerio');
const request = require('request');

function userAgent() {
	oos = [ 'Macintosh; Intel Mac OS X 10_15_7', 'Macintosh; Intel Mac OS X 10_15_5', 'Macintosh; Intel Mac OS X 10_11_6', 'Macintosh; Intel Mac OS X 10_6_6', 'Macintosh; Intel Mac OS X 10_9_5', 'Macintosh; Intel Mac OS X 10_10_5', 'Macintosh; Intel Mac OS X 10_7_5', 'Macintosh; Intel Mac OS X 10_11_3', 'Macintosh; Intel Mac OS X 10_10_3', 'Macintosh; Intel Mac OS X 10_6_8', 'Macintosh; Intel Mac OS X 10_10_2', 'Macintosh; Intel Mac OS X 10_10_3', 'Macintosh; Intel Mac OS X 10_11_5', 'Windows NT 10.0; Win64; x64', 'Windows NT 10.0; WOW64', 'Windows NT 10.0' ];

	return `Mozilla/5.0 (${oos[Math.floor(Math.random() * oos.length)]}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${Math.floor(Math.random() * 3) + 87}.0.${Math.floor(Math.random() * 190) + 4100}.${Math.floor(Math.random() * 50) + 140} Safari/537.36`;
}

class ScrapperData {

static getHTML(url, config = {}) {
	return new Promise((resolve, reject) => {	  
	     request({
			url,
			...config
		}, (error, res, body) => {
			if (error) return reject(error);
			try {
				body = JSON.parse(body);
			} catch { }
				
			resolve(body);
		});
	});
}

static cyberInfo(url) {
	const user = userAgent()
	return this.getHTML(url, {
		method: 'GET',
		headers: {
			'User-Agent': user,
			Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
			'Accept-Language': "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
		}
	}).then(html => {
		const $ = cheerio.load(html)
		const parse = JSON.parse($('script[type="application/json"]').text())
		const { props: { pageProps } } = JSON.parse(JSON.stringify(parse, '', '\t'))
		return Promise.resolve(pageProps);
	})
}

static cyberSearch(query) {
	query = encodeURIComponent(query)
	const user = userAgent()
	return this.getHTML(BASE_URL+"/search?q="+query+"&is_premium=true&calorias=0&custo=0&prep=0", {
		method: 'GET',
		headers: {
			'User-Agent': user,
			Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
			'Accept-Language': "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7"
		}
	}).then(html => {
		const cache = new Array()
		const $ = cheerio.load(html)
		$('.pos-relative.border-card-half-2.grid-sm-12.font-serif.grid-lg-4.mb5').each((i, elem) => {
			const title = $(elem).find('.black > a > .card--half-2-image__image > .grid-lg-12').attr('title')
			const star = Number($(elem).find('.box-description-score > .score-yellow-box-group > .score-yellow-box-item').text())
			const by = $(elem).find('.grey--dark').text().trim().replace('Por ', '')
			const image = 'https:'+$(elem).find('.black > a > .card--half-2-image__image > .grid-lg-12').attr('src')
			const url = BASE_URL+$(elem).find('.black > a').attr('href')
			cache.push({
				title, by, assessment: {
					star,
					starEmoji: (star ? '⭐'.repeat(star) : '🫠')
				},
				url, image,
				get: () => this.cyberInfo(url)
			});
		})
		if (!cache.length) return Promise.reject("Não foi encontrado nenhuma receita.");
		
		return Promise.resolve(cache);
	})
}

}

module.exports = new Object({
  	 credits: 'Crap © Ethern | bit.ly/GroupEthern_',
     searchReceitas: (query) => ScrapperData.cyberSearch(query),
     infoReceita: (url) => ScrapperData.cyberInfo(url)
})-e 


==================================================
Pesquisas/signo.js
==================================================
const axios = require('axios').default
const cheerio = require('cheerio').default

const signodulb = (signo) => {
return new Promise((resolve, reject) => { 
        axios(`https://www.somostodosum.com.br/horoscopo/signo/${signo}.html`)
        .then(async ({data}) => {
            var $ = cheerio.load(data)
            var profissional = $('.all-browsers > br')[0].prev.data
            var pessoal = $('.all-browsers > br')[2].prev.data
            var saude = $('.all-browsers > br')[4].prev.data
            var total = profissional+'\n'+pessoal+'\n'+saude
            var horosdata = $('center > h2').text()
            var thumb = $('center > img')[0].attribs.src
            var fail = {body: 'Falha!'}
            if(!profissional) reject(fail)
            if(!pessoal) reject(fail)
            if(!saude) reject(fail)
            if(!total) reject(fail)
            if(!horosdata) reject(fail)
            if(!thumb) reject(fail)
            var json = {
                imagem: 'https://www.somostodosum.com.br/horoscopo' + thumb.slice(2),
                título: horosdata,
                inform: total
            }
            resolve(json)
        })
    })
}

module.exports = {signodulb}-e 


==================================================
Pesquisas/soundcloud.js
==================================================
// soundcloud.js
const puppeteer = require('puppeteer-core')
const path = require('path')

const TOKENS = [
    "2Uc3Wf3lPhKUycob642c4ce094bee05ec258f39ddb8819171",
    "2UcR17zBrPq3E4Sbf3693486a1a90b8f24469c886c755a0a0",
    "2UcR5WpJttRlB41726d9318de6477130b08d7613ff4ae4fa5",
    "2UcR7gAuh8SCEHQc94f835414c38e59bd0bf5a64329f02c12",
    "2UcRAKts9vnx0xed2e8bcd46984d2c5c6a3d7e2a5ae6fd599",
    "2UcR9HmxnkhX7lDe347a98fe459c9ab6d0af6901641d51af8"
];

const TOKEN = TOKENS[Math.floor(Math.random() * TOKENS.length)];

async function scrapeSoundCloud(query) {
    const browser = await puppeteer.connect({
        browserWSEndpoint: `wss://production-sfo.browserless.io?token=${TOKEN}`,
    })

    try {
        const page = await browser.newPage()
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36')
        await page.setViewport({ width: 1280, height: 1024 })

        await page.goto('https://www.searchsoundcloud.com/', { waitUntil: 'networkidle2', timeout: 60000 })

        await page.waitForSelector('input', { timeout: 15000 })
        await page.type('input', query, { delay: 80 })
        await page.keyboard.press('Enter')

        await page.waitForSelector('.track', { timeout: 20000 }).catch(() => {})

        const results = await page.evaluate(() => {
            const items = Array.from(document.querySelectorAll('.track'))
            return items.map((el, i) => {
                const titleEl = el.querySelector('.ivu-card-head p')
                const linkEl = el.querySelector('.ivu-card-head a[href]')
                const genreEl = el.querySelector('.track__genre')
                const dateCols = el.querySelectorAll('.ivu-card-head .ivu-col')
                const dateEl = dateCols[dateCols.length - 1]
                const imgEl = el.querySelector('.track_artwork')
                const durationEl = el.querySelector('.track__duration')
                const stats = el.querySelectorAll('.track__stats .stat')

                const getStat = (idx) => stats[idx] ? stats[idx].innerText.trim() : '0'

                return {
                    index: i + 1,
                    title: titleEl ? titleEl.innerText.trim() : 'N/A',
                    url: linkEl ? linkEl.getAttribute('href') : null,
                    genre: genreEl ? genreEl.innerText.trim() : null,
                    date: dateEl ? dateEl.innerText.trim() : null,
                    artwork: imgEl ? imgEl.src : null,
                    duration: durationEl ? durationEl.innerText.replace(/[()]/g, '').trim() : null,
                    likes: getStat(0),
                    reposts: getStat(1),
                    downloads: getStat(2),
                    plays: getStat(3),
                    comments: getStat(4)
                }
            })
        })

        return results

    } catch (error) {
        console.error('Erro durante o scraping:', error.message)
        return []
    } finally {
        await browser.close()
    }
}

module.exports = { scrapeSoundCloud }-e 


==================================================
Pesquisas/spotifysc.js
==================================================
const Spotify = require('spotify-finder');
const SpotifyDL = require('spotifydl-core').default;

const searchClient = new Spotify({
  consumer: {
    key: '271f6e790fb943cdb34679a4adcc34cc',
    secret: 'c009525564304209b7d8b705c28fd294',
  },
});

const downloadClient = new SpotifyDL({
  clientId: 'acc6302297e040aeb6e4ac1fbdfd62c3',
  clientSecret: '0e8439a1280a43aba9a5bc0a16f3f009',
});

async function gayvaisefuder1(query) {
  try {
    const data = await searchClient.search({
      q: query,
      type: 'track',
      limit: 1,
    });

    const track = data.tracks.items[0];
    const artists = track.artists.map((artist) => ({
      name: artist.name,
      url: artist.external_urls.spotify,
    }));
    return {
      name: track.name,
      album: track.album.name,
      artist: artists,
      release_date: track.album.release_date,
      popularity: track.popularity,
      track: track.external_urls.spotify,
      thumbnail: track.album.images[0].url,
    };
  } catch (error) {
    console.error("Erro ao buscar informações no Spotify:", error);
    return null;
  }
}

async function gayvaisefuder2(url) {
  try {
    const trackInfo = await downloadClient.getTrack(url);
    const audioBuffer = await downloadClient.downloadTrack(url);
    return {
      link: audioBuffer.toString('base64'),
      metadata: {
        title: trackInfo.name,
        artists: trackInfo.artists.map((artist) => artist.name).join(', '),
      },
    };
  } catch (error) {
    console.error("Erro ao baixar a música do Spotify:", error);
    return null;
  }
}


module.exports = {
  gayvaisefuder1,
  gayvaisefuder2,
};-e 


==================================================
Pesquisas/sticker.js
==================================================
const axios = require('axios')
const cheerio = require('cheerio')

async function stickerSearch(text, limit = 10) {
    try {
        const { data } = await axios.get(
            `https://getstickerpack.com/stickers?query=${encodeURIComponent(text)}`
        )

        const $ = cheerio.load(data)
        const packs = $('.sticker-pack-block')

        if (!packs.length) {
            return { status: false, message: 'Nenhum resultado encontrado' }
        }

        const selectedIndex = Math.floor(Math.random() * packs.length)
        const selected = $(packs[selectedIndex])

        const title = selected.find('.title').text().trim()
        const creator = selected.find('.username').text().trim()
        const link = selected.closest('a').attr('href')

        const packPage = await axios.get(link)
        const $$ = cheerio.load(packPage.data)

        const images = $$('.sticker-pack-cols img')

        const media = []
        images.each((i, el) => {
            if (i < limit) {
                const src = $$(el).attr('src')
                if (src) media.push(src)
            }
        })

        return {
            status: true,
            title,
            creator,
            total: images.length,
            media,
            url: link
        }

    } catch (e) {
        return {
            status: false,
            message: e.message
        }
    }
}

module.exports = { stickerSearch }-e 


==================================================
Pesquisas/techbusca.js
==================================================
const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeTechBusca(query) {
    const url = `https://www.techtudo.com.br/busca/?q=${encodeURIComponent(query)}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);   
    const articles = [];
    
    $('.widget--info').each((i, element) => {
        if (i >= 5) return;
        const title = $(element).find('.widget--info__title').text().trim();
        const summary = $(element).find('.widget--info__description').text().trim();
        const date = $(element).find('.widget--info__meta').text().trim();
        articles.push({ title, summary, date });
    });

    return articles;
}

module.exports = { scrapeTechBusca };-e 


==================================================
Pesquisas/techtudo.js
==================================================
const axios = require('axios');
const cheerio = require('cheerio');

const scrapeTechtudo = async () => {
    const response = await axios.get('https://www.techtudo.com.br/ultimas/');
    const $ = cheerio.load(response.data);          
    const articles = [];
    $('.feed-post').each((i, element) => {
        if(i >= 5) return;
        const title = $(element).find('.feed-post-body-title .feed-post-link').text().trim();
        const link = $(element).find('.feed-post-body-title .feed-post-link').attr('href');
        const summary = $(element).find('.feed-post-body-resumo').text().trim();   
        articles.push({ title, link, summary });
    });
    return articles;
};

module.exports = { scrapeTechtudo };-e 


==================================================
Pesquisas/terra.js
==================================================
const axios = require('axios');
const cheerio = require('cheerio');

const Terra = async () => {
    const useragent_2024 = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' };
    const response = await axios.get('https://www.terra.com.br/noticias/', { headers: useragent_2024 });
    const $ = cheerio.load(response.data);
    const dados = [];
    $('div.card.card-news.card-h-small.card-has-image').each((i, e) => {
        if(i < 10){
            dados.push({
                noticia: $(e).find('a.card-news__text--title').text().trim(),
                link: $(e).find('a.card-news__text--title').attr('href')
            });
        }
    });
    return dados;
};

module.exports = { Terra };-e 


==================================================
Pesquisas/wallpaper1.js
==================================================
const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeUnsplash(query) {
  try {
    const url = `https://unsplash.com/pt-br/s/fotografias/${query}`;
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    const results = [];

    $('img').each((index, element) => {
      const imageUrl = $(element).attr('src');
      if (imageUrl && imageUrl.startsWith('https://images.unsplash.com/')) {
        results.push(imageUrl);
      }
    });

    if (results.length > 0) {
      const randomIndex = Math.floor(Math.random() * results.length);
      const randomImageUrl = results[randomIndex];
      return { status: true, imageUrl: randomImageUrl };
    } else {
      return { status: false, message: `Nenhuma imagem encontrada para o termo "${query}".` };
    }
  } catch (error) {
    console.error('Erro ao buscar imagens no Unsplash:', error);
    return { status: false, message: 'Houve um erro ao tentar buscar as imagens.' };
  }
}

module.exports = { scrapeUnsplash };-e 


==================================================
Pesquisas/wikimedia.js
==================================================

const axios = require('axios');
const cheerio = require('cheerio');

async function wikimediaScraper(q) {
    return new Promise((resolve, reject) => {
        axios.get(`https://commons.wikimedia.org/w/index.php?search=${encodeURIComponent(q)}&title=Special:MediaSearch&go=Go&type=image`)
            .then((res) => {
                let $ = cheerio.load(res.data);
                let hasil = [];
                $('.sdms-search-results__list-wrapper > div > a').each(function (a, b) {
                    hasil.push({
                        titulo: $(b).find('img').attr('alt'),
                        source: $(b).attr('href'),
                        imagem: $(b).find('img').attr('data-src') || $(b).find('img').attr('src')
                    });
                });
                hasil.sort(() => Math.random() - 0.5);
                let limitedResult = hasil.slice(0, 5);
                resolve(limitedResult);
            })
            .catch(reject);
    });
}

module.exports = wikimediaScraper;-e 


==================================================
Pesquisas/xnxxsc.js
==================================================
const axios = require("axios");
const cheerio = require("cheerio");
const request = require('request');

function decodeHtmlEntities(text) {
  const htmlEntitiesMap = {
    '&period;': '.',
    '&quest;': '?',
    '&colon;': ':',
    '&comma;': ',',
    '&excl;': '!',
    '&apos;': '\'',
    '&quot;': '"',
    '&amp;': '&'
  };

  return text.replace(/&period;|&quest;|&colon;|&comma;|&excl;|&apos;|&quot;|&amp;/g, (match) => htmlEntitiesMap[match]);
}

// Função para formatar a data
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }) + ' ' + date.toLocaleTimeString('pt-BR');
}

// Função para formatar a duração
function formatDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = parseInt(match[1], 10) || 0;
  const minutes = parseInt(match[2], 10) || 0;
  const seconds = parseInt(match[3], 10) || 0;
  const totalMinutes = hours * 60 + minutes + seconds / 60;
  return totalMinutes.toFixed(2) + ' minutos';
}


async function XnxxSearch(query) {
  return new Promise((resolve, reject) => {
    const baseurl = 'https://www.xnxx.com';
    fetch(`${baseurl}/search/${query}/${Math.floor(Math.random() * 3) + 1}`, {method: 'get'}).then((res) => res.text()).then((res) => {
      const $ = cheerio.load(res, {xmlMode: false});
      const title = [];
      const url = [];
      const desc = [];
      const results = [];
      $('div.mozaique').each(function(a, b) {
        $(b).find('div.thumb').each(function(c, d) {
          url.push(baseurl + $(d).find('a').attr('href').replace('/THUMBNUM/', '/'));
        });
      });
      $('div.mozaique').each(function(a, b) {
        $(b).find('div.thumb-under').each(function(c, d) {
          desc.push($(d).find('p.metadata').text());
          $(d).find('a').each(function(e, f) {
            title.push($(f).attr('title'));
          });
        });
      });
      for (let i = 0; i < title.length; i++) {
        results.push({title: title[i], info: desc[i], link: url[i]});
      }
      resolve(results);
    }).catch((err) => reject({code: 503, status: false, result: err}));
  });
};

module.exports = { XnxxSearch };-e 


==================================================
Pesquisas/xvsc.js
==================================================
const axios = require("axios");
const cheerio = require("cheerio");
const request = require('request');

function decodeHtmlEntities(text) {
  const htmlEntitiesMap = {
    '&period;': '.',
    '&quest;': '?',
    '&colon;': ':',
    '&comma;': ',',
    '&excl;': '!',
    '&apos;': '\'',
    '&quot;': '"',
    '&amp;': '&'
  };

  return text.replace(/&period;|&quest;|&colon;|&comma;|&excl;|&apos;|&quot;|&amp;/g, (match) => htmlEntitiesMap[match]);
}

// Função para formatar a data
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }) + ' ' + date.toLocaleTimeString('pt-BR');
}

// Função para formatar a duração
function formatDuration(duration) {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = parseInt(match[1], 10) || 0;
  const minutes = parseInt(match[2], 10) || 0;
  const seconds = parseInt(match[3], 10) || 0;
  const totalMinutes = hours * 60 + minutes + seconds / 60;
  return totalMinutes.toFixed(2) + ' minutos';
}

async function XvideosSearch(termo) {
  const urlBase = "https://www.xvideos.com";
  const searchTerm = termo.split(' ').join('+');
  const url = `${urlBase}?k=${searchTerm}`;
  try {
   const { data } = await axios.get(url);
   const $ = cheerio.load(data);
   const videos = [];
   $(".mozaique .thumb-block").each((i, elem) => {
      const title = $(elem).find('.title a').attr('title');
      const profile = $(elem).find('.profile-name a .name').text();
      const duration = $(elem).find('.duration').first().text().trim();
      const views = $(elem).find('.metadata .views').text().trim().split(' ')[0];
      const videoLink = urlBase + $(elem).find('.title a').attr('href');
      videos.push({title, profile, duration, views, link: videoLink});
    });
    return videos
  } catch (error) {
    console.error('Erro na pesquisa do Xvideos:', error);
    return null;
  }
}

module.exports = { XvideosSearch };-e 


==================================================
Pesquisas/ytsc.js
==================================================
const fetch = require('node-fetch');
const cheerio = require('cheerio');

async function searchYouTube(query) {
  try {
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);
    const results = [];

    $('ytd-video-renderer').each((i, element) => {
      const title = $(element).find('#video-title').text().trim();
      const thumb = $(element).find('#img').attr('src') || $(element).find('#img').attr('data-thumb');
      const channel = $(element).find('ytd-channel-name').text().trim();
      const views = $(element).find('#metadata-line span').first().text().trim();
      const published = $(element).find('#metadata-line span').last().text().trim();
      const videoLink = 'https://www.youtube.com' + $(element).find('#video-title').attr('href');

      if (title && videoLink) {
        results.push({
          titulo: title,
          thumb,
          canal: channel,
          publicado_em: published,
          views,
          dl_link: videoLink,
        });
      }
    });

    if (results.length === 0) throw new Error("Nenhum resultado encontrado.");
    return results;
  } catch (error) {
    console.error("Erro na scraper do YouTube:", error);
    throw error;
  }
}

module.exports = { searchYouTube };-e 


==================================================
Puxadas/cep.js
==================================================
const fetch = require('node-fetch');

const cepInfo = async (cep) => {
  try {
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: 'Não foi possível buscar as informações do CEP.' };
  }
};

module.exports = { cepInfo };-e 


==================================================
Puxadas/ip.js
==================================================
const axios = require('axios');

const ipInfo = async (ip) => {
  try {
    const response = await axios.get(`https://ipinfo.io/${ip}/json`);
    return response.data;
  } catch (error) {
    console.error("Erro ao obter informações do IP:", error);
    return { error: "Não foi possível obter as informações do IP." };
  }
};

module.exports = { ipInfo };-e 


==================================================
Stalk/gitstalk.js
==================================================
const fetch = require('node-fetch');

async function githubStalk(username) {
    const apiUrl = `https://api.github.com/users/${username}`;
    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        if (data.message === "Not Found") {
            return { error: "Usuário não encontrado" };
        }
        return {
            name: data.name || "Nome não disponível",
            bio: data.bio || "Biografia não disponível",
            public_repos: data.public_repos || 0,
            followers: data.followers || 0,
            following: data.following || 0,
            avatar_url: data.avatar_url,
            profile_url: data.html_url
        };
    } catch (error) {
        console.error("Erro ao buscar perfil do GitHub:", error);
        return { error: "Erro ao buscar dados do GitHub" };
    }
}

module.exports = { githubStalk };-e 


==================================================
Stalk/gitstalk2.js
==================================================
const fetch = require('node-fetch');

async function githubStalk(username) {
  try {
    const profileUrl = `https://api.github.com/users/${username}`;
    const profileResponse = await fetch(profileUrl);
    if (!profileResponse.ok) {
      return { error: 'Erro.' };
    }
    const profile = await profileResponse.json();
    const reposUrl = profile.repos_url;
    const reposResponse = await fetch(reposUrl);
    if (!reposResponse.ok) {
      return { error: 'Erro.' };
    }
    const repos = await reposResponse.json();

    return {
      name: profile.name || 'Não tem.',
      bio: profile.bio || 'Não tem.',
      public_repos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      avatar_url: profile.avatar_url,
      profile_url: profile.html_url,
      repos: repos.map((repo) => ({
        name: repo.name,
        updated_at: repo.updated_at,
        stars: repo.stargazers_count,
        forks: repo.forks,
        language: repo.language || 'Não tem.',
      })),
    };
  } catch (error) {
    return { error: 'Erro.' };
  }
}

module.exports = { githubStalk };-e 


==================================================
Stalk/igstalk1.js
==================================================
const axios = require('axios');

const igstalk = async (user) => {
  try {
    const { data } = await axios.get('https://i.instagram.com/api/v1/users/web_profile_info/?username=' + user, {
      headers: {
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.5005.61 Safari/537.36",
        "x-asbd-id": "198387",
        "x-csrftoken": "VXLPx1sgRb8OCHg9c2NKXbfDndz913Yp",
        "x-ig-app-id": "936619743392459",
        "x-ig-www-claim": "0"
      }
    });
    return (data.status == 'ok' ? {
      status: true,
      profile: {
        low: data.data.user.profile_pic_url,
        high: data.data.user.profile_pic_url_hd,
      },
      data: {
        url: data.data.user.external_url,
        id: data.data.user.id,
        fullname: data.data.user.full_name,
        private: data.data.user.is_private,
        verified: data.data.user.is_verified,
        bio: data.data.user.biography,
        follower: data.data.user.edge_followed_by.count,
        following: data.data.user.edge_follow.count,
        timeline: data.data.user.edge_owner_to_timeline_media.count,
      }
    } : { status: false, message: 'user not found' });
  } catch {
    return ({
      status: false,
      message: 'user not found'
    });
  }
};

module.exports = { igstalk };-e 


==================================================
Uploads/catbox.js
==================================================
const { fromBuffer } = require('file-type');
const FormData = require('form-data');
const fetch = require('node-fetch');

async function catbox(midia) {
  return new Promise(async (resolve, reject) => {
    try {
      let { ext } = await fromBuffer(midia); 
      let form = new FormData();
      form.append('reqtype', 'fileupload');
      form.append('fileToUpload', Buffer.from(midia), `tmp.${ext}`); 
      await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: form,
        headers: form.getHeaders(), 
      })
        .then(response => response.text())
        .then(link => resolve(link.trim()))
        .catch(erro => reject(erro));
    } catch (erro) {
      reject(erro); 
    }
  });
}

module.exports = { catbox };-e 

