#!/usr/bin/env node
/**
 * freefire-scraper.js — Free Fire (Garena) guest + profile + likes
 * ---------------------------------------------------------------------------
 * Base:
 *   • @pure0cd/freefire-api  — search / stats / items / encrypt AES
 *   • 0xMe/FreeFire-Api GenerateAccounts.py  — guest register + MajorRegister
 *   • kaifcodec/freefire-like-and-guest-api — LikeProfile protobuf (uid:int64, region:string)
 *   • senoseya/ffapis — region → base URL map
 *
 * CLI:
 *   node freefire-scraper.js login  [uid] [password]
 *   node freefire-scraper.js search <nickname> [--limit 10]
 *   node freefire-scraper.js profile <uid> [--region BR]
 *   node freefire-scraper.js stats   <uid> [br|cs] [career|ranked|normal]
 *   node freefire-scraper.js items   <uid>
 *   node freefire-scraper.js full    <uid>
 *   node freefire-scraper.js register [region] [--count N]   # cria guests (API Garena)
 *   node freefire-scraper.js guests  list|import <file>
 *   node freefire-scraper.js likes   <uid> [--region BR] [--count 5] [--check]
 *   node freefire-scraper.js help
 *
 * Flags: --json  --uid  --pass  --limit  --region  --count  --check
 * Env:   FF_UID  FF_PASSWORD  FF_REGION
 *
 * Guests salvos em: ./ff-guests.json
 * Alvo principal de likes (default de testes): 2933344965
 */

'use strict'

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const axios = require('axios')
const FreeFireAPI = require('@pure0cd/freefire-api')
const { encrypt } = require('@pure0cd/freefire-api/lib/crypto')
const protoHandler = require('@pure0cd/freefire-api/lib/protobuf')
const {
  HEADERS,
  URLS,
  GARENA_CLIENT,
  DEFAULT_CREDENTIALS,
} = require('@pure0cd/freefire-api/lib/constants')

// Versão atual (JWT das contas BR/NA usam OB54)
HEADERS.COMMON.ReleaseVersion = process.env.FF_RELEASE || 'OB54'

const DEFAULT_LIMIT = 15
const MAIN_TARGET = '2933344965'
const GUESTS_FILE = path.join(__dirname, 'ff-guests.json')
const USAGE_FILE = path.join(__dirname, 'ff-likes-usage.json')

const CLIENT_ID = GARENA_CLIENT.CLIENT_ID
const CLIENT_SECRET = GARENA_CLIENT.CLIENT_SECRET
const GARENA_UA = HEADERS.GARENA_AUTH['User-Agent']

// Host ativo (2026-07): connect.garena.com
// ffmconnect.live.gop.garenanow.com e 100067.connect.garena.com → 404 error_not_found
const REGISTER_URLS = [
  'https://connect.garena.com/oauth/guest/register',
  'https://ffmconnect.live.gop.garenanow.com/oauth/guest/register',
  'https://100067.connect.garena.com/oauth/guest/register',
]
const TOKEN_URLS = [
  'https://connect.garena.com/oauth/guest/token/grant',
  'https://ffmconnect.live.gop.garenanow.com/oauth/guest/token/grant',
  'https://100067.connect.garena.com/oauth/guest/token/grant',
]
const MAJOR_REGISTER = 'https://loginbp.ggblueshark.com/MajorRegister'
const MAJOR_LOGIN = URLS.MAJOR_LOGIN
const GARENA_TOKEN = TOKEN_URLS[0]

/** region → base URL (Like / PersonalShow) */
function baseUrlForRegion(region) {
  const r = String(region || '').toUpperCase()
  if (r === 'IND') return 'https://client.ind.freefiremobile.com'
  if (['BR', 'US', 'SAC', 'NA'].includes(r)) return 'https://client.us.freefiremobile.com'
  return null // use serverUrl do login
}

/* -------------------------------------------------------------------------- */
/*  Args / helpers                                                            */
/* -------------------------------------------------------------------------- */

function parseArgs(argv) {
  const args = {
    _: [],
    json: false,
    limit: DEFAULT_LIMIT,
    uid: process.env.FF_UID || '',
    pass: process.env.FF_PASSWORD || process.env.FF_PASS || '',
    region: process.env.FF_REGION || 'BR',
    count: 1,
    check: false,
    help: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--json') args.json = true
    else if (a === '--help' || a === '-h') args.help = true
    else if (a === '--check') args.check = true
    else if (a === '--limit' || a === '-n') args.limit = Math.max(1, Number(argv[++i]) || DEFAULT_LIMIT)
    else if (a === '--uid') args.uid = argv[++i] || ''
    else if (a === '--pass' || a === '--password') args.pass = argv[++i] || ''
    else if (a === '--region' || a === '-r') args.region = (argv[++i] || 'BR').toUpperCase()
    else if (a === '--count' || a === '-c') args.count = Math.max(1, Number(argv[++i]) || 1)
    else args._.push(a)
  }
  return args
}

function ts(sec) {
  if (!sec || Number(sec) <= 0) return null
  const n = Number(sec)
  const ms = n > 1e12 ? n : n * 1000
  try {
    return new Date(ms).toISOString()
  } catch {
    return String(sec)
  }
}

