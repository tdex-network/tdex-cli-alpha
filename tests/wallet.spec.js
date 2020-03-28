const { describe, it } =require('mocha');
const assert = require('assert');
const wallet = require('../dist/wallet');

describe('wallet', () => {
  it('fromWIF', () => {
    const wif = 'cNiZ5A2UgR11Kw79QsgqeziPJLXVnftGVBmeHZag53RcvDod5SsW';
    const w = wallet.fromWIF(wif, 'regtest');
    assert.deepStrictEqual(
      w.address,
      'ert1qgzeyqlelkg38d320eh06jl3suwp86565t5ngcm',
    );
  });
});