/* Epiphany World — vector sprites.
   Every object in the World is a small SVG (64×64 units, ground contact near y=58).
   They are drawn to the canvas as images, so they stay sharp on any phone screen.
   To restyle the whole world, edit the palette or the builder functions below. */
(function () {
  const OUT = '#2f3350';           // soft outline colour
  const SW = 1.6;                  // outline width
  const shade = (rx = 20, cy = 58) => `<ellipse cx="32" cy="${cy}" rx="${rx}" ry="5" fill="#1d3a28" opacity=".22"/>`;
  const wrap = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="128" height="128">${body}</svg>`;
  const st = (w = SW, o = .5) => `stroke="${OUT}" stroke-opacity="${o}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

  /* ---------- nature ---------- */
  function tree() {
    return wrap(shade(18) +
      `<rect x="28.5" y="38" width="7" height="19" rx="2.5" fill="#7a5239" ${st()}/>` +
      `<rect x="31" y="40" width="2" height="14" rx="1" fill="#5d3e2b" opacity=".5"/>` +
      `<circle cx="21" cy="34" r="12" fill="#3f7e50" ${st()}/><circle cx="43" cy="34" r="12" fill="#3f7e50" ${st()}/>` +
      `<circle cx="32" cy="28" r="16" fill="#4d9058" ${st()}/><circle cx="30" cy="17" r="11" fill="#5da267" ${st()}/>` +
      `<ellipse cx="25" cy="18" rx="6" ry="3" fill="#e1f8ba" opacity=".3" transform="rotate(-25 25 18)"/>` +
      `<ellipse cx="22" cy="30" rx="4" ry="2" fill="#e1f8ba" opacity=".22" transform="rotate(-25 22 30)"/>` +
      `<circle cx="38" cy="30" r="1.6" fill="#e85d50"/><circle cx="27" cy="36" r="1.6" fill="#e85d50"/>`);
  }

  /* ---------- buildings ---------- */
  function house(o) {
    const sign = o.bakery
      ? `<rect x="15" y="30" width="28" height="7" rx="2" fill="#e8bc69" ${st(1.2)}/><text x="29" y="35.6" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="5.4" fill="#68452f">BAKERY</text>` +
        `<ellipse cx="50" cy="52" rx="4" ry="2.6" fill="#d89b4d" ${st(1)}/><path d="M47.5 51.5l5 1" stroke="#f7d89a" stroke-width="1"/>`
      : `<rect x="23" y="31" width="14" height="4" rx="1.5" fill="${o.trim}" ${st(1)}/>`;
    return wrap(shade(26) +
      `<rect x="9" y="52" width="40" height="5" rx="1.5" fill="#a58b70" ${st(1.2)}/>` +
      `<rect x="11" y="29" width="36" height="25" rx="2" fill="${o.wall}" ${st()}/>` +
      `<path d="M47 31l6 3v20h-6z" fill="${o.side}" ${st(1.2)}/>` +
      `<rect x="36" y="9" width="7" height="13" fill="#8d6b58" ${st(1.2)}/><rect x="34.5" y="7.5" width="10" height="3.5" rx="1" fill="#c58b72" ${st(1)}/>` +
      `<path d="M5 33L29 8l25 25z" fill="${o.roof}" ${st()}/>` +
      `<path d="M5 33L29 8l9 25z" fill="${o.roofL}" opacity=".85"/>` +
      `<path d="M10 28h38M15 23h28M20 18h18" stroke="#4b2b27" stroke-opacity=".28" stroke-width="1.2"/>` +
      `<path d="M7 32.5L29 10" stroke="#ffe6c4" stroke-opacity=".55" stroke-width="1.6" fill="none"/>` +
      sign +
      `<rect x="14" y="39" width="9" height="9" rx="1.5" fill="#f8e7c9" ${st(1.2)}/><rect x="15.5" y="40.5" width="6" height="6" fill="${o.glass}"/><path d="M18.5 40.5v6M15.5 43.5h6" stroke="#fff" stroke-width=".9"/>` +
      `<rect x="35" y="39" width="9" height="9" rx="1.5" fill="#f8e7c9" ${st(1.2)}/><rect x="36.5" y="40.5" width="6" height="6" fill="${o.glass}"/><path d="M39.5 40.5v6M36.5 43.5h6" stroke="#fff" stroke-width=".9"/>` +
      `<path d="M15 48h8M36 48h8" stroke="#8b6846" stroke-width="1.7" stroke-linecap="round"/>` +
      `<path d="M16 47q1-4 2-1 2-5 3 0 1-3 2 1" fill="#78a85c" stroke="#4f8950" stroke-width=".7"/><path d="M37 47q1-4 2-1 2-5 3 0 1-3 2 1" fill="#78a85c" stroke="#4f8950" stroke-width=".7"/>` +
      `<rect x="26" y="40" width="9" height="14" rx="2" fill="#74503a" ${st(1.2)}/><path d="M27.5 42h6" stroke="#a97b58" stroke-width="1"/><circle cx="33" cy="48" r="1" fill="#e8c36e"/>` +
      `<rect x="24" y="53.5" width="13" height="2.4" rx="1" fill="#d5c09a"/><path d="M22 55.5h17" stroke="#8b765b" stroke-width="1" stroke-linecap="round"/>`);
  }

  function well() {
    return wrap(shade(20) +
      `<ellipse cx="32" cy="44" rx="17" ry="10" fill="#7e8580" ${st()}/>` +
      `<ellipse cx="32" cy="42" rx="12" ry="6.5" fill="#367d8a"/><ellipse cx="29" cy="41" rx="6" ry="2.4" fill="none" stroke="#b4e0df" stroke-width="1" opacity=".7"/>` +
      `<ellipse cx="32" cy="44" rx="17" ry="10" fill="none" stroke="#d2d3c5" stroke-width="3.2"/>` +
      `<path d="M16 42V16M48 42V16" stroke="#765039" stroke-width="3.4" ${st(0.6, .4)}/>` +
      `<path d="M13 18L32 6l19 12z" fill="#a95446" ${st()}/><path d="M13 18L32 6l6 12z" fill="#c97962" opacity=".8"/>` +
      `<path d="M32 18v12" stroke="#c99a5d" stroke-width="1.5"/><rect x="29.5" y="29" width="5" height="5" rx="1" fill="#8d6a46" ${st(1)}/>`);
  }

  /* ---------- people ---------- */
  function person(o) {
    const s = o.small ? .82 : 1;
    const skin = o.skin || '#d49a70', hair = o.hair || '#513b32', coat = o.coat || '#6c65b8', pants = o.pants || '#425064';
    const hairBack = o.long ? `<path d="M21 22c0-9 5-13 11-13s11 4 11 13v13c0 1-3 2-4 0v-9H25v9c-1 2-4 1-4 0z" fill="${hair}" ${st(1.2)}/>` : '';
    const hairTop = `<path d="M22.5 22c0-8 4-12.5 9.5-12.5S41.5 14 41.5 22c-3-3-6-5-9.5-5s-6.500 1-9.500 5z" fill="${hair}" ${st(1.2)}/>`;
    const hat = o.hat === 'chef'
      ? `<path d="M23 14c-4-1-4-8 1-8 2-3 7-3 8-1 3-2 8 0 7 4 4 1 3 6-1 6z" fill="#fff" ${st(1.2)}/><rect x="24" y="12" width="16" height="4" rx="1" fill="#f1ede3" ${st(1)}/>`
      : o.hat === 'cap' ? `<path d="M22 17c0-7 4-10 10-10s10 3 10 10z" fill="${o.hatColor || '#3478d4'}" ${st(1.2)}/><path d="M40 16h8l-1 3h-8z" fill="${o.hatColor || '#3478d4'}" ${st(1)}/>` : '';
    const extras = [];
    if (o.apron) extras.push(`<path d="M25 36h14v11H25z" fill="#fff6e3" ${st(1)}/>`);
    if (o.tie) extras.push(`<path d="M32 33l-2 3 2 8 2-8z" fill="${o.tie}" ${st(.8)}/>`);
    const glasses = o.glasses ? `<circle cx="28.5" cy="23" r="3.2" fill="none" stroke="#2f3350" stroke-width="1"/><circle cx="35.5" cy="23" r="3.2" fill="none" stroke="#2f3350" stroke-width="1"/><path d="M31.7 23h.6" stroke="#2f3350" stroke-width="1"/>` : '';
    let item = '';
    if (o.item === 'suitcase') item = `<rect x="43" y="40" width="11" height="14" rx="2" fill="#b98b52" ${st(1.2)}/><path d="M46 40v-3h5v3" fill="none" stroke="#805c38" stroke-width="1.4"/><path d="M43 46h11" stroke="#e6c58b" stroke-width="1"/>`;
    if (o.item === 'icecream') item = `<path d="M46 34l3 12 3-12z" fill="#e0a85f" ${st(1)}/><circle cx="49" cy="31" r="4.2" fill="#f6c6d8" ${st(1)}/><circle cx="47.5" cy="28.5" r="3" fill="#fff1c7" ${st(1)}/>`;
    if (o.item === 'book') item = `<rect x="42" y="38" width="9" height="11" rx="1.5" fill="#477da8" ${st(1.1)}/><rect x="43.5" y="40" width="6" height="1.6" fill="#e7dfc4"/>`;
    if (o.item === 'backpack') item = `<rect x="41" y="33" width="10" height="14" rx="3" fill="#7d5bb2" ${st(1.2)}/><path d="M43 37h6" stroke="#c7b4ef" stroke-width="1.4"/>`;
    if (o.item === 'tray') item = `<ellipse cx="46" cy="42" rx="7" ry="2.4" fill="#c9a169" ${st(1)}/><ellipse cx="44" cy="40" rx="3" ry="1.8" fill="#e8b96c"/><ellipse cx="49" cy="40.2" rx="2.5" ry="1.6" fill="#e65e50"/>`;
    const body =
      shade(14) +
      `<g transform="translate(32 58) scale(${s}) translate(-32 -58)">` +
      hairBack +
      `<rect x="23.5" y="45" width="7" height="12" rx="2.5" fill="${pants}" ${st(1.2)}/><rect x="33.5" y="45" width="7" height="12" rx="2.5" fill="${pants}" ${st(1.2)}/>` +
      `<rect x="22" y="55" width="9" height="3.6" rx="1.8" fill="#2f3350"/><rect x="33" y="55" width="9" height="3.6" rx="1.8" fill="#2f3350"/>` +
      `<rect x="15.5" y="32" width="7" height="15" rx="3.2" fill="${coat}" ${st(1.2)}/><rect x="41.5" y="32" width="7" height="15" rx="3.2" fill="${coat}" ${st(1.2)}/>` +
      `<circle cx="19" cy="48" r="3.2" fill="${skin}"/><circle cx="45" cy="48" r="3.2" fill="${skin}"/>` +
      `<rect x="20" y="30" width="24" height="19" rx="7" fill="${coat}" ${st()}/>` +
      `<path d="M27 30l5 5 5-5z" fill="#fff" opacity=".55"/>` + extras.join('') +
      `<rect x="28.5" y="27" width="7" height="5" rx="2" fill="${skin}"/>` +
      `<circle cx="32" cy="21.5" r="10" fill="${skin}" ${st()}/>` + hairTop +
      `<circle cx="28.3" cy="23" r="1.5" fill="#342d2a"/><circle cx="35.7" cy="23" r="1.5" fill="#342d2a"/><circle cx="28.8" cy="22.5" r=".5" fill="#fff"/><circle cx="36.2" cy="22.5" r=".5" fill="#fff"/>` +
      `<circle cx="25.6" cy="26.5" r="1.8" fill="#d2685b" opacity=".4"/><circle cx="38.4" cy="26.5" r="1.8" fill="#d2685b" opacity=".4"/>` +
      `<path d="M29 27.2q3 3 6 0" fill="none" stroke="#8c5141" stroke-width="1.2" stroke-linecap="round"/>` +
      glasses + hat + item + `</g>`;
    return wrap(body);
  }

  function family() {
    // an adult and a child side by side
    const a = person({ coat: '#c46a8e', hair: '#4a3328', long: true, skin: '#d49a70' }).replace(/^<svg[^>]*>|<\/svg>$/g, '');
    const c = person({ coat: '#5c9b78', hair: '#754b32', small: true, skin: '#dba77e' }).replace(/^<svg[^>]*>|<\/svg>$/g, '');
    return wrap(`<g transform="translate(-9 0) scale(1)">${a}</g><g transform="translate(18 10) scale(.85)">${c}</g>`);
  }

  /* ---------- small things ---------- */
  const key = () => wrap(shade(12) + `<circle cx="24" cy="26" r="9" fill="none" stroke="#e2b84d" stroke-width="5" ${st(0.5, .4)}/><circle cx="24" cy="26" r="9" fill="none" stroke="#f6dc82" stroke-width="2" opacity=".7"/><path d="M31 31l16 17M42 43l5-4M38 39l4-4" stroke="#e2b84d" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M31 31l16 17" stroke="#f6dc82" stroke-width="1.6" opacity=".7" stroke-linecap="round"/>`);

  function basket(o) {
    const fruit = o && o.apples
      ? [[24, 36, '#e65e50'], [34, 34, '#f0b93f'], [42, 37, '#e65e50'], [30, 40, '#78a85c']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="5.2" fill="${c}" ${st(1)}/><path d="M${x} ${y - 5}l1 -3" stroke="#6d4b32" stroke-width="1.2"/><ellipse cx="${x + 2}" cy="${y - 6}" rx="2.4" ry="1.2" fill="#4f8950"/>`).join('') : '';
    return wrap(shade(18) +
      `<path d="M16 40c0-14 32-14 32 0" fill="none" stroke="#a0763f" stroke-width="3.4" stroke-linecap="round"/>` + fruit +
      `<path d="M13 40h38l-4 16H17z" fill="#b98b52" ${st()}/>` +
      `<path d="M19 42l2 12M26 42l1 12M33 42v12M40 42l-1 12M46 42l-2 12" stroke="#e4c58b" stroke-width="1.6" opacity=".85"/><path d="M14 46h36M16 52h32" stroke="#815a38" stroke-width="1" opacity=".4"/>`);
  }

  const bread = () => wrap(shade(16) +
    `<ellipse cx="32" cy="46" rx="20" ry="11" fill="#e0a95c" ${st()}/><ellipse cx="29" cy="42" rx="14" ry="6" fill="#f0c887" opacity=".8"/>` +
    `<path d="M20 41l7 7M29 39l7 8M38 40l6 7" stroke="#b9782f" stroke-width="2.2" stroke-linecap="round"/>`);

  const ticket = () => wrap(shade(14) +
    `<g transform="rotate(-8 32 40)"><rect x="12" y="29" width="40" height="23" rx="3.5" fill="#f8f3df" ${st()}/><rect x="12" y="29" width="40" height="7" rx="3" fill="#447ab0"/>` +
    `<circle cx="12" cy="42" r="3.2" fill="#8fbe7a"/><circle cx="52" cy="42" r="3.2" fill="#8fbe7a"/><path d="M18 42h28M18 47h18" stroke="#8e9bb0" stroke-width="2" stroke-linecap="round" stroke-dasharray="3 3"/></g>`);

  function stall(o) {
    const goods = o.kind === 'fruit'
      ? [[20, 40, '#e65e50'], [29, 38, '#f0b93f'], [38, 40, '#e65e50'], [46, 38, '#78a85c']].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="4.6" fill="${c}" ${st(1)}/>`).join('')
      : o.kind === 'bread'
        ? [[20, 41], [32, 39], [44, 41]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="6" ry="3.6" fill="#e0a95c" ${st(1)}/><path d="M${x - 3} ${y - 1}l3 2M${x} ${y - 2}l3 2" stroke="#b9782f" stroke-width="1"/>`).join('')
        : `<rect x="26" y="36" width="12" height="8" rx="1.5" fill="#f7f5e9" ${st(1)}/><rect x="26" y="36" width="12" height="3" fill="#3478d4"/>`;
    const stripes = Array.from({ length: 6 }, (_, k) => `<rect x="${10 + k * 7}" y="12" width="7" height="15" fill="${k % 2 ? '#fff7e6' : o.color}"/>`).join('');
    return wrap(shade(26) +
      `<rect x="11" y="26" width="3" height="28" fill="#8d6a46"/><rect x="50" y="26" width="3" height="28" fill="#8d6a46"/>` +
      `<rect x="10" y="38" width="44" height="17" rx="2.5" fill="#a67c52" ${st()}/><path d="M10 44h44" stroke="#6e4f33" stroke-opacity=".35" stroke-width="1.2"/>` +
      goods + stripes +
      `<path d="M10 27h44l3 5H7z" fill="${o.color}" ${st()}/><path d="M10 12h44l3 -3H7z" fill="${o.color}" opacity=".9"/><rect x="10" y="12" width="44" height="15" fill="none" ${st(1.4, .45)}/>` +
      (o.kind === 'ticket' ? `<rect x="22" y="14" width="20" height="8" rx="2" fill="#fff" opacity=".95"/><text x="32" y="20.3" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="5.4" fill="#2c4f86">TICKETS</text>` : ''));
  }

  const sofa = () => wrap(shade(24) +
    `<rect x="7" y="22" width="50" height="30" rx="9" fill="#4f86c6" ${st()}/>` +
    `<rect x="5" y="32" width="9" height="22" rx="4.5" fill="#3f73b0" ${st()}/><rect x="50" y="32" width="9" height="22" rx="4.5" fill="#3f73b0" ${st()}/>` +
    `<rect x="13" y="30" width="18" height="18" rx="5" fill="#6a9ddb" ${st(1.2)}/><rect x="33" y="30" width="18" height="18" rx="5" fill="#6a9ddb" ${st(1.2)}/>` +
    `<rect x="9" y="52" width="4" height="5" rx="1" fill="#5d4030"/><rect x="51" y="52" width="4" height="5" rx="1" fill="#5d4030"/><circle cx="20" cy="33" r="3" fill="#f6c453" opacity=".9"/>`);

  const table = () => wrap(shade(22) +
    `<rect x="14" y="40" width="4" height="17" rx="1.5" fill="#7a5233"/><rect x="46" y="40" width="4" height="17" rx="1.5" fill="#7a5233"/>` +
    `<ellipse cx="32" cy="38" rx="25" ry="13" fill="#a8774a" ${st()}/><ellipse cx="32" cy="36" rx="21" ry="10" fill="#bd8a58"/>` +
    `<ellipse cx="32" cy="35" rx="7.5" ry="4" fill="#f6efe0" ${st(1)}/><circle cx="46" cy="34" r="2.4" fill="#e65e50"/>` +
    `<path d="M20 35q-2-5 1-8 1 4 1 8z" fill="#78a85c"/>`);

  const lamp = () => wrap(shade(12) +
    `<ellipse cx="32" cy="55" rx="9" ry="3" fill="#6b4c33" ${st(1)}/><rect x="30.5" y="26" width="3" height="29" rx="1.5" fill="#8a6a46"/>` +
    `<path d="M17 28L22 8h20l5 20z" fill="#f2cf75" ${st()}/><path d="M22 8h8l-3 20h-10z" fill="#fff0b3" opacity=".7"/>` +
    `<ellipse cx="32" cy="29" rx="15" ry="3" fill="#ffe9a0" opacity=".5"/>`);

  const book = () => wrap(shade(18) +
    `<g transform="rotate(-6 32 40)"><rect x="14" y="26" width="34" height="28" rx="3" fill="#2f6aa0" ${st()}/><rect x="16" y="28" width="30" height="24" rx="2" fill="#477da8"/>` +
    `<rect x="46" y="27" width="5" height="26" rx="1" fill="#f1ead2" ${st(1)}/><rect x="22" y="33" width="16" height="3" rx="1.5" fill="#f1ead2"/><rect x="22" y="39" width="11" height="2.4" rx="1.2" fill="#f1ead2" opacity=".8"/></g>`);

  const bench = () => wrap(shade(24) +
    `<rect x="12" y="44" width="4" height="12" rx="1.5" fill="#4d3a2b"/><rect x="48" y="44" width="4" height="12" rx="1.5" fill="#4d3a2b"/>` +
    `<rect x="8" y="32" width="48" height="8" rx="2.5" fill="#c08a52" ${st()}/><rect x="8" y="42" width="48" height="7" rx="2.5" fill="#b27c46" ${st()}/>` +
    `<path d="M10 35h44M10 45h44" stroke="#805b38" stroke-opacity=".4" stroke-width="1"/><rect x="11" y="24" width="42" height="7" rx="2.5" fill="#c9965f" ${st()}/>`);

  const swing = () => wrap(shade(24) +
    `<path d="M10 56L21 8M54 56L43 8" stroke="#8c633c" stroke-width="4.2" stroke-linecap="round"/><path d="M19 8h26" stroke="#8c633c" stroke-width="5" stroke-linecap="round"/>` +
    `<path d="M25 9l-1 34M39 9l1 34" stroke="#d6d1c4" stroke-width="1.6"/><rect x="19" y="42" width="26" height="6" rx="2.5" fill="#d58c4d" ${st()}/>` +
    `<path d="M10 56L21 8M54 56L43 8" stroke="#a97848" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>`);

  const slide = () => wrap(shade(24) +
    `<rect x="9" y="12" width="4" height="44" rx="1.5" fill="#8c633c"/><rect x="9" y="12" width="14" height="4" rx="1.5" fill="#d58c4d" ${st(1)}/>` +
    `<path d="M10 20h13M10 28h13M10 36h13M10 44h13" stroke="#8c633c" stroke-width="2"/>` +
    `<path d="M22 15l28 33c3 4 8 5 10 4l-2 5c-5 2-11 0-14-4L20 24z" fill="#6e91d0" ${st()}/><path d="M25 18l25 30" stroke="#a9c3ee" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>`);

  const ball = () => wrap(shade(12, 56) +
    `<circle cx="32" cy="42" r="14" fill="#f4f0e6" ${st()}/><path d="M18.5 38c8 2 19 2 27 0M20 50c8-3 16-3 24 0" fill="none" stroke="#e65e50" stroke-width="3" stroke-linecap="round"/><path d="M32 28c-3 8-3 20 0 28" fill="none" stroke="#5b7caa" stroke-width="2.6"/><ellipse cx="26" cy="35" rx="3.4" ry="1.8" fill="#fff" opacity=".7"/>`);

  const kite = () => wrap(shade(10) +
    `<path d="M32 4l15 17-15 20L17 21z" fill="#e65e50" ${st()}/><path d="M32 4l15 17H32zM17 21h15v20z" fill="#f4c542" opacity=".95"/><path d="M32 4v37M17 21h30" stroke="#fff" stroke-width="1.1" opacity=".8"/>` +
    `<path d="M32 41q-6 8 2 12t-2 8" fill="none" stroke="#6b4c33" stroke-width="1.6"/><path d="M30 49l4 1M31 56l4 -1" stroke="#5b7caa" stroke-width="2"/>`);

  const board = () => wrap(shade(24) +
    `<rect x="5" y="8" width="54" height="36" rx="3" fill="#8a6a46" ${st()}/><rect x="9" y="12" width="46" height="28" rx="1.5" fill="#2f5a4d"/>` +
    `<path d="M14 20h18M14 27h26M14 34h12" stroke="#f1f5ea" stroke-width="2" stroke-linecap="round" opacity=".85"/><circle cx="46" cy="32" r="4.4" fill="none" stroke="#f6d56a" stroke-width="1.8"/>` +
    `<rect x="9" y="42" width="46" height="3" fill="#6d5236"/><rect x="40" y="40" width="9" height="2.6" rx="1" fill="#f1ead2"/><path d="M14 44l-3 12M50 44l3 12" stroke="#6d5236" stroke-width="3" stroke-linecap="round"/>`);

  function bookshelf() {
    const colors = ['#c25c4a', '#477da8', '#e0b24c', '#5c9b78', '#8f6fb4', '#d9843f'];
    const row = y => colors.map((c, k) => `<rect x="${11 + k * 7.4}" y="${y + (k % 3)}" width="6.2" height="${13 - (k % 3)}" rx="1" fill="${c}" ${st(.8, .4)}/>`).join('');
    return wrap(shade(22) + `<rect x="7" y="6" width="50" height="50" rx="3" fill="#a6764a" ${st()}/><rect x="10" y="9" width="44" height="44" rx="1.5" fill="#6d4c31"/>` +
      row(11) + row(31) + `<rect x="9" y="25" width="46" height="3.4" fill="#a6764a"/><rect x="9" y="45" width="46" height="3.4" fill="#a6764a"/>`);
  }

  const clock = () => wrap(shade(14) +
    `<rect x="29.5" y="42" width="5" height="15" rx="2" fill="#6d4c31"/><rect x="22" y="54" width="20" height="4" rx="2" fill="#6d4c31"/>` +
    `<circle cx="32" cy="26" r="20" fill="#f7f1df" ${st(2.2, .6)}/><circle cx="32" cy="26" r="16.5" fill="#fff" stroke="#c9b88f" stroke-width="1"/>` +
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(k => `<path d="M32 11.5v${k % 3 ? 2 : 4}" stroke="#2f3350" stroke-width="${k % 3 ? 1 : 1.8}" transform="rotate(${k * 30} 32 26)"/>`).join('') +
    `<path d="M32 26V16" stroke="#2f3350" stroke-width="2.2" stroke-linecap="round" transform="rotate(30 32 26)"/><path d="M32 26V13" stroke="#2f3350" stroke-width="1.6" stroke-linecap="round" transform="rotate(-70 32 26)"/><circle cx="32" cy="26" r="1.8" fill="#e65e50"/>`);

  function desk(o) {
    return wrap(shade(24) +
      `<rect x="11" y="40" width="4" height="16" rx="1.5" fill="#6d4c31"/><rect x="49" y="40" width="4" height="16" rx="1.5" fill="#6d4c31"/>` +
      `<rect x="6" y="28" width="52" height="13" rx="3" fill="${o.top}" ${st()}/><rect x="6" y="38" width="52" height="4" rx="1.5" fill="#8a6038"/>` +
      `<rect x="14" y="31" width="14" height="6" rx="1" fill="#f6efe0" ${st(.9)}/><path d="M17 33.5h8" stroke="#8e9bb0" stroke-width="1"/>` +
      `<rect x="40" y="29" width="10" height="3" rx="1.5" fill="#e6bf48"/>`);
  }

  const bag = () => wrap(shade(16) +
    `<path d="M20 20q12-12 24 0" fill="none" stroke="#7d5bb2" stroke-width="3.4" stroke-linecap="round"/>` +
    `<rect x="14" y="22" width="36" height="33" rx="9" fill="#8a6bc2" ${st()}/><rect x="18" y="38" width="28" height="13" rx="4" fill="#7a5bb0" ${st(1.1)}/><rect x="28" y="40" width="8" height="5" rx="1.5" fill="#e6c365"/><path d="M20 28h24" stroke="#c7b4ef" stroke-width="2" opacity=".7" stroke-linecap="round"/>`);

  const pencil = () => wrap(shade(14) +
    `<g transform="rotate(-38 32 34)"><rect x="26" y="6" width="12" height="42" rx="2" fill="#f2c94c" ${st()}/><rect x="26" y="6" width="12" height="7" rx="2" fill="#e7878b"/><rect x="26" y="12" width="12" height="3.5" fill="#c9ccd2"/><path d="M26 48l6 11 6-11z" fill="#f1d5a8" ${st(1)}/><path d="M30 55l2 4 2-4z" fill="#3b3b44"/><path d="M30 14v32" stroke="#fff" stroke-opacity=".5" stroke-width="1.6"/></g>`);

  const platform = () => wrap(shade(14) +
    `<rect x="30" y="14" width="4" height="43" rx="1.5" fill="#6b7280"/><rect x="14" y="8" width="36" height="20" rx="4" fill="#2f6aa0" ${st()}/><text x="32" y="22.4" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="10.5" fill="#fff">2</text><rect x="22" y="53" width="20" height="4" rx="2" fill="#6b7280"/>`);

  function ticketDesk() { return stall({ color: '#3478d4', kind: 'ticket' }); }

  /* ---------- scenes: full-map backgrounds (20 × 14 tiles, 32 units per tile) ---------- */
  const T = 32, MW = 20, MH = 14;
  const rnd = (a, b, k = 1) => { const n = Math.sin(a * 127.1 + b * 311.7 + k * 74.7) * 43758.5453; return n - Math.floor(n); };
  const sceneWrap = body => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MW * T} ${MH * T}" width="${MW * T * 2}" height="${MH * T * 2}">${body}</svg>`;
  const rr = (x, y, w, h, r, fill, stroke, sw = 1.4, extra = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ''} ${extra}/>`;
  const ell = (cx, cy, rx, ry, fill, extra = '') => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;

  function grassBase(c1 = '#93c37d', c2 = '#86b672', seed = 1) {
    let s = `<defs><linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient></defs><rect width="${MW * T}" height="${MH * T}" fill="url(#gg)"/>`;
    for (let gy = 0; gy < MH; gy++) for (let gx = 0; gx < MW; gx++) {
      const sd = rnd(gx, gy, seed), px = gx * T, py = gy * T;
      s += ell(px + T * (.2 + sd * .6), py + T * (.2 + rnd(gy, gx, seed) * .6), 6 + sd * 4, 3 + sd * 2, sd > .5 ? '#a5d28d' : '#78a864', `opacity=".22" transform="rotate(${Math.round(sd * 120)} ${px + 16} ${py + 16})"`);
      if (sd > .66) {
        const tx = px + T * (.3 + sd * .4), ty = py + T * .72;
        s += `<path d="M${tx} ${ty}q-2-8-5-10M${tx} ${ty}q0-9 1-12M${tx} ${ty}q3-7 6-9" fill="none" stroke="#35693a" stroke-opacity=".34" stroke-width="1.3" stroke-linecap="round"/>`;
        if (sd > .9) s += `<circle cx="${px + 23}" cy="${py + 9}" r="2.2" fill="${rnd(gy, gx) > .5 ? '#fff4cf' : '#f8d6e4'}"/><circle cx="${px + 23}" cy="${py + 9}" r=".9" fill="#e9b94f"/>`;
      }
    }
    return s;
  }

  function planter(gx, gy) {
    const px = gx * T, py = gy * T;
    return ell(px + 16, py + 24, 12, 4, '#2d3a24', 'opacity=".2"') + rr(px + 5, py + 10, 22, 13, 4, '#b77e52', '#80563b', 1.2) + ell(px + 16, py + 10, 10, 6, '#6c9a58') +
      [0, 1, 2].map(n => `<circle cx="${px + 10 + n * 6}" cy="${py + 8 + (n % 2) * 2.5}" r="1.9" fill="${n % 2 ? '#f4d58a' : '#e98b83'}"/>`).join('');
  }
  function flowerBed(gx, gy, w = 1) {
    const px = gx * T, py = gy * T;
    return ell(px + w * 16, py + 23, w * 13, 4, '#2d4c2f', 'opacity=".16"') + rr(px + 3, py + 9, w * T - 6, 14, 5, '#759c60', '#5a824e', 1.2) +
      Array.from({ length: w * 4 }, (_, n) => `<circle cx="${px + 8 + n * 6}" cy="${py + 12 + (n % 2) * 4}" r="1.8" fill="${n % 2 ? '#f4d2a2' : '#eaa4a0'}"/>`).join('');
  }
  function fence(gx, gy, len) {
    const fx = gx * T, fy = gy * T;
    let s = `<g stroke="#9b744c" stroke-width="1.6" stroke-linecap="round"><path d="M${fx} ${fy + 25}H${fx + T * len}M${fx} ${fy + 20}H${fx + T * len}"/>`;
    for (let n = 0; n <= len; n++) s += `<path d="M${fx + n * T} ${fy + 17}v13"/>`;
    return s + '</g>';
  }

  function sceneVillage() {
    let s = grassBase('#93c37d', '#86b672', 1);
    for (const [gx, gy] of [[2, 1], [16, 1], [2, 12], [16, 12]]) s += ell((gx + 1) * T, (gy + 1) * T, 44, 36, '#6e9c64', 'opacity=".9"') + ell((gx + 1) * T, (gy + 1.1) * T, 30, 15, '#2c5c39', 'opacity=".18"');
    // sand lane
    s += `<path d="M${6.5 * T} ${4.5 * T}H${13.5 * T}V${10.5 * T}H${6.5 * T}Z" fill="none" stroke="#b79d68" stroke-width="${T + 4}" stroke-linejoin="round"/>`;
    s += `<path d="M${6.5 * T} ${4.5 * T}H${13.5 * T}V${10.5 * T}H${6.5 * T}Z" fill="none" stroke="#dcc592" stroke-width="${T}" stroke-linejoin="round"/>`;
    s += `<path d="M${6.5 * T} ${4.5 * T}H${13.5 * T}V${10.5 * T}H${6.5 * T}Z" fill="none" stroke="#f0e1b8" stroke-opacity=".55" stroke-width="${T - 10}" stroke-linejoin="round"/>`;
    for (let k = 0; k < 40; k++) { const a = rnd(k, 3), b = rnd(3, k); const onTop = k % 4; const x = onTop === 0 ? 6.5 * T + a * 7 * T : onTop === 1 ? 6.5 * T + a * 7 * T : 6.5 * T + (onTop === 2 ? 0 : 7 * T); const y = onTop === 0 ? 4.5 * T : onTop === 1 ? 10.5 * T : 4.5 * T + a * 6 * T; s += ell(x + (b - .5) * 18, y + (rnd(k, 8) - .5) * 18, 1.8, 1, '#9a7b48', 'opacity=".35"'); }
    // pond + bridge
    s += rr(8.55 * T, 5.8 * T, 2.9 * T, 2.4 * T, 26, '#d9cba3', '#b9a77b', 1.4);
    s += rr(8.75 * T, 6 * T, 2.5 * T, 2 * T, 22, '#62b2c4');
    s += `<path d="M${9 * T} ${6.5 * T}q10-6 20 0t20 0M${9.2 * T} ${7.6 * T}q10-5 18 0t18 0" fill="none" stroke="#e8faf6" stroke-opacity=".55" stroke-width="1.4" stroke-linecap="round"/>`;
    s += rr(7 * T, 7.12 * T, 5 * T, .78 * T, 5, '#81583e', '#5d402e', 1.4);
    for (let n = 0; n < 20; n++) s += `<path d="M${7 * T + 6 + n * 7.8} ${7.12 * T + 3}v${.78 * T - 6}" stroke="${n % 3 ? '#a77a51' : '#c69b6c'}" stroke-width="1.3"/>`;
    // gardens + fences
    for (const [gx, gy] of [[4, 3], [15, 3], [4, 11], [15, 11]]) s += flowerBed(gx, gy);
    for (const [gx, gy] of [[3, 3, 2], [16, 3, 2], [3, 11, 2], [16, 11, 2]].map(a => [a[0], a[1], a[2]])) s += fence(gx, gy, 2);
    return { svg: sceneWrap(s), trees: [] };
  }

  function sceneMarket() {
    let s = `<rect width="${MW * T}" height="${MH * T}" fill="#d9c9a2"/>`;
    for (let gy = 0; gy < MH; gy++) for (let gx = 0; gx < MW; gx++) { const sd = rnd(gx, gy, 2), px = gx * T, py = gy * T; s += rr(px + 2, py + 2, T - 4, T - 4, 6, sd > .5 ? '#cdbb90' : '#e2d3ac', null, 0, 'opacity=".55"'); }
    const road = (gx0, gy0, gx1, gy1) => rr(gx0 * T, gy0 * T, (gx1 - gx0 + 1) * T, (gy1 - gy0 + 1) * T, 0, '#ecdcb4');
    // lanes: ring + middle row
    s += `<g>${road(5, 3, 14, 3)}${road(5, 6, 14, 6)}${road(5, 9, 14, 9)}${road(5, 3, 5, 9)}${road(14, 3, 14, 9)}</g>`;
    for (let gy = 0; gy < MH; gy++) for (let gx = 0; gx < MW; gx++) { const inRoad = (gy === 3 || gy === 6 || gy === 9) && gx >= 5 && gx <= 14 || (gx === 5 || gx === 14) && gy >= 3 && gy <= 9; if (inRoad) s += rr(gx * T + 3, gy * T + 3, T - 6, T - 6, 7, rnd(gx, gy) > .5 ? '#f3e6c3' : '#e9d9b0', null, 0, 'opacity=".9"'); }
    for (const [gx, gy] of [[3, 2], [16, 2], [3, 11], [16, 11]]) s += planter(gx, gy);
    const sx = 10 * T + 16, sy = 2 * T + 16;
    s += rr(sx - 2, sy - 2, 4, 14, 1, '#765039') + rr(sx - 13, sy - 9, 26, 9, 2, '#a96d45', '#70482f', 1.2) + `<text x="${sx}" y="${sy - 2.4}" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="5.6" fill="#fff0c8">MARKET</text>`;
    // bunting
    s += `<path d="M${5 * T} ${2.2 * T}Q${10 * T} ${3.2 * T} ${15 * T} ${2.2 * T}" fill="none" stroke="#7a6a4f" stroke-width="1"/>` + Array.from({ length: 11 }, (_, k) => { const t = (k + .5) / 11, x = 5 * T + t * 10 * T, y = 2.2 * T + Math.sin(t * Math.PI) * T; return `<path d="M${x - 4} ${y}l4 8 4-8z" fill="${['#e65e50', '#f4c542', '#5c9b78', '#4f86c6'][k % 4]}"/>`; }).join('');
    return { svg: sceneWrap(s), trees: [[1, 1], [18, 1], [1, 12], [18, 12]].map(([a, b]) => [a + .5, b + .5]) };
  }

  function sceneStation() {
    let s = `<rect width="${MW * T}" height="${MH * T}" fill="#cfd3da"/>`;
    for (let gy = 0; gy < MH; gy++) for (let gx = 0; gx < MW; gx++) if ((gx + gy) % 2 === 0) s += rr(gx * T, gy * T, T, T, 0, '#fff', null, 0, 'opacity=".2"');
    for (const row of [3, 7]) {
      const y = row * T;
      s += rr(0, y + 1, MW * T, T - 2, 0, '#8a7a68') + rr(0, y + 3, MW * T, T - 6, 0, '#a89886');
      for (let k = 0; k < 80; k++) s += ell(rnd(k, row) * MW * T, y + 4 + rnd(row, k) * (T - 8), 1.4, .9, '#6f6253', 'opacity=".45"');
      for (let n = 0; n < MW * 2; n++) s += rr(n * 16 + 2, y + 4, 8, T - 8, 1.5, '#6b4c33', null, 0, 'opacity=".85"');
      s += `<path d="M0 ${y + 10}H${MW * T}M0 ${y + 22}H${MW * T}" stroke="#d7dbe0" stroke-width="3"/><path d="M0 ${y + 9}H${MW * T}M0 ${y + 21}H${MW * T}" stroke="#7b8590" stroke-width="1"/>`;
      s += rr(0, y - 4, MW * T, 4, 0, '#f4c94a') + rr(0, y + T, MW * T, 4, 0, '#f4c94a');
    }
    s += `<g opacity=".28" stroke="#fff" stroke-width="1.5"><path d="M0 ${11 * T}H${MW * T}M0 ${13 * T}H${MW * T}"/></g>`;
    return { svg: sceneWrap(s), trees: [] };
  }

  function sceneHome() {
    let s = `<rect width="${MW * T}" height="${MH * T}" fill="#e0c496"/>`;
    for (let r = 0; r < MH * 2; r++) { s += rr(0, r * 16, MW * T, 16, 0, r % 2 ? '#d9b985' : '#e6cc9f', null, 0, 'opacity=".9"'); for (let k = 0; k < 6; k++) { const x = ((r * 53 + k * 119) % (MW * T)); s += `<path d="M${x} ${r * 16}v16" stroke="#8c643a" stroke-opacity=".28" stroke-width="1"/>`; } }
    s += `<path d="M0 0H${MW * T}M0 16H${MW * T}" stroke="#8c643a" stroke-opacity=".12"/>`;
    // rug
    s += rr(6 * T, 6.2 * T, 8 * T, 4.6 * T, 16, '#b4535a', '#7d3038', 1.6) + rr(6.35 * T, 6.55 * T, 7.3 * T, 3.9 * T, 12, 'none', '#f1d5a8', 2.4, 'stroke-dasharray="6 5"') + rr(7 * T, 7.2 * T, 6 * T, 2.6 * T, 10, '#c76a70', null, 0, 'opacity=".7"');
    // walls
    s += rr(0, 0, MW * T, T * .55, 0, '#8a6d52') + rr(0, MH * T - T * .55, MW * T, T * .55, 0, '#8a6d52') + rr(0, 0, T * .55, MH * T, 0, '#8a6d52') + rr(MW * T - T * .55, 0, T * .55, MH * T, 0, '#8a6d52');
    s += rr(0, T * .55, MW * T, 5, 0, '#000', null, 0, 'opacity=".12"');
    for (const wx of [4, 10, 16]) s += rr(wx * T - 2, 2, 1.8 * T, T * .5, 3, '#f4ecdb', '#7a5a3c', 1.2) + rr(wx * T + 2, 5, 1.8 * T - 8, T * .5 - 7, 2, '#a9d5ea') + `<path d="M${wx * T + .9 * T - 2} 5v${T * .5 - 7}" stroke="#fff" stroke-width="1.2"/>`;
    // skirting + plant + picture frames
    s += `<g>${[[1.2, 1.4], [18.2, 1.4]].map(([gx, gy]) => ell(gx * T + 16, gy * T + 26, 10, 3.5, '#2d3a24', 'opacity=".2"') + rr(gx * T + 8, gy * T + 14, 16, 14, 3, '#b77e52', '#80563b', 1) + `<path d="M${gx * T + 16} ${gy * T + 14}q-10-6-9-14M${gx * T + 16} ${gy * T + 14}q8-8 10-14M${gx * T + 16} ${gy * T + 14}q0-10 0-16" stroke="#4f8950" stroke-width="3" fill="none" stroke-linecap="round"/>`).join('')}</g>`;
    s += rr(7 * T, 1.0 * T, 1.6 * T, 1.2 * T, 3, '#c9a169', '#7d5a36', 1.6) + rr(7 * T + 5, 1.0 * T + 5, 1.6 * T - 10, 1.2 * T - 10, 2, '#9fc7a3') + `<path d="M${7 * T + 8} ${2 * T}l10-10 8 6 6-8 10 12z" fill="#5f9c6a"/>`;
    s += rr(12 * T, 1.0 * T, 1.2 * T, 1.2 * T, 3, '#c9a169', '#7d5a36', 1.6) + rr(12 * T + 5, 1.0 * T + 5, 1.2 * T - 10, 1.2 * T - 10, 2, '#f3d9a6') + ell(12 * T + 19, 1.0 * T + 19, 6, 6, '#e48a62');
    return { svg: sceneWrap(s), trees: [] };
  }

  function scenePark() {
    let s = grassBase('#9ccb82', '#8cbf76', 5);
    // path
    s += rr(1.6 * T, 9 * T - 2, 16.8 * T, T + 4, 16, '#b8a173') + rr(1.7 * T, 9 * T, 16.6 * T, T, 14, '#dcc799') + rr(1.9 * T, 9 * T + 5, 16.2 * T, T - 10, 10, '#ebdab6', null, 0, 'opacity=".7"');
    for (let k = 0; k < 40; k++) s += ell(2 * T + rnd(k, 4) * 16 * T, 9 * T + 6 + rnd(4, k) * (T - 12), 1.8, 1, '#a58b5a', 'opacity=".4"');
    // pond
    const px = 8 * T, py = 4 * T, pw = 4 * T, ph = 3 * T;
    s += rr(px - 5, py - 3, pw + 10, ph + 10, 40, '#2d4c2f', null, 0, 'opacity=".16"') + rr(px - 5, py - 5, pw + 10, ph + 10, 38, '#d9cba3', '#b9a77b', 1.6);
    s += `<defs><linearGradient id="pw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7cc6d6"/><stop offset="1" stop-color="#4f9fb8"/></linearGradient></defs>` + rr(px, py, pw, ph, 34, 'url(#pw)');
    s += `<g fill="none" stroke="#e8faf6" stroke-opacity=".55" stroke-width="1.4" stroke-linecap="round"><path d="M${px + 18} ${py + 26}q12-6 26 0"/><path d="M${px + 66} ${py + 56}q10-5 22 0"/><path d="M${px + 44} ${py + 74}q10-5 20 0"/></g>`;
    for (const [lx, ly, f] of [[px + 30, py + 38, 0], [px + 92, py + 30, 1], [px + 78, py + 62, 0]]) s += `<path d="M${lx} ${ly}m-8 0a8 8 0 1 0 16 0a8 8 0 1 0-16 0" fill="#4f9a5c"/><path d="M${lx} ${ly}l8-2" stroke="#9cd2a2" stroke-width="1"/>` + (f ? `<circle cx="${lx}" cy="${ly - 1}" r="3" fill="#f6c6d8"/>` : '');
    // flowers, hedges, picnic blanket
    for (const [gx, gy, w] of [[1, 7, 2], [16, 7, 2], [3, 11.9, 2]]) s += flowerBed(gx, gy, w);
    s += `<g transform="rotate(-4 ${14.4 * T} ${12.4 * T})">${rr(13.3 * T, 11.8 * T, 2.2 * T, 1.3 * T, 3, '#f4efe2', '#c9524a', 1.4)}${Array.from({ length: 5 }, (_, k) => rr(13.3 * T + 5 + k * 13.6, 11.8 * T + 1, 7, 1.3 * T - 2, 0, '#e65e50', null, 0, 'opacity=".75"')).join('')}${ell(14.4 * T, 12.4 * T, 7, 5, '#d9a05a')}</g>`;
    return { svg: sceneWrap(s), trees: [[0, 0], [3, 1], [18, 0], [1, 6], [18, 11], [10, 12], [6, 13], [12, 1]].map(([a, b]) => [a + .5, b + .5]) };
  }

  function sceneSchool() {
    let s = `<rect width="${MW * T}" height="${MH * T}" fill="#e8dcc4"/>`;
    for (let gy = 0; gy < MH; gy++) for (let gx = 0; gx < MW; gx++) if ((gx + gy) % 2 === 0) s += rr(gx * T, gy * T, T, T, 0, '#785f40', null, 0, 'opacity=".08"');
    s += rr(0, 0, MW * T, T * .45, 0, '#8a6d52') + rr(0, MH * T - T * .45, MW * T, T * .45, 0, '#8a6d52') + rr(0, 0, T * .45, MH * T, 0, '#8a6d52') + rr(MW * T - T * .45, 0, T * .45, MH * T, 0, '#8a6d52');
    // hopscotch / court lines
    s += `<g stroke="#fff" stroke-opacity=".6" stroke-width="2" fill="none"><rect x="${3 * T}" y="${5.5 * T}" width="${5 * T}" height="${3.3 * T}" rx="6"/><path d="M${5.5 * T} ${5.5 * T}v${3.3 * T}"/><circle cx="${5.5 * T}" cy="${7.15 * T}" r="${T * .55}"/></g>`;
    for (let n = 0; n < 6; n++) s += rr((9.1 + (n % 2) * .28) * T, (4.1 + n * .43) * T, .48 * T, .27 * T, 3, n % 2 ? '#d5c6a7' : '#e3d6bd', '#78624a', .8);
    for (const [gx, gy] of [[2, 2], [4, 2], [15, 2], [17, 2], [2, 10], [17, 10]]) { const px = gx * T, py = gy * T; s += ell(px + 16, py + 19, 14, 5, '#365833', 'opacity=".2"') + rr(px + 2.5, py + 8, 27, 14, 5, '#719b61', '#537b4a', 1.2) + [0, 1, 2].map(k => `<circle cx="${px + 8 + k * 8}" cy="${py + 9}" r="1.6" fill="${k % 2 ? '#f2c6a7' : '#f6e1a1'}"/>`).join(''); }
    // building
    const bx = 6.5 * T, by = .95 * T, bw = 7 * T, bh = 2.65 * T;
    s += ell(bx + bw * .52, by + bh + 4, bw * .52, 6, '#3f3b2f', 'opacity=".22"');
    s += `<path d="M${bx + bw} ${by + 6}l11 7v${bh - 13}h-11z" fill="#a6b69d" stroke="#6b7d63" stroke-width="1"/>`;
    s += rr(bx, by, bw, bh, 2, '#e8dfc8', '#927b5d', 1.6);
    s += `<path d="M${bx - 8} ${by + 4}L${bx + bw * .5} ${by - 20}L${bx + bw + 8} ${by + 4}Z" fill="#b96f52" stroke="#7d4a38" stroke-width="1.4" stroke-linejoin="round"/><path d="M${bx - 6} ${by + 3.5}L${bx + bw * .5} ${by - 17}" stroke="#e6b08a" stroke-width="1.8" fill="none"/>`;
    for (const wx of [7.35, 8.65, 12.35, 13.65]) s += rr(wx * T, by + 20, 25, 29, 2, '#f7e9c8', '#9b7958', 1.2) + rr(wx * T + 3, by + 23, 19, 23, 1, '#91c9d5') + `<path d="M${wx * T + 12.5} ${by + 23}v23" stroke="#fff" stroke-opacity=".75" stroke-width="1"/>`;
    s += rr(bx + bw * .43, by + 50, bw * .14, 34, 2, '#76533d', '#5b4030', 1.2) + `<circle cx="${bx + bw * .535}" cy="${by + 67}" r="1.3" fill="#e6c078"/>`;
    s += rr(bx + bw * .31, by + 6, bw * .38, 9, 1.5, '#f3e6c9', '#a78a62', 1) + `<text x="${bx + bw * .5}" y="${by + 12.8}" text-anchor="middle" font-family="sans-serif" font-weight="800" font-size="5.6" fill="#5d7357">SCHOOL</text>`;
    s += rr(bx + bw * .35, by + bh - 1, bw * .3, 3.5, 0, '#b7a58a') + rr(bx + bw * .31, by + bh + 2.5, bw * .38, 3.5, 0, '#d0bea0');
    // flag
    s += `<rect x="${16.4 * T}" y="${4.6 * T}" width="2.4" height="${3 * T}" fill="#8a8f98"/><path d="M${16.4 * T + 2.4} ${4.6 * T + 2}h20v12h-20z" fill="#e65e50"/>`;
    return { svg: sceneWrap(s), trees: [] };
  }

  const SCENES = { village: sceneVillage, market: sceneMarket, station: sceneStation, home: sceneHome, park: scenePark, school: sceneSchool };
  const sceneCache = {};

  /* ---------- registry ---------- */
  const HOUSE_RED = { wall: '#f0d8bb', side: '#c99b75', roof: '#a95446', roofL: '#c97962', glass: '#a9d5d7', trim: '#f6e6cc' };
  const HOUSE_BLUE = { wall: '#dce9e8', side: '#a9c5c8', roof: '#527486', roofL: '#779aa7', glass: '#8fc7d3', trim: '#e7f0ec' };
  const HOUSE_BAKERY = { wall: '#f4e5bf', side: '#c6a36e', roof: '#a95743', roofL: '#c9795b', glass: '#a9d5d7', trim: '#f4e5bf', bakery: true };

  const RAW = {
    tree: tree(),
    'red-house': house(HOUSE_RED), 'blue-house': house(HOUSE_BLUE), bakery: house(HOUSE_BAKERY), well: well(),
    key: key(), basket: basket(), 'apple-basket': basket({ apples: true }), bread: bread(), ticket: ticket(),
    'fruit-stall': stall({ color: '#d9534f', kind: 'fruit' }), 'bread-stall': stall({ color: '#e0a030', kind: 'bread' }), 'ticket-desk': ticketDesk(),
    sofa: sofa(), table: table(), lamp: lamp(), book: book(),
    bench: bench(), swing: swing(), slide: slide(), ball: ball(), kite: kite(),
    board: board(), bookshelf: bookshelf(), clock: clock(), 'front-desk': desk({ top: '#c08a52' }), 'back-desk': desk({ top: '#b0b8c4' }), bag: bag(), pencil: pencil(), platform: platform(),
    baker: person({ coat: '#f1ece0', hair: '#4d3a2c', hat: 'chef', apron: true, item: 'tray' }),
    'market-vendor': person({ coat: '#df765e', hair: '#513b32', apron: true, hat: 'cap', hatColor: '#d9534f' }),
    'market-customer': person({ coat: '#5c8fb0', hair: '#2f2622', long: true, item: 'book', skin: '#c68b62' }),
    'station-clerk': person({ coat: '#477ca8', hair: '#3b2f2a', hat: 'cap', hatColor: '#2f5a86', tie: '#f6c453' }),
    traveller: person({ coat: '#c28f4a', hair: '#4b3a31', item: 'suitcase', skin: '#b97855' }),
    family: family(),
    seller: person({ coat: '#f08aa8', hair: '#6b4630', hat: 'cap', hatColor: '#f08aa8', apron: true, item: 'icecream' }),
    child: person({ coat: '#f2b83d', hair: '#754b32', small: true, skin: '#dba77e' }),
    teacher: person({ coat: '#6c65b8', hair: '#4d4038', glasses: true, long: true, skin: '#b97855', item: 'book' }),
    student: person({ coat: '#5c9b78', hair: '#382f2d', small: true }),
    player: person({ coat: '#d7a75b', hair: '#4b3b32', skin: '#c98f67', item: 'backpack' })
  };

  const ALIASES = { 'tree-north': 'tree', 'tree-west': 'tree', 'tree-east': 'tree', 'north-tree': 'tree' };
  // per-sprite draw size (in tiles) and where the ground contact sits relative to the tile centre
  const SIZE = {
    tree: 1.55, 'red-house': 1.9, 'blue-house': 1.9, bakery: 1.9, well: 1.3,
    'fruit-stall': 1.6, 'bread-stall': 1.6, 'ticket-desk': 1.6, sofa: 1.5, table: 1.35, bench: 1.45, swing: 1.55, slide: 1.55,
    board: 1.6, bookshelf: 1.5, clock: 1.25, 'front-desk': 1.45, 'back-desk': 1.45, family: 1.7, platform: 1.3
  };

  const cache = {};
  const store = { SIZE, ALIASES, ready: {}, onReady: null };
  function load(key) {
    if (cache[key] !== undefined) return cache[key];
    const svg = RAW[key]; if (!svg) return (cache[key] = null);
    const img = new Image();
    img.onload = () => { store.ready[key] = true; if (typeof store.onReady === 'function') store.onReady(key); };
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    return (cache[key] = img);
  }
  store.get = function (id) {
    const key = ALIASES[id] || id, img = load(key);
    return img && store.ready[key] ? { img, size: SIZE[key] } : null;
  };
  store.getPlayer = function (coat) {
    const key = 'player:' + (coat || '#d7a75b');
    if (!RAW[key]) RAW[key] = person({ coat: coat || '#d7a75b', hair: '#4b3b32', skin: '#c98f67', item: 'backpack' });
    const img = load(key);
    return img && store.ready[key] ? { img } : null;
  };
  store.preload = () => Object.keys(RAW).forEach(load);
  store.scene = function (id) {
    const f = SCENES[id]; if (!f) return null;
    let e = sceneCache[id];
    if (!e) {
      const sc = f(), img = new Image();
      e = sceneCache[id] = { img, trees: sc.trees || [], ready: false };
      img.onload = () => { e.ready = true; if (typeof store.onReady === 'function') store.onReady('scene:' + id); };
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(sc.svg);
    }
    return e.ready ? e : null;
  };
  store.preloadScenes = () => Object.keys(SCENES).forEach(store.scene);
  window.WORLD_SPRITES = store;
})();