function out(args, title, data, ok = true) {
  if (args.json) console.log(JSON.stringify({ ok, title, data }, null, 2))
  else {
    console.log(`\n══ ${title} ══`)
    if (Array.isArray(data)) {
      data.forEach((row, i) => {
        if (row && row.nickname != null) {
          console.log(
            `[${i + 1}] ${row.nickname}  UID:${row.accountid}  LVL:${row.level ?? '-'}  REG:${row.region || '-'}  ♥${row.liked ?? '-'}`
          )
        } else console.log(`[${i + 1}]`, JSON.stringify(row))
      })
    } else console.log(JSON.stringify(data, null, 2))
  }
  return data
}

function friendlyError(err) {
  const msg = err && err.message ? String(err.message) : String(err)
  if (/BR_ACCOUNT_NOT_FOUND|ACCOUNT_NOT_FOUND/i.test(msg)) {
    return (
      msg +
      '\n→ Conta de outra região. Use guest BR/NA (--uid/--pass ou pool) e --region BR.'
    )
  }
  if (/error_not_found|404/i.test(msg) && /register/i.test(msg)) {
    return msg + '\n→ Endpoint de guest register da Garena está offline (404). Use guests do pool ou Frida.'
  }
  return msg
}

/* -------------------------------------------------------------------------- */
/*  Protobuf walk (lenient) — MajorLogin BR/NA quebra o decoder do pacote     */
/* -------------------------------------------------------------------------- */

function encodeVarint(n) {
  const r = []
  let x = typeof n === 'bigint' ? n : BigInt(n)
  while (x > 127n) {
    r.push(Number(x & 127n) | 128)
    x >>= 7n
  }
  r.push(Number(x))
  return Buffer.from(r)
}

function decodeVarint(buf, offset) {
  let result = 0n
  let shift = 0n
  let pos = offset
  while (pos < buf.length) {
    const b = buf[pos++]
    result |= BigInt(b & 0x7f) << shift
    if ((b & 0x80) === 0) break
    shift += 7n
  }
  return { value: result, pos }
}

function walkProto(buf) {
  const fields = []
  let offset = 0
  while (offset < buf.length) {
    try {
      const tag = decodeVarint(buf, offset)
      offset = tag.pos
      const fieldNum = Number(tag.value >> 3n)
      const wire = Number(tag.value & 7n)
      if (wire === 0) {
        const v = decodeVarint(buf, offset)
        offset = v.pos
        fields.push({ fieldNum, wire, value: v.value.toString() })
      } else if (wire === 2) {
        const len = decodeVarint(buf, offset)
        offset = len.pos
        const L = Number(len.value)
        if (offset + L > buf.length) {
          fields.push({ fieldNum, wire, error: `overflow len=${L}` })
          break
        }
        const slice = buf.subarray(offset, offset + L)
        offset += L
        let asStr = null
        try {
          asStr = slice.toString('utf8')
          if (
            !/^[\x20-\x7E\u00A0-\uFFFF]+$/.test(asStr) &&
            !asStr.startsWith('http') &&
            !asStr.startsWith('eyJ')
          ) {
            // still keep if looks like jwt/url
            if (!asStr.startsWith('eyJ') && !asStr.startsWith('http')) asStr = null
          }
        } catch {
          asStr = null
        }
        fields.push({ fieldNum, wire, len: L, str: asStr, bytes: slice })
      } else if (wire === 5) {
        offset += 4
        fields.push({ fieldNum, wire })
      } else if (wire === 1) {
        offset += 8
        fields.push({ fieldNum, wire })
      } else {
        fields.push({ fieldNum, wire, error: 'unknown wire' })
        break
      }
    } catch (e) {
      fields.push({ error: e.message, at: offset })
      break
    }
  }
  return fields
}

function extractMajorLogin(buf) {
  const fields = walkProto(buf)
  const out = {
    accountId: null,
    lockRegion: null,
    notiRegion: null,
    ipRegion: null,
    token: null,
    serverUrl: null,
    fields,
  }
  for (const f of fields) {
    if (f.fieldNum === 1 && f.wire === 0) out.accountId = f.value
    if (f.fieldNum === 2 && f.str) out.lockRegion = f.str
    if (f.fieldNum === 3 && f.str) out.notiRegion = f.str
    if (f.fieldNum === 4 && f.str) out.ipRegion = f.str
    if (f.fieldNum === 8 && f.str) out.token = f.str
    if (f.fieldNum === 10 && f.str) out.serverUrl = f.str
    if (f.str && f.str.startsWith('eyJ') && !out.token) out.token = f.str
    if (f.str && f.str.startsWith('http') && !out.serverUrl) out.serverUrl = f.str
  }
  return out
}

/* -------------------------------------------------------------------------- */
/*  Guests pool                                                               */
/* -------------------------------------------------------------------------- */

function loadGuests() {
  try {
    if (!fs.existsSync(GUESTS_FILE)) return []
    const j = JSON.parse(fs.readFileSync(GUESTS_FILE, 'utf8'))
    return Array.isArray(j.guests) ? j.guests : Array.isArray(j) ? j : []
  } catch {
    return []
  }
}

function saveGuests(guests) {
  const data = { updatedAt: new Date().toISOString(), guests }
  fs.writeFileSync(GUESTS_FILE, JSON.stringify(data, null, 2))
  return data
}

function upsertGuest(guest) {
  const list = loadGuests()
  const i = list.findIndex((g) => String(g.uid) === String(guest.uid))
  if (i >= 0) list[i] = { ...list[i], ...guest }
  else list.push(guest)
  saveGuests(list)
  return list
}

