import {test} from 'node:test';
import assert from 'node:assert/strict';
import {encodeWav} from '../dist/sound-editor.js';

test('WAV export preserves stereo sample order and clips amplitude',()=>{
 const buffer=encodeWav([Float32Array.from([0,1,-1,2]),Float32Array.from([.5,-.5,0,-2])],44100);
 const view=new DataView(buffer);
 assert.equal(new TextDecoder().decode(new Uint8Array(buffer,0,4)),'RIFF');
 assert.equal(new TextDecoder().decode(new Uint8Array(buffer,8,4)),'WAVE');
 assert.equal(view.getUint16(22,true),2);
 assert.equal(view.getUint32(24,true),44100);
 assert.equal(view.getUint32(40,true),16);
 assert.equal(view.getInt16(46,true),16383);
 assert.equal(view.getInt16(48,true),32767);
 assert.equal(view.getInt16(52,true),-32768);
 assert.equal(view.getInt16(56,true),32767);
 assert.equal(view.getInt16(58,true),-32768);
});
