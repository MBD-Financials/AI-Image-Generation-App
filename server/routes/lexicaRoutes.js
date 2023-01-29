import express from 'express';
import * as dotenv from 'dotenv';
import axios from 'axios';
import { Cache, CacheContainer } from 'node-ts-cache'
import { NodeFsStorage } from 'node-ts-cache-storage-node-fs'


import slugify from 'slugify';

const searchCache = new CacheContainer(new NodeFsStorage('../cache'))



dotenv.config();

const LEXICA_API_URL=process.env.LEXICA_API_URL;

const router = express.Router();

router.route('/').get(async (req, res) => {

  const searchText= req.query.searchText ? req.query.searchText : "girl AI";

  const key=slugify(searchText, '_') ;

  const data = await searchCache.getItem(key);
  
  if(data) {
     res.status(200).json({ success: true, data: data });
  }else{
  
    let config = {
      method: 'get',
      url: `${LEXICA_API_URL}/search?q=${searchText}`,
      headers: {}
    };

    axios(config)
    .then(function (response) {
        console.log("key",key);
        searchCache.setItem(key, response.data, {ttl: 3600} );
        res.status(200).json({ success: true, data: response.data });
      
    
    })
    .catch(function (error) {

       res.status(500).json({ success: false, message: 'Fetching images failed, please try again',error:error});
    });

  }



});

export default router;