function loadUsage() {
  try {
    if (!fs.existsSync(USAGE_FILE)) return {}
    return JSON.parse(fs.readFileSync(USAGE_FILE, 'utf8'))
  } catch {
    return {}
  }
}

function saveUsage(u) {
  fs.writeFileSync(USAGE_FILE, JSON.stringify(u, null, 2))
}

function guestUsed(usage, targetUid, guestUid) {
  return Boolean(usage?.[String(targetUid)]?.used?.[String(guestUid)])
}

function markGuestUsed(usage, targetUid, guestUid) {
  const t = String(targetUid)
  if (!usage[t]) usage[t] = { used: {}, total: 0 }
  usage[t].used[String(guestUid)] = Date.now()
  usage[t].total = Object.keys(usage[t].used).length
}

/* -------------------------------------------------------------------------- */
/*  Auth: Garena token + MajorLogin (lenient)                                 */
/* -------------------------------------------------------------------------- */

async function garenaToken(uid, password) {
  const params = new URLSearchParams({
    uid: String(uid),
    password: String(password),
    response_type: 'token',
    client_type: '2',
    client_secret: CLIENT_SECRET,
    client_id: CLIENT_ID,
  })
  let lastErr = null
  for (const url of TOKEN_URLS) {
    try {
      const res = await axios.post(url, params, {
        headers: HEADERS.GARENA_AUTH,
        timeout: 20000,
        validateStatus: () => true,
      })
      if (res.status === 200 && res.data?.access_token) return res.data
      lastErr = `${url} → ${res.status} ${JSON.stringify(res.data).slice(0, 100)}`
    } catch (e) {
      lastErr = `${url} → ${e.message}`
    }
  }
  throw new Error(`Garena token failed: ${lastErr || 'unknown'}`)
}

async function majorLogin(accessToken, openId) {
  const payload = { openid: openId, logintoken: accessToken, platform: '4' }
  const body = await protoHandler.encode('MajorLogin.proto', 'request', payload, true)
  const res = await axios.post(MAJOR_LOGIN, body, {
    headers: {
      ...HEADERS.COMMON,
      Authorization: 'Bearer',
      'Content-Type': 'application/octet-stream',
    },
    responseType: 'arraybuffer',
    timeout: 25000,
    validateStatus: () => true,
  })
  if (res.status !== 200) {
    throw new Error(`MajorLogin HTTP ${res.status}: ${Buffer.from(res.data || []).toString('utf8').slice(0, 120)}`)
  }
  const buf = Buffer.from(res.data)
  // try package decoder first, fallback walk
  try {
    const dec = await protoHandler.decode('MajorLogin.proto', 'response', buf)
    if (dec?.token) {
      return {
        token: dec.token,
        serverUrl: dec.serverUrl || dec.serverurl,
        lockRegion: dec.lockRegion || dec.lockregion || null,
        accountId: dec.accountId || dec.accountid || null,
        raw: dec,
      }
    }
  } catch {
    /* use walk */
  }
  const ex = extractMajorLogin(buf)
  if (!ex.token) {
    throw new Error(`MajorLogin: não achei JWT na resposta (len=${buf.length})`)
  }
  return {
    token: ex.token,
    serverUrl: ex.serverUrl,
    lockRegion: ex.lockRegion,
    accountId: ex.accountId,
    notiRegion: ex.notiRegion,
    ipRegion: ex.ipRegion,
  }
}

/**
 * Login guest → session { token, serverUrl, lockRegion, accountId, openId }
 */
async function loginGuest(uid, password) {
  const g = await garenaToken(uid, password)
  const m = await majorLogin(g.access_token, g.open_id)
  return {
    token: m.token,
    serverUrl: m.serverUrl,
    lockRegion: m.lockRegion,
    accountId: m.accountId,
    openId: g.open_id,
    guestUid: String(uid),
  }
}

/* -------------------------------------------------------------------------- */
/*  Register guest (0xMe GenerateAccounts.py)                                 */
/* -------------------------------------------------------------------------- */

function xorOpenId(openId) {
  const k = [0, 0, 0, 2, 0, 1, 7, 0, 0, 0, 0, 0, 2, 0, 1, 7, 0, 0, 0, 0, 0, 2, 0, 1, 7, 0, 0, 0, 0, 0, 2, 0]
  const bytes = Buffer.from(openId, 'utf8')
  const out = Buffer.alloc(bytes.length)
  for (let i = 0; i < bytes.length; i++) out[i] = bytes[i] ^ k[i % k.length] ^ 48
  return out
}

function encodeField(f, v) {
  if (typeof v === 'number' && Number.isInteger(v)) {
    return Buffer.concat([encodeVarint((f << 3) | 0), encodeVarint(v)])
  }
  const b = Buffer.isBuffer(v) ? v : Buffer.from(String(v), 'utf8')
  return Buffer.concat([encodeVarint((f << 3) | 2), encodeVarint(b.length), b])
}

function encodeMsg(obj) {
  return Buffer.concat(
    Object.entries(obj)
      .sort((a, b) => Number(a[0]) - Number(b[0]))
      .map(([k, v]) => encodeField(Number(k), v))
  )
}

/**
 * Ativa conta de jogo após MajorRegister.
 * POST /GetLoginData com body AES(vazio) no serverUrl da sessão.
 * Sem isso, self-profile retorna BR_ACCOUNT_NOT_FOUND.
 */
