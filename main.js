const encodings = ['UTF-8', 'Shift_JIS', 'EUC-JP', 'ISO-2022-JP'];

const add_options = (id, encodings, selected) => {
  encodings.forEach((o) => {
    const opt = document.createElement('option');
    opt.value = o;
    opt.text  = o;
    if (o == selected) opt.selected = 'selected';
    document.querySelector(id).appendChild(opt);
  });
};

const disable_forms = (bool) => {
  if (bool === undefined) return false;
  const disabled = bool ? 'disabled' : '';
  document.querySelector('#input' ).disabled = disabled;
  document.querySelector('#output').disabled = disabled;
  document.querySelector('#before').disabled = disabled;
  document.querySelector('#after' ).disabled = disabled;
  document.querySelector('#submit').disabled = disabled;
  document.querySelector('#allall').disabled = disabled;
  if (bool) document.querySelector('#output').value = '';
};

const escape = (str, before) => {
  switch (before) {
    case 'Shift_JIS':   return EscapeSJIS (str);
    case 'UTF-8':       return EscapeUTF8 (str);
    case 'EUC-JP':      return EscapeEUCJP(str);
    case 'ISO-2022-JP': return EscapeJIS7 (str);
    default: return false;
  }
};

const unescape = (str, after) => {
  switch (after) {
    case 'Shift_JIS':   return UnescapeSJIS (str);
    case 'UTF-8':       return UnescapeUTF8 (str);
    case 'EUC-JP':      return UnescapeEUCJP(str);
    case 'ISO-2022-JP': return UnescapeJIS7 (str);
    default: return false;
  }
};

const convert = (before, after) => {

  disable_forms(true);

  const input  = document.querySelector('#input' ).value;
  if (input == '') return true;

  let befores = [before];
  let afters  = [after];
  if (before == 'ALL') befores = encodings;
  if (after  == 'ALL') afters  = encodings;
  const results = [];
  befores.forEach((b) => {
    afters.forEach((a) => {
      if (b == a) return;
      results.push({
        before: b,
        after: a,
        str: unescape(escape(input, b), a)
      });
    });
  });

  let output = '';
  if        (results.length == 1) {
    output = results[0].str;
  } else if (results.length >= 2) {
    results.forEach((r) => {
      if (output != '') output += '\n\n---\n\n';
      output += `[ ${r.before} => ${r.after} ]\n${r.str}`;
    });
  }

  document.querySelector('#output').value = output;
  disable_forms(false);

};

const submit = () => {
  const before = document.querySelector('#before').value;
  const after  = document.querySelector('#after' ).value;
  convert(before, after);
};

const allall = () => {
  convert('ALL', 'ALL');
};

const makeurl = () => {
  const url = (
    location.href.split('?')[0]
  + '?b=' + document.querySelector('#before').value
  + '&a=' + document.querySelector('#after' ).value
  + '&i=' + encodeURIComponent(document.querySelector('#input' ).value)
  );
  document.querySelector('#showurl').value = url;
};

window.onload = () => {

  add_options('#before', encodings.concat(['ALL']), 'Shift_JIS');
  add_options('#after',  encodings.concat(['ALL']), 'UTF-8');

  document.querySelector('#submit').addEventListener('mouseup', submit);
  document.querySelector('#allall').addEventListener('mouseup', allall);

  document.querySelector('#makeurl').addEventListener('mouseup', makeurl);

  const urlParam = location.search.substring(1) || '';
  const paramArray = {};
  const param = urlParam.split('&');
  for (let i = 0; i < param.length; i++) {
    const paramItem = param[i].split('=');
    paramArray[paramItem[0]] = paramItem[1];
  }

  if (paramArray.b !== undefined) document.querySelector('#before').value = paramArray.b;
  if (paramArray.a !== undefined) document.querySelector('#after' ).value = paramArray.a;
  if (paramArray.i !== undefined) document.querySelector('#input' ).value = decodeURIComponent(paramArray.i);

  if (paramArray.b !== undefined && paramArray.a !== undefined && paramArray.i !== undefined) submit();

  history.replaceState(null, null, location.href.split('?')[0]);

};