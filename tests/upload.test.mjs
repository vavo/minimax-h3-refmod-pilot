import test from 'node:test';
import assert from 'node:assert/strict';
import {uploadPhotos, validatePhotos, MAX_BYTES} from '../web/upload.mjs';
const photo = (name = 'photo.png') => new File(['image-data'], name, {type: 'image/png'});

test('invalid batches are rejected before contacting the server', async () => {
    let calls = 0;
    const fetchApi = async () => { calls++; };
    for (const files of [[], Array.from({length: 9}, () => photo()), [photo('archive.zip')], [new File([], 'empty.jpg')], [{name:'large.png',size:MAX_BYTES+1}]]) {
        await assert.rejects(uploadPhotos(files, {fetchApi, folder:'refmod-pilot/test'}));
    }
    assert.equal(calls, 0);
});

test('duplicate filenames preserve selection order and share an isolated folder', async () => {
    const seen = [], progress = [];
    const folder = 'refmod-pilot/batch-123';
    const fetchApi = async (route, options) => {
        const image = options.body.get('image');
        seen.push([route,image.name,options.body.get('subfolder'),options.body.get('type')]);
        return {ok:true,json:async () => ({name:image.name,subfolder:folder,type:'input'})};
    };
    assert.equal(await uploadPhotos([photo('same.JPG'),photo('same.JPG')],{fetchApi,folder,onProgress:(n,total)=>progress.push([n,total])}),folder);
    assert.deepEqual(seen,[['/upload/image','01.jpg',folder,'input'],['/upload/image','02.jpg',folder,'input']]);
    assert.deepEqual(progress,[[0,2],[1,2],[2,2]]);
});

test('partial HTTP failure stops the batch without reporting a ready folder', async () => {
    let calls=0;
    const fetchApi=async () => (++calls===1 ? {ok:true,json:async()=>({type:'input',subfolder:'batch',name:'01.png'})} : {ok:false,status:413});
    await assert.rejects(uploadPhotos([photo(),photo(),photo()],{fetchApi,folder:'batch'}),/Photo 2.*413/);
    assert.equal(calls,2);
});

test('unexpected server destinations are not accepted as a dataset', async () => {
    await assert.rejects(uploadPhotos([photo()],{folder:'batch',fetchApi:async()=>({ok:true,json:async()=>({name:'01.png',subfolder:'elsewhere',type:'input'})})}),/unexpected upload location/);
});

test('network cancellation propagates to the upload request', async () => {
    const controller=new AbortController(); controller.abort();
    await assert.rejects(uploadPhotos([photo()],{folder:'batch',signal:controller.signal,fetchApi:async(_route,{signal})=>{assert.equal(signal,controller.signal);signal.throwIfAborted();}}),{name:'AbortError'});
});

test('all documented still-image extensions are accepted',()=>{
    validatePhotos(['a.PNG','b.jpg','c.jpeg','d.webp','e.bmp'].map(photo));
});