async function callGetLoginData(session) {
  const base = session.serverUrl || baseUrlForRegion(session.lockRegion) || 'https://client.us.freefiremobile.com'
  const body = encrypt(Buffer.alloc(0))
  const res = await axios.post(`${base.replace(/\/$/, '')}/GetLoginData`, body, {
    headers: {
      ...HEADERS.COMMON,
      Authorization: `Bearer ${session.token}`,
      'Content-Type': 'application/octet-stream',
      Expect: '100-continue',
    },
    responseType: 'arraybuffer',
    validateStatus: () => true,
    timeout: 20000,
  })
  return {
    ok: res.status === 200,
    status: res.status,
    len: res.data?.byteLength || 0,
    server: base,
  }
}

/**
 * Login + GetLoginData + verifica self-profile.
 * @returns {{ activated, session, self, getLoginData }}
 */
async function activateGuest(guest) {
  const session = await loginGuest(guest.uid, guest.password)
  const gld = await callGetLoginData(session)
  // pequeno delay para o servidor materializar o player
  await new Promise((r) => setTimeout(r, 800))

  let self = null
  let selfError = null
  try {
    self = await getPlayerProfile(session, session.accountId || guest.uid, session.lockRegion || guest.region)
  } catch (e) {
    // re-login + retry once
    try {
      const s2 = await loginGuest(guest.uid, guest.password)
      Object.assign(session, s2)
      await callGetLoginData(session)
      await new Promise((r) => setTimeout(r, 500))
      self = await getPlayerProfile(session, session.accountId || guest.uid, session.lockRegion || guest.region)
    } catch (e2) {
      selfError = String(e2.message).split('\n')[0].slice(0, 120)
    }
  }

  const activated = Boolean(self?.basic?.nickname)
  const updated = {
    ...guest,
    uid: String(guest.uid),
    password: guest.password,
    region: self?.basic?.region || session.lockRegion || guest.region || null,
    nickname: self?.basic?.nickname || guest.nickname || null,
    accountId: session.accountId || guest.accountId || null,
    activated,
    activatedAt: activated ? new Date().toISOString() : guest.activatedAt || null,
    source: guest.source || 'register',
  }
  upsertGuest(updated)
  return { activated, session, self, getLoginData: gld, selfError, guest: updated }
}

/**
 * Cria guest na região + ativa via GetLoginData.
 * Host OAuth: connect.garena.com
 * @param {string} region  BR | IND | ID | US | ...
 */
async function registerGuest(region = 'BR', nickname = null) {
  const reg = String(region || 'BR').toUpperCase()
  const plainPwd = String(Math.floor(Math.random() * 9e9) + 1e9)
  const passwordHash = crypto.createHash('sha256').update(plainPwd).digest('hex').toUpperCase()

  const body = new URLSearchParams({
    password: passwordHash,
    client_type: '2',
    source: '2',
    app_id: CLIENT_ID,
  }).toString()
  const sig = crypto.createHmac('sha256', CLIENT_SECRET).update(body).digest('hex')

  let uid = null
  let lastErr = null
  for (const url of REGISTER_URLS) {
    try {
      const res = await axios.post(url, body, {
        headers: {
          'User-Agent': GARENA_UA,
          Authorization: `Signature ${sig}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        timeout: 20000,
        validateStatus: () => true,
      })
      if (res.status === 200 && res.data?.uid) {
        uid = res.data.uid
        break
      }
      lastErr = `register ${url} → ${res.status} ${JSON.stringify(res.data).slice(0, 120)}`
    } catch (e) {
      lastErr = e.message
    }
  }
  if (!uid) {
    throw new Error(
      `Guest OAuth register falhou (Garena). ${lastErr || ''}\n` +
        `Host ativo esperado: https://connect.garena.com/oauth/guest/register`
    )
  }

  const g = await garenaToken(uid, passwordHash)
  // nick ASCII simples (evita encoding estranho no JWT)
  const nick =
    nickname ||
    `P${Math.floor(Math.random() * 90000 + 10000)}`

  const pf = {
    1: nick,
    2: g.access_token,
    3: g.open_id,
    5: 102000007,
    6: 4,
    7: 1,
    13: 1,
    14: xorOpenId(g.open_id),
    15: reg,
    16: 1,
  }
  const encrypted = encrypt(encodeMsg(pf))
  const res = await axios.post(MAJOR_REGISTER, encrypted, {
    headers: {
      Authorization: `Bearer ${g.access_token}`,
      'X-Unity-Version': '2018.4.11f1',
      'X-GA': 'v1 1',
      ReleaseVersion: HEADERS.COMMON.ReleaseVersion,
      'Content-Type': 'application/octet-stream',
      'User-Agent': GARENA_UA,
      Host: 'loginbp.ggblueshark.com',
      Connection: 'Keep-Alive',
      'Accept-Encoding': 'gzip',
      Expect: '100-continue',
    },
    responseType: 'arraybuffer',
    validateStatus: () => true,
    timeout: 25000,
  })
  if (res.status !== 200) {
    throw new Error(
      `MajorRegister HTTP ${res.status}: ${Buffer.from(res.data || []).toString('utf8').slice(0, 80)}`
    )
  }

  const guest = {
    uid: String(uid),
    password: passwordHash,
    plainPassword: plainPwd,
    region: reg,
    nickname: nick,
    source: 'register',
    createdAt: new Date().toISOString(),
    activated: false,
  }
  upsertGuest(guest)

  // Ativação: GetLoginData materializa o player no game server
  const act = await activateGuest(guest)
  return {
    ...act.guest,
    plainPassword: plainPwd,
    activation: {
      ok: act.activated,
      getLoginData: act.getLoginData,
      self: act.self
        ? {
            nickname: act.self.basic.nickname,
            level: act.self.basic.level,
            region: act.self.basic.region,
            liked: act.self.basic.liked,
          }
        : null,
      error: act.selfError || null,
    },
  }
}

/* -------------------------------------------------------------------------- */
/*  Profile / Like (server-aware)                                             */
/* -------------------------------------------------------------------------- */

function authHeaders(token) {
  return {
    ...HEADERS.COMMON,
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/octet-stream',
  }
}

async function getPlayerProfile(session, uid, preferRegion = null) {
  const payload = {
    accountId: Number(uid),
    callSignSrc: 7,
    needGalleryInfo: true,
  }
  const body = await protoHandler.encode('PlayerPersonalShow.proto', 'request', payload, true)

  const bases = []
  const forced = preferRegion ? baseUrlForRegion(preferRegion) : null
  if (forced) bases.push(forced)
  if (session.serverUrl) bases.push(session.serverUrl)
  if (session.lockRegion) {
    const b = baseUrlForRegion(session.lockRegion)
    if (b) bases.push(b)
  }
  bases.push('https://client.us.freefiremobile.com', 'https://client.ind.freefiremobile.com')
  const tried = []
  const uniq = [...new Set(bases.filter(Boolean))]

  let lastErr = null
  for (const base of uniq) {
    const url = `${base.replace(/\/$/, '')}/GetPlayerPersonalShow`
    try {
      const res = await axios.post(url, body, {
        headers: authHeaders(session.token),
        responseType: 'arraybuffer',
        validateStatus: () => true,
        timeout: 20000,
      })
      tried.push({ base, status: res.status })
      if (res.status === 200) {
        const raw = await protoHandler.decode('PlayerPersonalShow.proto', 'response', res.data)
        const b = raw?.basicinfo || {}
        return {
          basic: {
            accountid: String(b.accountid || b.userid || uid),
            nickname: b.nickname || null,
            level: b.level ?? null,
            exp: b.exp ?? null,
            region: b.region || null,
            liked: b.liked ?? null,
            rank: b.rank ?? null,
            createat: b.createat ?? null,
            createat_iso: ts(b.createat),
            lastloginat: b.lastloginat ?? null,
            lastloginat_iso: ts(b.lastloginat),
          },
          clan: raw?.claninfo
            ? { clanname: raw.claninfo.clanname, clanid: raw.claninfo.clanid }
            : null,
          pet: raw?.petinfo
            ? { name: raw.petinfo.name, level: raw.petinfo.level, id: raw.petinfo.id }
            : null,
          server: base,
          _raw: raw,
        }
      }
      lastErr = Buffer.from(res.data || []).toString('utf8').slice(0, 120)
    } catch (e) {
      lastErr = e.message
      tried.push({ base, err: e.message })
    }
  }
  throw new Error(`Get Profile Failed: ${lastErr || 'unknown'} | tried=${JSON.stringify(tried)}`)
}

/** LikeProfile payload — kaifcodec like.proto: int64 uid=1; string region=2 */
function makeLikePayload(targetUid, region) {
  const uidNum = BigInt(String(targetUid))
  const reg = Buffer.from(String(region || 'BR'), 'utf8')
  const pb = Buffer.concat([
    Buffer.concat([encodeVarint((1 << 3) | 0), encodeVarint(uidNum)]),
    Buffer.concat([encodeVarint((2 << 3) | 2), encodeVarint(reg.length), reg]),
  ])
  return encrypt(pb)
}

async function sendLike(session, targetUid, region = null) {
  const reg = region || session.lockRegion || 'BR'
  const base =
    session.serverUrl ||
    baseUrlForRegion(reg) ||
    baseUrlForRegion('BR') ||
    'https://client.us.freefiremobile.com'

  const body = makeLikePayload(targetUid, reg)
  const url = `${base.replace(/\/$/, '')}/LikeProfile`
  const res = await axios.post(url, body, {
    headers: authHeaders(session.token),
    responseType: 'arraybuffer',
    validateStatus: () => true,
    timeout: 20000,
  })
  const ok = res.status === 200
  return {
    ok,
    status: res.status,
    server: base,
    region: reg,
    body: ok ? 'OK' : Buffer.from(res.data || []).toString('utf8').slice(0, 150),
  }
}

/**
 * Health-check de um guest: login + self-profile + (opcional) ver target.
 * Contas "completas" conseguem self-profile; as geradas via API em OB54
 * costumam logar e ver terceiros, mas self dá BR_ACCOUNT_NOT_FOUND.
 */
async function healthCheckGuest(guest, opts = {}) {
  const result = {
    uid: String(guest.uid),
    region: guest.region || null,
    source: guest.source || null,
    login: false,
    lockRegion: null,
    accountId: null,
    serverUrl: null,
    selfOk: false,
    self: null,
    selfError: null,
    canSeeTarget: null,
    targetLikes: null,
  }
  try {
    const sess = await loginGuest(guest.uid, guest.password)
    result.login = true
    result.lockRegion = sess.lockRegion
    result.accountId = sess.accountId
    result.serverUrl = sess.serverUrl
    try {
      const self = await getPlayerProfile(sess, sess.accountId || guest.uid, sess.lockRegion || guest.region)
      result.selfOk = true
      result.self = {
        nickname: self.basic.nickname,
        level: self.basic.level,
        region: self.basic.region,
        liked: self.basic.liked,
        exp: self.basic.exp,
      }
    } catch (e) {
      result.selfError = String(e.message).split('\n')[0].slice(0, 120)
    }
    if (opts.target) {
      try {
        const t = await getPlayerProfile(sess, opts.target, opts.region || 'BR')
        result.canSeeTarget = true
        result.targetLikes = t.basic.liked
      } catch {
        result.canSeeTarget = false
      }
    }
  } catch (e) {
    result.login = false
    result.selfError = String(e.message).slice(0, 120)
  }
  return result
}

async function healthCheckPool(opts = {}) {
  const guests = loadGuests()
  const limit = opts.limit || guests.length
  const list = guests.slice(-limit) // prefer recent if limited
  const rows = []
  for (const g of list) {
    rows.push(await healthCheckGuest(g, opts))
  }
  return {
    total: guests.length,
    checked: rows.length,
    complete: rows.filter((r) => r.login && r.selfOk).length,
    loginOnly: rows.filter((r) => r.login && !r.selfOk).length,
    dead: rows.filter((r) => !r.login).length,
    rows,
  }
}

/**
 * Envia likes usando guests do pool (1 like / guest / target).
 */
async function sendLikes(targetUid, opts = {}) {
  const region = (opts.region || 'BR').toUpperCase()
  const want = Math.max(1, Number(opts.count) || 1)
  const guests = loadGuests().filter((g) => {
    if (!g.uid || !g.password) return false
    if (opts.anyRegion) return true
    const gr = String(g.region || '').toUpperCase()
    if (['BR', 'US', 'SAC', 'NA'].includes(region)) {
      return !gr || ['BR', 'US', 'SAC', 'NA'].includes(gr)
    }
    return !gr || gr === region
  })

  const usage = loadUsage()
  const available = guests.filter((g) => !guestUsed(usage, targetUid, g.uid))
  const plan = available.slice(0, want)

  let before = null
  if (opts.check !== false) {
    try {
      // login first guest or seed for check
      const seed = plan[0] || guests[0]
      if (seed) {
        const sess = await loginGuest(seed.uid, seed.password)
        const p = await getPlayerProfile(sess, targetUid, region)
        before = p.basic
      }
    } catch (e) {
      before = { error: e.message }
    }
  }

  const results = []
  for (const g of plan) {
    try {
      const sess = await loginGuest(g.uid, g.password)
      // BR/US/NA targets → servidor US; payload region do guest (lock) ou do alvo
      if (['BR', 'US', 'SAC', 'NA'].includes(region)) {
        sess.serverUrl = baseUrlForRegion('BR')
      }
      const likeRegion = sess.lockRegion || g.region || region
      const r = await sendLike(sess, targetUid, likeRegion)
      if (r.ok) markGuestUsed(usage, targetUid, g.uid)
      results.push({ guest: g.uid, ...r })
    } catch (e) {
      results.push({ guest: g.uid, ok: false, error: e.message })
    }
  }
  saveUsage(usage)

  let after = null
  if (opts.check !== false && plan.length) {
    try {
      const seed = plan[0]
      const sess = await loginGuest(seed.uid, seed.password)
      const p = await getPlayerProfile(sess, targetUid, region)
      after = p.basic
    } catch (e) {
      after = { error: e.message }
    }
  }

  const success = results.filter((r) => r.ok).length
  return {
    targetUid: String(targetUid),
    region,
    requested: want,
    available: available.length,
    planned: plan.length,
    success,
    before,
    after,
    deltaLikes:
      before?.liked != null && after?.liked != null ? after.liked - before.liked : null,
    results,
  }
}

/* -------------------------------------------------------------------------- */
/*  pure0cd wrapper (search/stats/items)                                      */
/* -------------------------------------------------------------------------- */

let _api = null
let _session = null

function getApi() {
  if (!_api) _api = new FreeFireAPI()
  return _api
}

async function login(uid = null, password = null) {
  if (uid && password) {
    _session = await loginGuest(uid, password)
    // also warm pure0cd for search (pode falhar em guests BR/NA)
    try {
      await getApi().login(uid, password)
    } catch {
      /* pure0cd decoder quebra em MajorLogin BR/NA — ok */
    }
    // devolve a sessão completa (com token) p/ ensureSession/profile
    return {
      ..._session,
      hasToken: true,
      token_preview: _session.token.slice(0, 28) + '…',
    }
  }
  // default pure0cd (região ID)
  const api = getApi()
  const s = await api.login()
  _session = {
    token: s.token,
    serverUrl: s.serverUrl,
    openId: s.openId,
    accountId: s.accountId,
    lockRegion: 'ID',
    guestUid: null,
  }
  return {
    ..._session,
    hasToken: Boolean(s.token),
    token_preview: s.token ? String(s.token).slice(0, 28) + '…' : null,
  }
}

async function ensureSession(opts = {}) {
  if (_session?.token) return _session
  if (opts.uid && opts.pass) return login(opts.uid, opts.pass)
  // prefer BR guest from pool for BR work
  const guests = loadGuests()
  const br = guests.find((g) => ['BR', 'US', 'NA', 'SAC'].includes(String(g.region || '').toUpperCase()))
  if (br) return login(br.uid, br.password)
  return login()
}

async function search(keyword, opts = {}) {
  const kw = String(keyword || '').trim()
  if (kw.length < 3) throw new Error('Search precisa de pelo menos 3 caracteres')
  await ensureSession(opts)
  // pure0cd search works on ID server
  try {
    await getApi()._checkSession()
  } catch {
    await getApi().login()
  }
  const rows = (await getApi().searchAccount(kw)) || []
  return rows.slice(0, opts.limit ?? DEFAULT_LIMIT).map((row) => ({
    accountid: String(row.accountid ?? ''),
    nickname: row.nickname || '',
    level: row.level ?? null,
    region: row.region || null,
    liked: row.liked ?? null,
    lastloginat_iso: ts(row.lastloginat),
  }))
}

async function profile(uid, opts = {}) {
  const sess = await ensureSession(opts)
  return getPlayerProfile(sess, uid, opts.region || null)
}

async function stats(uid, mode = 'br', matchType = 'career', opts = {}) {
  await ensureSession(opts)
  try {
    await getApi()._checkSession()
  } catch {
    await getApi().login()
  }
  const raw = await getApi().getPlayerStats(String(uid), mode, matchType)
  return { uid: String(uid), mode, matchType, stats: raw }
}

async function items(uid, opts = {}) {
  await ensureSession(opts)
  try {
    await getApi()._checkSession()
  } catch {
    await getApi().login()
  }
  return getApi().getPlayerItems(String(uid))
}

async function full(uid, opts = {}) {
  const [p, br, it] = await Promise.all([
    profile(uid, opts),
    stats(uid, 'br', 'career', opts).catch((e) => ({ error: e.message })),
    items(uid, opts).catch((e) => ({ error: e.message })),
  ])
  return { profile: p, br_career: br, items: it }
}

/* -------------------------------------------------------------------------- */
/*  CLI                                                                       */
/* -------------------------------------------------------------------------- */

function help() {
  console.log(`
freefire-scraper — Garena Free Fire (guest + profile + likes)

  login     [uid] [password]
  search    <nickname> [--limit 10]
  profile   <uid> [--region BR]
  stats     <uid> [br|cs] [career|ranked|normal]
  items     <uid>
  full      <uid>
  register  [region] [--count N]     # cria + ativa guest (GetLoginData)
  activate  [uid|all] [--limit N]    # ativa guests incompletos do pool
  guests    list | import <json>
  health    [uid] [--limit N]        # valida login + self-profile do pool
  likes     <uid> [--region BR] [--count N] [--check]

Pool: ${GUESTS_FILE}
Uso de likes: ${USAGE_FILE}
Alvo principal: ${MAIN_TARGET}

Exemplos:
  node freefire-scraper.js profile ${MAIN_TARGET} --region BR
  node freefire-scraper.js likes ${MAIN_TARGET} --region BR --count 5 --check
  node freefire-scraper.js register BR --count 3
  node freefire-scraper.js guests list

Fontes:
  https://github.com/0xMe/FreeFire-Api (GenerateAccounts.py)
  https://github.com/kaifcodec/freefire-like-and-guest-api
  https://www.npmjs.com/package/@pure0cd/freefire-api
`)
}

async function runCli(argv) {
  const args = parseArgs(argv)
  if (args.help || args._.length === 0) {
    help()
    return
  }

  const cmd = String(args._[0] || '').toLowerCase()
  const rest = args._.slice(1)
  const sessOpts = { uid: args.uid, pass: args.pass, limit: args.limit, region: args.region }

  try {
    switch (cmd) {
      case 'help':
      case 'menu':
        help()
        break

      case 'login': {
        const u = rest[0] || args.uid || null
        const p = rest[1] || args.pass || null
        const s = await login(u, p)
        out(args, 'login', s)
        break
      }

      case 'search':
      case 'buscar': {
        if (!rest[0]) throw new Error('Uso: search <nickname>')
        const rows = await search(rest[0], sessOpts)
        out(args, `search:${rest[0]}`, rows)
        break
      }

      case 'profile':
      case 'perfil': {
        const uid = rest[0]
        if (!uid) throw new Error('Uso: profile <uid>')
        const data = await profile(uid, sessOpts)
        // strip raw for human
        if (!args.json && data._raw) delete data._raw
        out(args, `profile:${uid}`, data)
        break
      }

      case 'stats': {
        const uid = rest[0]
        if (!uid) throw new Error('Uso: stats <uid> [br|cs] [career|ranked|normal]')
        const data = await stats(uid, rest[1] || 'br', rest[2] || 'career', sessOpts)
        out(args, `stats:${uid}`, data)
        break
      }

      case 'items':
      case 'itens': {
        const uid = rest[0]
        if (!uid) throw new Error('Uso: items <uid>')
        out(args, `items:${uid}`, await items(uid, sessOpts))
        break
      }

      case 'full':
      case 'tudo': {
        const uid = rest[0]
        if (!uid) throw new Error('Uso: full <uid>')
        const data = await full(uid, sessOpts)
        if (data.profile?._raw) delete data.profile._raw
        out(args, `full:${uid}`, data)
        break
      }

      case 'register':
      case 'criar': {
        const region = (rest[0] || args.region || 'BR').toUpperCase()
        const n = args.count
        const created = []
        const errors = []
        for (let i = 0; i < n; i++) {
          try {
            created.push(await registerGuest(region))
          } catch (e) {
            errors.push(friendlyError(e))
            break
          }
        }
        out(args, `register:${region}`, { created, errors }, created.length > 0)
        if (!created.length) process.exitCode = 1
        break
      }

      case 'activate':
      case 'ativar': {
        const who = (rest[0] || 'all').toLowerCase()
        const guests = loadGuests()
        let targets = []
        if (who === 'all' || who === '*') {
          targets = guests.filter((g) => !g.activated).slice(-(args.limit === DEFAULT_LIMIT ? 20 : args.limit))
        } else if (/^\d{5,}$/.test(who)) {
          const g = guests.find((x) => String(x.uid) === who)
          if (!g) throw new Error(`Guest ${who} não está no pool`)
          targets = [g]
        } else {
          throw new Error('Uso: activate [uid|all] [--limit N]')
        }
        const results = []
        for (const g of targets) {
          try {
            const r = await activateGuest(g)
            results.push({
              uid: g.uid,
              activated: r.activated,
              nickname: r.guest.nickname,
              accountId: r.guest.accountId,
              region: r.guest.region,
              error: r.selfError || null,
            })
          } catch (e) {
            results.push({ uid: g.uid, activated: false, error: e.message })
          }
        }
        const ok = results.filter((r) => r.activated).length
        out(args, 'activate', { total: results.length, ok, fail: results.length - ok, results }, ok > 0)
        if (!ok) process.exitCode = 1
        break
      }

      case 'health':
      case 'check': {
        const maybeUid = rest[0]
        if (maybeUid && /^\d{5,}$/.test(maybeUid)) {
          const g = loadGuests().find((x) => String(x.uid) === maybeUid)
          if (!g && !(args.uid && args.pass)) {
            // allow --uid/--pass or pool
            throw new Error(`Guest ${maybeUid} não está no pool. Use --uid/--pass ou guests import.`)
          }
          const guest = g || { uid: args.uid || maybeUid, password: args.pass, region: args.region }
          if (!guest.password) throw new Error('Precisa password do guest (--pass)')
          const row = await healthCheckGuest(guest, { target: MAIN_TARGET, region: args.region })
          out(args, `health:${maybeUid}`, row, row.login && row.selfOk)
          if (!(row.login && row.selfOk)) process.exitCode = 1
        } else {
          const data = await healthCheckPool({
            limit: args.limit === DEFAULT_LIMIT ? 10 : args.limit,
            target: MAIN_TARGET,
            region: args.region,
          })
          out(args, 'health:pool', data)
        }
        break
      }

      case 'guests': {
        const sub = (rest[0] || 'list').toLowerCase()
        if (sub === 'list') {
          const g = loadGuests()
          out(
            args,
            'guests',
            g.map((x) => ({
              uid: x.uid,
              region: x.region || null,
              source: x.source || null,
              createdAt: x.createdAt || null,
            }))
          )
        } else if (sub === 'import') {
          const file = rest[1]
          if (!file) throw new Error('Uso: guests import <file.json>')
          const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
          let arr = Array.isArray(raw) ? raw : raw.guests || Object.values(raw)
          // support 0xMe map { BR: {uid,password}, ... }
          if (!Array.isArray(arr) && typeof raw === 'object') {
            arr = Object.entries(raw).map(([region, v]) => ({
              uid: String(v.uid),
              password: v.password,
              region,
              source: 'import',
            }))
          }
          let n = 0
          for (const g of arr) {
            if (g.uid && g.password) {
              upsertGuest({
                uid: String(g.uid),
                password: g.password,
                region: g.region || null,
                source: g.source || 'import',
                createdAt: g.createdAt || new Date().toISOString(),
              })
              n++
            }
          }
          out(args, 'guests:import', { imported: n, total: loadGuests().length })
        } else throw new Error('Uso: guests list | import <file>')
        break
      }

      case 'likes':
      case 'like': {
        const uid = rest[0] || MAIN_TARGET
        const data = await sendLikes(uid, {
          region: args.region,
          count: args.count,
          check: args.check || true,
        })
        out(args, `likes:${uid}`, data, data.success > 0)
        if (!data.success) process.exitCode = 1
        break
      }

      default:
        throw new Error(`Comando desconhecido: ${cmd}\nRoda: node freefire-scraper.js help`)
    }
  } catch (e) {
    const msg = friendlyError(e)
    if (args.json) console.log(JSON.stringify({ ok: false, error: msg }, null, 2))
    else console.error('[erro]', msg)
    process.exitCode = 1
  }
}

/* -------------------------------------------------------------------------- */
/*  Exports                                                                   */
/* -------------------------------------------------------------------------- */

module.exports = {
  login,
  loginGuest,
  search,
  profile,
  stats,
  items,
  full,
  registerGuest,
  activateGuest,
  callGetLoginData,
  healthCheckGuest,
  healthCheckPool,
  sendLike,
  sendLikes,
  getPlayerProfile,
  loadGuests,
  saveGuests,
  upsertGuest,
  ensureSession,
  parseArgs,
  runCli,
  MAIN_TARGET,
  GUESTS_FILE,
}

if (require.main === module) {
  runCli(process.argv.slice(2))
}
